import { PrismaClient } from '@prisma/client';
import { seedListings, sellers, serviceAreaCandidates } from '../src/seed.ts';
const db=new PrismaClient();
try {
  await db.$transaction(async tx=>{
    for(const [id,role,name]of [['buyer-demo','buyer','Demo buyer'],['admin-demo','admin','Demo operations']] as const){await tx.user.upsert({where:{id},create:{id,role,profile:{create:{displayName:name,consentVersion:'development-fixture',consentAt:new Date()}}},update:{}});}
    for(const seller of sellers){const userId=`user-${seller.id}`;await tx.user.upsert({where:{id:userId},create:{id:userId,role:'seller',profile:{create:{displayName:seller.name,consentVersion:'development-fixture',consentAt:new Date()}}},update:{}});await tx.sellerProfile.upsert({where:{id:seller.id},create:{id:seller.id,userId,name:seller.name,sellerType:seller.type,location:seller.location,originPin:seller.pin,verified:true,compliance:{fixture:true,productionVerification:false}},update:{}});}
    for(const name of ['Vegetables','Fruits','Grains','Pulses','Spices','Oilseeds'])await tx.category.upsert({where:{id:name.toLowerCase()},create:{id:name.toLowerCase(),name,nameHi:({Vegetables:'सब्ज़ियाँ',Fruits:'फल',Grains:'अनाज',Pulses:'दालें',Spices:'मसाले',Oilseeds:'तिलहन'} as Record<string,string>)[name]!},update:{}});
    for(const listing of seedListings()){
      const productId=`product-${listing.id}`;await tx.product.upsert({where:{id:productId},create:{id:productId,categoryId:listing.category.toLowerCase(),name:listing.title,variety:listing.variety},update:{}});
      await tx.listing.upsert({where:{id:listing.id},create:{id:listing.id,sellerId:listing.sellerId,productId,title:listing.title,unit:listing.unit,grade:listing.grade,pricePaise:Math.round(listing.price*100),minimumMilli:listing.minimumQuantity*1000,status:'active',organic:listing.organic,harvestDate:new Date(listing.harvestDate),expiresAt:new Date(listing.expiresAt),inventory:{create:{id:`lot-${listing.id}`,stockMilli:listing.availableQuantity*1000}},tiers:{create:listing.tiers.map(t=>({minMilli:t.minQuantity*1000,pricePaise:Math.round(t.price*100)}))}},update:{}});
    }
    await tx.address.upsert({where:{id:'buyer-demo-home'},create:{id:'buyer-demo-home',userId:'buyer-demo',name:'Demo buyer',line1:'Development fixture address',city:'Mumbai',state:'Maharashtra',pin:'400008'},update:{}});
    // Database coverage stays explicit and fail-closed. New candidate areas are disabled;
    // never import the format-only national demo policy as operational carrier coverage.
    for(const area of serviceAreaCandidates)await tx.serviceArea.upsert({where:{pin:area.pin},create:{...area,active:false,deliveryPaise:4900,freeAbovePaise:100000},update:{}});
    for(const unit of ['kg','gram','quintal','tonne','litre','piece','box','bag','crate'])await tx.catalogueOption.upsert({where:{kind_name:{kind:'unit',name:unit}},create:{kind:'unit',name:unit,config:{physicalDimension:['kg','gram','quintal','tonne'].includes(unit)?'mass':'requires_listing_specific_conversion'}},update:{}});
  });
  console.log('Development fixtures seeded. Demo users have no production OTP identity or credentials.');
} finally {await db.$disconnect();}
