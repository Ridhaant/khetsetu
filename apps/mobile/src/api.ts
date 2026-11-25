import * as SecureStore from 'expo-secure-store';
import type { CartLine, Listing, MarketplaceOrder, Role, Serviceability, Session } from './types';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
const TOKEN_KEY = 'khetsetu.session';
export class ApiError extends Error { constructor(message: string, public status = 0) { super(message); } }
async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  if (!API_URL) throw new ApiError('Connect the marketplace API to continue. You can still browse sample produce.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${API_URL}${path}`, { ...options, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(typeof body.message === 'string' ? body.message : body.error?.message ?? 'The request could not be completed.', response.status);
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Connection unavailable. Your saved basket is safe. Please retry.');
  } finally { clearTimeout(timer); }
}
export const api = {
  async catalog(pin: string): Promise<Listing[]> {
    const result = await request<Listing[] | { listings: Listing[] }>(`/catalog?pin=${encodeURIComponent(pin)}`);
    return Array.isArray(result) ? result : result.listings;
  },
  serviceability: (pin: string) => request<Serviceability>(`/serviceability/${encodeURIComponent(pin)}`),
  async demoLogin(role: Role) {
    if (!DEMO_MODE) throw new ApiError('Demo sign-in is disabled in this build.');
    const session = await request<Session>('/auth/demo', { method: 'POST', body: JSON.stringify({ role, ...(role === 'seller' ? { sellerId: 's1' } : {}) }) });
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(session));
    return session;
  },
  requestOtp: (phone: string) => request<{ challengeId: string }>('/auth/otp/request', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp: (challengeId: string, code: string) => request<Session>('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ challengeId, code }) }),
  async orders(token: string) {
    const result = await request<MarketplaceOrder[] | { orders: MarketplaceOrder[] }>('/orders', {}, token);
    return Array.isArray(result) ? result : result.orders;
  },
  checkout: (token: string, pin: string, items: CartLine[], idempotencyKey: string) => request<{ orders: MarketplaceOrder[]; payment: { status: string; available: boolean; reason?: string } }>('/checkout', { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify({ pin, items, fulfilment: 'delivery' }) }, token),
  createRfq: (token: string, body: { title: string; category: string; quantity: number; unit: string; pin: string; deliveryBy: string; notes: string }) => request<{ id: string }>('/rfqs', { method: 'POST', body: JSON.stringify(body) }, token),
  async sellerListings(token: string) {
    const result = await request<Listing[] | { listings: Listing[] }>('/seller/listings', {}, token);
    return Array.isArray(result) ? result : result.listings;
  },
  createListing: (token: string, body: { title: string; category: string; unit: string; price: number; availableQuantity: number; minimumQuantity: number; grade: string }) => request<Listing>('/seller/listings', { method: 'POST', body: JSON.stringify(body) }, token),
  updateListing: (token: string, id: string, body: { title?: string; price?: number; availableQuantity?: number; minimumQuantity?: number; status?: 'active' | 'paused' }) => request<Listing>(`/seller/listings/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) }, token),
  transitionOrder: (token: string, id: string, status: 'accepted' | 'packed' | 'dispatched' | 'completed') => request<MarketplaceOrder>(`/orders/${encodeURIComponent(id)}/transition`, { method: 'POST', body: JSON.stringify({ status }) }, token),
  async restoreSession(): Promise<Session | null> {
    const raw = await SecureStore.getItemAsync(TOKEN_KEY);
    try { return raw ? JSON.parse(raw) as Session : null; } catch { return null; }
  },
  async saveSession(session: Session) { await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(session)); },
  async logout() { await SecureStore.deleteItemAsync(TOKEN_KEY); }
};
