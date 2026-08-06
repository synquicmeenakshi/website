/**
 * Script to add gallery images to all services based on their type
 * Run: node scripts/addServiceGalleryImages.js
 *
 * Images are sourced from Pexels (free for commercial use)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../models/Service');

// Pexels image URLs - Free for commercial use, no attribution required
const galleryImages = {
  // Relaxation/Zen Massage images
  relaxationMassage: [
    'https://images.pexels.com/photos/3865608/pexels-photo-3865608.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6628530/pexels-photo-6628530.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3865611/pexels-photo-3865611.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6899550/pexels-photo-6899550.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],

  // Hot Stone Massage images
  hotStoneMassage: [
    'https://images.pexels.com/photos/6560266/pexels-photo-6560266.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3865608/pexels-photo-3865608.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6187430/pexels-photo-6187430.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3865611/pexels-photo-3865611.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],

  // Sports Massage images
  sportsMassage: [
    'https://images.pexels.com/photos/6187430/pexels-photo-6187430.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/5473186/pexels-photo-5473186.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/5793981/pexels-photo-5793981.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/5794027/pexels-photo-5794027.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],

  // Back and Neck Massage images
  backNeckMassage: [
    'https://images.pexels.com/photos/19641835/pexels-photo-19641835.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/275768/pexels-photo-275768.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6187430/pexels-photo-6187430.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/5473186/pexels-photo-5473186.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],

  // Scrub Massage images
  scrubMassage: [
    'https://images.pexels.com/photos/3865608/pexels-photo-3865608.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3865611/pexels-photo-3865611.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6628530/pexels-photo-6628530.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6899550/pexels-photo-6899550.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],

  // Facial Treatment images
  facialGeneral: [
    'https://images.pexels.com/photos/5069494/pexels-photo-5069494.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3985329/pexels-photo-3985329.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6560343/pexels-photo-6560343.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6724433/pexels-photo-6724433.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],

  // Anti-aging Facial images
  facialAntiAging: [
    'https://images.pexels.com/photos/3736398/pexels-photo-3736398.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3735626/pexels-photo-3735626.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6766261/pexels-photo-6766261.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/7011227/pexels-photo-7011227.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],

  // Purifying Facial images
  facialPurifying: [
    'https://images.pexels.com/photos/6560343/pexels-photo-6560343.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/5069494/pexels-photo-5069494.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3985329/pexels-photo-3985329.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6724433/pexels-photo-6724433.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],

  // Hydrating Facial images
  facialHydrating: [
    'https://images.pexels.com/photos/3985329/pexels-photo-3985329.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3736398/pexels-photo-3736398.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6766261/pexels-photo-6766261.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/5069494/pexels-photo-5069494.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],

  // PMU Eyebrows/Microblading images
  pmuEyebrows: [
    'https://images.pexels.com/photos/5693815/pexels-photo-5693815.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1912366/pexels-photo-1912366.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/14665673/pexels-photo-14665673.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],

  // PMU Eyes images
  pmuEyes: [
    'https://images.pexels.com/photos/3657418/pexels-photo-3657418.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/256380/pexels-photo-256380.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/5693815/pexels-photo-5693815.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1912366/pexels-photo-1912366.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],

  // PMU General images
  pmuGeneral: [
    'https://images.pexels.com/photos/5693815/pexels-photo-5693815.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3657418/pexels-photo-3657418.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1912366/pexels-photo-1912366.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/14665673/pexels-photo-14665673.jpeg?auto=compress&cs=tinysrgb&w=800'
  ]
};

// Function to determine the best gallery images based on service title
function getGalleryImages(title, category) {
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category?.toLowerCase() || '';

  // Hot stone massage
  if (lowerTitle.includes('hotstone') || lowerTitle.includes('hot stone') || lowerTitle.includes('stone')) {
    return galleryImages.hotStoneMassage;
  }

  // Sports massage
  if (lowerTitle.includes('sport')) {
    return galleryImages.sportsMassage;
  }

  // Back and neck massage
  if (lowerTitle.includes('back') || lowerTitle.includes('neck')) {
    return galleryImages.backNeckMassage;
  }

  // Scrub massage
  if (lowerTitle.includes('scrub') || lowerTitle.includes('exfoliat')) {
    return galleryImages.scrubMassage;
  }

  // Zen/Relaxation massage
  if (lowerTitle.includes('zen') || lowerTitle.includes('relax')) {
    return galleryImages.relaxationMassage;
  }

  // Facial - Anti-aging/Mesoeclat
  if (lowerTitle.includes('anti-aging') || lowerTitle.includes('antiaging') || lowerTitle.includes('mesoeclat')) {
    return galleryImages.facialAntiAging;
  }

  // Facial - Purifying
  if (lowerTitle.includes('purif')) {
    return galleryImages.facialPurifying;
  }

  // Facial - Hydra
  if (lowerTitle.includes('hydra')) {
    return galleryImages.facialHydrating;
  }

  // Facial - Mini coup d'eclat or general facial
  if (lowerTitle.includes('mini') || lowerTitle.includes('eclat') || lowerTitle.includes('facial') || lowerCategory.includes('facial')) {
    return galleryImages.facialGeneral;
  }

  // PMU - Eyes (Upper, Under, or both)
  if (lowerTitle.includes('eye') && lowerCategory.includes('pmu')) {
    return galleryImages.pmuEyes;
  }

  // PMU - Eyebrows/Microblading
  if (lowerTitle.includes('brow') || lowerTitle.includes('microblading')) {
    return galleryImages.pmuEyebrows;
  }

  // PMU - Refreshing or general PMU
  if (lowerTitle.includes('refresh') || lowerCategory.includes('pmu')) {
    return galleryImages.pmuGeneral;
  }

  // Default based on category
  if (lowerCategory.includes('massage')) {
    return galleryImages.relaxationMassage;
  }

  if (lowerCategory.includes('facial')) {
    return galleryImages.facialGeneral;
  }

  if (lowerCategory.includes('pmu')) {
    return galleryImages.pmuGeneral;
  }

  // Ultimate fallback - relaxation massage
  return galleryImages.relaxationMassage;
}

async function addServiceGalleryImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all services
    const services = await Service.find({});
    console.log(`\nFound ${services.length} services to update\n`);

    let updatedCount = 0;

    for (const service of services) {
      const images = getGalleryImages(service.title, service.category);

      // Convert to serviceImages format (with url and caption)
      const serviceImages = images.slice(0, 3).map((url, index) => ({
        url: url,
        caption: ''
      }));

      // Only update if no gallery images exist or less than 3
      if (!service.serviceImages || service.serviceImages.length < 3) {
        await Service.updateOne(
          { _id: service._id },
          { $set: { serviceImages: serviceImages } }
        );
        console.log(`✅ Updated: "${service.title}" -> ${serviceImages.length} gallery images added`);
        updatedCount++;
      } else {
        console.log(`⏭️  Skipped: "${service.title}" (already has ${service.serviceImages.length} gallery images)`);
      }
    }

    console.log(`\n✅ Updated ${updatedCount} services with gallery images`);
    console.log(`⏭️  Skipped ${services.length - updatedCount} services (already had gallery images)`);

    // List all services with their gallery image counts
    console.log('\n--- All Services with Gallery Images ---');
    const updatedServices = await Service.find({}).select('title category serviceImages');
    updatedServices.forEach(s => {
      const imageCount = s.serviceImages?.length || 0;
      console.log(`  - ${s.title} (${s.category}): ${imageCount} images`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

addServiceGalleryImages();
