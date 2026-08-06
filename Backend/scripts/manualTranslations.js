/**
 * Manual Translation Script
 * Updates all service translations in MongoDB directly
 * Run with: node scripts/manualTranslations.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Service = require('../models/Service');

const translations = {
  "Zen Your Body": {
    fr: {
      title: "Zen Your Body",
      description: "Un massage complet du corps conçu pour libérer les tensions, rétablir l'équilibre et apporter harmonie à tout votre être. Vivez une relaxation profonde tandis que des mains expertes travaillent chaque groupe musculaire, dissipant le stress et favorisant le bien-être global.",
      benefits: [
        { title: "", description: "Réduit le stress et l'anxiété grâce à une relaxation profonde" },
        { title: "", description: "Améliore la circulation sanguine dans tout le corps" },
        { title: "", description: "Libère les tensions musculaires et les nœuds" },
        { title: "", description: "Favorise une meilleure qualité de sommeil" },
        { title: "", description: "Améliore la clarté mentale et la concentration" },
        { title: "", description: "Soutient les processus naturels de détoxification" }
      ],
      targetAudience: [
        { title: "", description: "Toute personne recherchant une relaxation complète du corps et de l'esprit" },
        { title: "", description: "Personnes souffrant d'un niveau de stress élevé" },
        { title: "", description: "Ceux souffrant de tensions musculaires et de fatigue générale" },
        { title: "", description: "Personnes souhaitant une remise à zéro mentale et physique" }
      ],
      contentSections: [
        { title: "Expérience de relaxation complète", description: "Notre massage signature Zen Your Body est un soin holistique du corps entier qui combine les techniques de massage suédois avec l'aromathérapie. En utilisant de longs mouvements fluides et une pression douce, nous travaillons chaque groupe musculaire pour libérer les tensions et favoriser une relaxation profonde. La combinaison d'huiles chaudes et de mouvements de massage apaisants aide à calmer le système nerveux et à restaurer la paix intérieure." },
        { title: "Harmonie corps-esprit", description: "Ce massage va au-delà du soulagement physique — il crée un profond sentiment de clarté mentale et d'équilibre émotionnel. À mesure que le stress disparaît, vous ressentirez une meilleure concentration, une réduction de l'anxiété et un sentiment renouvelé de bien-être. Le soin inclut une attention particulière aux zones où nous accumulons couramment le stress : épaules, cou, dos et jambes." },
        { title: "Soins personnalisés", description: "Chaque séance Zen Your Body est adaptée à vos besoins individuels. Avant votre soin, nous discutons de vos préoccupations et préférences spécifiques pour vous garantir l'expérience la plus bénéfique. Que vous cherchiez un soulagement des tensions musculaires, une réduction du stress ou simplement un moment de tranquillité, ce massage s'adapte à vous." }
      ]
    },
    nl: {
      title: "Zen Your Body",
      description: "Een complete lichaamsmassage ontworpen om spanning los te laten, balans te herstellen en harmonie te brengen in uw hele lichaam. Ervaar diepe ontspanning terwijl deskundige handen elke spiergroep bewerken, stress laten verdwijnen en algemeen welzijn bevorderen.",
      benefits: [
        { title: "", description: "Vermindert stress en angst door diepe ontspanning" },
        { title: "", description: "Verbetert de bloedcirculatie door het hele lichaam" },
        { title: "", description: "Lost spierspanningen en knopen op" },
        { title: "", description: "Bevordert een betere slaapkwaliteit" },
        { title: "", description: "Verbetert mentale helderheid en concentratie" },
        { title: "", description: "Ondersteunt natuurlijke ontgiftingsprocessen" }
      ],
      targetAudience: [
        { title: "", description: "Iedereen die volledige lichaams- en geestontspanning zoekt" },
        { title: "", description: "Mensen met een hoog stressniveau" },
        { title: "", description: "Mensen met algemene spierspanning en vermoeidheid" },
        { title: "", description: "Personen die een mentale en fysieke reset willen" }
      ],
      contentSections: [
        { title: "Complete ontspanningservaring", description: "Onze kenmerkende Zen Your Body massage is een holistische behandeling van het hele lichaam die Zweedse massagetechnieken combineert met aromatherapie. Met lange, vloeiende bewegingen en zachte druk bewerken we elke spiergroep om spanning los te laten en diepe ontspanning te bevorderen. De combinatie van warme oliën en kalmerende massagebewegingen helpt het zenuwstelsel te kalmeren en innerlijke rust te herstellen." },
        { title: "Harmonie van lichaam en geest", description: "Deze massage gaat verder dan fysieke verlichting — het creëert een diep gevoel van mentale helderheid en emotioneel evenwicht. Naarmate de stress verdwijnt, ervaart u een verbeterde focus, verminderde angst en een hernieuwd gevoel van welzijn. De behandeling omvat aandacht voor gebieden waar we gewoonlijk stress vasthouden: schouders, nek, rug en benen." },
        { title: "Persoonlijke zorg", description: "Elke Zen Your Body sessie wordt afgestemd op uw individuele behoeften. Vóór uw behandeling bespreken we uw specifieke zorgen en voorkeuren om u de meest gunstige ervaring te garanderen. Of u nu verlichting zoekt van spierspanning, stressvermindering of gewoon een moment van rust, deze massage past zich aan u aan." }
      ]
    },
    de: {
      title: "Zen Your Body",
      description: "Eine vollständige Ganzkörpermassage, die darauf ausgelegt ist, Spannungen zu lösen, das Gleichgewicht wiederherzustellen und Harmonie in Ihr gesamtes Wesen zu bringen. Erleben Sie tiefe Entspannung, während erfahrene Hände jede Muskelgruppe bearbeiten, Stress schmelzen lassen und das allgemeine Wohlbefinden fördern.",
      benefits: [
        { title: "", description: "Reduziert Stress und Angst durch tiefe Entspannung" },
        { title: "", description: "Verbessert die Durchblutung im gesamten Körper" },
        { title: "", description: "Löst Muskelverspannungen und Knoten" },
        { title: "", description: "Fördert eine bessere Schlafqualität" },
        { title: "", description: "Verbessert geistige Klarheit und Konzentration" },
        { title: "", description: "Unterstützt natürliche Entgiftungsprozesse" }
      ],
      targetAudience: [
        { title: "", description: "Alle, die vollständige Körper-Geist-Entspannung suchen" },
        { title: "", description: "Menschen mit hohem Stresslevel" },
        { title: "", description: "Personen mit allgemeinen Muskelverspannungen und Müdigkeit" },
        { title: "", description: "Personen, die einen mentalen und physischen Reset wünschen" }
      ],
      contentSections: [
        { title: "Komplettes Entspannungserlebnis", description: "Unsere Signature Zen Your Body Massage ist eine ganzheitliche Ganzkörperbehandlung, die schwedische Massagetechniken mit Aromatherapie kombiniert. Mit langen, fließenden Bewegungen und sanftem Druck bearbeiten wir jede Muskelgruppe, um Spannungen zu lösen und tiefe Entspannung zu fördern. Die Kombination aus warmen Ölen und beruhigenden Massagebewegungen hilft, das Nervensystem zu beruhigen und inneren Frieden wiederherzustellen." },
        { title: "Körper-Geist-Harmonie", description: "Diese Massage geht über körperliche Erleichterung hinaus — sie schafft ein tiefes Gefühl geistiger Klarheit und emotionaler Balance. Wenn der Stress schmilzt, erleben Sie verbesserte Konzentration, reduzierte Angst und ein erneuertes Wohlbefinden. Die Behandlung umfasst die Bereiche, in denen wir häufig Stress ansammeln: Schultern, Nacken, Rücken und Beine." },
        { title: "Individuelle Betreuung", description: "Jede Zen Your Body Sitzung wird auf Ihre individuellen Bedürfnisse zugeschnitten. Vor Ihrer Behandlung besprechen wir Ihre spezifischen Anliegen und Vorlieben, um Ihnen das bestmögliche Erlebnis zu garantieren. Ob Sie Linderung von Muskelverspannungen, Stressabbau oder einfach einen Moment der Ruhe suchen — diese Massage passt sich Ihnen an." }
      ]
    },
    es: {
      title: "Zen Your Body",
      description: "Un masaje corporal completo diseñado para liberar tensiones, restaurar el equilibrio y aportar armonía a todo tu ser. Experimenta una relajación profunda mientras manos expertas trabajan cada grupo muscular, disolviendo el estrés y promoviendo el bienestar general.",
      benefits: [
        { title: "", description: "Reduce el estrés y la ansiedad mediante relajación profunda" },
        { title: "", description: "Mejora la circulación sanguínea en todo el cuerpo" },
        { title: "", description: "Libera tensiones musculares y nudos" },
        { title: "", description: "Promueve una mejor calidad del sueño" },
        { title: "", description: "Mejora la claridad mental y la concentración" },
        { title: "", description: "Apoya los procesos naturales de desintoxicación" }
      ],
      targetAudience: [
        { title: "", description: "Cualquier persona que busque relajación completa de cuerpo y mente" },
        { title: "", description: "Personas con altos niveles de estrés" },
        { title: "", description: "Quienes sufren de tensión muscular general y fatiga" },
        { title: "", description: "Personas que desean un reinicio mental y físico" }
      ],
      contentSections: [
        { title: "Experiencia de relajación completa", description: "Nuestro exclusivo masaje Zen Your Body es un tratamiento holístico de cuerpo completo que combina técnicas de masaje sueco con aromaterapia. Usando movimientos largos y fluidos con presión suave, trabajamos cada grupo muscular para liberar tensiones y promover una relajación profunda. La combinación de aceites cálidos y movimientos de masaje relajantes ayuda a calmar el sistema nervioso y restaurar la paz interior." },
        { title: "Armonía cuerpo-mente", description: "Este masaje va más allá del alivio físico — crea una profunda sensación de claridad mental y equilibrio emocional. A medida que el estrés desaparece, experimentarás mejor concentración, menos ansiedad y una renovada sensación de bienestar. El tratamiento incluye atención a las zonas donde comúnmente acumulamos estrés: hombros, cuello, espalda y piernas." },
        { title: "Cuidado personalizado", description: "Cada sesión de Zen Your Body se adapta a tus necesidades individuales. Antes del tratamiento, discutimos tus preocupaciones y preferencias específicas para garantizarte la experiencia más beneficiosa. Ya sea que busques alivio de tensiones musculares, reducción del estrés o simplemente un momento de tranquilidad, este masaje se adapta a ti." }
      ]
    }
  },

  "Back and neck": {
    fr: {
      title: "Dos et nuque",
      description: "Un massage thérapeutique ciblé sur le haut du corps, là où les tensions s'accumulent le plus souvent. Parfait pour soulager le stress lié au travail de bureau, aux mauvaises postures ou aux contraintes quotidiennes. En seulement 30 minutes, ressentez un soulagement significatif et renaissez.",
      benefits: [
        { title: "", description: "Soulagement rapide des tensions en seulement 30 minutes" },
        { title: "", description: "Traitement ciblé sur les zones problématiques" },
        { title: "", description: "Utilise des huiles chaudes et des huiles essentielles thérapeutiques" },
        { title: "", description: "Parfait pour les emplois du temps chargés" },
        { title: "", description: "Améliore la posture et la mobilité" },
        { title: "", description: "Soulage les maux de tête et les migraines de tension" }
      ],
      targetAudience: [
        { title: "", description: "Personnes disposant de peu de temps mais ayant besoin d'un soulagement rapide" },
        { title: "", description: "Employés de bureau souffrant de tensions au cou et aux épaules" },
        { title: "", description: "Sportifs après des séances de sport intensives" },
        { title: "", description: "Toute personne souffrant de gêne liée à la posture" }
      ],
      contentSections: [
        { title: "Soulagement rapide pour vies actives", description: "Vous n'avez pas beaucoup de temps mais souhaitez quand même profiter d'un massage qui fait fondre toutes vos tensions ? Notre massage Dos et Nuque est la solution parfaite. En 30 minutes concentrées, nous ciblons les zones où la tension s'accumule le plus : le cou, les épaules et le dos." },
        { title: "Traitement ciblé pour un effet maximal", description: "Les tensions se manifestent principalement dans la nuque, les épaules et le dos. Nous concentrons notre expertise sur ces zones critiques. Notre thérapeute utilise des huiles chaudes et des huiles essentielles thérapeutiques pour relâcher les muscles tendus et améliorer la circulation dans ces zones." },
        { title: "Idéal après une activité intense", description: "Ce massage est également parfait après des séances de sport intensives ou un travail physique exigeant. Que vous soyez resté assis à votre bureau toute la journée ou que vous reveniez d'un entraînement difficile, ce soin ciblé vous aide à retrouver confort et mobilité." }
      ]
    },
    nl: {
      title: "Rug en nek",
      description: "Een gerichte therapeutische massage voor het bovenlichaam, waar spanning zich het meest ophoopt. Perfect voor het verlichten van stress door bureauwerk, slechte houding of dagelijkse belasting. In slechts 30 minuten ervaart u aanzienlijke verlichting en voelt u zich herboren.",
      benefits: [
        { title: "", description: "Snelle spanningsverlichting in slechts 30 minuten" },
        { title: "", description: "Gerichte behandeling van probleemgebieden" },
        { title: "", description: "Gebruik van warme oliën en therapeutische essentiële oliën" },
        { title: "", description: "Perfect voor drukke agenda's" },
        { title: "", description: "Verbetert houding en mobiliteit" },
        { title: "", description: "Verlicht spanningshoofdpijn en migraine" }
      ],
      targetAudience: [
        { title: "", description: "Mensen met weinig tijd die snelle verlichting nodig hebben" },
        { title: "", description: "Kantoormedewerkers met nek- en schouderspanning" },
        { title: "", description: "Sporters na intensieve sportsessies" },
        { title: "", description: "Iedereen met houdingsgerelateerde klachten" }
      ],
      contentSections: [
        { title: "Snelle verlichting voor drukke levens", description: "Heeft u niet veel tijd maar wilt u toch genieten van een massage die al uw spanning laat verdwijnen? Onze Rug en Nek massage is de perfecte oplossing. In 30 geconcentreerde minuten richten we ons op de gebieden waar spanning zich het meest ophoopt: de nek, schouders en rug." },
        { title: "Gerichte behandeling voor maximaal effect", description: "Spanningen komen voornamelijk voor in de nek, schouders en rug. Wij concentreren onze expertise op deze kritieke gebieden. Onze therapeut gebruikt warme oliën en therapeutische essentiële oliën om gespannen spieren te ontspannen en de circulatie in deze gebieden te verbeteren." },
        { title: "Ideaal na intensieve activiteit", description: "Deze massage is ook perfect na intensieve sportsessies of zwaar fysiek werk. Of u nu de hele dag achter uw bureau hebt gezeten of terugkomt van een zware training, deze gerichte behandeling helpt u comfort en mobiliteit terug te vinden." }
      ]
    },
    de: {
      title: "Rücken und Nacken",
      description: "Eine gezielte therapeutische Massage für den Oberkörper, wo sich Spannungen am häufigsten ansammeln. Perfekt zur Linderung von Stress durch Schreibtischarbeit, schlechte Haltung oder tägliche Belastung. In nur 30 Minuten erleben Sie deutliche Erleichterung und fühlen sich wie neugeboren.",
      benefits: [
        { title: "", description: "Schnelle Spannungslösung in nur 30 Minuten" },
        { title: "", description: "Gezielte Behandlung der Problemzonen" },
        { title: "", description: "Verwendet warme Öle und therapeutische ätherische Öle" },
        { title: "", description: "Perfekt für volle Terminkalender" },
        { title: "", description: "Verbessert Haltung und Beweglichkeit" },
        { title: "", description: "Lindert Spannungskopfschmerzen und Migräne" }
      ],
      targetAudience: [
        { title: "", description: "Menschen mit wenig Zeit, die schnelle Erleichterung brauchen" },
        { title: "", description: "Büroangestellte mit Nacken- und Schulterverspannungen" },
        { title: "", description: "Sportler nach intensiven Trainingseinheiten" },
        { title: "", description: "Alle mit haltungsbedingten Beschwerden" }
      ],
      contentSections: [
        { title: "Schnelle Erleichterung für ein aktives Leben", description: "Haben Sie nicht viel Zeit, möchten aber trotzdem eine Massage genießen, die alle Verspannungen löst? Unsere Rücken- und Nackenmassage ist die perfekte Lösung. In 30 konzentrierten Minuten behandeln wir die Bereiche, in denen sich Spannungen am meisten ansammeln: Nacken, Schultern und Rücken." },
        { title: "Gezielte Behandlung für maximale Wirkung", description: "Verspannungen treten hauptsächlich im Nacken, den Schultern und dem Rücken auf. Wir konzentrieren unsere Expertise auf diese kritischen Bereiche. Unser Therapeut verwendet warme Öle und therapeutische ätherische Öle, um verspannte Muskeln zu lockern und die Durchblutung in diesen Bereichen zu verbessern." },
        { title: "Ideal nach intensiver Aktivität", description: "Diese Massage ist auch perfekt nach intensiven Sporteinheiten oder anstrengender körperlicher Arbeit. Ob Sie den ganzen Tag am Schreibtisch gesessen haben oder von einem harten Training zurückkehren — diese gezielte Behandlung hilft Ihnen, Komfort und Beweglichkeit zurückzugewinnen." }
      ]
    },
    es: {
      title: "Espalda y cuello",
      description: "Un masaje terapéutico enfocado en la parte superior del cuerpo, donde la tensión se acumula con mayor frecuencia. Perfecto para aliviar el estrés del trabajo de oficina, la mala postura o la tensión diaria. En solo 30 minutos, experimenta un alivio significativo y siéntete renovado.",
      benefits: [
        { title: "", description: "Alivio rápido de la tensión en solo 30 minutos" },
        { title: "", description: "Tratamiento enfocado en las zonas problemáticas" },
        { title: "", description: "Utiliza aceites cálidos y aceites esenciales terapéuticos" },
        { title: "", description: "Perfecto para agendas ocupadas" },
        { title: "", description: "Mejora la postura y la movilidad" },
        { title: "", description: "Alivia dolores de cabeza tensionales y migrañas" }
      ],
      targetAudience: [
        { title: "", description: "Personas con poco tiempo que necesitan alivio rápido" },
        { title: "", description: "Trabajadores de oficina con tensión en cuello y hombros" },
        { title: "", description: "Deportistas después de sesiones de ejercicio intensas" },
        { title: "", description: "Cualquier persona con molestias relacionadas con la postura" }
      ],
      contentSections: [
        { title: "Alivio rápido para vidas ocupadas", description: "¿No tienes mucho tiempo pero quieres disfrutar de un masaje que disuelva toda tu tensión? Nuestro masaje de Espalda y Cuello es la solución perfecta. En 30 minutos concentrados, nos enfocamos en las zonas donde más se acumula la tensión: cuello, hombros y espalda." },
        { title: "Tratamiento enfocado para máximo efecto", description: "Las tensiones se manifiestan principalmente en el cuello, los hombros y la espalda. Concentramos nuestra experiencia en estas zonas críticas. Nuestro terapeuta utiliza aceites cálidos y aceites esenciales terapéuticos para relajar los músculos tensos y mejorar la circulación en estas áreas." },
        { title: "Ideal después de actividad intensa", description: "Este masaje también es perfecto después de sesiones deportivas intensas o trabajo físico exigente. Ya sea que hayas estado sentado en tu escritorio todo el día o que vuelvas de un entrenamiento duro, este tratamiento enfocado te ayuda a recuperar la comodidad y la movilidad." }
      ]
    }
  },

  "Hotstone": {
    fr: {
      title: "Pierre chaude (Hotstone)",
      description: "Un massage curatif ancestral utilisant des pierres de basalte lisses et chauffées pour procurer une chaleur profonde et une relaxation musculaire. La chaleur pénètre en profondeur dans vos muscles, créant une expérience de relaxation unique utilisée depuis des siècles dans de nombreuses cultures.",
      benefits: [
        { title: "", description: "Relaxation musculaire profonde grâce à la chaleur thérapeutique" },
        { title: "", description: "Amélioration de la circulation sanguine et de l'oxygénation" },
        { title: "", description: "Harmonise le corps et l'esprit" },
        { title: "", description: "Détoxification naturelle et élimination des toxines" },
        { title: "", description: "Soulage les douleurs chroniques comme la fibromyalgie" },
        { title: "", description: "Favorise une meilleure qualité de sommeil" }
      ],
      targetAudience: [
        { title: "", description: "Idéal pour le stress, les tensions et les blocages énergétiques" },
        { title: "", description: "Personnes souffrant de rhumatismes ou d'arthrose" },
        { title: "", description: "Personnes ayant une mauvaise circulation" },
        { title: "", description: "Toute personne recherchant une relaxation profonde et de la chaleur" }
      ],
      contentSections: [
        { title: "Tradition de guérison ancestrale", description: "Le massage aux pierres chaudes trouve ses racines dans diverses cultures, notamment les traditions amérindiennes et asiatiques. Les pierres de basalte chauffées sont utilisées pour apporter une chaleur profonde et thérapeutique qui pénètre les couches musculaires, favorisant une relaxation et une guérison profondes." },
        { title: "Travail avec les points d'énergie", description: "Les pierres de basalte chauffées sont stratégiquement placées sur les points d'acupuncture et les centres énergétiques de votre corps. À mesure que la chaleur pénètre, elle aide à libérer les blocages, améliorer le flux d'énergie et rétablir l'équilibre dans les systèmes de votre corps." },
        { title: "Activation de l'auto-guérison", description: "Le massage aux pierres chaudes contribue à la capacité d'auto-guérison de votre corps. La chaleur dilate les vaisseaux sanguins, améliore la circulation et aide à éliminer les toxines. Ce processus naturel soutient le système immunitaire et favorise le bien-être général." }
      ]
    },
    nl: {
      title: "Hotstone",
      description: "Een eeuwenoude helende massage met gladde, verwarmde basaltstenen die diepe warmte en spierontspanning bieden. De warmte dringt diep door in uw spieren en creëert een uniek ontspannende ervaring die al eeuwenlang in vele culturen wordt gebruikt.",
      benefits: [
        { title: "", description: "Diepe spierontspanning door therapeutische warmte" },
        { title: "", description: "Verbeterde bloedcirculatie en zuurstoftoevoer" },
        { title: "", description: "Brengt lichaam en geest in harmonie" },
        { title: "", description: "Natuurlijke ontgifting en verwijdering van afvalstoffen" },
        { title: "", description: "Verlicht chronische pijnklachten zoals fibromyalgie" },
        { title: "", description: "Bevordert een betere slaapkwaliteit" }
      ],
      targetAudience: [
        { title: "", description: "Ideaal bij stress, spanning en energieblokkades" },
        { title: "", description: "Mensen die lijden aan reuma of artrose" },
        { title: "", description: "Mensen met een slechte bloedsomloop" },
        { title: "", description: "Iedereen die diepe ontspanning en warmte zoekt" }
      ],
      contentSections: [
        { title: "Eeuwenoude helende traditie", description: "Hotstonemassage heeft zijn wortels in verschillende culturen, waaronder inheems-Amerikaanse en Aziatische tradities. De verwarmde basaltstenen worden gebruikt om diepe, therapeutische warmte te bieden die doordringt tot in de spierlagen, wat diepe ontspanning en genezing bevordert." },
        { title: "Werken met energiepunten", description: "De verwarmde basaltstenen worden strategisch geplaatst op acupunctuurpunten en energiecentra in uw lichaam. Naarmate de warmte doordringt, helpt het blokkades los te laten, de energiestroom te verbeteren en het evenwicht in de systemen van uw lichaam te herstellen." },
        { title: "Activering van zelfgenezing", description: "Hotstonemassage draagt bij aan het zelfgenezend vermogen van uw lichaam. De warmte verwijdt de bloedvaten, verbetert de circulatie en helpt bij het verwijderen van afvalstoffen. Dit natuurlijke proces ondersteunt het immuunsysteem en bevordert het algehele welzijn." }
      ]
    },
    de: {
      title: "Hotstone",
      description: "Eine uralte Heilmassage mit glatten, erhitzten Basaltsteinen, die tiefe Wärme und Muskelentspannung bieten. Die Wärme dringt tief in Ihre Muskeln ein und schafft ein einzigartig entspannendes Erlebnis, das seit Jahrhunderten in vielen Kulturen praktiziert wird.",
      benefits: [
        { title: "", description: "Tiefe Muskelentspannung durch therapeutische Wärme" },
        { title: "", description: "Verbesserte Durchblutung und Sauerstoffversorgung" },
        { title: "", description: "Bringt Körper und Geist in Harmonie" },
        { title: "", description: "Natürliche Entgiftung und Entfernung von Giftstoffen" },
        { title: "", description: "Lindert chronische Schmerzen wie Fibromyalgie" },
        { title: "", description: "Fördert eine bessere Schlafqualität" }
      ],
      targetAudience: [
        { title: "", description: "Ideal bei Stress, Verspannungen und Energieblockaden" },
        { title: "", description: "Menschen mit Rheuma oder Arthrose" },
        { title: "", description: "Menschen mit schlechter Durchblutung" },
        { title: "", description: "Alle, die tiefe Entspannung und Wärme suchen" }
      ],
      contentSections: [
        { title: "Uralte Heiltradition", description: "Die Hotstone-Massage hat ihre Wurzeln in verschiedenen Kulturen, darunter indianische und asiatische Traditionen. Die erhitzten Basaltsteine werden verwendet, um tiefe therapeutische Wärme zu bieten, die in die Muskelschichten eindringt und tiefe Entspannung und Heilung fördert." },
        { title: "Arbeit mit Energiepunkten", description: "Die erhitzten Basaltsteine werden strategisch auf Akupunkturpunkte und Energiezentren Ihres Körpers platziert. Wenn die Wärme eindringt, hilft sie, Blockaden zu lösen, den Energiefluss zu verbessern und das Gleichgewicht in den Systemen Ihres Körpers wiederherzustellen." },
        { title: "Aktivierung der Selbstheilung", description: "Die Hotstone-Massage trägt zur Selbstheilungsfähigkeit Ihres Körpers bei. Die Wärme weitet die Blutgefäße, verbessert die Durchblutung und hilft bei der Entfernung von Giftstoffen. Dieser natürliche Prozess unterstützt das Immunsystem und fördert das allgemeine Wohlbefinden." }
      ]
    },
    es: {
      title: "Piedras calientes (Hotstone)",
      description: "Un masaje curativo ancestral que utiliza piedras de basalto lisas y calentadas para proporcionar calor profundo y relajación muscular. El calor penetra profundamente en tus músculos, creando una experiencia de relajación única que se ha utilizado durante siglos en muchas culturas.",
      benefits: [
        { title: "", description: "Relajación muscular profunda mediante calor terapéutico" },
        { title: "", description: "Mejora de la circulación sanguínea y oxigenación" },
        { title: "", description: "Armoniza cuerpo y mente" },
        { title: "", description: "Desintoxicación natural y eliminación de toxinas" },
        { title: "", description: "Alivia condiciones de dolor crónico como la fibromialgia" },
        { title: "", description: "Promueve una mejor calidad del sueño" }
      ],
      targetAudience: [
        { title: "", description: "Ideal para estrés, tensión y bloqueos energéticos" },
        { title: "", description: "Personas que sufren de reumatismo o artrosis" },
        { title: "", description: "Personas con mala circulación" },
        { title: "", description: "Cualquiera que busque relajación profunda y calor" }
      ],
      contentSections: [
        { title: "Tradición curativa ancestral", description: "El masaje con piedras calientes tiene sus raíces en diversas culturas, incluidas las tradiciones nativas americanas y asiáticas. Las piedras de basalto calentadas se utilizan para proporcionar un calor terapéutico profundo que penetra en las capas musculares, promoviendo una relajación y curación profundas." },
        { title: "Trabajo con puntos de energía", description: "Las piedras de basalto calentadas se colocan estratégicamente en puntos de acupuntura y centros de energía de tu cuerpo. A medida que el calor penetra, ayuda a liberar bloqueos, mejorar el flujo de energía y restablecer el equilibrio en los sistemas de tu cuerpo." },
        { title: "Activación de la autocuración", description: "El masaje con piedras calientes contribuye a la capacidad de autocuración de tu cuerpo. El calor dilata los vasos sanguíneos, mejora la circulación y ayuda a eliminar toxinas. Este proceso natural apoya el sistema inmunológico y promueve el bienestar general." }
      ]
    }
  },

  "Sports massage full body": {
    fr: {
      title: "Massage sportif corps complet",
      description: "Un massage thérapeutique dynamique spécialement conçu pour les sportifs et les personnes actives. Ce soin corps complet cible les groupes musculaires sollicités lors du sport et du fitness, accélérant la récupération, améliorant la flexibilité et optimisant les performances athlétiques.",
      benefits: [
        { title: "", description: "Récupération musculaire plus rapide après l'effort" },
        { title: "", description: "Augmentation de la flexibilité et de l'amplitude de mouvement" },
        { title: "", description: "Prévention des blessures liées au sport" },
        { title: "", description: "Réduction des courbatures et des DOMS" },
        { title: "", description: "Amélioration des performances athlétiques" },
        { title: "", description: "Meilleure circulation et drainage lymphatique" }
      ],
      targetAudience: [
        { title: "", description: "Sportifs professionnels et amateurs" },
        { title: "", description: "Passionnés de fitness et adeptes de la salle de sport" },
        { title: "", description: "Coureurs, cyclistes et nageurs" },
        { title: "", description: "Toute personne en phase de récupération après une activité physique" }
      ],
      contentSections: [
        { title: "Soutien idéal pour les modes de vie actifs", description: "Le massage sportif est légèrement plus dynamique que le massage relaxant et est idéal avant le sport, après le sport ou comme entretien régulier. Les techniques spécifiques aident à préparer vos muscles pour l'effort ou à accélérer la récupération." },
        { title: "Effet profond sur les muscles", description: "Les techniques du massage sportif comprennent le lissage, le pétrissage et les techniques de pression dérivées du massage suédois, combinées à des étirements ciblés et un travail des tissus profonds pour traiter les zones de tension spécifiques." },
        { title: "Prévention des blessures et récupération accélérée", description: "Des muscles rigides ou excessivement tendus augmentent le risque de blessure pendant l'exercice. Le massage sportif régulier maintient la souplesse de vos muscles, réduit le risque de claquages et vous aide à maintenir des performances optimales." }
      ]
    },
    nl: {
      title: "Sportmassage volledig lichaam",
      description: "Een dynamische therapeutische massage speciaal ontworpen voor sporters en actieve personen. Deze volledige lichaamsbehandeling richt zich op spiergroepen die bij sport en fitness worden gebruikt, versnelt herstel, verbetert flexibiliteit en optimaliseert atletische prestaties.",
      benefits: [
        { title: "", description: "Sneller spierherstel na inspanning" },
        { title: "", description: "Verhoogde flexibiliteit en bewegingsomvang" },
        { title: "", description: "Preventie van sportgerelateerde blessures" },
        { title: "", description: "Verminderde spierpijn en DOMS" },
        { title: "", description: "Verbeterde atletische prestaties" },
        { title: "", description: "Verbeterde circulatie en lymfedrainage" }
      ],
      targetAudience: [
        { title: "", description: "Professionele en recreatieve sporters" },
        { title: "", description: "Fitness-enthousiastelingen en sportschoolgangers" },
        { title: "", description: "Hardlopers, wielrenners en zwemmers" },
        { title: "", description: "Iedereen die herstelt van fysieke activiteit" }
      ],
      contentSections: [
        { title: "Ideale ondersteuning voor actieve levensstijlen", description: "Sportmassage is iets dynamischer dan ontspanningsmassage en is ideaal vóór het sporten, na het sporten of als regelmatig onderhoud. De specifieke technieken helpen uw spieren voor te bereiden op inspanning of het herstel te versnellen." },
        { title: "Diep effect op de spieren", description: "De technieken van sportmassage omvatten strijken, kneden en druktechnieken afgeleid van Zweedse massage, gecombineerd met gerichte stretches en diepweefselwerk om specifieke spanningsgebieden aan te pakken." },
        { title: "Blessurepreventie en sneller herstel", description: "Stijve of overmatig gespannen spieren verhogen het risico op blessures tijdens het sporten. Regelmatige sportmassage houdt uw spieren soepel, vermindert het risico op verrekkingen en helpt u optimale prestaties te behouden." }
      ]
    },
    de: {
      title: "Sportmassage Ganzkörper",
      description: "Eine dynamische therapeutische Massage, die speziell für Sportler und aktive Menschen entwickelt wurde. Diese Ganzkörperbehandlung zielt auf Muskelgruppen ab, die beim Sport und Fitness beansprucht werden, beschleunigt die Erholung, verbessert die Flexibilität und steigert die sportliche Leistung.",
      benefits: [
        { title: "", description: "Schnellere Muskelerholung nach dem Training" },
        { title: "", description: "Erhöhte Flexibilität und Bewegungsumfang" },
        { title: "", description: "Vorbeugung von Sportverletzungen" },
        { title: "", description: "Reduzierter Muskelkater und DOMS" },
        { title: "", description: "Verbesserte sportliche Leistung" },
        { title: "", description: "Verbesserte Durchblutung und Lymphdrainage" }
      ],
      targetAudience: [
        { title: "", description: "Professionelle und Freizeitsportler" },
        { title: "", description: "Fitness-Enthusiasten und Studiogänger" },
        { title: "", description: "Läufer, Radfahrer und Schwimmer" },
        { title: "", description: "Alle, die sich von körperlicher Aktivität erholen" }
      ],
      contentSections: [
        { title: "Ideale Unterstützung für aktive Lebensstile", description: "Sportmassage ist etwas dynamischer als Entspannungsmassage und ist ideal vor dem Sport, nach dem Sport oder als regelmäßige Pflege. Die spezifischen Techniken helfen, Ihre Muskeln auf Anstrengung vorzubereiten oder die Erholung zu beschleunigen." },
        { title: "Tiefe Wirkung auf die Muskulatur", description: "Die Techniken der Sportmassage umfassen Streichungen, Knetungen und Drucktechniken aus der schwedischen Massage, kombiniert mit gezielten Dehnungen und Tiefengewebsarbeit, um spezifische Spannungsbereiche zu behandeln." },
        { title: "Verletzungsvorbeugung und schnellere Erholung", description: "Steife oder übermäßig angespannte Muskeln erhöhen das Verletzungsrisiko beim Sport. Regelmäßige Sportmassage hält Ihre Muskeln geschmeidig, reduziert das Risiko von Zerrungen und hilft Ihnen, optimale Leistung zu erbringen." }
      ]
    },
    es: {
      title: "Masaje deportivo cuerpo completo",
      description: "Un masaje terapéutico dinámico diseñado especialmente para deportistas y personas activas. Este tratamiento de cuerpo completo se enfoca en los grupos musculares utilizados en el deporte y fitness, acelerando la recuperación, mejorando la flexibilidad y optimizando el rendimiento atlético.",
      benefits: [
        { title: "", description: "Recuperación muscular más rápida después del ejercicio" },
        { title: "", description: "Mayor flexibilidad y rango de movimiento" },
        { title: "", description: "Prevención de lesiones deportivas" },
        { title: "", description: "Reducción de agujetas y DOMS" },
        { title: "", description: "Mejor rendimiento atlético" },
        { title: "", description: "Mejor circulación y drenaje linfático" }
      ],
      targetAudience: [
        { title: "", description: "Deportistas profesionales y amateur" },
        { title: "", description: "Entusiastas del fitness y asiduos al gimnasio" },
        { title: "", description: "Corredores, ciclistas y nadadores" },
        { title: "", description: "Cualquier persona en recuperación de actividad física" }
      ],
      contentSections: [
        { title: "Apoyo ideal para estilos de vida activos", description: "El masaje deportivo es ligeramente más dinámico que el masaje de relajación y es ideal antes del deporte, después del deporte o como mantenimiento regular. Las técnicas específicas ayudan a preparar tus músculos para el esfuerzo o a acelerar la recuperación." },
        { title: "Efecto profundo en los músculos", description: "Las técnicas del masaje deportivo incluyen deslizamiento, amasamiento y técnicas de presión derivadas del masaje sueco, combinadas con estiramientos dirigidos y trabajo de tejido profundo para tratar zonas de tensión específicas." },
        { title: "Prevención de lesiones y recuperación acelerada", description: "Los músculos rígidos o excesivamente tensos aumentan el riesgo de lesiones durante el ejercicio. El masaje deportivo regular mantiene tus músculos flexibles, reduce el riesgo de tirones y te ayuda a mantener un rendimiento óptimo." }
      ]
    }
  },

  "Mini coup d'eclat": {
    fr: { title: "Mini coup d'éclat", description: "Un soin du visage rapide mais efficace de 30 minutes conçu pour donner à votre peau un éclat instantané. Parfait pour les emplois du temps chargés ou comme introduction aux soins professionnels, ce soin express offre nettoyage, tonification et hydratation essentiels.", benefits: [{ title: "", description: "Éclat instantané et teint rafraîchi" }, { title: "", description: "Efficace en seulement 30 minutes" }, { title: "", description: "Nettoyage doux et exfoliation" }, { title: "", description: "Introduction idéale aux soins professionnels" }, { title: "", description: "Parfait entre deux soins complets" }, { title: "", description: "Convient à tous les types de peau" }], targetAudience: [{ title: "", description: "Professionnels pressés avec peu de temps" }, { title: "", description: "Personnes découvrant les soins du visage professionnels" }, { title: "", description: "Toute personne ayant besoin d'un coup de fraîcheur rapide" }, { title: "", description: "Personnes entretenant une routine de soins régulière" }], contentSections: [] },
    nl: { title: "Mini coup d'éclat", description: "Een snelle maar effectieve gezichtsbehandeling van 30 minuten, ontworpen om uw huid direct te laten stralen. Perfect voor drukke agenda's of als kennismaking met professionele huidverzorging, biedt deze express-behandeling essentiële reiniging, toning en hydratatie.", benefits: [{ title: "", description: "Direct stralend en fris teint" }, { title: "", description: "Tijdefficiënt in slechts 30 minuten" }, { title: "", description: "Zachte reiniging en exfoliatie" }, { title: "", description: "Ideale kennismaking met professionele gezichtsbehandelingen" }, { title: "", description: "Perfect onderhoud tussen volledige behandelingen" }, { title: "", description: "Geschikt voor alle huidtypes" }], targetAudience: [{ title: "", description: "Drukke professionals met weinig tijd" }, { title: "", description: "Mensen die voor het eerst een gezichtsbehandeling proberen" }, { title: "", description: "Iedereen die een snelle huidopkikker nodig heeft" }, { title: "", description: "Personen die een regelmatige huidverzorgingsroutine onderhouden" }], contentSections: [] },
    de: { title: "Mini coup d'éclat", description: "Eine schnelle, aber effektive 30-minütige Gesichtsbehandlung, die Ihrer Haut sofort Ausstrahlung verleiht. Perfekt für volle Terminkalender oder als Einstieg in professionelle Hautpflege bietet diese Express-Behandlung wesentliche Reinigung, Tonisierung und Feuchtigkeitspflege.", benefits: [{ title: "", description: "Sofortige Ausstrahlung und erfrischter Teint" }, { title: "", description: "Zeiteffizient in nur 30 Minuten" }, { title: "", description: "Sanfte Reinigung und Peeling" }, { title: "", description: "Idealer Einstieg in professionelle Gesichtsbehandlungen" }, { title: "", description: "Perfekte Pflege zwischen vollständigen Behandlungen" }, { title: "", description: "Geeignet für alle Hauttypen" }], targetAudience: [{ title: "", description: "Vielbeschäftigte Berufstätige mit wenig Zeit" }, { title: "", description: "Erstbesucher bei Gesichtsbehandlungen" }, { title: "", description: "Alle, die eine schnelle Hautauffrischung brauchen" }, { title: "", description: "Personen, die regelmäßige Hautpflegeroutinen pflegen" }], contentSections: [] },
    es: { title: "Mini coup d'éclat", description: "Un tratamiento facial rápido pero efectivo de 30 minutos diseñado para darle a tu piel un brillo instantáneo. Perfecto para agendas ocupadas o como introducción al cuidado profesional de la piel, este facial exprés ofrece limpieza, tonificación e hidratación esenciales.", benefits: [{ title: "", description: "Brillo instantáneo y tez refrescada" }, { title: "", description: "Eficiente en solo 30 minutos" }, { title: "", description: "Limpieza suave y exfoliación" }, { title: "", description: "Introducción ideal a tratamientos faciales profesionales" }, { title: "", description: "Perfecto mantenimiento entre tratamientos completos" }, { title: "", description: "Apto para todos los tipos de piel" }], targetAudience: [{ title: "", description: "Profesionales ocupados con poco tiempo" }, { title: "", description: "Personas que prueban un facial profesional por primera vez" }, { title: "", description: "Cualquiera que necesite un impulso rápido para la piel" }, { title: "", description: "Personas que mantienen rutinas regulares de cuidado de la piel" }], contentSections: [] }
  },

  "Anti-aging Mesoeclat": {
    fr: { title: "Anti-âge Mesoéclat", description: "Un soin du visage anti-âge avancé inspiré des principes de la mésothérapie. À l'aide de sérums spécialisés et de techniques avancées, ce soin cible les rides, le relâchement cutané et le teint terne pour révéler une peau plus jeune et éclatante.", benefits: [{ title: "", description: "Réduction visible des rides et ridules" }, { title: "", description: "Fermeté et élasticité améliorées de la peau" }, { title: "", description: "Teint lumineux et rajeuni" }, { title: "", description: "Hydratation profonde des couches de la peau" }, { title: "", description: "Stimulation de la production de collagène" }, { title: "", description: "Résultats longue durée avec un entretien régulier" }], targetAudience: [{ title: "", description: "Personnes préoccupées par les signes du vieillissement" }, { title: "", description: "Personnes recherchant des solutions anti-âge non invasives" }, { title: "", description: "Personnes souhaitant améliorer la fermeté de la peau" }, { title: "", description: "Toute personne désirant un teint rajeuni" }], contentSections: [] },
    nl: { title: "Anti-aging Mesoéclat", description: "Een geavanceerde anti-aging gezichtsbehandeling geïnspireerd op de principes van mesotherapie. Met gespecialiseerde serums en geavanceerde technieken richt deze behandeling zich op rimpels, huidverslapping en een doffe teint om een jongere, stralende huid te onthullen.", benefits: [{ title: "", description: "Zichtbare vermindering van rimpels en fijne lijntjes" }, { title: "", description: "Verbeterde stevigheid en elasticiteit van de huid" }, { title: "", description: "Stralende, verjongde teint" }, { title: "", description: "Diepe hydratatie van de huidlagen" }, { title: "", description: "Stimulatie van collageenproductie" }, { title: "", description: "Langdurige resultaten bij regelmatig onderhoud" }], targetAudience: [{ title: "", description: "Personen bezorgd over tekenen van veroudering" }, { title: "", description: "Mensen die niet-invasieve anti-aging oplossingen zoeken" }, { title: "", description: "Personen die de stevigheid van hun huid willen verbeteren" }, { title: "", description: "Iedereen die een verjongde teint wenst" }], contentSections: [] },
    de: { title: "Anti-Aging Mesoéclat", description: "Eine fortschrittliche Anti-Aging-Gesichtsbehandlung, inspiriert von den Prinzipien der Mesotherapie. Mit spezialisierten Seren und fortschrittlichen Techniken zielt diese Behandlung auf Falten, erschlaffte Haut und einen fahlen Teint ab, um eine jüngere, strahlende Haut zu enthüllen.", benefits: [{ title: "", description: "Sichtbare Reduktion von Falten und feinen Linien" }, { title: "", description: "Verbesserte Hautfestigkeit und Elastizität" }, { title: "", description: "Strahlender, verjüngter Teint" }, { title: "", description: "Tiefe Feuchtigkeitsversorgung der Hautschichten" }, { title: "", description: "Stimulation der Kollagenproduktion" }, { title: "", description: "Langanhaltende Ergebnisse bei regelmäßiger Pflege" }], targetAudience: [{ title: "", description: "Personen, die sich um Alterserscheinungen sorgen" }, { title: "", description: "Menschen, die nicht-invasive Anti-Aging-Lösungen suchen" }, { title: "", description: "Personen, die die Hautfestigkeit verbessern möchten" }, { title: "", description: "Alle, die einen verjüngten Teint wünschen" }], contentSections: [] },
    es: { title: "Anti-edad Mesoéclat", description: "Un tratamiento facial antiedad avanzado inspirado en los principios de la mesoterapia. Utilizando sueros especializados y técnicas avanzadas, este tratamiento aborda arrugas, flacidez y tez apagada para revelar una piel más joven y radiante.", benefits: [{ title: "", description: "Reducción visible de arrugas y líneas finas" }, { title: "", description: "Mejor firmeza y elasticidad de la piel" }, { title: "", description: "Tez luminosa y rejuvenecida" }, { title: "", description: "Hidratación profunda de las capas de la piel" }, { title: "", description: "Estimulación de la producción de colágeno" }, { title: "", description: "Resultados duraderos con mantenimiento regular" }], targetAudience: [{ title: "", description: "Personas preocupadas por los signos del envejecimiento" }, { title: "", description: "Quienes buscan soluciones antiedad no invasivas" }, { title: "", description: "Personas que desean mejorar la firmeza de su piel" }, { title: "", description: "Cualquiera que desee una tez rejuvenecida" }], contentSections: [] }
  },

  "Sports massage leg, back and neck": {
    fr: { title: "Massage sportif jambes, dos et nuque", description: "Un massage sportif ciblé sur les jambes, le dos et la nuque — les zones les plus sollicitées par l'activité sportive. Combinant des techniques de tissu profond avec des étirements, ce soin accélère la récupération et réduit les tensions musculaires.", benefits: [{ title: "", description: "Récupération ciblée des zones les plus sollicitées" }, { title: "", description: "Combinaison de tissus profonds et d'étirements" }, { title: "", description: "Réduit efficacement les tensions musculaires" }, { title: "", description: "Améliore la flexibilité et la mobilité" }, { title: "", description: "Prévient les blessures sportives" }, { title: "", description: "Soulagement rapide et efficace" }], targetAudience: [{ title: "", description: "Sportifs ayant besoin d'un traitement ciblé" }, { title: "", description: "Coureurs et cyclistes" }, { title: "", description: "Personnes souffrant de tensions au dos et aux jambes" }, { title: "", description: "Travailleurs physiquement actifs" }], contentSections: [] },
    nl: { title: "Sportmassage benen, rug en nek", description: "Een gerichte sportmassage voor benen, rug en nek — de gebieden die het meest worden belast bij sportieve activiteiten. Door diepweefseltechnieken te combineren met stretches versnelt deze behandeling het herstel en vermindert spierspanning.", benefits: [{ title: "", description: "Gericht herstel van de meest belaste gebieden" }, { title: "", description: "Combinatie van diepweefsel en stretches" }, { title: "", description: "Vermindert spierspanning effectief" }, { title: "", description: "Verbetert flexibiliteit en mobiliteit" }, { title: "", description: "Voorkomt sportblessures" }, { title: "", description: "Snelle en effectieve verlichting" }], targetAudience: [{ title: "", description: "Sporters die gerichte behandeling nodig hebben" }, { title: "", description: "Hardlopers en wielrenners" }, { title: "", description: "Mensen met spanning in rug en benen" }, { title: "", description: "Fysiek actieve werknemers" }], contentSections: [] },
    de: { title: "Sportmassage Beine, Rücken und Nacken", description: "Eine gezielte Sportmassage für Beine, Rücken und Nacken — die Bereiche, die bei sportlicher Aktivität am stärksten beansprucht werden. Durch Kombination von Tiefengewebstechniken mit Dehnungen beschleunigt diese Behandlung die Erholung und reduziert Muskelverspannungen.", benefits: [{ title: "", description: "Gezielte Erholung der am stärksten beanspruchten Bereiche" }, { title: "", description: "Kombination aus Tiefengewebe und Dehnungen" }, { title: "", description: "Reduziert Muskelverspannungen effektiv" }, { title: "", description: "Verbessert Flexibilität und Beweglichkeit" }, { title: "", description: "Beugt Sportverletzungen vor" }, { title: "", description: "Schnelle und effektive Erleichterung" }], targetAudience: [{ title: "", description: "Sportler, die gezielte Behandlung benötigen" }, { title: "", description: "Läufer und Radfahrer" }, { title: "", description: "Menschen mit Verspannungen in Rücken und Beinen" }, { title: "", description: "Körperlich aktive Berufstätige" }], contentSections: [] },
    es: { title: "Masaje deportivo piernas, espalda y cuello", description: "Un masaje deportivo enfocado en piernas, espalda y cuello — las zonas más afectadas por la actividad deportiva. Combinando técnicas de tejido profundo con estiramientos, este tratamiento acelera la recuperación y reduce la tensión muscular.", benefits: [{ title: "", description: "Recuperación enfocada de las zonas más exigidas" }, { title: "", description: "Combinación de tejido profundo y estiramientos" }, { title: "", description: "Reduce la tensión muscular de forma efectiva" }, { title: "", description: "Mejora la flexibilidad y movilidad" }, { title: "", description: "Previene lesiones deportivas" }, { title: "", description: "Alivio rápido y efectivo" }], targetAudience: [{ title: "", description: "Deportistas que necesitan tratamiento enfocado" }, { title: "", description: "Corredores y ciclistas" }, { title: "", description: "Personas con tensión en espalda y piernas" }, { title: "", description: "Trabajadores físicamente activos" }], contentSections: [] }
  },

  "Sports massage legs": {
    fr: { title: "Massage sportif jambes", description: "Un massage sportif concentré de 30 minutes ciblant spécifiquement les jambes. Idéal pour les coureurs, cyclistes et athlètes, ce soin soulage la fatigue musculaire, améliore la circulation et accélère la récupération des membres inférieurs.", benefits: [{ title: "", description: "Soulagement ciblé de la fatigue des jambes" }, { title: "", description: "Améliore la circulation dans les membres inférieurs" }, { title: "", description: "Accélère la récupération après la course ou le vélo" }, { title: "", description: "Réduit le risque de crampes" }, { title: "", description: "Durée idéale de 30 minutes" }, { title: "", description: "Prévient les blessures aux jambes" }], targetAudience: [{ title: "", description: "Coureurs et joggers" }, { title: "", description: "Cyclistes" }, { title: "", description: "Footballeurs et sportifs d'équipe" }, { title: "", description: "Toute personne souffrant de jambes lourdes ou fatiguées" }], contentSections: [] },
    nl: { title: "Sportmassage benen", description: "Een geconcentreerde 30-minuten sportmassage specifiek gericht op de benen. Ideaal voor hardlopers, wielrenners en atleten, verlicht deze behandeling spiervermoeidheid, verbetert de circulatie en versnelt het herstel van de onderste ledematen.", benefits: [{ title: "", description: "Gerichte verlichting van vermoeide benen" }, { title: "", description: "Verbetert de circulatie in de onderste ledematen" }, { title: "", description: "Versnelt herstel na hardlopen of fietsen" }, { title: "", description: "Vermindert het risico op krampen" }, { title: "", description: "Ideale duur van 30 minuten" }, { title: "", description: "Voorkomt beenblessures" }], targetAudience: [{ title: "", description: "Hardlopers en joggers" }, { title: "", description: "Wielrenners" }, { title: "", description: "Voetballers en teamsporters" }, { title: "", description: "Iedereen met zware of vermoeide benen" }], contentSections: [] },
    de: { title: "Sportmassage Beine", description: "Eine konzentrierte 30-minütige Sportmassage, die speziell auf die Beine abzielt. Ideal für Läufer, Radfahrer und Sportler lindert diese Behandlung Muskelermüdung, verbessert die Durchblutung und beschleunigt die Erholung der unteren Extremitäten.", benefits: [{ title: "", description: "Gezielte Linderung müder Beine" }, { title: "", description: "Verbessert die Durchblutung der unteren Extremitäten" }, { title: "", description: "Beschleunigt die Erholung nach dem Laufen oder Radfahren" }, { title: "", description: "Reduziert das Risiko von Krämpfen" }, { title: "", description: "Ideale Dauer von 30 Minuten" }, { title: "", description: "Beugt Beinverletzungen vor" }], targetAudience: [{ title: "", description: "Läufer und Jogger" }, { title: "", description: "Radfahrer" }, { title: "", description: "Fußballer und Mannschaftssportler" }, { title: "", description: "Alle mit schweren oder müden Beinen" }], contentSections: [] },
    es: { title: "Masaje deportivo piernas", description: "Un masaje deportivo concentrado de 30 minutos enfocado específicamente en las piernas. Ideal para corredores, ciclistas y atletas, este tratamiento alivia la fatiga muscular, mejora la circulación y acelera la recuperación de las extremidades inferiores.", benefits: [{ title: "", description: "Alivio enfocado de piernas cansadas" }, { title: "", description: "Mejora la circulación en las extremidades inferiores" }, { title: "", description: "Acelera la recuperación después de correr o andar en bicicleta" }, { title: "", description: "Reduce el riesgo de calambres" }, { title: "", description: "Duración ideal de 30 minutos" }, { title: "", description: "Previene lesiones en las piernas" }], targetAudience: [{ title: "", description: "Corredores y joggers" }, { title: "", description: "Ciclistas" }, { title: "", description: "Futbolistas y deportistas de equipo" }, { title: "", description: "Cualquier persona con piernas pesadas o cansadas" }], contentSections: [] }
  },

  "Scrub + Zen Your Body": {
    fr: { title: "Gommage + Zen Your Body", description: "Un soin luxueux de 90 minutes qui commence par un gommage corporel revigorant pour exfolier et renouveler votre peau, suivi de notre massage signature Zen Your Body pour une relaxation complète. L'expérience bien-être ultime.", benefits: [{ title: "", description: "Exfoliation complète du corps pour une peau douce et renouvelée" }, { title: "", description: "Relaxation profonde du corps entier" }, { title: "", description: "Améliore l'absorption des produits de soin" }, { title: "", description: "Stimule la circulation sanguine" }, { title: "", description: "Expérience spa luxueuse de 90 minutes" }, { title: "", description: "Combine les bienfaits de deux soins en un" }], targetAudience: [{ title: "", description: "Personnes recherchant une expérience spa complète" }, { title: "", description: "Ceux qui souhaitent rajeunir leur peau" }, { title: "", description: "Idéal pour une occasion spéciale ou un cadeau" }, { title: "", description: "Personnes ayant besoin de détente profonde" }], contentSections: [] },
    nl: { title: "Scrub + Zen Your Body", description: "Een luxueuze 90 minuten durende behandeling die begint met een verkwikkende lichaamsscrub om uw huid te exfoliëren en te vernieuwen, gevolgd door onze kenmerkende Zen Your Body massage voor volledige ontspanning. De ultieme behandelervaring.", benefits: [{ title: "", description: "Volledige lichaamsexfoliatie voor zachte, vernieuwde huid" }, { title: "", description: "Diepe ontspanning van het hele lichaam" }, { title: "", description: "Verbetert de opname van verzorgingsproducten" }, { title: "", description: "Stimuleert de bloedcirculatie" }, { title: "", description: "Luxueuze spa-ervaring van 90 minuten" }, { title: "", description: "Combineert de voordelen van twee behandelingen in één" }], targetAudience: [{ title: "", description: "Mensen op zoek naar een complete spa-ervaring" }, { title: "", description: "Wie zijn huid wil verjongen" }, { title: "", description: "Ideaal voor een speciale gelegenheid of cadeau" }, { title: "", description: "Personen die diepe ontspanning nodig hebben" }], contentSections: [] },
    de: { title: "Peeling + Zen Your Body", description: "Eine luxuriöse 90-minütige Behandlung, die mit einem belebenden Ganzkörperpeeling beginnt, um Ihre Haut zu erneuern, gefolgt von unserer Signature Zen Your Body Massage für vollständige Entspannung. Das ultimative Behandlungserlebnis.", benefits: [{ title: "", description: "Ganzkörperpeeling für weiche, erneuerte Haut" }, { title: "", description: "Tiefe Ganzkörperentspannung" }, { title: "", description: "Verbessert die Aufnahme von Pflegeprodukten" }, { title: "", description: "Regt die Durchblutung an" }, { title: "", description: "Luxuriöses 90-Minuten-Spa-Erlebnis" }, { title: "", description: "Kombiniert die Vorteile von zwei Behandlungen in einer" }], targetAudience: [{ title: "", description: "Menschen, die ein komplettes Spa-Erlebnis suchen" }, { title: "", description: "Wer seine Haut verjüngen möchte" }, { title: "", description: "Ideal als besonderes Geschenk oder zu einem besonderen Anlass" }, { title: "", description: "Personen, die tiefe Entspannung brauchen" }], contentSections: [] },
    es: { title: "Exfoliación + Zen Your Body", description: "Un lujoso tratamiento de 90 minutos que comienza con una vigorizante exfoliación corporal para renovar tu piel, seguido de nuestro exclusivo masaje Zen Your Body para una relajación completa. La experiencia de bienestar definitiva.", benefits: [{ title: "", description: "Exfoliación corporal completa para una piel suave y renovada" }, { title: "", description: "Relajación profunda de cuerpo completo" }, { title: "", description: "Mejora la absorción de productos de cuidado" }, { title: "", description: "Estimula la circulación sanguínea" }, { title: "", description: "Lujosa experiencia spa de 90 minutos" }, { title: "", description: "Combina los beneficios de dos tratamientos en uno" }], targetAudience: [{ title: "", description: "Personas que buscan una experiencia spa completa" }, { title: "", description: "Quienes desean rejuvenecer su piel" }, { title: "", description: "Ideal para una ocasión especial o regalo" }, { title: "", description: "Personas que necesitan relajación profunda" }], contentSections: [] }
  },

  "Purifying": {
    fr: { title: "Purifiant", description: "Un soin du visage nettoyant en profondeur conçu pour détoxifier et clarifier votre peau. À l'aide de produits professionnels et de techniques spécialisées, ce soin élimine les impuretés, désobstrue les pores et rétablit la clarté naturelle de votre peau.", benefits: [{ title: "", description: "Nettoyage en profondeur et détoxification" }, { title: "", description: "Désobstrue les pores et prévient les imperfections" }, { title: "", description: "Élimine les impuretés et l'excès de sébum" }, { title: "", description: "Rétablit la clarté et l'éclat naturels" }, { title: "", description: "Apaise les inflammations et rougeurs" }, { title: "", description: "Convient aux peaux grasses et mixtes" }], targetAudience: [{ title: "", description: "Personnes ayant la peau grasse ou mixte" }, { title: "", description: "Personnes sujettes à l'acné ou aux imperfections" }, { title: "", description: "Peaux congestionnées ayant besoin de détoxification" }, { title: "", description: "Toute personne souhaitant un teint plus clair" }], contentSections: [] },
    nl: { title: "Zuiverend", description: "Een diep reinigende gezichtsbehandeling ontworpen om uw huid te ontgiften en te zuiveren. Met professionele producten en gespecialiseerde technieken verwijdert deze behandeling onzuiverheden, opent poriën en herstelt de natuurlijke helderheid van uw huid.", benefits: [{ title: "", description: "Diepe reiniging en ontgifting" }, { title: "", description: "Opent poriën en voorkomt onzuiverheden" }, { title: "", description: "Verwijdert onzuiverheden en overtollig talg" }, { title: "", description: "Herstelt natuurlijke helderheid en glans" }, { title: "", description: "Kalmeert ontstekingen en roodheid" }, { title: "", description: "Geschikt voor vette en gecombineerde huid" }], targetAudience: [{ title: "", description: "Mensen met een vette of gecombineerde huid" }, { title: "", description: "Personen die last hebben van acne of onzuiverheden" }, { title: "", description: "Verstopte huid die ontgifting nodig heeft" }, { title: "", description: "Iedereen die een helderdere teint wil" }], contentSections: [] },
    de: { title: "Reinigend", description: "Eine tiefenreinigende Gesichtsbehandlung zur Entgiftung und Klärung Ihrer Haut. Mit professionellen Produkten und spezialisierten Techniken entfernt diese Behandlung Unreinheiten, befreit die Poren und stellt die natürliche Klarheit Ihrer Haut wieder her.", benefits: [{ title: "", description: "Tiefenreinigung und Entgiftung" }, { title: "", description: "Befreit die Poren und beugt Unreinheiten vor" }, { title: "", description: "Entfernt Unreinheiten und überschüssigen Talg" }, { title: "", description: "Stellt natürliche Klarheit und Ausstrahlung wieder her" }, { title: "", description: "Beruhigt Entzündungen und Rötungen" }, { title: "", description: "Geeignet für fettige und Mischhaut" }], targetAudience: [{ title: "", description: "Menschen mit fettiger oder Mischhaut" }, { title: "", description: "Personen, die zu Akne oder Unreinheiten neigen" }, { title: "", description: "Verstopfte Haut, die Entgiftung braucht" }, { title: "", description: "Alle, die einen klareren Teint wünschen" }], contentSections: [] },
    es: { title: "Purificante", description: "Un tratamiento facial de limpieza profunda diseñado para desintoxicar y clarificar tu piel. Utilizando productos profesionales y técnicas especializadas, este tratamiento elimina impurezas, desobstruye los poros y restaura la claridad natural de tu piel.", benefits: [{ title: "", description: "Limpieza profunda y desintoxicación" }, { title: "", description: "Desobstruye los poros y previene imperfecciones" }, { title: "", description: "Elimina impurezas y exceso de sebo" }, { title: "", description: "Restaura la claridad y el brillo naturales" }, { title: "", description: "Calma inflamaciones y enrojecimientos" }, { title: "", description: "Apto para pieles grasas y mixtas" }], targetAudience: [{ title: "", description: "Personas con piel grasa o mixta" }, { title: "", description: "Personas propensas al acné o imperfecciones" }, { title: "", description: "Piel congestionada que necesita desintoxicación" }, { title: "", description: "Cualquiera que desee una tez más clara" }], contentSections: [] }
  },

  "Hydra+": {
    fr: { title: "Hydra+", description: "Un soin du visage hydratant intensif qui apporte une hydratation profonde aux peaux déshydratées. Utilisant une technologie d'hydratation avancée et des sérums riches, ce soin restaure l'équilibre hydrique de votre peau pour un teint repulpé, lisse et éclatant.", benefits: [{ title: "", description: "Hydratation profonde et durable" }, { title: "", description: "Restaure l'équilibre hydrique de la peau" }, { title: "", description: "Peau repulpée et revitalisée" }, { title: "", description: "Réduit les ridules de déshydratation" }, { title: "", description: "Protège la barrière cutanée" }, { title: "", description: "Éclat immédiat et longue durée" }], targetAudience: [{ title: "", description: "Peaux sèches et déshydratées" }, { title: "", description: "Personnes exposées aux conditions climatiques rudes" }, { title: "", description: "Peaux matures nécessitant plus d'hydratation" }, { title: "", description: "Toute personne souhaitant un teint frais et éclatant" }], contentSections: [] },
    nl: { title: "Hydra+", description: "Een intensief hydraterende gezichtsbehandeling die diepe vochtigheid brengt aan een uitgedroogde huid. Met geavanceerde hydratietechnologie en rijke serums herstelt deze behandeling de vochtbalans van uw huid voor een voller, gladder en stralender teint.", benefits: [{ title: "", description: "Diepe en langdurige hydratatie" }, { title: "", description: "Herstelt de vochtbalans van de huid" }, { title: "", description: "Volle en gerevitaliseerde huid" }, { title: "", description: "Vermindert fijne lijntjes door uitdroging" }, { title: "", description: "Beschermt de huidbarrière" }, { title: "", description: "Direct en langdurig stralend effect" }], targetAudience: [{ title: "", description: "Droge en gedehydrateerde huid" }, { title: "", description: "Mensen blootgesteld aan barre weersomstandigheden" }, { title: "", description: "Rijpere huid die meer hydratatie nodig heeft" }, { title: "", description: "Iedereen die een fris en stralend teint wil" }], contentSections: [] },
    de: { title: "Hydra+", description: "Eine intensiv feuchtigkeitsspendende Gesichtsbehandlung, die trockener Haut tiefe Feuchtigkeit spendet. Mit fortschrittlicher Hydratationstechnologie und reichhaltigen Seren stellt diese Behandlung den Feuchtigkeitshaushalt Ihrer Haut wieder her für einen pralleren, glatteren und strahlenderen Teint.", benefits: [{ title: "", description: "Tiefe und langanhaltende Feuchtigkeitsversorgung" }, { title: "", description: "Stellt den Feuchtigkeitshaushalt der Haut wieder her" }, { title: "", description: "Pralle und revitalisierte Haut" }, { title: "", description: "Reduziert feine Linien durch Austrocknung" }, { title: "", description: "Schützt die Hautbarriere" }, { title: "", description: "Sofortige und langanhaltende Ausstrahlung" }], targetAudience: [{ title: "", description: "Trockene und dehydrierte Haut" }, { title: "", description: "Menschen, die rauen Wetterbedingungen ausgesetzt sind" }, { title: "", description: "Reife Haut, die mehr Feuchtigkeit braucht" }, { title: "", description: "Alle, die einen frischen und strahlenden Teint wünschen" }], contentSections: [] },
    es: { title: "Hydra+", description: "Un tratamiento facial hidratante intensivo que aporta hidratación profunda a la piel deshidratada. Utilizando tecnología avanzada de hidratación y sueros ricos, este tratamiento restaura el equilibrio hídrico de tu piel para una tez más tersa, suave y radiante.", benefits: [{ title: "", description: "Hidratación profunda y duradera" }, { title: "", description: "Restaura el equilibrio hídrico de la piel" }, { title: "", description: "Piel tersa y revitalizada" }, { title: "", description: "Reduce las líneas finas por deshidratación" }, { title: "", description: "Protege la barrera cutánea" }, { title: "", description: "Brillo inmediato y duradero" }], targetAudience: [{ title: "", description: "Pieles secas y deshidratadas" }, { title: "", description: "Personas expuestas a condiciones climáticas adversas" }, { title: "", description: "Pieles maduras que necesitan más hidratación" }, { title: "", description: "Cualquiera que desee una tez fresca y radiante" }], contentSections: [] }
  },

  "Eyes Under": {
    fr: { title: "Eyeliner inférieur (Eyes Under)", description: "Maquillage permanent pour le dessous des yeux (ligne de cils inférieure). Cette technique de tatouage cosmétique semi-permanent définit subtilement vos yeux, créant un look naturel et soigné qui dure.", benefits: [{ title: "", description: "Définition subtile et naturelle des yeux" }, { title: "", description: "Pas besoin d'appliquer un eyeliner quotidiennement" }, { title: "", description: "Résistant à l'eau et à l'épreuve des larmes" }, { title: "", description: "Résultats longue durée" }, { title: "", description: "Look naturel et soigné" }, { title: "", description: "Renforce l'intensité du regard" }], targetAudience: [{ title: "", description: "Personnes souhaitant un regard défini sans maquillage quotidien" }, { title: "", description: "Personnes aux yeux sensibles ou larmoyants" }, { title: "", description: "Modes de vie actifs nécessitant un look durable" }, { title: "", description: "Quiconque désire sublimer son regard naturellement" }], contentSections: [] },
    nl: { title: "Eyeliner onder (Eyes Under)", description: "Permanente make-up voor onder de ogen (onderste wimperrand). Deze semi-permanente cosmetische tatoeagetechniek definieert subtiel uw ogen en creëert een natuurlijke, verzorgde look die lang meegaat.", benefits: [{ title: "", description: "Subtiele en natuurlijke oogdefinitie" }, { title: "", description: "Geen dagelijkse eyeliner meer nodig" }, { title: "", description: "Waterbestendig en traanbestendig" }, { title: "", description: "Langdurige resultaten" }, { title: "", description: "Natuurlijke, verzorgde look" }, { title: "", description: "Versterkt de intensiteit van de blik" }], targetAudience: [{ title: "", description: "Mensen die een gedefinieerde blik willen zonder dagelijkse make-up" }, { title: "", description: "Personen met gevoelige of tranende ogen" }, { title: "", description: "Actieve levensstijlen die een duurzame look vereisen" }, { title: "", description: "Iedereen die zijn blik op natuurlijke wijze wil benadrukken" }], contentSections: [] },
    de: { title: "Eyeliner unten (Eyes Under)", description: "Permanent Make-up für unter die Augen (untere Wimpernlinie). Diese semi-permanente kosmetische Tätowiertechnik definiert Ihre Augen subtil und schafft einen natürlichen, gepflegten Look, der lange hält.", benefits: [{ title: "", description: "Subtile und natürliche Augendefinition" }, { title: "", description: "Kein tägliches Eyeliner-Auftragen mehr nötig" }, { title: "", description: "Wasser- und tränenbeständig" }, { title: "", description: "Langanhaltende Ergebnisse" }, { title: "", description: "Natürlicher, gepflegter Look" }, { title: "", description: "Verstärkt die Intensität des Blicks" }], targetAudience: [{ title: "", description: "Menschen, die definierte Augen ohne tägliches Make-up wünschen" }, { title: "", description: "Personen mit empfindlichen oder tränenden Augen" }, { title: "", description: "Aktive Lebensstile, die einen dauerhaften Look erfordern" }, { title: "", description: "Alle, die ihren Blick auf natürliche Weise betonen möchten" }], contentSections: [] },
    es: { title: "Delineado inferior (Eyes Under)", description: "Maquillaje permanente para debajo de los ojos (línea de pestañas inferior). Esta técnica de tatuaje cosmético semipermanente define sutilmente tus ojos, creando un look natural y cuidado que perdura.", benefits: [{ title: "", description: "Definición sutil y natural de los ojos" }, { title: "", description: "Sin necesidad de aplicar delineador diariamente" }, { title: "", description: "Resistente al agua y a las lágrimas" }, { title: "", description: "Resultados de larga duración" }, { title: "", description: "Look natural y cuidado" }, { title: "", description: "Intensifica la mirada" }], targetAudience: [{ title: "", description: "Personas que desean ojos definidos sin maquillaje diario" }, { title: "", description: "Personas con ojos sensibles o llorosos" }, { title: "", description: "Estilos de vida activos que requieren un look duradero" }, { title: "", description: "Cualquiera que quiera realzar su mirada de forma natural" }], contentSections: [] }
  },

  "Eyes Upper": {
    fr: { title: "Eyeliner supérieur (Eyes Upper)", description: "Maquillage permanent pour les paupières supérieures (ligne de cils supérieure). Cette technique sophistiquée de tatouage cosmétique crée une ligne d'eyeliner élégante qui met en valeur vos yeux et leur donne un aspect naturellement défini.", benefits: [{ title: "", description: "Look d'eyeliner élégant et permanent" }, { title: "", description: "Gain de temps le matin" }, { title: "", description: "Résistant à l'eau toute la journée" }, { title: "", description: "Personnalisable selon votre style" }, { title: "", description: "Regard plus ouvert et défini" }, { title: "", description: "Résultats longue durée" }], targetAudience: [{ title: "", description: "Personnes qui appliquent un eyeliner quotidiennement" }, { title: "", description: "Personnes aux yeux sensibles" }, { title: "", description: "Professionnelles actives" }, { title: "", description: "Quiconque souhaite un regard plus défini" }], contentSections: [] },
    nl: { title: "Eyeliner boven (Eyes Upper)", description: "Permanente make-up voor de bovenste oogleden (bovenste wimperrand). Deze verfijnde cosmetische tatoeagetechniek creëert een elegante eyelinerlijn die uw ogen benadrukt en een natuurlijk gedefinieerd uiterlijk geeft.", benefits: [{ title: "", description: "Elegante en permanente eyeliner-look" }, { title: "", description: "Bespaart tijd 's ochtends" }, { title: "", description: "Waterbestendig de hele dag" }, { title: "", description: "Aanpasbaar aan uw stijl" }, { title: "", description: "Opener en gedefinieerder blik" }, { title: "", description: "Langdurige resultaten" }], targetAudience: [{ title: "", description: "Mensen die dagelijks eyeliner aanbrengen" }, { title: "", description: "Personen met gevoelige ogen" }, { title: "", description: "Actieve professionals" }, { title: "", description: "Iedereen die een meer gedefinieerde blik wil" }], contentSections: [] },
    de: { title: "Eyeliner oben (Eyes Upper)", description: "Permanent Make-up für die oberen Augenlider (obere Wimpernlinie). Diese raffinierte kosmetische Tätowiertechnik kreiert eine elegante Eyeliner-Linie, die Ihre Augen betont und ihnen ein natürlich definiertes Aussehen verleiht.", benefits: [{ title: "", description: "Eleganter und permanenter Eyeliner-Look" }, { title: "", description: "Spart morgens Zeit" }, { title: "", description: "Wasserfest den ganzen Tag" }, { title: "", description: "Anpassbar an Ihren Stil" }, { title: "", description: "Offenerer und definierterer Blick" }, { title: "", description: "Langanhaltende Ergebnisse" }], targetAudience: [{ title: "", description: "Menschen, die täglich Eyeliner auftragen" }, { title: "", description: "Personen mit empfindlichen Augen" }, { title: "", description: "Aktive Berufstätige" }, { title: "", description: "Alle, die einen definierteren Blick wünschen" }], contentSections: [] },
    es: { title: "Delineado superior (Eyes Upper)", description: "Maquillaje permanente para los párpados superiores (línea de pestañas superior). Esta sofisticada técnica de tatuaje cosmético crea una elegante línea de delineado que realza tus ojos y les da un aspecto naturalmente definido.", benefits: [{ title: "", description: "Look de delineado elegante y permanente" }, { title: "", description: "Ahorra tiempo por la mañana" }, { title: "", description: "Resistente al agua todo el día" }, { title: "", description: "Personalizable según tu estilo" }, { title: "", description: "Mirada más abierta y definida" }, { title: "", description: "Resultados de larga duración" }], targetAudience: [{ title: "", description: "Personas que aplican delineado diariamente" }, { title: "", description: "Personas con ojos sensibles" }, { title: "", description: "Profesionales activas" }, { title: "", description: "Cualquiera que desee una mirada más definida" }], contentSections: [] }
  },

  "Eyes Upper and Under": {
    fr: { title: "Eyeliner supérieur et inférieur", description: "Mise en valeur complète des yeux avec maquillage permanent pour les lignes de cils supérieure et inférieure. Ce soin complet encadre magnifiquement vos yeux pour un regard intense et naturel.", benefits: [{ title: "", description: "Mise en valeur complète du regard" }, { title: "", description: "Résultat harmonieux haut et bas" }, { title: "", description: "Gain de temps considérable au quotidien" }, { title: "", description: "Look naturel et sophistiqué" }, { title: "", description: "Résistant à l'eau et longue durée" }, { title: "", description: "Renforce l'intensité naturelle de votre regard" }], targetAudience: [{ title: "", description: "Personnes souhaitant une mise en valeur complète du regard" }, { title: "", description: "Personnes fatiguées d'appliquer un eyeliner quotidiennement" }, { title: "", description: "Personnes aux yeux sensibles ou larmoyants" }, { title: "", description: "Celles qui recherchent un look soigné permanent" }], contentSections: [] },
    nl: { title: "Eyeliner boven en onder", description: "Volledige oogverbetering met permanente make-up voor zowel de bovenste als onderste wimperrand. Deze uitgebreide behandeling omlijst uw ogen prachtig voor een intense en natuurlijke blik.", benefits: [{ title: "", description: "Volledige verbetering van de blik" }, { title: "", description: "Harmonieus resultaat boven en onder" }, { title: "", description: "Aanzienlijke tijdsbesparing dagelijks" }, { title: "", description: "Natuurlijke en verfijnde look" }, { title: "", description: "Waterbestendig en langdurig" }, { title: "", description: "Versterkt de natuurlijke intensiteit van uw blik" }], targetAudience: [{ title: "", description: "Mensen die volledige oogverbetering wensen" }, { title: "", description: "Personen die het moe zijn dagelijks eyeliner aan te brengen" }, { title: "", description: "Mensen met gevoelige of tranende ogen" }, { title: "", description: "Wie een permanent verzorgde look zoekt" }], contentSections: [] },
    de: { title: "Eyeliner oben und unten", description: "Komplette Augenbetonung mit Permanent Make-up für obere und untere Wimpernlinie. Diese umfassende Behandlung umrahmt Ihre Augen wunderschön für einen intensiven und natürlichen Blick.", benefits: [{ title: "", description: "Komplette Augenbetonung" }, { title: "", description: "Harmonisches Ergebnis oben und unten" }, { title: "", description: "Erhebliche tägliche Zeitersparnis" }, { title: "", description: "Natürlicher und eleganter Look" }, { title: "", description: "Wasserfest und langanhaltend" }, { title: "", description: "Verstärkt die natürliche Intensität Ihres Blicks" }], targetAudience: [{ title: "", description: "Menschen, die eine komplette Augenbetonung wünschen" }, { title: "", description: "Personen, die das tägliche Eyeliner-Auftragen satt haben" }, { title: "", description: "Menschen mit empfindlichen oder tränenden Augen" }, { title: "", description: "Wer einen dauerhaft gepflegten Look sucht" }], contentSections: [] },
    es: { title: "Delineado superior e inferior", description: "Realce completo de ojos con maquillaje permanente para líneas de pestañas superior e inferior. Este tratamiento integral enmarca bellamente tus ojos para una mirada intensa y natural.", benefits: [{ title: "", description: "Realce completo de la mirada" }, { title: "", description: "Resultado armonioso arriba y abajo" }, { title: "", description: "Ahorro de tiempo considerable diariamente" }, { title: "", description: "Look natural y sofisticado" }, { title: "", description: "Resistente al agua y de larga duración" }, { title: "", description: "Intensifica la expresividad natural de tu mirada" }], targetAudience: [{ title: "", description: "Personas que desean un realce completo de la mirada" }, { title: "", description: "Quienes están cansadas de aplicar delineado diariamente" }, { title: "", description: "Personas con ojos sensibles o llorosos" }, { title: "", description: "Quienes buscan un look cuidado permanente" }], contentSections: [] }
  },

  "Microblading Brows": {
    fr: { title: "Microblading sourcils", description: "Le microblading est une technique de tatouage semi-permanent des sourcils qui crée des traits naturels imitant les poils pour des sourcils plus fournis et mieux définis. Chaque trait est dessiné individuellement pour s'harmoniser avec la forme naturelle de votre visage.", benefits: [{ title: "", description: "Sourcils d'aspect naturel trait par trait" }, { title: "", description: "Résultats semi-permanents durant 1 à 3 ans" }, { title: "", description: "Personnalisé selon la forme de votre visage" }, { title: "", description: "Remplit les zones clairsemées naturellement" }, { title: "", description: "Pas besoin de se maquiller les sourcils quotidiennement" }, { title: "", description: "Résultat doux et naturel" }], targetAudience: [{ title: "", description: "Personnes avec des sourcils clairsemés ou asymétriques" }, { title: "", description: "Personnes ayant perdu leurs sourcils (alopécie, chimiothérapie)" }, { title: "", description: "Personnes souhaitant gagner du temps le matin" }, { title: "", description: "Quiconque désire des sourcils naturellement définis" }], contentSections: [] },
    nl: { title: "Microblading wenkbrauwen", description: "Microblading is een semi-permanente wenkbrauwtatoeagetechniek die natuurlijk ogende, haarachtige lijntjes creëert voor vollere, beter gedefinieerde wenkbrauwen. Elk lijntje wordt individueel getekend om te harmoniëren met uw natuurlijke gezichtsvorm.", benefits: [{ title: "", description: "Natuurlijk ogende wenkbrauwen lijn voor lijn" }, { title: "", description: "Semi-permanente resultaten die 1 tot 3 jaar meegaan" }, { title: "", description: "Aangepast aan uw gezichtsvorm" }, { title: "", description: "Vult dunne plekken op natuurlijke wijze op" }, { title: "", description: "Geen dagelijkse wenkbrauwmake-up meer nodig" }, { title: "", description: "Zacht en natuurlijk resultaat" }], targetAudience: [{ title: "", description: "Mensen met dunne of asymmetrische wenkbrauwen" }, { title: "", description: "Personen die hun wenkbrauwen hebben verloren (alopecia, chemotherapie)" }, { title: "", description: "Mensen die 's ochtends tijd willen besparen" }, { title: "", description: "Iedereen die natuurlijk gedefinieerde wenkbrauwen wil" }], contentSections: [] },
    de: { title: "Microblading Augenbrauen", description: "Microblading ist eine semi-permanente Augenbrauen-Tätowiertechnik, die natürlich aussehende, haarähnliche Striche für vollere, besser definierte Augenbrauen kreiert. Jeder Strich wird individuell gezeichnet, um mit Ihrer natürlichen Gesichtsform zu harmonieren.", benefits: [{ title: "", description: "Natürlich aussehende Augenbrauen Strich für Strich" }, { title: "", description: "Semi-permanente Ergebnisse, die 1 bis 3 Jahre halten" }, { title: "", description: "Angepasst an Ihre Gesichtsform" }, { title: "", description: "Füllt dünne Stellen natürlich auf" }, { title: "", description: "Kein tägliches Augenbrauen-Make-up mehr nötig" }, { title: "", description: "Weiches und natürliches Ergebnis" }], targetAudience: [{ title: "", description: "Menschen mit dünnen oder asymmetrischen Augenbrauen" }, { title: "", description: "Personen, die ihre Augenbrauen verloren haben (Alopezie, Chemotherapie)" }, { title: "", description: "Menschen, die morgens Zeit sparen möchten" }, { title: "", description: "Alle, die natürlich definierte Augenbrauen wünschen" }], contentSections: [] },
    es: { title: "Microblading cejas", description: "El microblading es una técnica de tatuaje de cejas semipermanente que crea trazos naturales similares al vello para unas cejas más pobladas y mejor definidas. Cada trazo se dibuja individualmente para armonizar con la forma natural de tu rostro.", benefits: [{ title: "", description: "Cejas de aspecto natural trazo a trazo" }, { title: "", description: "Resultados semipermanentes que duran de 1 a 3 años" }, { title: "", description: "Personalizado según la forma de tu rostro" }, { title: "", description: "Rellena zonas dispersas de forma natural" }, { title: "", description: "Sin necesidad de maquillar las cejas diariamente" }, { title: "", description: "Resultado suave y natural" }], targetAudience: [{ title: "", description: "Personas con cejas escasas o asimétricas" }, { title: "", description: "Personas que han perdido sus cejas (alopecia, quimioterapia)" }, { title: "", description: "Personas que quieren ahorrar tiempo por la mañana" }, { title: "", description: "Cualquiera que desee cejas naturalmente definidas" }], contentSections: [] }
  },

  "Refreshing": {
    fr: { title: "Refreshing (Retouche)", description: "Un soin de retouche conçu pour rafraîchir et entretenir votre maquillage permanent existant. Avec le temps, les pigments PMU s'estompent naturellement. Ce soin ravive la couleur, affine la forme et restaure la fraîcheur de votre maquillage permanent.", benefits: [{ title: "", description: "Ravive les pigments estompés" }, { title: "", description: "Affine et corrige la forme" }, { title: "", description: "Prolonge la durée de vie de votre PMU" }, { title: "", description: "Restaure la netteté et la définition" }, { title: "", description: "Entretien rapide et confortable" }, { title: "", description: "Résultat naturel et rafraîchi" }], targetAudience: [{ title: "", description: "Personnes ayant un PMU existant qui s'estompe" }, { title: "", description: "Clients revenant pour un entretien régulier" }, { title: "", description: "Personnes souhaitant ajuster la couleur ou la forme" }, { title: "", description: "Quiconque veut maintenir un look soigné" }], contentSections: [] },
    nl: { title: "Refreshing (Bijwerking)", description: "Een bijwerkbehandeling ontworpen om uw bestaande permanente make-up te verversen en te onderhouden. Na verloop van tijd vervagen PMU-pigmenten op natuurlijke wijze. Deze behandeling herleeft de kleur, verfijnt de vorm en herstelt de frisheid van uw permanente make-up.", benefits: [{ title: "", description: "Herleeft vervaagde pigmenten" }, { title: "", description: "Verfijnt en corrigeert de vorm" }, { title: "", description: "Verlengt de levensduur van uw PMU" }, { title: "", description: "Herstelt scherpte en definitie" }, { title: "", description: "Snel en comfortabel onderhoud" }, { title: "", description: "Natuurlijk en opgefrist resultaat" }], targetAudience: [{ title: "", description: "Mensen met bestaande PMU die vervaagt" }, { title: "", description: "Klanten die terugkomen voor regelmatig onderhoud" }, { title: "", description: "Personen die kleur of vorm willen aanpassen" }, { title: "", description: "Iedereen die een verzorgde look wil behouden" }], contentSections: [] },
    de: { title: "Refreshing (Auffrischung)", description: "Eine Auffrischungsbehandlung zur Erneuerung und Pflege Ihres bestehenden Permanent Make-ups. Mit der Zeit verblassen PMU-Pigmente natürlicherweise. Diese Behandlung belebt die Farbe, verfeinert die Form und stellt die Frische Ihres Permanent Make-ups wieder her.", benefits: [{ title: "", description: "Belebt verblasste Pigmente" }, { title: "", description: "Verfeinert und korrigiert die Form" }, { title: "", description: "Verlängert die Lebensdauer Ihres PMU" }, { title: "", description: "Stellt Schärfe und Definition wieder her" }, { title: "", description: "Schnelle und komfortable Pflege" }, { title: "", description: "Natürliches und aufgefrischtes Ergebnis" }], targetAudience: [{ title: "", description: "Personen mit bestehendem PMU, das verblasst" }, { title: "", description: "Kunden, die zur regelmäßigen Pflege zurückkehren" }, { title: "", description: "Personen, die Farbe oder Form anpassen möchten" }, { title: "", description: "Alle, die einen gepflegten Look beibehalten möchten" }], contentSections: [] },
    es: { title: "Refreshing (Retoque)", description: "Un tratamiento de retoque diseñado para refrescar y mantener tu maquillaje permanente existente. Con el tiempo, los pigmentos de PMU se desvanecen naturalmente. Este tratamiento reaviva el color, refina la forma y restaura la frescura de tu maquillaje permanente.", benefits: [{ title: "", description: "Reaviva pigmentos desvanecidos" }, { title: "", description: "Refina y corrige la forma" }, { title: "", description: "Prolonga la vida útil de tu PMU" }, { title: "", description: "Restaura la nitidez y definición" }, { title: "", description: "Mantenimiento rápido y cómodo" }, { title: "", description: "Resultado natural y refrescado" }], targetAudience: [{ title: "", description: "Personas con PMU existente que se desvanece" }, { title: "", description: "Clientes que regresan para mantenimiento regular" }, { title: "", description: "Personas que desean ajustar el color o la forma" }, { title: "", description: "Cualquiera que quiera mantener un look cuidado" }], contentSections: [] }
  }
};

async function updateTranslations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let updated = 0;
    let notFound = 0;

    for (const [title, langs] of Object.entries(translations)) {
      const service = await Service.findOne({ title: { $regex: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });

      if (!service) {
        console.log(`NOT FOUND: ${title}`);
        notFound++;
        continue;
      }

      const updateData = { translations: {} };

      for (const lang of ['fr', 'nl', 'de', 'es']) {
        if (langs[lang]) {
          updateData.translations[lang] = {
            title: langs[lang].title || service.title,
            description: langs[lang].description || service.description,
            benefits: langs[lang].benefits || [],
            targetAudience: langs[lang].targetAudience || [],
            contentSections: langs[lang].contentSections || []
          };
        }
      }

      await Service.findByIdAndUpdate(service._id, { $set: updateData });
      console.log(`UPDATED: ${title}`);
      updated++;
    }

    console.log(`\nDone! Updated: ${updated}, Not found: ${notFound}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateTranslations();
