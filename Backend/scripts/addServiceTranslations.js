/**
 * Script to add service translations to the database
 * Run with: node scripts/addServiceTranslations.js
 *
 * This adds pre-translated content for cost-efficient multi-language support
 */

const mongoose = require('mongoose');
const Service = require('../models/Service');
require('dotenv').config();

// Add your translated services here
const serviceTranslations = [
  {
    // Match by title (case-insensitive)
    title: "Zen Your Body",
    translations: {
      en: {
        title: "Zen Your Body",
        description: "A complete full-body massage designed to release tension, restore balance, and bring harmony to your entire being. Experience deep relaxation as skilled hands work through every muscle group.",
        benefits: [
          "Improved blood circulation throughout the body",
          "Release of muscle tension and knots",
          "Enhanced mental clarity and focus",
          "Better sleep quality"
        ],
        target_audience: [
          "Anyone seeking complete relaxation",
          "People with high stress levels",
          "Those needing a mental reset",
          "Individuals with general muscle tension"
        ]
      },
      nl: {
        title: "Zen Je Lichaam",
        description: "Een volledige lichaamsmassage die is ontworpen om spanning los te laten, balans te herstellen en harmonie in je hele lichaam te brengen. Ervaar diepe ontspanning terwijl vaardige handen elke spiergroep behandelen.",
        benefits: [
          "Verbeterde bloedcirculatie door het hele lichaam",
          "Vermindering van spierspanning en knopen",
          "Verbeterde mentale helderheid en focus",
          "Betere slaapkwaliteit"
        ],
        target_audience: [
          "Iedereen die volledige ontspanning zoekt",
          "Mensen met veel stress",
          "Degenen die een mentale reset nodig hebben",
          "Personen met algemene spierspanning"
        ]
      },
      fr: {
        title: "Zen Votre Corps",
        description: "Un massage complet du corps conçu pour libérer les tensions, restaurer l'équilibre et apporter une harmonie à tout votre être. Vivez une profonde relaxation grâce aux mains expertes travaillant chaque groupe musculaire.",
        benefits: [
          "Amélioration de la circulation sanguine dans tout le corps",
          "Libération des tensions musculaires et des nœuds",
          "Clarté mentale et concentration améliorées",
          "Meilleure qualité de sommeil"
        ],
        target_audience: [
          "Toute personne recherchant une relaxation complète",
          "Personnes ayant un niveau de stress élevé",
          "Ceux qui ont besoin d'une remise à zéro mentale",
          "Individus souffrant de tensions musculaires générales"
        ]
      },
      de: {
        title: "Zen Für Deinen Körper",
        description: "Eine vollständige Ganzkörpermassage, die entwickelt wurde, um Verspannungen zu lösen, Balance wiederherzustellen und Harmonie in deinen gesamten Körper zu bringen. Erlebe tiefe Entspannung, während geschulte Hände jede Muskelgruppe durchgehen.",
        benefits: [
          "Verbesserte Durchblutung im ganzen Körper",
          "Lösung von Muskelverspannungen und -knoten",
          "Verbesserte mentale Klarheit und Fokus",
          "Bessere Schlafqualität"
        ],
        target_audience: [
          "Alle, die vollständige Entspannung suchen",
          "Menschen mit hohem Stresslevel",
          "Personen, die einen mentalen Neustart benötigen",
          "Individuen mit allgemeiner Muskelverspannung"
        ]
      }
    }
  },
  {
    title: "Back & Neck",
    translations: {
      en: {
        title: "Back & Neck",
        description: "You don't have much time, but you still want to enjoy a massage that melts away all your tension like snow in the sun... Then a back and neck massage is the ideal solution for you. In half an hour you will be reborn.",
        contentSections: [
          {
            title: "Stress away in a jiffy",
            description: "You don't have much time, but you still want to enjoy a massage that melts away all your tension like snow in the sun... Then a back and neck massage is the ideal solution for you. In half an hour you will be reborn."
          },
          {
            title: "Also ideal after intensive sports or work",
            description: "Because tensions mainly occur in the neck, shoulders and back, we will only focus on these regions. With warm oil and adapted essential oils we get a spectacular result. Come and try it out. Also ideal after intensive sports or hard work."
          }
        ],
        benefits: [
          "Quick tension relief in 30 minutes",
          "Focused treatment on problem areas",
          "Uses warm oil and essential oils",
          "Perfect for busy schedules"
        ],
        target_audience: [
          "People with limited time who need quick relief",
          "Those with neck and shoulder tension",
          "Athletes after intensive sports sessions",
          "Workers after hard physical labor"
        ]
      },
      nl: {
        title: "Rug & Nek",
        description: "Je hebt niet veel tijd, maar je wilt toch genieten van een massage die al je spanning doet smelten als sneeuw voor de zon... Dan is een rug- en nekmassage de ideale oplossing voor jou. Binnen een half uur voel je je herboren.",
        contentSections: [
          {
            title: "Stress weg in een mum van tijd",
            description: "Je hebt niet veel tijd, maar je wilt toch genieten van een massage die al je spanning doet smelten als sneeuw voor de zon... Dan is een rug- en nekmassage de ideale oplossing voor jou. Binnen een half uur voel je je herboren."
          },
          {
            title: "Ook ideaal na intensief sporten of werk",
            description: "Omdat spanningen vooral in de nek, schouders en rug ontstaan, richten we ons enkel op deze zones. Met warme olie en aangepaste etherische oliën behalen we een spectaculair resultaat. Kom het zelf ervaren. Ook ideaal na intensief sporten of zwaar werk."
          }
        ],
        benefits: [
          "Snelle spanningsverlichting in 30 minuten",
          "Gerichte behandeling van probleemzones",
          "Gebruik van warme olie en etherische oliën",
          "Perfect voor drukke agenda's"
        ],
        target_audience: [
          "Mensen met weinig tijd die snel verlichting nodig hebben",
          "Mensen met nek- en schouderspanning",
          "Atleten na intensieve sportsessies",
          "Werknemers na zwaar fysiek werk"
        ]
      },
      fr: {
        title: "Dos & Cou",
        description: "Vous n'avez pas beaucoup de temps, mais vous souhaitez tout de même profiter d'un massage qui fait fondre toutes vos tensions comme neige au soleil... Alors un massage du dos et du cou est la solution idéale pour vous. En une demi-heure, vous renaîtrez.",
        contentSections: [
          {
            title: "Le stress disparaît en un instant",
            description: "Vous n'avez pas beaucoup de temps, mais vous souhaitez tout de même profiter d'un massage qui fait fondre toutes vos tensions comme neige au soleil... Alors un massage du dos et du cou est la solution idéale pour vous. En une demi-heure, vous renaîtrez."
          },
          {
            title: "Aussi idéal après un sport intensif ou le travail",
            description: "Comme les tensions apparaissent principalement dans le cou, les épaules et le dos, nous nous concentrons uniquement sur ces zones. Avec de l'huile chaude et des huiles essentielles adaptées, nous obtenons un résultat spectaculaire. Venez essayer. Aussi idéal après un sport intensif ou un travail physique."
          }
        ],
        benefits: [
          "Soulagement rapide des tensions en 30 minutes",
          "Traitement ciblé des zones problématiques",
          "Utilisation d'huile chaude et d'huiles essentielles",
          "Parfait pour les horaires chargés"
        ],
        target_audience: [
          "Personnes disposant de peu de temps mais ayant besoin de soulagement rapide",
          "Personnes souffrant de tensions au cou et aux épaules",
          "Athlètes après des séances sportives intensives",
          "Travailleurs après un travail physique intense"
        ]
      },
      de: {
        title: "Rücken & Nacken",
        description: "Du hast nicht viel Zeit, möchtest aber dennoch eine Massage genießen, die all deine Anspannung wie Schnee in der Sonne schmelzen lässt... Dann ist eine Rücken- und Nackenmassage die ideale Lösung für dich. In einer halben Stunde fühlst du dich wie neu geboren.",
        contentSections: [
          {
            title: "Stress im Handumdrehen weg",
            description: "Du hast nicht viel Zeit, möchtest aber dennoch eine Massage genießen, die all deine Anspannung wie Schnee in der Sonne schmelzen lässt... Dann ist eine Rücken- und Nackenmassage die ideale Lösung für dich. In einer halben Stunde fühlst du dich wie neu geboren."
          },
          {
            title: "Auch ideal nach intensivem Sport oder Arbeit",
            description: "Da Spannungen hauptsächlich im Nacken, in den Schultern und im Rücken entstehen, konzentrieren wir uns nur auf diese Bereiche. Mit warmem Öl und passenden ätherischen Ölen erzielen wir ein beeindruckendes Ergebnis. Probiere es aus. Auch ideal nach intensivem Sport oder harter körperlicher Arbeit."
          }
        ],
        benefits: [
          "Schnelle Spannungsreduzierung in 30 Minuten",
          "Gezielte Behandlung von Problemzonen",
          "Verwendung von warmem Öl und ätherischen Ölen",
          "Perfekt für volle Terminkalender"
        ],
        target_audience: [
          "Menschen mit wenig Zeit, die schnelle Linderung brauchen",
          "Personen mit Nacken- und Schulterverspannungen",
          "Sportler nach intensiven Trainingseinheiten",
          "Arbeiter nach körperlich anstrengender Arbeit"
        ]
      }
    }
  },
  {
    title: "Detox",
    translations: {
      en: {
        title: "Detox",
        description: "A purifying massage therapy designed to stimulate your lymphatic system and help eliminate toxins from your body. Feel refreshed, lighter, and rejuvenated after this cleansing treatment.",
        contentSections: [
          {
            title: "Rich in minerals",
            description: "At the salt stamp massage in Groot-Bijgaarden, stamps are filled with salt from the Dead Sea. This salt is very rich in sulphur, magnesium, and many other minerals. We add essential oils of juniper and lavender to enhance the effect."
          },
          {
            title: "Skin Purifying",
            description: "By heating the stamps in oil and performing special drainage movements, this massage becomes a true purification for your skin. You will also experience a gentle peeling due to the dissolving salt, and your skin will be remineralized. Ideal for psoriasis, dull skin, general fatigue, fibromyalgia, and more."
          }
        ],
        benefits: [
          "Stimulates lymphatic drainage",
          "Helps eliminate toxins from the body",
          "Reduces water retention and bloating",
          "Boosts immune system function",
          "Increases energy levels"
        ],
        target_audience: [
          "Those looking to cleanse their body",
          "People with sluggish lymphatic systems",
          "Individuals wanting to boost immunity",
          "Anyone feeling bloated or heavy"
        ]
      },
      nl: {
        title: "Detox",
        description: "Een zuiverende massagetherapie die het lymfestelsel stimuleert en helpt om toxines uit je lichaam te verwijderen. Voel je verfrist, lichter en herboren na deze reinigende behandeling.",
        contentSections: [
          {
            title: "Rijk aan mineralen",
            description: "Bij de zoutstempelmassage in Groot-Bijgaarden worden stempels gevuld met zout uit de Dode Zee. Dit zout is zeer rijk aan zwavel, magnesium en vele andere mineralen. We voegen etherische oliën van jeneverbes en lavendel toe om het effect te versterken."
          },
          {
            title: "Huidzuiverend",
            description: "Door de stempels te verwarmen in olie en speciale drainagebewegingen uit te voeren, wordt deze massage een echte zuivering voor je huid. Je ervaart ook een zachte peeling door het oplossende zout, en je huid wordt opnieuw gemineraliseerd. Ideaal voor psoriasis, doffe huid, algemene vermoeidheid, fibromyalgie, ..."
          }
        ],
        benefits: [
          "Stimuleert lymfedrainage",
          "Helpt bij het verwijderen van toxines uit het lichaam",
          "Vermindert vochtretentie en een opgeblazen gevoel",
          "Versterkt de werking van het immuunsysteem",
          "Verhoogt het energieniveau"
        ],
        target_audience: [
          "Mensen die hun lichaam willen reinigen",
          "Personen met een traag werkend lymfestelsel",
          "Mensen die hun immuniteit willen versterken",
          "Iedereen die zich opgeblazen of zwaar voelt"
        ]
      },
      fr: {
        title: "Détox",
        description: "Un massage purifiant conçu pour stimuler votre système lymphatique et aider à éliminer les toxines du corps. Ressentez une sensation de légèreté, de fraîcheur et de renouveau après ce soin nettoyant.",
        contentSections: [
          {
            title: "Riche en minéraux",
            description: "Lors du massage aux tampons de sel à Groot-Bijgaarden, les tampons sont remplis de sel de la mer Morte. Ce sel est très riche en soufre, magnésium et autres minéraux. Nous ajoutons des huiles essentielles de genièvre et de lavande pour renforcer l'effet."
          },
          {
            title: "Purification de la peau",
            description: "En chauffant les tampons dans l'huile et en effectuant des mouvements de drainage spécifiques, ce massage devient une véritable purification pour la peau. Vous ressentirez également un léger gommage grâce au sel qui se dissout, et votre peau sera reminéralisée. Idéal pour le psoriasis, la peau terne, la fatigue générale, la fibromyalgie, ..."
          }
        ],
        benefits: [
          "Stimule le drainage lymphatique",
          "Aide à éliminer les toxines du corps",
          "Réduit la rétention d'eau et les ballonnements",
          "Renforce le système immunitaire",
          "Augmente les niveaux d'énergie"
        ],
        target_audience: [
          "Personnes souhaitant purifier leur corps",
          "Personnes avec un système lymphatique lent",
          "Individus voulant renforcer leur immunité",
          "Toute personne se sentant lourde ou ballonnée"
        ]
      },
      de: {
        title: "Detox",
        description: "Eine reinigende Massagetherapie, die darauf abzielt, das Lymphsystem zu stimulieren und Giftstoffe aus dem Körper auszuleiten. Fühlen Sie sich nach dieser reinigenden Behandlung erfrischt, leichter und verjüngt.",
        contentSections: [
          {
            title: "Reich an Mineralien",
            description: "Bei der Salzstempelmassage in Groot-Bijgaarden werden die Stempel mit Salz aus dem Toten Meer gefüllt. Dieses Salz ist reich an Schwefel, Magnesium und vielen anderen Mineralien. Wir fügen ätherische Öle von Wacholder und Lavendel hinzu, um die Wirkung zu verstärken."
          },
          {
            title: "Hautreinigung",
            description: "Durch das Erwärmen der Stempel in Öl und spezielle Drainagebewegungen wird diese Massage zu einer echten Reinigung für Ihre Haut. Sie erleben auch ein sanftes Peeling durch das sich lösende Salz und Ihre Haut wird remineralisiert. Ideal bei Psoriasis, fahler Haut, allgemeiner Müdigkeit, Fibromyalgie, ..."
          }
        ],
        benefits: [
          "Stimuliert die Lymphdrainage",
          "Hilft, Giftstoffe aus dem Körper zu entfernen",
          "Reduziert Wasseransammlungen und Blähungen",
          "Stärkt die Funktion des Immunsystems",
          "Erhöht das Energieniveau"
        ],
        target_audience: [
          "Menschen, die ihren Körper reinigen möchten",
          "Personen mit einem träge arbeitenden Lymphsystem",
          "Menschen, die ihre Immunität stärken möchten",
          "Jeder, der sich aufgebläht oder schwer fühlt"
        ]
      }
    }
  },
  {
    title: "Hopstempel",
    translations: {
      en: {
        title: "Hopstempel",
        description: "A unique Belgian tradition using warm hop stamp compresses. The aromatic herbs release their soothing properties as they're pressed gently against your body, promoting deep relaxation.",
        contentSections: [
          {
            title: "Numerous advantages",
            description: "A massage with warm hop stamps... This is an exclusive treatment at Zen Your Life! Hop stamps are bundles filled with hops heated in steam to release their healing properties. They are used against hypersensitivity, nervousness, melancholy, cramps, nerve pain, migraines, and more."
          },
          {
            title: "Indigenous herb",
            description: "This hop stamp massage in Groot-Bijgaarden is based on the Oriental herbal stamp massage. However, we use a native herb (hop), which gives a different result. And if the treatment alone is not enough, we will serve you a delicious regional beer after the massage."
          }
        ],
        benefits: [
          "Natural aromatherapy from Belgian hops",
          "Deep muscle relaxation",
          "Detoxification through herbal therapy",
          "Calming effect on the nervous system",
          "Improved skin texture from natural herbs"
        ],
        target_audience: [
          "Lovers of traditional therapies",
          "Those seeking natural healing methods",
          "People interested in herbal treatments",
          "Anyone wanting a unique spa experience"
        ]
      },
      nl: {
        title: "Hopstempel",
        description: "Een unieke Belgische traditie met warme hopstempelcompressen. De aromatische kruiden geven hun kalmerende eigenschappen vrij wanneer ze zachtjes op het lichaam worden gedrukt, wat diepe ontspanning bevordert.",
        contentSections: [
          {
            title: "Tal van voordelen",
            description: "Een massage met warme hopstempels... Dit is een exclusieve behandeling bij Zen Your Life! Hopstempels zijn bundels gevuld met hop die in stoom worden verwarmd om hun geneeskrachtige eigenschappen vrij te geven. Ze worden gebruikt tegen overgevoeligheid, nervositeit, melancholie, krampen, zenuwpijnen, migraine, ..."
          },
          {
            title: "Inheemkruid",
            description: "Deze hopstempelmassage in Groot-Bijgaarden is gebaseerd op de oosterse kruidenstempelmassage. Maar wij gebruiken een inheems kruid (hop), wat zorgt voor een ander resultaat. En als de behandeling nog niet genoeg is, serveren we je na de massage een heerlijk streekbier."
          }
        ],
        benefits: [
          "Natuurlijke aromatherapie met Belgische hop",
          "Diepe spierontspanning",
          "Detoxificatie door kruidentherapie",
          "Kalmerend effect op het zenuwstelsel",
          "Verbeterde huidtextuur door natuurlijke kruiden"
        ],
        target_audience: [
          "Liefhebbers van traditionele behandelingen",
          "Zij die natuurlijke geneesmethoden zoeken",
          "Mensen die geïnteresseerd zijn in kruidentherapie",
          "Iedereen die een unieke spa-ervaring wil"
        ]
      },
      fr: {
        title: "Hopstempel",
        description: "Une tradition de bien-être belge unique utilisant des compresses chaudes de houblon. Les herbes aromatiques libèrent leurs propriétés apaisantes lorsqu'elles sont doucement pressées contre votre corps, favorisant une relaxation profonde.",
        contentSections: [
          {
            title: "De nombreux avantages",
            description: "Un massage avec des tampons de houblon chauds... C'est un soin exclusif de Zen Your Life ! Les tampons de houblon sont des sachets remplis de houblon chauffés à la vapeur pour libérer leurs propriétés curatives. Ils sont utilisés contre l'hypersensibilité, la nervosité, la mélancolie, les crampes, les douleurs nerveuses, les migraines, ..."
          },
          {
            title: "Herbe indigène",
            description: "Ce massage aux tampons de houblon à Groot-Bijgaarden est inspiré du massage oriental aux tampons d'herbes. Cependant, nous utilisons une herbe locale (le houblon), ce qui donne un résultat différent. Et si le soin ne suffit pas, nous vous servirons une délicieuse bière régionale après le massage."
          }
        ],
        benefits: [
          "Aromathérapie naturelle au houblon belge",
          "Relaxation musculaire profonde",
          "Détoxification grâce aux plantes",
          "Effet apaisant sur le système nerveux",
          "Texture de peau améliorée grâce aux herbes naturelles"
        ],
        target_audience: [
          "Amateurs de thérapies bien-être traditionnelles",
          "Personnes recherchant des méthodes de guérison naturelles",
          "Personnes intéressées par les traitements à base d'herbes",
          "Toute personne souhaitant une expérience spa unique"
        ]
      },
      de: {
        title: "Hopstempel",
        description: "Eine einzigartige belgische Tradition mit warmen Hopfenstempel-Kompressen. Die aromatischen Kräuter entfalten ihre beruhigenden Eigenschaften, wenn sie sanft auf den Körper gedrückt werden, und fördern eine tiefe Entspannung.",
        contentSections: [
          {
            title: "Zahlreiche Vorteile",
            description: "Eine Massage mit warmen Hopfenstempeln... Dies ist eine exklusive Behandlung bei Zen Your Life! Hopfenstempel sind Bündel, die mit Hopfen gefüllt und im Dampf erhitzt werden, um ihre heilenden Eigenschaften freizusetzen. Sie werden eingesetzt gegen Überempfindlichkeit, Nervosität, Melancholie, Krämpfe, Nervenschmerzen, Migräne, ..."
          },
          {
            title: "Einheimisches Kraut",
            description: "Diese Hopfenstempelmassage in Groot-Bijgaarden basiert auf der orientalischen Kräuterstempelmassage. Allerdings verwenden wir ein einheimisches Kraut (Hopfen), was zu einem anderen Ergebnis führt. Und falls die Behandlung allein nicht genügt, servieren wir Ihnen nach der Massage ein köstliches regionales Bier."
          }
        ],
        benefits: [
          "Natürliche Aromatherapie aus belgischem Hopfen",
          "Tiefe Muskelentspannung",
          "Detox durch Kräutertherapie",
          "Beruhigende Wirkung auf das Nervensystem",
          "Verbesserte Hautstruktur durch natürliche Kräuter"
        ],
        target_audience: [
          "Liebhaber traditioneller Therapien",
          "Personen, die natürliche Heilmethoden suchen",
          "Menschen, die sich für Kräuterbehandlungen interessieren",
          "Jeder, der ein einzigartiges Spa-Erlebnis wünscht"
        ]
      }
    }
  },
  {
    title: "Hotstone",
    translations: {
      en: {
        title: "Hotstone",
        description: "Ancient massage therapy using heated basalt stones. The name says it all - a hot stone massage that has been used by the Incas, Indians, Chinese and many other cultures for centuries to prevent and treat diseases and disorders.",
        contentSections: [
          {
            title: "Energy points",
            description: "We work with basalt stones, which retain heat and energy for a long time and slowly pass it on to the body. The stones are placed on acupuncture points and energy points and ironed over the meridians, bringing the energy of body and mind into harmony."
          },
          {
            title: "Other massage than with hands",
            description: "To relax, stones are placed on you to help your body get used to the heat. Then the body is smeared with oil to make the stones glide over the skin. Through the combination of massage and heat, your muscles are massaged differently than just with your hands."
          },
          {
            title: "Self-healing of the body",
            description: "A hot stone massage contributes to the self-healing of the body, stimulates the organs and blood circulation and contributes to detoxification."
          }
        ],
        benefits: [
          "Deep muscle relaxation with heated stones",
          "Improved blood circulation",
          "Body and mind harmony",
          "Natural detoxification"
        ],
        target_audience: [
          "Ideal for stress, tension, and blockages",
          "Those suffering from rheumatism or osteoarthritis",
          "People with poor circulation",
          "Anyone wanting to purely enjoy deep relaxation"
        ]
      },
      nl: {
        title: "Hotstone",
        description: "Oude massagetherapie met verwarmde basaltstenen. De naam zegt het al: een hotstone-massage die al eeuwenlang door de Inca's, indianen, Chinezen en vele andere culturen wordt gebruikt om ziekten en aandoeningen te voorkomen en te behandelen.",
        contentSections: [
          {
            title: "Energiepunten",
            description: "We werken met basaltstenen die warmte en energie lang vasthouden en langzaam afgeven aan het lichaam. De stenen worden op acupunctuurpunten en energiepunten geplaatst en over de meridianen bewogen, waardoor lichaam en geest weer in harmonie komen."
          },
          {
            title: "Andere massage dan met de handen",
            description: "Om te ontspannen worden stenen op je lichaam geplaatst zodat je lichaam kan wennen aan de warmte. Daarna wordt het lichaam ingesmeerd met olie zodat de stenen soepel over de huid kunnen glijden. Door de combinatie van massage en warmte worden je spieren anders gemasseerd dan alleen met de handen."
          },
          {
            title: "Zelfherstel van het lichaam",
            description: "Een hotstone-massage draagt bij aan het zelfherstellend vermogen van het lichaam, stimuleert de organen en de bloedcirculatie en ondersteunt de ontgifting."
          }
        ],
        benefits: [
          "Diepe spierontspanning met verwarmde stenen",
          "Verbeterde bloedcirculatie",
          "Harmonie tussen lichaam en geest",
          "Natuurlijke ontgifting"
        ],
        target_audience: [
          "Ideaal bij stress, spanning en blokkades",
          "Mensen met reuma of artrose",
          "Personen met slechte doorbloeding",
          "Iedereen die puur wil genieten van diepe ontspanning"
        ]
      },
      fr: {
        title: "Hotstone",
        description: "Ancienne thérapie de massage utilisant des pierres de basalte chauffées. Comme son nom l'indique, un massage aux pierres chaudes utilisé depuis des siècles par les Incas, les Indiens, les Chinois et de nombreuses autres cultures pour prévenir et traiter diverses affections.",
        contentSections: [
          {
            title: "Points d'énergie",
            description: "Nous utilisons des pierres de basalte qui retiennent la chaleur et l'énergie pendant longtemps et la diffusent lentement dans le corps. Les pierres sont placées sur des points d'acupuncture et d'énergie, puis glissées le long des méridiens pour harmoniser le corps et l'esprit."
          },
          {
            title: "Autre massage que celui des mains",
            description: "Pour favoriser la détente, des pierres sont placées sur votre corps afin qu'il s'habitue à la chaleur. Ensuite, le corps est huilé pour permettre aux pierres de glisser facilement. Grâce à la combinaison de la chaleur et du massage, les muscles sont massés différemment que simplement avec les mains."
          },
          {
            title: "Auto-guérison du corps",
            description: "Le massage aux pierres chaudes favorise l'auto-guérison, stimule les organes et la circulation sanguine et aide à la détoxification."
          }
        ],
        benefits: [
          "Relaxation musculaire profonde grâce aux pierres chauffées",
          "Amélioration de la circulation sanguine",
          "Harmonie entre le corps et l'esprit",
          "Détoxification naturelle"
        ],
        target_audience: [
          "Idéal pour le stress, les tensions et les blocages",
          "Personnes souffrant de rhumatismes ou d'arthrose",
          "Personnes avec une mauvaise circulation",
          "Toute personne recherchant une relaxation profonde"
        ]
      },
      de: {
        title: "Hotstone",
        description: "Alte Massagetherapie mit erhitzten Basaltsteinen. Wie der Name schon sagt – eine Hot-Stone-Massage, die seit Jahrhunderten von Inkas, Indianern, Chinesen und vielen anderen Kulturen zur Vorbeugung und Behandlung von Krankheiten verwendet wird.",
        contentSections: [
          {
            title: "Energiepunkte",
            description: "Wir arbeiten mit Basaltsteinen, die Wärme und Energie lange speichern und langsam an den Körper abgeben. Die Steine werden auf Akupunktur- und Energiepunkten platziert und über die Meridiane geführt, um Körper und Geist in Einklang zu bringen."
          },
          {
            title: "Andere Art der Massage als mit den Händen",
            description: "Zur Entspannung werden Steine auf den Körper gelegt, damit er sich an die Wärme gewöhnen kann. Anschließend wird der Körper mit Öl eingerieben, damit die Steine sanft über die Haut gleiten. Durch die Kombination von Wärme und Massage werden die Muskeln anders stimuliert als nur mit den Händen."
          },
          {
            title: "Selbstheilung des Körpers",
            description: "Eine Hot-Stone-Massage unterstützt die Selbstheilungskräfte des Körpers, stimuliert die Organe und die Durchblutung und fördert die Entgiftung."
          }
        ],
        benefits: [
          "Tiefe Muskelentspannung durch erwärmte Steine",
          "Verbesserte Durchblutung",
          "Harmonie zwischen Körper und Geist",
          "Natürliche Entgiftung"
        ],
        target_audience: [
          "Ideal bei Stress, Verspannungen und Blockaden",
          "Menschen mit Rheuma oder Arthrose",
          "Personen mit schlechter Durchblutung",
          "Alle, die tiefe Entspannung genießen möchten"
        ]
      }
    }
  }
  // Add more services here...
];

async function addTranslations() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zenyourlife';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    for (const serviceData of serviceTranslations) {
      // Find service by title
      const service = await Service.findOne({
        title: { $regex: new RegExp(serviceData.title, 'i') }
      });

      if (!service) {
        console.log(`✗ Service not found: ${serviceData.title}`);
        continue;
      }

      // Build update data
      const updateData = { translations: {} };

      // Update English content (main fields)
      if (serviceData.translations.en) {
        const en = serviceData.translations.en;
        if (en.title) updateData.title = en.title;
        if (en.description) updateData.description = en.description;
        if (en.benefits) {
          updateData.benefits = en.benefits.map(b =>
            typeof b === 'string' ? { description: b } : b
          );
        }
        if (en.target_audience) {
          updateData.targetAudience = en.target_audience.map(t =>
            typeof t === 'string' ? { description: t } : t
          );
        }
        if (en.contentSections) {
          updateData.contentSections = en.contentSections;
        }
      }

      // Update other languages
      for (const lang of ['fr', 'de', 'nl']) {
        if (serviceData.translations[lang]) {
          const trans = serviceData.translations[lang];
          updateData.translations[lang] = {
            title: trans.title || '',
            description: trans.description || '',
            benefits: (trans.benefits || []).map(b =>
              typeof b === 'string' ? { description: b } : b
            ),
            targetAudience: (trans.target_audience || []).map(t =>
              typeof t === 'string' ? { description: t } : t
            ),
            contentSections: trans.contentSections || []
          };
        }
      }

      await Service.findByIdAndUpdate(service._id, updateData, { new: true });
      console.log(`✓ Updated translations for: ${service.title}`);
    }

    console.log('\n✅ Translations added successfully!');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

addTranslations();
