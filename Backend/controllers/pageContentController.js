const PageContent = require('../models/PageContent');

// Get page content by pageId
exports.getPageContent = async (req, res) => {
  try {
    const { pageId } = req.params;
    let pageContent = await PageContent.findOne({ pageId });

    // If page content doesn't exist, create default content
    if (!pageContent) {
      pageContent = await createDefaultPageContent(pageId);
    }

    res.status(200).json({
      success: true,
      data: pageContent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching page content',
      error: error.message
    });
  }
};

// Get all page contents
exports.getAllPageContents = async (req, res) => {
  try {
    const pageContents = await PageContent.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: pageContents.length,
      data: pageContents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching page contents',
      error: error.message
    });
  }
};

// Create or Update page content
exports.updatePageContent = async (req, res) => {
  try {
    const { pageId } = req.params;
    const updateData = req.body;

    let pageContent = await PageContent.findOneAndUpdate(
      { pageId },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Page content updated successfully',
      data: pageContent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating page content',
      error: error.message
    });
  }
};

// Update hero section
exports.updateHeroSection = async (req, res) => {
  try {
    const { pageId } = req.params;
    const heroData = req.body;

    const pageContent = await PageContent.findOneAndUpdate(
      { pageId },
      { hero: heroData },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Hero section updated successfully',
      data: pageContent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating hero section',
      error: error.message
    });
  }
};

// Update statistics
exports.updateStatistics = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { statistics } = req.body;

    const pageContent = await PageContent.findOneAndUpdate(
      { pageId },
      { statistics },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Statistics updated successfully',
      data: pageContent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating statistics',
      error: error.message
    });
  }
};

// Delete page content
exports.deletePageContent = async (req, res) => {
  try {
    const { pageId } = req.params;

    const pageContent = await PageContent.findOneAndDelete({ pageId });

    if (!pageContent) {
      return res.status(404).json({
        success: false,
        message: 'Page content not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Page content deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting page content',
      error: error.message
    });
  }
};

// Seed default page content
exports.seedPageContent = async (req, res) => {
  try {
    const defaultPages = ['services', 'home', 'about'];
    const results = [];

    for (const pageId of defaultPages) {
      const existingContent = await PageContent.findOne({ pageId });
      if (!existingContent) {
        const newContent = await createDefaultPageContent(pageId);
        results.push(newContent);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Default page content seeded successfully',
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error seeding page content',
      error: error.message
    });
  }
};

// Helper function to create default page content
async function createDefaultPageContent(pageId) {
  const defaultContent = {
    pageId,
    hero: {
      title: getDefaultHeroTitle(pageId),
      subtitle: getDefaultHeroSubtitle(pageId),
      badgeText: capitalizeFirst(pageId),
      buttonText: 'View Services',
      backgroundImage: 'serviceF1.png',
      backgroundImageUrl: ''
    },
    statistics: [
      { value: '100+', label: 'Treatments Offered', isHighlighted: false },
      { value: '50+', label: 'Certified Therapists', isHighlighted: true },
      { value: '2k+', label: 'Satisfied Clients', isHighlighted: false },
      { value: '300+', label: 'Unique', isHighlighted: false }
    ],
    sectionHeaders: {
      services: {
        title: 'Our services for ultimate relaxation',
        subtitle: 'Experience a peaceful retreat with our luxurious spa treatments, crafted to refresh your senses and restore harmony'
      }
    },
    isActive: true
  };

  return await PageContent.create(defaultContent);
}

function getDefaultHeroTitle(pageId) {
  const titles = {
    services: 'Find Your Balance, One Massage at a Time',
    home: 'Welcome to ZenYourLife',
    about: 'Our Story'
  };
  return titles[pageId] || 'Welcome';
}

function getDefaultHeroSubtitle(pageId) {
  const subtitles = {
    services: 'Each body carries its own story of movement, tension, and rest. Choose the treatment that speaks to what you need most today.',
    home: 'Discover the art of relaxation and rejuvenation',
    about: 'Learn about our journey'
  };
  return subtitles[pageId] || '';
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
