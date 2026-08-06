/**
 * Comprehensive Translation Script
 * Translates all remaining English content in the database:
 * 1. Properties (Casa Artevista, Villa Zen Your Life)
 * 2. Testimonials (Damian, James Wilson, Marc Vettori)
 * 3. Home page content
 * 4. About page content
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// ============================================================
// 1. PROPERTY TRANSLATIONS
// ============================================================

const propertyTranslations = {
  'Casa Artevista': {
    fr: {
      name: 'Casa Artevista',
      description: "Villa élégante à Tabayesco avec 2 chambres, terrasse, balcon, vue sur le jardin et jacuzzi privé. Profitez du WiFi gratuit, d'une cuisine entièrement équipée et d'équipements modernes. À seulement 19 minutes à pied de la plage de Playa de la Garita, avec des attractions à proximité comme le Jardín de Cactus.",
      priceUnit: 'par nuit',
      parking: 'Pas de parking privé',
      amenities: ['Jacuzzi', 'WiFi gratuit', 'Cuisine', 'Terrasse', 'Balcon', 'Vue sur le jardin', 'TV', 'Machine à laver', 'Salle de bain privée', 'wifi', 'washing', 'tv', 'linens', 'safe', 'coffee', 'outdoor', 'checkin', 'kitchen', 'garden', 'view'],
      cleanliness: {
        title: 'Propreté',
        description: 'Nettoyé et désinfecté professionnellement avant chaque séjour.'
      },
      overview: {
        title: 'Casa Artevista - Villa de charme à Tabayesco',
        description1: "Bienvenue à Casa Artevista, une villa élégante nichée dans le paisible village de Tabayesco, Lanzarote. Cette charmante propriété dispose de deux chambres confortables avec des lits queen et d'une salle de bain moderne. Profitez de superbes vues sur le jardin depuis votre terrasse et balcon privés, ou détendez-vous dans le jacuzzi relaxant après une journée d'exploration de l'île.",
        description2: "La villa offre des équipements modernes comprenant le WiFi gratuit dans toute la propriété, une cuisine entièrement équipée, une TV et une machine à laver pour votre confort. Située à seulement 19 minutes à pied de la belle plage de Playa de la Garita, avec des attractions populaires comme le Jardín de Cactus et la Cueva de los Verdes à seulement 7 km. La propriété se trouve à 28 km de l'aéroport de Lanzarote, ce qui la rend facilement accessible.",
        highlights: [
          'Jacuzzi privé pour la détente',
          'WiFi gratuit dans toute la propriété',
          '2 chambres avec lits queen',
          'Cuisine entièrement équipée',
          'TV pour le divertissement',
          'Machine à laver disponible',
          'Près du Jardín de Cactus (7 km)',
          'Emplacement le mieux noté (10.0)',
          'Excellente note des clients (9.0)'
        ],
        features: []
      },
      location: {
        title: 'Retraite paisible dans la vallée de Tabayesco',
        description: "Casa Artevista est nichée dans le charmant village de Tabayesco, dans l'une des plus belles vallées de Lanzarote. Parfait pour les amoureux de la nature en quête de tranquillité.",
        places: [
          { title: 'Playa de la Garita' },
          { title: 'Jardín de Cactus' },
          { title: 'Jameos del Agua' }
        ]
      }
    },
    nl: {
      name: 'Casa Artevista',
      description: 'Elegante villa in Tabayesco met 2 slaapkamers, terras, balkon, tuinuitzicht en privé hottub. Geniet van gratis WiFi, een volledig uitgeruste keuken en moderne voorzieningen. Op slechts 19 minuten lopen van het strand Playa de la Garita, met nabijgelegen attracties zoals de Jardín de Cactus.',
      priceUnit: 'per nacht',
      parking: 'Geen privéparking',
      amenities: ['Hottub', 'Gratis WiFi', 'Keuken', 'Terras', 'Balkon', 'Tuinuitzicht', 'TV', 'Wasmachine', 'Privébadkamer', 'wifi', 'washing', 'tv', 'linens', 'safe', 'coffee', 'outdoor', 'checkin', 'kitchen', 'garden', 'view'],
      cleanliness: {
        title: 'Netheid',
        description: 'Professioneel schoongemaakt en ontsmet vóór elk verblijf.'
      },
      overview: {
        title: 'Casa Artevista - Charmante villa in Tabayesco',
        description1: 'Welkom bij Casa Artevista, een elegante villa verscholen in het rustige dorpje Tabayesco, Lanzarote. Dit charmante verblijf beschikt over twee comfortabele slaapkamers met queensize bedden en een moderne badkamer. Geniet van prachtig tuinuitzicht vanaf uw privéterras en balkon, of ontspan in de relaxende hottub na een dag vol ontdekkingen op het eiland.',
        description2: 'De villa biedt moderne voorzieningen waaronder gratis WiFi in de hele woning, een volledig uitgeruste keuken, TV en een wasmachine voor uw gemak. Op slechts 19 minuten lopen van het prachtige strand Playa de la Garita, met populaire attracties zoals Jardín de Cactus en La Cueva de los Verdes op slechts 7 km afstand. De woning ligt 28 km van de luchthaven van Lanzarote, waardoor het gemakkelijk bereikbaar is.',
        highlights: [
          'Privé hottub voor ontspanning',
          'Gratis WiFi in de hele woning',
          '2 slaapkamers met queensize bedden',
          'Volledig uitgeruste keuken',
          'TV voor entertainment',
          'Wasmachine beschikbaar',
          'Dichtbij Jardín de Cactus (7 km)',
          'Best beoordeelde locatie (10.0)',
          'Uitstekende gastenbeoordeling (9.0)'
        ],
        features: []
      },
      location: {
        title: 'Rustige toevlucht in de vallei van Tabayesco',
        description: 'Casa Artevista ligt verscholen in het charmante dorpje Tabayesco, in een van de mooiste valleien van Lanzarote. Perfect voor natuurliefhebbers die op zoek zijn naar rust.',
        places: [
          { title: 'Playa de la Garita' },
          { title: 'Jardín de Cactus' },
          { title: 'Jameos del Agua' }
        ]
      }
    },
    de: {
      name: 'Casa Artevista',
      description: 'Elegante Villa in Tabayesco mit 2 Schlafzimmern, Terrasse, Balkon, Gartenblick und privatem Whirlpool. Genießen Sie kostenloses WLAN, eine voll ausgestattete Küche und moderne Annehmlichkeiten. Nur 19 Gehminuten vom Strand Playa de la Garita entfernt, mit nahegelegenen Attraktionen wie dem Jardín de Cactus.',
      priceUnit: 'pro Nacht',
      parking: 'Kein privater Parkplatz',
      amenities: ['Whirlpool', 'Kostenloses WLAN', 'Küche', 'Terrasse', 'Balkon', 'Gartenblick', 'TV', 'Waschmaschine', 'Eigenes Bad', 'wifi', 'washing', 'tv', 'linens', 'safe', 'coffee', 'outdoor', 'checkin', 'kitchen', 'garden', 'view'],
      cleanliness: {
        title: 'Sauberkeit',
        description: 'Vor jedem Aufenthalt professionell gereinigt und desinfiziert.'
      },
      overview: {
        title: 'Casa Artevista - Charmante Villa in Tabayesco',
        description1: 'Willkommen in der Casa Artevista, einer eleganten Villa im friedlichen Dorf Tabayesco, Lanzarote. Dieses charmante Anwesen verfügt über zwei komfortable Schlafzimmer mit Queensize-Betten und ein modernes Badezimmer. Genießen Sie den herrlichen Gartenblick von Ihrer privaten Terrasse und Ihrem Balkon oder entspannen Sie sich nach einem Tag voller Inselerkundungen im Whirlpool.',
        description2: 'Die Villa bietet moderne Annehmlichkeiten wie kostenloses WLAN im gesamten Haus, eine voll ausgestattete Küche, TV und eine Waschmaschine für Ihren Komfort. Nur 19 Gehminuten vom wunderschönen Strand Playa de la Garita entfernt, mit beliebten Attraktionen wie dem Jardín de Cactus und der Cueva de los Verdes in nur 7 km Entfernung. Das Anwesen liegt 28 km vom Flughafen Lanzarote entfernt und ist somit leicht erreichbar.',
        highlights: [
          'Privater Whirlpool zur Entspannung',
          'Kostenloses WLAN im gesamten Haus',
          '2 Schlafzimmer mit Queensize-Betten',
          'Voll ausgestattete Küche',
          'TV zur Unterhaltung',
          'Waschmaschine verfügbar',
          'Nahe Jardín de Cactus (7 km)',
          'Bestbewertete Lage (10.0)',
          'Hervorragende Gästebewertung (9.0)'
        ],
        features: []
      },
      location: {
        title: 'Friedlicher Rückzugsort im Tal von Tabayesco',
        description: 'Die Casa Artevista liegt im charmanten Dorf Tabayesco, in einem der schönsten Täler Lanzarotes. Perfekt für Naturliebhaber, die Ruhe suchen.',
        places: [
          { title: 'Playa de la Garita' },
          { title: 'Jardín de Cactus' },
          { title: 'Jameos del Agua' }
        ]
      }
    },
    es: {
      name: 'Casa Artevista',
      description: 'Elegante villa en Tabayesco con 2 dormitorios, terraza, balcón, vistas al jardín y jacuzzi privado. Disfrute de WiFi gratuito, cocina totalmente equipada y comodidades modernas. A solo 19 minutos a pie de la playa de la Garita, con atracciones cercanas como el Jardín de Cactus.',
      priceUnit: 'por noche',
      parking: 'Sin aparcamiento privado',
      amenities: ['Jacuzzi', 'WiFi gratuito', 'Cocina', 'Terraza', 'Balcón', 'Vistas al jardín', 'TV', 'Lavadora', 'Baño privado', 'wifi', 'washing', 'tv', 'linens', 'safe', 'coffee', 'outdoor', 'checkin', 'kitchen', 'garden', 'view'],
      cleanliness: {
        title: 'Limpieza',
        description: 'Limpiado y desinfectado profesionalmente antes de cada estancia.'
      },
      overview: {
        title: 'Casa Artevista - Encantadora villa en Tabayesco',
        description1: 'Bienvenido a Casa Artevista, una elegante villa ubicada en el tranquilo pueblo de Tabayesco, Lanzarote. Esta encantadora propiedad cuenta con dos cómodas habitaciones con camas queen y un baño moderno. Disfrute de impresionantes vistas al jardín desde su terraza y balcón privados, o relájese en el jacuzzi después de un día explorando la isla.',
        description2: 'La villa ofrece comodidades modernas incluyendo WiFi gratuito en toda la propiedad, una cocina totalmente equipada, TV y lavadora para su comodidad. Situada a solo 19 minutos a pie de la hermosa playa de la Garita, con atracciones populares como el Jardín de Cactus y la Cueva de los Verdes a solo 7 km. La propiedad está a 28 km del aeropuerto de Lanzarote, lo que la hace fácilmente accesible.',
        highlights: [
          'Jacuzzi privado para relajarse',
          'WiFi gratuito en toda la propiedad',
          '2 dormitorios con camas queen',
          'Cocina totalmente equipada',
          'TV para entretenimiento',
          'Lavadora disponible',
          'Cerca del Jardín de Cactus (7 km)',
          'Ubicación mejor valorada (10.0)',
          'Excelente valoración de huéspedes (9.0)'
        ],
        features: []
      },
      location: {
        title: 'Retiro tranquilo en el valle de Tabayesco',
        description: 'Casa Artevista está ubicada en el encantador pueblo de Tabayesco, en uno de los valles más hermosos de Lanzarote. Perfecto para los amantes de la naturaleza que buscan tranquilidad.',
        places: [
          { title: 'Playa de la Garita' },
          { title: 'Jardín de Cactus' },
          { title: 'Jameos del Agua' }
        ]
      }
    }
  },

  'Villa Zen Your Life': {
    fr: {
      name: 'Villa Zen Your Life',
      description: "Villa élégante avec terrasse ensoleillée, beau jardin et piscine extérieure chauffée. Profitez de 3 chambres, 2 salles de bain, climatisation, cuisine entièrement équipée et barbecue. Située à seulement 1,9 km de la plage de Playa Dorada avec WiFi gratuit et parking privé.",
      priceUnit: 'par nuit',
      parking: 'Parking pour 2',
      amenities: ['Piscine', 'WiFi gratuit', 'Parking gratuit', 'Barbecue', 'Terrasse', 'Jardin', 'Climatisation', 'Cuisine équipée', 'Machine à laver', 'Espace extérieur', 'wifi', 'washing', 'tv', 'linens', 'safe', 'coffee', 'outdoor', 'checkin', 'ac', 'pool', 'kitchen', 'parking', 'garden'],
      cleanliness: {
        title: 'Propreté',
        description: 'Nettoyé et désinfecté professionnellement avant chaque séjour.'
      },
      overview: {
        title: 'Villa Zen Your Life - Votre évasion parfaite à Lanzarote',
        description1: "Découvrez un hébergement élégant à Villa Zen Your Life, avec terrasse ensoleillée, beau jardin et piscine extérieure chauffée avec WiFi gratuit dans toute la propriété. Cette magnifique villa dispose de 3 chambres spacieuses et 2 salles de bain modernes, avec climatisation pour votre confort sous le soleil de Lanzarote.",
        description2: "Profitez d'équipements confortables comprenant un barbecue parfait pour les soirées en plein air, des espaces de détente extérieurs pour profiter des vues, et un enregistrement/départ privé pour votre commodité.",
        highlights: [
          'Piscine extérieure chauffée',
          'WiFi gratuit dans toute la propriété',
          'Parking privé gratuit sur place',
          'Terrasse ensoleillée avec vues magnifiques',
          'Beau jardin privé',
          '3 chambres avec lits confortables',
          '2 salles de bain modernes',
          'Climatisation dans toutes les pièces',
          'Machine à laver disponible'
        ],
        features: []
      },
      location: {
        title: 'Emplacement privilégié à Playa Blanca',
        description: "Villa Zen Your Life est idéalement située dans le sud ensoleillé de Lanzarote, à seulement 25 minutes à pied de la Marina Rubicon et à proximité de belles plages.",
        places: [
          { title: 'Playa Dorada' },
          { title: 'Marina Rubicon' },
          { title: 'Playa Papagayo' }
        ]
      }
    },
    nl: {
      name: 'Villa Zen Your Life',
      description: 'Elegante villa met zonneterras, prachtige tuin en verwarmd buitenzwembad. Geniet van 3 slaapkamers, 2 badkamers, airconditioning, volledig uitgeruste keuken en BBQ-faciliteiten. Op slechts 1,9 km van het strand Playa Dorada met gratis WiFi en privéparking.',
      priceUnit: 'per nacht',
      parking: 'Parking voor 2',
      amenities: ['Zwembad', 'Gratis WiFi', 'Gratis parking', 'BBQ-faciliteiten', 'Terras', 'Tuin', 'Airconditioning', 'Volledig uitgeruste keuken', 'Wasmachine', 'Buitenzitplaatsen', 'wifi', 'washing', 'tv', 'linens', 'safe', 'coffee', 'outdoor', 'checkin', 'ac', 'pool', 'kitchen', 'parking', 'garden'],
      cleanliness: {
        title: 'Netheid',
        description: 'Professioneel schoongemaakt en ontsmet vóór elk verblijf.'
      },
      overview: {
        title: 'Villa Zen Your Life - Uw perfecte Lanzarote-verblijf',
        description1: 'Ervaar elegant verblijf in Villa Zen Your Life, met zonneterras, prachtige tuin en verwarmd buitenzwembad met gratis WiFi in de hele woning. Deze prachtige villa biedt 3 ruime slaapkamers en 2 moderne badkamers, met airconditioning om u comfortabel te houden onder de zon van Lanzarote.',
        description2: 'Geniet van comfortabele voorzieningen waaronder BBQ-faciliteiten perfect voor avondbijeenkomsten, buitenzitplaatsen om van het uitzicht te genieten, en privé in-/uitchecken voor uw gemak.',
        highlights: [
          'Verwarmd buitenzwembad',
          'Gratis WiFi in de hele woning',
          'Gratis privéparking op het terrein',
          'Zonneterras met prachtig uitzicht',
          'Mooie privétuin',
          '3 slaapkamers met comfortabele bedden',
          '2 moderne badkamers',
          'Airconditioning in alle kamers',
          'Wasmachine beschikbaar'
        ],
        features: []
      },
      location: {
        title: 'Toplocatie in Playa Blanca',
        description: 'Villa Zen Your Life is perfect gelegen in het zonnige zuiden van Lanzarote, op slechts 25 minuten lopen van Marina Rubicon en dicht bij prachtige stranden.',
        places: [
          { title: 'Playa Dorada' },
          { title: 'Marina Rubicon' },
          { title: 'Playa Papagayo' }
        ]
      }
    },
    de: {
      name: 'Villa Zen Your Life',
      description: 'Elegante Villa mit Sonnenterrasse, schönem Garten und beheiztem Außenpool. Genießen Sie 3 Schlafzimmer, 2 Badezimmer, Klimaanlage, voll ausgestattete Küche und Grillmöglichkeiten. Nur 1,9 km vom Strand Playa Dorada entfernt mit kostenlosem WLAN und privatem Parkplatz.',
      priceUnit: 'pro Nacht',
      parking: 'Parkplatz für 2',
      amenities: ['Schwimmbad', 'Kostenloses WLAN', 'Kostenloser Parkplatz', 'Grillmöglichkeiten', 'Terrasse', 'Garten', 'Klimaanlage', 'Voll ausgestattete Küche', 'Waschmaschine', 'Außensitzplätze', 'wifi', 'washing', 'tv', 'linens', 'safe', 'coffee', 'outdoor', 'checkin', 'ac', 'pool', 'kitchen', 'parking', 'garden'],
      cleanliness: {
        title: 'Sauberkeit',
        description: 'Vor jedem Aufenthalt professionell gereinigt und desinfiziert.'
      },
      overview: {
        title: 'Villa Zen Your Life - Ihr perfekter Lanzarote-Urlaub',
        description1: 'Erleben Sie elegantes Wohnen in der Villa Zen Your Life mit Sonnenterrasse, schönem Garten und beheiztem Außenpool mit kostenlosem WLAN im gesamten Haus. Diese atemberaubende Villa bietet 3 geräumige Schlafzimmer und 2 moderne Badezimmer mit Klimaanlage, um Ihnen unter der Sonne Lanzarotes Komfort zu bieten.',
        description2: 'Genießen Sie komfortable Annehmlichkeiten wie Grillmöglichkeiten, perfekt für gesellige Abende, Außensitzbereiche mit herrlichem Ausblick und privaten Check-in/Check-out für Ihre Bequemlichkeit.',
        highlights: [
          'Beheizter Außenpool',
          'Kostenloses WLAN im gesamten Haus',
          'Kostenloser privater Parkplatz vor Ort',
          'Sonnenterrasse mit herrlichem Ausblick',
          'Schöner privater Garten',
          '3 Schlafzimmer mit bequemen Betten',
          '2 moderne Badezimmer',
          'Klimaanlage in allen Zimmern',
          'Waschmaschine verfügbar'
        ],
        features: []
      },
      location: {
        title: 'Beste Lage in Playa Blanca',
        description: 'Villa Zen Your Life liegt perfekt im sonnigen Süden von Lanzarote, nur 25 Gehminuten von der Marina Rubicon entfernt und in der Nähe wunderschöner Strände.',
        places: [
          { title: 'Playa Dorada' },
          { title: 'Marina Rubicon' },
          { title: 'Playa Papagayo' }
        ]
      }
    },
    es: {
      name: 'Villa Zen Your Life',
      description: 'Elegante villa con terraza soleada, hermoso jardín y piscina exterior climatizada. Disfrute de 3 dormitorios, 2 baños, aire acondicionado, cocina totalmente equipada y barbacoa. Situada a solo 1,9 km de la playa de Playa Dorada con WiFi gratuito y aparcamiento privado.',
      priceUnit: 'por noche',
      parking: 'Aparcamiento para 2',
      amenities: ['Piscina', 'WiFi gratuito', 'Aparcamiento gratuito', 'Barbacoa', 'Terraza', 'Jardín', 'Aire acondicionado', 'Cocina equipada', 'Lavadora', 'Zona exterior', 'wifi', 'washing', 'tv', 'linens', 'safe', 'coffee', 'outdoor', 'checkin', 'ac', 'pool', 'kitchen', 'parking', 'garden'],
      cleanliness: {
        title: 'Limpieza',
        description: 'Limpiado y desinfectado profesionalmente antes de cada estancia.'
      },
      overview: {
        title: 'Villa Zen Your Life - Su escapada perfecta en Lanzarote',
        description1: 'Disfrute de un alojamiento elegante en Villa Zen Your Life, con terraza soleada, hermoso jardín y piscina exterior climatizada con WiFi gratuito en toda la propiedad. Esta impresionante villa ofrece 3 amplios dormitorios y 2 baños modernos, con aire acondicionado para mantenerle cómodo bajo el sol de Lanzarote.',
        description2: 'Disfrute de cómodas instalaciones incluyendo barbacoa perfecta para reuniones nocturnas, zonas de estar exteriores para disfrutar de las vistas, y check-in/check-out privado para su comodidad.',
        highlights: [
          'Piscina exterior climatizada',
          'WiFi gratuito en toda la propiedad',
          'Aparcamiento privado gratuito en el lugar',
          'Terraza soleada con vistas impresionantes',
          'Hermoso jardín privado',
          '3 dormitorios con camas cómodas',
          '2 baños modernos',
          'Aire acondicionado en todas las habitaciones',
          'Lavadora disponible'
        ],
        features: []
      },
      location: {
        title: 'Ubicación privilegiada en Playa Blanca',
        description: 'Villa Zen Your Life está perfectamente ubicada en el soleado sur de Lanzarote, a solo 25 minutos a pie de Marina Rubicón y cerca de hermosas playas.',
        places: [
          { title: 'Playa Dorada' },
          { title: 'Marina Rubicón' },
          { title: 'Playa Papagayo' }
        ]
      }
    }
  }
};

// ============================================================
// 2. TESTIMONIAL TRANSLATIONS
// ============================================================

const testimonialTranslations = {
  'Damian': {
    fr: {
      text: "La villa était parfaite et correspondait exactement à ce que nous voulions, l'emplacement était bien. On pouvait marcher jusqu'à des magasins et restaurants à proximité. Très propre et bien entretenu.",
      role: ''
    },
    nl: {
      text: 'De villa was perfect en precies wat we wilden, de locatie was goed. Je kon naar winkels en restaurants in de buurt lopen. Erg schoon en goed onderhouden.',
      role: ''
    },
    de: {
      text: 'Die Villa war perfekt und genau das, was wir wollten, die Lage war gut. Man konnte zu nahen Geschäften und Restaurants laufen. Sehr sauber und gut gepflegt.',
      role: ''
    },
    es: {
      text: 'La villa era perfecta y exactamente lo que queríamos, la ubicación estaba bien. Se podía caminar a tiendas y restaurantes cercanos. Muy limpia y bien mantenida.',
      role: ''
    }
  },
  'James Wilson': {
    fr: {
      text: "Service exceptionnel ! Le massage des tissus profonds était exactement ce dont j'avais besoin après une semaine de randonnée. Professionnel, propre et un environnement très relaxant.",
      role: '@jameswilson'
    },
    nl: {
      text: 'Uitstekende service! De diepteweefselmassage was precies wat ik nodig had na een week wandelen. Professioneel, schoon en een zeer ontspannende omgeving.',
      role: '@jameswilson'
    },
    de: {
      text: 'Herausragender Service! Die Tiefengewebsmassage war genau das, was ich nach einer Woche Wandern brauchte. Professionell, sauber und eine sehr entspannende Atmosphäre.',
      role: '@jameswilson'
    },
    es: {
      text: '¡Servicio excepcional! El masaje de tejido profundo era exactamente lo que necesitaba después de una semana de senderismo. Profesional, limpio y un ambiente muy relajante.',
      role: '@jameswilson'
    }
  },
  'Marc Vettori': {
    fr: {
      text: 'Excellent massage Zen Your Life',
      role: ''
    },
    nl: {
      text: 'Top Zen Your Life massage',
      role: ''
    },
    de: {
      text: 'Erstklassige Zen Your Life Massage',
      role: ''
    },
    es: {
      text: 'Excelente masaje Zen Your Life',
      role: ''
    }
  }
};

// ============================================================
// 3. HOME PAGE CONTENT TRANSLATIONS
// ============================================================

const homePageTranslations = {
  fr: {
    hero: {
      title: 'Bienvenue chez ZenYourLife',
      subtitle: "Découvrez l'art de la relaxation et du rajeunissement",
      badgeText: 'Accueil',
      buttonText: 'Voir les services'
    },
    statistics: [
      { value: '100+', label: 'Soins proposés' },
      { value: '50+', label: 'Thérapeutes certifiés' },
      { value: '2k+', label: 'Clients satisfaits' },
      { value: '300+', label: 'Bien-être unique' }
    ],
    sectionHeaders: {
      services: {
        title: 'Nos services pour une relaxation ultime',
        subtitle: 'Vivez une retraite paisible avec nos soins spa luxueux, conçus pour rafraîchir vos sens et restaurer l\'harmonie'
      }
    },
    seo: { keywords: [] }
  },
  nl: {
    hero: {
      title: 'Welkom bij ZenYourLife',
      subtitle: 'Ontdek de kunst van ontspanning en verjonging',
      badgeText: 'Home',
      buttonText: 'Bekijk diensten'
    },
    statistics: [
      { value: '100+', label: 'Aangeboden behandelingen' },
      { value: '50+', label: 'Gecertificeerde therapeuten' },
      { value: '2k+', label: 'Tevreden klanten' },
      { value: '300+', label: 'Uniek' }
    ],
    sectionHeaders: {
      services: {
        title: 'Onze diensten voor ultieme ontspanning',
        subtitle: 'Ervaar een vredige retraite met onze luxueuze spabehandelingen, ontworpen om uw zintuigen te verfrissen en harmonie te herstellen'
      }
    },
    seo: { keywords: [] }
  },
  de: {
    hero: {
      title: 'Willkommen bei ZenYourLife',
      subtitle: 'Entdecken Sie die Kunst der Entspannung und Verjüngung',
      badgeText: 'Startseite',
      buttonText: 'Dienstleistungen ansehen'
    },
    statistics: [
      { value: '100+', label: 'Angebotene Behandlungen' },
      { value: '50+', label: 'Zertifizierte Therapeuten' },
      { value: '2k+', label: 'Zufriedene Kunden' },
      { value: '300+', label: 'Einzigartig' }
    ],
    sectionHeaders: {
      services: {
        title: 'Unsere Dienstleistungen für ultimative Entspannung',
        subtitle: 'Erleben Sie einen friedlichen Rückzugsort mit unseren luxuriösen Spa-Behandlungen, die Ihre Sinne erfrischen und die Harmonie wiederherstellen'
      }
    },
    seo: { keywords: [] }
  },
  es: {
    hero: {
      title: 'Bienvenido a ZenYourLife',
      subtitle: 'Descubra el arte de la relajación y el rejuvenecimiento',
      badgeText: 'Inicio',
      buttonText: 'Ver servicios'
    },
    statistics: [
      { value: '100+', label: 'Tratamientos ofrecidos' },
      { value: '50+', label: 'Terapeutas certificados' },
      { value: '2k+', label: 'Clientes satisfechos' },
      { value: '300+', label: 'Bienestar único' }
    ],
    sectionHeaders: {
      services: {
        title: 'Nuestros servicios para la relajación definitiva',
        subtitle: 'Viva un retiro tranquilo con nuestros lujosos tratamientos de spa, diseñados para refrescar sus sentidos y restaurar la armonía'
      }
    },
    seo: { keywords: [] }
  }
};

// ============================================================
// 4. ABOUT PAGE CONTENT TRANSLATIONS
// ============================================================

const aboutPageTranslations = {
  fr: {
    hero: {
      title: 'Notre histoire de bien-être',
      subtitle: 'Découvrez notre parcours dans le bien-être',
      badgeText: 'À propos',
      buttonText: 'Voir les services'
    },
    statistics: [
      { value: '100+', label: 'Soins proposés' },
      { value: '50+', label: 'Thérapeutes certifiés' },
      { value: '2k+', label: 'Clients satisfaits' },
      { value: '300+', label: 'Bien-être unique' }
    ],
    sectionHeaders: {
      services: {
        title: 'Nos services pour une relaxation ultime',
        subtitle: 'Vivez une retraite paisible avec nos soins spa luxueux, conçus pour rafraîchir vos sens et restaurer l\'harmonie'
      }
    },
    seo: { keywords: [] }
  },
  nl: {
    hero: {
      title: 'Ons verhaal van welzijn',
      subtitle: 'Ontdek onze reis in welzijn',
      badgeText: 'Over ons',
      buttonText: 'Bekijk diensten'
    },
    statistics: [
      { value: '100+', label: 'Aangeboden behandelingen' },
      { value: '50+', label: 'Gecertificeerde therapeuten' },
      { value: '2k+', label: 'Tevreden klanten' },
      { value: '300+', label: 'Uniek' }
    ],
    sectionHeaders: {
      services: {
        title: 'Onze diensten voor ultieme ontspanning',
        subtitle: 'Ervaar een vredige retraite met onze luxueuze spabehandelingen, ontworpen om uw zintuigen te verfrissen en harmonie te herstellen'
      }
    },
    seo: { keywords: [] }
  },
  de: {
    hero: {
      title: 'Unsere Geschichte des Wohlbefindens',
      subtitle: 'Erfahren Sie mehr über unseren Weg',
      badgeText: 'Über uns',
      buttonText: 'Dienstleistungen ansehen'
    },
    statistics: [
      { value: '100+', label: 'Angebotene Behandlungen' },
      { value: '50+', label: 'Zertifizierte Therapeuten' },
      { value: '2k+', label: 'Zufriedene Kunden' },
      { value: '300+', label: 'Einzigartig' }
    ],
    sectionHeaders: {
      services: {
        title: 'Unsere Dienstleistungen für ultimative Entspannung',
        subtitle: 'Erleben Sie einen friedlichen Rückzugsort mit unseren luxuriösen Spa-Behandlungen, die Ihre Sinne erfrischen und die Harmonie wiederherstellen'
      }
    },
    seo: { keywords: [] }
  },
  es: {
    hero: {
      title: 'Nuestra historia de bienestar',
      subtitle: 'Conozca nuestro camino en el bienestar',
      badgeText: 'Acerca de',
      buttonText: 'Ver servicios'
    },
    statistics: [
      { value: '100+', label: 'Tratamientos ofrecidos' },
      { value: '50+', label: 'Terapeutas certificados' },
      { value: '2k+', label: 'Clientes satisfechos' },
      { value: '300+', label: 'Bienestar único' }
    ],
    sectionHeaders: {
      services: {
        title: 'Nuestros servicios para la relajación definitiva',
        subtitle: 'Viva un retiro tranquilo con nuestros lujosos tratamientos de spa, diseñados para refrescar sus sentidos y restaurar la armonía'
      }
    },
    seo: { keywords: [] }
  }
};

// ============================================================
// MAIN EXECUTION
// ============================================================

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  // --- 1. Update Properties ---
  console.log('\n=== UPDATING PROPERTIES ===');
  const propertiesCol = db.collection('properties');
  for (const [name, translations] of Object.entries(propertyTranslations)) {
    const result = await propertiesCol.updateOne(
      { name },
      { $set: { translations } }
    );
    if (result.modifiedCount > 0) {
      console.log(`UPDATED: ${name}`);
    } else {
      console.log(`NOT FOUND or NO CHANGE: ${name}`);
    }
  }

  // --- 2. Update Testimonials ---
  console.log('\n=== UPDATING TESTIMONIALS ===');
  const testimonialsCol = db.collection('testimonials');
  for (const [name, translations] of Object.entries(testimonialTranslations)) {
    const result = await testimonialsCol.updateOne(
      { name },
      { $set: { translations } }
    );
    if (result.modifiedCount > 0) {
      console.log(`UPDATED: ${name}`);
    } else {
      console.log(`NOT FOUND or NO CHANGE: ${name}`);
    }
  }

  // --- 3. Update Home Page Content ---
  console.log('\n=== UPDATING HOME PAGE CONTENT ===');
  const pageContentsCol = db.collection('pagecontents');
  const homeResult = await pageContentsCol.updateOne(
    { pageId: 'home' },
    { $set: { translations: homePageTranslations } }
  );
  if (homeResult.modifiedCount > 0) {
    console.log('UPDATED: Home page content');
  } else {
    console.log('NOT FOUND or NO CHANGE: Home page content');
  }

  // --- 4. Update About Page Content ---
  console.log('\n=== UPDATING ABOUT PAGE CONTENT ===');
  const aboutResult = await pageContentsCol.updateOne(
    { pageId: 'about' },
    { $set: { translations: aboutPageTranslations } }
  );
  if (aboutResult.modifiedCount > 0) {
    console.log('UPDATED: About page content');
  } else {
    console.log('NOT FOUND or NO CHANGE: About page content');
  }

  console.log('\nDone! All translations updated.');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
