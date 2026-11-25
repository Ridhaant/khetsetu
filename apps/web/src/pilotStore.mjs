import { INDIAN_PIN_PATTERN } from './domain.mjs';

export const RECEIPTS_STORAGE_KEY = 'khetsetu.pilot.receipts.v1';
export const STATIC_DB_STORAGE_KEY = 'khetsetu.pilot.static-db.v1';

const VALID_PIN = new RegExp(`^${INDIAN_PIN_PATTERN}$`);
const VALID_UNITS = ['kg', 'quintal', 'tonne', 'crate', 'box'];
const VALID_GRADES = ['A', 'B', 'mixed'];
const VALID_STATUSES = ['new', 'reviewing', 'quoted', 'confirmed', 'fulfilled', 'cancelled'];
const STATUS_TRANSITIONS = {
  new: ['reviewing', 'cancelled'],
  reviewing: ['quoted', 'confirmed', 'cancelled'],
  quoted: ['reviewing', 'confirmed', 'cancelled'],
  confirmed: ['fulfilled', 'cancelled'],
  fulfilled: [],
  cancelled: [],
  withdrawn: [],
  expired: [],
};

export function indiaToday(now = Date.now()) {
  return new Date(now + 19800000).toISOString().slice(0, 10);
}

export function randomToken() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function loadStoredReceipts(storage = globalThis.localStorage) {
  try {
    const rows = JSON.parse(storage?.getItem(RECEIPTS_STORAGE_KEY) || '[]');
    if (!Array.isArray(rows)) return [];
    return rows
      .filter(
        (row) =>
          row &&
          typeof row === 'object' &&
          typeof row.id === 'string' &&
          typeof row.reference === 'string' &&
          typeof row.secret === 'string',
      )
      .slice(0, 30);
  } catch {
    return [];
  }
}

export function saveStoredReceipt(row, existing = [], storage = globalThis.localStorage) {
  const next = [row, ...existing.filter((item) => item.id !== row.id)].slice(0, 30);
  try {
    storage?.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Keep in-memory receipts even when browser storage is restricted.
  }
  return next;
}

export function buildWhatsappInquiryUrl({ reference, kind, produce, quantity, unit, grade, pin, neededBy, name, phone }) {
  const roleLabel = kind === 'farmer' ? 'Farm supply' : 'Buying requirement';
  const text = [
    `Hello KhetSetu, I just logged a request (${reference}).`,
    `Type: ${roleLabel}`,
    `Produce: ${produce}`,
    `Quantity: ${quantity} ${unit} (Grade ${grade})`,
    `PIN: ${pin}`,
    `Date: ${neededBy}`,
    name ? `Contact: ${name}${phone ? ` (${phone})` : ''}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  return `https://wa.me/917021610641?text=${encodeURIComponent(text)}`;
}

export function buildEmailInquiryUrl({ reference, kind, produce, quantity, unit, grade, pin, neededBy, name, phone }) {
  const subject = `KhetSetu enquiry ${reference} · ${produce} (${pin})`;
  const body = [
    `Reference: ${reference}`,
    `Type: ${kind === 'farmer' ? 'Farm supply' : 'Buying requirement'}`,
    `Produce: ${produce}`,
    `Quantity: ${quantity} ${unit}`,
    `Grade: ${grade}`,
    `PIN code: ${pin}`,
    `Target date: ${neededBy}`,
    name ? `Name: ${name}` : '',
    phone ? `Phone: +91 ${phone}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  return `mailto:redantthakur@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function validateText(value, label, max, min = 0) {
  if (typeof value !== 'string') throw new Error(`${label} is required.`);
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new Error(`Check ${label} (${min}–${max} characters).`);
  }
  return trimmed;
}

function validateDate(value, label, now = Date.now()) {
  const today = indiaToday(now);
  const maxDay = indiaToday(now + 180 * 86400000);
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value ||
    value < today ||
    value > maxDay
  ) {
    throw new Error(`${label} must be between today and the next 180 days.`);
  }
  return value;
}

function validateQuantity(value) {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0.001 ||
    value > 1000000 ||
    Math.abs(value * 1000 - Math.round(value * 1000)) > 0.000001
  ) {
    throw new Error('Quantity must be positive, at most 1,000,000, and use up to 3 decimal places.');
  }
  return value;
}

function seedStaticDatabase(now = Date.now()) {
  const tomorrow = indiaToday(now + 86400000);
  const nextWeek = indiaToday(now + 7 * 86400000);
  const sampleId = 'sample-buyer-400008';
  const quoteId = 'sample-quote-nashik';
  return {
    requests: [
      {
        id: sampleId,
        reference: 'KS-SAMPLE400008',
        idempotencyKey: '',
        fingerprint: '',
        secret: '',
        isSample: true,
        kind: 'buyer',
        name: 'Sample Retailer (Demo)',
        phone: '9000000000',
        businessName: 'Mahalaxmi Fresh Mart',
        businessType: 'retailer',
        pin: '400008',
        produce: 'Red onions, Nashik variety',
        quantity: 100,
        unit: 'kg',
        grade: 'A',
        neededBy: tomorrow,
        frequency: 'weekly',
        notes: 'Morning unloading preferred before 8:00 AM.',
        status: 'quoted',
        createdAt: now - 3600000,
        updatedAt: now - 1800000,
        version: 2,
        customerUpdate: 'Checking crate packing and morning tempo slot for Byculla.',
        internalNotes: 'Sample preview record for testing Operations in browser mode.',
        selectedQuoteId: undefined,
        quotes: [
          {
            id: quoteId,
            supplierName: 'Nashik Valley Growers FPO',
            quantity: 100,
            unit: 'kg',
            unitPricePaise: 2400,
            deliveryPaise: 18000,
            packingPaise: 4000,
            feePaise: 0,
            totalPaise: 262000,
            grade: 'A',
            validUntil: nextWeek,
            notes: '50 kg mesh bags, weight verified at loading.',
          },
        ],
      },
    ],
  };
}

function readStaticDb(storage, now = Date.now()) {
  try {
    const raw = storage?.getItem(STATIC_DB_STORAGE_KEY);
    if (!raw) {
      const initial = seedStaticDatabase(now);
      storage?.setItem(STATIC_DB_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.requests)) return parsed;
  } catch {
    // Fall back to fresh sample DB.
  }
  return seedStaticDatabase(now);
}

function writeStaticDb(storage, db) {
  try {
    storage?.setItem(STATIC_DB_STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Ignore storage quota issues gracefully.
  }
}

function toPublicReceipt(row) {
  return {
    id: row.id,
    reference: row.reference,
    kind: row.kind,
    produce: row.produce,
    quantity: row.quantity,
    unit: row.unit,
    grade: row.grade,
    pin: row.pin,
    status: row.status,
    neededBy: row.neededBy,
    frequency: row.frequency,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    customerUpdate: row.customerUpdate,
    selectedQuoteId: row.selectedQuoteId,
    version: row.version,
    quotes: row.quotes ?? [],
  };
}

export function createStaticPilotStore(storage = globalThis.localStorage, clock = () => Date.now()) {
  function submit(payload, idempotencyKey) {
    const now = clock();
    if (payload.website) throw new Error('Please leave the website field empty.');
    const kind = payload.kind === 'farmer' ? 'farmer' : payload.kind === 'buyer' ? 'buyer' : null;
    if (!kind) throw new Error('Choose a valid request type.');
    const pin = typeof payload.pin === 'string' ? payload.pin.trim() : '';
    if (!VALID_PIN.test(pin)) {
      throw new Error('Enter a six-digit Indian PIN code starting with 1–9.');
    }
    let phone = validateText(payload.phone, 'mobile number', 20, 10).replace(/[\s()+-]/g, '');
    if (/^91[6-9]\d{9}$/.test(phone)) phone = phone.slice(2);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      throw new Error('Enter a valid 10-digit Indian mobile number.');
    }
    if (payload.consent !== true) {
      throw new Error('Consent is required so the team can contact you about this request.');
    }
    if (typeof payload.receiptSecret !== 'string' || payload.receiptSecret.length < 24) {
      throw new Error('Invalid receipt credential. Please retry.');
    }
    if (typeof idempotencyKey !== 'string' || idempotencyKey.length < 24) {
      throw new Error('Invalid submission key. Please retry.');
    }
    const allowedBusinessTypes =
      kind === 'farmer'
        ? ['farmer', 'fpo', 'other']
        : ['retailer', 'wholesaler', 'restaurant', 'caterer', 'other'];
    if (!allowedBusinessTypes.includes(payload.businessType)) {
      throw new Error('Choose a valid business type.');
    }
    if (!VALID_UNITS.includes(payload.unit)) throw new Error('Choose a valid unit.');
    if (!VALID_GRADES.includes(payload.grade)) throw new Error('Choose a valid grade.');
    if (!['once', 'daily', 'weekly'].includes(payload.frequency)) {
      throw new Error('Choose a valid frequency.');
    }

    const cleaned = {
      kind,
      name: validateText(payload.name, 'name', 80, 2),
      phone,
      businessName: validateText(payload.businessName ?? '', 'business name', 120),
      businessType: payload.businessType,
      pin,
      produce: validateText(payload.produce, 'produce', 160, 2),
      quantity: validateQuantity(payload.quantity),
      unit: payload.unit,
      grade: payload.grade,
      neededBy: validateDate(payload.neededBy, 'Required date', now),
      frequency: payload.frequency,
      notes: validateText(payload.notes ?? '', 'notes', 2000),
    };

    const fingerprint = JSON.stringify({ ...cleaned, secret: payload.receiptSecret });
    const db = readStaticDb(storage, now);
    const existing = db.requests.find((r) => r.idempotencyKey === idempotencyKey);
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        throw new Error('This submission key belongs to a different request.');
      }
      return {
        id: existing.id,
        reference: existing.reference,
        status: existing.status,
        createdAt: existing.createdAt,
      };
    }

    const id = randomToken();
    const reference = `KS-${id.replaceAll('-', '').slice(0, 12).toUpperCase()}`;
    const record = {
      id,
      reference,
      idempotencyKey,
      fingerprint,
      secret: payload.receiptSecret,
      ...cleaned,
      status: 'new',
      createdAt: now,
      updatedAt: now,
      version: 1,
      customerUpdate: '',
      internalNotes: '',
      selectedQuoteId: undefined,
      quotes: [],
    };
    db.requests.unshift(record);
    writeStaticDb(storage, db);
    return { id, reference, status: 'new', createdAt: now };
  }

  function getReceipt(id, secret) {
    const db = readStaticDb(storage, clock());
    const row = db.requests.find((r) => r.id === id && r.secret && r.secret === secret);
    if (!row) throw new Error('This receipt was not found or has expired.');
    return toPublicReceipt(row);
  }

  function withdrawReceipt(id, secret) {
    const now = clock();
    const db = readStaticDb(storage, now);
    const row = db.requests.find((r) => r.id === id && r.secret && r.secret === secret);
    if (!row) throw new Error('This receipt was not found or has expired.');
    row.name = '';
    row.phone = '';
    row.businessName = '';
    row.notes = '';
    row.internalNotes = '';
    row.customerUpdate = 'Request withdrawn and contact details removed.';
    row.produce = 'Withdrawn request';
    row.selectedQuoteId = undefined;
    row.quotes = [];
    row.status = 'withdrawn';
    row.updatedAt = now;
    row.version += 1;
    writeStaticDb(storage, db);
    return { id: row.id, reference: row.reference, status: 'withdrawn' };
  }

  function listAdminRequests() {
    const db = readStaticDb(storage, clock());
    return { requests: db.requests.slice(0, 500) };
  }

  function updateAdminRequest(id, patch) {
    const now = clock();
    const db = readStaticDb(storage, now);
    const row = db.requests.find((r) => r.id === id);
    if (!row) throw new Error('This request was not found.');
    if (patch.version !== row.version) {
      throw new Error('This request changed. Refresh operations before saving.');
    }
    if (!VALID_STATUSES.includes(patch.status)) throw new Error('Choose a valid status.');
    if (row.status !== patch.status && !(STATUS_TRANSITIONS[row.status] ?? []).includes(patch.status)) {
      throw new Error('This status change is not allowed.');
    }
    if (patch.status === 'confirmed' && row.kind === 'buyer' && !row.selectedQuoteId) {
      throw new Error('Confirm a supplier quote before confirming this buyer request.');
    }
    if (patch.status === 'quoted') {
      const today = indiaToday(now);
      if (!(row.quotes ?? []).some((q) => q.validUntil >= today)) {
        throw new Error('Add a valid supplier quote first.');
      }
    }
    row.status = patch.status;
    row.customerUpdate = validateText(patch.customerUpdate ?? '', 'customer update', 1500);
    row.internalNotes = validateText(patch.internalNotes ?? '', 'internal notes', 3000);
    row.updatedAt = now;
    row.version += 1;
    writeStaticDb(storage, db);
    return row;
  }

  function addAdminQuote(id, input) {
    const now = clock();
    const db = readStaticDb(storage, now);
    const row = db.requests.find((r) => r.id === id);
    if (!row) throw new Error('This request was not found.');
    if (input.version !== row.version) {
      throw new Error('This request changed. Refresh operations before saving.');
    }
    if (!['reviewing', 'quoted'].includes(row.status)) {
      throw new Error('Move this request to reviewing before adding supplier quotes.');
    }
    const q = validateQuantity(input.quantity);
    if (q !== row.quantity || input.unit !== row.unit) {
      throw new Error('Quote the full requested quantity in the same unit.');
    }
    if (!VALID_GRADES.includes(input.grade)) throw new Error('Choose a valid grade.');
    for (const [val, label] of [
      [input.unitPricePaise, 'unit price'],
      [input.deliveryPaise, 'delivery charge'],
      [input.packingPaise, 'packing charge'],
      [input.feePaise, 'fee'],
    ]) {
      if (!Number.isSafeInteger(val) || val < 0 || val > 100000000) {
        throw new Error(`Check ${label}.`);
      }
    }
    if (input.unitPricePaise < 1) throw new Error('Unit price must be positive.');
    const totalPaise =
      Math.round(q * input.unitPricePaise) +
      input.deliveryPaise +
      input.packingPaise +
      input.feePaise;
    if (!Number.isSafeInteger(totalPaise) || totalPaise > 50000000) {
      throw new Error('Pilot quotes support totals up to ₹5,00,000.');
    }
    const quote = {
      id: randomToken(),
      supplierName: validateText(input.supplierName, 'supplier name', 120, 2),
      quantity: q,
      unit: input.unit,
      unitPricePaise: input.unitPricePaise,
      deliveryPaise: input.deliveryPaise,
      packingPaise: input.packingPaise,
      feePaise: input.feePaise,
      totalPaise,
      grade: input.grade,
      validUntil: validateDate(input.validUntil, 'Quote expiry', now),
      notes: validateText(input.notes ?? '', 'quote notes', 1200),
    };
    row.quotes = [...(row.quotes ?? []), quote].sort((a, b) => a.totalPaise - b.totalPaise);
    row.status = 'quoted';
    row.updatedAt = now;
    row.version += 1;
    writeStaticDb(storage, db);
    return row;
  }

  function selectAdminQuote(id, input) {
    const now = clock();
    const db = readStaticDb(storage, now);
    const row = db.requests.find((r) => r.id === id);
    if (!row) throw new Error('This request was not found.');
    if (input.version !== row.version) {
      throw new Error('This request changed. Refresh operations before saving.');
    }
    if (row.kind !== 'buyer' || !['reviewing', 'quoted'].includes(row.status)) {
      throw new Error('Only a buyer request under review can have a quote confirmed.');
    }
    const quote = (row.quotes ?? []).find((q) => q.id === input.quoteId);
    if (!quote || quote.validUntil < indiaToday(now)) {
      throw new Error('Choose a current quote belonging to this request.');
    }
    row.selectedQuoteId = quote.id;
    row.status = 'confirmed';
    row.updatedAt = now;
    row.version += 1;
    writeStaticDb(storage, db);
    return row;
  }

  return {
    submit,
    getReceipt,
    withdrawReceipt,
    listAdminRequests,
    updateAdminRequest,
    addAdminQuote,
    selectAdminQuote,
  };
}
