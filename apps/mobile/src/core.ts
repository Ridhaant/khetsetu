import type { CartLine, Listing, Serviceability } from './types.ts';

export function validPin(pin: string) { return /^[1-9][0-9]{5}$/.test(pin); }
// Format-only demonstration eligibility does not prove a postal code exists or that a carrier serves it.
export function demoPinEligible(pin: string) { return validPin(pin); }
// A saved or stale serviceability response must never enable a different delivery location.
export function serviceablePin(pin: string, configured?: Pick<Serviceability, 'pin' | 'serviceable'> | null) {
  return validPin(pin) && configured?.pin === pin && configured.serviceable === true;
}
export function unitPrice(listing: Listing, quantity: number) {
  return [...(listing.tiers ?? [])].sort((a, b) => (b.minimumQuantity ?? b.minQuantity ?? 0) - (a.minimumQuantity ?? a.minQuantity ?? 0))
    .find(t => quantity >= (t.minimumQuantity ?? t.minQuantity ?? Infinity))?.price ?? listing.price;
}
export function updateCart(cart: CartLine[], listing: Listing, quantity: number): CartLine[] {
  if (!Number.isFinite(quantity) || quantity < 0) throw new Error('Enter a valid quantity.');
  if (quantity === 0) return cart.filter(line => line.listingId !== listing.id);
  if (quantity < listing.minimumQuantity) throw new Error(`Minimum order is ${listing.minimumQuantity} ${listing.unit}.`);
  if (quantity > listing.availableQuantity) throw new Error(`Only ${listing.availableQuantity} ${listing.unit} available.`);
  return [...cart.filter(line => line.listingId !== listing.id), { listingId: listing.id, quantity }];
}
export function groupCart(cart: CartLine[], listings: Listing[]) {
  const groups: Record<string, { sellerId: string; sellerName: string; subtotal: number; items: { listing: Listing; quantity: number; price: number }[] }> = {};
  for (const line of cart) {
    const listing = listings.find(item => item.id === line.listingId);
    if (!listing) throw new Error('A saved item is unavailable. Refresh your basket.');
    if (line.quantity < listing.minimumQuantity || line.quantity > listing.availableQuantity) throw new Error(`${listing.title}: quantity is no longer available.`);
    const price = unitPrice(listing, line.quantity);
    const group = groups[listing.sellerId] ??= { sellerId: listing.sellerId, sellerName: listing.sellerName, subtotal: 0, items: [] };
    group.items.push({ listing, quantity: line.quantity, price });
    group.subtotal = Math.round((group.subtotal + line.quantity * price) * 100) / 100;
  }
  return Object.values(groups);
}
export function parseSavedCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((line): line is CartLine => !!line && typeof line.listingId === 'string' && Number.isFinite(line.quantity) && line.quantity > 0);
  } catch { return []; }
}
