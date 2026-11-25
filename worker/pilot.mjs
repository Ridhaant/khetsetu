const INDIAN_PIN_PATTERN = /^[1-9][0-9]{5}$/;
const units = ['kg', 'quintal', 'tonne', 'crate', 'box'];
const grades = ['A', 'B', 'mixed'];
const statuses = ['new', 'reviewing', 'quoted', 'confirmed', 'fulfilled', 'cancelled'];
const transitions = { new: ['reviewing', 'cancelled'], reviewing: ['quoted', 'confirmed', 'cancelled'], quoted: ['reviewing', 'confirmed', 'cancelled'], confirmed: ['fulfilled', 'cancelled'], fulfilled: [], cancelled: [], withdrawn: [], expired: [] };
const retentionMs = 90 * 86400000;
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
class Problem extends Error { constructor(status, code, message) { super(message); this.status = status; this.code = code; } }
const fail = (status, code, message) => { throw new Problem(status, code, message); };
function text(value, name, max, min = 0) {
  if (typeof value !== 'string') fail(422, 'INVALID_FIELD', `${name} is required.`);
  const result = value.trim();
  if (result.length < min || result.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(result)) fail(422, 'INVALID_FIELD', `Check ${name} (${min}–${max} characters).`);
  return result;
}
function choice(value, options, name) { if (!options.includes(value)) fail(422, 'INVALID_FIELD', `Choose a valid ${name}.`); return value; }
function quantity(value) { if (typeof value !== 'number' || !Number.isFinite(value) || value < 0.001 || value > 1000000 || Math.abs(value * 1000 - Math.round(value * 1000)) > 0.000001) fail(422, 'INVALID_QUANTITY', 'Quantity must be positive, at most 1,000,000 and use up to three decimal places.'); return value; }
function integer(value, name, max = 100000000) { if (!Number.isSafeInteger(value) || value < 0 || value > max) fail(422, 'INVALID_FIELD', `Check ${name}.`); return value; }
const indiaToday = (now = Date.now()) => new Date(now + 19800000).toISOString().slice(0, 10);
function date(value, name, now = Date.now()) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value || value < indiaToday(now) || value > indiaToday(now + 180 * 86400000)) fail(422, 'INVALID_DATE', `${name} must be a valid date from today through the next 180 days.`);
  return value;
}
async function digest(value) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(v => v.toString(16).padStart(2, '0')).join(''); }
const isSecret = value => typeof value === 'string' && /^[A-Za-z0-9_-]{24,128}$/.test(value);
async function body(request) {
  if (!(request.headers.get('Content-Type') ?? '').toLowerCase().startsWith('application/json')) fail(415, 'JSON_REQUIRED', 'Send JSON content.');
  if (!request.body) fail(400, 'INVALID_JSON', 'A request body is required.');
  const reader = request.body.getReader(); const chunks = []; let size = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 16384) { await reader.cancel(); fail(413, 'TOO_LARGE', 'Keep requests below 16 KB.'); } chunks.push(value); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  let result; try { result = JSON.parse(new TextDecoder().decode(bytes)); } catch { fail(400, 'INVALID_JSON', 'Send valid JSON.'); }
  if (!result || typeof result !== 'object' || Array.isArray(result)) fail(400, 'INVALID_JSON', 'Send a JSON object.');
  return result;
}
function validateSubmission(input, now) {
  if (input.website) fail(422, 'INVALID_SUBMISSION', 'Please leave the website field empty.');
  const kind = choice(input.kind, ['buyer', 'farmer'], 'request type');
  const pin = typeof input.pin === 'string' ? input.pin.trim() : '';
  if (!INDIAN_PIN_PATTERN.test(pin)) fail(422, 'INVALID_PIN', 'Enter a six-digit Indian PIN code starting with 1–9.');
  let phone = text(input.phone, 'mobile number', 20, 10).replace(/[\s()+-]/g, '');
  if (/^91[6-9]\d{9}$/.test(phone)) phone = phone.slice(2);
  if (!/^[6-9]\d{9}$/.test(phone)) fail(422, 'INVALID_PHONE', 'Enter a valid 10-digit Indian mobile number.');
  if (input.consent !== true) fail(422, 'CONSENT_REQUIRED', 'Consent is required so the team can contact you about this request.');
  if (!isSecret(input.receiptSecret)) fail(422, 'INVALID_SECRET', 'Create a new request and try again.');
  const businessType = choice(input.businessType, kind === 'farmer' ? ['farmer', 'fpo', 'other'] : ['retailer', 'wholesaler', 'restaurant', 'caterer', 'other'], 'business type');
  return { kind, name: text(input.name, 'name', 80, 2), phone, businessName: text(input.businessName ?? '', 'business name', 120), businessType, pin, produce: text(input.produce, 'produce', 160, 2), quantity: quantity(input.quantity), unit: choice(input.unit, units, 'unit'), grade: choice(input.grade, grades, 'grade'), neededBy: date(input.neededBy, 'Required date', now), frequency: choice(input.frequency, ['once', 'daily', 'weekly'], 'frequency'), notes: text(input.notes ?? '', 'notes', 2000), consentVersion: 'pilot-2026-11-v1' };
}
function assertOrigin(request, env) {
  const origin = request.headers.get('Origin');
  const own = new URL(request.url).origin;
  if (origin && origin !== own && origin !== env.SITE_ORIGIN) fail(403, 'ORIGIN_DENIED', 'Use KhetSetu directly to submit this request.');
  if (request.headers.get('Sec-Fetch-Site') === 'cross-site') fail(403, 'ORIGIN_DENIED', 'Cross-site requests are not permitted.');
}
function adminIdentity(request, env) {
  const id = request.headers.get('oai-authenticated-user-id');
  const email = request.headers.get('oai-authenticated-user-email')?.toLowerCase();
  return { authenticated: !!id, admin: !!id && !!email && !!env.OPS_ADMIN_EMAIL && email === env.OPS_ADMIN_EMAIL.toLowerCase(), id };
}
function requireAdmin(request, env) { const actor = adminIdentity(request, env); if (!actor.admin) fail(actor.authenticated ? 403 : 401, 'ADMIN_REQUIRED', 'Sign in with the KhetSetu owner account to open operations.'); return actor; }
function db(env) { if (!env.DB) fail(503, 'STORAGE_UNAVAILABLE', 'Request storage is temporarily unavailable. Please try again or contact support.'); return env.DB; }
async function rateLimit(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  if (!env.RATE_LIMIT_SALT) fail(503, 'CONFIGURATION_REQUIRED', 'Request intake is temporarily unavailable. Please contact support.');
  const key = await digest(`${env.RATE_LIMIT_SALT}:${ip}`); const window = Math.floor(Date.now() / 3600000);
  const row = await db(env).prepare('INSERT INTO pilot_rate_limits (key, window, count) VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET window = excluded.window, count = CASE WHEN pilot_rate_limits.window = excluded.window THEN pilot_rate_limits.count + 1 ELSE 1 END RETURNING count').bind(key, window).first();
  if (row.count > 15) fail(429, 'RATE_LIMITED', 'Too many requests. Please try again in an hour or call support.');
}
const quoteView = row => ({ id: row.id, supplierName: row.supplier_name, quantity: row.quantity, unit: row.unit, unitPricePaise: row.unit_price_paise, deliveryPaise: row.delivery_paise, packingPaise: row.packing_paise, feePaise: row.fee_paise, totalPaise: row.total_paise, grade: row.grade, validUntil: row.valid_until, notes: row.notes });
function requestView(row, quotes = [], privateFields = false) {
  const data = { id: row.id, reference: row.reference, kind: row.kind, produce: row.produce, quantity: row.quantity, unit: row.unit, grade: row.grade, pin: row.pin, status: row.status, neededBy: row.needed_by, frequency: row.frequency, createdAt: row.created_at, updatedAt: row.updated_at, customerUpdate: row.customer_update, selectedQuoteId: row.selected_quote_id, version: row.version, quotes };
  if (privateFields) Object.assign(data, { name: row.name, phone: row.phone, businessName: row.business_name, businessType: row.business_type, notes: row.notes, internalNotes: row.internal_notes });
  return data;
}
async function quotesFor(database, id) { return (await database.prepare('SELECT * FROM pilot_quotes WHERE request_id = ? ORDER BY total_paise, created_at').bind(id).all()).results.map(quoteView); }
async function findRequest(database, id) { const row = await database.prepare('SELECT * FROM pilot_requests WHERE id = ?').bind(id).first(); if (!row) fail(404, 'NOT_FOUND', 'This request was not found.'); return row; }
function version(input, row) { if (!Number.isSafeInteger(input.version) || input.version !== row.version) fail(409, 'VERSION_CONFLICT', 'This request changed. Refresh operations before saving.'); }
function quoteInput(input, row, now) {
  const q = quantity(input.quantity); const unit = choice(input.unit, units, 'unit');
  if (q !== row.quantity || unit !== row.unit) fail(422, 'QUOTE_QUANTITY_MISMATCH', 'Quote the full requested quantity in the same unit.');
  const unitPricePaise = integer(input.unitPricePaise, 'unit price'); if (unitPricePaise < 1) fail(422, 'INVALID_PRICE', 'Unit price must be positive.');
  const deliveryPaise = integer(input.deliveryPaise, 'delivery charge'), packingPaise = integer(input.packingPaise, 'packing charge'), feePaise = integer(input.feePaise, 'fee');
  const totalPaise = Math.round(q * unitPricePaise) + deliveryPaise + packingPaise + feePaise;
  if (!Number.isSafeInteger(totalPaise) || totalPaise > 50000000) fail(422, 'QUOTE_VALUE_LIMIT', 'Pilot quotes support totals up to ₹5,00,000.');
  return { id: crypto.randomUUID(), supplierName: text(input.supplierName, 'supplier name', 120, 2), quantity: q, unit, unitPricePaise, deliveryPaise, packingPaise, feePaise, totalPaise, grade: choice(input.grade, grades, 'grade'), validUntil: date(input.validUntil, 'Quote expiry', now), notes: text(input.notes ?? '', 'quote notes', 1200) };
}
async function expireData(database, now) {
  // Only form data and customer-facing supplier quotes are retained; no raw IPs are stored.
  await database.batch([
    database.prepare("UPDATE pilot_requests SET name = '', phone = '', business_name = '', notes = '', internal_notes = '', customer_update = '', produce = 'Expired request', receipt_hash = '', request_hash = '', status = 'expired', updated_at = ?, version = version + 1 WHERE created_at < ? AND status NOT IN ('expired', 'withdrawn')").bind(now, now - retentionMs),
    database.prepare("DELETE FROM pilot_quotes WHERE request_id IN (SELECT id FROM pilot_requests WHERE status IN ('expired', 'withdrawn'))"),
    database.prepare('DELETE FROM pilot_rate_limits WHERE window < ?').bind(Math.floor(now / 3600000) - 24),
  ]);
}
async function receiptAuth(request, database, id) {
  const secret = request.headers.get('Authorization')?.replace(/^Bearer /, '');
  if (!isSecret(secret)) fail(401, 'RECEIPT_REQUIRED', 'Open the private request receipt saved on your device.');
  const row = await database.prepare('SELECT * FROM pilot_requests WHERE id = ? AND receipt_hash = ?').bind(id, await digest(secret)).first();
  if (!row) fail(404, 'NOT_FOUND', 'This receipt was not found or has expired. Contact support with your reference.');
  return row;
}
function audit(database, actor, action, id, now) { return database.prepare('INSERT INTO pilot_audit (id, actor_id, action, request_id, created_at) VALUES (?, ?, ?, ?, ?)').bind(crypto.randomUUID(), actor, action, id, now); }
export async function handlePilot(request, env) {
  const url = new URL(request.url); const path = url.pathname; const now = Date.now();
  try {
    if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(request.method)) assertOrigin(request, env);
    if (path === '/api/pilot/config' && request.method === 'GET') {
      return json({
        mode: 'assisted',
        intakeCountry: 'IN',
        pinValidation: 'format-only',
        fulfilment: 'manual-review',
        supportPhone: '+917021610641',
        supportEmail: 'redantthakur@gmail.com',
        retentionDays: 90,
      });
    }
    if (path === '/api/pilot/session' && request.method === 'GET') { const actor = adminIdentity(request, env); return json({ authenticated: actor.authenticated, admin: actor.admin }); }
    if (path === '/api/pilot/new-request' && request.method === 'GET') return json({ idempotencyKey: crypto.randomUUID(), receiptSecret: crypto.randomUUID() });
    const database = db(env);
    if (path === '/api/pilot/health' && request.method === 'GET') {
      await database.prepare('SELECT id FROM pilot_requests LIMIT 1').first();
      return json({ status: 'ok', storage: 'ready', mode: 'assisted' });
    }
    if (path === '/api/pilot/requests' && request.method === 'POST') {
      const input = await body(request); const values = validateSubmission(input, now); const key = request.headers.get('Idempotency-Key');
      if (!isSecret(key)) fail(422, 'IDEMPOTENCY_REQUIRED', 'Create a new submission key and try again.');
      const keyHash = await digest(key); const receiptHash = await digest(input.receiptSecret); const fingerprint = await digest(JSON.stringify({ ...values, receiptHash }));
      const previous = await database.prepare('SELECT id, reference, status, created_at, request_hash FROM pilot_requests WHERE idempotency_hash = ?').bind(keyHash).first();
      if (previous) { if (previous.request_hash !== fingerprint) fail(409, 'IDEMPOTENCY_CONFLICT', 'This submission key belongs to a different request. Start a new request.'); return json({ id: previous.id, reference: previous.reference, status: previous.status, createdAt: previous.created_at, message: 'Your request is saved. The team will contact you to confirm availability, price and delivery.' }); }
      await rateLimit(request, env); await expireData(database, now);
      const id = crypto.randomUUID(), reference = `KS-${id.replaceAll('-', '').slice(0, 12).toUpperCase()}`;
      const result = await database.batch([
        database.prepare("INSERT OR IGNORE INTO pilot_requests (id, reference, idempotency_hash, request_hash, receipt_hash, kind, name, phone, business_name, business_type, pin, produce, quantity, unit, grade, needed_by, frequency, notes, consent_version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, reference, keyHash, fingerprint, receiptHash, values.kind, values.name, values.phone, values.businessName, values.businessType, values.pin, values.produce, values.quantity, values.unit, values.grade, values.neededBy, values.frequency, values.notes, values.consentVersion, now, now),
        database.prepare("INSERT INTO pilot_audit (id, actor_id, action, request_id, created_at) SELECT ?, 'customer', 'request.created', id, ? FROM pilot_requests WHERE id = ?").bind(crypto.randomUUID(), now, id),
      ]);
      if (!result[0].meta.changes) { const existing = await database.prepare('SELECT * FROM pilot_requests WHERE idempotency_hash = ?').bind(keyHash).first(); if (!existing || existing.request_hash !== fingerprint) fail(409, 'IDEMPOTENCY_CONFLICT', 'This submission key belongs to a different request.'); return json({ id: existing.id, reference: existing.reference, status: existing.status, createdAt: existing.created_at, message: 'Your request is saved.' }); }
      return json({ id, reference, status: 'new', createdAt: now, message: 'Your request is saved. The team will contact you to confirm availability, price and delivery. This is not a confirmed order.' }, 201);
    }
    const receiptMatch = path.match(/^\/api\/pilot\/receipts\/([a-f0-9-]{36})$/);
    if (receiptMatch && ['GET', 'DELETE'].includes(request.method)) {
      await expireData(database, now); const row = await receiptAuth(request, database, receiptMatch[1]);
      if (request.method === 'GET') return json(requestView(row, await quotesFor(database, row.id)));
      await database.batch([
        database.prepare("UPDATE pilot_requests SET name = '', phone = '', business_name = '', notes = '', internal_notes = '', customer_update = 'Request withdrawn and contact details removed.', produce = 'Withdrawn request', request_hash = '', selected_quote_id = NULL, status = 'withdrawn', updated_at = ?, version = version + 1 WHERE id = ?").bind(now, row.id),
        database.prepare('DELETE FROM pilot_quotes WHERE request_id = ?').bind(row.id), audit(database, 'customer', 'request.withdrawn', row.id, now),
      ]);
      return json({ id: row.id, reference: row.reference, status: 'withdrawn', message: 'Your contact details and quotes have been removed. Call support if a delivery has already been arranged.' });
    }
    if (path.startsWith('/api/pilot/admin/')) {
      const actor = requireAdmin(request, env); await expireData(database, now);
      if (path === '/api/pilot/admin/requests' && request.method === 'GET') {
        const rows = (await database.prepare('SELECT * FROM pilot_requests ORDER BY created_at DESC LIMIT 500').all()).results;
        const quotes = (await database.prepare('SELECT * FROM pilot_quotes ORDER BY total_paise, created_at').all()).results;
        return json({ requests: rows.map(row => requestView(row, quotes.filter(q => q.request_id === row.id).map(quoteView), true)) });
      }
      const match = path.match(/^\/api\/pilot\/admin\/requests\/([a-f0-9-]{36})(?:\/(quotes|select-quote))?$/);
      if (match && ((request.method === 'PATCH' && !match[2]) || (request.method === 'POST' && match[2]))) {
        const row = await findRequest(database, match[1]); const input = await body(request); version(input, row);
        let update, event, extra;
        if (match[2] === 'quotes') {
          if (!['reviewing', 'quoted'].includes(row.status)) fail(409, 'INVALID_STATUS', 'Move this request to reviewing before adding supplier quotes.');
          const quote = quoteInput(input, row, now);
          update = database.prepare("UPDATE pilot_requests SET status = 'quoted', updated_at = ?, version = version + 1 WHERE id = ? AND version = ?").bind(now, row.id, row.version);
          // The insert only runs when this exact version won the update. D1 batch is atomic.
          extra = database.prepare('INSERT INTO pilot_quotes (id, request_id, supplier_name, quantity, unit, unit_price_paise, delivery_paise, packing_paise, fee_paise, total_paise, grade, valid_until, notes, created_at) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE changes() = 1').bind(quote.id, row.id, quote.supplierName, quote.quantity, quote.unit, quote.unitPricePaise, quote.deliveryPaise, quote.packingPaise, quote.feePaise, quote.totalPaise, quote.grade, quote.validUntil, quote.notes, now);
          event = 'quote.added';
        } else if (match[2] === 'select-quote') {
          if (row.kind !== 'buyer' || !['reviewing', 'quoted'].includes(row.status)) fail(409, 'INVALID_STATUS', 'Only a buyer request under review can have a quote confirmed.');
          const quote = await database.prepare('SELECT * FROM pilot_quotes WHERE id = ? AND request_id = ?').bind(text(input.quoteId, 'quote ID', 36, 36), row.id).first();
          if (!quote || quote.valid_until < indiaToday(now)) fail(422, 'QUOTE_EXPIRED', 'Choose a current quote belonging to this request.');
          update = database.prepare("UPDATE pilot_requests SET selected_quote_id = ?, status = 'confirmed', updated_at = ?, version = version + 1 WHERE id = ? AND version = ?").bind(quote.id, now, row.id, row.version); event = 'quote.confirmed';
        } else {
          const status = choice(input.status, statuses, 'status');
          if (row.status !== status && !(transitions[row.status] ?? []).includes(status)) fail(409, 'INVALID_STATUS', 'This status change is not allowed.');
          if (status === 'confirmed' && row.kind === 'buyer' && !row.selected_quote_id) fail(422, 'QUOTE_REQUIRED', 'Confirm a supplier quote before confirming this buyer request.');
          if (status === 'quoted') { const currentQuotes = await quotesFor(database, row.id); if (!currentQuotes.some(q => q.validUntil >= indiaToday(now))) fail(422, 'QUOTE_REQUIRED', 'Add a valid supplier quote first.'); }
          update = database.prepare('UPDATE pilot_requests SET status = ?, customer_update = ?, internal_notes = ?, updated_at = ?, version = version + 1 WHERE id = ? AND version = ?').bind(status, text(input.customerUpdate ?? '', 'customer update', 1500), text(input.internalNotes ?? '', 'internal notes', 3000), now, row.id, row.version); event = 'request.updated';
        }
        const statements = [update]; if (extra) statements.push(extra);
        statements.push(database.prepare('INSERT INTO pilot_audit (id, actor_id, action, request_id, created_at) SELECT ?, ?, ?, ?, ? WHERE changes() = 1').bind(crypto.randomUUID(), actor.id, event, row.id, now));
        const results = await database.batch(statements);
        if (!results[0].meta.changes) fail(409, 'VERSION_CONFLICT', 'Another operator updated this request. Refresh before saving.');
        return json(requestView(await findRequest(database, row.id), await quotesFor(database, row.id), true));
      }
    }
    return json({ error: { code: 'NOT_FOUND', message: 'This API endpoint does not exist.' } }, 404);
  } catch (error) {
    if (error instanceof Problem) return json({ error: { code: error.code, message: error.message } }, error.status, error.status === 429 ? { 'Retry-After': '3600' } : {});
    // No form contents, phone numbers, tokens or provider credentials enter logs.
    console.error('KhetSetu pilot API failure', error?.name ?? 'Error');
    return json({ error: { code: 'TEMPORARILY_UNAVAILABLE', message: 'The request could not be completed. Retry with the same form or contact support.' } }, 503);
  }
}
