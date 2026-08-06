/**
 * Script to add ALL translations for properties
 * Includes: overview (title, description1, description2, highlights, features), location (title, description, places)
 * Run: node backend/scripts/addAllPropertyTranslations.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// =====================================================
// VILLA ZEN YOUR LIFE - TRANSLATIONS
// =====================================================

const villaTranslations = {
  fr: {
    overview: {
      title: "Villa Zen Your Life - Votre Escapade Parfaite à Lanzarote",
      description1: "Découvrez un hébergement élégant à la Villa Zen Your Life, avec une terrasse ensoleillée, un magnifique jardin et une piscine extérieure chauffée avec WiFi gratuit dans tout l'établissement. Cette superbe villa offre 3 chambres spacieuses et 2 salles de bains modernes, avec climatisation pour votre confort sous le soleil de Lanzarote.",
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
      ],
      features: [
        { title: "Terrasse privée", description: "Profitez de votre café du matin sur la terrasse ensoleillée avec vue panoramique" },
        { title: "Chambre lumineuse", description: "Chambres spacieuses avec lumière naturelle et lits confortables" },
        { title: "Salon moderne", description: "Espace de vie élégant avec TV et mobilier confortable" },
        { title: "Cuisine équipée", description: "Cuisine moderne entièrement équipée pour préparer vos repas" }
      ]
    },
    location: {
      title: "Emplacement Idéal à Lanzarote",
      description: "Située dans un quartier calme et résidentiel, la villa offre un accès facile aux plages, restaurants et attractions locales de Lanzarote.",
      places: [
        { title: "Playa del Reducto" },
        { title: "Sites de César Manrique" },
        { title: "Ville d'Arrecife" }
      ]
    }
  },
  de: {
    overview: {
      title: "Villa Zen Your Life - Ihr Perfekter Lanzarote-Urlaub",
      description1: "Erleben Sie elegante Unterkünfte in der Villa Zen Your Life mit Sonnenterrasse, wunderschönem Garten und beheiztem Außenpool mit kostenlosem WLAN im gesamten Haus. Diese atemberaubende Villa bietet 3 geräumige Schlafzimmer und 2 moderne Badezimmer mit Klimaanlage für Ihren Komfort unter der Sonne Lanzarotes.",
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
      ],
      features: [
        { title: "Private Terrasse", description: "Genießen Sie Ihren Morgenkaffee auf der sonnigen Terrasse mit Panoramablick" },
        { title: "Helles Schlafzimmer", description: "Geräumige Zimmer mit natürlichem Licht und bequemen Betten" },
        { title: "Modernes Wohnzimmer", description: "Eleganter Wohnbereich mit TV und komfortablen Möbeln" },
        { title: "Ausgestattete Küche", description: "Moderne, voll ausgestattete Küche für die Zubereitung Ihrer Mahlzeiten" }
      ]
    },
    location: {
      title: "Ideale Lage auf Lanzarote",
      description: "In einer ruhigen Wohngegend gelegen, bietet die Villa einfachen Zugang zu Stränden, Restaurants und lokalen Attraktionen Lanzarotes.",
      places: [
        { title: "Playa del Reducto" },
        { title: "César Manrique Sehenswürdigkeiten" },
        { title: "Stadt Arrecife" }
      ]
    }
  },
  nl: {
    overview: {
      title: "Villa Zen Your Life - Jouw Perfecte Lanzarote Vakantie",
      description1: "Ervaar elegante accommodatie in Villa Zen Your Life, met een zonneterras, prachtige tuin en verwarmd buitenzwembad met gratis WiFi in het hele huis. Deze prachtige villa biedt 3 ruime slaapkamers en 2 moderne badkamers, compleet met airconditioning voor uw comfort onder de zon van Lanzarote.",
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
      ],
      features: [
        { title: "Privéterras", description: "Geniet van uw ochtendkoffie op het zonnige terras met panoramisch uitzicht" },
        { title: "Lichte slaapkamer", description: "Ruime kamers met natuurlijk licht en comfortabele bedden" },
        { title: "Moderne woonkamer", description: "Stijlvolle leefruimte met TV en comfortabel meubilair" },
        { title: "Uitgeruste keuken", description: "Moderne, volledig uitgeruste keuken voor het bereiden van uw maaltijden" }
      ]
    },
    location: {
      title: "Ideale Locatie op Lanzarote",
      description: "Gelegen in een rustige woonwijk, biedt de villa gemakkelijke toegang tot stranden, restaurants en lokale attracties van Lanzarote.",
      places: [
        { title: "Playa del Reducto" },
        { title: "César Manrique bezienswaardigheden" },
        { title: "Stad Arrecife" }
      ]
    }
  },
  es: {
    overview: {
      title: "Villa Zen Your Life - Tu Escapada Perfecta en Lanzarote",
      description1: "Experimenta un alojamiento elegante en Villa Zen Your Life, con terraza soleada, hermoso jardín y piscina exterior climatizada con WiFi gratuito en toda la propiedad. Esta impresionante villa ofrece 3 amplios dormitorios y 2 baños modernos, con aire acondicionado para tu comodidad bajo el sol de Lanzarote.",
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
      ],
      features: [
        { title: "Terraza privada", description: "Disfruta de tu café matutino en la terraza soleada con vistas panorámicas" },
        { title: "Dormitorio luminoso", description: "Habitaciones espaciosas con luz natural y camas cómodas" },
        { title: "Sala de estar moderna", description: "Elegante espacio de vida con TV y muebles confortables" },
        { title: "Cocina equipada", description: "Cocina moderna totalmente equipada para preparar tus comidas" }
      ]
    },
    location: {
      title: "Ubicación Ideal en Lanzarote",
      description: "Situada en un barrio residencial tranquilo, la villa ofrece fácil acceso a playas, restaurantes y atracciones locales de Lanzarote.",
      places: [
        { title: "Playa del Reducto" },
        { title: "Monumentos de César Manrique" },
        { title: "Ciudad de Arrecife" }
      ]
    }
  }
};

// =====================================================
// CASA ARTEVISTA - TRANSLATIONS
// =====================================================

const casaTranslations = {
  fr: {
    overview: {
      title: "Casa Artevista - Charmante Villa à Tabayesco",
      description1: "Bienvenue à Casa Artevista, une élégante villa nichée dans le paisible village de Tabayesco, Lanzarote. Cette charmante propriété dispose de deux chambres confortables avec grands lits et une salle de bain moderne. Profitez de superbes vues sur le jardin depuis votre terrasse privée et votre balcon, ou détendez-vous dans le jacuzzi relaxant après une journée d'exploration de l'île.",
      description2: "La villa offre des équipements modernes, notamment le WiFi gratuit dans tout l'établissement, une cuisine entièrement équipée, une TV et une machine à laver pour votre commodité. Située à seulement 19 minutes à pied de la magnifique plage de Playa de la Garita, avec des attractions populaires comme le Jardín de Cactus et la Cueva de los Verdes à seulement 7 km.",
      highlights: [
        "Jacuzzi privé pour la détente",
        "WiFi gratuit dans tout l'établissement",
        "2 chambres avec grands lits",
        "Cuisine entièrement équipée",
        "TV pour le divertissement",
        "Machine à laver disponible",
        "Près du Jardín de Cactus (7 km)",
        "Emplacement très bien noté (10.0)",
        "Excellente note des clients (9.0)"
      ],
      features: [
        { title: "Terrasse avec vue", description: "Profitez de vues panoramiques sur le jardin depuis votre terrasse privée" },
        { title: "Chambres confortables", description: "Deux chambres élégantes avec grands lits et décoration soignée" },
        { title: "Jacuzzi relaxant", description: "Détendez-vous dans le jacuzzi privé après une journée d'aventure" },
        { title: "Cuisine moderne", description: "Cuisine entièrement équipée pour préparer vos repas maison" }
      ]
    },
    location: {
      title: "Emplacement Paisible à Tabayesco",
      description: "Nichée dans le charmant village de Tabayesco, Casa Artevista offre tranquillité et accès facile aux attractions de Lanzarote.",
      places: [
        { title: "Playa de la Garita (19 min à pied)" },
        { title: "Jardín de Cactus (7 km)" },
        { title: "Cueva de los Verdes (7 km)" }
      ]
    }
  },
  de: {
    overview: {
      title: "Casa Artevista - Charmante Villa in Tabayesco",
      description1: "Willkommen in Casa Artevista, einer eleganten Villa im friedlichen Dorf Tabayesco, Lanzarote. Diese charmante Unterkunft verfügt über zwei komfortable Schlafzimmer mit Queensize-Betten und ein modernes Badezimmer. Genießen Sie atemberaubende Gartenblicke von Ihrer privaten Terrasse und Ihrem Balkon oder entspannen Sie nach einem Tag voller Inselentdeckungen im entspannenden Whirlpool.",
      description2: "Die Villa bietet moderne Annehmlichkeiten wie kostenloses WLAN, eine voll ausgestattete Küche, TV und Waschmaschine für Ihren Komfort. Nur 19 Gehminuten vom wunderschönen Strand Playa de la Garita entfernt, mit beliebten Attraktionen wie Jardín de Cactus und La Cueva de los Verdes nur 7 km entfernt.",
      highlights: [
        "Privater Whirlpool zur Entspannung",
        "Kostenloses WLAN im gesamten Haus",
        "2 Schlafzimmer mit Queensize-Betten",
        "Voll ausgestattete Küche",
        "TV zur Unterhaltung",
        "Waschmaschine verfügbar",
        "In der Nähe von Jardín de Cactus (7 km)",
        "Bestbewertete Lage (10.0)",
        "Hervorragende Gästebewertung (9.0)"
      ],
      features: [
        { title: "Terrasse mit Aussicht", description: "Genießen Sie Panoramablicke auf den Garten von Ihrer privaten Terrasse" },
        { title: "Komfortable Schlafzimmer", description: "Zwei elegante Zimmer mit Queensize-Betten und geschmackvoller Einrichtung" },
        { title: "Entspannender Whirlpool", description: "Entspannen Sie im privaten Whirlpool nach einem Abenteuertag" },
        { title: "Moderne Küche", description: "Voll ausgestattete Küche für die Zubereitung hausgemachter Mahlzeiten" }
      ]
    },
    location: {
      title: "Friedliche Lage in Tabayesco",
      description: "Eingebettet im charmanten Dorf Tabayesco bietet Casa Artevista Ruhe und einfachen Zugang zu Lanzarotes Attraktionen.",
      places: [
        { title: "Playa de la Garita (19 Min. zu Fuß)" },
        { title: "Jardín de Cactus (7 km)" },
        { title: "Cueva de los Verdes (7 km)" }
      ]
    }
  },
  nl: {
    overview: {
      title: "Casa Artevista - Charmante Villa in Tabayesco",
      description1: "Welkom bij Casa Artevista, een elegante villa in het rustige dorpje Tabayesco, Lanzarote. Deze charmante accommodatie beschikt over twee comfortabele slaapkamers met tweepersoonsbedden en een moderne badkamer. Geniet van het prachtige uitzicht op de tuin vanaf uw privéterras en balkon, of ontspan in de ontspannende jacuzzi na een dag het eiland verkennen.",
      description2: "De villa biedt moderne voorzieningen, waaronder gratis WiFi, een volledig uitgeruste keuken, TV en wasmachine voor uw gemak. Op slechts 19 minuten lopen van het prachtige strand Playa de la Garita, met populaire attracties zoals Jardín de Cactus en La Cueva de los Verdes op slechts 7 km afstand.",
      highlights: [
        "Privé jacuzzi voor ontspanning",
        "Gratis WiFi in het hele huis",
        "2 slaapkamers met tweepersoonsbedden",
        "Volledig uitgeruste keuken",
        "TV voor entertainment",
        "Wasmachine beschikbaar",
        "Nabij Jardín de Cactus (7 km)",
        "Toplocatie (10.0)",
        "Geweldige gastenbeoordeling (9.0)"
      ],
      features: [
        { title: "Terras met uitzicht", description: "Geniet van panoramisch uitzicht op de tuin vanaf uw privéterras" },
        { title: "Comfortabele slaapkamers", description: "Twee elegante kamers met tweepersoonsbedden en stijlvolle inrichting" },
        { title: "Ontspannende jacuzzi", description: "Ontspan in de privé jacuzzi na een dag vol avontuur" },
        { title: "Moderne keuken", description: "Volledig uitgeruste keuken voor het bereiden van huisgemaakte maaltijden" }
      ]
    },
    location: {
      title: "Vredige Locatie in Tabayesco",
      description: "Genesteld in het charmante dorpje Tabayesco biedt Casa Artevista rust en gemakkelijke toegang tot de attracties van Lanzarote.",
      places: [
        { title: "Playa de la Garita (19 min lopen)" },
        { title: "Jardín de Cactus (7 km)" },
        { title: "Cueva de los Verdes (7 km)" }
      ]
    }
  },
  es: {
    overview: {
      title: "Casa Artevista - Encantadora Villa en Tabayesco",
      description1: "Bienvenido a Casa Artevista, una elegante villa ubicada en el tranquilo pueblo de Tabayesco, Lanzarote. Esta encantadora propiedad cuenta con dos cómodos dormitorios con camas dobles y un baño moderno. Disfruta de las impresionantes vistas al jardín desde tu terraza privada y balcón, o relájate en el jacuzzi después de un día explorando la isla.",
      description2: "La villa ofrece comodidades modernas que incluyen WiFi gratuito en toda la propiedad, cocina totalmente equipada, TV y lavadora para tu conveniencia. Ubicada a solo 19 minutos a pie de la hermosa playa de Playa de la Garita, con atracciones populares como Jardín de Cactus y La Cueva de los Verdes a solo 7 km.",
      highlights: [
        "Jacuzzi privado para relajarse",
        "WiFi gratuito en toda la propiedad",
        "2 dormitorios con camas dobles",
        "Cocina totalmente equipada",
        "TV para entretenimiento",
        "Lavadora disponible",
        "Cerca de Jardín de Cactus (7 km)",
        "Ubicación mejor valorada (10.0)",
        "Excelente valoración de huéspedes (9.0)"
      ],
      features: [
        { title: "Terraza con vistas", description: "Disfruta de vistas panorámicas al jardín desde tu terraza privada" },
        { title: "Dormitorios cómodos", description: "Dos elegantes habitaciones con camas dobles y decoración cuidada" },
        { title: "Jacuzzi relajante", description: "Relájate en el jacuzzi privado después de un día de aventura" },
        { title: "Cocina moderna", description: "Cocina totalmente equipada para preparar comidas caseras" }
      ]
    },
    location: {
      title: "Ubicación Tranquila en Tabayesco",
      description: "Ubicada en el encantador pueblo de Tabayesco, Casa Artevista ofrece tranquilidad y fácil acceso a las atracciones de Lanzarote.",
      places: [
        { title: "Playa de la Garita (19 min a pie)" },
        { title: "Jardín de Cactus (7 km)" },
        { title: "Cueva de los Verdes (7 km)" }
      ]
    }
  }
};

const addAllTranslations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('properties');

    // Update Villa Zen Your Life
    console.log('Updating Villa Zen Your Life...');
    const villaResult = await collection.updateOne(
      { name: 'Villa Zen Your Life' },
      {
        $set: {
          // French translations
          'translations.fr.overview': villaTranslations.fr.overview,
          'translations.fr.location': villaTranslations.fr.location,
          // German translations
          'translations.de.overview': villaTranslations.de.overview,
          'translations.de.location': villaTranslations.de.location,
          // Dutch translations
          'translations.nl.overview': villaTranslations.nl.overview,
          'translations.nl.location': villaTranslations.nl.location,
          // Spanish translations
          'translations.es.overview': villaTranslations.es.overview,
          'translations.es.location': villaTranslations.es.location
        }
      }
    );
    console.log(`Villa Zen Your Life updated: ${villaResult.modifiedCount} document(s)`);

    // Update Casa Artevista
    console.log('\nUpdating Casa Artevista...');
    const casaResult = await collection.updateOne(
      { name: 'Casa Artevista' },
      {
        $set: {
          // French translations
          'translations.fr.overview': casaTranslations.fr.overview,
          'translations.fr.location': casaTranslations.fr.location,
          // German translations
          'translations.de.overview': casaTranslations.de.overview,
          'translations.de.location': casaTranslations.de.location,
          // Dutch translations
          'translations.nl.overview': casaTranslations.nl.overview,
          'translations.nl.location': casaTranslations.nl.location,
          // Spanish translations
          'translations.es.overview': casaTranslations.es.overview,
          'translations.es.location': casaTranslations.es.location
        }
      }
    );
    console.log(`Casa Artevista updated: ${casaResult.modifiedCount} document(s)`);

    // Verify the update
    console.log('\nVerifying updates...');

    const villa = await collection.findOne({ name: 'Villa Zen Your Life' });
    console.log('\nVilla Zen Your Life:');
    console.log('  NL overview title:', villa?.translations?.nl?.overview?.title);
    console.log('  NL location title:', villa?.translations?.nl?.location?.title);
    console.log('  NL features count:', villa?.translations?.nl?.overview?.features?.length || 0);
    console.log('  NL places count:', villa?.translations?.nl?.location?.places?.length || 0);

    const casa = await collection.findOne({ name: 'Casa Artevista' });
    console.log('\nCasa Artevista:');
    console.log('  NL overview title:', casa?.translations?.nl?.overview?.title);
    console.log('  NL location title:', casa?.translations?.nl?.location?.title);
    console.log('  NL features count:', casa?.translations?.nl?.overview?.features?.length || 0);
    console.log('  NL places count:', casa?.translations?.nl?.location?.places?.length || 0);

    console.log('\nAll property translations added successfully!');

    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

addAllTranslations();
