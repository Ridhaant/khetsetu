import test from 'node:test';
import assert from 'node:assert/strict';
import { Marketplace } from '../src/marketplace.ts';
import type { Actor, CheckoutResult } from '../src/types.ts';
import type { PaymentGateway } from '../src/payments.ts';
import { DevelopmentServiceabilityPolicy } from '../src/serviceability.ts';
const buyer:Actor={id:'buyer-1',role:'buyer'};
const seller:Actor={id:'seller-user',role:'seller',sellerId:'s1'};
const admin:Actor={id:'admin-1',role:'admin'};
const cart={pin:'400008',items:[{listingId:'l-tomato',quantity:2}],fulfilment:'delivery' as const};
class TestGateway implements PaymentGateway {enabled=true;orders=0;refunds=0;async createOrder(){return {id:`provider-order-${++this.orders}`};}async refund(){return {id:`provider-refund-${++this.refunds}`};}}
async function capture(market:Marketplace,result:CheckoutResult,eventId='event-1') {return market.webhook(eventId,{event:'payment.captured',payload:{payment:{entity:{id:'provider-payment-1',order_id:result.payment.providerOrderId,amount:result.payment.amountPaise,currency:'INR',status:'captured'}}}});}
test('concurrent checkouts cannot oversell; duplicate requests reserve only once',async()=>{
  const market=new Marketplace();await market.updateListing(seller,'l-tomato',{availableQuantity:3});
  const results=await Promise.allSettled([market.checkout(buyer,'checkout-one',cart),market.checkout({...buyer,id:'buyer-2'},'checkout-two',cart)]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(market.catalog().find(l=>l.id==='l-tomato')!.availableQuantity,1);
  const replay=await market.checkout(buyer,'checkout-one',cart);assert.equal(replay.orders.length,1);assert.equal(market.listOrders(buyer).length,1);
  await assert.rejects(market.checkout(buyer,'checkout-one',{...cart,items:[{listingId:'l-tomato',quantity:1}]}),{code:'IDEMPOTENCY_CONFLICT'});
});
test('seller orders snapshot prices and isolate ownership',async()=>{
  const market=new Marketplace();const result=await market.checkout(buyer,'split-order-1',{...cart,items:[...cart.items,{listingId:'l-onion',quantity:3}]});
  assert.equal(result.orders.length,2);assert.equal(market.listOrders(seller).length,1);
  await market.updateListing(seller,'l-tomato',{title:'Changed title',price:999});assert.equal(market.listOrders(buyer)[0]!.items[0]!.title,'Farm-fresh tomatoes');assert.equal(market.listOrders(buyer)[0]!.items[0]!.unitPricePaise,3200);
  await assert.rejects(market.updateListing(seller,'l-onion',{price:1}),{code:'FORBIDDEN'});
});
test('unsupported PINs and paused inventory cannot be purchased',async()=>{
  const market=new Marketplace(undefined,undefined,new DevelopmentServiceabilityPolicy({mode:'pilot'}));await assert.rejects(market.checkout(buyer,'unsupported-1',{...cart,pin:'110001'}),{code:'UNSERVICEABLE'});
  await market.updateListing(seller,'l-tomato',{status:'paused'});await assert.rejects(market.checkout(buyer,'paused-stock-1',cart),{code:'UNAVAILABLE'});assert.equal(market.listOrders(buyer).length,0);
  await market.updateListing(seller,'l-tomato',{status:'active',expiresAt:new Date(Date.now()-1000).toISOString()});await assert.rejects(market.checkout(buyer,'expired-stock-1',cart),{code:'UNAVAILABLE'});
});
test('stock updates respect holds and unpaid fulfilment fails',async()=>{
  const market=new Marketplace();const result=await market.checkout(buyer,'checkout-held-1',cart);assert.equal(result.payment.available,false);
  await assert.rejects(market.updateListing(seller,'l-tomato',{availableQuantity:1}),{code:'RESERVED_STOCK'});
  await assert.rejects(market.transition(seller,result.orders[0]!.id,'accepted'),{code:'INVALID_TRANSITION'});
  await market.expireReservations(Date.now()+16*60000);assert.equal(market.listOrders(buyer)[0]!.status,'cancelled');assert.equal(market.catalog().find(l=>l.id==='l-tomato')!.availableQuantity,480);
});
test('captured payment deduplicates events and consumes reservations once',async()=>{
  const gateway=new TestGateway();const market=new Marketplace(gateway);const result=await market.checkout(buyer,'capture-payment-1',cart);
  await capture(market,result);assert.equal(market.listOrders(buyer)[0]!.status,'placed');
  assert.deepEqual(await capture(market,result),{duplicate:true});await capture(market,result,'different-event-same-payment');
  const stock=market.sellerInventory(seller)[0]!;assert.equal(stock.reservedQuantity,0);assert.equal(stock.availableQuantity,478);assert.equal(gateway.orders,1);
});
test('wrong capture amount cannot mark an order paid',async()=>{
  const market=new Marketplace(new TestGateway());const result=await market.checkout(buyer,'amount-mismatch-1',cart);
  await assert.rejects(market.webhook('invalid-amount',{event:'payment.captured',payload:{payment:{entity:{id:'payment-bad',order_id:result.payment.providerOrderId,amount:1,currency:'INR',status:'captured'}}}}),{code:'PAYMENT_MISMATCH'});
  assert.equal(market.listOrders(buyer)[0]!.paymentStatus,'pending');
});
test('completed purchase with verified proof permits one review and a dispute',async()=>{
  const market=new Marketplace(new TestGateway(),ref=>ref==='proof/test-scanned.jpg');const result=await market.checkout(buyer,'fulfilment-1',cart);await capture(market,result);const orderId=result.orders[0]!.id;
  await assert.rejects(market.createReview(buyer,{orderId,rating:5,text:'Great'}),{code:'REVIEW_UNVERIFIED'});
  for(const state of ['accepted','packed','dispatched'] as const)await market.transition(seller,orderId,state);
  await assert.rejects(market.transition(seller,orderId,'delivered'),{code:'PROOF_REQUIRED'});
  await market.transition(seller,orderId,'delivered',{kind:'photo',reference:'proof/test-scanned.jpg'});await market.transition(buyer,orderId,'completed');
  const review=await market.createReview(buyer,{orderId,rating:5,text:'Fresh produce'});assert.equal(review.verifiedPurchase,true);
  await assert.rejects(market.createReview(buyer,{orderId,rating:4,text:'Second review'}),{code:'ALREADY_REVIEWED'});
  const dispute=await market.createDispute(buyer,{orderId,reason:'weight',details:'One bag was short',evidence:['proof/test-scanned.jpg']});assert.equal((await market.resolveDispute(admin,dispute.id,'Weight discrepancy accepted')).status,'resolved');
});
test('arbitrary proof references fail closed without an upload verifier',async()=>{
  const market=new Marketplace(new TestGateway());const result=await market.checkout(buyer,'proof-blocked-1',cart);await capture(market,result);const orderId=result.orders[0]!.id;
  for(const state of ['accepted','packed','dispatched'] as const)await market.transition(seller,orderId,state);
  await assert.rejects(market.transition(seller,orderId,'delivered',{kind:'photo',reference:'proof/fabricated.jpg'}),{code:'EVIDENCE_NOT_VERIFIED'});
});
test('RFQ compares two sellers and acceptance remains idempotent with a new client key',async()=>{
  const market=new Marketplace();const rfq=await market.createRfq(buyer,{title:'Bulk vegetables',category:'Vegetables',quantity:20,unit:'kg',pin:'400008',deliveryBy:new Date(Date.now()+86400000).toISOString(),notes:'Morning delivery'});
  const expiry=new Date(Date.now()+86400000).toISOString();const one=await market.createQuote(seller,rfq.id,{listingId:'l-tomato',price:30,quantity:20,validUntil:expiry,notes:''});await market.createQuote({id:'seller-2',role:'seller',sellerId:'s2'},rfq.id,{listingId:'l-onion',price:25,quantity:20,validUntil:expiry,notes:''});
  assert.equal(market.listRfqs(buyer)[0]!.quotes.length,2);const result=await market.acceptQuote(buyer,one.id,'accept-quote-1');const retry=await market.acceptQuote(buyer,one.id,'new-key-retry-1');assert.equal(retry.groupId,result.groupId);assert.equal(market.listOrders(buyer).length,1);assert.equal(result.orders[0]!.items[0]!.unitPricePaise,3000);
});
test('cancel/refund reconciles provider results and blocks over-refunding',async()=>{
  const gateway=new TestGateway();const market=new Marketplace(gateway);const result=await market.checkout(buyer,'cancel-refund-1',cart);await capture(market,result);const orderId=result.orders[0]!.id;
  await market.transition(buyer,orderId,'cancelled');const refund=await market.requestRefund(admin,orderId,result.payment.amountPaise,'refund-key-1');const repeat=await market.requestRefund(admin,orderId,result.payment.amountPaise,'refund-key-1');assert.equal(refund.id,repeat.id);assert.equal(gateway.refunds,1);
  await assert.rejects(market.requestRefund(admin,orderId,1,'refund-key-2'),{code:'REFUND_EXCEEDS_PAYMENT'});
  const event={event:'refund.processed',payload:{refund:{entity:{id:refund.id,payment_id:'provider-payment-1',amount:result.payment.amountPaise,status:'processed'}}}};
  await market.webhook('refund-event',event);await market.webhook('refund-event-another',event);assert.equal(market.listOrders(buyer)[0]!.paymentStatus,'refunded');
  assert.ok(market.auditLog(admin).every((entry,i,all)=>i===0||entry.previousHash===all[i-1]!.hash));
});
test('processed partial refund is distinct from a pending or full refund',async()=>{
  const market=new Marketplace(new TestGateway());const result=await market.checkout(buyer,'partial-refund-1',cart);await capture(market,result);const orderId=result.orders[0]!.id;
  const refund=await market.requestRefund(admin,orderId,1000,'partial-refund-key');assert.equal(market.listOrders(buyer)[0]!.paymentStatus,'refund_pending');
  await market.webhook('partial-refund-event',{event:'refund.processed',payload:{refund:{entity:{id:refund.id,payment_id:'provider-payment-1',amount:1000,status:'processed'}}}});
  assert.equal(market.listOrders(buyer)[0]!.paymentStatus,'partially_refunded');
  await assert.rejects(market.requestRefund(admin,orderId,result.payment.amountPaise,'too-large-after-partial'),{code:'REFUND_EXCEEDS_PAYMENT'});
});
