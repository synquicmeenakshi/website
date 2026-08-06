const mongoose = require('mongoose');
const Service = require('./models/Service');
require('dotenv').config();

const services = [
  // MASSAGE SERVICES (from navbar dropdown)
  {
    title: "Zen Your Body",
    description: "A complete full-body massage designed to release tension, restore balance, and bring harmony to your entire being. Experience deep relaxation as skilled hands work through every muscle group.",
    category: "massage",
    duration: 60,
    price: 75,
    image: "m1.png",
    isActive: true,
    benefits: [
      { description: "Full body relaxation and stress relief" },
      { description: "Improved blood circulation throughout the body" },
      { description: "Release of muscle tension and knots" },
      { description: "Enhanced mental clarity and focus" },
      { description: "Better sleep quality" }
    ],
    targetAudience: [
      { description: "Anyone seeking complete relaxation" },
      { description: "People with high stress levels" },
      { description: "Those needing a mental reset" },
      { description: "Individuals with general muscle tension" }
    ]
  },
  {
    title: "Back & Neck",
    description: "You don't have much time, but you still want to enjoy a massage that melts away all your tension like snow in the sun... Then a back and neck massage is the ideal solution for you. In half an hour you will be reborn.",
    category: "massage",
    duration: 30,
    price: 55,
    image: "m2.png",
    isActive: true,
    contentSections: [
      { title: "Stress away in a jiffy", description: "You don't have much time, but you still want to enjoy a massage that melts away all your tension like snow in the sun... Then a back and neck massage is the ideal solution for you. In half an hour you will be reborn." },
      { title: "Also ideal after intensive sports or work", description: "Because tensions mainly occur in the neck, shoulders and back, we will only focus on these regions. With warm oil and adapted essential oils we get a spectacular result. Come and try it out. Also ideal after intensive sports or hard work." }
    ],
    benefits: [
      { description: "Quick tension relief in 30 minutes" },
      { description: "Focused treatment on problem areas" },
      { description: "Uses warm oil and essential oils" },
      { description: "Perfect for busy schedules" }
    ],
    targetAudience: [
      { description: "People with limited time who need quick relief" },
      { description: "Those with neck and shoulder tension" },
      { description: "Athletes after intensive sports sessions" },
      { description: "Workers after hard physical labor" }
    ]
  },
  {
    title: "Hopstempel",
    description: "A unique Belgian tradition using warm hop stamp compresses. The aromatic herbs release their soothing properties as they're pressed gently against your body, promoting deep relaxation.",
    category: "massage",
    duration: 75,
    price: 85,
    image: "m3.png",
    isActive: true,
    benefits: [
      { description: "Natural aromatherapy from Belgian hops" },
      { description: "Deep muscle relaxation" },
      { description: "Detoxification through herbal therapy" },
      { description: "Calming effect on the nervous system" },
      { description: "Improved skin texture from natural herbs" }
    ],
    targetAudience: [
      { description: "Lovers of traditional therapies" },
      { description: "Those seeking natural healing methods" },
      { description: "People interested in herbal treatments" },
      { description: "Anyone wanting a unique spa experience" }
    ]
  },
  {
    title: "Detox",
    description: "A purifying massage therapy designed to stimulate your lymphatic system and help eliminate toxins from your body. Feel refreshed, lighter, and rejuvenated after this cleansing treatment.",
    category: "massage",
    duration: 60,
    price: 70,
    image: "m4.png",
    isActive: true,
    benefits: [
      { description: "Stimulates lymphatic drainage" },
      { description: "Helps eliminate toxins from the body" },
      { description: "Reduces water retention and bloating" },
      { description: "Boosts immune system function" },
      { description: "Increases energy levels" }
    ],
    targetAudience: [
      { description: "Those looking to cleanse their body" },
      { description: "People with sluggish lymphatic systems" },
      { description: "Individuals wanting to boost immunity" },
      { description: "Anyone feeling bloated or heavy" }
    ]
  },
  {
    title: "Hotstone",
    description: "Ancient massage therapy using heated basalt stones. The name says it all - a hot stone massage that has been used by the Incas, Indians, Chinese and many other cultures for centuries to prevent and treat diseases and disorders.",
    category: "massage",
    duration: 60,
    price: 85,
    image: "m5.png",
    isActive: true,
    contentSections: [
      { title: "Energy points", description: "We work with basalt stones, which retain heat and energy for a long time and slowly pass it on to the body. The stones are placed on acupuncture points and energy points and ironed over the meridians, bringing the energy of body and mind into harmony." },
      { title: "Other massage than with hands", description: "To relax, stones are placed on you to help your body get used to the heat. Then the body is smeared with oil to make the stones glide over the skin. Through the combination of massage and heat, your muscles are massaged differently than just with your hands." },
      { title: "Self-healing of the body", description: "A hot stone massage contributes to the self-healing of the body, stimulates the organs and blood circulation and contributes to detoxification." }
    ],
    benefits: [
      { description: "Deep muscle relaxation with heated stones" },
      { description: "Improved blood circulation" },
      { description: "Body and mind harmony" },
      { description: "Natural detoxification" }
    ],
    targetAudience: [
      { description: "Ideal for stress, tension, and blockages" },
      { description: "Those suffering from rheumatism or osteoarthritis" },
      { description: "People with poor circulation" },
      { description: "Anyone wanting to purely enjoy deep relaxation" }
    ],
    serviceImages: [
      { url: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800", caption: "Hot stone placement on back" },
      { url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800", caption: "Relaxing hot stone therapy" },
      { url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800", caption: "Traditional basalt stones" }
    ]
  },
  {
    title: "Sports Massage",
    description: "Specifically designed for athletes and active individuals. This therapeutic massage targets muscle groups used in your sport or fitness routine, helping with recovery, flexibility, and performance.",
    category: "massage",
    duration: 60,
    price: 70,
    image: "m6.png",
    isActive: true,
    benefits: [
      { description: "Faster muscle recovery after workouts" },
      { description: "Increased flexibility and range of motion" },
      { description: "Prevention of sports-related injuries" },
      { description: "Reduced muscle soreness and fatigue" },
      { description: "Enhanced athletic performance" }
    ],
    targetAudience: [
      { description: "Professional and amateur athletes" },
      { description: "Fitness enthusiasts and gym-goers" },
      { description: "Runners, cyclists, and swimmers" },
      { description: "Anyone recovering from physical activity" }
    ]
  },
  {
    title: "Reflexology",
    description: "Target pressure points on your feet to release blockages, improve energy flow and enhance overall health and well-being. This ancient healing art treats the whole body through the feet.",
    category: "massage",
    duration: 45,
    price: 55,
    image: "m7.png",
    isActive: true,
    benefits: [
      { description: "Stimulates nerve function and energy" },
      { description: "Relieves tension and promotes relaxation" },
      { description: "Improves circulation throughout the body" },
      { description: "Helps with headaches and migraines" },
      { description: "Promotes natural healing" }
    ],
    targetAudience: [
      { description: "Those seeking holistic healing" },
      { description: "People with chronic fatigue" },
      { description: "Individuals with circulation issues" },
      { description: "Anyone interested in alternative therapies" }
    ]
  },

  // FACIAL CARE SERVICES (from navbar dropdown)
  {
    title: "Zen Facial Mini",
    description: "A quick yet effective facial treatment perfect for those on the go. Experience essential cleansing, toning, and hydration in a compact session that leaves your skin refreshed and glowing.",
    category: "facial",
    duration: 30,
    price: 45,
    image: "m8.png",
    isActive: true,
    benefits: [
      { description: "Quick refresh for busy schedules" },
      { description: "Deep cleansing and pore refinement" },
      { description: "Instant hydration boost" },
      { description: "Improved skin radiance" },
      { description: "Perfect maintenance between full treatments" }
    ],
    targetAudience: [
      { description: "Busy professionals with limited time" },
      { description: "Those maintaining their skincare routine" },
      { description: "First-time facial clients" },
      { description: "Anyone needing a quick skin pick-me-up" }
    ]
  },
  {
    title: "Sultane of Saba Cleopatra",
    description: "Inspired by the legendary beauty rituals of Queen Cleopatra. This luxurious facial uses precious oils and ancient Egyptian techniques to deliver radiant, youthful skin fit for royalty.",
    category: "facial",
    duration: 75,
    price: 95,
    image: "m9.png",
    isActive: true,
    benefits: [
      { description: "Luxurious royal beauty treatment" },
      { description: "Deep nourishment with precious oils" },
      { description: "Anti-aging and skin rejuvenation" },
      { description: "Improved skin elasticity and firmness" },
      { description: "Radiant, glowing complexion" }
    ],
    targetAudience: [
      { description: "Those seeking luxury skincare experiences" },
      { description: "Mature skin needing rejuvenation" },
      { description: "Special occasion preparation" },
      { description: "Anyone wanting to feel pampered like royalty" }
    ]
  },
  {
    title: "Soldiers of Sand Magic Gold",
    description: "An exclusive facial treatment infused with 24-karat gold particles. This premium therapy stimulates cellular renewal, reduces fine lines, and gives your skin a luminous, golden glow.",
    category: "facial",
    duration: 90,
    price: 120,
    image: "m1.png",
    isActive: true,
    benefits: [
      { description: "24-karat gold infusion for luxury skincare" },
      { description: "Stimulates collagen production" },
      { description: "Reduces appearance of fine lines" },
      { description: "Brightens and evens skin tone" },
      { description: "Long-lasting luminous glow" }
    ],
    targetAudience: [
      { description: "Those wanting premium anti-aging treatment" },
      { description: "Special event preparation" },
      { description: "Luxury skincare enthusiasts" },
      { description: "Anyone seeking visible skin transformation" }
    ]
  },
  {
    title: "Anti-Aging",
    description: "Combat the signs of aging with this specialized facial treatment. Using advanced techniques and powerful ingredients, we target wrinkles, loss of firmness, and dull skin to restore youthful vitality.",
    category: "facial",
    duration: 60,
    price: 85,
    image: "m2.png",
    isActive: true,
    benefits: [
      { description: "Reduces appearance of wrinkles and fine lines" },
      { description: "Improves skin firmness and elasticity" },
      { description: "Stimulates collagen production" },
      { description: "Evens skin tone and texture" },
      { description: "Restores youthful radiance" }
    ],
    targetAudience: [
      { description: "Those concerned about signs of aging" },
      { description: "Mature skin types" },
      { description: "Anyone wanting preventive anti-aging care" },
      { description: "People seeking firmer, younger-looking skin" }
    ]
  },
  {
    title: "Targeted Peeling",
    description: "A professional chemical peel tailored to your specific skin concerns. This treatment removes dead skin cells, unclogs pores, and reveals fresh, smooth skin underneath for a renewed complexion.",
    category: "facial",
    duration: 45,
    price: 65,
    image: "m3.png",
    isActive: true,
    benefits: [
      { description: "Deep exfoliation and skin renewal" },
      { description: "Reduces acne scars and hyperpigmentation" },
      { description: "Unclogs pores and prevents breakouts" },
      { description: "Smoother, more even skin texture" },
      { description: "Stimulates new cell growth" }
    ],
    targetAudience: [
      { description: "Those with uneven skin texture" },
      { description: "People dealing with acne scars" },
      { description: "Anyone with hyperpigmentation concerns" },
      { description: "Those wanting deep skin renewal" }
    ]
  },

  // Additional PMU service
  {
    title: "Permanent Make-Up (PMU)",
    description: "Micropigmentation and permanent makeup are pigmentation methods that incorporate natural pigments into the skin. Wake up with perfect brows, lips, or eyeliner every day.",
    category: "pmu",
    duration: 120,
    price: 250,
    image: "m4.png",
    isActive: true,
    benefits: [
      { description: "Long-lasting makeup solution" },
      { description: "Saves time on daily makeup routine" },
      { description: "Natural-looking enhancement" },
      { description: "Waterproof and smudge-proof" },
      { description: "Customized to your features" }
    ],
    targetAudience: [
      { description: "Busy professionals" },
      { description: "Those with makeup allergies" },
      { description: "Active lifestyle individuals" },
      { description: "Anyone wanting effortless beauty" }
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');

    // Clear existing services
    await Service.deleteMany({});
    console.log('🗑️  Cleared existing services');

    // Insert new services
    const createdServices = await Service.insertMany(services);
    console.log(`✅ ${createdServices.length} services seeded successfully`);

    console.log('\n📋 Seeded Services:');
    createdServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.title} (${service.category}) - €${service.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
