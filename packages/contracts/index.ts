// Type-only shared contract; HTTP runtime validation lives in apps/api/src/validation.ts.
export type { Actor, Role, Listing, PriceTier, Order, OrderItem, OrderStatus, CheckoutInput, CheckoutResult, ServiceabilityResult, Rfq, Quote, Review, Dispute, Audit } from '../../apps/api/src/types.ts';
export interface ApiError { error: { code:string; message:string; requestId:string } }
