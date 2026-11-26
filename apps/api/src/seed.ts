import type { Listing } from './types.ts';

const image = (path: string) =>
  path.startsWith('https://')
    ? path
    : `https://thumb.wikimedia.org/wikipedia/commons/thumb/${path}`;

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
    ['l-tomato', 'Farm-fresh tomatoes', 'Vegetables', 's1', 32, 480, false, '8/89/Tomato_je.jpg/500px-Tomato_je.jpg', 'Hybrid / Desi'],
    ['l-onion', 'Red onions', 'Vegetables', 's2', 28, 900, false, '9/9f/Red_Onion_on_White.JPG/500px-Red_Onion_on_White.JPG', 'Nashik Bhima Super'],
    ['l-banana', 'Naturally ripened bananas', 'Fruits', 's1', 48, 220, false, 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg', 'Grand Naine (G9)'],
    ['l-spinach', 'Tender baby spinach', 'Vegetables', 's2', 45, 85, true, 'c/c5/Liat_Portal_for_Foodie_Disorder_-_Fresh_spinach_from_San_Francisco_farmers_market.jpg/500px-Liat_Portal_for_Foodie_Disorder_-_Fresh_spinach_from_San_Francisco_farmers_market.jpg', 'Palak / All Green'],
    ['l-carrot', 'Fresh carrots', 'Vegetables', 's3', 42, 1200, false, 'a/a2/Vegetable-Carrot-Bundle-wStalks.jpg/500px-Vegetable-Carrot-Bundle-wStalks.jpg', 'Ooty Orange Nantes'],
    ['l-rice', 'Indrayani rice', 'Grains', 's3', 68, 640, false, '0/07/Khyma_and_Basmati_rice.jpg/500px-Khyma_and_Basmati_rice.jpg', 'Unpolished Indrayani'],
    ['l-pomegranate', 'Bhagwa pomegranates', 'Fruits', 's1', 120, 180, false, '6/6a/Pomegranate_Juice_%282019%29.jpg/500px-Pomegranate_Juice_%282019%29.jpg', 'Super Bhagwa'],
    ['l-turmeric', 'Farm-ground turmeric', 'Spices', 's3', 220, 120, true, '5/5b/Curcuma_longa_roots.jpg/500px-Curcuma_longa_roots.jpg', 'Salem / Sangli'],
    ['l-dal', 'Unpolished toor dal', 'Pulses', 's3', 115, 300, false, '0/02/Pigeon_Pea_%28Toor_Dal%29_%2849683602388%29.jpg/500px-Pigeon_Pea_%28Toor_Dal%29_%2849683602388%29.jpg', 'Latur Grade A'],

    // Expanded Indian vegetables
    ['l-potato', 'Jyoti table potatoes', 'Vegetables', 's2', 24, 2400, false, 'a/ab/Patates.jpg/500px-Patates.jpg', 'Jyoti / Chipsona'],
    ['l-white-onion', 'White dehydration onions', 'Vegetables', 's1', 34, 1100, false, 'b/b6/White_onions_drying.jpg/500px-White_onions_drying.jpg', 'Bhima Shweta'],
    ['l-garlic', 'MP bold garlic', 'Vegetables', 's3', 145, 420, false, '4/49/Opened_garlic_bulb_with_garlic_clove.jpg/500px-Opened_garlic_bulb_with_garlic_clove.jpg', 'Ooty / MP Bold'],
    ['l-ginger', 'Fresh washed ginger', 'Vegetables', 's3', 110, 350, false, '6/62/Liat_Portal_for_Foodie_Disorder_-_Fresh_ginger_root_from_San_Francisco_farmers_market.jpg/500px-Liat_Portal_for_Foodie_Disorder_-_Fresh_ginger_root_from_San_Francisco_farmers_market.jpg', 'Varada / Mahima'],
    ['l-chilli', 'G4 green chillies', 'Vegetables', 's1', 54, 400, false, 'c/ce/Chili_green.jpg/500px-Chili_green.jpg', 'G4 / Teja'],
    ['l-capsicum', 'Green bell capsicum', 'Vegetables', 's2', 58, 360, false, '8/85/Green-Yellow-Red-Pepper-2009.jpg/500px-Green-Yellow-Red-Pepper-2009.jpg', 'California Wonder'],
    ['l-cauliflower', 'Snowball cauliflower', 'Vegetables', 's2', 36, 520, false, '2/2f/Chou-fleur_02.jpg/500px-Chou-fleur_02.jpg', 'Pusa Snowball'],
    ['l-cabbage', 'Green ball cabbage', 'Vegetables', 's2', 22, 780, false, '6/6f/Cabbage_and_cross_section_on_white.jpg/500px-Cabbage_and_cross_section_on_white.jpg', 'Green Ball'],
    ['l-peas', 'Fresh green peas', 'Vegetables', 's3', 75, 450, false, 'b/bc/Doperwt_rijserwt_peulen_Pisum_sativum.jpg/500px-Doperwt_rijserwt_peulen_Pisum_sativum.jpg', 'Arkel Sweet'],
    ['l-okra', 'Tender okra (bhindi)', 'Vegetables', 's2', 46, 380, false, '9/95/Hong_Kong_Okra_Aug_25_2012.JPG/500px-Hong_Kong_Okra_Aug_25_2012.JPG', 'Arka Anamika'],
    ['l-brinjal', 'Round bharta brinjal', 'Vegetables', 's2', 34, 410, false, '7/76/Solanum_melongena_24_08_2012_%281%29.JPG/500px-Solanum_melongena_24_08_2012_%281%29.JPG', 'Bharta & Small Violet'],
    ['l-drumstick', 'PKM-1 drumsticks', 'Vegetables', 's1', 64, 240, false, '1/1b/Moringa_oleifera_pods_NP.JPG/500px-Moringa_oleifera_pods_NP.JPG', 'PKM-1 Moringa'],
    ['l-french-beans', 'Crisp French beans', 'Vegetables', 's2', 62, 260, false, 'a/a0/Heaps_of_beans.jpg/500px-Heaps_of_beans.jpg', 'Arka Komal'],
    ['l-lauki', 'Bottle gourd (lauki)', 'Vegetables', 's2', 26, 620, false, 'a/a4/Bottle_Gourd.jpg/500px-Bottle_Gourd.jpg', 'Pusa Naveen'],
    ['l-karela', 'Bitter gourd (karela)', 'Vegetables', 's2', 44, 340, false, 'd/d1/Bittergourd.jpg/500px-Bittergourd.jpg', 'Pusa Do Mausami'],
    ['l-turai', 'Ridge gourd (turai)', 'Vegetables', 's2', 40, 290, false, 'c/c0/Starr-120606-7022-plant-Luffa_acutangula-fruit-Kahanu_Gardens_Veggie_Garden_Hana.jpg/500px-Starr-120606-7022-plant-Luffa_acutangula-fruit-Kahanu_Gardens_Veggie_Garden_Hana.jpg', 'Pusa Nasdar'],
    ['l-parwal', 'Pointed gourd (parwal)', 'Vegetables', 's3', 58, 220, false, '0/05/Trichosanthes_dioica_%28fruit%29.jpg/500px-Trichosanthes_dioica_%28fruit%29.jpg', 'Swarna Alaukik'],
    ['l-tendli', 'Ivy gourd (tendli)', 'Vegetables', 's1', 42, 310, false, '0/06/Ivy_Gourd_%28Coccinia_grandis%29scarlet_gourd_tindora%2C_or_kowai_fruit_KhaWiiTee.jpg/500px-Ivy_Gourd_%28Coccinia_grandis%29scarlet_gourd_tindora%2C_or_kowai_fruit_KhaWiiTee.jpg', 'Stripped Tendli'],
    ['l-pumpkin', 'Ripe yellow pumpkin', 'Vegetables', 's3', 22, 950, false, '5/5c/FrenchMarketPumpkinsB.jpg/500px-FrenchMarketPumpkinsB.jpg', 'Arka Suryamukhi'],
    ['l-beetroot', 'Dark red beetroot', 'Vegetables', 's3', 38, 430, false, 'a/ae/Detroitdarkredbeets.png/500px-Detroitdarkredbeets.png', 'Detroit Dark Red'],
    ['l-radish', 'White mooli radish', 'Vegetables', 's2', 26, 480, false, 'c/cb/Daikon.Japan.jpg/500px-Daikon.Japan.jpg', 'Pusa Chetki'],
    ['l-cucumber', 'Desi green cucumber', 'Vegetables', 's2', 30, 540, false, '9/96/ARS_cucumber.jpg/500px-ARS_cucumber.jpg', 'Desi / Seedless'],
    ['l-methi', 'Fresh fenugreek (methi)', 'Vegetables', 's2', 52, 160, true, 'd/dc/Washed_fenugreek_leaves_for_cooking_methi-chadachadi.jpg/500px-Washed_fenugreek_leaves_for_cooking_methi-chadachadi.jpg', 'Desi Leaf'],
    ['l-coriander', 'Aromatic coriander bunch', 'Vegetables', 's2', 60, 140, true, '4/41/Liat_Portal_for_Foodie_Disorder_-_Cilantro_from_San_Francisco_Farmers_Market.jpg/500px-Liat_Portal_for_Foodie_Disorder_-_Cilantro_from_San_Francisco_Farmers_Market.jpg', 'Desi Dhania'],
    ['l-mint', 'Fresh garden mint', 'Vegetables', 's2', 70, 90, true, 'e/e1/Mint_leaves_%28Mentha_spicata%29.jpg/500px-Mint_leaves_%28Mentha_spicata%29.jpg', 'Spear Mint'],
    ['l-broccoli', 'Green broccoli florets', 'Vegetables', 's1', 92, 175, false, '0/03/Broccoli_and_cross_section_edit.jpg/500px-Broccoli_and_cross_section_edit.jpg', 'Ooty Calabrese'],
    ['l-mushroom', 'Fresh button mushrooms', 'Vegetables', 's3', 160, 150, false, '0/01/ChampignonMushroom.jpg/500px-ChampignonMushroom.jpg', 'White Button'],

    // Expanded Indian fruits
    ['l-mango', 'Ratnagiri Alphonso mangoes', 'Fruits', 's1', 260, 320, false, '8/88/Alphonso_Ripe_Mango_from_north_India.jpg/500px-Alphonso_Ripe_Mango_from_north_India.jpg', 'Alphonso / Kesar'],
    ['l-apple', 'Shimla Royal apples', 'Fruits', 's3', 135, 500, false, 'a/a6/Pink_lady_and_cross_section.jpg/500px-Pink_lady_and_cross_section.jpg', 'Shimla Royal / Kinnaur'],
    ['l-grapes', 'Nashik seedless grapes', 'Fruits', 's1', 78, 420, false, '5/53/Grapes%2C_Rostov-on-Don%2C_Russia.jpg/500px-Grapes%2C_Rostov-on-Don%2C_Russia.jpg', 'Thompson Seedless'],
    ['l-papaya', 'Red Lady papaya', 'Fruits', 's1', 36, 700, false, '1/1e/Papaya_half.jpg/500px-Papaya_half.jpg', 'Red Lady Taiwan'],
    ['l-guava', 'Allahabad Safeda guava', 'Fruits', 's3', 52, 460, false, '8/88/Guava_pink_fruit.jpg/500px-Guava_pink_fruit.jpg', 'Allahabad Safeda'],
    ['l-orange', 'Nagpur mandarin oranges', 'Fruits', 's1', 64, 650, false, '4/49/Mandarin_Oranges_%28Citrus_Reticulata%29.jpg/500px-Mandarin_Oranges_%28Citrus_Reticulata%29.jpg', 'Nagpur Santra'],
    ['l-kinnow', 'Abohar Kinnow mandarins', 'Fruits', 's3', 48, 820, false, 'c/c9/Harvest_Kinnow.jpg/500px-Harvest_Kinnow.jpg', 'Abohar Waxed'],
    ['l-mosambi', 'Sweet lime (mosambi)', 'Fruits', 's1', 54, 740, false, '2/29/Moushumi_or_mushumbi_lebu_%28Citrus_limetta%2C_a_sweet_lemon%29.jpg/500px-Moushumi_or_mushumbi_lebu_%28Citrus_limetta%2C_a_sweet_lemon%29.jpg', 'Nucellar Mosambi'],
    ['l-lemon', 'Kagzi nimbu (lemons)', 'Fruits', 's2', 88, 300, false, 'e/e4/P1030323.JPG/500px-P1030323.JPG', 'Kagzi Sharbati'],
    ['l-watermelon', 'Kiran dark watermelons', 'Fruits', 's1', 20, 1800, false, '4/47/Taiwan_2009_Tainan_City_Organic_Farm_Watermelon_FRD_7962.jpg/500px-Taiwan_2009_Tainan_City_Organic_Farm_Watermelon_FRD_7962.jpg', 'Kiran / Sugar Baby'],
    ['l-muskmelon', 'Sweet netted muskmelon', 'Fruits', 's3', 38, 620, false, 'e/ec/Muskmelon_Bangladeshi.jpg/500px-Muskmelon_Bangladeshi.jpg', 'Kundan / Madhumati'],
    ['l-pineapple', 'Vazhakulam pineapples', 'Fruits', 's3', 56, 480, false, '7/74/%E0%B4%95%E0%B5%88%E0%B4%A4%E0%B4%9A%E0%B5%8D%E0%B4%9A%E0%B4%95%E0%B5%8D%E0%B4%95.jpg/500px-%E0%B4%95%E0%B5%88%E0%B4%A4%E0%B4%9A%E0%B5%8D%E0%B4%9A%E0%B4%95%E0%B5%8D%E0%B4%95.jpg', 'Mauritius / Queen'],
    ['l-chikoo', 'Dahanu Kalipatti chikoo', 'Fruits', 's1', 54, 410, false, 'f/f9/Manilkara_zapota_02368.jpg/500px-Manilkara_zapota_02368.jpg', 'Kalipatti'],
    ['l-litchi', 'Shahi Muzaffarpur litchi', 'Fruits', 's3', 145, 240, false, '4/46/Litchi_chinensis_fruits.JPG/500px-Litchi_chinensis_fruits.JPG', 'Shahi Litchi'],
    ['l-strawberry', 'Mahabaleshwar strawberries', 'Fruits', 's1', 210, 160, false, '4/4c/Garden_strawberry_%28Fragaria_%C3%97_ananassa%29_single2.jpg/500px-Garden_strawberry_%28Fragaria_%C3%97_ananassa%29_single2.jpg', 'Winter Dawn'],
    ['l-sitaphal', 'Golden custard apple', 'Fruits', 's1', 84, 300, false, '4/48/Sugar_apple_with_cross_section.jpg/500px-Sugar_apple_with_cross_section.jpg', 'NMK-1 Golden'],
    ['l-pear', 'Babbugosha pears', 'Fruits', 's3', 92, 340, false, 'c/cf/Pears.jpg/500px-Pears.jpg', 'Babbugosha'],
    ['l-dragon', 'Kutch red dragon fruit', 'Fruits', 's1', 155, 190, false, '4/43/Pitaya_cross_section_ed2.jpg/500px-Pitaya_cross_section_ed2.jpg', 'Red Flesh Kamalam'],
    ['l-amla', 'Banarasi amla', 'Fruits', 's3', 48, 520, true, '4/41/Gooseberry_%28_Phyllanthus_emblica%29.jpg/500px-Gooseberry_%28_Phyllanthus_emblica%29.jpg', 'NA-7 / Banarasi'],
    ['l-coconut', 'Tender green coconuts', 'Fruits', 's1', 42, 1100, false, '6/69/Tender_coconut_image.jpg/500px-Tender_coconut_image.jpg', 'Tender Dab'],
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
