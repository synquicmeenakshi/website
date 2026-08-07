/**
 * Script to add overview translations directly to properties
 * Run: node backend/scripts/addOverviewTranslations.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const villaOverviewTranslations = {
  fr: {
    title: "Villa Meenakshi - Votre Escapade Parfaite à Lanzarote",
    description1: "Découvrez un hébergement élégant à la Villa Meenakshi, avec une terrasse ensoleillée, un magnifique jardin et une piscine extérieure chauffée avec WiFi gratuit dans tout l'établissement. Cette superbe villa offre 3 chambres spacieuses et 2 salles de bains modernes, avec climatisation pour votre confort sous le soleil de Lanzarote.",
    description2: "Profitez d'équipements confortables, notamment des installations de barbecue parfaites pour les soirées, des espaces de détente extérieurs pour admirer la vue, et un enregistrement/départ privé pour votre commodité.",
    highlights: [
      "Piscine extérieure chauffée",
      "WiFi gratuit dans tout l'établissement",
      "Parking privé gratuit sur place",
      "Terrasse ensoleillée avec vue imprenable",
      "Magnifique jardin privé",
      "3 chambres avec lits confortables",
      "2 salles de bains modernes",
      "Climatisation dans toutes les pièces",
      "Machine à laver disponible"
    ]
  },
  de: {
    title: "Villa Meenakshi - Ihr Perfekter Lanzarote-Urlaub",
    description1: "Erleben Sie elegante Unterkünfte in der Villa Meenakshi mit Sonnenterrasse, wunderschönem Garten und beheiztem Außenpool mit kostenlosem WLAN im gesamten Haus. Diese atemberaubende Villa bietet 3 geräumige Schlafzimmer und 2 moderne Badezimmer mit Klimaanlage für Ihren Komfort unter der Sonne Lanzarotes.",
    description2: "Genießen Sie komfortable Annehmlichkeiten wie Grillmöglichkeiten, perfekt für Abendveranstaltungen, Außensitzbereiche zum Genießen der Aussicht und privaten Check-in/Check-out für Ihre Bequemlichkeit.",
    highlights: [
      "Beheizter Außenpool",
      "Kostenloses WLAN im gesamten Haus",
      "Kostenloser Privatparkplatz vor Ort",
      "Sonnenterrasse mit atemberaubender Aussicht",
      "Wunderschöner Privatgarten",
      "3 Schlafzimmer mit bequemen Betten",
      "2 moderne Badezimmer",
      "Klimaanlage in allen Zimmern",
      "Waschmaschine verfügbar"
    ]
  },
  nl: {
    title: "Villa Meenakshi - Jouw Perfecte Lanzarote Vakantie",
    description1: "Ervaar elegante accommodatie in Villa Meenakshi, met een zonneterras, prachtige tuin en verwarmd buitenzwembad met gratis WiFi in het hele huis. Deze prachtige villa biedt 3 ruime slaapkamers en 2 moderne badkamers, compleet met airconditioning voor uw comfort onder de zon van Lanzarote.",
    description2: "Geniet van comfortabele voorzieningen waaronder BBQ-faciliteiten, perfect voor avondbijeenkomsten, buitenzitplaatsen om van het uitzicht te genieten, en privé in-/uitchecken voor uw gemak.",
    highlights: [
      "Verwarmd buitenzwembad",
      "Gratis WiFi in het hele huis",
      "Gratis privéparkeren op het terrein",
      "Zonneterras met prachtig uitzicht",
      "Prachtige privétuin",
      "3 slaapkamers met comfortabele bedden",
      "2 moderne badkamers",
      "Airconditioning in alle kamers",
      "Wasmachine beschikbaar"
    ]
  },
  es: {
    title: "Villa Meenakshi - Tu Escapada Perfecta en Lanzarote",
    description1: "Experimenta un alojamiento elegante en Villa Meenakshi, con terraza soleada, hermoso jardín y piscina exterior climatizada con WiFi gratuito en toda la propiedad. Esta impresionante villa ofrece 3 amplios dormitorios y 2 baños modernos, con aire acondicionado para tu comodidad bajo el sol de Lanzarote.",
    description2: "Disfruta de comodidades confortables que incluyen instalaciones de barbacoa perfectas para reuniones nocturnas, áreas de estar al aire libre para disfrutar de las vistas, y check-in/check-out privado para tu conveniencia.",
    highlights: [
      "Piscina exterior climatizada",
      "WiFi gratuito en toda la propiedad",
      "Aparcamiento privado gratuito en el lugar",
      "Terraza soleada con vistas impresionantes",
      "Hermoso jardín privado",
      "3 dormitorios con camas cómodas",
      "2 baños modernos",
      "Aire acondicionado en todas las habitaciones",
      "Lavadora disponible"
    ]
  }
};

const casaOverviewTranslations = {
  fr: {
    title: "Casa Artevista - Charmante Villa à Tabayesco",
    description1: "Bienvenue à Casa Artevista, une élégante villa nichée dans le paisible village de Tabayesco, Lanzarote. Cette charmante propriété dispose de deux chambres confortables avec grands lits et une salle de bain moderne. Profitez de superbes vues sur le jardin depuis votre terrasse privée et votre balcon, ou détendez-vous dans le jacuzzi relaxant après une journée d'exploration de l'île.",
    description2: "La villa offre des équipements modernes, notamment le WiFi gratuit dans tout l'établissement, une cuisine entièrement équipée, une TV et une machine à laver pour votre commodité. Située à seulement 19 minutes à pied de la magnifique plage de Playa de la Garita, avec des attractions populaires comme le Jardín de Cactus Gardens et la Cueva de los Verdes à seulement 7 km. La propriété est à 28 km de l'aéroport de Lanzarote.",
    highlights: [
      "Jacuzzi privé pour la détente",
      "WiFi gratuit dans tout l'établissement",
      "2 chambres avec grands lits",
      "Cuisine entièrement équipée",
      "TV pour le divertissement",
      "Machine à laver disponible",
      "Près du Jardín de Cactus Gardens (7 km)",
      "Emplacement très bien noté (10.0)",
      "Excellente note des clients (9.0)"
    ]
  },
  de: {
    title: "Casa Artevista - Charmante Villa in Tabayesco",
    description1: "Willkommen in Casa Artevista, einer eleganten Villa im friedlichen Dorf Tabayesco, Lanzarote. Diese charmante Unterkunft verfügt über zwei komfortable Schlafzimmer mit Queensize-Betten und ein modernes Badezimmer. Genießen Sie atemberaubende Gartenblicke von Ihrer privaten Terrasse und Ihrem Balkon oder entspannen Sie nach einem Tag voller Inselentdeckungen im entspannenden Whirlpool.",
    description2: "Die Villa bietet moderne Annehmlichkeiten wie kostenloses WLAN, eine voll ausgestattete Küche, TV und Waschmaschine für Ihren Komfort. Nur 19 Gehminuten vom wunderschönen Strand Playa de la Garita entfernt, mit beliebten Attraktionen wie Jardín de Cactus Gardens und La Cueva de los Verdes nur 7 km entfernt. Die Unterkunft ist 28 km vom Flughafen Lanzarote entfernt.",
    highlights: [
      "Privater Whirlpool zur Entspannung",
      "Kostenloses WLAN im gesamten Haus",
      "2 Schlafzimmer mit Queensize-Betten",
      "Voll ausgestattete Küche",
      "TV zur Unterhaltung",
      "Waschmaschine verfügbar",
      "In der Nähe von Jardín de Cactus Gardens (7 km)",
      "Bestbewertete Lage (10.0)",
      "Hervorragende Gästebewertung (9.0)"
    ]
  },
  nl: {
    title: "Casa Artevista - Charmante Villa in Tabayesco",
    description1: "Welkom bij Casa Artevista, een elegante villa in het rustige dorpje Tabayesco, Lanzarote. Deze charmante accommodatie beschikt over twee comfortabele slaapkamers met tweepersoonsbedden en een moderne badkamer. Geniet van het prachtige uitzicht op de tuin vanaf uw privéterras en balkon, of ontspan in de ontspannende jacuzzi na een dag het eiland verkennen.",
    description2: "De villa biedt moderne voorzieningen, waaronder gratis WiFi, een volledig uitgeruste keuken, TV en wasmachine voor uw gemak. Op slechts 19 minuten lopen van het prachtige strand Playa de la Garita, met populaire attracties zoals Jardín de Cactus Gardens en La Cueva de los Verdes op slechts 7 km afstand. De accommodatie ligt op 28 km van de luchthaven van Lanzarote.",
    highlights: [
      "Privé jacuzzi voor ontspanning",
      "Gratis WiFi in het hele huis",
      "2 slaapkamers met tweepersoonsbedden",
      "Volledig uitgeruste keuken",
      "TV voor entertainment",
      "Wasmachine beschikbaar",
      "Nabij Jardín de Cactus Gardens (7 km)",
      "Toplocatie (10.0)",
      "Geweldige gastenbeoordeling (9.0)"
    ]
  },
  es: {
    title: "Casa Artevista - Encantadora Villa en Tabayesco",
    description1: "Bienvenido a Casa Artevista, una elegante villa ubicada en el tranquilo pueblo de Tabayesco, Lanzarote. Esta encantadora propiedad cuenta con dos cómodos dormitorios con camas dobles y un baño moderno. Disfruta de las impresionantes vistas al jardín desde tu terraza privada y balcón, o relájate en el jacuzzi después de un día explorando la isla.",
    description2: "La villa ofrece comodidades modernas que incluyen WiFi gratuito en toda la propiedad, cocina totalmente equipada, TV y lavadora para tu conveniencia. Ubicada a solo 19 minutos a pie de la hermosa playa de Playa de la Garita, con atracciones populares como Jardín de Cactus Gardens y La Cueva de los Verdes a solo 7 km. La propiedad está a 28 km del aeropuerto de Lanzarote.",
    highlights: [
      "Jacuzzi privado para relajarse",
      "WiFi gratuito en toda la propiedad",
      "2 dormitorios con camas dobles",
      "Cocina totalmente equipada",
      "TV para entretenimiento",
      "Lavadora disponible",
      "Cerca de Jardín de Cactus Gardens (7 km)",
      "Ubicación mejor valorada (10.0)",
      "Excelente valoración de huéspedes (9.0)"
    ]
  }
};

const addOverviewTranslations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('properties');

    // Update Villa Meenakshi
    console.log('📦 Updating Villa Meenakshi...');
    const villaResult = await collection.updateOne(
      { name: 'Villa Meenakshi' },
      {
        $set: {
          'translations.fr.overview': villaOverviewTranslations.fr,
          'translations.de.overview': villaOverviewTranslations.de,
          'translations.nl.overview': villaOverviewTranslations.nl,
          'translations.es.overview': villaOverviewTranslations.es,
          // Also fix English overview to say heated instead of year-round
          'overview.description1': 'Experience elegant accommodation at Villa Meenakshi, featuring a sun terrace, beautiful garden, and a heated outdoor pool with free WiFi throughout. This stunning villa offers 3 spacious bedrooms and 2 modern bathrooms, complete with air conditioning to keep you comfortable in the Lanzarote sun.',
          'overview.highlights': [
            'Heated outdoor swimming pool',
            'Free WiFi throughout the property',
            'Free private parking on-site',
            'Sun terrace with stunning views',
            'Beautiful private garden',
            '3 bedrooms with comfortable beds',
            '2 modern bathrooms',
            'Air conditioning in all rooms',
            'Washing machine available'
          ]
        }
      }
    );
    console.log(`✅ Villa Meenakshi updated: ${villaResult.modifiedCount} document(s)`);

    // Update Casa Artevista
    console.log('\n📦 Updating Casa Artevista...');
    const casaResult = await collection.updateOne(
      { name: 'Casa Artevista' },
      {
        $set: {
          'translations.fr.overview': casaOverviewTranslations.fr,
          'translations.de.overview': casaOverviewTranslations.de,
          'translations.nl.overview': casaOverviewTranslations.nl,
          'translations.es.overview': casaOverviewTranslations.es
        }
      }
    );
    console.log(`✅ Casa Artevista updated: ${casaResult.modifiedCount} document(s)`);

    // Verify the update
    console.log('\n📦 Verifying updates...');
    const villa = await collection.findOne({ name: 'Villa Meenakshi' });
    console.log('Villa NL overview title:', villa?.translations?.nl?.overview?.title);
    console.log('Villa NL highlight 1:', villa?.translations?.nl?.overview?.highlights?.[0]);

    console.log('\n✅ All overview translations added successfully!');

    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

addOverviewTranslations();
