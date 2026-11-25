import { createHash, randomUUID } from 'node:crypto';
import { seedListings, sellers } from './seed.ts';
import { DomainError, type Actor, type Audit, type CheckoutInput, type CheckoutResult, type Dispute, type Listing, type Order, type OrderStatus, type Quote, type Review, type Rfq } from './types.ts';
import { UnconfiguredGateway, type PaymentGateway } from './payments.ts';
import { developmentAreaPolicy, type ServiceabilityPolicy } from './serviceability.ts';
const id = (prefix:string) => `${prefix}_${randomUUID()}`;
const now = () => new Date().toISOString();
const copy = <T>(v:T):T => structuredClone(v);
function check(condition:unknown,status:number,code:string,message:string): asserts condition { if (!condition) throw new DomainError(status,code,message); }
function role(actor:Actor,...roles:Actor['role'][]) { check(roles.includes(actor.role),403,'FORBIDDEN','Your role does not have permission for this action.'); }
export class Marketplace {
  private listings = seedListings();
  private orders:Order[] = [];
  private rfqs:Rfq[] = [];
  private quotes:Quote[] = [];
  private disputes:Dispute[] = [];
  private reviews:Review[] = [];
  private audit:Audit[] = [];
  private keys = new Map<string,{fingerprint:string;result:CheckoutResult}>();
  private payments = new Map<string,{groupId:string;amountPaise:number;paymentId?:string}>();
  private processedEvents = new Set<string>();
  private requestedRefunds = new Map<string,{orderId:string;amountPaise:number}>();
  private refundedAmounts = new Map<string,number>();
  private refundKeys = new Map<string,{fingerprint:string;result:{id:string;status:string;amountPaise:number}}>();
  private quoteCheckouts = new Map<string,CheckoutResult>();
  private processedRefunds = new Set<string>();
  private chain:Promise<unknown> = Promise.resolve();
  constructor(private gateway:PaymentGateway = new UnconfiguredGateway(), private evidenceVerifier:(reference:string)=>boolean = ()=>false, private areaPolicy:ServiceabilityPolicy = developmentAreaPolicy()) {}
  private locked<T>(fn:()=>Promise<T>|T):Promise<T> {
    const result = this.chain.then(fn,fn);
    this.chain = result.catch(()=>undefined);
    return result;
  }
  private record(actorId:string,action:string,targetId:string) {
    const previousHash = this.audit.at(-1)?.hash ?? 'GENESIS';
    const entry = {id:id('audit'),actorId,action,targetId,at:now(),previousHash};
    this.audit.push({...entry,hash:createHash('sha256').update(JSON.stringify(entry)).digest('hex')});
  }
  serviceability(pin:string) { return this.areaPolicy.evaluate(pin); }
  private requireServiceability(pin:string) {const result=this.serviceability(pin);check(result.serviceable,422,result.reason==='invalid_pin'?'INVALID_PIN':'UNSERVICEABLE',result.message);}
  catalog() { return copy(this.listings.filter(l=>l.status==='active' && new Date(l.expiresAt).getTime()>Date.now()).map(l=>({...l,availableQuantity:Math.max(0,l.availableQuantity-l.reservedQuantity)}))); }
  sellerList() { return copy(sellers); }
  sellerInventory(actor:Actor) { role(actor,'seller','admin'); return copy(this.listings.filter(l=>actor.role==='admin'||l.sellerId===actor.sellerId)); }
  listOrders(actor:Actor) { return copy(this.orders.filter(o=>actor.role==='admin'||actor.role==='finance'||actor.role==='support'||(actor.role==='seller'?o.sellerId===actor.sellerId:o.buyerId===actor.id))); }
  listRfqs(actor:Actor) { return copy(this.rfqs.filter(r=>actor.role==='seller'||actor.role==='admin'||r.buyerId===actor.id).map(r=>({...r,quotes:this.quotes.filter(q=>q.rfqId===r.id&&(actor.role!=='seller'||q.sellerId===actor.sellerId))}))); }
  listDisputes(actor:Actor) { return copy(this.disputes.filter(d=>actor.role==='admin'||actor.role==='support'||d.buyerId===actor.id)); }
  auditLog(actor:Actor) { role(actor,'admin','finance'); return copy(this.audit); }
  async updateListing(actor:Actor,listingId:string,patch:Partial<Pick<Listing,'title'|'price'|'availableQuantity'|'minimumQuantity'|'status'|'expiresAt'>>) {
    return this.locked(()=>{
      role(actor,'seller','admin'); const listing = this.listings.find(l=>l.id===listingId); check(listing,404,'NOT_FOUND','Listing not found.');
      check(actor.role==='admin'||actor.sellerId===listing.sellerId,403,'FORBIDDEN','This listing belongs to another seller.');
      if (patch.availableQuantity!==undefined) check(patch.availableQuantity>=listing.reservedQuantity,409,'RESERVED_STOCK','Inventory cannot fall below reserved quantity.');
      Object.assign(listing,patch); this.record(actor.id,'listing.updated',listingId); return copy(listing);
    });
  }
  async createListing(actor:Actor,input:Pick<Listing,'title'|'category'|'unit'|'price'|'availableQuantity'|'minimumQuantity'|'grade'>) {
    return this.locked(()=>{
      role(actor,'seller'); const seller = sellers.find(s=>s.id===actor.sellerId); check(seller?.verified,403,'SELLER_UNVERIFIED','Complete seller verification before listing.');
      const listing:Listing = {...input,id:id('listing'),variety:'Local variety',sellerId:seller.id,sellerName:seller.name,reservedQuantity:0,location:seller.location,pin:seller.pin,organic:false,harvestDate:now().slice(0,10),expiresAt:new Date(Date.now()+7*86400000).toISOString(),image:'',tiers:[],status:'active',verified:true};
      this.listings.push(listing); this.record(actor.id,'listing.created',listing.id); return copy(listing);
    });
  }
  private async checkoutUnsafe(actor:Actor,key:string,input:CheckoutInput,override?:{listingId:string;price:number}) {
    role(actor,'buyer'); this.requireServiceability(input.pin);
    const fingerprint = createHash('sha256').update(JSON.stringify({input,override})).digest('hex');
    const scopedKey = `${actor.id}:${key}`; const prior = this.keys.get(scopedKey);
    if(prior) { check(prior.fingerprint===fingerprint,409,'IDEMPOTENCY_CONFLICT','Use a new idempotency key for a different cart.'); return copy(prior.result); }
    check(input.items.length>0,422,'EMPTY_CART','Your cart is empty.');
    const quantities = new Map<string,number>();
    for(const item of input.items) quantities.set(item.listingId,(quantities.get(item.listingId)??0)+item.quantity);
    const grouped = new Map<string,{listing:Listing;quantity:number;unitPricePaise:number}[]>();
    for(const [listingId,quantity] of quantities) {
      check(Number.isFinite(quantity)&&quantity>0&&Math.abs(quantity*1000-Math.round(quantity*1000))<0.0001,422,'INVALID_QUANTITY','Use a positive quantity with no more than three decimal places.');
      const listing = this.listings.find(l=>l.id===listingId);
      check(listing&&listing.status==='active'&&new Date(listing.expiresAt).getTime()>Date.now(),409,'UNAVAILABLE','A listing is no longer available.');
      check(quantity>=listing.minimumQuantity,422,'MOQ','The minimum order quantity has not been met.');
      check(listing.availableQuantity-listing.reservedQuantity>=quantity,409,'INSUFFICIENT_STOCK',`Only ${listing.availableQuantity-listing.reservedQuantity} ${listing.unit} of ${listing.title} remains.`);
      const tierPrice = [...listing.tiers].sort((a,b)=>b.minQuantity-a.minQuantity).find(t=>quantity>=t.minQuantity)?.price??listing.price;
      const unitPricePaise = Math.round((override?.listingId===listingId?override.price:tierPrice)*100);
      const lines = grouped.get(listing.sellerId)??[]; lines.push({listing,quantity,unitPricePaise}); grouped.set(listing.sellerId,lines);
    }
    const groupId = id('checkout'); const createdAt = now();
    const orders:Order[] = [...grouped].map(([sellerId,lines])=>{
      const items = lines.map(({listing,quantity,unitPricePaise})=>({listingId:listing.id,title:listing.title,unit:listing.unit,quantity,unitPricePaise,lineTotalPaise:Math.round(unitPricePaise*quantity),grade:listing.grade}));
      const subtotalPaise = items.reduce((n,i)=>n+i.lineTotalPaise,0); const deliveryPaise=input.fulfilment==='pickup'||subtotalPaise>=100000?0:4900;
      return {id:id('order'),groupId,buyerId:actor.id,sellerId,sellerName:lines[0]!.listing.sellerName,pin:input.pin,fulfilment:input.fulfilment,items,subtotalPaise,feePaise:0,taxPaise:0,deliveryPaise,totalPaise:subtotalPaise+deliveryPaise,status:'pending_payment',paymentStatus:'pending',createdAt,reservationExpiresAt:new Date(Date.now()+15*60000).toISOString(),timeline:[{status:'pending_payment',at:createdAt,actorId:actor.id}]};
    });
    const amountPaise = orders.reduce((n,o)=>n+o.totalPaise,0);
    const payment:CheckoutResult['payment'] = {status:'pending',provider:'razorpay',available:this.gateway.enabled,amountPaise,currency:'INR'};
    if(this.gateway.enabled) { const providerOrder = await this.gateway.createOrder({amountPaise,receipt:groupId.slice(0,40)}); payment.providerOrderId = providerOrder.id; this.payments.set(providerOrder.id,{groupId,amountPaise}); }
    else payment.reason='Razorpay is not configured. Inventory is held for 15 minutes; no money has been collected.';
    for(const [listingId,quantity] of quantities) this.listings.find(l=>l.id===listingId)!.reservedQuantity+=quantity;
    this.orders.push(...orders); const result={groupId,orders,payment}; this.keys.set(scopedKey,{fingerprint,result:copy(result)}); this.record(actor.id,'checkout.reserved',groupId); return copy(result);
  }
  checkout(actor:Actor,key:string,input:CheckoutInput) { return this.locked(()=>this.checkoutUnsafe(actor,key,input)); }
  expireReservations(at=Date.now()) { return this.locked(()=>{ let count=0; for(const order of this.orders) if(order.status==='pending_payment'&&new Date(order.reservationExpiresAt).getTime()<=at){this.cancelUnsafe({id:'system',role:'admin'},order);count++;} return count; }); }
  private cancelUnsafe(actor:Actor,order:Order) {
    check(['pending_payment','placed','accepted'].includes(order.status),409,'INVALID_TRANSITION','This order can no longer be cancelled.');
    for(const item of order.items) {const listing=this.listings.find(l=>l.id===item.listingId)!; if(order.paymentStatus==='pending')listing.reservedQuantity-=item.quantity;else listing.availableQuantity+=item.quantity;}
    order.status='cancelled'; if(order.paymentStatus==='paid')order.paymentStatus='refund_pending'; order.timeline.push({status:'cancelled',at:now(),actorId:actor.id}); this.record(actor.id,'order.cancelled',order.id);
  }
  transition(actor:Actor,orderId:string,status:OrderStatus,proof?:{kind:'photo';reference:string}) {
    return this.locked(()=>{
      const order=this.orders.find(o=>o.id===orderId);check(order,404,'NOT_FOUND','Order not found.');
      const ownsBuyer=actor.role==='buyer'&&actor.id===order.buyerId; const ownsSeller=actor.role==='seller'&&actor.sellerId===order.sellerId;
      if(status==='cancelled') {check(ownsBuyer||ownsSeller||actor.role==='admin',403,'FORBIDDEN','You cannot cancel this order.');this.cancelUnsafe(actor,order);return copy(order);}
      if(status==='completed') {check(ownsBuyer,403,'FORBIDDEN','Only the buyer can confirm completion.');check(order.status==='delivered',409,'INVALID_TRANSITION','Delivery must be confirmed first.');}
      else {check(ownsSeller||actor.role==='admin',403,'FORBIDDEN','You cannot update this order.');const next:Partial<Record<OrderStatus,OrderStatus>>={placed:'accepted',accepted:'packed',packed:'dispatched',dispatched:'delivered'};check(next[order.status]===status,409,'INVALID_TRANSITION','The requested order transition is not allowed.');}
      check(order.paymentStatus==='paid',409,'UNPAID','The payment provider has not confirmed this payment.');
      if(status==='delivered') {check(proof&&proof.kind==='photo'&&/^proof\/[a-zA-Z0-9/_\-.]+$/.test(proof.reference),422,'PROOF_REQUIRED','A private verified upload reference is required for delivery.');check(this.evidenceVerifier(proof.reference),503,'EVIDENCE_NOT_VERIFIED','Proof uploads require a configured storage, file validation, and malware scanning adapter.');order.proof=copy(proof);}
      order.status=status;order.timeline.push({status,at:now(),actorId:actor.id});this.record(actor.id,`order.${status}`,order.id);return copy(order);
    });
  }
  webhook(eventId:string,event:{event:string;payload?:{payment?:{entity?:{id?:string;order_id?:string;amount?:number;currency?:string;status?:string}};refund?:{entity?:{id?:string;payment_id?:string;amount?:number;status?:string}}}}) {
    return this.locked(()=>{
      if(this.processedEvents.has(eventId))return {duplicate:true};
      if(event.event==='payment.captured') {
        const entity=event.payload?.payment?.entity;check(entity?.id&&entity.order_id,422,'INVALID_WEBHOOK','Payment identifiers are missing.');
        const payment=this.payments.get(entity.order_id);check(payment,409,'UNKNOWN_PAYMENT','Payment does not match a known provider order.');
        check(entity.amount===payment.amountPaise&&entity.currency==='INR'&&entity.status==='captured',409,'PAYMENT_MISMATCH','Captured payment does not match the expected amount, currency, or state.');
        if(!payment.paymentId) {
          const group=this.orders.filter(o=>o.groupId===payment.groupId);
          check(group.every(o=>o.status==='pending_payment'&&new Date(o.reservationExpiresAt).getTime()>Date.now()),409,'LATE_PAYMENT_REQUIRES_RECONCILIATION','The reservation expired or was cancelled. Finance must reconcile and refund this capture.');
          for(const order of group){for(const item of order.items){const listing=this.listings.find(l=>l.id===item.listingId)!;listing.reservedQuantity-=item.quantity;listing.availableQuantity-=item.quantity;}order.paymentStatus='paid';order.status='placed';order.timeline.push({status:'placed',at:now(),actorId:'razorpay'});}
          payment.paymentId=entity.id;this.record('razorpay','payment.captured',payment.groupId);
        } else check(payment.paymentId===entity.id,409,'PAYMENT_MISMATCH','A different payment is already linked to this checkout.');
      } else if(event.event==='refund.processed') {
        const entity=event.payload?.refund?.entity;check(entity?.id&&entity.payment_id,422,'INVALID_WEBHOOK','Refund identifiers are missing.');if(this.processedRefunds.has(entity.id)){this.processedEvents.add(eventId);return {duplicate:true};}const requested=this.requestedRefunds.get(entity.id);check(requested,409,'UNKNOWN_REFUND','Refund is not registered for reconciliation.');
        check(entity.amount===requested.amountPaise&&entity.status==='processed',409,'REFUND_MISMATCH','Refund amount or state does not match.');
        const order=this.orders.find(o=>o.id===requested.orderId)!;const payment=[...this.payments.values()].find(p=>p.groupId===order.groupId);check(payment?.paymentId===entity.payment_id,409,'REFUND_MISMATCH','Refund payment does not match.');
        const total=(this.refundedAmounts.get(order.id)??0)+requested.amountPaise;this.refundedAmounts.set(order.id,total);order.paymentStatus=total===order.totalPaise?'refunded':'partially_refunded';this.requestedRefunds.delete(entity.id);this.processedRefunds.add(entity.id);this.record('razorpay','refund.processed',order.id);
      }
      this.processedEvents.add(eventId); return {duplicate:false};
    });
  }
  createRfq(actor:Actor,input:Omit<Rfq,'id'|'buyerId'|'status'|'createdAt'>) {return this.locked(()=>{role(actor,'buyer');this.requireServiceability(input.pin);const rfq:Rfq={...input,id:id('rfq'),buyerId:actor.id,status:'open',createdAt:now()};this.rfqs.push(rfq);this.record(actor.id,'rfq.created',rfq.id);return copy(rfq);});}
  createQuote(actor:Actor,rfqId:string,input:{listingId:string;price:number;quantity:number;validUntil:string;notes:string}) {return this.locked(()=>{role(actor,'seller');const rfq=this.rfqs.find(r=>r.id===rfqId);check(rfq?.status==='open',409,'RFQ_CLOSED','The requirement is not open.');const listing=this.listings.find(l=>l.id===input.listingId);check(listing&&listing.sellerId===actor.sellerId,403,'FORBIDDEN','Quote a listing owned by your seller account.');check(input.quantity>=rfq.quantity&&listing.unit===rfq.unit,422,'QUOTE_QUANTITY','The quotation must cover the required quantity and unit.');check(new Date(input.validUntil).getTime()>Date.now(),422,'QUOTE_EXPIRED','Quote expiry must be in the future.');const quote:Quote={...input,id:id('quote'),rfqId,sellerId:listing.sellerId,sellerName:listing.sellerName,status:'open'};this.quotes.push(quote);this.record(actor.id,'quote.created',quote.id);return copy(quote);});}
  acceptQuote(actor:Actor,quoteId:string,key:string) {return this.locked(async()=>{role(actor,'buyer');const quote=this.quotes.find(q=>q.id===quoteId);check(quote,404,'NOT_FOUND','Quote not found.');const rfq=this.rfqs.find(r=>r.id===quote.rfqId)!;check(rfq.buyerId===actor.id,403,'FORBIDDEN','This requirement belongs to another buyer.');const previous=this.quoteCheckouts.get(quoteId);if(previous)return copy(previous);check(rfq.status==='open'&&quote.status==='open'&&new Date(quote.validUntil).getTime()>Date.now(),409,'QUOTE_EXPIRED','This quote is no longer available.');const result=await this.checkoutUnsafe(actor,key,{pin:rfq.pin,fulfilment:'delivery',items:[{listingId:quote.listingId,quantity:rfq.quantity}]},{listingId:quote.listingId,price:quote.price});quote.status='accepted';rfq.status='accepted';this.quoteCheckouts.set(quoteId,copy(result));this.record(actor.id,'quote.accepted',quote.id);return result;});}
  createReview(actor:Actor,input:{orderId:string;rating:number;text:string}) {return this.locked(()=>{role(actor,'buyer');const order=this.orders.find(o=>o.id===input.orderId);check(order?.buyerId===actor.id,403,'FORBIDDEN','You can review only your own order.');check(order.status==='completed',409,'REVIEW_UNVERIFIED','Complete the order before leaving a review.');check(!this.reviews.some(r=>r.orderId===input.orderId),409,'ALREADY_REVIEWED','This order already has a review.');const review:Review={...input,id:id('review'),buyerId:actor.id,sellerId:order.sellerId,verifiedPurchase:true,createdAt:now()};this.reviews.push(review);this.record(actor.id,'review.created',review.id);return copy(review);});}
  createDispute(actor:Actor,input:{orderId:string;reason:string;details:string;evidence:string[]}) {return this.locked(()=>{role(actor,'buyer');const order=this.orders.find(o=>o.id===input.orderId);check(order?.buyerId===actor.id,403,'FORBIDDEN','You can report only your own order.');check(order.paymentStatus==='paid',409,'UNPAID','Unpaid orders do not require a quality dispute.');check(['delivered','completed'].includes(order.status),409,'NOT_DELIVERED','Quality disputes are available after delivery.');const delivered=order.timeline.find(t=>t.status==='delivered');check(delivered&&Date.now()-new Date(delivered.at).getTime()<=24*3600000,409,'DISPUTE_WINDOW_CLOSED','The pilot quality dispute window is 24 hours after delivery.');check(input.evidence.length>0,422,'EVIDENCE_REQUIRED','Photo evidence is required.');check(input.evidence.every(this.evidenceVerifier),503,'EVIDENCE_NOT_VERIFIED','Evidence storage validation is not configured.');const dispute:Dispute={...input,id:id('dispute'),buyerId:actor.id,status:'open',createdAt:now()};this.disputes.push(dispute);this.record(actor.id,'dispute.created',dispute.id);return copy(dispute);});}
  resolveDispute(actor:Actor,disputeId:string,resolution:string) {return this.locked(()=>{role(actor,'admin','support');const dispute=this.disputes.find(d=>d.id===disputeId);check(dispute?.status==='open',409,'DISPUTE_CLOSED','Dispute is not open.');dispute.status='resolved';dispute.resolution=resolution;this.record(actor.id,'dispute.resolved',disputeId);return copy(dispute);});}
  requestRefund(actor:Actor,orderId:string,amountPaise:number,key:string) {return this.locked(async()=>{role(actor,'admin','finance');const fingerprint=JSON.stringify({orderId,amountPaise});const scopedKey=`${actor.id}:${key}`;const previous=this.refundKeys.get(scopedKey);if(previous){check(previous.fingerprint===fingerprint,409,'IDEMPOTENCY_CONFLICT','Use a new key for a different refund.');return copy(previous.result);}const order=this.orders.find(o=>o.id===orderId);check(order,404,'NOT_FOUND','Order not found.');check(Number.isSafeInteger(amountPaise)&&amountPaise>0,422,'INVALID_AMOUNT','Refund amount must be positive integer paise.');const pending=[...this.requestedRefunds.values()].filter(r=>r.orderId===orderId).reduce((s,r)=>s+r.amountPaise,0);check(amountPaise+pending+(this.refundedAmounts.get(orderId)??0)<=order.totalPaise,409,'REFUND_EXCEEDS_PAYMENT','Refund would exceed the captured order amount.');const payment=[...this.payments.values()].find(p=>p.groupId===order.groupId);check(payment?.paymentId,409,'UNPAID','This order does not have a captured provider payment.');const providerRefund=await this.gateway.refund({paymentId:payment.paymentId,amountPaise,receipt:key});this.requestedRefunds.set(providerRefund.id,{orderId,amountPaise});order.paymentStatus='refund_pending';this.record(actor.id,'refund.requested',orderId);const result={id:providerRefund.id,status:'pending',amountPaise};this.refundKeys.set(scopedKey,{fingerprint,result});return copy(result);});}
}
