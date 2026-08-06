/**
 * Add translations for properties and section settings to database
 * Translations are pre-stored to avoid paid API calls during browsing
 *
 * Run with: node scripts/translateProperties.js
 */

const mongoose = require('mongoose');
const { Property, SectionSettings } = require('../models/Property');
require('dotenv').config();

// Pre-translated properties by name
const propertyTranslations = {
  "Lanzarote": {
    fr: {
      name: "Lanzarote",
      description: "Villa moderne en bord de mer avec piscine à débordement.",
      priceUnit: "par nuit",
      parking: "Parking couvert pour 2 véhicules",
      cleanliness: {
        title: "Propreté",
        description: "Nettoyée et désinfectée professionnellement avant chaque séjour."
      },
      amenities: ["Piscine à débordement", "WiFi haut débit", "Parking gratuit"]
    },
    de: {
      name: "Lanzarote",
      description: "Moderne Villa am Meer mit Infinity-Pool.",
      priceUnit: "pro Nacht",
      parking: "Überdachter Parkplatz für 2 Fahrzeuge",
      cleanliness: {
        title: "Sauberkeit",
        description: "Professionell gereinigt und desinfiziert vor jedem Aufenthalt."
      },
      amenities: ["Infinity-Pool", "Highspeed-WLAN", "Kostenloser Parkplatz"]
    },
    nl: {
      name: "Lanzarote",
      description: "Moderne villa aan zee met infinity pool.",
      priceUnit: "per nacht",
      parking: "Overdekte parkeerplaats voor 2 voertuigen",
      cleanliness: {
        title: "Netheid",
        description: "Professioneel schoongemaakt en ontsmet voor elk verblijf."
      },
      amenities: ["Infinity Pool", "Snelle WiFi", "Gratis Parkeren"]
    }
  },
  "Casa": {
    fr: {
      name: "Casa",
      description: "Villa moderne en bord de mer avec piscine à débordement.",
      priceUnit: "par nuit",
      parking: "Parking couvert pour 2 véhicules",
      cleanliness: {
        title: "Propreté",
        description: "Nettoyée et désinfectée professionnellement avant chaque séjour."
      },
      amenities: ["Piscine à débordement", "WiFi haut débit", "Parking gratuit"]
    },
    de: {
      name: "Casa",
      description: "Moderne Villa am Meer mit Infinity-Pool.",
      priceUnit: "pro Nacht",
      parking: "Überdachter Parkplatz für 2 Fahrzeuge",
      cleanliness: {
        title: "Sauberkeit",
        description: "Professionell gereinigt und desinfiziert vor jedem Aufenthalt."
      },
      amenities: ["Infinity-Pool", "Highspeed-WLAN", "Kostenloser Parkplatz"]
    },
    nl: {
      name: "Casa",
      description: "Moderne villa aan zee met infinity pool.",
      priceUnit: "per nacht",
      parking: "Overdekte parkeerplaats voor 2 voertuigen",
      cleanliness: {
        title: "Netheid",
        description: "Professioneel schoongemaakt en ontsmet voor elk verblijf."
      },
      amenities: ["Infinity Pool", "Snelle WiFi", "Gratis Parkeren"]
    }
  },
  "Casa Miramar": {
    fr: {
      name: "Casa Miramar",
      description: "Villa moderne en bord de mer avec piscine à débordement.",
      priceUnit: "par nuit",
      parking: "Parking couvert pour 2 véhicules",
      cleanliness: {
        title: "Propreté",
        description: "Nettoyée et désinfectée professionnellement avant chaque séjour."
      },
      amenities: ["Piscine à débordement", "WiFi haut débit", "Parking gratuit"]
    },
    de: {
      name: "Casa Miramar",
      description: "Moderne Villa am Meer mit Infinity-Pool.",
      priceUnit: "pro Nacht",
      parking: "Überdachter Parkplatz für 2 Fahrzeuge",
      cleanliness: {
        title: "Sauberkeit",
        description: "Professionell gereinigt und desinfiziert vor jedem Aufenthalt."
      },
      amenities: ["Infinity-Pool", "Highspeed-WLAN", "Kostenloser Parkplatz"]
    },
    nl: {
      name: "Casa Miramar",
      description: "Moderne villa aan zee met infinity pool.",
      priceUnit: "per nacht",
      parking: "Overdekte parkeerplaats voor 2 voertuigen",
      cleanliness: {
        title: "Netheid",
        description: "Professioneel schoongemaakt en ontsmet voor elk verblijf."
      },
      amenities: ["Infinity Pool", "Snelle WiFi", "Gratis Parkeren"]
    }
  }
};

// Pre-translated section settings
const sectionSettingsTranslations = {
  "apartments": {
    en: {
      title: "Apartments",
      description: "Discover our handpicked collection of premium apartments, each offering modern amenities and stunning views for an unforgettable stay."
    },
    fr: {
      title: "Appartements",
      description: "Découvrez notre collection soigneusement sélectionnée d'appartements premium, chacun offrant des équipements modernes et des vues imprenables pour un séjour inoubliable."
    },
    de: {
      title: "Apartments",
      description: "Entdecken Sie unsere handverlesene Sammlung von Premium-Apartments, die jeweils moderne Annehmlichkeiten und atemberaubende Aussichten für einen unvergesslichen Aufenthalt bieten."
    },
    nl: {
      title: "Appartementen",
      description: "Ontdek onze zorgvuldig samengestelde collectie premium appartementen, elk met moderne voorzieningen en adembenemend uitzicht voor een onvergetelijk verblijf."
    }
  }
};

async function addTranslations() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zenyourlife';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    // === Translate Properties ===
    console.log('=== Translating Properties ===');
    let propertyUpdatedCount = 0;
    let propertySkippedCount = 0;
    let propertyNotFoundCount = 0;

    for (const [name, translations] of Object.entries(propertyTranslations)) {
      // Find property by name
      const property = await Property.findOne({ name: name });

      if (!property) {
        console.log(`❌ Property not found: ${name}`);
        propertyNotFoundCount++;
        continue;
      }

      // Check if already has translations
      const hasTranslations = property.translations?.fr?.name ||
                              property.translations?.de?.name ||
                              property.translations?.nl?.name;

      if (hasTranslations) {
        console.log(`⏭️  Skipping (already translated): ${name}`);
        propertySkippedCount++;
        continue;
      }

      // Update with translations
      property.translations = {
        fr: translations.fr,
        de: translations.de,
        nl: translations.nl
      };

      await property.save();
      console.log(`✅ Added translations for property: ${name}`);
      propertyUpdatedCount++;
    }

    console.log(`\nProperty Summary: Updated ${propertyUpdatedCount}, Skipped ${propertySkippedCount}, Not found ${propertyNotFoundCount}`);

    // === Translate Section Settings ===
    console.log('\n=== Translating Section Settings ===');
    let settingsUpdatedCount = 0;

    for (const [sectionType, translations] of Object.entries(sectionSettingsTranslations)) {
      // Find or create section settings
      let settings = await SectionSettings.findOne({ sectionType: sectionType });

      if (!settings) {
        // Create new settings with translations
        settings = new SectionSettings({
          sectionType: sectionType,
          title: translations.en.title,
          description: translations.en.description,
          translations: {
            fr: translations.fr,
            de: translations.de,
            nl: translations.nl
          }
        });
        await settings.save();
        console.log(`✅ Created and translated section settings: ${sectionType}`);
        settingsUpdatedCount++;
      } else {
        // Check if already has translations
        const hasTranslations = settings.translations?.fr?.title ||
                                settings.translations?.de?.title ||
                                settings.translations?.nl?.title;

        if (hasTranslations) {
          console.log(`⏭️  Skipping (already translated): ${sectionType}`);
        } else {
          settings.translations = {
            fr: translations.fr,
            de: translations.de,
            nl: translations.nl
          };
          await settings.save();
          console.log(`✅ Added translations for section settings: ${sectionType}`);
          settingsUpdatedCount++;
        }
      }
    }

    console.log(`\nSection Settings Summary: Updated/Created ${settingsUpdatedCount}`);

    console.log(`\n========================================`);
    console.log(`Property & Section Settings Translation Complete!`);
    console.log(`========================================\n`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

addTranslations();
