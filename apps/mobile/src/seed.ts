import type { Listing } from './types';

// Offline fixtures mirror API IDs, INR/kg prices, sellers and tier rules. Once connected,
// the API catalogue replaces these fixtures and is authoritative for stock and pricing.
const farms = {
  s1: { name: 'Sahyadri Farmers Collective', location: 'Nashik, Maharashtra', pin: '422001' },
  s2: { name: 'Patil Family Farm', location: 'Pune, Maharashtra', pin: '411001' },
  s3: { name: 'Deccan Harvest FPO', location: 'Pune, Maharashtra', pin: '411014' },
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
  ['l-dal', 'Unpolished toor dal', 'Pulses', 's3', 115, 300, false, 'photo-1515543904379-3d757afe72e4'],
  ['l-potato', 'Jyoti table potatoes', 'Vegetables', 's2', 24, 2400, false, 'photo-1518977676601-b53f82aba655'],
  ['l-okra', 'Tender okra (bhindi)', 'Vegetables', 's2', 46, 380, false, 'photo-1425543103986-22abb7d7e8d2'],
  ['l-cauliflower', 'Snowball cauliflower', 'Vegetables', 's2', 36, 520, false, 'photo-1568584711075-3d021a7c3ca3'],
  ['l-capsicum', 'Green capsicum', 'Vegetables', 's2', 58, 360, false, 'photo-1563565375-f3fdfdbefa83'],
  ['l-mango', 'Ratnagiri Alphonso mangoes', 'Fruits', 's1', 260, 320, false, 'photo-1553279768-865429fa0078'],
  ['l-apple', 'Shimla Royal apples', 'Fruits', 's3', 135, 500, false, 'photo-1560806887-1e4cd0b6cbd6'],
  ['l-grapes', 'Nashik seedless grapes', 'Fruits', 's1', 78, 420, false, 'photo-1537640538966-79f369143f8f'],
  ['l-papaya', 'Red Lady papaya', 'Fruits', 's1', 36, 700, false, 'photo-1517282009859-f000ec3b26fe'],
  ['l-guava', 'Allahabad Safeda guava', 'Fruits', 's3', 52, 460, false, 'photo-1536511132770-e5058c7e8c46'],
  ['l-orange', 'Nagpur mandarin oranges', 'Fruits', 's1', 64, 650, false, 'photo-1547514701-42782101795e'],
  ['l-watermelon', 'Kiran dark watermelons', 'Fruits', 's1', 20, 1800, false, 'photo-1587049352846-4a222e784d38'],
];

export const sampleListings: Listing[] = rows.map(
  ([id, title, category, sellerId, price, availableQuantity, organic, photo]) => ({
    id,
    title,
    category,
    sellerId,
    sellerName: farms[sellerId].name,
    unit: 'kg',
    price,
    availableQuantity,
    minimumQuantity: 1,
    grade: 'A',
    location: farms[sellerId].location,
    pin: farms[sellerId].pin,
    organic,
    harvestDate: '2026-11-25',
    status: 'active',
    image: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=640&q=75`,
    tiers: [
      { minQuantity: 25, price: Math.round(price * 0.92) },
      { minQuantity: 100, price: Math.round(price * 0.85) },
    ],
  }),
);
