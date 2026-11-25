import test from 'node:test';
import assert from 'node:assert/strict';
import {Marketplace} from '../src/marketplace.ts';
import {DevelopmentServiceabilityPolicy,developmentAreaPolicy,isIndianPin} from '../src/serviceability.ts';
import {serviceAreaCandidates} from '../src/seed.ts';
import type {Actor} from '../src/types.ts';

const buyer:Actor={id:'national-buyer',role:'buyer'};
const seller:Actor={id:'national-seller',role:'seller',sellerId:'s1'};
const cart=(pin:string)=>({pin,fulfilment:'delivery' as const,items:[{listingId:'l-tomato',quantity:1}]});
const requirement=(pin:string)=>({pin,title:'Fresh tomatoes',category:'Vegetables',quantity:1,unit:'kg',deliveryBy:new Date(Date.now()+86400000).toISOString(),notes:''});

test('default national policy permits regional PIN formats without claiming actual logistics',()=>{
  const policy=developmentAreaPolicy({});
  for(const {pin}of serviceAreaCandidates){const result=policy.evaluate(pin);assert.equal(result.serviceable,true,pin);assert.equal(result.scope,'national');assert.equal(result.validation,'format-only');assert.equal(result.logisticsVerified,false);assert.equal(result.reason,'eligible_development');assert.match(result.message,/not verified/);}
  // Syntax eligibility also covers zone 9; it is deliberately not a postal/carrier existence check.
  assert.equal(policy.evaluate('900001').serviceable,true);
});
test('malformed and zero-leading PINs are rejected by the shared predicate',()=>{
  const policy=developmentAreaPolicy({});
  for(const pin of ['000000','012345','40000','1234567','400 008','abcdef','',' 110001']){assert.equal(isIndianPin(pin),false);assert.equal(policy.evaluate(pin).serviceable,false);assert.equal(policy.evaluate(pin).reason,'invalid_pin');}
});
test('explicit denials win; pilot mode can allow additional configured PINs',()=>{
  const national=new DevelopmentServiceabilityPolicy({mode:'national',allowedPins:['110001'],deniedPins:['110001']});
  assert.equal(national.evaluate('110001').reason,'explicitly_denied');assert.equal(national.evaluate('560001').serviceable,true);
  const pilot=new DevelopmentServiceabilityPolicy({mode:'pilot',pilotPins:['400008'],allowedPins:['560001'],deniedPins:['400008']});
  assert.equal(pilot.evaluate('400008').reason,'explicitly_denied');assert.equal(pilot.evaluate('560001').serviceable,true);assert.equal(pilot.evaluate('110001').reason,'outside_pilot');
});
test('environment configuration fails closed on invalid scope and override formats',()=>{
  assert.throws(()=>developmentAreaPolicy({SERVICEABILITY_MODE:'anything'}),/must be national or pilot/);
  assert.throws(()=>developmentAreaPolicy({SERVICEABILITY_DENY_PINS:'012345'}),/invalid PIN/);
  const configured=developmentAreaPolicy({SERVICEABILITY_MODE:'pilot',SERVICEABILITY_PILOT_PINS:'400008',SERVICEABILITY_ALLOW_PINS:' 560001, 110001 ',SERVICEABILITY_DENY_PINS:'110001'});
  assert.equal(configured.evaluate('560001').serviceable,true);assert.equal(configured.evaluate('110001').serviceable,false);
});
test('regional checkout, RFQ creation, and quote acceptance share national eligibility',async()=>{
  const market=new Marketplace(undefined,undefined,developmentAreaPolicy({}));
  for(const {pin}of serviceAreaCandidates){
    assert.equal(market.serviceability(pin).serviceable,true);
    const checkout=await market.checkout(buyer,`national-checkout-${pin}`,cart(pin));assert.equal(checkout.orders[0]!.pin,pin);assert.equal(checkout.payment.status,'pending');assert.equal(checkout.payment.available,false);
    const rfq=await market.createRfq(buyer,requirement(pin));const quote=await market.createQuote(seller,rfq.id,{listingId:'l-tomato',price:31,quantity:1,validUntil:new Date(Date.now()+86400000).toISOString(),notes:''});
    const accepted=await market.acceptQuote(buyer,quote.id,`national-quote-${pin}`);assert.equal(accepted.orders[0]!.pin,pin);assert.equal(accepted.orders[0]!.status,'pending_payment');
  }
});
test('checkout and RFQ reject disabled or invalid PINs before reserving inventory',async()=>{
  const market=new Marketplace(undefined,undefined,new DevelopmentServiceabilityPolicy({mode:'national',deniedPins:['560001']}));
  await assert.rejects(market.checkout(buyer,'denied-checkout',cart('560001')),{code:'UNSERVICEABLE'});
  await assert.rejects(market.createRfq(buyer,requirement('560001')),{code:'UNSERVICEABLE'});
  await assert.rejects(market.checkout(buyer,'invalid-checkout',cart('012345')),{code:'INVALID_PIN'});
  await assert.rejects(market.createRfq(buyer,requirement('012345')),{code:'INVALID_PIN'});
  assert.equal(market.listOrders(buyer).length,0);assert.equal(market.catalog().find(row=>row.id==='l-tomato')!.availableQuantity,480);
});
test('accepting an unaccepted quote rechecks the current area policy',async()=>{
  let disabled=false;const eligible=new DevelopmentServiceabilityPolicy({mode:'national'});const denied=new DevelopmentServiceabilityPolicy({mode:'national',deniedPins:['560001']});
  const market=new Marketplace(undefined,undefined,{evaluate:pin=>(disabled?denied:eligible).evaluate(pin)});
  const rfq=await market.createRfq(buyer,requirement('560001'));const quote=await market.createQuote(seller,rfq.id,{listingId:'l-tomato',price:30,quantity:1,validUntil:new Date(Date.now()+86400000).toISOString(),notes:''});disabled=true;
  await assert.rejects(market.acceptQuote(buyer,quote.id,'rechecked-quote-key'),{code:'UNSERVICEABLE'});assert.equal(market.listOrders(buyer).length,0);assert.equal(market.listRfqs(buyer)[0]!.status,'open');
});
