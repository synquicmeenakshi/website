/**
 * Script to update rental-page overview pool description
 * Changes "year-round" / "geopend" to "heated" / "verwarmd" in all languages
 * Run: node backend/scripts/updateOverviewPool.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const updateOverviewPool = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the rental page overview collection
    const db = mongoose.connection.db;
    const collection = db.collection('rentaloverviewsettings');

    const overview = await collection.findOne({});

    if (!overview) {
      console.log('❌ Rental page overview not found');
      mongoose.connection.close();
      process.exit(1);
    }

    console.log('📦 Found rental page overview');
    console.log('Current NL card description:', overview.translations?.nl?.cards?.[0]?.description);
    console.log('');

    // Update English cards
    if (overview.cards && overview.cards[0]) {
      overview.cards[0].description = overview.cards[0].description
        .replace(/year-round outdoor pool/gi, 'heated outdoor pool')
        .replace(/outdoor pool that is open year-round/gi, 'heated outdoor pool')
        .replace(/outdoor pool open year-round/gi, 'heated outdoor pool');
    }

    // Update French translations
    if (overview.translations?.fr?.cards?.[0]) {
      overview.translations.fr.cards[0].description = overview.translations.fr.cards[0].description
        .replace(/piscine extérieure ouverte toute l'année/gi, 'piscine extérieure chauffée')
        .replace(/ouverte toute l'année/gi, 'chauffée');
    }

    // Update German translations
    if (overview.translations?.de?.cards?.[0]) {
      overview.translations.de.cards[0].description = overview.translations.de.cards[0].description
        .replace(/ganzjährig geöffneten Außenpool/gi, 'beheizten Außenpool')
        .replace(/ganzjährig geöffnet/gi, 'beheizt');
    }

    // Update Dutch translations
    if (overview.translations?.nl?.cards?.[0]) {
      overview.translations.nl.cards[0].description = overview.translations.nl.cards[0].description
        .replace(/buitenzwembad dat het hele jaar geopend is/gi, 'verwarmd buitenzwembad')
        .replace(/het hele jaar geopend/gi, 'verwarmd');
    }

    // Update Spanish translations
    if (overview.translations?.es?.cards?.[0]) {
      overview.translations.es.cards[0].description = overview.translations.es.cards[0].description
        .replace(/piscina exterior abierta todo el año/gi, 'piscina exterior climatizada')
        .replace(/abierta todo el año/gi, 'climatizada');
    }

    // Save the updated document
    await collection.updateOne(
      { _id: overview._id },
      {
        $set: {
          cards: overview.cards,
          translations: overview.translations
        }
      }
    );

    console.log('✅ Updated all translations!');
    console.log('');
    console.log('New descriptions:');
    console.log('EN:', overview.cards?.[0]?.description);
    console.log('FR:', overview.translations?.fr?.cards?.[0]?.description);
    console.log('DE:', overview.translations?.de?.cards?.[0]?.description);
    console.log('NL:', overview.translations?.nl?.cards?.[0]?.description);
    console.log('ES:', overview.translations?.es?.cards?.[0]?.description);

    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

updateOverviewPool();
