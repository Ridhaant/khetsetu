import { createHmac, timingSafeEqual } from 'node:crypto';
import { DomainError } from './types.ts';
export interface PaymentGateway {
  enabled: boolean;
  createOrder(input: { amountPaise: number; receipt: string }): Promise<{ id: string }>;
  refund(input: { paymentId: string; amountPaise: number; receipt: string }): Promise<{ id: string }>;
}
export class UnconfiguredGateway implements PaymentGateway {
  enabled = false;
  async createOrder(): Promise<{ id: string }> { throw new DomainError(503,'PAYMENT_NOT_CONFIGURED','Razorpay credentials are required. No payment was taken.'); }
  async refund(): Promise<{ id: string }> { throw new DomainError(503,'PAYMENT_NOT_CONFIGURED','Refund provider is not configured.'); }
}
export class RazorpayGateway implements PaymentGateway {
  enabled = true;
  constructor(private keyId: string, private secret: string) {}
  private async request(path: string, body: unknown): Promise<{ id: string }> {
    const result = await fetch(`https://api.razorpay.com/v1/${path}`, { method:'POST', headers:{authorization:`Basic ${Buffer.from(`${this.keyId}:${this.secret}`).toString('base64')}`,'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(10000) });
    if (!result.ok) throw new DomainError(502,'PAYMENT_PROVIDER_ERROR','The payment provider could not complete the request. Please retry with the same idempotency key.');
    const data = await result.json() as {id?:string};
    if (!data.id) throw new DomainError(502,'PAYMENT_PROVIDER_ERROR','The payment provider returned an invalid response.');
    return {id:data.id};
  }
  createOrder(input:{amountPaise:number;receipt:string}) { return this.request('orders',{amount:input.amountPaise,currency:'INR',receipt:input.receipt,payment_capture:1}); }
  refund(input:{paymentId:string;amountPaise:number;receipt:string}) { return this.request(`payments/${encodeURIComponent(input.paymentId)}/refund`,{amount:input.amountPaise,receipt:input.receipt,speed:'normal'}); }
}
export function verifyWebhook(raw: Buffer, signature: string | undefined, secret: string | undefined): boolean {
  if (!secret || !signature || !/^[a-f\d]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(raw).digest();
  const supplied = Buffer.from(signature,'hex');
  return supplied.length === expected.length && timingSafeEqual(expected,supplied);
}
