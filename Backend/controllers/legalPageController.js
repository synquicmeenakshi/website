const LegalPage = require('../models/LegalPage');

// Get legal page by type and language
exports.getLegalPage = async (req, res) => {
  try {
    const { pageType } = req.params;
    const { language = 'en' } = req.query;

    // Validate pageType
    const validPageTypes = ['privacy-policy', 'terms-and-conditions', 'cookie-policy', 'dpa'];
    if (!validPageTypes.includes(pageType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page type. Must be one of: privacy-policy, terms-and-conditions, cookie-policy, dpa'
      });
    }

    // Validate language
    const validLanguages = ['en', 'fr', 'de', 'nl'];
    const lang = validLanguages.includes(language) ? language : 'en';

    const legalPage = await LegalPage.findOne({
      pageType,
      language: lang,
      isActive: true
    });

    if (!legalPage) {
      // Fallback to English if requested language not found
      const fallbackPage = await LegalPage.findOne({
        pageType,
        language: 'en',
        isActive: true
      });

      if (!fallbackPage) {
        return res.status(404).json({
          success: false,
          message: 'Legal page not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: fallbackPage,
        fallback: true
      });
    }

    res.status(200).json({
      success: true,
      data: legalPage
    });
  } catch (error) {
    console.error('Error fetching legal page:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching legal page',
      error: error.message
    });
  }
};

// Get all legal pages (admin)
exports.getAllLegalPages = async (req, res) => {
  try {
    const { language } = req.query;

    const query = {};
    if (language) {
      query.language = language;
    }

    const legalPages = await LegalPage.find(query).sort({ pageType: 1, language: 1 });

    res.status(200).json({
      success: true,
      count: legalPages.length,
      data: legalPages
    });
  } catch (error) {
    console.error('Error fetching legal pages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching legal pages',
      error: error.message
    });
  }
};

// Update legal page (admin)
exports.updateLegalPage = async (req, res) => {
  try {
    const { pageType, language } = req.params;
    const updateData = req.body;

    const legalPage = await LegalPage.findOneAndUpdate(
      { pageType, language },
      updateData,
      { new: true, runValidators: true }
    );

    if (!legalPage) {
      return res.status(404).json({
        success: false,
        message: 'Legal page not found'
      });
    }

    res.status(200).json({
      success: true,
      data: legalPage
    });
  } catch (error) {
    console.error('Error updating legal page:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating legal page',
      error: error.message
    });
  }
};
