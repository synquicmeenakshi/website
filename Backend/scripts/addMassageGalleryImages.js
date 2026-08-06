/**
 * Script to add sample massage-related gallery images to all massage/therapy services
 * Run with: node scripts/addMassageGalleryImages.js
 */

const mongoose = require('mongoose');
const Service = require('../models/Service');
require('dotenv').config();

// Sample massage/spa/wellness related images from Unsplash (free to use)
const massageGalleryImages = [
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
  ]
];

async function addGalleryImagesToMassageServices() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zenyourlife';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all massage and therapy services
    const massageServices = await Service.find({
      category: { $in: ['massage', 'therapy'] }
    });

    console.log(`Found ${massageServices.length} massage/therapy services`);

    if (massageServices.length === 0) {
      console.log('No massage services found. Please check the database.');
      await mongoose.disconnect();
      return;
    }

    // Update each service with gallery images
    for (let i = 0; i < massageServices.length; i++) {
      const service = massageServices[i];
      const imageSetIndex = i % massageGalleryImages.length;
      const galleryImages = massageGalleryImages[imageSetIndex];

      // Only update if service doesn't already have gallery images
      if (!service.serviceImages || service.serviceImages.length === 0) {
        await Service.findByIdAndUpdate(
          service._id,
          { serviceImages: galleryImages },
          { new: true }
        );
        console.log(`✓ Added gallery images to: ${service.title}`);
      } else {
        console.log(`⊘ Skipped (already has images): ${service.title}`);
      }
    }

    console.log('\n✅ Gallery images added successfully!');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
addGalleryImagesToMassageServices();
