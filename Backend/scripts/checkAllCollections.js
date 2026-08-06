/**
 * Check ALL database collections for content
 * Identify which collections have data and might need translations
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import all models
const Service = require('../models/Service');
const { Property } = require('../models/Property');
const FAQ = require('../models/FAQ');
const Testimonial = require('../models/Testimonial');
const RentalTestimonial = require('../models/RentalTestimonial');
const { RentalOverviewSettings } = require('../models/RentalPageSettings');
const LegalPage = require('../models/LegalPage');
const PageContent = require('../models/PageContent');
const ServicePageContent = require('../models/ServicePageContent');
const Appointment = require('../models/Appointment');
const BlockedDate = require('../models/BlockedDate');
const BookingSettings = require('../models/BookingSettings');
const ContactMessage = require('../models/ContactMessage');
const RContactMessage = require('../models/RContactMessage');
const RentalBooking = require('../models/RentalBooking');

async function checkAllCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    console.log('🔍 Checking all database collections...\n');
    console.log('━'.repeat(80));

    const collections = [
      // Collections WITH translations field (already translated)
      {
        name: 'Services',
        model: Service,
        hasTranslations: true,
        userFacing: true
      },
      {
        name: 'Properties',
        model: Property,
        hasTranslations: true,
        userFacing: true
      },
      {
        name: 'FAQs',
        model: FAQ,
        hasTranslations: true,
        userFacing: true
      },
      {
        name: 'Testimonials',
        model: Testimonial,
        hasTranslations: true,
        userFacing: true
      },
      {
        name: 'RentalTestimonials',
        model: RentalTestimonial,
        hasTranslations: true,
        userFacing: true
      },
      {
        name: 'RentalOverviewSettings',
        model: RentalOverviewSettings,
        hasTranslations: true,
        userFacing: true
      },

      // Collections WITHOUT translations field (check if they need it)
      {
        name: 'LegalPages',
        model: LegalPage,
        hasTranslations: false,
        userFacing: true,
        note: 'Has language field - separate docs per language'
      },
      {
        name: 'PageContent',
        model: PageContent,
        hasTranslations: false,
        userFacing: true,
        note: 'May need translation support'
      },
      {
        name: 'ServicePageContent',
        model: ServicePageContent,
        hasTranslations: false,
        userFacing: true,
        note: 'May need translation support'
      },
      {
        name: 'Appointments',
        model: Appointment,
        hasTranslations: false,
        userFacing: false,
        note: 'Transactional data - no translation needed'
      },
      {
        name: 'BlockedDates',
        model: BlockedDate,
        hasTranslations: false,
        userFacing: false,
        note: 'Configuration data - no translation needed'
      },
      {
        name: 'BookingSettings',
        model: BookingSettings,
        hasTranslations: false,
        userFacing: false,
        note: 'Configuration data - no translation needed'
      },
      {
        name: 'ContactMessages',
        model: ContactMessage,
        hasTranslations: false,
        userFacing: false,
        note: 'User submissions - no translation needed'
      },
      {
        name: 'RentalContactMessages',
        model: RContactMessage,
        hasTranslations: false,
        userFacing: false,
        note: 'User submissions - no translation needed'
      },
      {
        name: 'RentalBookings',
        model: RentalBooking,
        hasTranslations: false,
        userFacing: false,
        note: 'Transactional data - no translation needed'
      }
    ];

    let needsReview = [];

    for (const collection of collections) {
      try {
        const count = await collection.model.countDocuments();
        console.log(`\n📋 ${collection.name}:`);
        console.log(`   Documents: ${count}`);
        console.log(`   Has translations: ${collection.hasTranslations ? '✅ Yes' : '❌ No'}`);
        console.log(`   User-facing: ${collection.userFacing ? '✅ Yes' : '⊘ No'}`);
        if (collection.note) {
          console.log(`   Note: ${collection.note}`);
        }

        // Check if this is a user-facing collection without translations
        if (collection.userFacing && !collection.hasTranslations && count > 0) {
          needsReview.push({
            name: collection.name,
            count: count,
            note: collection.note
          });
        }

        // For collections with documents, show sample
        if (count > 0 && count <= 3) {
          const samples = await collection.model.find().limit(1);
          if (samples.length > 0) {
            const sample = samples[0].toObject();
            const keys = Object.keys(sample).filter(k => !k.startsWith('_') && k !== 'createdAt' && k !== 'updatedAt' && k !== '__v');
            console.log(`   Sample fields: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
          }
        }
      } catch (error) {
        console.log(`   ⚠️  Error checking collection: ${error.message}`);
      }
    }

    console.log('\n' + '━'.repeat(80));
    console.log('📊 SUMMARY');
    console.log('━'.repeat(80));

    if (needsReview.length === 0) {
      console.log('✅ All user-facing collections have translation support!');
    } else {
      console.log('⚠️  Collections that may need translation support:\n');
      for (const item of needsReview) {
        console.log(`   • ${item.name} (${item.count} documents)`);
        if (item.note) {
          console.log(`     ${item.note}`);
        }
      }
    }

    console.log('━'.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

console.log('🚀 Starting database collection audit...\n');
checkAllCollections();
