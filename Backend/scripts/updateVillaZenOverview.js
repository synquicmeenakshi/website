/**
 * Script to update Villa Zen Your Life property with Booking.com content
 * Run this with: node scripts/updateVillaZenOverview.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const { Property } = require('../models/Property');

const villaZenOverview = {
  title: 'Villa Zen Your Life - Your Perfect Lanzarote Escape',
  description1: "Experience elegant accommodation at Villa Zen Your Life, featuring a sun terrace, beautiful garden, and a year-round outdoor pool with free WiFi throughout. This stunning villa offers 3 spacious bedrooms and 2 modern bathrooms, complete with air conditioning to keep you comfortable in the Lanzarote sun. The fully equipped kitchen has everything you need, plus a washing machine for longer stays.",
  description2: "Enjoy comfortable amenities including BBQ facilities perfect for evening gatherings, outdoor seating areas to soak in the views, and private check-in/check-out for your convenience. Located in a prime position just 1.9 km from the beautiful Playa Dorada beach, with Montañas de Fuego (20 km) and Timanfaya National Park (24 km) easily accessible. The property is 29 km from the airport with free private parking on-site.",
  highlights: [
    'Year-round outdoor swimming pool',
    'Free WiFi throughout the property',
    'Free private parking on-site',
    'BBQ facilities for outdoor dining',
    'Sun terrace with stunning views',
    'Beautiful private garden',
    '3 bedrooms with comfortable beds',
    '2 modern bathrooms',
    'Air conditioning in all rooms',
    'Fully equipped kitchen',
    'Washing machine available',
    'Private check-in and check-out',
    'Outdoor seating areas',
    '1.9 km from Playa Dorada beach',
    'Near Timanfaya National Park (24 km)',
    '29 km from Lanzarote Airport'
  ],
  features: [
    {
      title: 'Elegant Accommodation',
      description: 'Sun terrace, garden, year-round outdoor pool with free WiFi throughout the property.',
      imageUrl: ''
    },
    {
      title: 'Comfortable Amenities',
      description: '3 bedrooms, 2 bathrooms, AC, fully equipped kitchen, washing machine, BBQ, outdoor seating, private check-in/out.',
      imageUrl: ''
    },
    {
      title: 'Prime Location',
      description: '29 km from airport, 1.9 km from Playa Dorada, near Montañas de Fuego (20 km) and Timanfaya (24 km). Free parking available.',
      imageUrl: ''
    }
  ]
};

// Also update the main description
const mainDescription = "Elegant villa featuring a sun terrace, beautiful garden, and year-round outdoor pool. Enjoy 3 bedrooms, 2 bathrooms, air conditioning, fully equipped kitchen, and BBQ facilities. Located just 1.9 km from Playa Dorada beach with free WiFi and private parking.";

// Update amenities to match Booking.com
const amenities = [
  'Swimming Pool',
  'Free WiFi',
  'Free Parking',
  'BBQ Facilities',
  'Terrace',
  'Garden',
  'Air Conditioning',
  'Fully Equipped Kitchen',
  'Washing Machine',
  'Outdoor Seating'
];

async function updateVillaZen() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Villa Zen Your Life property
    const property = await Property.findOne({
      name: { $regex: /zen.*life/i }
    });

    if (!property) {
      console.log('Villa Zen Your Life property not found. Available properties:');
      const allProperties = await Property.find({}, 'name');
      allProperties.forEach(p => console.log(`   - ${p.name} (ID: ${p._id})`));
      console.log('\nPlease update the property manually using the property ID above');
      process.exit(0);
    }

    console.log(`Found property: ${property.name} (ID: ${property._id})`);

    // Update the property with new content from Booking.com
    property.overview = villaZenOverview;
    property.description = mainDescription;
    property.amenities = amenities;
    property.bedrooms = 3; // As per Booking.com

    await property.save();

    console.log('Villa Zen Your Life updated successfully with Booking.com content!');
    console.log('\nUpdated content:');
    console.log(`Title: ${villaZenOverview.title}`);
    console.log(`Description: ${mainDescription}`);
    console.log(`\nHighlights (${villaZenOverview.highlights.length} items):`);
    villaZenOverview.highlights.forEach((h, i) => {
      console.log(`  ${i + 1}. ${h}`);
    });
    console.log(`\nFeatures (${villaZenOverview.features.length} items):`);
    villaZenOverview.features.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.title}: ${f.description}`);
    });
    console.log(`\nAmenities (${amenities.length} items):`);
    amenities.forEach((a, i) => {
      console.log(`  ${i + 1}. ${a}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error updating Villa Zen Your Life:', error);
    process.exit(1);
  }
}

updateVillaZen();
