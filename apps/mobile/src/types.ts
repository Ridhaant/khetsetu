export type Language = 'en' | 'hi';
export type Role = 'buyer' | 'seller';
export type Listing = {
  id: string; title: string; category: string; sellerId: string; sellerName: string;
  unit: string; price: number; availableQuantity: number; minimumQuantity: number;
  grade: string; location: string; pin: string; organic: boolean; harvestDate: string;
  image: string; tiers?: { minimumQuantity?: number; minQuantity?: number; price: number }[];
  status?: 'active' | 'paused' | 'expired';
};
export type CartLine = { listingId: string; quantity: number };
export type Serviceability = {
  pin: string; serviceable: boolean; message?: string; scope?: 'national' | 'pilot';
  validation?: 'format-only'; logisticsVerified?: boolean;
  reason?: 'invalid_pin' | 'explicitly_denied' | 'outside_pilot' | 'eligible_development';
  deliveryChargePaise?: number; freeDeliveryAbovePaise?: number; pickupAvailable?: boolean;
};
export type Session = { accessToken: string; user: { id: string; role: Role; sellerId?: string } };
export type MarketplaceOrder = { id: string; sellerId: string; status: string; total?: number; totalAmount?: number; totalPaise?: number; createdAt?: string; items?: { title?: string; quantity: number; unit?: string }[]; paymentStatus?: string };
