/**
 * Script to update gallery images from Unsplash to Pexels
 * Run: node scripts/updateGalleryToPexels.js
 *
 * Pexels images are more reliable and free for commercial use
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../models/Service');

// Pexels image URLs - Free for commercial use
const galleryImages = {
  // Relaxation/Zen Massage images
  relaxationMassage: [
    { url: 'https://images.pexels.com/photos/3865608/pexels-photo-3865608.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Massage oil preparation' },
    { url: 'https://images.pexels.com/photos/6628530/pexels-photo-6628530.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Relaxing massage session' },
    { url: 'https://images.pexels.com/photos/3865611/pexels-photo-3865611.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Therapeutic oils' }
  ],

  // Hot Stone Massage images
  hotStoneMassage: [
    { url: 'https://images.pexels.com/photos/6560266/pexels-photo-6560266.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Hot stone therapy' },
    { url: 'https://images.pexels.com/photos/3865608/pexels-photo-3865608.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Massage preparation' },
    { url: 'https://images.pexels.com/photos/6187430/pexels-photo-6187430.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Professional treatment' }
  ],

  // Sports Massage images
  sportsMassage: [
    { url: 'https://images.pexels.com/photos/6187430/pexels-photo-6187430.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Deep tissue massage' },
    { url: 'https://images.pexels.com/photos/5473186/pexels-photo-5473186.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Sports therapy session' },
    { url: 'https://images.pexels.com/photos/5793981/pexels-photo-5793981.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Athletic recovery' }
  ],

  // Back and Neck Massage images
  backNeckMassage: [
    { url: 'https://images.pexels.com/photos/19641835/pexels-photo-19641835.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Back massage therapy' },
    { url: 'https://images.pexels.com/photos/275768/pexels-photo-275768.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Shoulder treatment' },
    { url: 'https://images.pexels.com/photos/6187430/pexels-photo-6187430.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Professional care' }
  ],

  // Scrub Massage images
  scrubMassage: [
    { url: 'https://images.pexels.com/photos/3865608/pexels-photo-3865608.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Body scrub preparation' },
    { url: 'https://images.pexels.com/photos/3865611/pexels-photo-3865611.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Exfoliation treatment' },
    { url: 'https://images.pexels.com/photos/6628530/pexels-photo-6628530.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Spa experience' }
  ],

  // Facial Treatment images
  facialGeneral: [
    { url: 'https://images.pexels.com/photos/5069494/pexels-photo-5069494.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Facial mask application' },
    { url: 'https://images.pexels.com/photos/3985329/pexels-photo-3985329.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Professional facial' },
    { url: 'https://images.pexels.com/photos/6560343/pexels-photo-6560343.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Skincare treatment' }
  ],

  // Anti-aging Facial images
  facialAntiAging: [
    { url: 'https://images.pexels.com/photos/3736398/pexels-photo-3736398.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Anti-aging products' },
    { url: 'https://images.pexels.com/photos/3735626/pexels-photo-3735626.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Premium skincare' },
    { url: 'https://images.pexels.com/photos/6766261/pexels-photo-6766261.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Facial tools' }
  ],

  // Purifying Facial images
  facialPurifying: [
    { url: 'https://images.pexels.com/photos/6560343/pexels-photo-6560343.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Purifying mask' },
    { url: 'https://images.pexels.com/photos/5069494/pexels-photo-5069494.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Deep cleansing' },
    { url: 'https://images.pexels.com/photos/3985329/pexels-photo-3985329.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Facial treatment' }
  ],

  // Hydrating Facial images
  facialHydrating: [
    { url: 'https://images.pexels.com/photos/3985329/pexels-photo-3985329.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Hydrating treatment' },
    { url: 'https://images.pexels.com/photos/3736398/pexels-photo-3736398.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Moisturizing care' },
    { url: 'https://images.pexels.com/photos/6766261/pexels-photo-6766261.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Skincare routine' }
  ],

  // PMU Eyebrows/Microblading images
  pmuEyebrows: [
    { url: 'https://images.pexels.com/photos/5693815/pexels-photo-5693815.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Eyebrow enhancement' },
    { url: 'https://images.pexels.com/photos/1912366/pexels-photo-1912366.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Professional makeup' },
    { url: 'https://images.pexels.com/photos/14665673/pexels-photo-14665673.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Beauty treatment' }
  ],

  // PMU Eyes images
  pmuEyes: [
    { url: 'https://images.pexels.com/photos/3657418/pexels-photo-3657418.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Eye close-up' },
    { url: 'https://images.pexels.com/photos/256380/pexels-photo-256380.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Eyeliner detail' },
    { url: 'https://images.pexels.com/photos/5693815/pexels-photo-5693815.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Eye makeup' }
  ],

  // PMU General images
  pmuGeneral: [
    { url: 'https://images.pexels.com/photos/5693815/pexels-photo-5693815.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Permanent makeup' },
    { url: 'https://images.pexels.com/photos/3657418/pexels-photo-3657418.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Beauty enhancement' },
    { url: 'https://images.pexels.com/photos/1912366/pexels-photo-1912366.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Professional results' }
  ]
};

// Function to determine the best gallery images based on service title
function getGalleryImages(title, category) {
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category?.toLowerCase() || '';

  if (lowerTitle.includes('hotstone') || lowerTitle.includes('hot stone') || lowerTitle.includes('stone')) {
    return galleryImages.hotStoneMassage;
  }
  if (lowerTitle.includes('sport')) {
    return galleryImages.sportsMassage;
  }
  if (lowerTitle.includes('back') || lowerTitle.includes('neck')) {
    return galleryImages.backNeckMassage;
  }
  if (lowerTitle.includes('scrub') || lowerTitle.includes('exfoliat')) {
    return galleryImages.scrubMassage;
  }
  if (lowerTitle.includes('zen') || lowerTitle.includes('relax')) {
    return galleryImages.relaxationMassage;
  }
  if (lowerTitle.includes('anti-aging') || lowerTitle.includes('antiaging') || lowerTitle.includes('mesoeclat')) {
    return galleryImages.facialAntiAging;
  }
  if (lowerTitle.includes('purif')) {
    return galleryImages.facialPurifying;
  }
  if (lowerTitle.includes('hydra')) {
    return galleryImages.facialHydrating;
  }
  if (lowerTitle.includes('mini') || lowerTitle.includes('eclat') || lowerTitle.includes('facial') || lowerCategory.includes('facial')) {
    return galleryImages.facialGeneral;
  }
  if (lowerTitle.includes('eye') && lowerCategory.includes('pmu')) {
    return galleryImages.pmuEyes;
  }
  if (lowerTitle.includes('brow') || lowerTitle.includes('microblading')) {
    return galleryImages.pmuEyebrows;
  }
  if (lowerTitle.includes('refresh') || lowerCategory.includes('pmu')) {
    return galleryImages.pmuGeneral;
  }
  if (lowerCategory.includes('massage')) {
    return galleryImages.relaxationMassage;
  }
  if (lowerCategory.includes('facial')) {
    return galleryImages.facialGeneral;
  }
  if (lowerCategory.includes('pmu')) {
    return galleryImages.pmuGeneral;
  }
  return galleryImages.relaxationMassage;
}

async function updateGalleryImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const services = await Service.find({});
    console.log(`\nUpdating ${services.length} services with Pexels gallery images\n`);

    for (const service of services) {
      const images = getGalleryImages(service.title, service.category);

      await Service.updateOne(
        { _id: service._id },
        { $set: { serviceImages: images } }
      );
      console.log(`✅ Updated: "${service.title}" -> 3 Pexels gallery images`);
    }

    console.log(`\n✅ All ${services.length} services updated with Pexels images`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

updateGalleryImages();
