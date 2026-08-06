/**
 * Script to add translations for additional testimonials
 * Run: node backend/scripts/addMoreTestimonialTranslations.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Additional testimonials that need translations
const additionalTranslations = [
  {
    nameMatch: "Elisabeth",
    en: {
      text: "The accommodation is certainly true to the description. Cozy and well-equipped with everything you need.",
      role: "Guest"
    },
    fr: {
      text: "L'hébergement correspond certainement à la description. Confortable et bien équipé avec tout ce dont vous avez besoin.",
      role: "Invité"
    },
    de: {
      text: "Die Unterkunft entspricht definitiv der Beschreibung. Gemütlich und gut ausgestattet mit allem, was Sie brauchen.",
      role: "Gast"
    },
    nl: {
      text: "De accommodatie komt zeker overeen met de beschrijving. Gezellig en goed uitgerust met alles wat je nodig hebt.",
      role: "Gast"
    },
    es: {
      text: "El alojamiento ciertamente corresponde a la descripción. Acogedor y bien equipado con todo lo que necesitas.",
      role: "Huésped"
    }
  },
  {
    nameMatch: "Aurelie",
    en: {
      text: "We had a pleasant stay at Caroline's. The accommodation is comfortable and the host was very welcoming.",
      role: "Guest"
    },
    fr: {
      text: "Nous avons passé un agréable séjour chez Caroline. L'hébergement est confortable et l'hôte était très accueillant.",
      role: "Invité"
    },
    de: {
      text: "Wir hatten einen angenehmen Aufenthalt bei Caroline. Die Unterkunft ist komfortabel und die Gastgeberin war sehr einladend.",
      role: "Gast"
    },
    nl: {
      text: "We hadden een aangenaam verblijf bij Caroline. De accommodatie is comfortabel en de gastvrouw was zeer gastvrij.",
      role: "Gast"
    },
    es: {
      text: "Tuvimos una estancia agradable con Caroline. El alojamiento es cómodo y la anfitriona fue muy acogedora.",
      role: "Huésped"
    }
  },
  {
    nameMatch: "Angela",
    en: {
      text: "Had a few nights here to finish our stay in Lanzarote. Great location and very comfortable.",
      role: "Guest"
    },
    fr: {
      text: "Nous avons passé quelques nuits ici pour terminer notre séjour à Lanzarote. Excellente situation et très confortable.",
      role: "Invité"
    },
    de: {
      text: "Wir verbrachten ein paar Nächte hier, um unseren Aufenthalt auf Lanzarote abzuschließen. Tolle Lage und sehr komfortabel.",
      role: "Gast"
    },
    nl: {
      text: "We hebben hier een paar nachten doorgebracht om ons verblijf op Lanzarote af te sluiten. Geweldige locatie en zeer comfortabel.",
      role: "Gast"
    },
    es: {
      text: "Pasamos unas noches aquí para terminar nuestra estancia en Lanzarote. Gran ubicación y muy cómodo.",
      role: "Huésped"
    }
  },
  {
    nameMatch: "Sarah",
    en: {
      text: "Lovely little house in a peaceful location. Walk to the village and great views.",
      role: "Guest"
    },
    fr: {
      text: "Charmante petite maison dans un endroit paisible. À distance de marche du village avec de superbes vues.",
      role: "Invité"
    },
    de: {
      text: "Schönes kleines Haus in ruhiger Lage. Fußweg zum Dorf und tolle Aussichten.",
      role: "Gast"
    },
    nl: {
      text: "Mooi klein huis op een rustige locatie. Op loopafstand van het dorp met prachtig uitzicht.",
      role: "Gast"
    },
    es: {
      text: "Encantadora casita en una ubicación tranquila. A poca distancia del pueblo y excelentes vistas.",
      role: "Huésped"
    }
  },
  {
    nameMatch: "Damian",
    en: {
      text: "The villa was perfect and was just what we wanted, spacious, clean and well-equipped.",
      role: "Guest"
    },
    fr: {
      text: "La villa était parfaite et exactement ce que nous voulions, spacieuse, propre et bien équipée.",
      role: "Invité"
    },
    de: {
      text: "Die Villa war perfekt und genau das, was wir wollten, geräumig, sauber und gut ausgestattet.",
      role: "Gast"
    },
    nl: {
      text: "De villa was perfect en precies wat we wilden, ruim, schoon en goed uitgerust.",
      role: "Gast"
    },
    es: {
      text: "La villa era perfecta y exactamente lo que queríamos, espaciosa, limpia y bien equipada.",
      role: "Huésped"
    }
  },
  {
    nameMatch: "Eden",
    en: {
      text: "Perfect stay for 4 adults and 2 children. Everything was clean and well organized.",
      role: "Guest"
    },
    fr: {
      text: "Séjour parfait pour 4 adultes et 2 enfants. Tout était propre et bien organisé.",
      role: "Invité"
    },
    de: {
      text: "Perfekter Aufenthalt für 4 Erwachsene und 2 Kinder. Alles war sauber und gut organisiert.",
      role: "Gast"
    },
    nl: {
      text: "Perfect verblijf voor 4 volwassenen en 2 kinderen. Alles was schoon en goed georganiseerd.",
      role: "Gast"
    },
    es: {
      text: "Estancia perfecta para 4 adultos y 2 niños. Todo estaba limpio y bien organizado.",
      role: "Huésped"
    }
  },
  {
    nameMatch: "Les",
    en: {
      text: "Firstly, the location was good. Very private and quiet area with beautiful views.",
      role: "Guest"
    },
    fr: {
      text: "Tout d'abord, l'emplacement était excellent. Zone très privée et calme avec de belles vues.",
      role: "Invité"
    },
    de: {
      text: "Zunächst war die Lage gut. Sehr private und ruhige Gegend mit schöner Aussicht.",
      role: "Gast"
    },
    nl: {
      text: "Ten eerste was de locatie goed. Zeer privé en rustig gebied met prachtig uitzicht.",
      role: "Gast"
    },
    es: {
      text: "En primer lugar, la ubicación era buena. Zona muy privada y tranquila con hermosas vistas.",
      role: "Huésped"
    }
  },
  {
    nameMatch: "Jens",
    en: {
      text: "Fabulous!",
      role: "Guest"
    },
    fr: {
      text: "Fabuleux !",
      role: "Invité"
    },
    de: {
      text: "Fabelhaft!",
      role: "Gast"
    },
    nl: {
      text: "Fantastisch!",
      role: "Gast"
    },
    es: {
      text: "¡Fabuloso!",
      role: "Huésped"
    }
  },
  {
    nameMatch: "Marc Vettori",
    en: {
      text: "Top zen your life massage.",
      role: "Client"
    },
    fr: {
      text: "Massage zen your life au top.",
      role: "Client"
    },
    de: {
      text: "Top Zen Your Life Massage.",
      role: "Kunde"
    },
    nl: {
      text: "Top zen your life massage.",
      role: "Klant"
    },
    es: {
      text: "Masaje zen your life de primera.",
      role: "Cliente"
    }
  },
  {
    nameMatch: "Tamer Ahmed",
    en: {
      text: "Very quiet and relaxing atmosphere.",
      role: "Client"
    },
    fr: {
      text: "Atmosphère très calme et relaxante.",
      role: "Client"
    },
    de: {
      text: "Sehr ruhige und entspannende Atmosphäre.",
      role: "Kunde"
    },
    nl: {
      text: "Zeer rustige en ontspannende sfeer.",
      role: "Klant"
    },
    es: {
      text: "Ambiente muy tranquilo y relajante.",
      role: "Cliente"
    }
  },
  {
    nameMatch: "Hulusi",
    en: {
      text: "Very satisfied, I highly recommend it!",
      role: "Client"
    },
    fr: {
      text: "Très satisfait, je le recommande vivement !",
      role: "Client"
    },
    de: {
      text: "Sehr zufrieden, ich empfehle es sehr!",
      role: "Kunde"
    },
    nl: {
      text: "Zeer tevreden, ik raad het ten zeerste aan!",
      role: "Klant"
    },
    es: {
      text: "Muy satisfecho, ¡lo recomiendo mucho!",
      role: "Cliente"
    }
  },
  {
    nameMatch: "Thomas & Julia",
    en: {
      text: "What a hidden gem! Casa Artevista was the highlight of our trip to Lanzarote.",
      role: "Guests"
    },
    fr: {
      text: "Quelle pépite cachée ! Casa Artevista a été le point fort de notre voyage à Lanzarote.",
      role: "Invités"
    },
    de: {
      text: "Was für ein verstecktes Juwel! Casa Artevista war das Highlight unserer Reise nach Lanzarote.",
      role: "Gäste"
    },
    nl: {
      text: "Wat een verborgen pareltje! Casa Artevista was het hoogtepunt van onze reis naar Lanzarote.",
      role: "Gasten"
    },
    es: {
      text: "¡Qué joya escondida! Casa Artevista fue lo mejor de nuestro viaje a Lanzarote.",
      role: "Huéspedes"
    }
  }
];

const addMoreTranslations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('testimonials');

    let updatedCount = 0;

    for (const translation of additionalTranslations) {
      const testimonial = await collection.findOne({ name: translation.nameMatch });

      if (testimonial) {
        // Check if NL translation already has proper content or needs update
        const existingNL = testimonial.translations?.nl?.text;

        console.log(`Updating: ${translation.nameMatch}`);
        console.log(`  Current NL: "${existingNL?.substring(0, 30) || 'None'}..."`);

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
        console.log(`Not found: ${translation.nameMatch}`);
      }
    }

    console.log(`\nTotal updated: ${updatedCount}`);
    console.log('\nDone!');

    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

addMoreTranslations();
