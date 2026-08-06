/**
 * Translate missing contentSections for all services
 * Run with: node scripts/translateSections.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Service = require('../models/Service');

const sectionTranslations = {
  "Mini coup d'eclat": {
    fr: [
      { title: "Soin éclat express", description: "Pas beaucoup de temps mais envie de chouchouter votre peau ? Notre Mini Coup d'Éclat est la solution idéale. En seulement 30 minutes, ce soin express nettoie, tonifie et hydrate votre peau pour un éclat immédiat. Parfait comme soin d'entretien régulier ou comme première expérience d'un soin du visage professionnel." },
      { title: "Produits professionnels, résultats rapides", description: "Nous travaillons avec des produits haut de gamme de Sultane de Saba pour garantir que votre peau reçoive la plus haute qualité de soins. Chaque produit est soigneusement sélectionné pour ses propriétés nourrissantes et ses résultats visibles. En quelques minutes, votre peau retrouve son éclat naturel." }
    ],
    nl: [
      { title: "Express stralingsbehandeling", description: "Niet veel tijd maar wilt u uw huid verwennen? Onze Mini Coup d'Éclat is de ideale oplossing. In slechts 30 minuten reinigt, tonificeert en hydrateert deze express-behandeling uw huid voor een directe glans. Perfect als regelmatig onderhoud of als eerste kennismaking met een professionele gezichtsbehandeling." },
      { title: "Professionele producten, snelle resultaten", description: "Wij werken met premium producten van Sultane de Saba om ervoor te zorgen dat uw huid de hoogste kwaliteit verzorging krijgt. Elk product is zorgvuldig geselecteerd vanwege de voedende eigenschappen en zichtbare resultaten. Binnen enkele minuten herstelt uw huid haar natuurlijke glans." }
    ],
    de: [
      { title: "Express-Strahlungsbehandlung", description: "Nicht viel Zeit, aber möchten Sie Ihre Haut verwöhnen? Unser Mini Coup d'Éclat ist die ideale Lösung. In nur 30 Minuten reinigt, tonisiert und befeuchtet diese Express-Behandlung Ihre Haut für sofortige Ausstrahlung. Perfekt als regelmäßige Pflege oder als erste Erfahrung mit einer professionellen Gesichtsbehandlung." },
      { title: "Professionelle Produkte, schnelle Ergebnisse", description: "Wir arbeiten mit Premium-Produkten von Sultane de Saba, um sicherzustellen, dass Ihre Haut die höchste Pflegequalität erhält. Jedes Produkt wurde sorgfältig aufgrund seiner nährenden Eigenschaften und sichtbaren Ergebnisse ausgewählt. Innerhalb weniger Minuten gewinnt Ihre Haut ihre natürliche Ausstrahlung zurück." }
    ],
    es: [
      { title: "Tratamiento de luminosidad exprés", description: "¿No tienes mucho tiempo pero quieres mimar tu piel? Nuestro Mini Coup d'Éclat es la solución ideal. En solo 30 minutos, este tratamiento exprés limpia, tonifica e hidrata tu piel para un brillo instantáneo. Perfecto como mantenimiento regular o como primera experiencia con un facial profesional." },
      { title: "Productos profesionales, resultados rápidos", description: "Trabajamos con productos premium de Sultane de Saba para garantizar que tu piel reciba la más alta calidad de cuidado. Cada producto está cuidadosamente seleccionado por sus propiedades nutritivas y resultados visibles. En cuestión de minutos, tu piel recupera su brillo natural." }
    ]
  },

  "Anti-aging Mesoeclat": {
    fr: [
      { title: "Rajeunissement inspiré de la mésothérapie", description: "Le soin Anti-âge Mesoéclat s'inspire des techniques de mésothérapie pour délivrer des ingrédients actifs puissants directement dans les couches profondes de la peau. Des sérums concentrés en acide hyaluronique, vitamines et peptides ciblent les rides, la perte de fermeté et le teint terne." },
      { title: "Régénération cellulaire profonde", description: "Ce soin va au-delà des soins superficiels pour cibler les signes du vieillissement à leur source. Les ingrédients actifs pénètrent en profondeur pour stimuler la production de collagène, améliorer l'élasticité de la peau et restaurer un teint jeune et éclatant." },
      { title: "Résultats anti-âge durables", description: "Le soin Mesoéclat offre des résultats immédiats et cumulatifs. Vous remarquerez un lifting visible et un éclat radieux dès la première séance, et les résultats s'améliorent avec des traitements réguliers grâce à la stimulation continue du collagène." }
    ],
    nl: [
      { title: "Mesotherapie-geïnspireerde verjonging", description: "De Anti-aging Mesoéclat gezichtsbehandeling is geïnspireerd op mesotherapietechnieken en brengt krachtige actieve ingrediënten diep in de huidlagen. Geconcentreerde serums met hyaluronzuur, vitamines en peptiden richten zich op rimpels, huidverslapping en een doffe teint." },
      { title: "Diepe cellulaire regeneratie", description: "Deze behandeling gaat verder dan oppervlakkige verzorging om de tekenen van veroudering bij de bron aan te pakken. De actieve ingrediënten dringen diep door om de collageenproductie te stimuleren, de huidelasticiteit te verbeteren en een jeugdig, stralend teint te herstellen." },
      { title: "Langdurige anti-aging resultaten", description: "De Mesoéclat-behandeling biedt zowel directe als cumulatieve resultaten. U zult een zichtbare lifting en stralende glans opmerken vanaf de eerste sessie, en de resultaten verbeteren bij regelmatige behandelingen dankzij de voortdurende collageenstimulatie." }
    ],
    de: [
      { title: "Mesotherapie-inspirierte Verjüngung", description: "Die Anti-Aging Mesoéclat Gesichtsbehandlung nutzt Mesotherapie-Techniken, um kraftvolle Wirkstoffe direkt in die tiefen Hautschichten zu bringen. Konzentrierte Seren mit Hyaluronsäure, Vitaminen und Peptiden zielen auf Falten, Elastizitätsverlust und einen fahlen Teint ab." },
      { title: "Tiefe zelluläre Regeneration", description: "Diese Behandlung geht über oberflächliche Pflege hinaus und bekämpft die Zeichen der Hautalterung an ihrer Quelle. Die Wirkstoffe dringen tief ein, um die Kollagenproduktion anzuregen, die Hautelastizität zu verbessern und einen jugendlichen, strahlenden Teint wiederherzustellen." },
      { title: "Langanhaltende Anti-Aging-Ergebnisse", description: "Die Mesoéclat-Behandlung bietet sowohl sofortige als auch kumulative Ergebnisse. Sie werden bereits nach der ersten Sitzung ein sichtbares Lifting und strahlende Ausstrahlung bemerken, und die Ergebnisse verbessern sich bei regelmäßigen Behandlungen durch die kontinuierliche Kollagenstimulation." }
    ],
    es: [
      { title: "Rejuvenecimiento inspirado en mesoterapia", description: "El facial Anti-edad Mesoéclat se inspira en técnicas de mesoterapia para entregar ingredientes activos potentes directamente en las capas profundas de la piel. Sueros concentrados con ácido hialurónico, vitaminas y péptidos atacan las arrugas, la pérdida de firmeza y la tez apagada." },
      { title: "Regeneración celular profunda", description: "Este tratamiento va más allá del cuidado superficial para atacar los signos del envejecimiento en su origen. Los ingredientes activos penetran profundamente para estimular la producción de colágeno, mejorar la elasticidad de la piel y restaurar una tez joven y radiante." },
      { title: "Resultados antiedad duraderos", description: "El tratamiento Mesoéclat ofrece resultados inmediatos y acumulativos. Notarás un lifting visible y un brillo radiante desde la primera sesión, y los resultados mejoran con tratamientos regulares gracias a la estimulación continua del colágeno." }
    ]
  },

  "Sports massage leg, back and neck": {
    fr: [
      { title: "Traitement ciblé des groupes musculaires clés", description: "Ce massage sportif spécialisé se concentre sur les trois zones qui subissent le plus de contraintes lors de l'activité physique : jambes, dos et nuque. En combinant massage des tissus profonds, thérapie des points de déclenchement et techniques de massage sportif, nous répondons aux besoins spécifiques de chaque groupe musculaire. Le traitement est personnalisé en fonction de votre niveau d'activité et de vos zones de préoccupation." },
      { title: "Parfait avant et après l'entraînement", description: "Que vous ayez besoin de préparer vos muscles pour une compétition ou de récupérer après une séance d'entraînement intense, ce massage apporte un soulagement ciblé. Le soin pré-événement se concentre sur l'échauffement et l'assouplissement des muscles, tandis que le massage post-événement met l'accent sur la récupération, la réduction de l'inflammation et la prévention des courbatures." },
      { title: "Amélioration des performances athlétiques", description: "Le massage sportif régulier ciblant les jambes, le dos et la nuque peut améliorer significativement vos performances athlétiques. En maintenant la souplesse musculaire, en améliorant la circulation et en prévenant l'accumulation de tensions, vous pouvez vous entraîner plus efficacement et récupérer plus rapidement." }
    ],
    nl: [
      { title: "Gerichte behandeling van belangrijke spiergroepen", description: "Deze gespecialiseerde sportmassage richt zich op de drie gebieden die de meeste belasting ondervinden tijdens fysieke activiteit: benen, rug en nek. Door diepweefselmassage, triggerpointtherapie en sportmassagetechnieken te combineren, behandelen we de specifieke behoeften van elke spiergroep. De behandeling wordt aangepast aan uw activiteitsniveau en specifieke aandachtspunten." },
      { title: "Perfect voor en na de training", description: "Of u nu uw spieren moet voorbereiden op een wedstrijd of moet herstellen van een intensieve trainingssessie, deze massage biedt gerichte verlichting. De behandeling vóór het sporten richt zich op het opwarmen en losmaken van spieren, terwijl de massage na het sporten de nadruk legt op herstel, vermindering van ontstekingen en preventie van spierpijn." },
      { title: "Verbetering van atletische prestaties", description: "Regelmatige sportmassage gericht op benen, rug en nek kan uw atletische prestaties aanzienlijk verbeteren. Door de spiersoepelheid te behouden, de circulatie te verbeteren en spanningsopbouw te voorkomen, kunt u effectiever trainen en sneller herstellen." }
    ],
    de: [
      { title: "Gezielte Behandlung wichtiger Muskelgruppen", description: "Diese spezialisierte Sportmassage konzentriert sich auf die drei Bereiche, die bei körperlicher Aktivität am stärksten beansprucht werden: Beine, Rücken und Nacken. Durch die Kombination von Tiefengewebsmassage, Triggerpunkttherapie und Sportmassagetechniken gehen wir auf die spezifischen Bedürfnisse jeder Muskelgruppe ein. Die Behandlung wird an Ihr Aktivitätsniveau und Ihre Problemzonen angepasst." },
      { title: "Perfekt vor und nach dem Training", description: "Ob Sie Ihre Muskeln auf einen Wettkampf vorbereiten oder sich von einer intensiven Trainingseinheit erholen müssen — diese Massage bietet gezielte Erleichterung. Die Vor-Event-Behandlung konzentriert sich auf das Aufwärmen und Lockern der Muskeln, während die Nach-Event-Massage den Schwerpunkt auf Erholung, Entzündungsreduktion und Vorbeugung von Muskelkater legt." },
      { title: "Steigerung der sportlichen Leistung", description: "Regelmäßige Sportmassage für Beine, Rücken und Nacken kann Ihre sportliche Leistung deutlich verbessern. Durch die Aufrechterhaltung der Muskelgeschmeidigkeit, die Verbesserung der Durchblutung und die Vorbeugung von Spannungsaufbau können Sie effektiver trainieren und schneller regenerieren." }
    ],
    es: [
      { title: "Tratamiento enfocado de grupos musculares clave", description: "Este masaje deportivo especializado se enfoca en las tres zonas que soportan mayor tensión durante la actividad física: piernas, espalda y cuello. Combinando masaje de tejido profundo, terapia de puntos gatillo y técnicas de masaje deportivo, atendemos las necesidades específicas de cada grupo muscular. El tratamiento se personaliza según tu nivel de actividad y tus zonas de preocupación." },
      { title: "Perfecto antes y después del entrenamiento", description: "Ya sea que necesites preparar tus músculos para una competencia o recuperarte de una sesión de entrenamiento intensa, este masaje ofrece alivio dirigido. El tratamiento pre-evento se enfoca en calentar y aflojar los músculos, mientras que el masaje post-evento enfatiza la recuperación, reducción de inflamación y prevención de agujetas." },
      { title: "Mejora del rendimiento atlético", description: "El masaje deportivo regular enfocado en piernas, espalda y cuello puede mejorar significativamente tu rendimiento atlético. Al mantener la flexibilidad muscular, mejorar la circulación y prevenir la acumulación de tensión, puedes entrenar más eficazmente y recuperarte más rápido." }
    ]
  },

  "Sports massage legs": {
    fr: [
      { title: "Récupération ciblée des jambes", description: "Vos jambes alimentent chaque pas, chaque coup de pédale et chaque saut. Ce soin spécialisé de 30 minutes se concentre entièrement sur les membres inférieurs, utilisant des techniques de massage sportif pour soulager la fatigue musculaire, réduire les tensions et améliorer la circulation dans les jambes." },
      { title: "Essentiel pour les sportifs du bas du corps", description: "Que vous vous entraîniez pour un marathon, fassiez du vélo sur de longues distances ou pratiquiez des sports exigeants pour les jambes, ce massage vous aide à maintenir des performances optimales. Les techniques ciblent les quadriceps, ischio-jambiers, mollets et pieds pour une récupération complète des membres inférieurs." }
    ],
    nl: [
      { title: "Gericht beenherstel", description: "Uw benen drijven elke stap, pedaalslag en sprong aan. Deze gespecialiseerde 30-minuten behandeling richt zich volledig op de onderste ledematen, met sportmassagetechnieken om spiervermoeidheid te verlichten, spanning te verminderen en de circulatie in de benen te verbeteren." },
      { title: "Essentieel voor atleten van het onderlichaam", description: "Of u nu traint voor een marathon, lange afstanden fietst of sporten beoefent die veel van de benen vragen, deze massage helpt u optimale prestaties te behouden. De technieken richten zich op quadriceps, hamstrings, kuiten en voeten voor een compleet herstel van de onderste ledematen." }
    ],
    de: [
      { title: "Gezielte Beinerholung", description: "Ihre Beine treiben jeden Schritt, Pedaltritt und Sprung an. Diese spezialisierte 30-Minuten-Behandlung konzentriert sich vollständig auf die unteren Extremitäten und nutzt Sportmassagetechniken, um Muskelermüdung zu lindern, Spannungen zu reduzieren und die Durchblutung in den Beinen zu verbessern." },
      { title: "Unverzichtbar für Unterkörper-Sportler", description: "Ob Sie für einen Marathon trainieren, lange Strecken radfahren oder Sportarten betreiben, die die Beine stark beanspruchen — diese Massage hilft Ihnen, optimale Leistung zu erbringen. Die Techniken zielen auf Quadrizeps, hintere Oberschenkelmuskulatur, Waden und Füße für eine vollständige Erholung der unteren Extremitäten." }
    ],
    es: [
      { title: "Recuperación enfocada de piernas", description: "Tus piernas impulsan cada paso, pedaleo y salto. Este tratamiento especializado de 30 minutos se enfoca completamente en las extremidades inferiores, utilizando técnicas de masaje deportivo para aliviar la fatiga muscular, reducir la tensión y mejorar la circulación en las piernas." },
      { title: "Esencial para deportistas de tren inferior", description: "Ya sea que entrenes para un maratón, recorras largas distancias en bicicleta o practiques deportes que exigen mucho de las piernas, este masaje te ayuda a mantener un rendimiento óptimo. Las técnicas se enfocan en cuádriceps, isquiotibiales, pantorrillas y pies para una recuperación completa de las extremidades inferiores." }
    ]
  },

  "Scrub + Zen Your Body": {
    fr: [
      { title: "Renouveau complet de la peau", description: "Votre soin commence par une consultation personnalisée. Notre thérapeute sélectionne le gommage corporel le plus adapté à votre type de peau. L'exfoliation élimine les cellules mortes, stimule la circulation et prépare votre peau à absorber les bienfaits du massage qui suit." },
      { title: "Expérience de massage sublimée", description: "Après le gommage, votre peau fraîchement exfoliée est parfaitement préparée pour absorber les huiles nourrissantes du massage Zen Your Body. Ce massage complet du corps devient encore plus efficace sur une peau propre et renouvelée, offrant une relaxation et un bien-être incomparables." },
      { title: "Transformation corporelle totale", description: "Les 90 minutes permettent une expérience approfondie et sans hâte. Le gommage détoxifie et stimule, tandis que le massage apaise et restaure. Ensemble, ils offrent un soin complet qui laisse votre peau douce et soyeuse et votre corps profondément détendu." }
    ],
    nl: [
      { title: "Complete huidvernieuwing", description: "Uw behandeling begint met een persoonlijk adviesgesprek. Onze therapeut selecteert de meest geschikte lichaamsscrub voor uw huidtype. De exfoliatie verwijdert dode huidcellen, stimuleert de circulatie en bereidt uw huid voor om de voordelen van de volgende massage op te nemen." },
      { title: "Verbeterde massage-ervaring", description: "Na de scrub is uw vers geëxfolieerde huid perfect voorbereid om de voedende oliën van de Zen Your Body massage op te nemen. Deze volledige lichaamsmassage wordt nog effectiever op een schone en vernieuwde huid, en biedt ongeëvenaarde ontspanning en welzijn." },
      { title: "Totale lichaamstransformatie", description: "De 90 minuten bieden een grondige en ongehaaste ervaring. De scrub ontgift en stimuleert, terwijl de massage kalmeert en herstelt. Samen bieden ze een complete behandeling die uw huid zacht en zijdezacht achterlaat en uw lichaam diep ontspannen." }
    ],
    de: [
      { title: "Komplette Hauterneuerung", description: "Ihre Behandlung beginnt mit einer persönlichen Beratung. Unsere Therapeutin wählt das am besten geeignete Körperpeeling für Ihren Hauttyp aus. Das Peeling entfernt abgestorbene Hautzellen, regt die Durchblutung an und bereitet Ihre Haut darauf vor, die Vorteile der anschließenden Massage aufzunehmen." },
      { title: "Verbessertes Massageerlebnis", description: "Nach dem Peeling ist Ihre frisch exfolierte Haut perfekt vorbereitet, um die nährenden Öle der Zen Your Body Massage aufzunehmen. Diese Ganzkörpermassage wird auf sauberer, erneuerter Haut noch wirksamer und bietet unvergleichliche Entspannung und Wohlbefinden." },
      { title: "Totale Körpertransformation", description: "Die 90 Minuten ermöglichen ein gründliches und ungehetztes Erlebnis. Das Peeling entgiftet und stimuliert, während die Massage beruhigt und wiederherstellt. Zusammen bieten sie eine komplette Behandlung, die Ihre Haut weich und seidig hinterlässt und Ihren Körper tief entspannt." }
    ],
    es: [
      { title: "Renovación completa de la piel", description: "Tu tratamiento comienza con una consulta personalizada. Nuestra terapeuta selecciona la exfoliación corporal más adecuada para tu tipo de piel. La exfoliación elimina las células muertas, estimula la circulación y prepara tu piel para absorber los beneficios del masaje que sigue." },
      { title: "Experiencia de masaje mejorada", description: "Después de la exfoliación, tu piel recién renovada está perfectamente preparada para absorber los aceites nutritivos del masaje Zen Your Body. Este masaje de cuerpo completo se vuelve aún más efectivo sobre una piel limpia y renovada, ofreciendo una relajación y bienestar incomparables." },
      { title: "Transformación corporal total", description: "Los 90 minutos permiten una experiencia completa y sin prisas. La exfoliación desintoxica y estimula, mientras que el masaje calma y restaura. Juntos ofrecen un tratamiento completo que deja tu piel suave y sedosa y tu cuerpo profundamente relajado." }
    ]
  },

  "Purifying": {
    fr: [
      { title: "Processus de nettoyage profond", description: "Le soin Purifiant commence par un double nettoyage approfondi pour éliminer les impuretés superficielles, le maquillage et l'excès de sébum. Un peeling enzymatique doux prépare ensuite la peau pour les étapes suivantes, permettant une meilleure pénétration des actifs purifiants." },
      { title: "Extraction professionnelle et traitement", description: "Notre thérapeute qualifiée effectue des extractions manuelles soigneuses pour déboucher les pores. Un masque purifiant à base d'argile est ensuite appliqué pour absorber les toxines restantes, resserrer les pores et apaiser la peau. Des actifs anti-bactériens préviennent les futures éruptions." },
      { title: "Rééquilibrage et protection", description: "Après le nettoyage profond, nous rétablissons l'équilibre de la peau avec un tonique apaisant et un hydratant léger non comédogène. La peau est nettoyée, clarifiée et protégée sans être desséchée, avec un teint visiblement plus clair et plus frais." }
    ],
    nl: [
      { title: "Diep reinigingsproces", description: "De Zuiverende gezichtsbehandeling begint met een grondige dubbele reiniging om oppervlakkige onzuiverheden, make-up en overtollig talg te verwijderen. Een zachte enzymatische peeling bereidt de huid vervolgens voor op de volgende stappen, waardoor zuiverende werkzame stoffen beter kunnen doordringen." },
      { title: "Professionele extractie en behandeling", description: "Onze bekwame therapeute voert zorgvuldige handmatige extracties uit om verstopte poriën te openen. Een zuiverend kleimasker wordt vervolgens aangebracht om resterende toxines te absorberen, poriën te verkleinen en de huid te kalmeren. Anti-bacteriële werkzame stoffen voorkomen toekomstige uitbraken." },
      { title: "Herstel van balans en bescherming", description: "Na de diepe reiniging herstellen we de huidbalans met een kalmerende toner en een lichte, niet-comedogene moisturizer. De huid is gereinigd, geklaard en beschermd zonder uitgedroogd te zijn, met een zichtbaar helderder en frisser teint." }
    ],
    de: [
      { title: "Tiefenreinigungsprozess", description: "Die reinigende Gesichtsbehandlung beginnt mit einer gründlichen Doppelreinigung, um oberflächliche Unreinheiten, Make-up und überschüssigen Talg zu entfernen. Ein sanftes Enzympeeling bereitet die Haut dann auf die folgenden Schritte vor und ermöglicht ein besseres Eindringen der reinigenden Wirkstoffe." },
      { title: "Professionelle Extraktion und Behandlung", description: "Unsere erfahrene Therapeutin führt sorgfältige manuelle Extraktionen durch, um verstopfte Poren zu befreien. Eine reinigende Tonerdemaske wird dann aufgetragen, um verbleibende Giftstoffe zu absorbieren, die Poren zu verfeinern und die Haut zu beruhigen. Antibakterielle Wirkstoffe beugen zukünftigen Unreinheiten vor." },
      { title: "Ausgleich und Schutz", description: "Nach der Tiefenreinigung stellen wir das Hautgleichgewicht mit einem beruhigenden Toner und einer leichten, nicht komedogenen Feuchtigkeitscreme wieder her. Die Haut ist gereinigt, geklärt und geschützt, ohne ausgetrocknet zu sein, mit einem sichtbar klareren und frischeren Teint." }
    ],
    es: [
      { title: "Proceso de limpieza profunda", description: "El facial Purificante comienza con una doble limpieza profunda para eliminar impurezas superficiales, maquillaje y exceso de sebo. Una suave exfoliación enzimática prepara la piel para los siguientes pasos, permitiendo una mejor penetración de los activos purificantes." },
      { title: "Extracción profesional y tratamiento", description: "Nuestra terapeuta cualificada realiza extracciones manuales cuidadosas para desobstruir los poros. Se aplica una mascarilla purificante de arcilla para absorber las toxinas restantes, cerrar los poros y calmar la piel. Los activos antibacterianos previenen futuros brotes." },
      { title: "Reequilibrio y protección", description: "Después de la limpieza profunda, restauramos el equilibrio de la piel con un tónico calmante y un hidratante ligero no comedogénico. La piel queda limpia, clarificada y protegida sin estar reseca, con una tez visiblemente más clara y fresca." }
    ]
  },

  "Hydra+": {
    fr: [
      { title: "Technologie d'hydratation intensive", description: "Le soin Hydra+ utilise des techniques d'hydratation de pointe, notamment des sérums à base d'acide hyaluronique, des masques hydratants et une technologie d'infusion pour apporter une hydratation profonde à toutes les couches de votre peau. Chaque étape est conçue pour maximiser l'absorption et la rétention d'eau." },
      { title: "Traitement d'infusion nourrissante", description: "Votre peau reçoit un cocktail puissant d'ingrédients hydratants : acide hyaluronique, vitamine B5, céramides et extraits botaniques. Ces actifs travaillent en synergie pour reconstituer les réserves d'hydratation, renforcer la barrière cutanée et donner à votre peau un éclat naturel et sain." },
      { title: "Éclat durable et protection", description: "Le soin se termine par un hydratant riche et une barrière protectrice pour sceller l'hydratation pendant des jours. Votre peau reste repulpée, lisse et radieuse bien après le soin, avec une barrière d'hydratation renforcée qui protège contre les agressions extérieures." }
    ],
    nl: [
      { title: "Intensieve hydratietechnologie", description: "De Hydra+ behandeling maakt gebruik van geavanceerde hydratietechnieken, waaronder hyaluronzuurserums, vochtmaskers en infusietechnologie om diepe hydratatie te brengen in alle lagen van uw huid. Elke stap is ontworpen om de wateropname en -retentie te maximaliseren." },
      { title: "Voedende infusiebehandeling", description: "Uw huid ontvangt een krachtige cocktail van hydraterende ingrediënten: hyaluronzuur, vitamine B5, ceramiden en botanische extracten. Deze werkzame stoffen werken samen om de vochtreserves aan te vullen, de huidbarrière te versterken en uw huid een natuurlijke, gezonde glans te geven." },
      { title: "Langdurige straling en bescherming", description: "De behandeling wordt afgesloten met een rijke moisturizer en beschermende barrière om de hydratatie dagenlang vast te houden. Uw huid blijft vol, glad en stralend lang na de behandeling, met een versterkte vochtbarrière die beschermt tegen externe agressie." }
    ],
    de: [
      { title: "Intensive Feuchtigkeitstechnologie", description: "Die Hydra+ Behandlung nutzt modernste Hydratationstechniken, darunter Hyaluronsäure-Seren, Feuchtigkeitsmasken und Infusionstechnologie, um allen Hautschichten tiefe Feuchtigkeit zu spenden. Jeder Schritt ist darauf ausgelegt, die Wasseraufnahme und -speicherung zu maximieren." },
      { title: "Nährende Infusionsbehandlung", description: "Ihre Haut erhält einen kraftvollen Cocktail aus feuchtigkeitsspendenden Inhaltsstoffen: Hyaluronsäure, Vitamin B5, Ceramide und botanische Extrakte. Diese Wirkstoffe arbeiten zusammen, um die Feuchtigkeitsreserven aufzufüllen, die Hautbarriere zu stärken und Ihrer Haut eine natürliche, gesunde Ausstrahlung zu verleihen." },
      { title: "Langanhaltende Ausstrahlung und Schutz", description: "Die Behandlung endet mit einer reichhaltigen Feuchtigkeitscreme und einer Schutzbarriere, um die Feuchtigkeit tagelang einzuschließen. Ihre Haut bleibt prall, glatt und strahlend lange nach der Behandlung, mit einer gestärkten Feuchtigkeitsbarriere, die vor äußeren Einflüssen schützt." }
    ],
    es: [
      { title: "Tecnología de hidratación intensiva", description: "El facial Hydra+ utiliza técnicas de hidratación de vanguardia, incluyendo sueros de ácido hialurónico, mascarillas hidratantes y tecnología de infusión para aportar hidratación profunda a todas las capas de tu piel. Cada paso está diseñado para maximizar la absorción y retención de agua." },
      { title: "Tratamiento de infusión nutritiva", description: "Tu piel recibe un cóctel potente de ingredientes hidratantes: ácido hialurónico, vitamina B5, ceramidas y extractos botánicos. Estos activos trabajan en sinergia para reponer las reservas de hidratación, fortalecer la barrera cutánea y dar a tu piel un brillo natural y saludable." },
      { title: "Luminosidad duradera y protección", description: "El tratamiento finaliza con un hidratante rico y una barrera protectora para sellar la hidratación durante días. Tu piel permanece tersa, suave y radiante mucho después del tratamiento, con una barrera de hidratación reforzada que protege contra las agresiones externas." }
    ]
  },

  "Eyes Under": {
    fr: [
      { title: "Qu'est-ce que le PMU Eyes Under ?", description: "Le maquillage permanent Eyes Under est une technique de tatouage cosmétique spécialisée qui sublime la ligne de cils inférieure avec un pigment semi-permanent. Cette technique crée une définition subtile et naturelle qui fait paraître vos cils plus épais et vos yeux plus expressifs, sans besoin d'eyeliner quotidien." },
      { title: "La procédure", description: "Le soin commence par une consultation pour discuter du look souhaité. Une crème anesthésiante topique est appliquée pour votre confort. La technicienne utilise un appareil spécialisé pour déposer le pigment le long de la ligne de cils inférieure avec une grande précision. La séance dure environ 60 à 90 minutes." },
      { title: "Suivi et cicatrisation", description: "La cicatrisation initiale prend 7 à 10 jours. Pendant cette période, vous pouvez observer un léger gonflement et la couleur apparaîtra plus foncée avant de s'estomper vers la teinte finale souhaitée. Un rendez-vous de retouche est recommandé 4 à 6 semaines après le traitement initial." }
    ],
    nl: [
      { title: "Wat is Eyes Under PMU?", description: "Eyes Under permanente make-up is een gespecialiseerde cosmetische tatoeagetechniek die de onderste wimperrand sublimeert met semi-permanent pigment. Deze techniek creëert een subtiele, natuurlijke definitie die uw wimpers voller en uw ogen expressiever doet lijken, zonder dagelijkse eyeliner." },
      { title: "De procedure", description: "De behandeling begint met een consultatie om de gewenste look te bespreken. Een verdovende crème wordt aangebracht voor uw comfort. De technica gebruikt een gespecialiseerd apparaat om het pigment met grote precisie langs de onderste wimperrand aan te brengen. De sessie duurt ongeveer 60 tot 90 minuten." },
      { title: "Nazorg en genezing", description: "De eerste genezing duurt 7 tot 10 dagen. Gedurende deze periode kunt u lichte zwelling ervaren en de kleur zal donkerder lijken voordat deze vervaagt naar de gewenste definitieve tint. Een bijwerkafspraak wordt aanbevolen 4 tot 6 weken na de eerste behandeling." }
    ],
    de: [
      { title: "Was ist Eyes Under PMU?", description: "Eyes Under Permanent Make-up ist eine spezialisierte kosmetische Tätowiertechnik, die die untere Wimpernlinie mit semi-permanentem Pigment betont. Diese Technik schafft eine subtile, natürliche Definition, die Ihre Wimpern voller und Ihre Augen ausdrucksvoller erscheinen lässt — ohne tägliches Eyeliner-Auftragen." },
      { title: "Die Behandlung", description: "Die Behandlung beginnt mit einer Beratung, um den gewünschten Look zu besprechen. Eine betäubende Creme wird für Ihren Komfort aufgetragen. Die Technikerin verwendet ein spezialisiertes Gerät, um das Pigment mit hoher Präzision entlang der unteren Wimpernlinie aufzutragen. Die Sitzung dauert etwa 60 bis 90 Minuten." },
      { title: "Nachsorge und Heilung", description: "Die erste Heilung dauert 7 bis 10 Tage. Während dieser Zeit können Sie leichte Schwellungen erleben und die Farbe wird dunkler erscheinen, bevor sie zum gewünschten endgültigen Farbton verblasst. Ein Nachbesserungstermin wird 4 bis 6 Wochen nach der Erstbehandlung empfohlen." }
    ],
    es: [
      { title: "¿Qué es el PMU Eyes Under?", description: "El maquillaje permanente Eyes Under es una técnica especializada de tatuaje cosmético que realza la línea de pestañas inferior con pigmento semipermanente. Esta técnica crea una definición sutil y natural que hace que tus pestañas parezcan más densas y tus ojos más expresivos, sin necesidad de delineado diario." },
      { title: "El procedimiento", description: "El tratamiento comienza con una consulta para discutir el look deseado. Se aplica una crema anestésica tópica para tu comodidad. La técnica utiliza un dispositivo especializado para depositar el pigmento a lo largo de la línea de pestañas inferior con gran precisión. La sesión dura aproximadamente 60 a 90 minutos." },
      { title: "Cuidados posteriores y cicatrización", description: "La cicatrización inicial toma de 7 a 10 días. Durante este período, puedes experimentar una leve hinchazón y el color aparecerá más oscuro antes de desvanecerse hacia el tono final deseado. Se recomienda una cita de retoque 4 a 6 semanas después del tratamiento inicial." }
    ]
  },

  "Eyes Upper": {
    fr: [
      { title: "Qu'est-ce que le PMU Eyes Upper ?", description: "Le maquillage permanent Eyes Upper sublime la ligne de cils supérieure avec un pigment semi-permanent. Cette technique crée un effet d'eyeliner élégant et naturel qui ouvre le regard et donne plus de profondeur à vos yeux. Le résultat peut être subtil ou plus prononcé selon vos préférences." },
      { title: "La procédure", description: "Après une consultation approfondie, une crème anesthésiante est appliquée. La technicienne utilise un appareil spécialisé pour déposer le pigment le long de la ligne de cils supérieure, créant un trait précis et parfaitement symétrique. La séance dure environ 60 à 90 minutes." },
      { title: "Résultats et longévité", description: "Les résultats durent généralement 1 à 3 ans selon le type de peau, le mode de vie et les soins. Une retouche est recommandée 4 à 6 semaines après le premier traitement pour perfectionner la couleur et la forme. Des retouches annuelles permettent de maintenir des résultats optimaux." }
    ],
    nl: [
      { title: "Wat is Eyes Upper PMU?", description: "Eyes Upper permanente make-up sublimeert de bovenste wimperrand met semi-permanent pigment. Deze techniek creëert een elegant en natuurlijk eyelinereffect dat de blik opent en meer diepte geeft aan uw ogen. Het resultaat kan subtiel of meer uitgesproken zijn, afhankelijk van uw voorkeur." },
      { title: "De procedure", description: "Na een uitgebreid adviesgesprek wordt verdovende crème aangebracht. De technica gebruikt een gespecialiseerd apparaat om het pigment langs de bovenste wimperrand aan te brengen, waardoor een precies en perfect symmetrisch lijntje ontstaat. De sessie duurt ongeveer 60 tot 90 minuten." },
      { title: "Resultaten en duurzaamheid", description: "Resultaten gaan doorgaans 1 tot 3 jaar mee, afhankelijk van huidtype, levensstijl en verzorging. Een bijwerkbehandeling wordt aanbevolen 4 tot 6 weken na de eerste behandeling om kleur en vorm te perfectioneren. Jaarlijkse bijwerkingen helpen optimale resultaten te behouden." }
    ],
    de: [
      { title: "Was ist Eyes Upper PMU?", description: "Eyes Upper Permanent Make-up betont die obere Wimpernlinie mit semi-permanentem Pigment. Diese Technik erzeugt einen eleganten, natürlichen Eyeliner-Effekt, der den Blick öffnet und Ihren Augen mehr Tiefe verleiht. Das Ergebnis kann je nach Ihren Wünschen subtil oder ausgeprägter sein." },
      { title: "Die Behandlung", description: "Nach einer ausführlichen Beratung wird eine Betäubungscreme aufgetragen. Die Technikerin verwendet ein spezialisiertes Gerät, um das Pigment entlang der oberen Wimpernlinie aufzutragen und eine präzise, perfekt symmetrische Linie zu schaffen. Die Sitzung dauert etwa 60 bis 90 Minuten." },
      { title: "Ergebnisse und Haltbarkeit", description: "Die Ergebnisse halten in der Regel 1 bis 3 Jahre, abhängig von Hauttyp, Lebensstil und Pflege. Eine Nachbesserung wird 4 bis 6 Wochen nach der Erstbehandlung empfohlen, um Farbe und Form zu perfektionieren. Jährliche Auffrischungen helfen, optimale Ergebnisse zu erhalten." }
    ],
    es: [
      { title: "¿Qué es el PMU Eyes Upper?", description: "El maquillaje permanente Eyes Upper realza la línea de pestañas superior con pigmento semipermanente. Esta técnica crea un efecto de delineado elegante y natural que abre la mirada y da más profundidad a tus ojos. El resultado puede ser sutil o más pronunciado según tus preferencias." },
      { title: "El procedimiento", description: "Después de una consulta detallada, se aplica crema anestésica. La técnica utiliza un dispositivo especializado para depositar el pigmento a lo largo de la línea de pestañas superior, creando un trazo preciso y perfectamente simétrico. La sesión dura aproximadamente 60 a 90 minutos." },
      { title: "Resultados y durabilidad", description: "Los resultados suelen durar de 1 a 3 años dependiendo del tipo de piel, estilo de vida y cuidados. Se recomienda un retoque 4 a 6 semanas después del primer tratamiento para perfeccionar el color y la forma. Los retoques anuales ayudan a mantener resultados óptimos." }
    ]
  },

  "Eyes Upper and Under": {
    fr: [
      { title: "Sublimation complète du regard", description: "Le soin Eyes Upper and Under combine la mise en valeur des lignes de cils supérieure et inférieure pour un résultat complet et harmonieux. Cette approche globale encadre parfaitement vos yeux, créant un regard intense et expressif tout en conservant un aspect naturel." },
      { title: "Le processus de traitement", description: "Ce soin dure environ 2 heures. Les deux lignes de cils sont traitées au cours de la même séance, ce qui garantit une parfaite cohérence et symétrie. La technicienne adapte l'épaisseur et l'intensité du trait pour chaque zone afin d'obtenir un résultat équilibré et flatteur." },
      { title: "Pourquoi choisir le forfait complet ?", description: "Le soin combiné offre un meilleur rapport qualité-prix et garantit un résultat harmonieux. L'artiste peut ajuster les deux lignes simultanément pour une symétrie parfaite. Vous gagnez du temps par rapport à deux séances séparées et le résultat global est plus cohérent." }
    ],
    nl: [
      { title: "Volledige blikverbetering", description: "De Eyes Upper and Under behandeling combineert de verbetering van zowel de bovenste als onderste wimperrand voor een compleet en harmonieus resultaat. Deze totaalaanpak omlijst uw ogen perfect en creëert een intense, expressieve blik terwijl het er natuurlijk uitziet." },
      { title: "Het behandelproces", description: "Deze behandeling duurt ongeveer 2 uur. Beide wimperranden worden in dezelfde sessie behandeld, wat perfecte consistentie en symmetrie garandeert. De technica past de dikte en intensiteit van de lijn aan voor elk gebied voor een evenwichtig en flatterend resultaat." },
      { title: "Waarom het complete pakket kiezen?", description: "De gecombineerde behandeling biedt een betere prijs-kwaliteitverhouding en garandeert een harmonieus resultaat. De artiest kan beide lijnen tegelijkertijd aanpassen voor perfecte symmetrie. U bespaart tijd vergeleken met twee aparte sessies en het totale resultaat is consistenter." }
    ],
    de: [
      { title: "Komplette Augenbetonung", description: "Die Eyes Upper and Under Behandlung kombiniert die Betonung der oberen und unteren Wimpernlinie für ein vollständiges und harmonisches Ergebnis. Dieser ganzheitliche Ansatz umrahmt Ihre Augen perfekt und schafft einen intensiven, ausdrucksstarken Blick bei natürlichem Aussehen." },
      { title: "Der Behandlungsprozess", description: "Diese Behandlung dauert etwa 2 Stunden. Beide Wimpernlinien werden in derselben Sitzung behandelt, was perfekte Konsistenz und Symmetrie gewährleistet. Die Technikerin passt die Dicke und Intensität der Linie für jeden Bereich an, um ein ausgewogenes und schmeichelhaftes Ergebnis zu erzielen." },
      { title: "Warum das Komplettpaket wählen?", description: "Die kombinierte Behandlung bietet ein besseres Preis-Leistungs-Verhältnis und garantiert ein harmonisches Ergebnis. Die Künstlerin kann beide Linien gleichzeitig anpassen für perfekte Symmetrie. Sie sparen Zeit im Vergleich zu zwei separaten Sitzungen und das Gesamtergebnis ist einheitlicher." }
    ],
    es: [
      { title: "Realce completo de la mirada", description: "El tratamiento Eyes Upper and Under combina el realce de las líneas de pestañas superior e inferior para un resultado completo y armonioso. Este enfoque integral enmarca perfectamente tus ojos, creando una mirada intensa y expresiva mientras mantiene un aspecto natural." },
      { title: "El proceso de tratamiento", description: "Este tratamiento dura aproximadamente 2 horas. Ambas líneas de pestañas se tratan en la misma sesión, lo que garantiza perfecta consistencia y simetría. La técnica adapta el grosor y la intensidad del trazo para cada zona para obtener un resultado equilibrado y favorecedor." },
      { title: "¿Por qué elegir el paquete completo?", description: "El tratamiento combinado ofrece mejor relación calidad-precio y garantiza un resultado armonioso. La artista puede ajustar ambas líneas simultáneamente para una simetría perfecta. Ahorras tiempo en comparación con dos sesiones separadas y el resultado global es más coherente." }
    ]
  },

  "Microblading Brows": {
    fr: [
      { title: "Qu'est-ce que le microblading ?", description: "Le microblading est une technique de tatouage cosmétique semi-permanent réalisée manuellement. À l'aide d'un outil à main spécialisé avec de fines micro-aiguilles, la technicienne crée des traits individuels qui imitent les poils naturels des sourcils. Le résultat est un aspect naturel et réaliste qui rehausse votre beauté sans paraître artificiel." },
      { title: "Le processus de microblading", description: "Le soin commence par une consultation détaillée et un dessin des sourcils pour créer la forme parfaite adaptée à votre visage. Après application d'une crème anesthésiante, la technicienne dessine méticuleusement chaque trait. La séance dure environ 2 heures, y compris la consultation et le dessin." },
      { title: "Cicatrisation et suivi", description: "La cicatrisation initiale prend 10 à 14 jours. Les sourcils apparaîtront plus foncés juste après le traitement, puis s'éclairciront de 30 à 50 % pour atteindre la teinte finale. Un rendez-vous de retouche 4 à 6 semaines plus tard est essentiel pour perfectionner le résultat. Les résultats durent 1 à 3 ans." }
    ],
    nl: [
      { title: "Wat is microblading?", description: "Microblading is een handmatige, semi-permanente cosmetische tatoeagetechniek. Met een gespecialiseerd handgereedschap met fijne micro-naalden creëert de technica individuele haartjes die de natuurlijke wenkbrauwhaartjes nabootsen. Het resultaat is een natuurlijk en realistisch uiterlijk dat uw schoonheid versterkt zonder er kunstmatig uit te zien." },
      { title: "Het microbladingproces", description: "De behandeling begint met een uitgebreide consultatie en wenkbrauwtekening om de perfecte vorm voor uw gezicht te ontwerpen. Na het aanbrengen van verdovende crème tekent de technica nauwgezet elk haartje. De sessie duurt ongeveer 2 uur, inclusief consultatie en tekening." },
      { title: "Genezing en nazorg", description: "De eerste genezing duurt 10 tot 14 dagen. De wenkbrauwen zullen direct na de behandeling donkerder lijken en vervolgens 30 tot 50% lichter worden tot de definitieve tint. Een bijwerkafspraak 4 tot 6 weken later is essentieel om het resultaat te perfectioneren. Resultaten gaan 1 tot 3 jaar mee." }
    ],
    de: [
      { title: "Was ist Microblading?", description: "Microblading ist eine manuelle, semi-permanente kosmetische Tätowiertechnik. Mit einem spezialisierten Handwerkzeug mit feinen Mikronadeln zeichnet die Technikerin einzelne Härchen, die die natürlichen Augenbrauenhärchen nachahmen. Das Ergebnis ist ein natürliches, realistisches Aussehen, das Ihre Schönheit betont, ohne künstlich zu wirken." },
      { title: "Der Microblading-Prozess", description: "Die Behandlung beginnt mit einer ausführlichen Beratung und Augenbrauenzeichnung, um die perfekte Form für Ihr Gesicht zu entwerfen. Nach dem Auftragen einer Betäubungscreme zeichnet die Technikerin akribisch jedes einzelne Härchen. Die Sitzung dauert etwa 2 Stunden, inklusive Beratung und Zeichnung." },
      { title: "Heilung und Nachsorge", description: "Die erste Heilung dauert 10 bis 14 Tage. Die Augenbrauen erscheinen direkt nach der Behandlung dunkler und hellen dann um 30 bis 50 % auf den endgültigen Farbton auf. Ein Nachbesserungstermin 4 bis 6 Wochen später ist wichtig, um das Ergebnis zu perfektionieren. Die Ergebnisse halten 1 bis 3 Jahre." }
    ],
    es: [
      { title: "¿Qué es el microblading?", description: "El microblading es una técnica de tatuaje cosmético semipermanente realizada manualmente. Usando una herramienta manual especializada con finas microagujas, la técnica crea trazos individuales que imitan los vellos naturales de las cejas. El resultado es un aspecto natural y realista que realza tu belleza sin parecer artificial." },
      { title: "El proceso de microblading", description: "El tratamiento comienza con una consulta detallada y diseño de cejas para crear la forma perfecta adaptada a tu rostro. Después de aplicar crema anestésica, la técnica dibuja meticulosamente cada trazo. La sesión dura aproximadamente 2 horas, incluyendo consulta y diseño." },
      { title: "Cicatrización y cuidados", description: "La cicatrización inicial toma de 10 a 14 días. Las cejas aparecerán más oscuras justo después del tratamiento, luego se aclararán entre un 30 y 50 % hasta alcanzar el tono final. Una cita de retoque 4 a 6 semanas después es esencial para perfeccionar el resultado. Los resultados duran de 1 a 3 años." }
    ]
  },

  "Refreshing": {
    fr: [
      { title: "Qu'est-ce que le PMU Refreshing ?", description: "Le PMU Refreshing est un soin d'entretien pour le maquillage permanent existant. Le PMU s'estompe naturellement avec le temps en raison du renouvellement cellulaire, de l'exposition au soleil et du mode de vie. Ce soin ravive les pigments, restaure la définition et prolonge la durée de vie de votre maquillage permanent." },
      { title: "Le processus de refreshing", description: "Le soin est plus rapide que la procédure initiale, durant environ 60 minutes. La technicienne évalue l'état de votre PMU existant, ajuste la couleur si nécessaire et redéfinit les contours pour un résultat frais et naturel. Le processus est confortable grâce à l'application d'une crème anesthésiante." },
      { title: "Quand faire un refreshing ?", description: "La plupart des clientes ont besoin d'un refreshing tous les 12 à 18 mois, selon le type de peau, le mode de vie et l'exposition au soleil. Des signes comme l'estompage des couleurs, des contours moins nets ou un aspect inégal indiquent qu'il est temps de prévoir une retouche." }
    ],
    nl: [
      { title: "Wat is PMU Refreshing?", description: "PMU Refreshing is een onderhoudsbehandeling voor bestaande permanente make-up. PMU vervaagt na verloop van tijd op natuurlijke wijze door celvernieuwing, blootstelling aan de zon en levensstijl. Deze behandeling herleeft de pigmenten, herstelt de definitie en verlengt de levensduur van uw permanente make-up." },
      { title: "Het refreshingproces", description: "De behandeling is sneller dan de initiële procedure en duurt ongeveer 60 minuten. De technica beoordeelt de staat van uw bestaande PMU, past de kleur aan indien nodig en herdefinieert de contouren voor een fris en natuurlijk resultaat. Het proces is comfortabel dankzij het aanbrengen van verdovende crème." },
      { title: "Wanneer een refreshing plannen?", description: "De meeste klanten hebben elke 12 tot 18 maanden een refreshing nodig, afhankelijk van huidtype, levensstijl en blootstelling aan de zon. Tekenen zoals kleurvervaging, minder scherpe contouren of een ongelijkmatig uiterlijk geven aan dat het tijd is voor een bijwerking." }
    ],
    de: [
      { title: "Was ist PMU Refreshing?", description: "PMU Refreshing ist eine Pflegebehandlung für bestehendes Permanent Make-up. PMU verblasst im Laufe der Zeit natürlicherweise durch Zellerneuerung, Sonneneinstrahlung und Lebensstil. Diese Behandlung belebt die Pigmente, stellt die Definition wieder her und verlängert die Lebensdauer Ihres Permanent Make-ups." },
      { title: "Der Refreshing-Prozess", description: "Die Behandlung ist schneller als die Erstbehandlung und dauert etwa 60 Minuten. Die Technikerin beurteilt den Zustand Ihres bestehenden PMU, passt die Farbe bei Bedarf an und definiert die Konturen neu für ein frisches, natürliches Ergebnis. Der Prozess ist dank Betäubungscreme komfortabel." },
      { title: "Wann eine Auffrischung planen?", description: "Die meisten Kundinnen benötigen alle 12 bis 18 Monate eine Auffrischung, abhängig von Hauttyp, Lebensstil und Sonnenexposition. Anzeichen wie Farbverblassung, weniger scharfe Konturen oder ein ungleichmäßiges Erscheinungsbild deuten darauf hin, dass es Zeit für eine Auffrischung ist." }
    ],
    es: [
      { title: "¿Qué es el PMU Refreshing?", description: "El PMU Refreshing es un tratamiento de mantenimiento para maquillaje permanente existente. El PMU se desvanece naturalmente con el tiempo debido a la renovación celular, la exposición solar y el estilo de vida. Este tratamiento reaviva los pigmentos, restaura la definición y prolonga la vida útil de tu maquillaje permanente." },
      { title: "El proceso de refreshing", description: "El tratamiento es más rápido que el procedimiento inicial, durando aproximadamente 60 minutos. La técnica evalúa el estado de tu PMU existente, ajusta el color si es necesario y redefine los contornos para un resultado fresco y natural. El proceso es cómodo gracias a la aplicación de crema anestésica." },
      { title: "¿Cuándo hacer un refreshing?", description: "La mayoría de las clientas necesitan un refreshing cada 12 a 18 meses, dependiendo del tipo de piel, estilo de vida y exposición solar. Señales como la pérdida de color, contornos menos definidos o un aspecto irregular indican que es hora de programar un retoque." }
    ]
  }
};

async function updateSections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let updated = 0;
    for (const [title, langs] of Object.entries(sectionTranslations)) {
      const service = await Service.findOne({ title: { $regex: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
      if (!service) { console.log(`NOT FOUND: ${title}`); continue; }

      const existingTranslations = service.translations || {};
      for (const lang of ['fr', 'nl', 'de', 'es']) {
        if (langs[lang] && existingTranslations[lang]) {
          existingTranslations[lang].contentSections = langs[lang];
        }
      }

      await Service.findByIdAndUpdate(service._id, { $set: { translations: existingTranslations } });
      console.log(`UPDATED: ${title}`);
      updated++;
    }

    console.log(`\nDone! Updated ${updated} services`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateSections();
