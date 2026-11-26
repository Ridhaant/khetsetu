import { produceCatalog } from './produceCatalog.mjs';

export type Listing = {
  id: string;
  title: string;
  variety: string;
  category: string;
  sellerId: string;
  sellerName: string;
  unit: string;
  price: number;
  availableQuantity: number;
  minimumQuantity: number;
  grade: string;
  location: string;
  pin: string;
  organic: boolean;
  harvestDate: string;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
  tiers: { min: number; price: number }[];
  status?: string;
};

const baseListings: Listing[] = [
  {
    id: 'l-tomato',
    title: 'Fresh red tomatoes',
    variety: 'Hybrid · vine-ripened',
    category: 'Vegetables',
    sellerId: 's1',
    sellerName: 'Sahyadri Farmers Collective',
    unit: 'kg',
    price: 32,
    availableQuantity: 480,
    minimumQuantity: 1,
    grade: 'Grade A',
    location: 'Nashik, Maharashtra',
    pin: '400008',
    organic: false,
    harvestDate: '2026-11-21',
    image: './crops/veg-tomato.webp',
    rating: 4.9,
    reviews: 128,
    badge: 'Freshly harvested',
    tiers: [
      { min: 25, price: 28 },
      { min: 100, price: 24 },
    ],
  },
  {
    id: 'l-spinach',
    title: 'Farm-fresh spinach',
    variety: 'Palak · tender leaf',
    category: 'Vegetables',
    sellerId: 's2',
    sellerName: 'Green Roots Farm',
    unit: 'kg',
    price: 45,
    availableQuantity: 120,
    minimumQuantity: 1,
    grade: 'Grade A',
    location: 'Pune, Maharashtra',
    pin: '400008',
    organic: true,
    harvestDate: '2026-11-21',
    image: './crops/leafy-palak.webp',
    rating: 4.8,
    reviews: 86,
    badge: 'Certified organic',
    tiers: [{ min: 20, price: 40 }],
  },
  {
    id: 'l-onion',
    title: 'Nashik red onions',
    variety: 'Red onion · medium',
    category: 'Vegetables',
    sellerId: 's1',
    sellerName: 'Sahyadri Farmers Collective',
    unit: 'kg',
    price: 28,
    availableQuantity: 1600,
    minimumQuantity: 1,
    grade: 'Grade A',
    location: 'Nashik, Maharashtra',
    pin: '400008',
    organic: false,
    harvestDate: '2026-11-19',
    image: './crops/veg-red-onion.webp',
    rating: 4.9,
    reviews: 214,
    badge: 'Bulk price available',
    tiers: [
      { min: 25, price: 24 },
      { min: 100, price: 21 },
    ],
  },
  {
    id: 'l-banana',
    title: 'Naturally sweet bananas',
    variety: 'Grand Naine · ripe',
    category: 'Fruits',
    sellerId: 's3',
    sellerName: 'Patil Family Farms',
    unit: 'dozen',
    price: 60,
    availableQuantity: 160,
    minimumQuantity: 1,
    grade: 'Grade A',
    location: 'Jalgaon, Maharashtra',
    pin: '400008',
    organic: false,
    harvestDate: '2026-11-20',
    image: './crops/fruit-banana.webp',
    rating: 4.7,
    reviews: 65,
    tiers: [{ min: 10, price: 52 }],
  },
  {
    id: 'l-carrot',
    title: 'Crunchy orange carrots',
    variety: 'Nantes · sweet & crisp',
    category: 'Vegetables',
    sellerId: 's2',
    sellerName: 'Green Roots Farm',
    unit: 'kg',
    price: 48,
    availableQuantity: 240,
    minimumQuantity: 1,
    grade: 'Grade A',
    location: 'Pune, Maharashtra',
    pin: '400008',
    organic: true,
    harvestDate: '2026-11-21',
    image: './crops/root-carrot.webp',
    rating: 4.8,
    reviews: 73,
    badge: 'Certified organic',
    tiers: [{ min: 20, price: 42 }],
  },
  {
    id: 'l-rice',
    title: 'Aromatic Indrayani rice',
    variety: 'Indrayani · unpolished',
    category: 'Grains',
    sellerId: 's4',
    sellerName: 'Maval Growers FPO',
    unit: 'kg',
    price: 85,
    availableQuantity: 2200,
    minimumQuantity: 5,
    grade: 'Premium',
    location: 'Maval, Maharashtra',
    pin: '400008',
    organic: false,
    harvestDate: '2026-11-01',
    image: './crops/staple-rice.webp',
    rating: 4.9,
    reviews: 102,
    badge: 'FPO direct',
    tiers: [
      { min: 25, price: 78 },
      { min: 100, price: 72 },
    ],
  },
  {
    id: 'l-dal',
    title: 'Golden toor dal',
    variety: 'Unpolished · natural',
    category: 'Pulses',
    sellerId: 's4',
    sellerName: 'Maval Growers FPO',
    unit: 'kg',
    price: 125,
    availableQuantity: 800,
    minimumQuantity: 1,
    grade: 'Premium',
    location: 'Maval, Maharashtra',
    pin: '400008',
    organic: false,
    harvestDate: '2026-10-30',
    image: './crops/staple-dal.webp',
    rating: 4.8,
    reviews: 57,
    tiers: [{ min: 25, price: 112 }],
  },
  {
    id: 'l-turmeric',
    title: 'Pure turmeric powder',
    variety: 'Salem · single origin',
    category: 'Spices',
    sellerId: 's3',
    sellerName: 'Patil Family Farms',
    unit: 'kg',
    price: 220,
    availableQuantity: 200,
    minimumQuantity: 1,
    grade: 'Premium',
    location: 'Sangli, Maharashtra',
    pin: '400008',
    organic: true,
    harvestDate: '2026-10-28',
    image: './crops/staple-turmeric.webp',
    rating: 4.9,
    reviews: 44,
    badge: 'Single origin',
    tiers: [{ min: 10, price: 195 }],
  },
];

const seededIds = new Set(['veg-tomato', 'leafy-palak', 'veg-red-onion', 'fruit-banana', 'root-carrot', 'staple-rice', 'staple-dal', 'staple-turmeric']);

const directoryListings: Listing[] = produceCatalog
  .filter((item) => !seededIds.has(item.id) && (item.group === 'fruits' || ['vegetables', 'gourds', 'leafy', 'exotic'].includes(item.group)))
  .map((item, idx) => ({
    id: `l-${item.id}`,
    title: item.name,
    variety: item.varieties.join(' · '),
    category: item.group === 'fruits' ? 'Fruits' : 'Vegetables',
    sellerId: idx % 2 === 0 ? 's1' : 's2',
    sellerName: idx % 2 === 0 ? 'Sahyadri Farmers Collective' : 'Green Roots Farm',
    unit: item.unit,
    price: item.group === 'fruits' ? 68 : 42,
    availableQuantity: 400,
    minimumQuantity: item.typicalMoq,
    grade: 'Grade A',
    location: `${item.origins[0]}, India`,
    pin: '400008',
    organic: item.group === 'leafy',
    harvestDate: '2026-11-25',
    image: item.image,
    rating: 4.8,
    reviews: 24,
    badge: item.season,
    tiers: [{ min: item.typicalMoq * 2, price: item.group === 'fruits' ? 62 : 36 }],
  }));

export const listings: Listing[] = [...baseListings, ...directoryListings];

export const categories = [
  { name: 'All produce', icon: 'sprout' },
  { name: 'Vegetables', icon: 'carrot' },
  { name: 'Fruits', icon: 'apple' },
  { name: 'Grains', icon: 'wheat' },
  { name: 'Pulses', icon: 'bean' },
  { name: 'Spices', icon: 'flower' },
];

export const sampleOrders = [
  {
    id: 'KS-2048',
    seller: 'Sahyadri Farmers Collective',
    date: '21 Nov 2026',
    items: 'Red tomatoes · 5 kg, Red onions · 5 kg',
    total: 300,
    status: 'In transit',
    step: 2,
  },
  {
    id: 'KS-2021',
    seller: 'Green Roots Farm',
    date: '18 Nov 2026',
    items: 'Spinach · 2 kg, Carrots · 3 kg',
    total: 234,
    status: 'Delivered',
    step: 3,
  },
];

export const sampleQuotes = [
  {
    id: 'q1',
    seller: 'Sahyadri Farmers Collective',
    produce: 'Grade A red tomatoes',
    qty: 100,
    price: 24,
    delivery: 150,
    eta: '24 Nov, morning',
    rating: 4.9,
  },
  {
    id: 'q2',
    seller: 'Green Roots Farm',
    produce: 'Grade A red tomatoes',
    qty: 100,
    price: 27,
    delivery: 0,
    eta: '24 Nov, afternoon',
    rating: 4.8,
  },
];
