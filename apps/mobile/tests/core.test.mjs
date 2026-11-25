import test from 'node:test';
import assert from 'node:assert/strict';
import { demoPinEligible, groupCart, updateCart, parseSavedCart, serviceablePin, validPin } from '../src/core.ts';
const tomato = { id: 'tomato', sellerId: 'farm-a', sellerName: 'Farm A', title: 'Tomato', price: 30, minimumQuantity: 2, availableQuantity: 100, unit: 'kg', tiers: [{ minimumQuantity: 20, price: 25 }] };
const spinach = { ...tomato, id: 'spinach', title: 'Spinach', sellerId: 'farm-b', sellerName: 'Farm B', price: 40, tiers: [] };
test('multi-seller basket keeps independently priced seller groups and bulk tiers', () => {
  let cart = updateCart([], tomato, 20);
  cart = updateCart(cart, spinach, 2);
  const groups = groupCart(cart, [tomato, spinach]);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].subtotal, 500);
  assert.equal(groups[1].subtotal, 80);
});
test('MOQ and stale stock cannot be quietly accepted', () => {
  assert.throws(() => updateCart([], tomato, 1), /Minimum/);
  assert.throws(() => updateCart([], tomato, 101), /Only/);
  assert.throws(() => groupCart([{ listingId: 'tomato', quantity: 101 }], [tomato]), /no longer available/);
  assert.throws(() => groupCart([{ listingId: 'deleted', quantity: 2 }], [tomato]), /unavailable/);
});
test('corrupt offline storage does not crash startup or inject invalid quantities', () => {
  assert.deepEqual(parseSavedCart('{bad'), []);
  assert.deepEqual(parseSavedCart('[{"listingId":"tomato","quantity":-1},{"listingId":"spinach","quantity":2}]'), [{ listingId: 'spinach', quantity: 2 }]);
});
test('India-wide demo eligibility accepts regional PIN formats and rejects malformed locations', () => {
  for (const pin of ['110001', '400008', '411001', '560001', '600001', '700001', '781001', '834001', '999999']) {
    assert.equal(validPin(pin), true);
    assert.equal(demoPinEligible(pin), true);
  }
  for (const pin of ['', '012345', '12345', '1234567', '40000x', ' 400008', '400008 ']) {
    assert.equal(validPin(pin), false);
    assert.equal(demoPinEligible(pin), false);
  }
});
test('server eligibility is authoritative and a stale or unavailable check cannot enable checkout', () => {
  assert.equal(serviceablePin('110001'), false);
  assert.equal(serviceablePin('110001', { pin: '110001', serviceable: true }), true);
  assert.equal(serviceablePin('110001', { pin: '110001', serviceable: false }), false);
  assert.equal(serviceablePin('110001', { pin: '400008', serviceable: true }), false);
  assert.equal(serviceablePin('012345', { pin: '012345', serviceable: true }), false);
  assert.equal(serviceablePin('110001', null), false);
});
