const Testimonial = require('../models/Testimonial');
const { autoTranslateTestimonial } = require('../services/autoTranslateService');

const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'nl', 'es'];

// Helper function to get translated testimonial from stored translations
const getTranslatedTestimonial = (testimonial, lang) => {
  const testimonialObj = testimonial.toObject();

  // If language is English or translations don't exist, return original
  if (lang === 'en' || !testimonialObj.translations || !testimonialObj.translations[lang]) {
    return testimonialObj;
  }

  const translation = testimonialObj.translations[lang];

  // Return testimonial with translated fields, falling back to original if translation is missing
  return {
    ...testimonialObj,
    text: translation.text || testimonialObj.text,
    role: translation.role || testimonialObj.role
  };
};

// Get all active testimonials (with optional translation from DB and property filtering)
exports.getAllTestimonials = async (req, res) => {
  try {
    const { lang = 'en', propertyId, propertyName, category } = req.query;
    console.log(`📖 [DB READ] Fetching testimonials for language: ${lang}, propertyId: ${propertyId || 'all'}, propertyName: ${propertyName || 'all'}, category: ${category || 'all'}`);

    // Build filter query
    const filter = { isActive: true };
    if (category) {
      filter.category = category;
    } else if (propertyId) {
      filter.propertyId = propertyId;
    } else if (propertyName) {
      filter.propertyName = new RegExp(propertyName, 'i');
    }

    const testimonials = await Testimonial.find(filter).sort({ displayOrder: 1, createdAt: -1 });

    // If language is English or not supported, return original data
    if (lang === 'en' || !SUPPORTED_LANGUAGES.includes(lang)) {
      console.log(`📖 [DB READ] Returning ${testimonials.length} testimonials in English (original)`);
      return res.status(200).json({
        success: true,
        count: testimonials.length,
        data: testimonials,
        language: 'en'
      });
    }

    // Get translated testimonials from stored translations in DB
    let translatedCount = 0;
    const translatedTestimonials = testimonials.map(testimonial => {
      const result = getTranslatedTestimonial(testimonial, lang);
      if (testimonial.translations?.[lang]?.text) translatedCount++;
      return result;
    });

    console.log(`📖 [DB READ] Returning ${testimonials.length} testimonials in ${lang} (${translatedCount} translated from DB, ${testimonials.length - translatedCount} no translation stored)`);

    res.status(200).json({
      success: true,
      count: translatedTestimonials.length,
      data: translatedTestimonials,
      language: lang
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonials',
      error: error.message
    });
  }
};

// Get all testimonials (including inactive - for admin, with optional property filtering)
exports.getAllTestimonialsAdmin = async (req, res) => {
  try {
    const { propertyId, propertyName, category } = req.query;

    // Build filter query
    const filter = {};
    if (category) {
      filter.category = category;
    } else if (propertyId) {
      filter.propertyId = propertyId;
    } else if (propertyName) {
      filter.propertyName = new RegExp(propertyName, 'i');
    }

    const testimonials = await Testimonial.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonials',
      error: error.message
    });
  }
};

// Get single testimonial by ID
exports.getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonial',
      error: error.message
    });
  }
};

// Create new testimonial
exports.createTestimonial = async (req, res) => {
  try {
    // Sanitize propertyId - convert empty string to null (Mongoose can't cast '' to ObjectId)
    if (req.body.propertyId === '' || req.body.propertyId === undefined) {
      req.body.propertyId = null;
    }

    const testimonial = await Testimonial.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating testimonial',
      error: error.message
    });
  }
};

// Update testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    // Sanitize propertyId - convert empty string to null (Mongoose can't cast '' to ObjectId)
    if (req.body.propertyId === '' || req.body.propertyId === undefined) {
      req.body.propertyId = null;
    }

    // Remove immutable/internal fields that shouldn't be in the update
    delete req.body._id;
    delete req.body.__v;
    delete req.body.createdAt;
    delete req.body.updatedAt;

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial
    });
  } catch (error) {
    console.error('[Testimonial Update] Error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating testimonial',
      error: error.message
    });
  }
};

// Trigger auto-translation for a testimonial (Admin only - explicit action)
exports.translateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    const translations = await autoTranslateTestimonial(testimonial.toObject());

    const updated = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { translations },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Testimonial translated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error translating testimonial',
      error: error.message
    });
  }
};

// Delete testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting testimonial',
      error: error.message
    });
  }
};

// Seed default testimonials
exports.seedTestimonials = async (req, res) => {
  try {
    console.log('[Seed] Starting testimonial seed process...');

    // Delete all existing testimonials first
    const deleteResult = await Testimonial.deleteMany({});
    console.log(`[Seed] Deleted ${deleteResult.deletedCount} existing testimonials`);

    const existingCount = await Testimonial.countDocuments();
    console.log(`[Seed] Existing testimonials count after deletion: ${existingCount}`);

    const defaultTestimonials = [
      // Massage testimonials
      {
        name: "Maria Rodriguez",
        role: "@maria_m",
        text: "The best massage experience I've ever had! The therapist was incredibly skilled and the atmosphere was so relaxing. I left feeling completely rejuvenated!",
        photo: "profile1.png",
        displayOrder: 0,
        propertyId: null,
        propertyName: '',
        category: 'massage',
        isActive: true,
        rating: 5,
        photoUrl: ''
      },
      {
        name: "James Wilson",
        role: "@jameswilson",
        text: "Outstanding service! The deep tissue massage was exactly what I needed after a week of hiking. Professional, clean, and very relaxing environment.",
        photo: "profile2.png",
        displayOrder: 1,
        propertyId: null,
        propertyName: '',
        category: 'massage',
        isActive: true,
        rating: 5,
        photoUrl: ''
      },
      {
        name: "Sophie Laurent",
        role: "@sophie_relax",
        text: "Absolutely wonderful! The hot stone massage was divine. The therapist really understood my needs and created a perfect relaxing experience.",
        photo: "profile3.png",
        displayOrder: 2,
        propertyId: null,
        propertyName: '',
        category: 'massage',
        isActive: true,
        rating: 5,
        photoUrl: ''
      },
      {
        name: "Carlos Mendez",
        role: "@carlos_fit",
        text: "Professional massage therapy at its finest! Great technique, peaceful ambiance, and excellent customer service. Highly recommend!",
        photo: "profile4.png",
        displayOrder: 3,
        propertyId: null,
        propertyName: '',
        category: 'massage',
        isActive: true,
        rating: 5,
        photoUrl: ''
      },
      // Villa Zen Your Life testimonials
      {
        name: "Sarah Miller",
        role: "@sarahmiller",
        text: "Villa Zen Your Life is absolutely stunning! The panoramic views of the volcanic landscape took our breath away. Perfect for families!",
        photo: "profile1.png",
        displayOrder: 0,
        propertyId: null,
        propertyName: 'Villa Zen Your Life',
        category: 'rental',
        isActive: true,
        rating: 5,
        photoUrl: ''
      },
      {
        name: "David Thompson",
        role: "@david_explorer",
        text: "Best villa experience ever! Modern amenities, spacious rooms, and the private pool was amazing. Close to all the best beaches in Lanzarote!",
        photo: "profile2.png",
        displayOrder: 1,
        propertyId: null,
        propertyName: 'Villa Zen Your Life',
        category: 'rental',
        isActive: true,
        rating: 5,
        photoUrl: ''
      },
      {
        name: "Emma Williams",
        role: "@emmawanders",
        text: "Villa Zen exceeded every expectation! The terrace is perfect for sunset dinners. Immaculate, luxurious, and the perfect Lanzarote getaway!",
        photo: "profile3.png",
        displayOrder: 2,
        propertyId: null,
        propertyName: 'Villa Zen Your Life',
        category: 'rental',
        isActive: true,
        rating: 5,
        photoUrl: ''
      },
      {
        name: "Robert Garcia",
        role: "@robertg_travel",
        text: "The villa is a dream come true! Contemporary design meets island charm. Everything was spotless and the location couldn't be better!",
        photo: "profile4.png",
        displayOrder: 3,
        propertyId: null,
        propertyName: 'Villa Zen Your Life',
        category: 'rental',
        isActive: true,
        rating: 5,
        photoUrl: ''
      },
      // Casa Artevista testimonials
      {
        name: "Isabella Martinez",
        role: "@bella_travels",
        text: "Casa Artevista is pure magic! The artistic design and ocean views create such a peaceful atmosphere. Perfect romantic retreat!",
        photo: "profile1.png",
        displayOrder: 0,
        propertyId: null,
        propertyName: 'Casa Artevista',
        category: 'rental',
        isActive: true,
        rating: 5,
        photoUrl: ''
      },
      {
        name: "Michael Anderson",
        role: "@mike_adventures",
        text: "We loved every moment at Casa Artevista! The unique artistic touches and stunning sunsets made this stay unforgettable. Highly recommend!",
        photo: "profile2.png",
        displayOrder: 1,
        propertyId: null,
        propertyName: 'Casa Artevista',
        category: 'rental',
        isActive: true,
        rating: 5,
        photoUrl: ''
      },
      {
        name: "Sophia Chen",
        role: "@sophiachen",
        text: "Casa Artevista is a masterpiece! Every corner tells a story. The perfect blend of art, comfort, and island beauty. Can't wait to return!",
        photo: "profile3.png",
        displayOrder: 2,
        propertyId: null,
        propertyName: 'Casa Artevista',
        category: 'rental',
        isActive: true,
        rating: 5,
        photoUrl: ''
      },
      {
        name: "Thomas Brown",
        role: "@thomasb_vacation",
        text: "Absolutely phenomenal stay at Casa Artevista! The property is gorgeous, the views are breathtaking, and the artistic vibe is incredible!",
        photo: "profile4.png",
        displayOrder: 3,
        propertyId: null,
        propertyName: 'Casa Artevista',
        category: 'rental',
        isActive: true,
        rating: 5,
        photoUrl: ''
      }
    ];

    // Use insertMany to bypass the auto-translation middleware
    console.log(`[Seed] Attempting to insert ${defaultTestimonials.length} testimonials...`);
    const result = await Testimonial.insertMany(defaultTestimonials);
    console.log(`[Seed] Successfully inserted ${result.length} testimonials`);

    res.status(201).json({
      success: true,
      message: `Seeded ${defaultTestimonials.length} testimonials`,
      count: defaultTestimonials.length
    });
  } catch (error) {
    console.error('[Seed] Error seeding testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding testimonials',
      error: error.message,
      details: error.toString()
    });
  }
};
