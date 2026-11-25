import {
  createStaticPilotStore,
  loadStoredReceipts,
  randomToken,
  saveStoredReceipt,
} from './pilotStore.mjs';

export type Kind = 'buyer' | 'farmer';
export type Status =
  | 'new'
  | 'reviewing'
  | 'quoted'
  | 'confirmed'
  | 'fulfilled'
  | 'cancelled'
  | 'withdrawn'
  | 'expired';

export type ReceiptKey = {
  id: string;
  reference: string;
  secret: string;
};

export type Quote = {
  id: string;
  supplierName: string;
  quantity: number;
  unit: string;
  unitPricePaise: number;
  deliveryPaise: number;
  packingPaise: number;
  feePaise: number;
  totalPaise: number;
  grade: string;
  validUntil: string;
  notes: string;
};

export type RecordRow = {
  id: string;
  reference: string;
  kind: Kind;
  name?: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  pin: string;
  produce: string;
  quantity: number;
  unit: string;
  grade: string;
  neededBy?: string;
  frequency?: string;
  notes?: string;
  status: Status;
  createdAt: string | number;
  updatedAt?: string | number;
  version: number;
  customerUpdate: string;
  internalNotes: string;
  selectedQuoteId?: string;
  quotes: Quote[];
};

export type BackendMode = 'api' | 'static';

const STATIC_OPS_SESSION_KEY = 'khetsetu.pilot.static-ops.v1';

const configuredApiBase = (
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_PILOT_API_URL ?? ''
).replace(/\/$/, '');

const apiBase = configuredApiBase ? `${configuredApiBase}/api/pilot` : '/api/pilot';

let modePromise: Promise<BackendMode> | null = null;
const staticStore = createStaticPilotStore();

export function isLocalPreviewHost(): boolean {
  return (
    typeof window !== 'undefined' &&
    ['127.0.0.1', 'localhost'].includes(window.location.hostname)
  );
}

export async function detectBackendMode(): Promise<BackendMode> {
  if (configuredApiBase) return 'api';
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io')) {
    return 'static';
  }
  if (modePromise) return modePromise;

  modePromise = (async () => {
    try {
      const response = await fetch(`${apiBase}/config`, { cache: 'no-store' });
      const contentType = response.headers.get('content-type') ?? '';
      if (!response.ok || !contentType.includes('application/json')) {
        return 'static';
      }
      const data = (await response.json().catch(() => null)) as { mode?: string } | null;
      return data?.mode === 'assisted' ? 'api' : 'static';
    } catch {
      return 'static';
    }
  })();

  return modePromise;
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      body?.error?.message || `Request failed (${response.status}). Please try again.`,
    );
  }
  return body as T;
}

export function getSavedReceipts(): ReceiptKey[] {
  return loadStoredReceipts();
}

export function persistReceipt(row: ReceiptKey, current: ReceiptKey[]): ReceiptKey[] {
  return saveStoredReceipt(row, current);
}

export function createReceiptCredentials(): { idempotencyKey: string; receiptSecret: string } {
  return {
    idempotencyKey: randomToken(),
    receiptSecret: randomToken(),
  };
}

export function isStaticOpsUnlocked(): boolean {
  try {
    return sessionStorage.getItem(STATIC_OPS_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function setStaticOpsUnlocked(enabled: boolean): void {
  try {
    if (enabled) sessionStorage.setItem(STATIC_OPS_SESSION_KEY, '1');
    else sessionStorage.removeItem(STATIC_OPS_SESSION_KEY);
  } catch {
    // Ignore storage restriction errors.
  }
}

export async function submitPilotRequest(
  payload: Record<string, unknown>,
  idempotencyKey: string,
): Promise<{ id: string; reference: string; mode: BackendMode }> {
  const mode = await detectBackendMode();
  if (mode === 'static') {
    const saved = staticStore.submit(payload, idempotencyKey);
    return { id: saved.id, reference: saved.reference, mode };
  }

  const saved = await apiFetch<{ id: string; reference: string }>('/requests', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payload),
  });
  return { id: saved.id, reference: saved.reference, mode };
}

export async function fetchReceipt(key: ReceiptKey): Promise<RecordRow> {
  const mode = await detectBackendMode();
  if (mode === 'static') {
    return staticStore.getReceipt(key.id, key.secret) as RecordRow;
  }
  return apiFetch<RecordRow>(`/receipts/${encodeURIComponent(key.id)}`, {
    headers: { Authorization: `Bearer ${key.secret}` },
  });
}

export async function withdrawPilotReceipt(key: ReceiptKey): Promise<void> {
  const mode = await detectBackendMode();
  if (mode === 'static') {
    staticStore.withdrawReceipt(key.id, key.secret);
    return;
  }
  await apiFetch(`/receipts/${encodeURIComponent(key.id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${key.secret}` },
  });
}

export async function fetchAdminSession(): Promise<{
  authenticated: boolean;
  admin: boolean;
  mode: BackendMode;
}> {
  const mode = await detectBackendMode();
  if (mode === 'static') {
    const unlocked = isStaticOpsUnlocked();
    return { authenticated: unlocked, admin: unlocked, mode };
  }
  const session = await apiFetch<{ authenticated: boolean; admin: boolean }>('/session');
  return { ...session, mode };
}

export async function fetchAdminRequests(): Promise<RecordRow[]> {
  const mode = await detectBackendMode();
  if (mode === 'static') {
    return staticStore.listAdminRequests().requests as RecordRow[];
  }
  const result = await apiFetch<{ requests: RecordRow[] }>('/admin/requests');
  return result.requests;
}

export async function mutateAdminRequest(
  requestId: string,
  action: 'update' | 'add-quote' | 'select-quote',
  body: Record<string, unknown>,
): Promise<void> {
  const mode = await detectBackendMode();
  if (mode === 'static') {
    if (action === 'add-quote') {
      staticStore.addAdminQuote(requestId, body);
    } else if (action === 'select-quote') {
      staticStore.selectAdminQuote(requestId, body);
    } else {
      staticStore.updateAdminRequest(requestId, body);
    }
    return;
  }

  if (action === 'add-quote') {
    await apiFetch(`/admin/requests/${encodeURIComponent(requestId)}/quotes`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } else if (action === 'select-quote') {
    await apiFetch(`/admin/requests/${encodeURIComponent(requestId)}/select-quote`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } else {
    await apiFetch(`/admin/requests/${encodeURIComponent(requestId)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
}
