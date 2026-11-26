import type { Listing } from './types.ts';

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=75`;

export const sellers = [
  {
    id: 's1',
    name: 'Sahyadri Farmers Collective',
    type: 'FPO',
    location: 'Nashik, Maharashtra',
    pin: '422001',
    verified: true,
    rating: 4.9,
    members: 124,
    description: 'Seasonal vegetables and orchard fruits from smallholder farms in the Nashik and Konkan belts.',
  },
  {
    id: 's2',
    name: 'Patil Family Farm',
    type: 'Farmer',
    location: 'Pune, Maharashtra',
    pin: '411001',
    verified: true,
    rating: 4.8,
    members: 1,
    description: 'Daily harvested leafy greens, gourds, and vine vegetables from western Maharashtra.',
  },
  {
    id: 's3',
    name: 'Deccan Harvest FPO',
    type: 'FPO',
    location: 'Pune, Maharashtra',
    pin: '411014',
    verified: true,
    rating: 4.7,
    members: 86,
    description: 'Fruits, root crops, pulses, grains, and farm-ground spices across regional mandis.',
  },
];

// Regional demonstration examples, not a verified postal directory or delivery coverage list.
export const serviceAreaCandidates = [
  { pin: '400008', city: 'Mumbai', state: 'Maharashtra' },
  { pin: '110001', city: 'New Delhi', state: 'Delhi' },
  { pin: '560001', city: 'Bengaluru', state: 'Karnataka' },
  { pin: '600001', city: 'Chennai', state: 'Tamil Nadu' },
  { pin: '700001', city: 'Kolkata', state: 'West Bengal' },
  { pin: '380001', city: 'Ahmedabad', state: 'Gujarat' },
  { pin: '781001', city: 'Guwahati', state: 'Assam' },
  { pin: '744101', city: 'Port Blair', state: 'Andaman and Nicobar Islands' },
];

export function seedListings(): Listing[] {
  const rows: Array<[string, string, string, string, number, number, boolean, string, string?]> = [
    // Core fixture rows kept in initial order for existing test contracts
    ['l-tomato', 'Farm-fresh tomatoes', 'Vegetables', 's1', 32, 480, false, 'photo-1546094096-0df4bcaaa337', 'Hybrid / Desi'],
    ['l-onion', 'Red onions', 'Vegetables', 's2', 28, 900, false, 'photo-1508747703725-719777637510', 'Nashik Bhima Super'],
    ['l-banana', 'Naturally ripened bananas', 'Fruits', 's1', 48, 220, false, 'photo-1603833665858-e61d17a86224', 'Grand Naine (G9)'],
    ['l-spinach', 'Tender baby spinach', 'Vegetables', 's2', 45, 85, true, 'photo-1576045057995-568f588f82fb', 'Palak / All Green'],
    ['l-carrot', 'Fresh carrots', 'Vegetables', 's3', 42, 1200, false, 'photo-1445282768818-728615cc910a', 'Ooty Orange Nantes'],
    ['l-rice', 'Indrayani rice', 'Grains', 's3', 68, 640, false, 'photo-1586201375761-83865001e31c', 'Unpolished Indrayani'],
    ['l-pomegranate', 'Bhagwa pomegranates', 'Fruits', 's1', 120, 180, false, 'photo-1541344999736-83eca272f6fc', 'Super Bhagwa'],
    ['l-turmeric', 'Farm-ground turmeric', 'Spices', 's3', 220, 120, true, 'photo-1615485500704-8e990f9900f0', 'Salem / Sangli'],
    ['l-dal', 'Unpolished toor dal', 'Pulses', 's3', 115, 300, false, 'photo-1515543904379-3d757afe72e4', 'Latur Grade A'],

    // Expanded Indian vegetables
    ['l-potato', 'Jyoti table potatoes', 'Vegetables', 's2', 24, 2400, false, 'photo-1518977676601-b53f82aba655', 'Jyoti / Chipsona'],
    ['l-white-onion', 'White dehydration onions', 'Vegetables', 's1', 34, 1100, false, 'photo-1587049352846-4a222e784d38', 'Bhima Shweta'],
    ['l-garlic', 'MP bold garlic', 'Vegetables', 's3', 145, 420, false, 'photo-1540148426945-6cf22a6b2383', 'Ooty / MP Bold'],
    ['l-ginger', 'Fresh washed ginger', 'Vegetables', 's3', 110, 350, false, 'photo-1615485290382-441e4d049cb5', 'Varada / Mahima'],
    ['l-chilli', 'G4 green chillies', 'Vegetables', 's1', 54, 400, false, 'photo-1588252303782-cb80119abd6d', 'G4 / Teja'],
    ['l-capsicum', 'Green bell capsicum', 'Vegetables', 's2', 58, 360, false, 'photo-1563565375-f3fdfdbefa83', 'California Wonder'],
    ['l-cauliflower', 'Snowball cauliflower', 'Vegetables', 's2', 36, 520, false, 'photo-1568584711075-3d021a7c3ca3', 'Pusa Snowball'],
    ['l-cabbage', 'Green ball cabbage', 'Vegetables', 's2', 22, 780, false, 'photo-1594282486552-05b4d80fbb9f', 'Green Ball'],
    ['l-peas', 'Fresh green peas', 'Vegetables', 's3', 75, 450, false, 'photo-1587735243615-c03f25aaff15', 'Arkel Sweet'],
    ['l-okra', 'Tender okra (bhindi)', 'Vegetables', 's2', 46, 380, false, 'photo-1425543103986-22abb7d7e8d2', 'Arka Anamika'],
    ['l-brinjal', 'Round bharta brinjal', 'Vegetables', 's2', 34, 410, false, 'photo-1615484477778-ca3b77940c25', 'Bharta & Small Violet'],
    ['l-drumstick', 'PKM-1 drumsticks', 'Vegetables', 's1', 64, 240, false, 'photo-1598511797332-7b5e3fb7b4d3', 'PKM-1 Moringa'],
    ['l-french-beans', 'Crisp French beans', 'Vegetables', 's2', 62, 260, false, 'photo-1567375698348-5d9d5ae99de0', 'Arka Komal'],
    ['l-lauki', 'Bottle gourd (lauki)', 'Vegetables', 's2', 26, 620, false, 'photo-1622205313162-be1d5712a43f', 'Pusa Naveen'],
    ['l-karela', 'Bitter gourd (karela)', 'Vegetables', 's2', 44, 340, false, 'photo-1604977042946-1eecc30f269e', 'Pusa Do Mausami'],
    ['l-turai', 'Ridge gourd (turai)', 'Vegetables', 's2', 40, 290, false, 'photo-1597362925123-77861d3fbac7', 'Pusa Nasdar'],
    ['l-parwal', 'Pointed gourd (parwal)', 'Vegetables', 's3', 58, 220, false, 'photo-1597362925123-77861d3fbac7', 'Swarna Alaukik'],
    ['l-tendli', 'Ivy gourd (tendli)', 'Vegetables', 's1', 42, 310, false, 'photo-1597362925123-77861d3fbac7', 'Stripped Tendli'],
    ['l-pumpkin', 'Ripe yellow pumpkin', 'Vegetables', 's3', 22, 950, false, 'photo-1570586437263-ab629fccc818', 'Arka Suryamukhi'],
    ['l-beetroot', 'Dark red beetroot', 'Vegetables', 's3', 38, 430, false, 'photo-1593105544559-ecb03bf76f82', 'Detroit Dark Red'],
    ['l-radish', 'White mooli radish', 'Vegetables', 's2', 26, 480, false, 'photo-1594282486552-05b4d80fbb9f', 'Pusa Chetki'],
    ['l-cucumber', 'Desi green cucumber', 'Vegetables', 's2', 30, 540, false, 'photo-1449300079323-02e209d9d3a6', 'Desi / Seedless'],
    ['l-methi', 'Fresh fenugreek (methi)', 'Vegetables', 's2', 52, 160, true, 'photo-1576045057995-568f588f82fb', 'Desi Leaf'],
    ['l-coriander', 'Aromatic coriander bunch', 'Vegetables', 's2', 60, 140, true, 'photo-1588879460618-9249e7d947d1', 'Desi Dhania'],
    ['l-mint', 'Fresh garden mint', 'Vegetables', 's2', 70, 90, true, 'photo-1628556270448-4d4e4148e1b1', 'Spear Mint'],
    ['l-broccoli', 'Green broccoli florets', 'Vegetables', 's1', 92, 175, false, 'photo-1459411621453-7b03977f4bfc', 'Ooty Calabrese'],
    ['l-mushroom', 'Fresh button mushrooms', 'Vegetables', 's3', 160, 150, false, 'photo-1504674900247-0877df9cc836', 'White Button'],

    // Expanded Indian fruits
    ['l-mango', 'Ratnagiri Alphonso mangoes', 'Fruits', 's1', 260, 320, false, 'photo-1553279768-865429fa0078', 'Alphonso / Kesar'],
    ['l-apple', 'Shimla Royal apples', 'Fruits', 's3', 135, 500, false, 'photo-1560806887-1e4cd0b6cbd6', 'Shimla Royal / Kinnaur'],
    ['l-grapes', 'Nashik seedless grapes', 'Fruits', 's1', 78, 420, false, 'photo-1537640538966-79f369143f8f', 'Thompson Seedless'],
    ['l-papaya', 'Red Lady papaya', 'Fruits', 's1', 36, 700, false, 'photo-1517282009859-f000ec3b26fe', 'Red Lady Taiwan'],
    ['l-guava', 'Allahabad Safeda guava', 'Fruits', 's3', 52, 460, false, 'photo-1536511132770-e5058c7e8c46', 'Allahabad Safeda'],
    ['l-orange', 'Nagpur mandarin oranges', 'Fruits', 's1', 64, 650, false, 'photo-1547514701-42782101795e', 'Nagpur Santra'],
    ['l-kinnow', 'Abohar Kinnow mandarins', 'Fruits', 's3', 48, 820, false, 'photo-1582979512210-99b6a53386f9', 'Abohar Waxed'],
    ['l-mosambi', 'Sweet lime (mosambi)', 'Fruits', 's1', 54, 740, false, 'photo-1591287083773-9a52ba8184a4', 'Nucellar Mosambi'],
    ['l-lemon', 'Kagzi nimbu (lemons)', 'Fruits', 's2', 88, 300, false, 'photo-1590502593747-42a996133562', 'Kagzi Sharbati'],
    ['l-watermelon', 'Kiran dark watermelons', 'Fruits', 's1', 20, 1800, false, 'photo-1587049352846-4a222e784d38', 'Kiran / Sugar Baby'],
    ['l-muskmelon', 'Sweet netted muskmelon', 'Fruits', 's3', 38, 620, false, 'photo-1571575173700-afb9492e6a50', 'Kundan / Madhumati'],
    ['l-pineapple', 'Vazhakulam pineapples', 'Fruits', 's3', 56, 480, false, 'photo-1550258987-190a2d41a8ba', 'Mauritius / Queen'],
    ['l-chikoo', 'Dahanu Kalipatti chikoo', 'Fruits', 's1', 54, 410, false, 'photo-1615485290382-441e4d049cb5', 'Kalipatti'],
    ['l-litchi', 'Shahi Muzaffarpur litchi', 'Fruits', 's3', 145, 240, false, 'photo-1559181567-c3190ca9959b', 'Shahi Litchi'],
    ['l-strawberry', 'Mahabaleshwar strawberries', 'Fruits', 's1', 210, 160, false, 'photo-1464965911861-746a04b4bca6', 'Winter Dawn'],
    ['l-sitaphal', 'Golden custard apple', 'Fruits', 's1', 84, 300, false, 'photo-1528825871115-3581a5387919', 'NMK-1 Golden'],
    ['l-pear', 'Babbugosha pears', 'Fruits', 's3', 92, 340, false, 'photo-1514756331096-242fdeb70d6a', 'Babbugosha'],
    ['l-dragon', 'Kutch red dragon fruit', 'Fruits', 's1', 155, 190, false, 'photo-1527325678964-54921661f888', 'Red Flesh Kamalam'],
    ['l-amla', 'Banarasi amla', 'Fruits', 's3', 48, 520, true, 'photo-1587049352846-4a222e784d38', 'NA-7 / Banarasi'],
    ['l-coconut', 'Tender green coconuts', 'Fruits', 's1', 42, 1100, false, 'photo-1581375074612-d1fd0e661aeb', 'Tender Dab'],
  ];

  return rows.map(([id, title, category, sellerId, price, availableQuantity, organic, img, variety]) => {
    const seller = sellers.find((s) => s.id === sellerId)!;
    return {
      id,
      title,
      category,
      variety: variety ?? 'Local variety',
      sellerId,
      sellerName: seller.name,
      unit: 'kg',
      price,
      availableQuantity,
      reservedQuantity: 0,
      minimumQuantity: 1,
      grade: 'A',
      location: seller.location,
      pin: seller.pin,
      organic,
      harvestDate: new Date().toISOString().slice(0, 10),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      image: image(img),
      tiers: [
        { minQuantity: 25, price: Math.round(price * 0.92) },
        { minQuantity: 100, price: Math.round(price * 0.85) },
      ],
      status: 'active',
      verified: true,
    };
  });
}
