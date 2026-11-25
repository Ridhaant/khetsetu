import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { unlinkSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { handlePilot } from '../pilot.mjs';
import { SqliteD1 } from './sqlite-d1.mjs';

const ORIGIN = 'https://khetsetu.test';
const owner = { 'oai-authenticated-user-id': 'owner-site-id', 'oai-authenticated-user-email': 'owner@example.test' };
const today = () => new Date(Date.now() + 19800000).toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() + 19800000 - 86400000).toISOString().slice(0, 10);
function fixture(t, filename) {
  const DB = new SqliteD1(filename).migrate();
  const env = { DB, OPS_ADMIN_EMAIL: 'owner@example.test', RATE_LIMIT_SALT: 'test-only-opaque-secret', SITE_ORIGIN: ORIGIN };
  t.after(() => DB.close());
  return { DB, env };
}
function input(patch = {}) { return { kind: 'buyer', name: 'Pilot Buyer', phone: '9876543210', businessName: 'Pilot Retail', businessType: 'retailer', pin: '400008', produce: 'Tomatoes', quantity: 100, unit: 'kg', grade: 'A', neededBy: today(), frequency: 'weekly', notes: 'Morning delivery', consent: true, website: '', receiptSecret: randomUUID(), ...patch }; }
async function call(env, pathname, { method = 'GET', data, headers = {} } = {}) {
  const request = new Request(`${ORIGIN}${pathname}`, { method, headers: { 'CF-Connecting-IP': '203.0.113.1', ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers }, ...(data !== undefined ? { body: JSON.stringify(data) } : {}) });
  const response = await handlePilot(request, env);
  const body = await response.json();
  return { status: response.status, body, headers: response.headers };
}
async function submit(env, values = input(), key = randomUUID(), extraHeaders = {}) { return { ...(await call(env, '/api/pilot/requests', { method: 'POST', data: values, headers: { 'Idempotency-Key': key, ...extraHeaders } })), values, key }; }
async function update(env, row, status, patch = {}) { return call(env, `/api/pilot/admin/requests/${row.id}`, { method: 'PATCH', data: { version: row.version ?? 1, status, customerUpdate: 'Team is checking availability.', internalNotes: 'Internal qualification note', ...patch }, headers: owner }); }
function quote(row, patch = {}) { return { version: row.version, supplierName: 'Nashik Grower', quantity: 100, unit: 'kg', unitPricePaise: 2000, deliveryPaise: 20000, packingPaise: 5000, feePaise: 1000, grade: 'A', validUntil: today(), notes: 'Grade and weight to be checked on dispatch.', ...patch }; }
async function addQuote(env, row, patch = {}) { return call(env, `/api/pilot/admin/requests/${row.id}/quotes`, { method: 'POST', data: quote(row, patch), headers: owner }); }
async function receipt(env, created, method = 'GET', secret = created.values.receiptSecret) { return call(env, `/api/pilot/receipts/${created.body.id}`, { method, headers: { Authorization: `Bearer ${secret}` } }); }
const count = (DB, table) => DB.sqlite.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;

test('schema migrations are repeatable locally and requests survive a new database connection', async t => {
  const filename = path.join(tmpdir(), `khetsetu-integration-${randomUUID()}.sqlite`);
  const DB = new SqliteD1(filename).migrate();
  const env = { DB, OPS_ADMIN_EMAIL: 'owner@example.test', RATE_LIMIT_SALT: 'test-salt', SITE_ORIGIN: ORIGIN };
  const created = await submit(env);
  assert.equal(created.status, 201);
  DB.close();
  const reopened = new SqliteD1(filename).migrate();
  try {
    const saved = reopened.sqlite.prepare('SELECT * FROM pilot_requests WHERE id = ?').get(created.body.id);
    assert.equal(saved.phone, '9876543210');
    assert.equal(saved.status, 'new');
    assert.match(saved.receipt_hash, /^[a-f0-9]{64}$/);
    assert.notEqual(saved.receipt_hash, created.values.receiptSecret);
  } finally { reopened.close(); unlinkSync(filename); }
});

test('buyer submission normalizes phone, returns a reference and captures operational consent', async t => {
  const { DB, env } = fixture(t);
  const created = await submit(env, input({ phone: '+91 98765 43210' }));
  assert.equal(created.status, 201);
  assert.match(created.body.reference, /^KS-[A-F0-9]{12}$/);
  assert.equal(created.body.status, 'new');
  assert.match(created.body.message, /not a confirmed order/i);
  assert.equal(created.headers.get('Cache-Control'), 'no-store');
  const stored = DB.sqlite.prepare('SELECT * FROM pilot_requests').get();
  assert.equal(stored.phone, '9876543210');
  assert.equal(stored.consent_version, 'pilot-2026-11-v1');
  assert.equal(count(DB, 'pilot_audit'), 1);
});

test('farmer availability preserves the pickup PIN for feasibility review', async t => {
  const { env } = fixture(t);
  const created = await submit(env, input({ kind: 'farmer', businessType: 'farmer', pin: '422001', produce: 'Onions' }));
  assert.equal(created.status, 201);
  const tracked = await receipt(env, created);
  assert.equal(tracked.body.kind, 'farmer');
  assert.equal(tracked.body.pin, '422001');
});

test('India-wide buyer requests preserve each delivery PIN in tracking and operations', async t => {
  const { DB, env } = fixture(t);
  const configuration = await call(env, '/api/pilot/config');
  assert.equal(configuration.status, 200);
  assert.equal(configuration.body.intakeCountry, 'IN');
  assert.equal(configuration.body.pinValidation, 'format-only');
  assert.equal(configuration.body.fulfilment, 'manual-review');

  const pins = ['110001', '194101', '400008', '560001', '700001', '744101', '793001'];
  for (const pin of pins) {
    const created = await submit(env, input({ pin }));
    assert.equal(created.status, 201, pin);
    assert.equal(created.body.status, 'new');
    const tracked = await receipt(env, created);
    assert.equal(tracked.body.pin, pin);
    assert.equal(tracked.body.status, 'new');
    assert.deepEqual(tracked.body.quotes, []);
  }

  const inbox = await call(env, '/api/pilot/admin/requests', { headers: owner });
  assert.equal(inbox.status, 200);
  assert.deepEqual(inbox.body.requests.map(row => row.pin).sort(), pins);
  assert.equal(count(DB, 'pilot_quotes'), 0);
});

test('identical retries are idempotent and changed payloads cannot reuse the key', async t => {
  const { DB, env } = fixture(t);
  const values = input(); const key = randomUUID();
  const created = await submit(env, values, key);
  const retry = await submit(env, values, key);
  assert.equal(retry.status, 200);
  assert.equal(retry.body.id, created.body.id);
  const conflict = await submit(env, { ...values, quantity: 200 }, key);
  assert.equal(conflict.status, 409);
  assert.equal(conflict.body.error.code, 'IDEMPOTENCY_CONFLICT');
  assert.equal(count(DB, 'pilot_requests'), 1);
  assert.equal(count(DB, 'pilot_audit'), 1);
});

test('simultaneous identical submissions create only one durable request and audit entry', async t => {
  const { DB, env } = fixture(t);
  const values = input(); const key = randomUUID();
  const results = await Promise.all([submit(env, values, key), submit(env, values, key)]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 201]);
  assert.equal(results[0].body.id, results[1].body.id);
  assert.equal(count(DB, 'pilot_requests'), 1);
  assert.equal(count(DB, 'pilot_audit'), 1);
});

test('PIN format, consent, phone, dates, quantity and honeypot are validated', async t => {
  const { DB, env } = fixture(t);
  for (const [patch, code] of [[{ pin: '000008' }, 'INVALID_PIN'], [{ pin: '40008' }, 'INVALID_PIN'], [{ pin: '4000081' }, 'INVALID_PIN'], [{ pin: '4A0008' }, 'INVALID_PIN'], [{ kind: 'farmer', businessType: 'farmer', pin: '012345' }, 'INVALID_PIN'], [{ consent: false }, 'CONSENT_REQUIRED'], [{ phone: '1234567890' }, 'INVALID_PHONE'], [{ neededBy: yesterday() }, 'INVALID_DATE'], [{ neededBy: '2026-02-30' }, 'INVALID_DATE'], [{ quantity: 0 }, 'INVALID_QUANTITY'], [{ quantity: 0.0001 }, 'INVALID_QUANTITY'], [{ website: 'spam.example' }, 'INVALID_SUBMISSION'], [{ businessType: 'farmer' }, 'INVALID_FIELD']]) {
    const response = await submit(env, input(patch));
    assert.equal(response.status, 422, JSON.stringify(patch));
    assert.equal(response.body.error.code, code);
  }
  assert.equal(count(DB, 'pilot_requests'), 0);
});

test('JSON validation rejects malformed, wrong content type and oversized submissions', async t => {
  const { env } = fixture(t);
  for (const [content, contentType, expected] of [['{', 'application/json', 400], ['{}', 'text/plain', 415], [' '.repeat(17000), 'application/json', 413]]) {
    const response = await handlePilot(new Request(`${ORIGIN}/api/pilot/requests`, { method: 'POST', headers: { 'Content-Type': contentType }, body: content }), env);
    assert.equal(response.status, expected);
  }
});

test('browser cross-site mutation attempts fail before storage', async t => {
  const { DB, env } = fixture(t);
  const badOrigin = await submit(env, input(), randomUUID(), { Origin: 'https://attacker.test' });
  assert.equal(badOrigin.status, 403);
  const crossSite = await submit(env, input(), randomUUID(), { 'Sec-Fetch-Site': 'cross-site' });
  assert.equal(crossSite.status, 403);
  const sameOrigin = await submit(env, input(), randomUUID(), { Origin: ORIGIN });
  assert.equal(sameOrigin.status, 201);
  assert.equal(count(DB, 'pilot_requests'), 1);
});

test('only an authenticated allowlisted owner may list operational contact details', async t => {
  const { env } = fixture(t); await submit(env);
  assert.equal((await call(env, '/api/pilot/admin/requests')).status, 401);
  const outsider = { 'oai-authenticated-user-id': 'outsider', 'oai-authenticated-user-email': 'other@example.test' };
  assert.equal((await call(env, '/api/pilot/admin/requests', { headers: outsider })).status, 403);
  assert.deepEqual((await call(env, '/api/pilot/session', { headers: outsider })).body, { authenticated: true, admin: false });
  const operations = await call(env, '/api/pilot/admin/requests', { headers: owner });
  assert.equal(operations.status, 200);
  assert.equal(operations.body.requests[0].phone, '9876543210');
  assert.ok(!JSON.stringify(operations.body).includes('receipt_hash'));
  assert.deepEqual((await call(env, '/api/pilot/session', { headers: owner })).body, { authenticated: true, admin: true });
});

test('private receipts require the secret and do not disclose contact or internal notes', async t => {
  const { env } = fixture(t);
  const created = await submit(env);
  assert.equal((await call(env, `/api/pilot/receipts/${created.body.id}`)).status, 401);
  assert.equal((await receipt(env, created, 'GET', randomUUID())).status, 404);
  await update(env, created.body, 'reviewing');
  const tracked = await receipt(env, created);
  assert.equal(tracked.status, 200);
  assert.equal(tracked.body.status, 'reviewing');
  assert.equal(tracked.body.customerUpdate, 'Team is checking availability.');
  for (const forbidden of ['phone', 'name', 'businessName', 'internalNotes', 'notes', 'receiptSecret', 'receipt_hash']) assert.ok(!(forbidden in tracked.body), forbidden);
});

test('status changes reject skips and stale versions; buyer confirmation requires a quote', async t => {
  const { env } = fixture(t);
  const created = await submit(env);
  assert.equal((await update(env, created.body, 'fulfilled')).status, 409);
  const reviewing = await update(env, created.body, 'reviewing');
  assert.equal(reviewing.status, 200);
  assert.equal(reviewing.body.version, 2);
  assert.equal((await update(env, created.body, 'cancelled')).body.error.code, 'VERSION_CONFLICT');
  assert.equal((await update(env, reviewing.body, 'confirmed')).body.error.code, 'QUOTE_REQUIRED');
  assert.equal((await update(env, reviewing.body, 'quoted')).body.error.code, 'QUOTE_REQUIRED');
});

test('landed quotes use integer paise, include charges, and can be confirmed then fulfilled', async t => {
  const { DB, env } = fixture(t);
  const created = await submit(env); const reviewing = await update(env, created.body, 'reviewing');
  const first = await addQuote(env, reviewing.body);
  assert.equal(first.status, 200);
  assert.equal(first.body.status, 'quoted');
  assert.equal(first.body.quotes[0].totalPaise, 226000);
  const second = await addQuote(env, first.body, { supplierName: 'Pune Grower', unitPricePaise: 2100, deliveryPaise: 0, packingPaise: 0, feePaise: 0 });
  assert.equal(second.status, 200);
  assert.equal(second.body.quotes[0].supplierName, 'Pune Grower');
  assert.equal(second.body.quotes[0].totalPaise, 210000);
  const accepted = await call(env, `/api/pilot/admin/requests/${created.body.id}/select-quote`, { method: 'POST', data: { version: second.body.version, quoteId: second.body.quotes[0].id }, headers: owner });
  assert.equal(accepted.status, 200);
  assert.equal(accepted.body.status, 'confirmed');
  assert.equal(accepted.body.selectedQuoteId, second.body.quotes[0].id);
  const completed = await update(env, accepted.body, 'fulfilled', { customerUpdate: 'Delivery completed after manual confirmation.' });
  assert.equal(completed.status, 200);
  assert.equal((await receipt(env, created)).body.status, 'fulfilled');
  assert.equal((await update(env, completed.body, 'new')).status, 409);
  assert.equal(count(DB, 'pilot_quotes'), 2);
  assert.equal(count(DB, 'pilot_audit'), 6);
});

test('quotes reject invalid amounts, mismatched units or quantities, expiry and wrong-request selection', async t => {
  const { env } = fixture(t);
  const created = await submit(env); const reviewing = await update(env, created.body, 'reviewing');
  for (const patch of [{ quantity: 50 }, { unit: 'crate' }, { unitPricePaise: -1 }, { deliveryPaise: 1.5 }, { validUntil: yesterday() }]) assert.equal((await addQuote(env, reviewing.body, patch)).status, 422);
  const quoted = await addQuote(env, reviewing.body);
  const other = await submit(env); const otherReviewing = await update(env, other.body, 'reviewing');
  const badSelection = await call(env, `/api/pilot/admin/requests/${other.body.id}/select-quote`, { method: 'POST', data: { version: otherReviewing.body.version, quoteId: quoted.body.quotes[0].id }, headers: owner });
  assert.equal(badSelection.status, 422);
});

test('a supplier quote that expires after creation cannot be confirmed', async t => {
  const { DB, env } = fixture(t);
  const created = await submit(env); const reviewing = await update(env, created.body, 'reviewing');
  const quoted = await addQuote(env, reviewing.body); const quoteId = quoted.body.quotes[0].id;
  DB.sqlite.prepare('UPDATE pilot_quotes SET valid_until = ? WHERE id = ?').run(yesterday(), quoteId);
  const selection = await call(env, `/api/pilot/admin/requests/${created.body.id}/select-quote`, { method: 'POST', data: { version: quoted.body.version, quoteId }, headers: owner });
  assert.equal(selection.status, 422);
  assert.equal(selection.body.error.code, 'QUOTE_EXPIRED');
  assert.equal(DB.sqlite.prepare('SELECT status FROM pilot_requests WHERE id = ?').get(created.body.id).status, 'quoted');
});

test('concurrent operator versions produce one quote and one corresponding audit event', async t => {
  const { DB, env } = fixture(t);
  const created = await submit(env); const reviewing = await update(env, created.body, 'reviewing');
  const responses = await Promise.all([addQuote(env, reviewing.body), addQuote(env, reviewing.body, { supplierName: 'Concurrent Grower' })]);
  assert.deepEqual(responses.map(r => r.status).sort(), [200, 409]);
  assert.equal(count(DB, 'pilot_quotes'), 1);
  assert.equal(count(DB, 'pilot_audit'), 3);
});

test('withdrawal erases contact data and supplier quotes and blocks further operational changes', async t => {
  const { DB, env } = fixture(t);
  const created = await submit(env); const reviewing = await update(env, created.body, 'reviewing');
  await addQuote(env, reviewing.body);
  const withdrawn = await receipt(env, created, 'DELETE');
  assert.equal(withdrawn.status, 200);
  assert.equal(withdrawn.body.status, 'withdrawn');
  const stored = DB.sqlite.prepare('SELECT * FROM pilot_requests WHERE id = ?').get(created.body.id);
  for (const field of ['name', 'phone', 'business_name', 'notes', 'internal_notes']) assert.equal(stored[field], '', field);
  assert.equal(count(DB, 'pilot_quotes'), 0);
  const tracked = await receipt(env, created);
  assert.equal(tracked.body.status, 'withdrawn');
  assert.equal((await update(env, tracked.body, 'reviewing')).status, 409);
});

test('per-IP rate limiting permits fifteen new submissions but identical retries remain usable', async t => {
  const { DB, env } = fixture(t);
  let first;
  for (let i = 0; i < 15; i++) { const created = await submit(env, input({ businessName: `Retail ${i}` })); assert.equal(created.status, 201); first ??= created; }
  const limited = await submit(env);
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('Retry-After'), '3600');
  assert.equal((await submit(env, first.values, first.key)).status, 200);
  assert.equal(count(DB, 'pilot_requests'), 15);
  assert.equal(count(DB, 'pilot_rate_limits'), 1);
  assert.ok(!JSON.stringify(DB.sqlite.prepare('SELECT * FROM pilot_rate_limits').get()).includes('203.0.113.1'));
});

test('retention cleanup anonymizes requests older than ninety days and removes quotes and receipt access', async t => {
  const { DB, env } = fixture(t);
  const created = await submit(env); const reviewing = await update(env, created.body, 'reviewing');
  await addQuote(env, reviewing.body);
  DB.sqlite.prepare('UPDATE pilot_requests SET created_at = ? WHERE id = ?').run(Date.now() - 91 * 86400000, created.body.id);
  assert.equal((await receipt(env, created)).status, 404);
  const stored = DB.sqlite.prepare('SELECT * FROM pilot_requests WHERE id = ?').get(created.body.id);
  assert.equal(stored.status, 'expired');
  for (const field of ['name', 'phone', 'business_name', 'notes', 'internal_notes', 'receipt_hash', 'request_hash']) assert.equal(stored[field], '', field);
  assert.equal(count(DB, 'pilot_quotes'), 0);
});

test('missing durable storage or rate-limit configuration fails closed without accepting a request', async t => {
  const { DB, env } = fixture(t);
  const noStorage = await submit({ ...env, DB: undefined });
  assert.equal(noStorage.status, 503);
  assert.equal(noStorage.body.error.code, 'STORAGE_UNAVAILABLE');
  const noSalt = await submit({ ...env, RATE_LIMIT_SALT: undefined });
  assert.equal(noSalt.status, 503);
  assert.equal(noSalt.body.error.code, 'CONFIGURATION_REQUIRED');
  assert.equal(count(DB, 'pilot_requests'), 0);
});
