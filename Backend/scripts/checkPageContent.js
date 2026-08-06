/**
 * Check PageContent and ServicePageContent
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const PageContent = require('../models/PageContent');
const ServicePageContent = require('../models/ServicePageContent');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('━'.repeat(80));
    console.log('📋 PageContent Collection');
    console.log('━'.repeat(80));
    const pageContent = await PageContent.findOne();
    if (pageContent) {
      console.log('  Page ID:', pageContent.pageId);
      console.log('  Hero Title:', pageContent.hero?.title);
      console.log('  Hero Subtitle:', pageContent.hero?.subtitle?.substring(0, 80) + '...');
      console.log('  Statistics:', pageContent.statistics?.length || 0, 'items');
      console.log('\n  ℹ️  This appears to be SERVICE PAGE hero content');
      console.log('  ⚠️  Currently NOT translated - shows same content for all languages');
    } else {
      console.log('  No documents found');
    }

    console.log('\n' + '━'.repeat(80));
    console.log('📋 ServicePageContent Collection');
    console.log('━'.repeat(80));
    const servicePageContent = await ServicePageContent.findOne();
    if (servicePageContent) {
      console.log('  Benefits Title:', servicePageContent.benefitsTitle);
      console.log('  Target Audience Title:', servicePageContent.targetAudienceTitle);
      console.log('  Benefits:', servicePageContent.benefits?.length || 0, 'items');
      console.log('  Target Audience:', servicePageContent.targetAudience?.length || 0, 'items');

      if (servicePageContent.benefits && servicePageContent.benefits.length > 0) {
        console.log('\n  Sample Benefit:', servicePageContent.benefits[0].description?.substring(0, 60) + '...');
      }

      console.log('\n  ℹ️  This appears to be GENERIC benefits/audience for service pages');
      console.log('  ⚠️  Currently NOT translated - shows same content for all languages');
    } else {
      console.log('  No documents found');
    }

    console.log('\n' + '━'.repeat(80));
    console.log('💡 RECOMMENDATION:');
    console.log('━'.repeat(80));
    console.log('These collections contain USER-FACING content that should be translated.');
    console.log('However, each collection only has 1 document (site-wide settings).');
    console.log('');
    console.log('Options:');
    console.log('1. Add translations field to both models');
    console.log('2. Translate the content and store in translations.fr, .de, .nl, .es');
    console.log('3. Update backend routes to return translated content based on ?lang parameter');
    console.log('━'.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

check();
