/**
 * Add translations for rental testimonials to database
 * Translations are pre-stored to avoid paid API calls during browsing
 *
 * Run with: node scripts/translateRentalTestimonials.js
 */

const mongoose = require('mongoose');
const RentalTestimonial = require('../models/RentalTestimonial');
require('dotenv').config();

// Pre-translated rental testimonials by name
const rentalTestimonialTranslations = {
  "vedansh": {
    fr: {
      text: "Après avoir exploré la plateforme pendant quelques mois, j'ai enfin franchi le pas. Wow, c'est révolutionnaire ! Essayez-le ! Vous ne le regretterez pas ! 🤘🏻",
      role: "@once"
    },
    de: {
      text: "Nachdem ich die Plattform ein paar Monate erkundet hatte, habe ich endlich den Sprung gewagt. Wow, es ist ein Game Changer! Probieren Sie es aus! Sie werden es nicht bereuen! 🤘🏻",
      role: "@once"
    },
    nl: {
      text: "Na een paar maanden het platform te hebben verkend, heb ik eindelijk de sprong gewaagd. Wow, het is een game changer! Probeer het gewoon! Je krijgt er geen spijt van! 🤘🏻",
      role: "@once"
    }
  },
  "Sebas": {
    fr: {
      text: "Une fois que vous commencez à utiliser ce service, il n'y a pas de retour en arrière. Cela a complètement transformé mon approche des voyages. Analyser et comparer les locations n'a jamais été aussi simple ! 🔥🔥",
      role: "@sebasbedoya"
    },
    de: {
      text: "Sobald Sie diesen Service nutzen, gibt es kein Zurück mehr. Es hat meinen Ansatz zum Reisen komplett verändert. Unterkünfte zu analysieren und zu vergleichen war noch nie so einfach! 🔥🔥",
      role: "@sebasbedoya"
    },
    nl: {
      text: "Zodra je deze service gaat gebruiken, is er geen weg terug. Het heeft mijn benadering van reizen volledig getransformeerd. Het analyseren en vergelijken van accommodaties was nog nooit zo makkelijk! 🔥🔥",
      role: "@sebasbedoya"
    }
  },
  "Dylan Pearson": {
    fr: {
      text: "Le Tesla des services de location. Une brève consultation avec leur expert a presque doublé ma satisfaction de séjour. Imaginez ce que leur plateforme peut faire pour vous ! L'avenir est radieux. ☀",
      role: "@dylanbusiness"
    },
    de: {
      text: "Der Tesla der Vermietungsdienste. Eine kurze Beratung mit ihrem Experten hat meine Aufenthaltszufriedenheit fast verdoppelt. Stellen Sie sich vor, was ihre Plattform für Sie tun kann! Die Zukunft ist rosig. ☀",
      role: "@dylanbusiness"
    },
    nl: {
      text: "De Tesla van verhuurservices. Een korte consultatie met hun expert heeft mijn verblijfstevredenheid bijna verdubbeld. Stel je voor wat hun platform voor jou kan doen! De toekomst is rooskleurig. ☀",
      role: "@dylanbusiness"
    }
  },
  "Piero Madu": {
    fr: {
      text: "Ce service a révolutionné ma stratégie de voyage. L'utiliser est essentiel pour maximiser la détente et naviguer dans les complexités de la planification de vacances ! ⚡",
      role: "@pieromadu"
    },
    de: {
      text: "Dieser Service hat meine Reisestrategie revolutioniert. Ihn zu nutzen ist unerlässlich, um Entspannung zu maximieren und die Komplexität der Urlaubsplanung zu meistern! ⚡",
      role: "@pieromadu"
    },
    nl: {
      text: "Deze service heeft mijn reisstrategie gerevolutioneerd. Het gebruiken ervan is essentieel voor het maximaliseren van ontspanning en het navigeren door de complexiteit van vakantieplanning! ⚡",
      role: "@pieromadu"
    }
  },
  "George Klein": {
    fr: {
      text: "C'est l'aboutissement d'un an de travail et de contributions de nombreux experts. Les locations de vacances de qualité sont là pour rester. C'est l'avenir du voyage ! 💎",
      role: "@GeorgeBlue94"
    },
    de: {
      text: "Dies ist der Höhepunkt eines Jahres Arbeit und Beiträge vieler Experten. Qualitäts-Ferienwohnungen sind gekommen um zu bleiben. Dies ist die Zukunft des Reisens! 💎",
      role: "@GeorgeBlue94"
    },
    nl: {
      text: "Dit is het hoogtepunt van een jaar werk en bijdragen van vele experts. Kwaliteits vakantieverblijven zijn here to stay. Dit is de toekomst van reizen! 💎",
      role: "@GeorgeBlue94"
    }
  },
  "Jordan Welch": {
    fr: {
      text: "J'ai fait partie du lancement bêta... absolument époustouflant. Gérer mes réservations de vacances n'a jamais été aussi simple. C'est de loin ma plateforme préférée",
      role: "@jrdn.w"
    },
    de: {
      text: "Ich war Teil des Beta-Launches... absolut umwerfend. Die Verwaltung meiner Urlaubsbuchungen war noch nie so einfach. Dies ist bei weitem meine bevorzugte Plattform",
      role: "@jrdn.w"
    },
    nl: {
      text: "Ik was onderdeel van de bèta-lancering... absoluut verbluffend. Het beheren van mijn vakantieboekingen was nog nooit zo makkelijk. Dit is verreweg mijn favoriete platform",
      role: "@jrdn.w"
    }
  },
  "Faiz W": {
    fr: {
      text: "Incroyable ! Ce service élève votre expérience de voyage. Ma satisfaction de vacances a considérablement augmenté en un rien de temps ! 😱",
      role: "@Faiz"
    },
    de: {
      text: "Unglaublich! Dieser Service hebt Ihr Reiseerlebnis auf ein neues Level. Meine Urlaubszufriedenheit ist in kürzester Zeit deutlich gestiegen! 😱",
      role: "@Faiz"
    },
    nl: {
      text: "Ongelooflijk! Deze service tilt je reiservaring naar een hoger niveau. Mijn vakantietevredenheid is in korte tijd aanzienlijk gestegen! 😱",
      role: "@Faiz"
    }
  },
  "Sarah Johnson": {
    fr: {
      text: "L'expérience de location était fluide du début à la fin. Je recommande vivement leurs propriétés à tous ceux qui recherchent une retraite paisible !",
      role: "@sarahj"
    },
    de: {
      text: "Das Mieterlebnis war von Anfang bis Ende nahtlos. Ich empfehle ihre Unterkünfte jedem, der einen friedlichen Rückzugsort sucht!",
      role: "@sarahj"
    },
    nl: {
      text: "De huurervaring was naadloos van begin tot eind. Ik raad hun accommodaties ten zeerste aan voor iedereen die op zoek is naar een rustige toevluchtsoord!",
      role: "@sarahj"
    }
  }
};

async function addTranslations() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meenakshi';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    let updatedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;

    for (const [name, translations] of Object.entries(rentalTestimonialTranslations)) {
      // Find testimonial by name
      const testimonial = await RentalTestimonial.findOne({ name: name });

      if (!testimonial) {
        console.log(`❌ Rental testimonial not found: ${name}`);
        notFoundCount++;
        continue;
      }

      // Check if already has translations
      const hasTranslations = testimonial.translations?.fr?.text ||
                              testimonial.translations?.de?.text ||
                              testimonial.translations?.nl?.text;

      if (hasTranslations) {
        console.log(`⏭️  Skipping (already translated): ${name}`);
        skippedCount++;
        continue;
      }

      // Update with translations
      testimonial.translations = {
        fr: translations.fr,
        de: translations.de,
        nl: translations.nl
      };

      await testimonial.save();
      console.log(`✅ Added translations for: ${name}`);
      updatedCount++;
    }

    console.log(`\n========================================`);
    console.log(`Rental Testimonial Translation Summary:`);
    console.log(`  Updated: ${updatedCount} testimonials`);
    console.log(`  Skipped: ${skippedCount} testimonials`);
    console.log(`  Not found: ${notFoundCount} testimonials`);
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
