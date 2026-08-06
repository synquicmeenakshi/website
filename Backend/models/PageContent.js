const mongoose = require('mongoose');

// Translation schema for PageContent
const pageContentTranslationSchema = new mongoose.Schema({
  hero: {
    title: String,
    subtitle: String,
    badgeText: String,
    buttonText: String
  },
  statistics: [{
    value: String,
    label: String
  }],
  sectionHeaders: {
    services: {
      title: String,
      subtitle: String
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, { _id: false });

const pageContentSchema = new mongoose.Schema({
  // Page identifier (e.g., 'services', 'home', 'about')
  pageId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  // Hero Section
  hero: {
    title: {
      type: String,
      default: 'Find Your Balance, One Massage at a Time'
    },
    subtitle: {
      type: String,
      default: 'Each body carries its own story of movement, tension, and rest. Choose the treatment that speaks to what you need most today.'
    },
    badgeText: {
      type: String,
      default: 'Services'
    },
    buttonText: {
      type: String,
      default: 'View Services'
    },
    backgroundImage: {
      type: String,
      default: 'serviceF1.png'
    },
    backgroundImageUrl: {
      type: String,
      default: '' // URL for uploaded image
    }
  },

  // Statistics Section
  statistics: [{
    value: {
      type: String,
      default: '100+'
    },
    label: {
      type: String,
      default: 'Treatments Offered'
    },
    isHighlighted: {
      type: Boolean,
      default: false
    }
  }],

  // Section Headers
  sectionHeaders: {
    services: {
      title: {
        type: String,
        default: 'Our services for ultimate relaxation'
      },
      subtitle: {
        type: String,
        default: 'Experience a peaceful retreat with our luxurious spa treatments, crafted to refresh your senses and restore harmony'
      }
    }
  },

  // SEO Meta
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },

  // Translations for different languages
  translations: {
    fr: pageContentTranslationSchema,
    de: pageContentTranslationSchema,
    nl: pageContentTranslationSchema,
    es: pageContentTranslationSchema
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PageContent', pageContentSchema);
