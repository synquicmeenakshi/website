const FAQ = require('../models/FAQ');
const { autoTranslateFAQ } = require('../services/autoTranslateService');

const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'nl', 'es'];

// Helper function to get translated FAQ from stored translations
const getTranslatedFAQ = (faq, lang) => {
  const faqObj = faq.toObject();

  // If language is English or translations don't exist, return original
  if (lang === 'en' || !faqObj.translations || !faqObj.translations[lang]) {
    return faqObj;
  }

  const translation = faqObj.translations[lang];

  // Return FAQ with translated fields, falling back to original if translation is missing
  return {
    ...faqObj,
    question: translation.question || faqObj.question,
    answer: translation.answer || faqObj.answer
  };
};

// Get all active FAQs (with optional translation from DB)
exports.getAllFAQs = async (req, res) => {
  try {
    const { category, lang = 'en' } = req.query;
    console.log(`📖 [DB READ] Fetching FAQs for category: ${category}, language: ${lang}`);

    // Build query
    const query = { isActive: true };
    if (category) {
      query.category = category;
    }

    const faqs = await FAQ.find(query).sort({ displayOrder: 1, createdAt: -1 });

    // If language is English or not supported, return original data
    if (lang === 'en' || !SUPPORTED_LANGUAGES.includes(lang)) {
      console.log(`📖 [DB READ] Returning ${faqs.length} FAQs in English (original)`);
      return res.status(200).json({
        success: true,
        count: faqs.length,
        data: faqs,
        language: 'en'
      });
    }

    // Get translated FAQs from stored translations in DB
    let translatedCount = 0;
    const translatedFAQs = faqs.map(faq => {
      const result = getTranslatedFAQ(faq, lang);
      if (faq.translations?.[lang]?.question) translatedCount++;
      return result;
    });

    console.log(`📖 [DB READ] Returning ${faqs.length} FAQs in ${lang} (${translatedCount} translated from DB, ${faqs.length - translatedCount} no translation stored)`);

    res.status(200).json({
      success: true,
      count: translatedFAQs.length,
      data: translatedFAQs,
      language: lang
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQs',
      error: error.message
    });
  }
};

// Get all FAQs (including inactive - for admin)
exports.getAllFAQsAdmin = async (req, res) => {
  try {
    const { category } = req.query;

    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }

    const faqs = await FAQ.find(query).sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQs',
      error: error.message
    });
  }
};

// Get single FAQ by ID
exports.getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      data: faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQ',
      error: error.message
    });
  }
};

// Create new FAQ
exports.createFAQ = async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating FAQ',
      error: error.message
    });
  }
};

// Update FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating FAQ',
      error: error.message
    });
  }
};

// Trigger auto-translation for a FAQ (Admin only - explicit action)
exports.translateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    const translations = await autoTranslateFAQ(faq.toObject());

    const updated = await FAQ.findByIdAndUpdate(
      req.params.id,
      { translations },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'FAQ translated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error translating FAQ',
      error: error.message
    });
  }
};

// Delete FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting FAQ',
      error: error.message
    });
  }
};

// Bulk update FAQ display order
exports.updateFAQOrder = async (req, res) => {
  try {
    const { faqs } = req.body; // Array of { id, displayOrder }

    // Update all FAQs in parallel
    const updatePromises = faqs.map(({ id, displayOrder }) =>
      FAQ.findByIdAndUpdate(id, { displayOrder }, { new: true })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'FAQ order updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating FAQ order',
      error: error.message
    });
  }
};

// Seed FAQs with initial data
exports.seedFAQs = async (req, res) => {
  try {
    const existingCount = await FAQ.countDocuments();

    if (existingCount > 0) {
      return res.status(200).json({
        success: true,
        message: 'FAQs already exist',
        count: existingCount
      });
    }

    const massageFAQs = [
      {
        question: "What types of massages do you offer?",
        answer: "We offer a wide range of therapeutic massages including Swedish, deep tissue, hot stone, sports massage, reflexology, and specialty treatments like our signature Hopstempel massage using Belgian hops.",
        category: 'massage',
        displayOrder: 0
      },
      {
        question: "How long do the massage sessions last?",
        answer: "Our sessions range from 30 minutes to 90 minutes depending on the treatment type. Quick treatments like Back & Neck are 30 minutes, while full body massages typically last 60-90 minutes.",
        category: 'massage',
        displayOrder: 1
      },
      {
        question: "Do I need to book in advance?",
        answer: "Yes, we recommend booking in advance to ensure availability, especially for weekends and popular time slots. You can easily book online through our website or call us directly.",
        category: 'massage',
        displayOrder: 2
      },
      {
        question: "What should I expect during my first visit?",
        answer: "During your first visit, we'll discuss your health history, preferences, and any specific areas of concern. Our therapists will customize the treatment to your needs and ensure you're comfortable throughout the session.",
        category: 'massage',
        displayOrder: 3
      }
    ];

    const rentalFAQs = [
      {
        question: "What's included in each rental?",
        answer: "Each rental includes fully furnished accommodation with kitchen appliances, linens, towels, WiFi, and utilities. Some properties may also include parking and access to shared amenities.",
        category: 'rental',
        displayOrder: 0
      },
      {
        question: "How far are the rentals from Lanzarote's main attractions?",
        answer: "It depends on where you book. Coastal homes are minutes from beaches, while countryside stays sit close to volcanic trails and nature spots. Each listing includes an exact map and distance highlights so you know exactly what you're getting into.",
        category: 'rental',
        displayOrder: 1
      },
      {
        question: "Is early check-in or late check-out possible?",
        answer: "Early check-in and late check-out are subject to availability and may incur additional charges. Please contact us in advance to arrange special timing for your stay.",
        category: 'rental',
        displayOrder: 2
      },
      {
        question: "Are the rentals suitable for families or groups?",
        answer: "Yes! We offer a variety of properties that accommodate different group sizes, from cozy studios to spacious villas perfect for families and large groups.",
        category: 'rental',
        displayOrder: 3
      }
    ];

    const allFAQs = [...massageFAQs, ...rentalFAQs];

    // Auto-translate each FAQ before inserting
    const translatedFAQs = [];
    for (const faq of allFAQs) {
      const translations = await autoTranslateFAQ(faq);
      translatedFAQs.push({
        ...faq,
        translations
      });
    }

    await FAQ.insertMany(translatedFAQs);

    res.status(201).json({
      success: true,
      message: `Seeded ${translatedFAQs.length} FAQs with translations`,
      count: translatedFAQs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error seeding FAQs',
      error: error.message
    });
  }
};
