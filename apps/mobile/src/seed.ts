import type { Listing } from './types';

// Offline fixtures mirror API IDs, INR/kg prices, sellers and tier rules. Once connected,
// the API catalogue replaces these fixtures and is authoritative for stock and pricing.
const farms = {
  s1: { name: 'Sahyadri Farmers Collective', location: 'Nashik, Maharashtra', pin: '422001' },
  s2: { name: 'Patil Family Farm', location: 'Pune, Maharashtra', pin: '411001' },
  s3: { name: 'Deccan Harvest FPO', location: 'Pune, Maharashtra', pin: '411014' },
};

const rows: [string, string, string, keyof typeof farms, number, number, boolean, string][] = [
  ['l-tomato', 'Farm-fresh tomatoes', 'Vegetables', 's1', 32, 480, false, '8/89/Tomato_je.jpg/500px-Tomato_je.jpg'],
  ['l-onion', 'Red onions', 'Vegetables', 's2', 28, 900, false, '9/9f/Red_Onion_on_White.JPG/500px-Red_Onion_on_White.JPG'],
  ['l-banana', 'Naturally ripened bananas', 'Fruits', 's1', 48, 220, false, 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'],
  ['l-spinach', 'Tender baby spinach', 'Vegetables', 's2', 45, 85, true, 'c/c5/Liat_Portal_for_Foodie_Disorder_-_Fresh_spinach_from_San_Francisco_farmers_market.jpg/500px-Liat_Portal_for_Foodie_Disorder_-_Fresh_spinach_from_San_Francisco_farmers_market.jpg'],
  ['l-carrot', 'Fresh carrots', 'Vegetables', 's3', 42, 1200, false, 'a/a2/Vegetable-Carrot-Bundle-wStalks.jpg/500px-Vegetable-Carrot-Bundle-wStalks.jpg'],
  ['l-rice', 'Indrayani rice', 'Grains', 's3', 68, 640, false, '0/07/Khyma_and_Basmati_rice.jpg/500px-Khyma_and_Basmati_rice.jpg'],
  ['l-pomegranate', 'Bhagwa pomegranates', 'Fruits', 's1', 120, 180, false, '6/6a/Pomegranate_Juice_%282019%29.jpg/500px-Pomegranate_Juice_%282019%29.jpg'],
  ['l-turmeric', 'Farm-ground turmeric', 'Spices', 's3', 220, 120, true, '5/5b/Curcuma_longa_roots.jpg/500px-Curcuma_longa_roots.jpg'],
  ['l-dal', 'Unpolished toor dal', 'Pulses', 's3', 115, 300, false, '0/02/Pigeon_Pea_%28Toor_Dal%29_%2849683602388%29.jpg/500px-Pigeon_Pea_%28Toor_Dal%29_%2849683602388%29.jpg'],
  ['l-potato', 'Jyoti table potatoes', 'Vegetables', 's2', 24, 2400, false, 'a/ab/Patates.jpg/500px-Patates.jpg'],
  ['l-okra', 'Tender okra (bhindi)', 'Vegetables', 's2', 46, 380, false, '9/95/Hong_Kong_Okra_Aug_25_2012.JPG/500px-Hong_Kong_Okra_Aug_25_2012.JPG'],
  ['l-cauliflower', 'Snowball cauliflower', 'Vegetables', 's2', 36, 520, false, '2/2f/Chou-fleur_02.jpg/500px-Chou-fleur_02.jpg'],
  ['l-capsicum', 'Green capsicum', 'Vegetables', 's2', 58, 360, false, '8/85/Green-Yellow-Red-Pepper-2009.jpg/500px-Green-Yellow-Red-Pepper-2009.jpg'],
  ['l-mango', 'Ratnagiri Alphonso mangoes', 'Fruits', 's1', 260, 320, false, '8/88/Alphonso_Ripe_Mango_from_north_India.jpg/500px-Alphonso_Ripe_Mango_from_north_India.jpg'],
  ['l-apple', 'Shimla Royal apples', 'Fruits', 's3', 135, 500, false, 'a/a6/Pink_lady_and_cross_section.jpg/500px-Pink_lady_and_cross_section.jpg'],
  ['l-grapes', 'Nashik seedless grapes', 'Fruits', 's1', 78, 420, false, '5/53/Grapes%2C_Rostov-on-Don%2C_Russia.jpg/500px-Grapes%2C_Rostov-on-Don%2C_Russia.jpg'],
  ['l-papaya', 'Red Lady papaya', 'Fruits', 's1', 36, 700, false, '1/1e/Papaya_half.jpg/500px-Papaya_half.jpg'],
  ['l-guava', 'Allahabad Safeda guava', 'Fruits', 's3', 52, 460, false, '8/88/Guava_pink_fruit.jpg/500px-Guava_pink_fruit.jpg'],
  ['l-orange', 'Nagpur mandarin oranges', 'Fruits', 's1', 64, 650, false, '4/49/Mandarin_Oranges_%28Citrus_Reticulata%29.jpg/500px-Mandarin_Oranges_%28Citrus_Reticulata%29.jpg'],
  ['l-watermelon', 'Kiran dark watermelons', 'Fruits', 's1', 20, 1800, false, '4/47/Taiwan_2009_Tainan_City_Organic_Farm_Watermelon_FRD_7962.jpg/500px-Taiwan_2009_Tainan_City_Organic_Farm_Watermelon_FRD_7962.jpg'],
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
    image: photo.startsWith('https://')
      ? photo
      : `https://thumb.wikimedia.org/wikipedia/commons/thumb/${photo}`,
    tiers: [
      { minQuantity: 25, price: Math.round(price * 0.92) },
      { minQuantity: 100, price: Math.round(price * 0.85) },
    ],
  }),
);
