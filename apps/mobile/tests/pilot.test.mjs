import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyForm, formFingerprint, indiaDate, normalizedForm, parseSavedReceipts, pilotFetch, prepareAttempt, validatePilotForm } from '../src/pilot.ts';

const today = indiaDate();
const valid = () => ({ ...emptyForm(), name: 'Pilot Buyer', phone: '+91 98765 43210', businessName: 'Pilot Shop', pin: '400008', produce: 'Tomato', quantity: '100', neededBy: today, consent: true });
const credentials = { idempotencyKey: 'f0843130-e7dc-4759-bc1d-fd3d16ac0b42', receiptSecret: '881759d2-3372-41b4-8fae-f2bd5d867dda' };

test('India-wide buyer and farmer requests retain consent, quantity and calendar boundaries', () => {
  assert.equal(emptyForm().pin, '');
  assert.deepEqual(validatePilotForm(valid()), {});
  for (const pin of ['110001', '560001', '600001', '700001', '781001', '834001']) assert.deepEqual(validatePilotForm({ ...valid(), pin }), {});
  for (const pin of ['', '012345', '12345', '1234567', '40000x']) assert.equal(validatePilotForm({ ...valid(), pin }).pin, 'pin');
  assert.deepEqual(validatePilotForm({ ...valid(), kind: 'farmer', businessType: 'farmer', pin: '422001' }), {});
  assert.equal(validatePilotForm({ ...valid(), consent: false }).consent, 'consent');
  for (const quantity of ['0', '-1', 'NaN', 'Infinity', '0.0001', '1000001']) assert.equal(validatePilotForm({ ...valid(), quantity }).quantity, 'quantity');
  assert.equal(validatePilotForm({ ...valid(), neededBy: '2027-02-30' }, '2027-02-01').neededBy, 'neededBy');
  assert.equal(validatePilotForm({ ...valid(), neededBy: '2027-09-01' }, '2027-02-01').neededBy, 'neededBy');
  assert.equal(validatePilotForm({ ...valid(), neededBy: '2027-02-01' }, '2027-02-02').neededBy, 'neededBy');
  assert.deepEqual(validatePilotForm({ ...valid(), businessName: '' }), {});
});

test('retry preserves the exact body and idempotency key; an edited request has another fingerprint', () => {
  const attempt = prepareAttempt(valid(), credentials);
  assert.equal(attempt.idempotencyKey, credentials.idempotencyKey);
  assert.equal(attempt.body.receiptSecret, credentials.receiptSecret);
  assert.equal(attempt.fingerprint, formFingerprint({ ...valid(), name: ' Pilot Buyer ', quantity: '100.000' }));
  assert.notEqual(attempt.fingerprint, formFingerprint({ ...valid(), quantity: '200' }));
  const national = prepareAttempt({ ...valid(), pin: '600001' }, credentials);
  assert.equal(national.body.pin, '600001');
  assert.notEqual(attempt.fingerprint, national.fingerprint);
  assert.equal(normalizedForm(valid()).phone, '+919876543210');
  assert.throws(() => prepareAttempt(valid(), { idempotencyKey: 'weak', receiptSecret: 'weak' }), /credentials/);
});

test('saved receipt parsing excludes contact data and recovers from corrupt storage', () => {
  const stored = { id: credentials.idempotencyKey, reference: 'KS-ABCD1234EF56', secret: credentials.receiptSecret, phone: '9876543210', name: 'Do not save', notes: 'Private contact detail' };
  assert.deepEqual(parseSavedReceipts(JSON.stringify([stored])), [{ id: stored.id, reference: stored.reference, secret: stored.secret }]);
  assert.deepEqual(parseSavedReceipts('{bad'), []);
  assert.deepEqual(parseSavedReceipts('{"id":"x"}'), []);
  assert.deepEqual(parseSavedReceipts('[null,12,{"id":"x"}]'), []);
});

test('native HTTP errors are honest and a network retry sends identical credentials/body', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  const attempt = prepareAttempt(valid(), credentials);
  const options = { method: 'POST', headers: { 'Idempotency-Key': attempt.idempotencyKey }, body: JSON.stringify(attempt.body) };
  try {
    globalThis.fetch = async (url, init) => { calls.push({ url, headers: init.headers, body: init.body }); if (calls.length === 1) throw new TypeError('Network unavailable'); return new Response(JSON.stringify({ id: 'saved', status: 'new' }), { status: 201 }); };
    await assert.rejects(pilotFetch('https://pilot.example', '/api/pilot/requests', options), /Network unavailable/);
    assert.deepEqual(await pilotFetch('https://pilot.example', '/api/pilot/requests', options), { id: 'saved', status: 'new' });
    assert.deepEqual(calls[0], calls[1]);
    globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: 'Outside service area' } }), { status: 422 });
    await assert.rejects(pilotFetch('https://pilot.example', '/api/pilot/requests', options), /Outside service area/);
    await assert.rejects(pilotFetch('http://public.example', '/api/pilot/requests', options), /HTTPS/);
  } finally { globalThis.fetch = originalFetch; }
});
