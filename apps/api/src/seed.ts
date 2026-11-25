import type { Listing } from './types.ts';
const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=75`;
export const sellers = [
  { id: 's1', name: 'Sahyadri Farmers Collective', type: 'FPO', location: 'Nashik, Maharashtra', pin: '422001', verified: true, rating: 4.9, members: 124, description: 'Seasonal produce from a collective of smallholder farms in the Nashik valley.' },
  { id: 's2', name: 'Patil Family Farm', type: 'Farmer', location: 'Pune, Maharashtra', pin: '411001', verified: true, rating: 4.8, members: 1, description: 'Family-grown vegetables, harvested fresh each morning.' },
  { id: 's3', name: 'Deccan Harvest FPO', type: 'FPO', location: 'Pune, Maharashtra', pin: '411014', verified: true, rating: 4.7, members: 86, description: 'Pulses, grains, spices, and seasonal fruits from western Maharashtra.' }
];
// Regional demonstration examples, not a verified postal directory or delivery coverage list.
export const serviceAreaCandidates = [
  {pin:'400008',city:'Mumbai',state:'Maharashtra'},
  {pin:'110001',city:'New Delhi',state:'Delhi'},
  {pin:'560001',city:'Bengaluru',state:'Karnataka'},
  {pin:'600001',city:'Chennai',state:'Tamil Nadu'},
  {pin:'700001',city:'Kolkata',state:'West Bengal'},
  {pin:'380001',city:'Ahmedabad',state:'Gujarat'},
  {pin:'781001',city:'Guwahati',state:'Assam'},
  {pin:'744101',city:'Port Blair',state:'Andaman and Nicobar Islands'}
];
export function seedListings(): Listing[] {
  const rows: Array<[string,string,string,string,number,number,boolean,string]> = [
    ['l-tomato','Farm-fresh tomatoes','Vegetables','s1',32,480,false,'photo-1546094096-0df4bcaaa337'],
    ['l-onion','Red onions','Vegetables','s2',28,900,false,'photo-1508747703725-719777637510'],
    ['l-banana','Naturally ripened bananas','Fruits','s1',48,220,false,'photo-1603833665858-e61d17a86224'],
    ['l-spinach','Tender baby spinach','Vegetables','s2',45,85,true,'photo-1576045057995-568f588f82fb'],
    ['l-carrot','Fresh carrots','Vegetables','s3',42,1200,false,'photo-1445282768818-728615cc910a'],
    ['l-rice','Indrayani rice','Grains','s3',68,640,false,'photo-1586201375761-83865001e31c'],
    ['l-pomegranate','Bhagwa pomegranates','Fruits','s1',120,180,false,'photo-1541344999736-83eca272f6fc'],
    ['l-turmeric','Farm-ground turmeric','Spices','s3',220,120,true,'photo-1615485500704-8e990f9900f0'],
    ['l-dal','Unpolished toor dal','Pulses','s3',115,300,false,'photo-1515543904379-3d757afe72e4']
  ];
  return rows.map(([id,title,category,sellerId,price,availableQuantity,organic,img]) => ({ id,title,category,variety: id==='tomato'?'Desi':id==='mango'?'Alphonso':'Local variety',sellerId,sellerName:sellers.find(s=>s.id===sellerId)!.name,unit:'kg',price,availableQuantity,reservedQuantity:0,minimumQuantity:1,grade:'A',location:sellers.find(s=>s.id===sellerId)!.location,pin:sellers.find(s=>s.id===sellerId)!.pin,organic,harvestDate:new Date().toISOString().slice(0,10),expiresAt:new Date(Date.now()+7*86400000).toISOString(),image:image(img),tiers:[{minQuantity:25,price:Math.round(price*0.92)},{minQuantity:100,price:Math.round(price*0.85)}],status:'active',verified:true }));
}
