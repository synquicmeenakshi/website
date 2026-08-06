/**
 * Script to update all services with appropriate banner images
 * Run: node scripts/updateServiceBanners.js
 *
 * Banner images are sourced from Pexels (free for commercial use)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../models/Service');

// Pexels image URLs - Free for commercial use, no attribution required
const bannerImages = {
  // Massage services
  relaxationMassage: 'https://images.pexels.com/photos/3764568/pexels-photo-3764568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  hotStoneMassage: 'https://images.pexels.com/photos/6560266/pexels-photo-6560266.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  sportsMassage: 'https://images.pexels.com/photos/6187430/pexels-photo-6187430.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  backNeckMassage: 'https://images.pexels.com/photos/19641835/pexels-photo-19641835.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  scrubMassage: 'https://images.pexels.com/photos/3865676/pexels-photo-3865676.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',

  // Facial services
  facialGeneral: 'https://images.pexels.com/photos/5069494/pexels-photo-5069494.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  facialAntiAging: 'https://images.pexels.com/photos/3736398/pexels-photo-3736398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  facialPurifying: 'https://images.pexels.com/photos/3762642/pexels-photo-3762642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  facialHydrating: 'https://images.pexels.com/photos/4841388/pexels-photo-4841388.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',

  // PMU services
  pmuEyebrows: 'https://images.pexels.com/photos/5693815/pexels-photo-5693815.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  pmuEyes: 'https://images.pexels.com/photos/3657418/pexels-photo-3657418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  pmuGeneral: 'https://images.pexels.com/photos/5693815/pexels-photo-5693815.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
};

// Function to determine the best banner image based on service title
function getBannerImageUrl(title, category) {
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category?.toLowerCase() || '';

  // Hot stone massage
  if (lowerTitle.includes('hotstone') || lowerTitle.includes('hot stone') || lowerTitle.includes('stone')) {
    return bannerImages.hotStoneMassage;
  }

  // Sports massage
  if (lowerTitle.includes('sport')) {
    return bannerImages.sportsMassage;
  }

  // Back and neck massage
  if (lowerTitle.includes('back') || lowerTitle.includes('neck')) {
    return bannerImages.backNeckMassage;
  }

  // Scrub massage
  if (lowerTitle.includes('scrub') || lowerTitle.includes('exfoliat')) {
    return bannerImages.scrubMassage;
  }

  // Zen/Relaxation massage
  if (lowerTitle.includes('zen') || lowerTitle.includes('relax')) {
    return bannerImages.relaxationMassage;
  }

  // Facial - Anti-aging/Mesoeclat
  if (lowerTitle.includes('anti-aging') || lowerTitle.includes('antiaging') || lowerTitle.includes('mesoeclat')) {
    return bannerImages.facialAntiAging;
  }

  // Facial - Purifying
  if (lowerTitle.includes('purif')) {
    return bannerImages.facialPurifying;
  }

  // Facial - Hydra
  if (lowerTitle.includes('hydra')) {
    return bannerImages.facialHydrating;
  }

  // Facial - Mini coup d'eclat or general facial
  if (lowerTitle.includes('mini') || lowerTitle.includes('eclat') || lowerTitle.includes('facial') || lowerCategory.includes('facial')) {
    return bannerImages.facialGeneral;
  }

  // PMU - Eyes (Upper, Under, or both)
  if (lowerTitle.includes('eye') && lowerCategory.includes('pmu')) {
    return bannerImages.pmuEyes;
  }

  // PMU - Eyebrows/Microblading
  if (lowerTitle.includes('brow') || lowerTitle.includes('microblading')) {
    return bannerImages.pmuEyebrows;
  }

  // PMU - Refreshing or general PMU
  if (lowerTitle.includes('refresh') || lowerCategory.includes('pmu')) {
    return bannerImages.pmuGeneral;
  }

  // Default based on category
  if (lowerCategory.includes('massage')) {
    return bannerImages.relaxationMassage;
  }

  if (lowerCategory.includes('facial')) {
    return bannerImages.facialGeneral;
  }

  if (lowerCategory.includes('pmu')) {
    return bannerImages.pmuGeneral;
  }

  // Ultimate fallback - relaxation massage
  return bannerImages.relaxationMassage;
}

async function updateServiceBanners() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all services
    const services = await Service.find({});
    console.log(`\nFound ${services.length} services to update\n`);

    let updatedCount = 0;

    for (const service of services) {
      const bannerImageUrl = getBannerImageUrl(service.title, service.category);

      // Only update if no banner image is set or it's empty
      if (!service.bannerImageUrl || service.bannerImageUrl === '') {
        await Service.updateOne(
          { _id: service._id },
          { $set: { bannerImageUrl: bannerImageUrl } }
        );
        console.log(`✅ Updated: "${service.title}" -> ${bannerImageUrl.substring(0, 60)}...`);
        updatedCount++;
      } else {
        console.log(`⏭️  Skipped: "${service.title}" (already has banner image)`);
      }
    }

    console.log(`\n✅ Updated ${updatedCount} services with banner images`);
    console.log(`⏭️  Skipped ${services.length - updatedCount} services (already had banner images)`);

    // List all services with their banner images
    console.log('\n--- All Services with Banner Images ---');
    const updatedServices = await Service.find({}).select('title category bannerImageUrl');
    updatedServices.forEach(s => {
      const bannerUrl = s.bannerImageUrl ? s.bannerImageUrl.substring(0, 50) + '...' : 'None';
      console.log(`  - ${s.title} (${s.category}): ${bannerUrl}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

updateServiceBanners();
