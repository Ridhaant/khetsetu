import {writeFile} from 'node:fs/promises';
const str={type:'string'};const positive={type:'number',exclusiveMinimum:0};const quantity={type:'number',minimum:0.001,maximum:10000000};const pin={type:'string',pattern:'^[1-9][0-9]{5}$'};
const ref=name=>({$ref:`#/components/schemas/${name}`});
const obj=(properties,required=Object.keys(properties))=>({type:'object',properties,required});
const arr=items=>({type:'array',items});
const schemas={
  ApiError:obj({error:obj({code:str,message:str,requestId:str})}),
  ServiceabilityResult:obj({pin:str,serviceable:{type:'boolean',description:'Development checkout eligibility only; not a real logistics promise.'},scope:{enum:['national','pilot']},validation:{const:'format-only'},logisticsVerified:{const:false},reason:{enum:['invalid_pin','explicitly_denied','outside_pilot','eligible_development']},deliveryChargePaise:{type:'integer',description:'Illustrative development fee, not a carrier quote.'},freeDeliveryAbovePaise:{type:'integer'},pickupAvailable:{type:'boolean',description:'Development workflow eligibility; actual pickup is unverified.'},message:str}),
  PriceTier:obj({minQuantity:positive,price:positive}),
  Listing:obj({id:str,title:str,variety:str,category:str,sellerId:str,sellerName:str,unit:str,price:positive,availableQuantity:{type:'number',minimum:0},reservedQuantity:{type:'number',minimum:0},minimumQuantity:positive,grade:str,location:str,pin,organic:{type:'boolean'},harvestDate:{type:'string',format:'date'},expiresAt:{type:'string',format:'date-time'},image:{type:'string'},tiers:arr(ref('PriceTier')),status:{enum:['active','paused']},verified:{type:'boolean'}}),
  Actor:obj({id:str,role:{enum:['buyer','seller','admin','support','finance','logistics']},sellerId:str},['id','role']),
  OrderItem:obj({listingId:str,title:str,unit:str,quantity:positive,unitPricePaise:{type:'integer'},lineTotalPaise:{type:'integer'},grade:str}),
  Order:obj({id:str,groupId:str,buyerId:str,sellerId:str,sellerName:str,pin,fulfilment:{enum:['pickup','delivery']},items:arr(ref('OrderItem')),subtotalPaise:{type:'integer'},feePaise:{type:'integer'},taxPaise:{type:'integer'},deliveryPaise:{type:'integer'},totalPaise:{type:'integer'},status:{enum:['pending_payment','placed','accepted','packed','dispatched','delivered','completed','cancelled']},paymentStatus:{enum:['pending','paid','refund_pending','partially_refunded','refunded']},createdAt:{type:'string',format:'date-time'},reservationExpiresAt:{type:'string',format:'date-time'},timeline:arr(obj({status:str,at:{type:'string',format:'date-time'},actorId:str}))}),
  Checkout:obj({pin,fulfilment:{enum:['pickup','delivery']},items:{type:'array',minItems:1,maxItems:50,items:obj({listingId:str,quantity})}}),
  CheckoutResult:obj({groupId:str,orders:arr(ref('Order')),payment:obj({status:{const:'pending'},provider:{const:'razorpay'},available:{type:'boolean'},reason:str,providerOrderId:str,amountPaise:{type:'integer'},currency:{const:'INR'}},['status','provider','available','amountPaise','currency'])}),
  RFQInput:obj({title:str,category:str,quantity,unit:str,pin,deliveryBy:{type:'string',format:'date-time'},notes:str}),
  QuoteInput:obj({listingId:str,price:positive,quantity,validUntil:{type:'string',format:'date-time'},notes:str}),
  ListingInput:obj({title:str,category:{enum:['Vegetables','Fruits','Grains','Pulses','Spices','Oilseeds']},unit:{enum:['kg','gram','quintal','tonne','litre','piece','box','bag','crate']},price:positive,availableQuantity:{type:'number',minimum:0},minimumQuantity:positive,grade:{enum:['A','B','C']}})
};
const document={openapi:'3.1.0',info:{title:'KhetSetu Development API',version:'0.2.0',description:'Development reference only. Volatile data; demo-role authentication. Production startup disabled. INR prices in catalog; all order/payment monetary fields integer paise. UTC timestamps. Default national scope accepts six-digit PIN syntax starting with 1–9, subject to explicit denials. This does not verify postal existence, seller coverage, pickup, or carrier delivery. Configurable pilot/allow/deny policies apply consistently to serviceability, checkout, RFQs, and quote acceptance. Persistent PostgreSQL checkout still requires an explicitly active service area.'},servers:[{url:'http://localhost:4000/api/v1'}],security:[{bearerAuth:[]}],paths:{},components:{securitySchemes:{bearerAuth:{type:'http',scheme:'bearer',bearerFormat:'JWT'}},schemas}};
function add(path,method,summary,{input,output,status='200',publicRoute=false,idempotent=false,params=[]}={}){
 const parameters=[...params];for(const name of [...path.matchAll(/\{(\w+)\}/g)].map(x=>x[1]))parameters.push({name,in:'path',required:true,schema:str});if(idempotent)parameters.push({name:'Idempotency-Key',in:'header',required:true,schema:{type:'string',pattern:'^[a-zA-Z0-9_-]{8,128}$'}});
 document.paths[path]??={};document.paths[path][method]={summary,...(publicRoute?{security:[]}:{}),...(parameters.length?{parameters}:{}),...(input?{requestBody:{required:true,content:{'application/json':{schema:typeof input==='string'?ref(input):input}}}}:{}),responses:{[status]:{description:'Success',content:{'application/json':{schema:typeof output==='string'?ref(output):output??{type:'object'}}}},default:{description:'Request rejected',content:{'application/json':{schema:ref('ApiError')}}}}};
}
add('/catalog','get','Browse active, nonexpired sample listings',{publicRoute:true,output:arr(ref('Listing')),params:[{name:'pin',in:'query',schema:pin,description:'Serviceability must still be checked at checkout.'}]});
add('/sellers','get','Browse seeded verified seller fixtures',{publicRoute:true,output:arr({type:'object'})});
add('/serviceability/{pin}','get','Check configured national/pilot development eligibility; no actual logistics verification',{publicRoute:true,output:'ServiceabilityResult'});
add('/auth/demo','post','Create an explicit development role session; unavailable in production',{publicRoute:true,input:obj({role:{enum:['buyer','seller','admin']},sellerId:{enum:['s1','s2','s3']}},['role']),output:obj({accessToken:str,expiresIn:{const:900},user:ref('Actor'),demo:{const:true}})});
add('/auth/otp/request','post','Returns 503 until SMS OTP adapter is integrated',{publicRoute:true,input:obj({phone:str}),status:'503',output:'ApiError'});
add('/orders','get','List orders restricted by role and ownership',{output:arr(ref('Order'))});
add('/checkout','post','Reserve inventory and create seller-specific pending orders',{input:'Checkout',output:'CheckoutResult',status:'201',idempotent:true});
add('/orders/{id}/transition','post','Advance an authorised order state; verified storage proof required for delivery',{input:obj({status:{enum:['accepted','packed','dispatched','delivered','completed','cancelled']},proof:obj({kind:{const:'photo'},reference:str})},['status']),output:'Order'});
add('/seller/listings','get','List own inventory with reserved quantities',{output:arr(ref('Listing'))});
add('/seller/listings','post','Create a listing for a seeded verified seller',{input:'ListingInput',output:'Listing',status:'201'});
add('/seller/listings/{id}','patch','Edit own price, stock, title, MOQ, status, and expiry',{input:obj({title:str,price:positive,availableQuantity:{type:'number',minimum:0},minimumQuantity:positive,status:{enum:['active','paused']},expiresAt:{type:'string',format:'date-time'}},[]),output:'Listing'});
add('/rfqs','get','List owned buyer RFQs or open seller requirements',{output:arr({type:'object'})});
add('/rfqs','post','Create a bulk requirement using the configured India-wide/pilot policy',{input:'RFQInput',status:'201'});
add('/rfqs/{id}/quotes','post','Submit an owned-listing quotation',{input:'QuoteInput',status:'201'});
add('/quotes/{id}/accept','post','Accept one quote and create pending order exactly once',{output:'CheckoutResult',status:'201',idempotent:true});
add('/reviews','post','Create one verified review after buyer completion',{input:obj({orderId:str,rating:{type:'integer',minimum:1,maximum:5},text:str}),status:'201'});
add('/disputes','get','List owned or staff-visible disputes',{output:arr({type:'object'})});
add('/disputes','post','Report a delivered quality issue within 24 hours with scanned evidence',{input:obj({orderId:str,reason:{enum:['quality','weight','missing_items','damaged']},details:str,evidence:arr(str)}),status:'201'});
add('/disputes/{id}/resolve','post','Admin/support resolution with audit record',{input:obj({resolution:str})});
add('/orders/{id}/refund','post','Finance/admin requests a provider refund; completion awaits a signed webhook',{input:obj({amountPaise:{type:'integer',minimum:1}}),idempotent:true,status:'202'});
add('/admin/audit','get','Admin/finance audit trail',{output:arr({type:'object'})});
add('/payments/webhook','post','Razorpay exact-raw-body HMAC-SHA256 verification and event deduplication',{publicRoute:true,input:{type:'object'},params:[{name:'x-razorpay-signature',in:'header',required:true,schema:str},{name:'x-razorpay-event-id',in:'header',required:true,schema:str}]});
await writeFile('openapi.json',JSON.stringify(document,null,2)+'\n');console.log('OpenAPI 3.1 contract generated.');
