/**
 * Add translations for remaining massage and facial services
 * Translations for: Sports Massage, Reflexology, Zen Facial Mini,
 * Sultane of Saba Cleopatra, Soldiers of Sand Magic Gold, Anti-Aging, Targeted Peeling
 *
 * Run with: node scripts/translateRemainingServices.js
 */

const mongoose = require('mongoose');
const Service = require('../models/Service');
require('dotenv').config();

// Complete translations for all 7 remaining services
const serviceTranslations = {
  // ========== SPORTS MASSAGE ==========
  "Sports Massage": {
    fr: {
      title: "Massage Sportif",
      description: "Spécialement conçu pour les athlètes et les personnes actives. Ce massage thérapeutique cible les groupes musculaires utilisés dans votre sport ou votre routine de fitness, aidant à la récupération, la flexibilité et la performance.",
      benefits: [
        { title: "Récupération rapide", description: "Récupération musculaire plus rapide après les entraînements" },
        { title: "Flexibilité accrue", description: "Flexibilité et amplitude de mouvement améliorées" },
        { title: "Prévention des blessures", description: "Prévention des blessures liées au sport" },
        { title: "Réduction des douleurs", description: "Réduction des courbatures et de la fatigue musculaire" },
        { title: "Performance améliorée", description: "Performance athlétique optimisée" }
      ],
      targetAudience: [
        { title: "Athlètes", description: "Athlètes professionnels et amateurs" },
        { title: "Passionnés de fitness", description: "Passionnés de fitness et amateurs de salle de sport" },
        { title: "Sportifs d'endurance", description: "Coureurs, cyclistes et nageurs" },
        { title: "Récupération active", description: "Toute personne en récupération après une activité physique" }
      ],
      contentSections: [
        { title: "Soutien idéal du mode de vie sportif", description: "Un massage sportif est légèrement plus dynamique que le massage Zen Your Body et est idéal pour le sport, après le sport ou comme entretien pendant une pratique sportive régulière.\n\nToute personne qui bouge régulièrement, tant l'athlète récréatif que celui qui pratique le sport à un niveau plus élevé, peut grandement bénéficier du massage sportif. De nombreux athlètes de haut niveau font confiance à Zen Your Life pour leur massage sportif." },
        { title: "Effet profond sur le muscle", description: "Les techniques du massage sportif (lissage, pétrissage et techniques de pression), qui sont dérivées du massage suédois et de la pression sur les points de pression, ont un effet profond sur le tissu conjonctif musculaire." },
        { title: "Prévention des blessures", description: "Les muscles rigides ou excessivement tendus augmentent le risque de blessure lors de l'exercice. Si vous faites régulièrement un massage sportif, vous garderez non seulement vos muscles souples, mais vous stimulerez également la circulation sanguine, améliorerez le drainage lymphatique et accélérerez l'élimination de l'acide lactique." }
      ]
    },
    de: {
      title: "Sportmassage",
      description: "Speziell für Sportler und aktive Menschen entwickelt. Diese therapeutische Massage zielt auf Muskelgruppen ab, die bei Ihrem Sport oder Fitnessprogramm beansprucht werden, und hilft bei Erholung, Flexibilität und Leistung.",
      benefits: [
        { title: "Schnelle Erholung", description: "Schnellere Muskelerholung nach dem Training" },
        { title: "Erhöhte Flexibilität", description: "Verbesserte Flexibilität und Bewegungsfreiheit" },
        { title: "Verletzungsprävention", description: "Vorbeugung von sportbedingten Verletzungen" },
        { title: "Schmerzreduktion", description: "Reduzierter Muskelkater und Ermüdung" },
        { title: "Verbesserte Leistung", description: "Optimierte sportliche Leistung" }
      ],
      targetAudience: [
        { title: "Sportler", description: "Professionelle und Amateursportler" },
        { title: "Fitness-Enthusiasten", description: "Fitness-Enthusiasten und Fitnessstudio-Besucher" },
        { title: "Ausdauersportler", description: "Läufer, Radfahrer und Schwimmer" },
        { title: "Aktive Erholung", description: "Jeder, der sich von körperlicher Aktivität erholt" }
      ],
      contentSections: [
        { title: "Ideale Unterstützung des sportlichen Lebensstils", description: "Eine Sportmassage ist etwas dynamischer als die Zen Your Body Massage und ist ideal für Sport, nach dem Sport oder als Pflege während regelmäßiger sportlicher Aktivitäten.\n\nJeder, der sich regelmäßig bewegt, sowohl der Freizeitsportler als auch derjenige, der auf höherem Niveau Sport treibt, kann von einer Sportmassage stark profitieren. Es gibt viele Spitzensportler, die auf Zen Your Life für ihre Sportmassage vertrauen." },
        { title: "Tiefe Wirkung auf den Muskel", description: "Die Techniken der Sportmassage (Streichen, Kneten und Drucktechniken), die von der schwedischen Massage und dem Druck auf Druckpunkte abgeleitet sind, haben eine tiefe Wirkung auf das Muskel-Bindegewebe." },
        { title: "Verletzungen vorbeugen", description: "Steife oder übermäßig angespannte Muskeln erhöhen das Verletzungsrisiko beim Sport. Wenn Sie regelmäßig eine Sportmassage erhalten, halten Sie nicht nur Ihre Muskeln geschmeidig, sondern stimulieren auch die Durchblutung, verbessern den Lymphabfluss und beschleunigen den Abbau von Milchsäure." }
      ]
    },
    nl: {
      title: "Sportmassage",
      description: "Speciaal ontworpen voor atleten en actieve mensen. Deze therapeutische massage richt zich op spiergroepen die worden gebruikt bij uw sport of fitnessroutine, en helpt bij herstel, flexibiliteit en prestaties.",
      benefits: [
        { title: "Snel herstel", description: "Sneller spierherstel na trainingen" },
        { title: "Verhoogde flexibiliteit", description: "Verbeterde flexibiliteit en bewegingsvrijheid" },
        { title: "Blessurepreventie", description: "Preventie van sportgerelateerde blessures" },
        { title: "Verminderde spierpijn", description: "Verminderde spierpijn en vermoeidheid" },
        { title: "Verbeterde prestaties", description: "Geoptimaliseerde atletische prestaties" }
      ],
      targetAudience: [
        { title: "Atleten", description: "Professionele en amateur atleten" },
        { title: "Fitness enthousiastelingen", description: "Fitness enthousiastelingen en sportschoolgangers" },
        { title: "Duursporten", description: "Hardlopers, fietsers en zwemmers" },
        { title: "Actief herstel", description: "Iedereen die herstelt van fysieke activiteit" }
      ],
      contentSections: [
        { title: "Ideale ondersteuning van sportieve levensstijl", description: "Een sportmassage is iets dynamischer dan de Zen Your Body massage en is ideaal bij sport, na sport of als onderhoud tijdens regelmatig sporten.\n\nIedereen die regelmatig beweegt, zowel de recreatieve sporter als degene die op hoger niveau sport, kan veel baat hebben bij sportmassage. Er zijn veel topsporters die vertrouwen op Zen Your Life voor hun sportmassage." },
        { title: "Diep effect op de spier", description: "De technieken van sportmassage (strijken, kneden en druktechnieken), die zijn afgeleid van de Zweedse massage en de druk op drukpunten, hebben een diep effect op het spierweefsel." },
        { title: "Blessures voorkomen", description: "Stijve of overmatig gespannen spieren verhogen het risico op blessures bij het sporten. Als u regelmatig een sportmassage krijgt, houdt u niet alleen uw spieren soepel, maar stimuleert u ook de bloedcirculatie, verbetert u de lymfedrainage en versnelt u de afvoer van melkzuur." }
      ]
    }
  },

  // ========== REFLEXOLOGY ==========
  "Reflexology": {
    fr: {
      title: "Réflexologie",
      description: "Ciblez les points de pression sur vos pieds pour libérer les blocages, améliorer le flux d'énergie et améliorer la santé et le bien-être général. Cet art de guérison ancien traite tout le corps à travers les pieds.",
      benefits: [
        { title: "Stimulation nerveuse", description: "Stimule la fonction nerveuse et l'énergie" },
        { title: "Relaxation profonde", description: "Soulage la tension et favorise la relaxation" },
        { title: "Circulation améliorée", description: "Améliore la circulation dans tout le corps" },
        { title: "Soulagement des maux de tête", description: "Aide contre les maux de tête et les migraines" },
        { title: "Guérison naturelle", description: "Favorise la guérison naturelle" }
      ],
      targetAudience: [
        { title: "Guérison holistique", description: "Ceux qui recherchent une guérison holistique" },
        { title: "Fatigue chronique", description: "Personnes souffrant de fatigue chronique" },
        { title: "Problèmes circulatoires", description: "Personnes ayant des problèmes de circulation" },
        { title: "Thérapies alternatives", description: "Toute personne intéressée par les thérapies alternatives" }
      ],
      contentSections: []
    },
    de: {
      title: "Reflexzonenmassage",
      description: "Zielt auf Druckpunkte an Ihren Füßen ab, um Blockaden zu lösen, den Energiefluss zu verbessern und die allgemeine Gesundheit und das Wohlbefinden zu steigern. Diese alte Heilkunst behandelt den ganzen Körper über die Füße.",
      benefits: [
        { title: "Nervenstimulation", description: "Stimuliert die Nervenfunktion und Energie" },
        { title: "Tiefe Entspannung", description: "Löst Spannungen und fördert Entspannung" },
        { title: "Verbesserte Durchblutung", description: "Verbessert die Durchblutung im ganzen Körper" },
        { title: "Kopfschmerzlinderung", description: "Hilft bei Kopfschmerzen und Migräne" },
        { title: "Natürliche Heilung", description: "Fördert die natürliche Heilung" }
      ],
      targetAudience: [
        { title: "Ganzheitliche Heilung", description: "Diejenigen, die ganzheitliche Heilung suchen" },
        { title: "Chronische Müdigkeit", description: "Menschen mit chronischer Müdigkeit" },
        { title: "Kreislaufprobleme", description: "Personen mit Kreislaufproblemen" },
        { title: "Alternative Therapien", description: "Jeder, der sich für alternative Therapien interessiert" }
      ],
      contentSections: []
    },
    nl: {
      title: "Reflexologie",
      description: "Richt zich op drukpunten op uw voeten om blokkades los te maken, de energiestroom te verbeteren en de algehele gezondheid en welzijn te verbeteren. Deze oude geneeskunst behandelt het hele lichaam via de voeten.",
      benefits: [
        { title: "Zenuwstimulatie", description: "Stimuleert zenuwfunctie en energie" },
        { title: "Diepe ontspanning", description: "Verlicht spanning en bevordert ontspanning" },
        { title: "Verbeterde circulatie", description: "Verbetert de bloedcirculatie door het hele lichaam" },
        { title: "Hoofdpijnverlichting", description: "Helpt bij hoofdpijn en migraine" },
        { title: "Natuurlijke genezing", description: "Bevordert natuurlijke genezing" }
      ],
      targetAudience: [
        { title: "Holistische genezing", description: "Mensen die holistische genezing zoeken" },
        { title: "Chronische vermoeidheid", description: "Mensen met chronische vermoeidheid" },
        { title: "Circulatieproblemen", description: "Personen met circulatieproblemen" },
        { title: "Alternatieve therapieën", description: "Iedereen die geïnteresseerd is in alternatieve therapieën" }
      ],
      contentSections: []
    }
  },

  // ========== ZEN FACIAL MINI ==========
  "Zen Facial Mini": {
    fr: {
      title: "Soin Visage Zen Mini",
      description: "Un soin du visage rapide mais efficace, parfait pour les personnes pressées. Découvrez un nettoyage essentiel, une tonification et une hydratation dans une séance compacte qui laisse votre peau rafraîchie et éclatante.",
      benefits: [
        { title: "Rafraîchissement rapide", description: "Rafraîchissement rapide pour les emplois du temps chargés" },
        { title: "Nettoyage profond", description: "Nettoyage en profondeur et affinement des pores" },
        { title: "Hydratation instantanée", description: "Boost d'hydratation instantané" },
        { title: "Éclat amélioré", description: "Éclat de la peau amélioré" },
        { title: "Entretien parfait", description: "Entretien parfait entre les soins complets" }
      ],
      targetAudience: [
        { title: "Professionnels occupés", description: "Professionnels occupés avec peu de temps" },
        { title: "Routine de soins", description: "Ceux qui maintiennent leur routine de soins de la peau" },
        { title: "Premiers clients", description: "Clients découvrant les soins du visage pour la première fois" },
        { title: "Coup d'éclat rapide", description: "Toute personne ayant besoin d'un coup de frais rapide pour la peau" }
      ],
      contentSections: [
        { title: "Soin rapide et efficace", description: "Pas beaucoup de temps? Chouchoutez votre peau avec un soin Zen Facial Mini. Un soin du visage de seulement 30 minutes. Comprend le nettoyage, tonique, combinaison gommage/masque à base de miel et sucre de canne brut et crème de jour hydratante. Nous travaillons avec les produits de Sultane de Saba." }
      ]
    },
    de: {
      title: "Zen Gesichtsbehandlung Mini",
      description: "Eine schnelle, aber effektive Gesichtsbehandlung, perfekt für Menschen mit wenig Zeit. Erleben Sie essentielle Reinigung, Tonisierung und Feuchtigkeit in einer kompakten Sitzung, die Ihre Haut erfrischt und zum Strahlen bringt.",
      benefits: [
        { title: "Schnelle Erfrischung", description: "Schnelle Erfrischung für volle Terminkalender" },
        { title: "Tiefenreinigung", description: "Tiefenreinigung und Porenverfeinerung" },
        { title: "Sofortige Feuchtigkeit", description: "Sofortiger Feuchtigkeitsschub" },
        { title: "Verbesserter Glanz", description: "Verbesserter Hautglanz" },
        { title: "Perfekte Pflege", description: "Perfekte Pflege zwischen vollständigen Behandlungen" }
      ],
      targetAudience: [
        { title: "Beschäftigte Berufstätige", description: "Beschäftigte Berufstätige mit wenig Zeit" },
        { title: "Hautpflege-Routine", description: "Diejenigen, die ihre Hautpflege-Routine beibehalten" },
        { title: "Erstkunden", description: "Kunden, die zum ersten Mal eine Gesichtsbehandlung ausprobieren" },
        { title: "Schnelle Auffrischung", description: "Jeder, der eine schnelle Hautauffrischung braucht" }
      ],
      contentSections: [
        { title: "Schnelle und effektive Pflege", description: "Nicht viel Zeit? Verwöhnen Sie Ihre Haut mit einer Zen Facial Mini Behandlung. Eine Gesichtsbehandlung von nur 30 Minuten. Beinhaltet Reinigung, Tonic, Kombinations-Peeling/Maske auf Basis von Honig und Rohrzucker sowie feuchtigkeitsspendende Tagescreme. Wir arbeiten mit Produkten von Sultane de Saba." }
      ]
    },
    nl: {
      title: "Zen Gezichtsbehandeling Mini",
      description: "Een snelle maar effectieve gezichtsbehandeling, perfect voor mensen die weinig tijd hebben. Ervaar essentiële reiniging, toning en hydratatie in een compacte sessie die uw huid verfrist en stralend achterlaat.",
      benefits: [
        { title: "Snelle opfrisser", description: "Snelle opfrisser voor drukke agenda's" },
        { title: "Diepe reiniging", description: "Diepe reiniging en poriënverfijning" },
        { title: "Directe hydratatie", description: "Directe hydratatieboost" },
        { title: "Verbeterde glans", description: "Verbeterde huidglans" },
        { title: "Perfect onderhoud", description: "Perfect onderhoud tussen volledige behandelingen" }
      ],
      targetAudience: [
        { title: "Drukke professionals", description: "Drukke professionals met beperkte tijd" },
        { title: "Huidverzorgingsroutine", description: "Mensen die hun huidverzorgingsroutine onderhouden" },
        { title: "Eerste klanten", description: "Klanten die voor het eerst een gezichtsbehandeling proberen" },
        { title: "Snelle opkikker", description: "Iedereen die een snelle huidopkikker nodig heeft" }
      ],
      contentSections: [
        { title: "Snelle en effectieve verzorging", description: "Niet veel tijd? Verwen uw huid met een Zen Facial Mini behandeling. Een gezichtsbehandeling van slechts 30 minuten. Inclusief reiniging, tonic, combinatie scrub/masker op basis van honing en ruwe rietsuiker en hydraterende dagcrème. We werken met producten van Sultane de Saba." }
      ]
    }
  },

  // ========== SULTANE OF SABA CLEOPATRA ==========
  "Sultane of Saba Cleopatra": {
    fr: {
      title: "Sultane de Saba Cléopâtre",
      description: "Inspiré des rituels de beauté légendaires de la Reine Cléopâtre. Ce soin du visage luxueux utilise des huiles précieuses et des techniques égyptiennes anciennes pour offrir une peau radieuse et jeune digne de la royauté.",
      benefits: [
        { title: "Soin royal luxueux", description: "Soin de beauté royal luxueux" },
        { title: "Nutrition profonde", description: "Nutrition profonde avec des huiles précieuses" },
        { title: "Anti-âge", description: "Anti-âge et rajeunissement de la peau" },
        { title: "Élasticité améliorée", description: "Élasticité et fermeté de la peau améliorées" },
        { title: "Teint radieux", description: "Teint radieux et éclatant" }
      ],
      targetAudience: [
        { title: "Expériences de luxe", description: "Ceux qui recherchent des expériences de soins de luxe" },
        { title: "Peaux matures", description: "Peaux matures nécessitant un rajeunissement" },
        { title: "Occasions spéciales", description: "Préparation pour des occasions spéciales" },
        { title: "Être choyé", description: "Toute personne voulant se sentir choyée comme une reine" }
      ],
      contentSections: [
        { title: "Aperçu", description: "Avec le soin Sultane De Saba Cléopâtre, vous profiterez d'un soin parfait et complet qui fera briller votre peau et la parfumera comme des roses. Ce soin convient à tous les types de peau." },
        { title: "Nettoyage, hydratation, soin", description: "Le soin Sultane De Saba Cléopâtre comprend le nettoyage, le tonique, le gommage, le masque, le sérum et la crème de jour hydratante. Si désiré, le soin peut être combiné avec l'épilation des sourcils." }
      ]
    },
    de: {
      title: "Sultane de Saba Kleopatra",
      description: "Inspiriert von den legendären Schönheitsritualen der Königin Kleopatra. Diese luxuriöse Gesichtsbehandlung verwendet kostbare Öle und altägyptische Techniken, um strahlende, jugendliche Haut zu liefern, die einer Königin würdig ist.",
      benefits: [
        { title: "Luxuriöse königliche Behandlung", description: "Luxuriöse königliche Schönheitsbehandlung" },
        { title: "Tiefe Nährung", description: "Tiefe Nährung mit kostbaren Ölen" },
        { title: "Anti-Aging", description: "Anti-Aging und Hautverjüngung" },
        { title: "Verbesserte Elastizität", description: "Verbesserte Hautelastizität und Festigkeit" },
        { title: "Strahlender Teint", description: "Strahlender, leuchtender Teint" }
      ],
      targetAudience: [
        { title: "Luxus-Erlebnisse", description: "Diejenigen, die luxuriöse Hautpflege-Erlebnisse suchen" },
        { title: "Reife Haut", description: "Reife Haut, die Verjüngung braucht" },
        { title: "Besondere Anlässe", description: "Vorbereitung für besondere Anlässe" },
        { title: "Verwöhnung", description: "Jeder, der sich wie eine Königin verwöhnt fühlen möchte" }
      ],
      contentSections: [
        { title: "Überblick", description: "Mit der Sultane De Saba Kleopatra Behandlung genießen Sie eine perfekte, vollständige Behandlung, die Ihre Haut zum Strahlen bringt und nach Rosen duften lässt. Diese Behandlung ist für alle Hauttypen geeignet." },
        { title: "Reinigung, Feuchtigkeit, Pflege", description: "Die Sultane De Saba Kleopatra Behandlung umfasst Reinigung, Tonic, Peeling, Maske, Serum und feuchtigkeitsspendende Tagescreme. Auf Wunsch kann die Behandlung mit der Augenbrauen-Epilation kombiniert werden." }
      ]
    },
    nl: {
      title: "Sultane de Saba Cleopatra",
      description: "Geïnspireerd door de legendarische schoonheidsrituelen van koningin Cleopatra. Deze luxueuze gezichtsbehandeling gebruikt kostbare oliën en oude Egyptische technieken om een stralende, jeugdige huid te leveren die een koningin waardig is.",
      benefits: [
        { title: "Luxe koninklijke behandeling", description: "Luxe koninklijke schoonheidsbehandeling" },
        { title: "Diepe voeding", description: "Diepe voeding met kostbare oliën" },
        { title: "Anti-aging", description: "Anti-aging en huidverjonging" },
        { title: "Verbeterde elasticiteit", description: "Verbeterde huidelasticiteit en stevigheid" },
        { title: "Stralende teint", description: "Stralende, glanzende teint" }
      ],
      targetAudience: [
        { title: "Luxe ervaringen", description: "Mensen die luxe huidverzorgingservaringen zoeken" },
        { title: "Rijpe huid", description: "Rijpe huid die verjonging nodig heeft" },
        { title: "Speciale gelegenheden", description: "Voorbereiding voor speciale gelegenheden" },
        { title: "Verwennerij", description: "Iedereen die zich als een koningin verwend wil voelen" }
      ],
      contentSections: [
        { title: "Overzicht", description: "Met de Sultane De Saba Cleopatra behandeling geniet u van een perfecte, complete behandeling die uw huid laat stralen en naar rozen laat geuren. Deze behandeling is geschikt voor alle huidtypes." },
        { title: "Reiniging, hydratatie, verzorging", description: "De Sultane De Saba Cleopatra behandeling omvat reiniging, tonic, scrub, masker, serum en hydraterende dagcrème. Desgewenst kan de behandeling worden gecombineerd met de epilatie van de wenkbrauwen." }
      ]
    }
  },

  // ========== SOLDIERS OF SAND MAGIC GOLD ==========
  "Soldiers of Sand Magic Gold": {
    fr: {
      title: "Magic Gold Soldats du Sable",
      description: "Un soin du visage exclusif infusé de particules d'or 24 carats. Cette thérapie premium stimule le renouvellement cellulaire, réduit les ridules et donne à votre peau un éclat lumineux et doré.",
      benefits: [
        { title: "Infusion d'or 24 carats", description: "Infusion d'or 24 carats pour des soins de luxe" },
        { title: "Production de collagène", description: "Stimule la production de collagène" },
        { title: "Réduction des ridules", description: "Réduit l'apparence des ridules" },
        { title: "Teint unifié", description: "Illumine et unifie le teint de la peau" },
        { title: "Éclat durable", description: "Éclat lumineux longue durée" }
      ],
      targetAudience: [
        { title: "Anti-âge premium", description: "Ceux qui veulent un traitement anti-âge premium" },
        { title: "Événements spéciaux", description: "Préparation pour des événements spéciaux" },
        { title: "Amateurs de luxe", description: "Amateurs de soins de luxe" },
        { title: "Transformation visible", description: "Toute personne cherchant une transformation visible de la peau" }
      ],
      contentSections: [
        { title: "Effet immédiatement visible", description: "Le Sultane de Saba: Magic gold est un soin anti-âge avec de l'or 23 carats et de l'extrait de caviar. Un boost de vitamines et d'oligo-éléments procure un effet immédiatement visible. C'est donc le soin idéal juste avant une fête! La guérison a été enrichie d'un subtil parfum merveilleux de bois de cèdre et de patchouli." },
        { title: "Nettoyage et nutrition profonds", description: "Avec ce soin, vous pouvez être sûr d'un nettoyage profond du visage, d'un cocktail anti-radical, d'un peeling aux particules d'or, d'un masque anti-rides, d'un élixir d'or, d'un massage nourrissant du visage et d'une crème de jour \"gold\". Si désiré, le soin peut être combiné avec l'épilation des sourcils." }
      ]
    },
    de: {
      title: "Magic Gold Soldaten des Sandes",
      description: "Eine exklusive Gesichtsbehandlung mit 24-Karat-Goldpartikeln. Diese Premium-Therapie stimuliert die Zellerneuerung, reduziert feine Linien und verleiht Ihrer Haut einen strahlenden, goldenen Glanz.",
      benefits: [
        { title: "24-Karat-Gold-Infusion", description: "24-Karat-Gold-Infusion für luxuriöse Hautpflege" },
        { title: "Kollagenproduktion", description: "Stimuliert die Kollagenproduktion" },
        { title: "Reduzierung feiner Linien", description: "Reduziert das Erscheinungsbild feiner Linien" },
        { title: "Gleichmäßiger Teint", description: "Erhellt und gleicht den Hautton aus" },
        { title: "Langanhaltender Glanz", description: "Langanhaltender strahlender Glanz" }
      ],
      targetAudience: [
        { title: "Premium Anti-Aging", description: "Diejenigen, die eine Premium Anti-Aging-Behandlung wünschen" },
        { title: "Besondere Ereignisse", description: "Vorbereitung für besondere Ereignisse" },
        { title: "Luxus-Enthusiasten", description: "Luxus-Hautpflege-Enthusiasten" },
        { title: "Sichtbare Transformation", description: "Jeder, der eine sichtbare Hauttransformation sucht" }
      ],
      contentSections: [
        { title: "Sofort spürbarer Effekt", description: "Das Sultane de Saba: Magic Gold ist eine Anti-Aging-Gesichtsbehandlung mit 23 Karat Gold und Kaviarextrakt. Ein Boost an Vitaminen und Spurenelementen sorgt für einen sofort spürbaren Effekt. Es ist daher die ideale Behandlung kurz vor einer Party! Die Behandlung wurde mit einem wunderbar subtilen Duft von Zedernholz und Patschuli angereichert." },
        { title: "Tiefenreinigung und Ernährung", description: "Mit dieser Behandlung können Sie sicher sein: tiefe Gesichtsreinigung, Anti-Radikal-Cocktail, Peeling mit Goldpartikeln, Anti-Falten-Gesichtsmaske, Gold-Elixier, nährende Gesichtsmassage und Tagescreme \"Gold\". Auf Wunsch kann die Behandlung mit der Augenbrauen-Epilation kombiniert werden." }
      ]
    },
    nl: {
      title: "Magic Gold Soldaten van het Zand",
      description: "Een exclusieve gezichtsbehandeling met 24-karaats gouddeeltjes. Deze premium therapie stimuleert celvernieuwing, vermindert fijne lijntjes en geeft uw huid een stralende, gouden gloed.",
      benefits: [
        { title: "24-karaats goud infusie", description: "24-karaats goud infusie voor luxe huidverzorging" },
        { title: "Collageenproductie", description: "Stimuleert collageenproductie" },
        { title: "Vermindering fijne lijntjes", description: "Vermindert het uiterlijk van fijne lijntjes" },
        { title: "Egale teint", description: "Heldert op en egaleert de huidskleur" },
        { title: "Langdurige glans", description: "Langdurige stralende gloed" }
      ],
      targetAudience: [
        { title: "Premium anti-aging", description: "Mensen die een premium anti-aging behandeling willen" },
        { title: "Speciale evenementen", description: "Voorbereiding voor speciale evenementen" },
        { title: "Luxe enthousiastelingen", description: "Luxe huidverzorgingsenthousiastelingen" },
        { title: "Zichtbare transformatie", description: "Iedereen die een zichtbare huidtransformatie zoekt" }
      ],
      contentSections: [
        { title: "Direct merkbaar effect", description: "De Sultane de Saba: Magic gold is een anti-aging gezichtsbehandeling met 23 karaat goud en kaviaarextract. Een boost van vitamines en oligo-elementen zorgt voor een direct merkbaar effect. Het is daarom de ideale behandeling vlak voor een feestje! De behandeling is verrijkt met een heerlijk subtiele geur van cederhout en patchoeli." },
        { title: "Diepe reiniging en voeding", description: "Met deze behandeling bent u verzekerd van een diepe gezichtsreiniging, anti-radicaal cocktail, peeling met gouddeeltjes, anti-rimpel gezichtsmasker, goud elixer, voedende gezichtsmassage en dagcrème \"gold\". Desgewenst kan de behandeling worden gecombineerd met de epilatie van de wenkbrauwen." }
      ]
    }
  },

  // ========== ANTI-AGING ==========
  "Anti-Aging": {
    fr: {
      title: "Anti-Âge",
      description: "Combattez les signes du vieillissement avec ce soin du visage spécialisé. En utilisant des techniques avancées et des ingrédients puissants, nous ciblons les rides, la perte de fermeté et la peau terne pour restaurer une vitalité jeune.",
      benefits: [
        { title: "Réduction des rides", description: "Réduit l'apparence des rides et ridules" },
        { title: "Fermeté améliorée", description: "Améliore la fermeté et l'élasticité de la peau" },
        { title: "Production de collagène", description: "Stimule la production de collagène" },
        { title: "Texture uniforme", description: "Unifie le teint et la texture de la peau" },
        { title: "Éclat jeune", description: "Restaure l'éclat de jeunesse" }
      ],
      targetAudience: [
        { title: "Signes de vieillissement", description: "Ceux qui sont préoccupés par les signes du vieillissement" },
        { title: "Peaux matures", description: "Types de peaux matures" },
        { title: "Soins préventifs", description: "Toute personne souhaitant des soins anti-âge préventifs" },
        { title: "Peau plus ferme", description: "Personnes cherchant une peau plus ferme et plus jeune" }
      ],
      contentSections: [
        { title: "Traiter les problèmes de peau en profondeur", description: "Cure Anti-âge Mesoeclat\nPeeling Mésoestetic (anti-âge, acné, couperose, pigmentation, problèmes de peau)\nFace lift cryo\nFace lift LPG" },
        { title: "Adapté à votre peau", description: "Tous ces soins esthétiques du visage comprennent un nettoyage en profondeur et une crème de jour protectrice. Gommage, peeling, masque et sérum sont utilisés selon le traitement et les besoins spécifiques de votre peau." }
      ]
    },
    de: {
      title: "Anti-Aging",
      description: "Bekämpfen Sie die Zeichen der Hautalterung mit dieser spezialisierten Gesichtsbehandlung. Mit fortschrittlichen Techniken und kraftvollen Inhaltsstoffen zielen wir auf Falten, Elastizitätsverlust und fahle Haut ab, um jugendliche Vitalität wiederherzustellen.",
      benefits: [
        { title: "Faltenreduzierung", description: "Reduziert das Erscheinungsbild von Falten und feinen Linien" },
        { title: "Verbesserte Festigkeit", description: "Verbessert die Hautfestigkeit und Elastizität" },
        { title: "Kollagenproduktion", description: "Stimuliert die Kollagenproduktion" },
        { title: "Gleichmäßige Textur", description: "Gleicht Hautton und Textur aus" },
        { title: "Jugendlicher Glanz", description: "Stellt jugendlichen Glanz wieder her" }
      ],
      targetAudience: [
        { title: "Alterserscheinungen", description: "Diejenigen, die sich um Alterserscheinungen sorgen" },
        { title: "Reife Hauttypen", description: "Reife Hauttypen" },
        { title: "Vorbeugende Pflege", description: "Jeder, der vorbeugende Anti-Aging-Pflege wünscht" },
        { title: "Straffere Haut", description: "Menschen, die straffere, jünger aussehende Haut suchen" }
      ],
      contentSections: [
        { title: "Hautprobleme gründlich behandeln", description: "Anti-Aging Mesoeclat Kur\nMésoestetic Peeling (Anti-Aging, Akne, Couperose, Pigmentierung, Hautprobleme)\nFace Lift Cryo\nFace Lift LPG" },
        { title: "Auf Ihre Haut abgestimmt", description: "Alle diese ästhetischen Gesichtsbehandlungen beinhalten Tiefenreinigung und schützende Tagescreme. Peeling, Maske und Serum werden entsprechend der Behandlung und den spezifischen Bedürfnissen Ihrer Haut eingesetzt." }
      ]
    },
    nl: {
      title: "Anti-Aging",
      description: "Bestrijd de tekenen van veroudering met deze gespecialiseerde gezichtsbehandeling. Met geavanceerde technieken en krachtige ingrediënten richten we ons op rimpels, verlies van stevigheid en doffe huid om jeugdige vitaliteit te herstellen.",
      benefits: [
        { title: "Rimpelvermindering", description: "Vermindert het uiterlijk van rimpels en fijne lijntjes" },
        { title: "Verbeterde stevigheid", description: "Verbetert de stevigheid en elasticiteit van de huid" },
        { title: "Collageenproductie", description: "Stimuleert collageenproductie" },
        { title: "Egale textuur", description: "Egaleert huidskleur en textuur" },
        { title: "Jeugdige glans", description: "Herstelt jeugdige uitstraling" }
      ],
      targetAudience: [
        { title: "Tekenen van veroudering", description: "Mensen die bezorgd zijn over tekenen van veroudering" },
        { title: "Rijpe huidtypes", description: "Rijpe huidtypes" },
        { title: "Preventieve zorg", description: "Iedereen die preventieve anti-aging zorg wil" },
        { title: "Stevigere huid", description: "Mensen die een stevigere, jonger uitziende huid zoeken" }
      ],
      contentSections: [
        { title: "Huidproblemen grondig aanpakken", description: "Anti-aging Mesoeclat Kuur\nMésoestetic Peeling (anti-aging, acne, couperose, pigmentatie, huidproblemen)\nFace lift cryo\nFace lift LPG" },
        { title: "Afgestemd op uw huid", description: "Al deze esthetische gezichtsbehandelingen omvatten diepe reiniging en beschermende dagcrème. Scrub, peeling, masker en serum worden gebruikt volgens de behandeling en de specifieke behoeften van uw huid." }
      ]
    }
  },

  // ========== TARGETED PEELING ==========
  "Targeted Peeling": {
    fr: {
      title: "Peeling Ciblé",
      description: "Un peeling chimique professionnel adapté à vos préoccupations cutanées spécifiques. Ce traitement élimine les cellules mortes de la peau, débouche les pores et révèle une peau fraîche et lisse pour un teint renouvelé.",
      benefits: [
        { title: "Exfoliation profonde", description: "Exfoliation profonde et renouvellement de la peau" },
        { title: "Réduction des cicatrices", description: "Réduit les cicatrices d'acné et l'hyperpigmentation" },
        { title: "Débouchage des pores", description: "Débouche les pores et prévient les éruptions" },
        { title: "Texture lisse", description: "Texture de peau plus lisse et plus uniforme" },
        { title: "Croissance cellulaire", description: "Stimule la croissance de nouvelles cellules" }
      ],
      targetAudience: [
        { title: "Texture inégale", description: "Ceux qui ont une texture de peau inégale" },
        { title: "Cicatrices d'acné", description: "Personnes ayant des cicatrices d'acné" },
        { title: "Hyperpigmentation", description: "Toute personne préoccupée par l'hyperpigmentation" },
        { title: "Renouvellement profond", description: "Ceux qui veulent un renouvellement profond de la peau" }
      ],
      contentSections: []
    },
    de: {
      title: "Gezieltes Peeling",
      description: "Ein professionelles chemisches Peeling, das auf Ihre spezifischen Hautprobleme zugeschnitten ist. Diese Behandlung entfernt abgestorbene Hautzellen, befreit die Poren und enthüllt frische, glatte Haut für einen erneuerten Teint.",
      benefits: [
        { title: "Tiefenpeeling", description: "Tiefe Exfoliation und Hauterneuerung" },
        { title: "Narbenreduzierung", description: "Reduziert Aknenarben und Hyperpigmentierung" },
        { title: "Porenreinigung", description: "Befreit Poren und beugt Unreinheiten vor" },
        { title: "Glatte Textur", description: "Glattere, gleichmäßigere Hauttextur" },
        { title: "Zellwachstum", description: "Stimuliert neues Zellwachstum" }
      ],
      targetAudience: [
        { title: "Ungleichmäßige Textur", description: "Diejenigen mit ungleichmäßiger Hauttextur" },
        { title: "Aknenarben", description: "Menschen mit Aknenarben" },
        { title: "Hyperpigmentierung", description: "Jeder mit Hyperpigmentierungsproblemen" },
        { title: "Tiefe Erneuerung", description: "Diejenigen, die tiefe Hauterneuerung wünschen" }
      ],
      contentSections: []
    },
    nl: {
      title: "Gerichte Peeling",
      description: "Een professionele chemische peeling afgestemd op uw specifieke huidproblemen. Deze behandeling verwijdert dode huidcellen, maakt poriën vrij en onthult een frisse, gladde huid voor een vernieuwde teint.",
      benefits: [
        { title: "Diepe exfoliatie", description: "Diepe exfoliatie en huidvernieuwing" },
        { title: "Littekenvemindering", description: "Vermindert acnelittekens en hyperpigmentatie" },
        { title: "Poriënreiniging", description: "Maakt poriën vrij en voorkomt uitbraken" },
        { title: "Gladde textuur", description: "Gladdere, gelijkmatigere huidtextuur" },
        { title: "Celgroei", description: "Stimuleert nieuwe celgroei" }
      ],
      targetAudience: [
        { title: "Ongelijke textuur", description: "Mensen met ongelijke huidtextuur" },
        { title: "Acnelittekens", description: "Mensen met acnelittekens" },
        { title: "Hyperpigmentatie", description: "Iedereen met hyperpigmentatieproblemen" },
        { title: "Diepe vernieuwing", description: "Mensen die diepe huidvernieuwing willen" }
      ],
      contentSections: []
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

    for (const [englishTitle, translations] of Object.entries(serviceTranslations)) {
      // Find service by English title
      const service = await Service.findOne({ title: englishTitle });

      if (!service) {
        console.log(`❌ Service not found: ${englishTitle}`);
        skippedCount++;
        continue;
      }

      // Check if already has translations
      const hasTranslations = service.translations?.fr?.title ||
                              service.translations?.de?.title ||
                              service.translations?.nl?.title;

      if (hasTranslations) {
        console.log(`⏭️  Skipping (already translated): ${englishTitle}`);
        skippedCount++;
        continue;
      }

      // Update with translations
      service.translations = {
        fr: translations.fr,
        de: translations.de,
        nl: translations.nl
      };

      await service.save();
      console.log(`✅ Added translations for: ${englishTitle}`);
      updatedCount++;
    }

    console.log(`\n========================================`);
    console.log(`Translation Summary:`);
    console.log(`  Updated: ${updatedCount} services`);
    console.log(`  Skipped: ${skippedCount} services`);
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
