/**
 * Script to translate Overview section content to all languages
 * Run with: node scripts/translateOverviewContent.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const { RentalOverviewSettings } = require('../models/RentalPageSettings');

// Manual translations for Overview section
const translations = {
  nl: {
    badge: 'Overzicht',
    title1: 'Vind een Ruimte die Voelt',
    title2: 'Als je Eiland Thuis',
    description1: 'Lanzarote is niet zomaar een bestemming - het is een ritme. Vulkanische kliffen, witgekalkte dorpjes, zwarte zandstranden en rustige oases van kalmte die je nergens anders vindt. Onze zorgvuldig geselecteerde verblijven zijn ontworpen om je moeiteloos in dat ritme te laten glijden.',
    description2: 'Of je nu uitzicht op de oceaan wilt, totale afzondering, of een moderne uitvalsbasis dicht bij de culturele plekken van Lanzarote, je vindt hier een plek die comfortabel van jou aanvoelt.',
    cards: [
      {
        title: 'Villa Zen Your Life',
        description: 'Villa Zen Your Life in Playa Blanca biedt een zonneterras, weelderige tuin en een buitenzwembad dat het hele jaar geopend is'
      },
      {
        title: 'Casa Artevista',
        description: 'Gasten genieten van een privéterras met hottub en een enorm dakterras met spectaculair uitzicht op de bergen en zee.'
      }
    ]
  },
  fr: {
    badge: 'Aperçu',
    title1: 'Trouvez un Espace qui Ressemble',
    title2: 'À Votre Maison sur l\'Île',
    description1: 'Lanzarote n\'est pas seulement une destination - c\'est un rythme. Des falaises volcaniques, des villages blanchis à la chaux, des plages de sable noir et des poches tranquilles de calme que vous ne trouverez nulle part ailleurs. Nos séjours soigneusement sélectionnés sont conçus pour vous aider à vous glisser dans ce rythme sans effort.',
    description2: 'Que vous souhaitiez une vue sur l\'océan, une intimité totale ou une base moderne proche des sites culturels de Lanzarote, vous trouverez ici un endroit qui vous ressemble confortablement.',
    cards: [
      {
        title: 'Villa Zen Your Life',
        description: 'La Villa Zen Your Life à Playa Blanca offre une terrasse ensoleillée, un jardin luxuriant et une piscine extérieure ouverte toute l\'année'
      },
      {
        title: 'Casa Artevista',
        description: 'Les clients profitent d\'une terrasse privée avec jacuzzi et d\'un immense toit-terrasse avec une vue spectaculaire sur les montagnes et la mer.'
      }
    ]
  },
  de: {
    badge: 'Übersicht',
    title1: 'Finden Sie einen Raum, der sich anfühlt',
    title2: 'Wie Ihr Inselzuhause',
    description1: 'Lanzarote ist nicht nur ein Reiseziel - es ist ein Rhythmus. Vulkanische Klippen, weiß getünchte Dörfer, schwarze Sandstrände und ruhige Oasen der Ruhe, die Sie nirgendwo anders finden werden. Unsere kuratierten Aufenthalte sind darauf ausgelegt, Ihnen zu helfen, mühelos in diesen Rhythmus zu gleiten.',
    description2: 'Ob Sie Meerblick, völlige Abgeschiedenheit oder eine moderne Basis in der Nähe von Lanzarotes kulturellen Hotspots wünschen, Sie finden hier einen Ort, der sich bequem wie Ihr eigener anfühlt.',
    cards: [
      {
        title: 'Villa Zen Your Life',
        description: 'Die Villa Zen Your Life in Playa Blanca bietet eine Sonnenterrasse, einen üppigen Garten und einen ganzjährig geöffneten Außenpool'
      },
      {
        title: 'Casa Artevista',
        description: 'Gäste genießen eine private Terrasse mit Whirlpool und eine riesige Dachterrasse mit spektakulärem Berg- und Meerblick.'
      }
    ]
  },
  es: {
    badge: 'Descripción',
    title1: 'Encuentra un Espacio que se Sienta',
    title2: 'Como Tu Hogar en la Isla',
    description1: 'Lanzarote no es solo un destino - es un ritmo. Acantilados volcánicos, pueblos encalados, playas de arena negra y rincones tranquilos de calma que no encontrarás en ningún otro lugar. Nuestras estancias seleccionadas están diseñadas para ayudarte a deslizarte en ese ritmo sin esfuerzo.',
    description2: 'Ya sea que desees vistas al océano, aislamiento total o una base moderna cerca de los lugares culturales de Lanzarote, encontrarás aquí un lugar que se siente cómodamente tuyo.',
    cards: [
      {
        title: 'Villa Zen Your Life',
        description: 'Villa Zen Your Life en Playa Blanca ofrece una terraza sooleada, jardín exuberante y una piscina exterior abierta todo el año'
      },
      {
        title: 'Casa Artevista',
        description: 'Los huéspedes disfrutan de una terraza privada con jacuzzi y una enorme azotea con espectaculares vistas a las montañas y al mar.'
      }
    ]
  }
};

async function translateOverviewContent() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📖 Fetching current overview settings...');
    let settings = await RentalOverviewSettings.findOne();

    if (!settings) {
      console.log('⚠️  No overview settings found. Creating default...');
      settings = await RentalOverviewSettings.create({});
    }

    console.log('📝 Current content:');
    console.log(`   Badge: ${settings.badge}`);
    console.log(`   Title: ${settings.title1} ${settings.title2}`);
    console.log(`   Cards: ${settings.cards.length} items\n`);

    console.log('🌍 Adding translations...');
    settings.translations = translations;

    await settings.save();

    console.log('✅ Translations added successfully!\n');
    console.log('📊 Translation Summary:');
    console.log('   ✓ Dutch (NL): Badge, titles, descriptions, 2 cards');
    console.log('   ✓ French (FR): Badge, titles, descriptions, 2 cards');
    console.log('   ✓ German (DE): Badge, titles, descriptions, 2 cards');
    console.log('   ✓ Spanish (ES): Badge, titles, descriptions, 2 cards');
    console.log('\n🎉 All translations saved to database!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
translateOverviewContent();
