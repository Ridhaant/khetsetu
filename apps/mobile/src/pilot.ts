export type RequestKind = 'buyer' | 'farmer';
export type BusinessType = 'retailer' | 'wholesaler' | 'restaurant' | 'caterer' | 'farmer' | 'fpo' | 'other';
export type PilotForm = { kind: RequestKind; name: string; phone: string; businessName: string; businessType: BusinessType; pin: string; produce: string; quantity: string; unit: 'kg' | 'quintal' | 'tonne' | 'crate' | 'box'; grade: 'A' | 'B' | 'mixed'; neededBy: string; frequency: 'once' | 'daily' | 'weekly'; notes: string; consent: boolean };
export type RequestBody = Omit<PilotForm, 'quantity' | 'consent'> & { quantity: number; consent: true; website: ''; receiptSecret: string };
export type SavedReceipt = { id: string; reference: string; secret: string };
export type Quote = { id: string; supplierName: string; quantity: number; unit: string; unitPricePaise: number; deliveryPaise: number; packingPaise: number; feePaise: number; totalPaise: number; grade: string; validUntil: string; notes?: string };
export type Receipt = { id: string; reference: string; kind: RequestKind; produce: string; quantity: number; unit: string; grade: string; pin: string; status: string; createdAt: number | string; customerUpdate?: string; selectedQuoteId?: string | null; quotes: Quote[] };
export type Attempt = { idempotencyKey: string; receiptSecret: string; fingerprint: string; body: RequestBody };
export type FieldErrors = Partial<Record<keyof PilotForm, string>>;
export const DEFAULT_PILOT_URL = 'https://khetsetu-farm-market.dampcliff128.chatgpt.site';
export const emptyForm = (): PilotForm => ({ kind: 'buyer', name: '', phone: '', businessName: '', businessType: 'retailer', pin: '', produce: '', quantity: '', unit: 'kg', grade: 'A', neededBy: '', frequency: 'once', notes: '', consent: false });
export const indiaDate = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validatePilotForm(form: PilotForm, today = indiaDate()): FieldErrors {
  const errors: FieldErrors = {};
  if (form.name.trim().length < 2 || form.name.trim().length > 80) errors.name = 'name';
  if (!/^(?:\+?91)?[6-9]\d{9}$/.test(form.phone.trim().replace(/[ ()-]/g, ''))) errors.phone = 'phone';
  if (form.businessName.trim().length > 120) errors.businessName = 'businessName';
  if (!/^[1-9]\d{5}$/.test(form.pin)) errors.pin = 'pin';
  if (form.produce.trim().length < 2 || form.produce.trim().length > 160) errors.produce = 'produce';
  const quantity = Number(form.quantity);
  if (!form.quantity.trim() || !Number.isFinite(quantity) || quantity <= 0 || quantity > 1000000 || Math.abs(quantity * 1000 - Math.round(quantity * 1000)) > 0.000001) errors.quantity = 'quantity';
  const maxDate = new Date(Date.parse(today + 'T00:00:00Z') + 180 * 86400000).toISOString().slice(0, 10);
  if (!validDate(form.neededBy) || form.neededBy < today || form.neededBy > maxDate) errors.neededBy = 'neededBy';
  if (form.notes.length > 2000) errors.notes = 'notes';
  if (!form.consent) errors.consent = 'consent';
  return errors;
}
export function normalizedForm(form: PilotForm) {
  return { ...form, name: form.name.trim(), phone: form.phone.trim().replace(/[ ()-]/g, ''), businessName: form.businessName.trim(), pin: form.pin.trim(), produce: form.produce.trim(), quantity: Number(form.quantity), notes: form.notes.trim(), consent: true as const, website: '' as const };
}
export function formFingerprint(form: PilotForm) { return JSON.stringify(normalizedForm(form)); }
export function prepareAttempt(form: PilotForm, credentials: { idempotencyKey: string; receiptSecret: string }): Attempt {
  if (Object.keys(validatePilotForm(form)).length) throw new Error('Please check the highlighted fields.');
  if (![credentials.idempotencyKey, credentials.receiptSecret].every(value => typeof value === 'string' && /^[A-Za-z0-9_-]{24,128}$/.test(value))) throw new Error('Secure request credentials were not returned. Try again.');
  return { ...credentials, fingerprint: formFingerprint(form), body: { ...normalizedForm(form), receiptSecret: credentials.receiptSecret } };
}
export function parseSavedReceipts(raw: string | null): SavedReceipt[] {
  try { const rows: unknown = JSON.parse(raw ?? '[]'); if (!Array.isArray(rows)) return []; return rows.filter((row): row is SavedReceipt => !!row && typeof row.id === 'string' && typeof row.reference === 'string' && typeof row.secret === 'string').slice(0, 10).map(({ id, reference, secret }) => ({ id, reference, secret })); } catch { return []; }
}
export async function pilotFetch<T>(base: string, path: string, options: RequestInit = {}): Promise<T> {
  if (!/^https:\/\//.test(base) && !/^http:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?$/.test(base)) throw new Error('The pilot service must use HTTPS.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(base.replace(/\/$/, '') + path, { ...options, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...options.headers } });
    let data: any;
    try { data = await response.json(); } catch { throw new Error('The service did not return a readable response. Please try again.'); }
    if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : data.error?.message ?? data.message ?? `Request failed (${response.status}). Please try again.`);
    return data as T;
  } catch (error) { if ((error as Error).name === 'AbortError') throw new Error('The connection timed out. Retry to check the same request.'); throw error; }
  finally { clearTimeout(timer); }
}
