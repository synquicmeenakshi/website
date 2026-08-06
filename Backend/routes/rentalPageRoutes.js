const express = require('express');
const router = express.Router();
const { RentalOverviewSettings } = require('../models/RentalPageSettings');

const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'nl', 'es'];

// Helper function to get translated overview settings
const getTranslatedOverview = (settings, lang) => {
  const settingsObj = settings.toObject ? settings.toObject() : { ...settings };

  // If language is English or translations don't exist, return original
  if (lang === 'en' || !settingsObj.translations || !settingsObj.translations[lang]) {
    return settingsObj;
  }

  const translation = settingsObj.translations[lang];

  // Translate cards if available
  const translatedCards = settingsObj.cards.map((card, index) => ({
    ...card,
    title: translation.cards?.[index]?.title || card.title,
    description: translation.cards?.[index]?.description || card.description
  }));

  return {
    ...settingsObj,
    badge: translation.badge || settingsObj.badge,
    title1: translation.title1 || settingsObj.title1,
    title2: translation.title2 || settingsObj.title2,
    description1: translation.description1 || settingsObj.description1,
    description2: translation.description2 || settingsObj.description2,
    cards: translatedCards
  };
};

// GET rental overview settings
router.get('/overview', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    let settings = await RentalOverviewSettings.findOne();

    // If no settings exist, create default
    if (!settings) {
      settings = await RentalOverviewSettings.create({});
      console.log('✅ Created default rental overview settings');
    }

    // If language is English or not supported, return original
    if (lang === 'en' || !SUPPORTED_LANGUAGES.includes(lang)) {
      return res.status(200).json({
        success: true,
        data: settings,
        language: 'en'
      });
    }

    // Get translated settings
    const translatedSettings = getTranslatedOverview(settings, lang);

    res.status(200).json({
      success: true,
      data: translatedSettings,
      language: lang
    });
  } catch (error) {
    console.error('❌ Error fetching rental overview settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rental overview settings',
      error: error.message
    });
  }
});

// PUT update rental overview settings
router.put('/overview', async (req, res) => {
  try {
    const { badge, title1, title2, description1, description2, cards, isActive } = req.body;

    // Find existing or create new
    let settings = await RentalOverviewSettings.findOne();

    if (!settings) {
      settings = new RentalOverviewSettings();
    }

    // Update fields
    if (badge !== undefined) settings.badge = badge;
    if (title1 !== undefined) settings.title1 = title1;
    if (title2 !== undefined) settings.title2 = title2;
    if (description1 !== undefined) settings.description1 = description1;
    if (description2 !== undefined) settings.description2 = description2;
    if (cards !== undefined) settings.cards = cards;
    if (isActive !== undefined) settings.isActive = isActive;

    // TODO: Add auto-translation here if needed
    // const translations = await autoTranslateOverview(settings);
    // settings.translations = translations;

    await settings.save();

    console.log('✅ Rental overview settings updated');

    res.status(200).json({
      success: true,
      message: 'Rental overview settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('❌ Error updating rental overview settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update rental overview settings',
      error: error.message
    });
  }
});

module.exports = router;
