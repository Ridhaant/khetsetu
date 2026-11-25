import type { Listing } from './types';

// Offline fixtures mirror API IDs, INR/kg prices, sellers and tier rules. Once connected,
// the API catalogue replaces these fixtures and is authoritative for stock and pricing.
const farms = {
  s1: { name: 'Sahyadri Farmers Collective', location: 'Nashik, Maharashtra', pin: '422001' },
  s2: { name: 'Patil Family Farm', location: 'Pune, Maharashtra', pin: '411001' },
  s3: { name: 'Deccan Harvest FPO', location: 'Pune, Maharashtra', pin: '411014' }
};
const rows: [string, string, string, keyof typeof farms, number, number, boolean, string][] = [
  ['l-tomato', 'Farm-fresh tomatoes', 'Vegetables', 's1', 32, 480, false, 'photo-1546094096-0df4bcaaa337'],
  ['l-onion', 'Red onions', 'Vegetables', 's2', 28, 900, false, 'photo-1508747703725-719777637510'],
  ['l-banana', 'Naturally ripened bananas', 'Fruits', 's1', 48, 220, false, 'photo-1603833665858-e61d17a86224'],
  ['l-spinach', 'Tender baby spinach', 'Vegetables', 's2', 45, 85, true, 'photo-1576045057995-568f588f82fb'],
  ['l-carrot', 'Fresh carrots', 'Vegetables', 's3', 42, 1200, false, 'photo-1445282768818-728615cc910a'],
  ['l-rice', 'Indrayani rice', 'Grains', 's3', 68, 640, false, 'photo-1586201375761-83865001e31c'],
  ['l-pomegranate', 'Bhagwa pomegranates', 'Fruits', 's1', 120, 180, false, 'photo-1541344999736-83eca272f6fc'],
  ['l-turmeric', 'Farm-ground turmeric', 'Spices', 's3', 220, 120, true, 'photo-1615485500704-8e990f9900f7'],
  ['l-dal', 'Unpolished toor dal', 'Pulses', 's3', 115, 300, false, 'photo-1515543904379-3d757afe72e4']
];
export const sampleListings: Listing[] = rows.map(([id, title, category, sellerId, price, availableQuantity, organic, photo]) => ({
  id, title, category, sellerId, sellerName: farms[sellerId].name, unit: 'kg', price,
  availableQuantity, minimumQuantity: 1, grade: 'A', location: farms[sellerId].location,
  pin: farms[sellerId].pin, organic, harvestDate: '2026-11-22', status: 'active',
  image: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=640&q=75`,
  tiers: [{ minQuantity: 25, price: Math.round(price * 0.92) }, { minQuantity: 100, price: Math.round(price * 0.85) }]
}));
