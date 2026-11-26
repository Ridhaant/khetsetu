export const PRODUCE_GROUPS = [
  { id: 'all', en: 'All produce', hi: 'सभी उपज' },
  { id: 'fruits', en: 'Fruits', hi: 'ताज़े फल' },
  { id: 'vegetables', en: 'Daily vegetables', hi: 'दैनिक सब्ज़ियाँ' },
  { id: 'gourds', en: 'Gourds & roots', hi: 'लौकी-कद्दू व जड़ें' },
  { id: 'leafy', en: 'Leafy & herbs', hi: 'पत्तेदार साग व मसाले' },
  { id: 'exotic', en: 'Exotic & salad', hi: 'एग्ज़ॉटिक व सलाद' },
  { id: 'staples', en: 'Grains, pulses & spices', hi: 'अनाज, दाल व सूखे मसाले' },
];

export const SEASONS = [
  { id: 'all', en: 'All seasons', hi: 'सभी मौसम' },
  { id: 'Year-round', en: 'Year-round', hi: 'पूरे साल' },
  { id: 'Winter', en: 'Winter / Rabi', hi: 'सर्दी / रबी' },
  { id: 'Summer', en: 'Summer', hi: 'गर्मी' },
  { id: 'Monsoon', en: 'Monsoon / Kharif', hi: 'बरसात / खरीफ' },
];

const GROUP_CATEGORY = {
  fruits: 'Fruits',
  vegetables: 'Vegetables',
  gourds: 'Vegetables',
  leafy: 'Vegetables',
  exotic: 'Vegetables',
  staples: 'Grains & Spices',
};

const RAW_PRODUCE = [
  // Daily vegetables
  ['veg-tomato', 'Tomato', 'टमाटर', 'vegetables', ['Hybrid (Abhinav/Sahoo)', 'Desi / Nattu', 'Roma'], ['Nashik', 'Kolar', 'Madanapalle'], 'Year-round', 'crate', 10, '#df5e43'],
  ['veg-red-onion', 'Red Onion', 'लाल प्याज़', 'vegetables', ['Nashik Bhima Super', 'Garwa', 'Pune Fursungi'], ['Lasalgaon', 'Nashik', 'Pune'], 'Year-round', 'quintal', 5, '#b6496b'],
  ['veg-white-onion', 'White & Pink Onion', 'सफ़ेद / गुलाबी प्याज़', 'vegetables', ['Bhima Shweta', 'Mahua Pink', 'Dehydration Grade'], ['Mahuva', 'Nashik', 'Indore'], 'Winter', 'quintal', 5, '#c8808f'],
  ['veg-potato', 'Potato', 'आलू', 'vegetables', ['Jyoti', 'Chandramukhi', 'Chipsona', 'Pahadi'], ['Agra', 'Deesa', 'Indore', 'Hooghly'], 'Year-round', 'quintal', 10, '#c1965b'],
  ['veg-garlic', 'Garlic', 'लहसुन', 'vegetables', ['Ooty Bold', 'MP Desi', 'G2 Single Clove'], ['Mandsaur', 'Kota', 'Ooty'], 'Year-round', 'kg', 50, '#b59d78'],
  ['veg-ginger', 'Fresh Ginger', 'अदरक', 'vegetables', ['Varada', 'Nadia', 'Mahima'], ['Wayanad', 'Satara', 'Meghalaya'], 'Year-round', 'kg', 50, '#c68b45'],
  ['veg-green-chilli', 'Green Chilli', 'हरी मिर्च', 'vegetables', ['G4', 'Teja', 'Sitara', 'Bhavnagri'], ['Guntur', 'Nandurbar', 'Byadgi'], 'Year-round', 'kg', 25, '#3b8c47'],
  ['veg-capsicum', 'Capsicum / Bell Pepper', 'शिमला मिर्च', 'vegetables', ['Green California Wonder', 'Red', 'Yellow'], ['Pune', 'Solan', 'Bengaluru'], 'Year-round', 'crate', 5, '#4b9444'],
  ['veg-cauliflower', 'Cauliflower', 'फूलगोभी', 'vegetables', ['Pusa Snowball', 'Early Kunwari'], ['Nashik', 'Ranchi', 'Sonipat'], 'Winter', 'crate', 10, '#789b65'],
  ['veg-cabbage', 'Cabbage', 'पत्तागोभी', 'vegetables', ['Green Ball', 'Savoy', 'Red Cabbage'], ['Pune', 'Kolar', 'Ooty'], 'Year-round', 'quintal', 3, '#57985a'],
  ['veg-green-peas', 'Green Peas', 'हरी मटर', 'vegetables', ['Arkel', 'AP-3', 'Azad P-1'], ['Jabalpur', 'Shimla', 'Kota'], 'Winter', 'kg', 50, '#4f9c4e'],
  ['veg-okra', 'Okra / Bhindi', 'भिंडी', 'vegetables', ['Arka Anamika', 'Parbhani Kranti', 'Hybrid Tender'], ['Surat', 'Nashik', 'Varanasi'], 'Summer', 'kg', 50, '#488d4b'],
  ['veg-brinjal', 'Brinjal / Eggplant', 'बैंगन', 'vegetables', ['Bharta Round', 'Small Violet', 'Green Long'], ['Pune', 'Surat', 'Bengaluru'], 'Year-round', 'kg', 50, '#72468a'],
  ['veg-drumstick', 'Drumstick / Moringa', 'सहजन / मुनगा', 'vegetables', ['PKM-1', 'Jaffna Long'], ['Dindigul', 'Madurai', 'Solapur'], 'Year-round', 'kg', 40, '#5a8e46'],
  ['veg-french-beans', 'French Beans', 'फ़्रेंच बीन्स', 'vegetables', ['Arka Komal', 'Contender', 'Flat Beans'], ['Bengaluru', 'Pune', 'Ooty'], 'Year-round', 'kg', 30, '#4c8e56'],
  ['veg-guar', 'Cluster Beans / Guar', 'ग्वार फली', 'vegetables', ['Pusa Navbahar', 'Desi Tender'], ['Bikaner', 'Anand', 'Baramati'], 'Summer', 'kg', 40, '#6a964e'],
  ['veg-sem', 'Broad Beans / Sem', 'सेम फली', 'vegetables', ['Flat Papdi', 'Valor', 'Surti Papdi'], ['Surat', 'Raipur', 'Lucknow'], 'Winter', 'kg', 40, '#5a914c'],
  ['veg-lobia', 'Cowpea / Yardlong Beans', 'लोबिया / बरबटी', 'vegetables', ['Yardlong Green', 'Bush Lobia'], ['Varanasi', 'Nashik', 'Thrissur'], 'Monsoon', 'kg', 30, '#4f8c49'],
  ['veg-sweet-corn', 'Sweet Corn & Baby Corn', 'स्वीट कॉर्न / बेबी कॉर्न', 'vegetables', ['Sugar-75 Cob', 'Peeled Baby Corn'], ['Sonipat', 'Nashik', 'Belagavi'], 'Year-round', 'crate', 5, '#d6a42b'],
  ['veg-raw-banana', 'Raw Banana / Plantain', 'कच्चा केला', 'vegetables', ['Nendran', 'Monthan', 'Grand Naine Green'], ['Jalgaon', 'Trichy', 'Thrissur'], 'Year-round', 'quintal', 3, '#679944'],
  ['veg-raw-jackfruit', 'Raw Jackfruit (Kathal)', 'कच्चा कटहल', 'vegetables', ['Tender Sabzi Grade', 'Whole Green'], ['Hajipur', 'Konkan', 'Malabar'], 'Summer', 'kg', 50, '#5d8c45'],

  // Gourds, squash & root vegetables
  ['gourd-lauki', 'Bottle Gourd / Lauki', 'लौकी', 'gourds', ['Pusa Naveen Long', 'Round Lauki'], ['Nashik', 'Barabanki', 'Surat'], 'Year-round', 'crate', 10, '#629c53'],
  ['gourd-karela', 'Bitter Gourd / Karela', 'करेला', 'gourds', ['Pusa Do Mausami', 'Arka Harit', 'Small Desi'], ['Pune', 'Varanasi', 'Coimbatore'], 'Summer', 'kg', 50, '#3f7f3d'],
  ['gourd-turai', 'Ridge Gourd / Turai', 'तोरई', 'gourds', ['Pusa Nasdar', 'Satputia'], ['Nashik', 'Lucknow', 'Guntur'], 'Monsoon', 'kg', 50, '#568d46'],
  ['gourd-gilki', 'Sponge Gourd / Gilki', 'गिल्की / नेनुआ', 'gourds', ['Smooth Green', 'Pusa Chikni'], ['Indore', 'Patna', 'Nashik'], 'Monsoon', 'kg', 50, '#699c4f'],
  ['gourd-chichinda', 'Snake Gourd / Chichinda', 'चिचिंडा / पडवल', 'gourds', ['Long White-Green', 'Short Hybrid'], ['Coimbatore', 'Thrissur', 'Pune'], 'Monsoon', 'kg', 40, '#72a15e'],
  ['gourd-parwal', 'Pointed Gourd / Parwal', 'परवल', 'gourds', ['Swarna Alaukik', 'Rajendra Parwal'], ['Hajipur', 'Varanasi', 'Nadia'], 'Summer', 'kg', 40, '#4c8b47'],
  ['gourd-tendli', 'Ivy Gourd / Tendli', 'टिंडोरा / कुंदरू', 'gourds', ['Stripped Tendli', 'Smooth Green'], ['Surat', 'Ratnagiri', 'Raipur'], 'Year-round', 'kg', 40, '#5f9a4b'],
  ['gourd-tinda', 'Apple Gourd / Tinda', 'टिंडा', 'gourds', ['Desi Green', 'Chappan Kaddu'], ['Karnal', 'Jaipur', 'Meerut'], 'Summer', 'kg', 40, '#73a355'],
  ['gourd-ash', 'Ash Gourd / Petha', 'पेठा / सफ़ेद कद्दू', 'gourds', ['Pusa Ujjwal', 'Matures Petha'], ['Agra', 'Erode', 'Kolar'], 'Year-round', 'quintal', 5, '#7c9a76'],
  ['gourd-pumpkin', 'Pumpkin / Kaddu', 'कद्दू', 'gourds', ['Arka Suryamukhi', 'Yellow Ripe', 'Green Disco'], ['Raipur', 'Indore', 'Nagpur'], 'Year-round', 'quintal', 5, '#d47c2f'],
  ['root-carrot', 'Carrot', 'गाजर', 'gourds', ['Desi Red', 'Ooty Orange Nantes'], ['Ooty', 'Hisar', 'Pune'], 'Winter', 'kg', 50, '#dd7230'],
  ['root-radish', 'Radish / Mooli', 'मूली', 'gourds', ['Pusa Chetki White', 'Red Round'], ['Sonipat', 'Pune', 'Bengaluru'], 'Winter', 'kg', 50, '#96a58e'],
  ['root-beetroot', 'Beetroot', 'चुकंदर', 'gourds', ['Detroit Dark Red', 'Crimson Globe'], ['Ooty', 'Pune', 'Kolar'], 'Year-round', 'kg', 40, '#9b2d4d'],
  ['root-turnip', 'Turnip / Shalgam', 'शलजम', 'gourds', ['Purple Top White', 'Golden Ball'], ['Amritsar', 'Shimla', 'Meerut'], 'Winter', 'kg', 40, '#8d5d85'],
  ['root-sweet-potato', 'Sweet Potato', 'शकरकंद', 'gourds', ['Red Skin', 'White Flesh'], ['Belagavi', 'Etawah', 'Cuttack'], 'Winter', 'kg', 50, '#b95a4c'],
  ['root-arbi', 'Colocasia / Arbi', 'अरबी', 'gourds', ['Sree Rashmi', 'Desi Small'], ['Jalandhar', 'Surat', 'Guntur'], 'Monsoon', 'kg', 50, '#8c765a'],
  ['root-suran', 'Elephant Foot Yam / Suran', 'सूरन / जिमीकंद', 'gourds', ['Gajendra Smooth', 'Desi Yam'], ['Navsari', 'Thrissur', 'Varanasi'], 'Year-round', 'kg', 50, '#916e4b'],
  ['gourd-cucumber', 'Cucumber & Kakdi', 'खीरा / ककड़ी', 'gourds', ['Desi Green', 'English Seedless', 'Lucknow Kakdi'], ['Sonipat', 'Pune', 'Kolar'], 'Summer', 'crate', 10, '#5a994d'],

  // Leafy greens & culinary herbs
  ['leafy-palak', 'Spinach / Palak', 'पालक', 'leafy', ['All Green', 'Pusa Jyoti', 'Organic Bunch'], ['Pune', 'Sonipat', 'Nashik'], 'Year-round', 'kg', 25, '#2f7a41'],
  ['leafy-methi', 'Fenugreek / Methi', 'मेथी', 'leafy', ['Desi Fresh Bunch', 'Kasuri Methi'], ['Nashik', 'Nagaur', 'Pune'], 'Winter', 'kg', 25, '#3b8447'],
  ['leafy-coriander', 'Fresh Coriander / Dhania', 'हरा धनिया', 'leafy', ['Desi Aromatic', 'Hybrid Leaf'], ['Pune', 'Kota', 'Indore'], 'Year-round', 'kg', 20, '#3e8c45'],
  ['leafy-mint', 'Mint / Pudina', 'पुदीना', 'leafy', ['Spear Mint', 'Pahadi Pudina'], ['Barabanki', 'Pune', 'Sonipat'], 'Year-round', 'kg', 15, '#308a58'],
  ['leafy-sarson', 'Mustard Greens / Sarson', 'सरसों का साग', 'leafy', ['Pusa Saag', 'Punjab Broadleaf'], ['Ludhiana', 'Karnal', 'Meerut'], 'Winter', 'kg', 30, '#447f3d'],
  ['leafy-chaulai', 'Amaranth / Chaulai', 'चौलाई (लाल व हरी)', 'leafy', ['Red Chaulai', 'Green Chaulai'], ['Coimbatore', 'Pune', 'Lucknow'], 'Summer', 'kg', 25, '#9d4357'],
  ['leafy-bathua', 'Bathua Greens', 'बथुआ', 'leafy', ['North Indian Winter Bathua'], ['Meerut', 'Hisar', 'Agra'], 'Winter', 'kg', 25, '#4c8149'],
  ['leafy-curry-leaves', 'Curry Leaves', 'कड़ी पत्ता', 'leafy', ['Suwasini', 'Coimbatore Aromatic'], ['Coimbatore', 'Erode', 'Nashik'], 'Year-round', 'kg', 15, '#2b6f3b'],
  ['leafy-spring-onion', 'Spring Onion', 'हरा प्याज़', 'leafy', ['Green Scallion Bunch'], ['Pune', 'Nashik', 'Bengaluru'], 'Winter', 'kg', 25, '#4d9244'],

  // Exotic, salad & specialty vegetables
  ['exotic-broccoli', 'Broccoli', 'ब्रोकली', 'exotic', ['Green Calabrese Florets'], ['Ooty', 'Pune', 'Solan'], 'Winter', 'box', 5, '#3b7e47'],
  ['exotic-zucchini', 'Zucchini', 'ज़ुकीनी', 'exotic', ['Green Zucchini', 'Yellow Gold'], ['Pune', 'Bengaluru', 'Solan'], 'Winter', 'box', 5, '#689c3b'],
  ['exotic-lettuce', 'Lettuce (Iceberg & Romaine)', 'सलाद पत्ता / लेट्यूस', 'exotic', ['Iceberg', 'Romaine', 'Lollo Rosso'], ['Pune', 'Ooty', 'Bengaluru'], 'Winter', 'box', 5, '#6ca958'],
  ['exotic-mushroom', 'Button & Oyster Mushroom', 'बटन मशरूम', 'exotic', ['White Button Punnet', 'Oyster Fresh'], ['Sonipat', 'Solan', 'Pune'], 'Year-round', 'box', 10, '#8d806e'],
  ['exotic-asparagus', 'Asparagus & Celery', 'एस्पैरागस व सेलरी', 'exotic', ['Green Spears', 'Crisp Celery'], ['Mahabaleshwar', 'Ooty', 'Solan'], 'Winter', 'kg', 10, '#568d4e'],

  // Fruits (Tropical, Citrus, Melons, Orchard, Berries & Specialty)
  ['fruit-mango', 'Mango', 'आम', 'fruits', ['Alphonso (Hapus)', 'Kesar', 'Dasheri', 'Langra', 'Banganapalli', 'Totapuri'], ['Ratnagiri', 'Devgad', 'Junagadh', 'Malihabad', 'Chittoor'], 'Summer', 'box', 10, '#e38b29'],
  ['fruit-banana', 'Banana', 'केला', 'fruits', ['Grand Naine (G9)', 'Yelakki', 'Robusta', 'Nendran'], ['Jalgaon', 'Anantapur', 'Theni', 'Thrissur'], 'Year-round', 'quintal', 5, '#d5a82a'],
  ['fruit-apple', 'Apple', 'सेब', 'fruits', ['Kashmiri Red Delicious', 'Shimla Royal', 'Kinnaur Crisp'], ['Shopian', 'Shimla', 'Kinnaur'], 'Winter', 'box', 10, '#c84242'],
  ['fruit-pomegranate', 'Pomegranate', 'अनार', 'fruits', ['Bhagwa', 'Super Bhagwa', 'Ganesh'], ['Solapur', 'Nashik', 'Banaskantha'], 'Year-round', 'crate', 10, '#b33447'],
  ['fruit-grapes', 'Grapes', 'अंगूर', 'fruits', ['Thompson Seedless', 'Sonaka', 'Black Sharad', 'Red Globe'], ['Nashik', 'Sangli', 'Bijapur'], 'Winter', 'box', 10, '#6f4e8e'],
  ['fruit-papaya', 'Papaya', 'पपीता', 'fruits', ['Red Lady', 'Taiwan 786', 'Honey Dew'], ['Anantapur', 'Jalgaon', 'Barwani'], 'Year-round', 'crate', 10, '#df7c34'],
  ['fruit-guava', 'Guava', 'अमरूद', 'fruits', ['Allahabad Safeda', 'Lalit Pink', 'VNR Bihi', 'Thai'], ['Prayagraj', 'Sawai Madhopur', 'Raipur'], 'Winter', 'crate', 10, '#6c9d45'],
  ['fruit-orange', 'Nagpur Orange / Santra', 'संतरा', 'fruits', ['Nagpur Mandarin', 'Coorg Mandarin'], ['Nagpur', 'Amravati', 'Jhalawar'], 'Winter', 'crate', 10, '#de6f24'],
  ['fruit-kinnow', 'Kinnow Mandarin', 'किन्नू', 'fruits', ['Abohar Kinnow', 'Waxed Export Grade'], ['Abohar', 'Fazilka', 'Sri Ganganagar'], 'Winter', 'crate', 10, '#e07b26'],
  ['fruit-mosambi', 'Sweet Lime / Mosambi', 'मौसंबी', 'fruits', ['Nucellar Mosambi', 'Sathgudi'], ['Jalna', 'Aurangabad', 'Nalgonda'], 'Year-round', 'quintal', 5, '#8ca843'],
  ['fruit-lemon', 'Kagzi Lemon / Nimbu', 'कागज़ी नींबू', 'fruits', ['Kagzi', 'Sai Sharbati', 'Seedless Lime'], ['Ahmednagar', 'Vijayapura', 'Guntur'], 'Year-round', 'kg', 50, '#b5a92a'],
  ['fruit-watermelon', 'Watermelon', 'तरबूज़', 'fruits', ['Kiran Dark Green', 'Sugar Baby', 'Striped Namdhari'], ['Kolar', 'Anantapur', 'Unnao'], 'Summer', 'tonne', 1, '#3d8a4b'],
  ['fruit-muskmelon', 'Muskmelon / Kharbuja', 'खरबूजा', 'fruits', ['Kundan', 'Madhumati', 'Netted Melon'], ['Anantapur', 'Tonk', 'Barabanki'], 'Summer', 'crate', 10, '#d29043'],
  ['fruit-pineapple', 'Pineapple', 'अनानास', 'fruits', ['Vazhakulam Mauritius', 'Tripura Queen', 'Giant Kew'], ['Vazhakulam', 'Siliguri', 'Agartala'], 'Year-round', 'crate', 10, '#c6932b'],
  ['fruit-coconut', 'Coconut (Tender & Mature)', 'नारियल (डाब व सूखा)', 'fruits', ['Tender Green Dab', 'Semi-Husked Mature'], ['Pollachi', 'Tiptur', 'East Godavari'], 'Year-round', 'quintal', 5, '#598d4c'],
  ['fruit-chikoo', 'Sapota / Chikoo', 'चीकू', 'fruits', ['Kalipatti', 'Cricket Ball'], ['Dahanu', 'Gholvad', 'Navsari'], 'Winter', 'crate', 10, '#966b43'],
  ['fruit-litchi', 'Litchi', 'लीची', 'fruits', ['Shahi Muzaffarpur', 'China', 'Rose Scented'], ['Muzaffarpur', 'Dehradun', 'Pathankot'], 'Summer', 'box', 10, '#c94c5b'],
  ['fruit-strawberry', 'Strawberry', 'स्ट्रॉबेरी', 'fruits', ['Winter Dawn', 'Camarosa', 'Sweet Charlie'], ['Mahabaleshwar', 'Panchgani', 'Nainital'], 'Winter', 'box', 10, '#cc3d4d'],
  ['fruit-sitaphal', 'Custard Apple / Sitaphal', 'सीताफल', 'fruits', ['Balanagar', 'NMK-1 Golden'], ['Beed', 'Baramati', 'Udaipur'], 'Winter', 'crate', 10, '#729755'],
  ['fruit-pear', 'Pear / Nashpati', 'नाशपाती', 'fruits', ['Babbugosha', 'Patharnakh', 'Kashmiri Nakh'], ['Amritsar', 'Shimla', 'Shopian'], 'Monsoon', 'box', 10, '#85a349'],
  ['fruit-peach-plum', 'Peach & Plum', 'आड़ू व आलूबुखारा', 'fruits', ['Shan-e-Punjab Peach', 'Santa Rosa Plum'], ['Nainital', 'Shimla', 'Amritsar'], 'Summer', 'box', 10, '#cc6755'],
  ['fruit-apricot-cherry', 'Apricot & Cherry', 'ख़ुबानी व चेरी', 'fruits', ['Kashmiri Mishri Cherry', 'Ladakh Halman Apricot'], ['Srinagar', 'Kargil', 'Kinnaur'], 'Summer', 'box', 10, '#b53f4b'],
  ['fruit-jamun', 'Jamun (Black Plum)', 'जामुन', 'fruits', ['Ra Jamun', 'Konkan Seedless'], ['Konkan', 'Lucknow', 'Indore'], 'Summer', 'crate', 5, '#5d396e'],
  ['fruit-amla', 'Amla (Indian Gooseberry)', 'आंवला', 'fruits', ['Chakaiya', 'Banarasi', 'NA-7'], ['Pratapgarh', 'Varanasi', 'Ajmer'], 'Winter', 'kg', 50, '#7c9f44'],
  ['fruit-ber', 'Ber (Indian Jujube)', 'बेर (एप्पल व उमरण)', 'fruits', ['Umran', 'Apple Ber', 'Gola'], ['Bikaner', 'Jalna', 'Anantapur'], 'Winter', 'crate', 10, '#7ca146'],
  ['fruit-fig', 'Fresh Fig / Anjeer', 'ताज़ा अंजीर', 'fruits', ['Poona Fig', 'Dinkar'], ['Purandar', 'Pune', 'Bellary'], 'Summer', 'box', 5, '#7c5368'],
  ['fruit-jackfruit', 'Ripe Jackfruit', 'पका कटहल', 'fruits', ['Varikka Sweet', 'Koozha'], ['Thrissur', 'Cuddalore', 'Tumakuru'], 'Summer', 'kg', 50, '#a89238'],
  ['fruit-dragon', 'Dragon Fruit / Kamalam', 'ड्रैगन फ्रूट (कमलम)', 'fruits', ['Red Flesh', 'White Flesh'], ['Kutch', 'Solapur', 'Sangli'], 'Monsoon', 'box', 5, '#c83e6d'],
  ['fruit-kiwi', 'Kiwi', 'कीवी', 'fruits', ['Hayward Green', 'Bruno'], ['Ziro Valley', 'Shimla', 'Sikkim'], 'Winter', 'box', 5, '#7a9440'],
  ['fruit-avocado', 'Avocado / Makhanphal', 'एवोकाडो', 'fruits', ['Coorg Green', 'Hass Type'], ['Kodagu', 'Kodaikanal', 'Sikkim'], 'Monsoon', 'box', 5, '#4b7a3d'],
  ['fruit-bael', 'Wood Apple / Bael', 'बेल फल', 'fruits', ['Narendra Bael-5', 'Kagzi Bael'], ['Ayodhya', 'Rewa', 'Prayagraj'], 'Summer', 'kg', 50, '#a68743'],
  ['fruit-tamarind', 'Tamarind / Imli', 'इमली', 'fruits', ['Deseeded Slab', 'Whole Sweet Pod'], ['Jagdalpur', 'Tumakuru', 'Dharmapuri'], 'Summer', 'kg', 50, '#84593e'],

  // Grains, pulses & dry spices
  ['staple-rice', 'Indrayani & Basmati Rice', 'इंद्रायणी व बासमती चावल', 'staples', ['Indrayani Unpolished', '1121 Basmati', 'Sona Masoori'], ['Maval', 'Karnal', 'Raichur'], 'Year-round', 'quintal', 5, '#a89159'],
  ['staple-dal', 'Unpolished Toor & Moong Dal', 'तूर व मूंग दाल', 'staples', ['Latur Toor', 'Green Moong', 'Chana Dal'], ['Latur', 'Akola', 'Bikaner'], 'Year-round', 'quintal', 5, '#c48f36'],
  ['staple-turmeric', 'Turmeric (Salem & Sangli)', 'हल्दी', 'staples', ['Salem Finger', 'Sangli Rajapuri', 'Lakadong'], ['Sangli', 'Erode', 'Jaintia Hills'], 'Year-round', 'kg', 50, '#cc8925'],
  ['staple-dry-spices', 'Dry Chilli, Cumin & Coriander', 'सूखी मिर्च, जीरा व धनिया', 'staples', ['Byadgi / Guntur Chilli', 'Unjha Jeera', 'Ramganj Dhania'], ['Guntur', 'Unjha', 'Kota'], 'Year-round', 'kg', 50, '#b34131'],
];

export const produceCatalog = RAW_PRODUCE.map(
  ([id, name, nameHi, group, varieties, origins, season, unit, typicalMoq, accent]) => ({
    id,
    name,
    nameHi,
    group,
    category: GROUP_CATEGORY[group],
    varieties,
    origins,
    season,
    unit,
    typicalMoq,
    accent,
  }),
);

export function filterProduceCatalog(items, { group = 'all', season = 'all', search = '' } = {}) {
  const q = search.trim().toLowerCase();
  return items.filter((item) => {
    if (group !== 'all' && item.group !== group) return false;
    if (season !== 'all' && item.season !== season) return false;
    if (!q) return true;
    const haystack = [
      item.name,
      item.nameHi,
      item.category,
      ...item.varieties,
      ...item.origins,
      item.season,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function catalogSummaryCounts(items = produceCatalog) {
  const fruits = items.filter((item) => item.group === 'fruits').length;
  const vegetables = items.filter((item) =>
    ['vegetables', 'gourds', 'leafy', 'exotic'].includes(item.group),
  ).length;
  const staples = items.filter((item) => item.group === 'staples').length;
  return {
    total: items.length,
    fruits,
    vegetables,
    staples,
  };
}
