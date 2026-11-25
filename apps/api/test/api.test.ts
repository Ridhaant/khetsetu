import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { once } from 'node:events';
import { createApp } from '../src/app.ts';
import { verifyWebhook } from '../src/payments.ts';
import { Marketplace } from '../src/marketplace.ts';
test('HTTP auth, serviceability, validation, RBAC, checkout and unsigned webhook',async(t)=>{
  const {server}=createApp({demo:true,secret:'test-secret-only',webhookSecret:'webhook-test-only'});server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>server.close());
  const address=server.address();assert.ok(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}/api/v1`;
  const request=async(path:string,body?:unknown,token?:string,key?:string)=>fetch(`${base}${path}`,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{}) ,...(key?{'idempotency-key':key}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
  assert.equal((await request('/orders')).status,401);assert.equal((await request('/auth/otp/request',{phone:'9999999999'})).status,503);
  const login=await request('/auth/demo',{role:'buyer'});const {accessToken}=await login.json() as {accessToken:string};
  assert.equal((await request('/checkout',{pin:'400008',items:[{listingId:'l-tomato',quantity:-2}],fulfilment:'delivery'},accessToken,'valid-key-1')).status,422);
  assert.equal((await request('/reviews',{orderId:'not-an-order',rating:3.5,text:'Invalid fractional rating'},accessToken)).status,422);
  const checkout=await request('/checkout',{pin:'400008',items:[{listingId:'l-tomato',quantity:2}],fulfilment:'delivery'},accessToken,'valid-key-2');assert.equal(checkout.status,201);assert.equal((await checkout.json() as {payment:{status:string}}).payment.status,'pending');
  assert.equal((await request('/admin/audit',undefined,accessToken)).status,403);assert.equal((await request('/payments/webhook',{})).status,401);
  const pin=await request('/serviceability/400008');assert.equal((await pin.json() as {serviceable:boolean}).serviceable,true);
  const national=await request('/serviceability/560001');const eligibility=await national.json() as {serviceable:boolean;scope:string;validation:string;logisticsVerified:boolean};assert.equal(eligibility.serviceable,true);assert.equal(eligibility.scope,'national');assert.equal(eligibility.validation,'format-only');assert.equal(eligibility.logisticsVerified,false);
  const invalid=await request('/serviceability/012345');assert.equal((await invalid.json() as {serviceable:boolean}).serviceable,false);
  assert.equal((await request('/checkout',{pin:'012345',items:[{listingId:'l-tomato',quantity:1}],fulfilment:'delivery'},accessToken,'invalid-postal-key')).status,422);
  const regional=await request('/checkout',{pin:'110001',items:[{listingId:'l-tomato',quantity:1}],fulfilment:'delivery'},accessToken,'regional-checkout-key');assert.equal(regional.status,201);assert.equal((await regional.json() as {orders:{pin:string}[]}).orders[0]!.pin,'110001');
});
test('webhook HMAC verifies exact raw bytes and rejects modified signatures',()=>{
  const raw=Buffer.from('{"event":"payment.captured"}');const signature=createHmac('sha256','secret').update(raw).digest('hex');assert.equal(verifyWebhook(raw,signature,'secret'),true);assert.equal(verifyWebhook(Buffer.from('{}'),signature,'secret'),false);assert.equal(verifyWebhook(raw,'not-hex','secret'),false);assert.equal(verifyWebhook(raw,signature,undefined),false);
});
test('demo API refuses live Razorpay credentials before creating a server',()=>{
  const before=process.env.RAZORPAY_KEY_ID;process.env.RAZORPAY_KEY_ID='rzp_live_FORBIDDEN';
  try{assert.throws(()=>createApp({demo:true}),/Live payment credentials are forbidden/);}finally{if(before===undefined)delete process.env.RAZORPAY_KEY_ID;else process.env.RAZORPAY_KEY_ID=before;}
});
test('HTTP signed payment capture and duplicate events create one placed order',async(t)=>{
  const market=new Marketplace({enabled:true,async createOrder(){return {id:'http-provider-order'};},async refund(){return {id:'http-provider-refund'};}});
  const {server}=createApp({demo:true,marketplace:market,webhookSecret:'http-webhook-secret'});server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>server.close());
  const address=server.address();assert.ok(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}/api/v1`;
  const login=await fetch(`${base}/auth/demo`,{method:'POST',headers:{'content-type':'application/json'},body:'{"role":"buyer"}'});const {accessToken}=await login.json() as {accessToken:string};
  const checkout=await fetch(`${base}/checkout`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${accessToken}`,'idempotency-key':'http-payment-checkout'},body:JSON.stringify({pin:'400008',fulfilment:'delivery',items:[{listingId:'l-tomato',quantity:2}]})});const result=await checkout.json() as {payment:{amountPaise:number}};
  const raw=JSON.stringify({event:'payment.captured',payload:{payment:{entity:{id:'http-payment',order_id:'http-provider-order',amount:result.payment.amountPaise,currency:'INR',status:'captured'}}}});const signature=createHmac('sha256','http-webhook-secret').update(raw).digest('hex');
  const webhook=()=>fetch(`${base}/payments/webhook`,{method:'POST',headers:{'content-type':'application/json','x-razorpay-signature':signature,'x-razorpay-event-id':'http-payment-event'},body:raw});
  assert.equal((await webhook()).status,200);assert.deepEqual(await (await webhook()).json(),{duplicate:true});
  const orders=await fetch(`${base}/orders`,{headers:{authorization:`Bearer ${accessToken}`}});const rows=await orders.json() as {status:string}[];assert.equal(rows.length,1);assert.equal(rows[0]!.status,'placed');assert.equal(market.catalog().find(l=>l.id==='l-tomato')!.availableQuantity,478);
});
