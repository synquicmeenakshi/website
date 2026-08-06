/**
 * Add translations for testimonials to database
 * Translations are pre-stored to avoid paid API calls during browsing
 *
 * Run with: node scripts/translateTestimonials.js
 */

const mongoose = require('mongoose');
const Testimonial = require('../models/Testimonial');
require('dotenv').config();

// Pre-translated testimonials by name
const testimonialTranslations = {
  "Abhi Jain": {
    fr: {
      text: "Après avoir exploré la plateforme @ZenYourLife pendant quelques mois, j'ai enfin franchi le pas. Wow, c'est révolutionnaire ! Essayez-le ! Vous ne le regretterez pas ! 🤘🏻",
      role: "@once"
    },
    de: {
      text: "Nachdem ich die @ZenYourLife Plattform ein paar Monate erkundet hatte, habe ich endlich den Sprung gewagt. Wow, es ist ein Game Changer! Probieren Sie es aus! Sie werden es nicht bereuen! 🤘🏻",
      role: "@once"
    },
    nl: {
      text: "Na een paar maanden het @ZenYourLife platform te hebben verkend, heb ik eindelijk de sprong gewaagd. Wow, het is een game changer! Probeer het gewoon! Je krijgt er geen spijt van! 🤘🏻",
      role: "@once"
    }
  },
  "Sebas": {
    fr: {
      text: "Une fois que vous commencez à utiliser @ZenYourLife, il n'y a pas de retour en arrière. Cela a complètement transformé mon parcours bien-être. Réserver des massages et des soins n'a jamais été aussi simple ! 🔥🔥",
      role: "@sebasbedoya"
    },
    de: {
      text: "Sobald Sie anfangen @ZenYourLife zu benutzen, gibt es kein Zurück mehr. Es hat meine Reise komplett verändert. Massagen und Behandlungen zu buchen war noch nie einfacher! 🔥🔥",
      role: "@sebasbedoya"
    },
    nl: {
      text: "Zodra je begint met @ZenYourLife, is er geen weg terug. Het heeft mijn reis volledig getransformeerd. Massages en behandelingen boeken was nog nooit zo makkelijk! 🔥🔥",
      role: "@sebasbedoya"
    }
  },
  "Dylan Pearson": {
    fr: {
      text: "ZenYourLife - La Tesla des services de bien-être. Une brève séance avec leur expert a presque doublé ma relaxation. Imaginez ce que leur plateforme peut faire pour vous ! L'avenir est radieux. ☀",
      role: "@dylanbusiness"
    },
    de: {
      text: "ZenYourLife - Der Tesla der Massagedienstleistungen. Eine kurze Sitzung mit ihrem Experten hat meine Entspannung fast verdoppelt. Stellen Sie sich vor, was ihre Plattform für Sie tun kann! Die Zukunft ist rosig. ☀",
      role: "@dylanbusiness"
    },
    nl: {
      text: "ZenYourLife - De Tesla van massagediensten. Een korte sessie met hun expert heeft mijn ontspanning bijna verdubbeld. Stel je voor wat hun platform voor jou kan doen! De toekomst is rooskleurig. ☀",
      role: "@dylanbusiness"
    }
  },
  "Piero Madu": {
    fr: {
      text: "@ZenYourLife a révolutionné ma routine de soins personnels. Utiliser leurs services est essentiel pour maintenir l'équilibre et gérer le stress de la vie quotidienne ! ⚡",
      role: "@pieromadu"
    },
    de: {
      text: "@ZenYourLife hat meine Selbstpflege-Routine revolutioniert. Ihre Dienste zu nutzen ist unerlässlich, um Balance zu halten und den Stress des Alltags zu bewältigen! ⚡",
      role: "@pieromadu"
    },
    nl: {
      text: "@ZenYourLife heeft mijn zelfzorgroutine gerevolutioneerd. Hun diensten gebruiken is essentieel voor het behouden van balans en het navigeren door de stress van het dagelijks leven! ⚡",
      role: "@pieromadu"
    }
  },
  "George Klein": {
    fr: {
      text: "ZenYourLife est l'aboutissement de l'expertise en bien-être et des contributions de nombreux professionnels. Les soins personnels sont là pour rester. ZenYourLife est l'avenir du bien-être ! 💎",
      role: "@GeorgeBlue94"
    },
    de: {
      text: "ZenYourLife ist der Höhepunkt von Expertise und Beiträgen vieler Fachleute. Selbstpflege ist gekommen um zu bleiben. ZenYourLife ist die Zukunft des Wohlbefindens! 💎",
      role: "@GeorgeBlue94"
    },
    nl: {
      text: "ZenYourLife is het hoogtepunt van expertise en bijdragen van vele professionals. Zelfzorg is here to stay. ZenYourLife is de toekomst van welzijn! 💎",
      role: "@GeorgeBlue94"
    }
  },
  "Jordan Welch": {
    fr: {
      text: "J'ai fait partie du lancement bêta... absolument époustouflant. Gérer mes rendez-vous bien-être n'a jamais été aussi simple. @ZenYourLife est de loin ma plateforme préférée",
      role: "@jrdn.w"
    },
    de: {
      text: "Ich war Teil des Beta-Launches... absolut umwerfend. Die Verwaltung meiner Termine war noch nie so einfach. @ZenYourLife ist bei weitem meine bevorzugte Plattform",
      role: "@jrdn.w"
    },
    nl: {
      text: "Ik was onderdeel van de bèta-lancering... absoluut verbluffend. Het beheren van mijn afspraken was nog nooit zo makkelijk. @ZenYourLife is verreweg mijn favoriete platform",
      role: "@jrdn.w"
    }
  },
  "Faiz W": {
    fr: {
      text: "Incroyable ! @ZenYourLife élève votre niveau de bien-être. Mon niveau de stress a considérablement diminué en un rien de temps ! 😱",
      role: "@Faiz"
    },
    de: {
      text: "Unglaublich! @ZenYourLife hebt Ihr Spiel auf ein neues Level. Mein Stresslevel ist in kürzester Zeit deutlich gesunken! 😱",
      role: "@Faiz"
    },
    nl: {
      text: "Ongelooflijk! @ZenYourLife tilt je naar een hoger niveau. Mijn stressniveau is in korte tijd aanzienlijk gedaald! 😱",
      role: "@Faiz"
    }
  },
  "Sarah Miller": {
    fr: {
      text: "La meilleure décision que j'ai prise cette année était de rejoindre ZenYourLife. Leurs masseurs sont de classe mondiale et le système de réservation est tellement fluide ! 🤘🏻",
      role: "@sarahm"
    },
    de: {
      text: "Die beste Entscheidung, die ich dieses Jahr getroffen habe, war ZenYourLife beizutreten. Ihre Massagetherapeuten sind Weltklasse und das Buchungssystem ist so reibungslos! 🤘🏻",
      role: "@sarahm"
    },
    nl: {
      text: "De beste beslissing die ik dit jaar heb genomen was om lid te worden van ZenYourLife. Hun massagetherapeuten zijn wereldklasse en het boekingssysteem is zo soepel! 🤘🏻",
      role: "@sarahm"
    }
  }
};

async function addTranslations() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zenyourlife';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    let updatedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;

    for (const [name, translations] of Object.entries(testimonialTranslations)) {
      // Find testimonial by name
      const testimonial = await Testimonial.findOne({ name: name });

      if (!testimonial) {
        console.log(`❌ Testimonial not found: ${name}`);
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
    console.log(`Testimonial Translation Summary:`);
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
