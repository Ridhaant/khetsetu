/** PostgreSQL transaction implementation intended for PrismaClient injection.
 * Not mounted by the demo HTTP server; requires generated Prisma client and database integration tests.
 * All SQL is fixed tagged templates with separately bound values.
 */
import { createHash, randomUUID } from 'node:crypto';
import { DomainError, type Actor, type CheckoutInput } from './types.ts';
import { isIndianPin } from './serviceability.ts';
interface SqlTransaction {
  $queryRaw<T=unknown>(query:TemplateStringsArray,...values:unknown[]):Promise<T>;
  $executeRaw(query:TemplateStringsArray,...values:unknown[]):Promise<number>;
}
export interface TransactionalDatabase {
  $transaction<T>(callback:(tx:SqlTransaction)=>Promise<T>,options:{isolationLevel:'Serializable';maxWait:number;timeout:number}):Promise<T>;
}
interface StockRow {id:string;sellerId:string;title:string;unit:string;grade:string;pricePaise:number;minimumMilli:number;status:string;expiresAt:Date;stockMilli:number;reservedMilli:number;sellerName:string;verified:boolean}
export class PostgresCheckoutRepository {
  constructor(private db:TransactionalDatabase) {}
  private async transaction<T>(operation:(tx:SqlTransaction)=>Promise<T>):Promise<T> {
    for(let attempt=0;attempt<3;attempt++) {
      try{return await this.db.$transaction(operation,{isolationLevel:'Serializable',maxWait:5000,timeout:15000});}
      catch(error){const code=(error as {code?:string}).code;if(attempt===2||!['P2034','P2002','40001','40P01','23505'].includes(code??''))throw error;}
    }
    throw new DomainError(503,'TRANSACTION_RETRY','Please retry using the same checkout key.');
  }
  reserve(actor:Actor,key:string,input:CheckoutInput&{addressId:string}) {
    if(actor.role!=='buyer')throw new DomainError(403,'FORBIDDEN','Only buyers may check out.');
    if(!isIndianPin(input.pin))throw new DomainError(422,'INVALID_PIN','Enter a six-digit Indian PIN code starting with 1–9.');
    const fingerprint=createHash('sha256').update(JSON.stringify(input)).digest('hex');
    return this.transaction(async tx=>{
      const previous=await tx.$queryRaw<{fingerprint:string;response:unknown}[]>`SELECT "fingerprint","response" FROM "Checkout" WHERE "buyerId"=${actor.id} AND "key"=${key} FOR UPDATE`;
      if(previous[0]){if(previous[0].fingerprint!==fingerprint)throw new DomainError(409,'IDEMPOTENCY_CONFLICT','This key is already used for a different cart.');return previous[0].response;}
      const addresses=await tx.$queryRaw<Record<string,unknown>[]>`SELECT "id","name","line1","line2","city","state","pin","instructions" FROM "Address" WHERE "id"=${input.addressId} AND "userId"=${actor.id}`;
      const address=addresses[0];if(!address||address.pin!==input.pin)throw new DomainError(422,'ADDRESS_REQUIRED','A saved address belonging to the buyer is required.');
      const areas=await tx.$queryRaw<{deliveryPaise:number;freeAbovePaise:number}[]>`SELECT "deliveryPaise","freeAbovePaise" FROM "ServiceArea" WHERE "pin"=${input.pin} AND "active"=true`;
      const area=areas[0];if(!area)throw new DomainError(422,'UNSERVICEABLE','This PIN code is not serviceable.');
      const checkoutId=randomUUID();const expiresAt=new Date(Date.now()+15*60000);
      await tx.$executeRaw`INSERT INTO "Checkout" ("id","buyerId","key","fingerprint","pin","totalPaise","expiresAt") VALUES (${checkoutId},${actor.id},${key},${fingerprint},${input.pin},0,${expiresAt})`;
      const quantities=new Map<string,number>();for(const item of input.items){const milli=Math.round(item.quantity*1000);if(!Number.isSafeInteger(milli)||milli<=0||Math.abs(milli-item.quantity*1000)>0.0001)throw new DomainError(422,'INVALID_QUANTITY','Quantity must use at most three decimal places.');quantities.set(item.listingId,(quantities.get(item.listingId)??0)+milli);}
      if(quantities.size===0||quantities.size>50)throw new DomainError(422,'INVALID_CART','Add between 1 and 50 listings.');
      const groups=new Map<string,{sellerName:string;lines:{listing:StockRow;quantityMilli:number;pricePaise:number;lineTotalPaise:number}[]}>();
      // A stable lock order prevents two carts from locking the same listings in opposite order.
      for(const listingId of [...quantities.keys()].sort()) {
        const quantityMilli=quantities.get(listingId)!;
        const rows=await tx.$queryRaw<StockRow[]>`SELECT l.*, i."stockMilli", i."reservedMilli", s."name" AS "sellerName", s."verified" FROM "Listing" l JOIN "InventoryLot" i ON i."listingId"=l."id" JOIN "SellerProfile" s ON s."id"=l."sellerId" WHERE l."id"=${listingId} FOR UPDATE OF l,i`;
        const listing=rows[0];if(!listing||!listing.verified||listing.status!=='active'||listing.expiresAt.getTime()<=Date.now())throw new DomainError(409,'UNAVAILABLE','A listing is no longer available.');
        if(quantityMilli<listing.minimumMilli||quantityMilli>listing.stockMilli-listing.reservedMilli)throw new DomainError(409,'INSUFFICIENT_STOCK','Minimum quantity or available inventory requirements are not met.');
        const tiers=await tx.$queryRaw<{pricePaise:number}[]>`SELECT "pricePaise" FROM "PriceTier" WHERE "listingId"=${listingId} AND "minMilli"<=${quantityMilli} ORDER BY "minMilli" DESC LIMIT 1`;
        const pricePaise=tiers[0]?.pricePaise??listing.pricePaise;const lineTotalPaise=Math.round(pricePaise*quantityMilli/1000);
        const group=groups.get(listing.sellerId)??{sellerName:listing.sellerName,lines:[]};group.lines.push({listing,quantityMilli,pricePaise,lineTotalPaise});groups.set(listing.sellerId,group);
        await tx.$executeRaw`UPDATE "InventoryLot" SET "reservedMilli"="reservedMilli"+${quantityMilli},"version"="version"+1 WHERE "listingId"=${listingId}`;
      }
      const orders=[];let totalPaise=0;
      for(const [sellerId,group] of groups) {
        const orderId=randomUUID();const subtotalPaise=group.lines.reduce((sum,line)=>sum+line.lineTotalPaise,0);const deliveryPaise=input.fulfilment==='pickup'||subtotalPaise>=area.freeAbovePaise?0:area.deliveryPaise;const orderTotal=subtotalPaise+deliveryPaise;totalPaise+=orderTotal;
        const snapshot={buyer:{id:actor.id},seller:{id:sellerId,name:group.sellerName},delivery:address,fulfilment:input.fulfilment,currency:'INR',feeRule:'pilot-zero-fee-v1',taxRule:'launch-tax-review-required'};
        await tx.$executeRaw`INSERT INTO "Order" ("id","checkoutId","sellerId","subtotalPaise","deliveryPaise","totalPaise","snapshot") VALUES (${orderId},${checkoutId},${sellerId},${subtotalPaise},${deliveryPaise},${orderTotal},${JSON.stringify(snapshot)}::jsonb)`;
        const items=[];
        for(const line of group.lines) {
          const itemSnapshot={title:line.listing.title,unit:line.listing.unit,grade:line.listing.grade};const itemId=randomUUID();
          await tx.$executeRaw`INSERT INTO "OrderItem" ("id","orderId","listingId","quantityMilli","unitPricePaise","lineTotalPaise","snapshot") VALUES (${itemId},${orderId},${line.listing.id},${line.quantityMilli},${line.pricePaise},${line.lineTotalPaise},${JSON.stringify(itemSnapshot)}::jsonb)`;
          items.push({id:itemId,listingId:line.listing.id,quantity:line.quantityMilli/1000,unitPricePaise:line.pricePaise,lineTotalPaise:line.lineTotalPaise,...itemSnapshot});
        }
        orders.push({id:orderId,sellerId,sellerName:group.sellerName,subtotalPaise,deliveryPaise,totalPaise:orderTotal,items,status:'pending_payment'});
      }
      if(totalPaise<100||totalPaise>50000000)throw new DomainError(422,'ORDER_VALUE_LIMIT','Pilot checkout supports totals from ₹1 to ₹5,00,000.');
      const response={groupId:checkoutId,orders,payment:{status:'pending',available:false,reason:'Provider order creation is queued; poll payment status before opening gateway checkout.',amountPaise:totalPaise,currency:'INR'}};
      await tx.$executeRaw`UPDATE "Checkout" SET "totalPaise"=${totalPaise},"response"=${JSON.stringify(response)}::jsonb WHERE "id"=${checkoutId}`;
      await tx.$executeRaw`INSERT INTO "Payment" ("id","checkoutId","amountPaise") VALUES (${randomUUID()},${checkoutId},${totalPaise})`;
      await tx.$executeRaw`INSERT INTO "OutboxEvent" ("id","topic","payload","key") VALUES (${randomUUID()},'payment.create_order',${JSON.stringify({checkoutId,amountPaise:totalPaise})}::jsonb,${`payment-create:${checkoutId}`})`;
      await tx.$executeRaw`INSERT INTO "AuditLog" ("id","actorId","action","targetId","metadata") VALUES (${randomUUID()},${actor.id},'checkout.reserved',${checkoutId},'{}'::jsonb)`;
      return response;
    });
  }
  captured(event:{id:string;payloadHash:string;providerOrderId:string;providerPaymentId:string;amountPaise:number;currency:string}) {
    return this.transaction(async tx=>{
      const prior=await tx.$queryRaw<{payloadHash:string;status:string}[]>`SELECT "payloadHash","status" FROM "WebhookEvent" WHERE "id"=${event.id} FOR UPDATE`;
      if(prior[0]){if(prior[0].payloadHash!==event.payloadHash)throw new DomainError(409,'EVENT_REPLAY_MISMATCH','Event ID was replayed with a different payload.');if(prior[0].status==='processed')return {duplicate:true};}
      else await tx.$executeRaw`INSERT INTO "WebhookEvent" ("id","provider","payloadHash") VALUES (${event.id},'razorpay',${event.payloadHash})`;
      const payments=await tx.$queryRaw<{id:string;checkoutId:string;amountPaise:number;providerPaymentId:string|null;status:string}[]>`SELECT * FROM "Payment" WHERE "providerOrderId"=${event.providerOrderId} FOR UPDATE`;
      const payment=payments[0];if(!payment||payment.amountPaise!==event.amountPaise||event.currency!=='INR')throw new DomainError(409,'PAYMENT_MISMATCH','Payment order, amount, or currency does not match.');
      if(payment.status==='paid'){if(payment.providerPaymentId!==event.providerPaymentId)throw new DomainError(409,'PAYMENT_MISMATCH','Checkout already has another payment.');await tx.$executeRaw`UPDATE "WebhookEvent" SET "status"='processed',"processedAt"=CURRENT_TIMESTAMP WHERE "id"=${event.id}`;return {duplicate:true};}
      const checkouts=await tx.$queryRaw<{status:string;expiresAt:Date}[]>`SELECT "status","expiresAt" FROM "Checkout" WHERE "id"=${payment.checkoutId} FOR UPDATE`;const checkout=checkouts[0];
      if(!checkout||checkout.status!=='pending_payment'||checkout.expiresAt.getTime()<=Date.now())throw new DomainError(409,'RECONCILIATION_REQUIRED','Late payment must be reconciled and refunded.');
      const items=await tx.$queryRaw<{listingId:string;quantityMilli:bigint}[]>`SELECT i."listingId", SUM(i."quantityMilli") AS "quantityMilli" FROM "OrderItem" i JOIN "Order" o ON o."id"=i."orderId" WHERE o."checkoutId"=${payment.checkoutId} GROUP BY i."listingId" ORDER BY i."listingId"`;
      for(const item of items){const milli=Number(item.quantityMilli);await tx.$executeRaw`UPDATE "InventoryLot" SET "stockMilli"="stockMilli"-${milli},"reservedMilli"="reservedMilli"-${milli},"version"="version"+1 WHERE "listingId"=${item.listingId}`;}
      await tx.$executeRaw`UPDATE "Payment" SET "status"='paid',"providerPaymentId"=${event.providerPaymentId} WHERE "id"=${payment.id}`;
      await tx.$executeRaw`UPDATE "Checkout" SET "status"='placed' WHERE "id"=${payment.checkoutId}`;
      await tx.$executeRaw`UPDATE "Order" SET "status"='placed',"paymentStatus"='paid' WHERE "checkoutId"=${payment.checkoutId}`;
      await tx.$executeRaw`UPDATE "WebhookEvent" SET "status"='processed',"processedAt"=CURRENT_TIMESTAMP WHERE "id"=${event.id}`;
      await tx.$executeRaw`INSERT INTO "OutboxEvent" ("id","topic","payload","key") VALUES (${randomUUID()},'order.payment_confirmed',${JSON.stringify({checkoutId:payment.checkoutId})}::jsonb,${`paid:${payment.checkoutId}`})`;
      return {duplicate:false};
    });
  }
}
