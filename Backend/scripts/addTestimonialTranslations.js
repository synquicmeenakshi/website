/**
 * Script to add translations for all testimonials
 * Run: node backend/scripts/addTestimonialTranslations.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// =====================================================
// MASSAGE TESTIMONIALS - TRANSLATIONS
// =====================================================

const massageTestimonialTranslations = [
  {
    // Maria Rodriguez
    nameMatch: "Maria Rodriguez",
    en: {
      text: "The best massage experience I've ever had! The therapist was incredibly skilled and the atmosphere was so relaxing. I left feeling completely rejuvenated!",
      role: "@maria_m"
    },
    fr: {
      text: "La meilleure expérience de massage que j'ai jamais eue ! Le thérapeute était incroyablement compétent et l'atmosphère était si relaxante. Je suis partie complètement régénérée !",
      role: "@maria_m"
    },
    de: {
      text: "Das beste Massageerlebnis, das ich je hatte! Der Therapeut war unglaublich kompetent und die Atmosphäre war so entspannend. Ich fühlte mich völlig verjüngt!",
      role: "@maria_m"
    },
    nl: {
      text: "De beste massage-ervaring die ik ooit heb gehad! De therapeut was ongelooflijk bekwaam en de sfeer was zo ontspannend. Ik voelde me volledig verjongd!",
      role: "@maria_m"
    },
    es: {
      text: "¡La mejor experiencia de masaje que he tenido! El terapeuta fue increíblemente hábil y el ambiente era muy relajante. ¡Salí sintiéndome completamente rejuvenecida!",
      role: "@maria_m"
    }
  },
  {
    // James Wilson
    nameMatch: "James Wilson",
    en: {
      text: "Outstanding service! The deep tissue massage was exactly what I needed after a week of hiking. Professional, clean, and very relaxing environment.",
      role: "@jameswilson"
    },
    fr: {
      text: "Service exceptionnel ! Le massage des tissus profonds était exactement ce dont j'avais besoin après une semaine de randonnée. Environnement professionnel, propre et très relaxant.",
      role: "@jameswilson"
    },
    de: {
      text: "Hervorragender Service! Die Tiefengewebsmassage war genau das, was ich nach einer Woche Wandern brauchte. Professionelle, saubere und sehr entspannende Umgebung.",
      role: "@jameswilson"
    },
    nl: {
      text: "Uitstekende service! De diepweefselmassage was precies wat ik nodig had na een week wandelen. Professionele, schone en zeer ontspannende omgeving.",
      role: "@jameswilson"
    },
    es: {
      text: "¡Servicio excepcional! El masaje de tejido profundo era exactamente lo que necesitaba después de una semana de senderismo. Ambiente profesional, limpio y muy relajante.",
      role: "@jameswilson"
    }
  },
  {
    // Sophie Laurent
    nameMatch: "Sophie Laurent",
    en: {
      text: "Absolutely wonderful! The hot stone massage was divine. The therapist really understood my needs and created a perfect relaxing experience.",
      role: "@sophie_relax"
    },
    fr: {
      text: "Absolument merveilleux ! Le massage aux pierres chaudes était divin. Le thérapeute a vraiment compris mes besoins et a créé une expérience de relaxation parfaite.",
      role: "@sophie_relax"
    },
    de: {
      text: "Absolut wunderbar! Die Hot-Stone-Massage war göttlich. Der Therapeut hat meine Bedürfnisse wirklich verstanden und ein perfektes Entspannungserlebnis geschaffen.",
      role: "@sophie_relax"
    },
    nl: {
      text: "Absoluut geweldig! De hot stone massage was hemels. De therapeut begreep echt mijn behoeften en creëerde een perfecte ontspanningservaring.",
      role: "@sophie_relax"
    },
    es: {
      text: "¡Absolutamente maravilloso! El masaje con piedras calientes fue divino. El terapeuta realmente entendió mis necesidades y creó una experiencia de relajación perfecta.",
      role: "@sophie_relax"
    }
  },
  {
    // Carlos Mendez
    nameMatch: "Carlos Mendez",
    en: {
      text: "Professional massage therapy at its finest! Great technique, peaceful ambiance, and excellent customer service. Highly recommend!",
      role: "@carlos_fit"
    },
    fr: {
      text: "La massothérapie professionnelle à son meilleur ! Excellente technique, ambiance paisible et service client excellent. Je recommande vivement !",
      role: "@carlos_fit"
    },
    de: {
      text: "Professionelle Massagetherapie vom Feinsten! Großartige Technik, friedliche Atmosphäre und ausgezeichneter Kundenservice. Sehr zu empfehlen!",
      role: "@carlos_fit"
    },
    nl: {
      text: "Professionele massagetherapie op zijn best! Geweldige techniek, vredige sfeer en uitstekende klantenservice. Sterk aanbevolen!",
      role: "@carlos_fit"
    },
    es: {
      text: "¡Masoterapia profesional en su máxima expresión! Gran técnica, ambiente tranquilo y excelente servicio al cliente. ¡Muy recomendado!",
      role: "@carlos_fit"
    }
  }
];

// =====================================================
// VILLA ZEN YOUR LIFE TESTIMONIALS - TRANSLATIONS
// =====================================================

const villaTestimonialTranslations = [
  {
    // Sarah Miller
    nameMatch: "Sarah Miller",
    en: {
      text: "Villa Zen Your Life is absolutely stunning! The panoramic views of the volcanic landscape took our breath away. Perfect for families!",
      role: "@sarahmiller"
    },
    fr: {
      text: "Villa Zen Your Life est absolument magnifique ! Les vues panoramiques sur le paysage volcanique nous ont coupé le souffle. Parfait pour les familles !",
      role: "@sarahmiller"
    },
    de: {
      text: "Villa Zen Your Life ist absolut atemberaubend! Der Panoramablick auf die Vulkanlandschaft hat uns den Atem geraubt. Perfekt für Familien!",
      role: "@sarahmiller"
    },
    nl: {
      text: "Villa Zen Your Life is absoluut prachtig! Het panoramische uitzicht op het vulkanische landschap was adembenemend. Perfect voor gezinnen!",
      role: "@sarahmiller"
    },
    es: {
      text: "¡Villa Zen Your Life es absolutamente impresionante! Las vistas panorámicas del paisaje volcánico nos dejaron sin aliento. ¡Perfecto para familias!",
      role: "@sarahmiller"
    }
  },
  {
    // David Thompson
    nameMatch: "David Thompson",
    en: {
      text: "Best villa experience ever! Modern amenities, spacious rooms, and the private pool was amazing. Close to all the best beaches in Lanzarote!",
      role: "@david_explorer"
    },
    fr: {
      text: "La meilleure expérience de villa ! Équipements modernes, chambres spacieuses et la piscine privée était incroyable. Proche des meilleures plages de Lanzarote !",
      role: "@david_explorer"
    },
    de: {
      text: "Das beste Villa-Erlebnis überhaupt! Moderne Annehmlichkeiten, geräumige Zimmer und der private Pool war fantastisch. Nah an allen besten Stränden Lanzarotes!",
      role: "@david_explorer"
    },
    nl: {
      text: "Beste villa-ervaring ooit! Moderne voorzieningen, ruime kamers en het privézwembad was geweldig. Dicht bij alle beste stranden van Lanzarote!",
      role: "@david_explorer"
    },
    es: {
      text: "¡La mejor experiencia en villa! Comodidades modernas, habitaciones espaciosas y la piscina privada era increíble. ¡Cerca de las mejores playas de Lanzarote!",
      role: "@david_explorer"
    }
  },
  {
    // Emma Williams
    nameMatch: "Emma Williams",
    en: {
      text: "Villa Zen exceeded every expectation! The terrace is perfect for sunset dinners. Immaculate, luxurious, and the perfect Lanzarote getaway!",
      role: "@emmawanders"
    },
    fr: {
      text: "Villa Zen a dépassé toutes nos attentes ! La terrasse est parfaite pour les dîners au coucher du soleil. Immaculé, luxueux et l'escapade parfaite à Lanzarote !",
      role: "@emmawanders"
    },
    de: {
      text: "Villa Zen hat jede Erwartung übertroffen! Die Terrasse ist perfekt für Abendessen bei Sonnenuntergang. Makellos, luxuriös und der perfekte Lanzarote-Urlaub!",
      role: "@emmawanders"
    },
    nl: {
      text: "Villa Zen overtrof alle verwachtingen! Het terras is perfect voor diners bij zonsondergang. Onberispelijk, luxueus en het perfecte Lanzarote-uitje!",
      role: "@emmawanders"
    },
    es: {
      text: "¡Villa Zen superó todas las expectativas! La terraza es perfecta para cenas al atardecer. ¡Inmaculada, lujosa y la escapada perfecta a Lanzarote!",
      role: "@emmawanders"
    }
  },
  {
    // Robert Garcia
    nameMatch: "Robert Garcia",
    en: {
      text: "The villa is a dream come true! Contemporary design meets island charm. Everything was spotless and the location couldn't be better!",
      role: "@robertg_travel"
    },
    fr: {
      text: "La villa est un rêve devenu réalité ! Design contemporain et charme insulaire. Tout était impeccable et l'emplacement ne pouvait pas être meilleur !",
      role: "@robertg_travel"
    },
    de: {
      text: "Die Villa ist ein Traum! Zeitgenössisches Design trifft auf Inselcharme. Alles war makellos und die Lage könnte nicht besser sein!",
      role: "@robertg_travel"
    },
    nl: {
      text: "De villa is een droom die uitkomt! Eigentijds design ontmoet eilandcharme. Alles was smetteloos en de locatie kon niet beter!",
      role: "@robertg_travel"
    },
    es: {
      text: "¡La villa es un sueño hecho realidad! Diseño contemporáneo con encanto isleño. ¡Todo estaba impecable y la ubicación no podía ser mejor!",
      role: "@robertg_travel"
    }
  }
];

// =====================================================
// CASA ARTEVISTA TESTIMONIALS - TRANSLATIONS
// =====================================================

const casaTestimonialTranslations = [
  {
    // Isabella Martinez
    nameMatch: "Isabella Martinez",
    en: {
      text: "Casa Artevista is pure magic! The artistic design and ocean views create such a peaceful atmosphere. Perfect romantic retreat!",
      role: "@bella_travels"
    },
    fr: {
      text: "Casa Artevista est de la pure magie ! Le design artistique et les vues sur l'océan créent une atmosphère si paisible. Parfaite retraite romantique !",
      role: "@bella_travels"
    },
    de: {
      text: "Casa Artevista ist pure Magie! Das künstlerische Design und der Meerblick schaffen eine so friedliche Atmosphäre. Perfekter romantischer Rückzugsort!",
      role: "@bella_travels"
    },
    nl: {
      text: "Casa Artevista is pure magie! Het artistieke ontwerp en het uitzicht op de oceaan creëren zo'n vredige sfeer. Perfecte romantische retraite!",
      role: "@bella_travels"
    },
    es: {
      text: "¡Casa Artevista es pura magia! El diseño artístico y las vistas al mar crean una atmósfera muy tranquila. ¡Perfecto retiro romántico!",
      role: "@bella_travels"
    }
  },
  {
    // Michael Anderson
    nameMatch: "Michael Anderson",
    en: {
      text: "We loved every moment at Casa Artevista! The unique artistic touches and stunning sunsets made this stay unforgettable. Highly recommend!",
      role: "@mike_adventures"
    },
    fr: {
      text: "Nous avons adoré chaque moment à Casa Artevista ! Les touches artistiques uniques et les couchers de soleil magnifiques ont rendu ce séjour inoubliable. Je recommande vivement !",
      role: "@mike_adventures"
    },
    de: {
      text: "Wir haben jeden Moment in Casa Artevista geliebt! Die einzigartigen künstlerischen Details und atemberaubenden Sonnenuntergänge machten diesen Aufenthalt unvergesslich. Sehr empfehlenswert!",
      role: "@mike_adventures"
    },
    nl: {
      text: "We vonden elk moment in Casa Artevista geweldig! De unieke artistieke details en prachtige zonsondergangen maakten dit verblijf onvergetelijk. Sterk aanbevolen!",
      role: "@mike_adventures"
    },
    es: {
      text: "¡Amamos cada momento en Casa Artevista! Los toques artísticos únicos y las impresionantes puestas de sol hicieron esta estancia inolvidable. ¡Muy recomendado!",
      role: "@mike_adventures"
    }
  },
  {
    // Sophia Chen
    nameMatch: "Sophia Chen",
    en: {
      text: "Casa Artevista is a masterpiece! Every corner tells a story. The perfect blend of art, comfort, and island beauty. Can't wait to return!",
      role: "@sophiachen"
    },
    fr: {
      text: "Casa Artevista est un chef-d'œuvre ! Chaque coin raconte une histoire. Le mélange parfait d'art, de confort et de beauté insulaire. J'ai hâte d'y retourner !",
      role: "@sophiachen"
    },
    de: {
      text: "Casa Artevista ist ein Meisterwerk! Jede Ecke erzählt eine Geschichte. Die perfekte Mischung aus Kunst, Komfort und Inselschönheit. Kann es kaum erwarten zurückzukehren!",
      role: "@sophiachen"
    },
    nl: {
      text: "Casa Artevista is een meesterwerk! Elke hoek vertelt een verhaal. De perfecte mix van kunst, comfort en eilandschoonheid. Kan niet wachten om terug te komen!",
      role: "@sophiachen"
    },
    es: {
      text: "¡Casa Artevista es una obra maestra! Cada rincón cuenta una historia. La mezcla perfecta de arte, comodidad y belleza isleña. ¡No puedo esperar para volver!",
      role: "@sophiachen"
    }
  },
  {
    // Thomas Brown
    nameMatch: "Thomas Brown",
    en: {
      text: "Absolutely phenomenal stay at Casa Artevista! The property is gorgeous, the views are breathtaking, and the artistic vibe is incredible!",
      role: "@thomasb_vacation"
    },
    fr: {
      text: "Séjour absolument phénoménal à Casa Artevista ! La propriété est magnifique, les vues sont à couper le souffle et l'ambiance artistique est incroyable !",
      role: "@thomasb_vacation"
    },
    de: {
      text: "Absolut phänomenaler Aufenthalt in Casa Artevista! Das Anwesen ist wunderschön, die Aussichten sind atemberaubend und die künstlerische Atmosphäre ist unglaublich!",
      role: "@thomasb_vacation"
    },
    nl: {
      text: "Absoluut fenomenaal verblijf in Casa Artevista! Het pand is prachtig, de uitzichten zijn adembenemend en de artistieke sfeer is ongelooflijk!",
      role: "@thomasb_vacation"
    },
    es: {
      text: "¡Estancia absolutamente fenomenal en Casa Artevista! La propiedad es hermosa, las vistas son impresionantes y el ambiente artístico es increíble!",
      role: "@thomasb_vacation"
    }
  }
];

// Combine all translations
const allTranslations = [
  ...massageTestimonialTranslations,
  ...villaTestimonialTranslations,
  ...casaTestimonialTranslations
];

const addTestimonialTranslations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('testimonials');

    // Get all existing testimonials
    const testimonials = await collection.find({}).toArray();
    console.log(`Found ${testimonials.length} testimonials in database\n`);

    let updatedCount = 0;

    for (const translation of allTranslations) {
      // Find the matching testimonial by name
      const testimonial = testimonials.find(t => t.name === translation.nameMatch);

      if (testimonial) {
        console.log(`Updating translations for: ${translation.nameMatch}`);

        const result = await collection.updateOne(
          { _id: testimonial._id },
          {
            $set: {
              'translations.fr': translation.fr,
              'translations.de': translation.de,
              'translations.nl': translation.nl,
              'translations.es': translation.es
            }
          }
        );

        if (result.modifiedCount > 0) {
          updatedCount++;
          console.log(`  Updated successfully`);
        } else {
          console.log(`  No changes made`);
        }
      } else {
        console.log(`Testimonial not found: ${translation.nameMatch}`);
      }
    }

    // Verify the updates
    console.log('\nVerifying updates...');
    const verifyTestimonials = await collection.find({}).toArray();

    for (const t of verifyTestimonials) {
      const hasTranslations = t.translations?.nl?.text ? 'Yes' : 'No';
      console.log(`  ${t.name}: NL translation = ${hasTranslations}`);
    }

    console.log(`\nTotal testimonials updated: ${updatedCount} out of ${allTranslations.length}`);
    console.log('\nAll testimonial translations added successfully!');

    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

addTestimonialTranslations();
