import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { Marketplace } from './marketplace.ts';
import { DomainError, type Listing, type OrderStatus } from './types.ts';
import { Sessions } from './auth.ts';
import { RazorpayGateway, verifyWebhook } from './payments.ts';
import * as v from './validation.ts';
export function createApp(options:{demo?:boolean;marketplace?:Marketplace;secret?:string;webhookSecret?:string;origins?:string[]}={}) {
  if(process.env.RAZORPAY_KEY_ID&&!/^rzp_test_[a-zA-Z0-9]+$/.test(process.env.RAZORPAY_KEY_ID))throw new Error('Development API accepts only Razorpay test keys. Live payment credentials are forbidden with demo identities.');
  const market=options.marketplace??new Marketplace(process.env.RAZORPAY_KEY_ID&&process.env.RAZORPAY_KEY_SECRET?new RazorpayGateway(process.env.RAZORPAY_KEY_ID,process.env.RAZORPAY_KEY_SECRET):undefined);
  const sessions=new Sessions(options.secret);const buckets=new Map<string,{count:number;until:number}>();
  const origins=options.origins??['http://localhost:3000','http://localhost:8081','http://localhost:4173','http://127.0.0.1:4173','http://localhost:5173','http://127.0.0.1:5173'];
  const server=createServer(async(req:IncomingMessage,res:ServerResponse)=>{
    const requestId=crypto.randomUUID();res.setHeader('X-Request-Id',requestId);res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Content-Security-Policy',"default-src 'none'; frame-ancestors 'none'");
    const send=(status:number,data:unknown)=>{res.statusCode=status;res.end(JSON.stringify(data));};
    try {
      const origin=req.headers.origin;if(origin){if(!origins.includes(origin))throw new DomainError(403,'ORIGIN_DENIED','This client origin is not allowed.');res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type, Idempotency-Key');res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, OPTIONS');}
      if(req.method==='OPTIONS'){res.statusCode=204;res.end();return;}
      const key=req.socket.remoteAddress??'unknown';const bucket=buckets.get(key);if(!bucket||bucket.until<Date.now())buckets.set(key,{count:1,until:Date.now()+60000});else if(++bucket.count>120)throw new DomainError(429,'RATE_LIMIT','Too many requests. Please try again in a minute.');
      if(buckets.size>10000)for(const [k,b]of buckets)if(b.until<Date.now())buckets.delete(k);
      const url=new URL(req.url??'/','http://localhost');const path=url.pathname.replace(/\/$/,'');const method=req.method;
      if(path==='/health')return send(200,{ok:true,mode:'development-demo',persistent:false,paymentConfigured:!!process.env.RAZORPAY_KEY_ID});
      if(path==='/api/v1/catalog'&&method==='GET')return send(200,market.catalog());
      if(path==='/api/v1/sellers'&&method==='GET')return send(200,market.sellerList());
      if(path.startsWith('/api/v1/serviceability/')&&method==='GET')return send(200,market.serviceability(path.split('/').at(-1)!));
      const chunks:Buffer[]=[];let size=0;for await(const chunk of req){const buffer=Buffer.from(chunk);size+=buffer.length;if(size>262144)throw new DomainError(413,'BODY_TOO_LARGE','Request body exceeds 256 KB.');chunks.push(buffer);}const raw=Buffer.concat(chunks);
      if(path==='/api/v1/payments/webhook'&&method==='POST') {
        if(!options.webhookSecret)throw new DomainError(503,'WEBHOOK_NOT_CONFIGURED','Payment webhook secret is not configured.');
        if(!verifyWebhook(raw,typeof req.headers['x-razorpay-signature']==='string'?req.headers['x-razorpay-signature']:undefined,options.webhookSecret))throw new DomainError(401,'INVALID_SIGNATURE','Payment signature is invalid.');
        const eventId=req.headers['x-razorpay-event-id'];if(typeof eventId!=='string'||eventId.length>200)throw new DomainError(422,'EVENT_ID_REQUIRED','Provider event ID is required.');
        let event;try{event=JSON.parse(raw.toString());}catch{throw new DomainError(400,'INVALID_JSON','The webhook JSON is invalid.');}return send(200,await market.webhook(eventId,event));
      }
      let body:v.Body={};if(raw.length){if(!req.headers['content-type']?.startsWith('application/json'))throw new DomainError(415,'CONTENT_TYPE','Use application/json.');try{body=v.object(JSON.parse(raw.toString()));}catch(error){if(error instanceof DomainError)throw error;throw new DomainError(400,'INVALID_JSON','The request JSON is invalid.');}}
      if(path==='/api/v1/auth/demo'&&method==='POST') {
        if(!options.demo)throw new DomainError(404,'NOT_FOUND','Not found.');
        const role=v.choice(body,'role',['buyer','seller','admin'] as const);const sellerId=body.sellerId?v.choice(body,'sellerId',['s1','s2','s3'] as const):'s1';const user={id:`${role}-demo`,role,...(role==='seller'?{sellerId}:{})};return send(200,{accessToken:sessions.issue(user),expiresIn:900,user,demo:true});
      }
      if(path.startsWith('/api/v1/auth/otp'))throw new DomainError(503,'SMS_NOT_CONFIGURED','Mobile OTP requires a configured SMS provider. Demo sessions are available only in development mode.');
      const actor=sessions.verify(typeof req.headers.authorization==='string'?req.headers.authorization:undefined);
      const idempotency=()=>{const key=req.headers['idempotency-key'];if(typeof key!=='string'||!/^[a-zA-Z0-9_-]{8,128}$/.test(key))throw new DomainError(422,'IDEMPOTENCY_REQUIRED','Send an Idempotency-Key of 8–128 letters, digits, hyphens, or underscores.');return key;};
      if(path==='/api/v1/orders'&&method==='GET')return send(200,market.listOrders(actor));
      if(path==='/api/v1/checkout'&&method==='POST')return send(201,await market.checkout(actor,idempotency(),{pin:v.pin(body),fulfilment:v.choice(body,'fulfilment',['pickup','delivery'] as const),items:v.list(body,'items').map(item=>{const row=v.object(item);return {listingId:v.text(row,'listingId',100),quantity:v.number(row,'quantity')};})}));
      const transition=path.match(/^\/api\/v1\/orders\/([^/]+)\/transition$/);
      if(transition&&method==='POST'){const proof=body.proof?v.object(body.proof):undefined;return send(200,await market.transition(actor,transition[1]!,v.choice(body,'status',['accepted','packed','dispatched','delivered','completed','cancelled'] as const) as OrderStatus,proof?{kind:v.choice(proof,'kind',['photo'] as const),reference:v.text(proof,'reference',200)}:undefined));}
      if(path==='/api/v1/seller/listings'&&method==='GET')return send(200,market.sellerInventory(actor));
      if(path==='/api/v1/seller/listings'&&method==='POST')return send(201,await market.createListing(actor,{title:v.text(body,'title',120),category:v.choice(body,'category',['Vegetables','Fruits','Grains','Pulses','Spices','Oilseeds'] as const),unit:v.choice(body,'unit',v.units),price:v.number(body,'price',100000),availableQuantity:v.number(body,'availableQuantity',1e7,0),minimumQuantity:v.number(body,'minimumQuantity'),grade:v.choice(body,'grade',['A','B','C'] as const)}));
      const listing=path.match(/^\/api\/v1\/seller\/listings\/([^/]+)$/);
      if(listing&&method==='PATCH'){const patch:Partial<Listing>={};if(body.title!==undefined)patch.title=v.text(body,'title',120);if(body.price!==undefined)patch.price=v.number(body,'price',100000);if(body.availableQuantity!==undefined)patch.availableQuantity=v.number(body,'availableQuantity',1e7,0);if(body.minimumQuantity!==undefined)patch.minimumQuantity=v.number(body,'minimumQuantity');if(body.status!==undefined)patch.status=v.choice(body,'status',['active','paused'] as const);if(body.expiresAt!==undefined)patch.expiresAt=v.iso(body,'expiresAt');return send(200,await market.updateListing(actor,listing[1]!,patch));}
      if(path==='/api/v1/rfqs'&&method==='GET')return send(200,market.listRfqs(actor));
      if(path==='/api/v1/rfqs'&&method==='POST')return send(201,await market.createRfq(actor,{title:v.text(body,'title',120),category:v.text(body,'category',50),quantity:v.number(body,'quantity'),unit:v.choice(body,'unit',v.units),pin:v.pin(body),deliveryBy:v.iso(body,'deliveryBy'),notes:v.text(body,'notes',2000,0)}));
      const rfq=path.match(/^\/api\/v1\/rfqs\/([^/]+)\/quotes$/);
      if(rfq&&method==='POST')return send(201,await market.createQuote(actor,rfq[1]!,{listingId:v.text(body,'listingId',100),price:v.number(body,'price',100000),quantity:v.number(body,'quantity'),validUntil:v.iso(body,'validUntil'),notes:v.text(body,'notes',2000,0)}));
      const quote=path.match(/^\/api\/v1\/quotes\/([^/]+)\/accept$/);if(quote&&method==='POST')return send(201,await market.acceptQuote(actor,quote[1]!,idempotency()));
      if(path==='/api/v1/reviews'&&method==='POST')return send(201,await market.createReview(actor,{orderId:v.text(body,'orderId',100),rating:v.integer(body,'rating',5,1),text:v.text(body,'text',2000)}));
      if(path==='/api/v1/disputes'&&method==='GET')return send(200,market.listDisputes(actor));
      if(path==='/api/v1/disputes'&&method==='POST')return send(201,await market.createDispute(actor,{orderId:v.text(body,'orderId',100),reason:v.choice(body,'reason',['quality','weight','missing_items','damaged'] as const),details:v.text(body,'details',2000),evidence:v.evidence(body,'evidence')}));
      const dispute=path.match(/^\/api\/v1\/disputes\/([^/]+)\/resolve$/);if(dispute&&method==='POST')return send(200,await market.resolveDispute(actor,dispute[1]!,v.text(body,'resolution',2000)));
      const refund=path.match(/^\/api\/v1\/orders\/([^/]+)\/refund$/);if(refund&&method==='POST')return send(202,await market.requestRefund(actor,refund[1]!,v.integer(body,'amountPaise',1e10,1),idempotency()));
      if(path==='/api/v1/admin/audit'&&method==='GET')return send(200,market.auditLog(actor));
      throw new DomainError(404,'NOT_FOUND','This API route does not exist.');
    } catch(error) {const safe=error instanceof DomainError?error:new DomainError(500,'INTERNAL_ERROR','The request could not be completed.');send(safe.status,{error:{code:safe.code,message:safe.message,requestId}});}
  });
  server.requestTimeout=15000;server.headersTimeout=10000;server.maxHeadersCount=50;
  return {server,market,sessions};
}
