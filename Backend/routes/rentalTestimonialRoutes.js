const express = require('express');
const router = express.Router();
const RentalTestimonial = require('../models/RentalTestimonial');
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

// Default testimonials data for seeding
const defaultTestimonials = [
  {
    name: "Dave Nash",
    role: "@once",
    text: "After exploring the @Kundkund platform for a few months, I finally took the plunge. Wow, it's a game changer! Just give it a shot! You won't regret it!",
    photo: "profile1.png",
    rating: 5,
    isActive: true,
    displayOrder: 0
  },
  {
    name: "Sebas",
    role: "@sebasbedoya",
    text: "Once you start using @Kundkund, there's no going back. It has completely transformed my approach to finance. Analyzing IPOs and comparing brokers has never been easier!",
    photo: "profile2.png",
    rating: 5,
    isActive: true,
    displayOrder: 1
  },
  {
    name: "Dylan Pearson",
    role: "@dylanbusiness",
    text: "Kundkund - The Tesla of financial services. A brief consultation with their expert nearly doubled my investment returns. Just imagine what their platform can do for you!",
    photo: "profile1.png",
    rating: 5,
    isActive: true,
    displayOrder: 2
  },
  {
    name: "Piero Madu",
    role: "@pieromadu",
    text: "@Kundkund has revolutionized my investment strategy. Utilizing their services is essential for maximizing returns and navigating the complexities of finance!",
    photo: "profile3.png",
    rating: 5,
    isActive: true,
    displayOrder: 3
  },
  {
    name: "George Klein",
    role: "@GeorgeBlue94",
    text: "Kundkund is the culmination of a year's work and contributions from many experts. Financial analysis is here to stay. Kundkund is the future of finance!",
    photo: "profile4.png",
    rating: 5,
    isActive: true,
    displayOrder: 4
  },
  {
    name: "Jordan Welch",
    role: "@jrdn.w",
    text: "I was part of the beta launch... absolutely mind-blowing. Managing my investments has never been easier. @Kundkund is by far my go-to platform",
    photo: "profile2.png",
    rating: 5,
    isActive: true,
    displayOrder: 5
  },
  {
    name: "Faiz W",
    role: "@Faiz",
    text: "Incredible! @Kundkund elevates your financial game. My investment portfolio grew by 15% in no time!",
    photo: "profile3.png",
    rating: 5,
    isActive: true,
    displayOrder: 6
  },
  {
    name: "Sarah Johnson",
    role: "@sarahj",
    text: "The rental experience was seamless from start to finish. Highly recommend their properties for anyone looking for a peaceful retreat!",
    photo: "profile4.png",
    rating: 5,
    isActive: true,
    displayOrder: 7
  }
];

// GET all active testimonials (public, with optional translation from DB)
router.get('/', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const testimonials = await RentalTestimonial.find({ isActive: true })
      .sort({ displayOrder: 1 });

    // If language is English or not supported, return original data
    if (lang === 'en' || !SUPPORTED_LANGUAGES.includes(lang)) {
      return res.json({ success: true, data: testimonials, language: 'en' });
    }

    // Get translated testimonials from stored translations in DB
    const translatedTestimonials = testimonials.map(testimonial =>
      getTranslatedTestimonial(testimonial, lang)
    );

    res.json({ success: true, data: translatedTestimonials, language: lang });
  } catch (error) {
    console.error('Error fetching rental testimonials:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch testimonials' });
  }
});

// GET all testimonials including inactive (admin)
router.get('/admin', async (req, res) => {
  try {
    const testimonials = await RentalTestimonial.find()
      .sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Error fetching rental testimonials:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch testimonials' });
  }
});

// GET single testimonial by ID
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await RentalTestimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    res.json({ success: true, data: testimonial });
  } catch (error) {
    console.error('Error fetching rental testimonial:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch testimonial' });
  }
});

// POST create new testimonial
router.post('/', async (req, res) => {
  try {
    const { name, role, text, photo, photoUrl, rating, isActive } = req.body;

    // Get highest display order
    const lastTestimonial = await RentalTestimonial.findOne().sort({ displayOrder: -1 });
    const displayOrder = lastTestimonial ? lastTestimonial.displayOrder + 1 : 0;

    const testimonial = new RentalTestimonial({
      name,
      role,
      text,
      photo: photo || 'profile1.png',
      photoUrl,
      rating: rating || 5,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder
    });

    await testimonial.save();
    res.status(201).json({ success: true, data: testimonial, message: 'Testimonial created successfully' });
  } catch (error) {
    console.error('Error creating rental testimonial:', error);
    res.status(500).json({ success: false, message: 'Failed to create testimonial' });
  }
});

// POST seed default testimonials
router.post('/seed', async (req, res) => {
  try {
    const count = await RentalTestimonial.countDocuments();
    if (count > 0) {
      return res.json({ success: false, message: 'Testimonials already exist. Delete existing ones first.' });
    }

    await RentalTestimonial.insertMany(defaultTestimonials);
    res.json({ success: true, message: `Successfully seeded ${defaultTestimonials.length} rental testimonials` });
  } catch (error) {
    console.error('Error seeding rental testimonials:', error);
    res.status(500).json({ success: false, message: 'Failed to seed testimonials' });
  }
});

// PUT update testimonial
router.put('/:id', async (req, res) => {
  try {
    const { name, role, text, photo, photoUrl, rating, isActive, displayOrder } = req.body;
    const updateData = { name, role, text, photo, photoUrl, rating, isActive, displayOrder };

    const testimonial = await RentalTestimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    res.json({ success: true, data: testimonial, message: 'Testimonial updated successfully' });
  } catch (error) {
    console.error('Error updating rental testimonial:', error);
    res.status(500).json({ success: false, message: 'Failed to update testimonial' });
  }
});

// POST - Trigger translation for a rental testimonial
router.post('/:id/translate', async (req, res) => {
  try {
    const testimonial = await RentalTestimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    const translations = await autoTranslateTestimonial({ text: testimonial.text, role: testimonial.role });
    const updated = await RentalTestimonial.findByIdAndUpdate(
      req.params.id,
      { translations },
      { new: true }
    );

    res.json({ success: true, data: updated, message: 'Testimonial translated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to translate testimonial', error: error.message });
  }
});

// DELETE testimonial
router.delete('/:id', async (req, res) => {
  try {
    const testimonial = await RentalTestimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting rental testimonial:', error);
    res.status(500).json({ success: false, message: 'Failed to delete testimonial' });
  }
});

module.exports = router;
