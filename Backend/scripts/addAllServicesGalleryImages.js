/**
 * Script to add UNIQUE gallery images to ALL services (massage, facial, PMU, etc.)
 * Each service gets a different set of images
 * Run with: node scripts/addAllServicesGalleryImages.js
 * Use --force flag to override existing images: node scripts/addAllServicesGalleryImages.js --force
 */

const mongoose = require('mongoose');
const Service = require('../models/Service');
require('dotenv').config();

// Multiple unique image sets for each category - each service gets a different set
const massageImageSets = [
  // Set 1 - Hot Stone Massage themed
  [
    { url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800', caption: 'Hot stone massage therapy' },
    { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', caption: 'Relaxing spa environment' },
    { url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800', caption: 'Professional massage treatment' },
    { url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800', caption: 'Peaceful spa experience' }
  ],
  // Set 2 - Deep Tissue themed
  [
    { url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800', caption: 'Deep tissue massage technique' },
    { url: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800', caption: 'Therapeutic massage session' },
    { url: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800', caption: 'Professional bodywork' },
    { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Spa relaxation room' }
  ],
  // Set 3 - Swedish/Relaxation themed
  [
    { url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800', caption: 'Swedish massage therapy' },
    { url: 'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800', caption: 'Calming spa atmosphere' },
    { url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', caption: 'Treatment room' },
    { url: 'https://images.unsplash.com/photo-1531299204812-e6d44d9a185c?w=800', caption: 'Luxury spa experience' }
  ],
  // Set 4 - Aromatherapy themed
  [
    { url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800', caption: 'Aromatherapy massage oils' },
    { url: 'https://images.unsplash.com/photo-1595450547833-95af46363172?w=800', caption: 'Essential oil therapy' },
    { url: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800', caption: 'Relaxing aromatherapy' },
    { url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800', caption: 'Spa journey' }
  ],
  // Set 5 - Couples/Relaxation themed
  [
    { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', caption: 'Couples massage room' },
    { url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800', caption: 'Romantic spa setting' },
    { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Luxury suite' },
    { url: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800', caption: 'Premium spa service' }
  ],
  // Set 6 - Thai/Sports themed
  [
    { url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800', caption: 'Thai massage technique' },
    { url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800', caption: 'Sports massage therapy' },
    { url: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800', caption: 'Athletic recovery massage' },
    { url: 'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800', caption: 'Professional treatment' }
  ],
  // Set 7 - Prenatal/Gentle themed
  [
    { url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', caption: 'Gentle massage therapy' },
    { url: 'https://images.unsplash.com/photo-1531299204812-e6d44d9a185c?w=800', caption: 'Relaxing treatment room' },
    { url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800', caption: 'Peaceful spa environment' },
    { url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800', caption: 'Nurturing care' }
  ],
  // Set 8 - Reflexology themed
  [
    { url: 'https://images.unsplash.com/photo-1595450547833-95af46363172?w=800', caption: 'Reflexology treatment' },
    { url: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800', caption: 'Foot massage therapy' },
    { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', caption: 'Pressure point massage' },
    { url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800', caption: 'Holistic healing' }
  ],
  // Set 9 - Back & Neck themed
  [
    { url: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800', caption: 'Back and neck massage' },
    { url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800', caption: 'Targeted muscle relief' },
    { url: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800', caption: 'Upper body therapy' },
    { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Tension release massage' }
  ],
  // Set 10 - Full Body Zen themed
  [
    { url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800', caption: 'Full body zen massage' },
    { url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800', caption: 'Complete relaxation' },
    { url: 'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800', caption: 'Mind and body balance' },
    { url: 'https://images.unsplash.com/photo-1531299204812-e6d44d9a185c?w=800', caption: 'Ultimate journey' }
  ]
];

const facialImageSets = [
  // Set 1 - Classic Facial themed
  [
    { url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', caption: 'Luxurious facial treatment' },
    { url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800', caption: 'Professional skincare session' },
    { url: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800', caption: 'Relaxing facial spa' },
    { url: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800', caption: 'Premium skincare experience' }
  ],
  // Set 2 - Anti-Aging themed
  [
    { url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800', caption: 'Anti-aging facial therapy' },
    { url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800', caption: 'Rejuvenating skin treatment' },
    { url: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800', caption: 'Youth-restoring facial' },
    { url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800', caption: 'Premium anti-aging care' }
  ],
  // Set 3 - Hydrating/Moisturizing themed
  [
    { url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800', caption: 'Hydrating facial mask' },
    { url: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800', caption: 'Deep moisture treatment' },
    { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Nourishing skin therapy' },
    { url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800', caption: 'Spa hydration ritual' }
  ],
  // Set 4 - Deep Cleansing/Purifying themed
  [
    { url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800', caption: 'Deep cleansing facial' },
    { url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', caption: 'Pore purifying treatment' },
    { url: 'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800', caption: 'Detox facial therapy' },
    { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', caption: 'Clear skin treatment' }
  ],
  // Set 5 - Glow/Brightening themed
  [
    { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', caption: 'Brightening facial glow' },
    { url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800', caption: 'Radiant skin treatment' },
    { url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800', caption: 'Luminous complexion therapy' },
    { url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800', caption: 'Glowing skin ritual' }
  ],
  // Set 6 - Natural/Organic themed
  [
    { url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800', caption: 'Natural skincare treatment' },
    { url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800', caption: 'Organic facial therapy' },
    { url: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800', caption: 'Botanical skin ritual' },
    { url: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800', caption: 'Pure ingredients care' }
  ]
];

const pmuImageSets = [
  // Set 1 - Eyebrow Microblading themed
  [
    { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', caption: 'Professional microblading' },
    { url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800', caption: 'Eyebrow artistry' },
    { url: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800', caption: 'Precision brow work' },
    { url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800', caption: 'Natural brow enhancement' }
  ],
  // Set 2 - Eyeliner PMU themed
  [
    { url: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=800', caption: 'Permanent eyeliner' },
    { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', caption: 'Eye enhancement' },
    { url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800', caption: 'Precision eye work' },
    { url: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800', caption: 'Eye makeup artistry' }
  ],
  // Set 3 - Lip Blush themed
  [
    { url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800', caption: 'Lip blush treatment' },
    { url: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=800', caption: 'Natural lip color' },
    { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', caption: 'Lip enhancement' },
    { url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800', caption: 'Beautiful lip artistry' }
  ],
  // Set 4 - Full PMU themed
  [
    { url: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800', caption: 'Complete PMU service' },
    { url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800', caption: 'Full beauty treatment' },
    { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', caption: 'Professional beauty care' },
    { url: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=800', caption: 'Expert PMU artistry' }
  ],
  // Set 5 - Touch-up/Refreshing themed
  [
    { url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800', caption: 'PMU refresh treatment' },
    { url: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800', caption: 'Color touch-up' },
    { url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800', caption: 'Maintenance session' },
    { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', caption: 'Refreshing artistry' }
  ],
  // Set 6 - Eyes Upper & Under themed
  [
    { url: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=800', caption: 'Complete eye treatment' },
    { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', caption: 'Upper and lower liner' },
    { url: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800', caption: 'Full eye enhancement' },
    { url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800', caption: 'Expert eye artistry' }
  ]
];

async function addGalleryImagesToAllServices() {
  try {
    // Check for --force flag
    const forceUpdate = process.argv.includes('--force');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zenyourlife';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find ALL active services
    const allServices = await Service.find({ isActive: true }).sort({ displayOrder: 1, createdAt: 1 });

    console.log(`Found ${allServices.length} active services`);

    if (allServices.length === 0) {
      console.log('No services found. Please check the database.');
      await mongoose.disconnect();
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    // Track index for each category to assign different image sets
    let massageIndex = 0;
    let facialIndex = 0;
    let pmuIndex = 0;

    // Update each service with appropriate unique gallery images
    for (const service of allServices) {
      let galleryImages;
      const category = (service.category || '').toLowerCase();

      if (category.includes('massage')) {
        // Get unique image set for this massage service
        galleryImages = massageImageSets[massageIndex % massageImageSets.length];
        massageIndex++;
      } else if (category.includes('facial')) {
        // Get unique image set for this facial service
        galleryImages = facialImageSets[facialIndex % facialImageSets.length];
        facialIndex++;
      } else if (category.includes('pmu') || category.includes('beauty')) {
        // Get unique image set for this PMU service
        galleryImages = pmuImageSets[pmuIndex % pmuImageSets.length];
        pmuIndex++;
      } else {
        // Default to first massage set for other categories
        galleryImages = massageImageSets[0];
      }

      // Only update if service doesn't already have gallery images or force update is requested
      if (!service.serviceImages || service.serviceImages.length === 0 || forceUpdate) {
        await Service.findByIdAndUpdate(
          service._id,
          { serviceImages: galleryImages },
          { new: true }
        );
        console.log(`✓ Added unique gallery images to: ${service.title} (${service.category || 'no category'})`);
        updatedCount++;
      } else {
        console.log(`⊘ Skipped (already has ${service.serviceImages.length} images): ${service.title}`);
        skippedCount++;
      }
    }

    console.log('\n========================================');
    console.log(`✅ Unique gallery images update complete!`);
    console.log(`   Updated: ${updatedCount} services`);
    console.log(`   Skipped: ${skippedCount} services`);
    console.log(`   Massage sets used: ${massageIndex}`);
    console.log(`   Facial sets used: ${facialIndex}`);
    console.log(`   PMU sets used: ${pmuIndex}`);
    console.log('========================================');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
addGalleryImagesToAllServices();
