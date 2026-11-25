import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEmailInquiryUrl,
  buildWhatsappInquiryUrl,
  createStaticPilotStore,
  indiaToday,
  loadStoredReceipts,
  saveStoredReceipt,
} from '../src/pilotStore.mjs';

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

const FIXED_NOW = Date.parse('2026-11-25T10:00:00.000Z');
const today = indiaToday(FIXED_NOW);

function basePayload(overrides = {}) {
  return {
    kind: 'buyer',
    name: 'Asha Kirana',
    phone: '+91 98765 43210',
    businessName: 'Asha Provision Store',
    businessType: 'retailer',
    pin: '560001',
    produce: 'Tomatoes, hybrid',
    quantity: 100,
    unit: 'kg',
    grade: 'A',
    neededBy: today,
    frequency: 'weekly',
    notes: 'Morning slot preferred',
    website: '',
    consent: true,
    receiptSecret: 'secret-token-1234567890-abcdef',
    ...overrides,
  };
}

test('static store validates PIN, phone, consent, honeypot, and saves idempotent requests', () => {
  const storage = memoryStorage();
  const store = createStaticPilotStore(storage, () => FIXED_NOW);
  const key = 'idem-key-1234567890-abcdef';

  assert.throws(() => store.submit(basePayload({ pin: '012345' }), key), /PIN code/);
  assert.throws(() => store.submit(basePayload({ phone: '1234567890' }), key), /mobile number/);
  assert.throws(() => store.submit(basePayload({ consent: false }), key), /Consent/);
  assert.throws(() => store.submit(basePayload({ website: 'spam.example' }), key), /website/);

  const first = store.submit(basePayload(), key);
  assert.match(first.reference, /^KS-[A-F0-9]{12}$/);
  assert.equal(first.status, 'new');

  const retry = store.submit(basePayload(), key);
  assert.equal(retry.id, first.id);

  assert.throws(
    () => store.submit(basePayload({ quantity: 250 }), key),
    /different request/,
  );
});

test('static store enforces private receipt secrets, hides contact fields, and clears on withdrawal', () => {
  const storage = memoryStorage();
  const store = createStaticPilotStore(storage, () => FIXED_NOW);
  const payload = basePayload();
  const created = store.submit(payload, 'idem-key-receipt-test-123456');

  assert.throws(() => store.getReceipt(created.id, 'wrong-secret-token-value'), /not found/);

  const receipt = store.getReceipt(created.id, payload.receiptSecret);
  assert.equal(receipt.reference, created.reference);
  assert.equal(receipt.pin, '560001');
  assert.equal('phone' in receipt, false);
  assert.equal('name' in receipt, false);
  assert.equal('internalNotes' in receipt, false);

  const withdrawn = store.withdrawReceipt(created.id, payload.receiptSecret);
  assert.equal(withdrawn.status, 'withdrawn');

  const adminList = store.listAdminRequests().requests;
  const savedRow = adminList.find((row) => row.id === created.id);
  assert.equal(savedRow.phone, '');
  assert.equal(savedRow.name, '');
  assert.equal(savedRow.status, 'withdrawn');
});

test('static operations supports status flow, integer-paise quotes, and quote confirmation', () => {
  const storage = memoryStorage();
  const store = createStaticPilotStore(storage, () => FIXED_NOW);
  const created = store.submit(basePayload(), 'idem-key-ops-flow-1234567890');

  assert.throws(
    () => store.updateAdminRequest(created.id, { version: 1, status: 'fulfilled' }),
    /not allowed/,
  );

  const reviewing = store.updateAdminRequest(created.id, {
    version: 1,
    status: 'reviewing',
    customerUpdate: 'Checking Nashik availability',
    internalNotes: 'Called farmer group',
  });
  assert.equal(reviewing.version, 2);

  assert.throws(
    () => store.updateAdminRequest(created.id, { version: 1, status: 'cancelled' }),
    /Refresh operations/,
  );

  const quoted = store.addAdminQuote(created.id, {
    version: 2,
    supplierName: 'Nashik FPO',
    quantity: 100,
    unit: 'kg',
    unitPricePaise: 2200,
    deliveryPaise: 15000,
    packingPaise: 3000,
    feePaise: 0,
    grade: 'A',
    validUntil: today,
    notes: 'Crates included',
  });
  assert.equal(quoted.status, 'quoted');
  assert.equal(quoted.quotes[0].totalPaise, 238000);

  const confirmed = store.selectAdminQuote(created.id, {
    version: quoted.version,
    quoteId: quoted.quotes[0].id,
  });
  assert.equal(confirmed.status, 'confirmed');
  assert.equal(confirmed.selectedQuoteId, quoted.quotes[0].id);
});

test('receipt storage helpers and WhatsApp/Email handoff URLs format cleanly', () => {
  const storage = memoryStorage();
  const r1 = { id: '1', reference: 'KS-111', secret: 's1' };
  const list = saveStoredReceipt(r1, [], storage);
  assert.deepEqual(loadStoredReceipts(storage), [r1]);
  assert.equal(list.length, 1);

  const wa = buildWhatsappInquiryUrl({
    reference: 'KS-111',
    kind: 'buyer',
    produce: 'Tomatoes',
    quantity: '100',
    unit: 'kg',
    grade: 'A',
    pin: '560001',
    neededBy: today,
    name: 'Asha',
    phone: '9876543210',
  });
  assert.match(wa, /^https:\/\/wa\.me\/917021610641\?text=/);
  assert.match(decodeURIComponent(wa), /KS-111/);

  const mail = buildEmailInquiryUrl({
    reference: 'KS-111',
    kind: 'farmer',
    produce: 'Onions',
    quantity: '500',
    unit: 'kg',
    grade: 'A',
    pin: '422001',
    neededBy: today,
    name: 'Ramesh',
    phone: '9876543210',
  });
  assert.match(mail, /^mailto:redantthakur@gmail\.com\?subject=/);
  assert.match(decodeURIComponent(mail), /Onions/);
});
