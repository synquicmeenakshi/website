/**
 * Script to update Casa Artevista property with Booking.com content
 * Run this with: node scripts/updateCasaArtevistaOverview.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const { Property } = require('../models/Property');

const casaArtevistaOverview = {
  title: 'Casa Artevista - Charming Villa in Tabayesco',
  description1: "Welcome to Casa Artevista, an elegant villa nestled in the peaceful village of Tabayesco, Lanzarote. This charming property features two comfortable bedrooms with queen beds and a modern bathroom. Enjoy stunning garden views from your private terrace and balcony, or unwind in the relaxing hot tub after a day of exploring the island.",
  description2: "The villa offers modern amenities including free WiFi throughout, a fully equipped kitchen, TV, and washing machine for your convenience. Located just a 19-minute walk from the beautiful Playa de la Garita beach, with popular attractions like Jardín de Cactus Gardens and La Cueva de los Verdes Cave only 7 km away. The property is 28 km from Lanzarote Airport, making it easily accessible.",
  highlights: [
    'Private hot tub for relaxation',
    'Free WiFi throughout the property',
    'Private terrace with garden views',
    'Balcony for enjoying the scenery',
    '2 bedrooms with queen beds',
    'Modern bathroom',
    'Fully equipped kitchen',
    'TV for entertainment',
    'Washing machine available',
    '100 m² of private space',
    '19-minute walk to Playa de la Garita',
    'Near Jardín de Cactus Gardens (7 km)',
    'Near La Cueva de los Verdes (7 km)',
    '28 km from Lanzarote Airport',
    'Top rated location (10.0)',
    'Wonderful guest rating (9.0)'
  ],
  features: [
    {
      title: 'Elegant Accommodation',
      description: 'Two-bedroom villa with terrace, balcony, garden views, private hot tub, and modern bathroom.',
      imageUrl: ''
    },
    {
      title: 'Modern Amenities',
      description: 'Free WiFi, fully equipped kitchen, TV, washing machine - everything for a comfortable stay.',
      imageUrl: ''
    },
    {
      title: 'Convenient Location',
      description: '28 km from airport, 19-min walk to beach, near Jardín de Cactus and La Cueva de los Verdes (7 km each).',
      imageUrl: ''
    }
  ]
};

// Also update the main description
const mainDescription = "Elegant villa in Tabayesco featuring 2 bedrooms, terrace, balcony, garden views, and private hot tub. Enjoy free WiFi, fully equipped kitchen, and modern amenities. Just 19 minutes walk from Playa de la Garita beach with nearby attractions including Jardín de Cactus Gardens.";

// Update amenities to match Booking.com
const amenities = [
  'Hot Tub',
  'Free WiFi',
  'Kitchen',
  'Terrace',
  'Balcony',
  'Garden View',
  'TV',
  'Washing Machine',
  'Private Bathroom'
];

async function updateCasaArtevista() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Casa Artevista property
    const property = await Property.findOne({
      name: { $regex: /casa.*artevista/i }
    });

    if (!property) {
      console.log('Casa Artevista property not found. Available properties:');
      const allProperties = await Property.find({}, 'name');
      allProperties.forEach(p => console.log(`   - ${p.name} (ID: ${p._id})`));
      console.log('\nPlease update the property manually using the property ID above');
      process.exit(0);
    }

    console.log(`Found property: ${property.name} (ID: ${property._id})`);

    // Update the property with new content from Booking.com
    property.overview = casaArtevistaOverview;
    property.description = mainDescription;
    property.amenities = amenities;
    property.bedrooms = 2; // As per Booking.com
    property.guests = 4; // 2 queen beds = 4 guests

    await property.save();

    console.log('Casa Artevista updated successfully with Booking.com content!');
    console.log('\nUpdated content:');
    console.log(`Title: ${casaArtevistaOverview.title}`);
    console.log(`Description: ${mainDescription}`);
    console.log(`\nHighlights (${casaArtevistaOverview.highlights.length} items):`);
    casaArtevistaOverview.highlights.forEach((h, i) => {
      console.log(`  ${i + 1}. ${h}`);
    });
    console.log(`\nFeatures (${casaArtevistaOverview.features.length} items):`);
    casaArtevistaOverview.features.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.title}: ${f.description}`);
    });
    console.log(`\nAmenities (${amenities.length} items):`);
    amenities.forEach((a, i) => {
      console.log(`  ${i + 1}. ${a}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error updating Casa Artevista:', error);
    process.exit(1);
  }
}

updateCasaArtevista();
