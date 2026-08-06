const express = require('express');
const router = express.Router();
const ServicePageContent = require('../models/ServicePageContent');

// Default data for initialization
const defaultData = {
  benefits: [
    { description: "Reduces stress, tension, and anxiety, promoting deep relaxation and mental clarity." },
    { description: "Relieves muscle pain, stiffness, and chronic aches through targeted therapeutic techniques." },
    { description: "Improves blood circulation, enhancing oxygen and nutrient delivery throughout the body." },
    { description: "Boosts immune function and supports natural healing processes." },
    { description: "Enhances flexibility, mobility, and overall physical well-being." }
  ],
  targetAudience: [
    { description: "Individuals experiencing chronic stress, tension, or anxiety seeking relaxation." },
    { description: "People with muscle pain, stiffness, or recovering from physical strain." },
    { description: "Those looking to improve circulation and overall health." },
    { description: "Anyone seeking a holistic approach to health and self-care." },
    { description: "Enthusiasts wanting to maintain optimal physical and mental balance." }
  ],
  benefitsTitle: "Benefits You'll Feel",
  targetAudienceTitle: "Who It's For"
};

// GET - Fetch service page content
router.get('/', async (req, res) => {
  try {
    let content = await ServicePageContent.findOne();

    // If no content exists, create default content
    if (!content) {
      content = await ServicePageContent.create(defaultData);
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching service page content',
      error: error.message
    });
  }
});

// PUT - Update service page content
router.put('/', async (req, res) => {
  try {
    const { benefits, targetAudience, benefitsTitle, targetAudienceTitle } = req.body;

    console.log('📝 Received update request:', JSON.stringify(req.body, null, 2));

    let content = await ServicePageContent.findOne();

    if (!content) {
      // Create new content if none exists
      content = await ServicePageContent.create({
        benefits: benefits || defaultData.benefits,
        targetAudience: targetAudience || defaultData.targetAudience,
        benefitsTitle: benefitsTitle || defaultData.benefitsTitle,
        targetAudienceTitle: targetAudienceTitle || defaultData.targetAudienceTitle
      });
      console.log('✅ Created new content');
    } else {
      // Update existing content - strip _id from subdocuments to avoid conflicts
      const cleanBenefits = benefits?.map(b => ({ description: b.description }));
      const cleanTargetAudience = targetAudience?.map(t => ({ description: t.description }));

      if (cleanBenefits !== undefined) content.benefits = cleanBenefits;
      if (cleanTargetAudience !== undefined) content.targetAudience = cleanTargetAudience;
      if (benefitsTitle !== undefined) content.benefitsTitle = benefitsTitle;
      if (targetAudienceTitle !== undefined) content.targetAudienceTitle = targetAudienceTitle;

      await content.save();
      console.log('✅ Updated existing content:', content._id);
    }

    // Fetch the updated content to return fresh data
    const updatedContent = await ServicePageContent.findOne();

    res.json({
      success: true,
      message: 'Service page content updated successfully',
      data: updatedContent
    });
  } catch (error) {
    console.error('❌ Error updating service page content:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service page content',
      error: error.message
    });
  }
});

module.exports = router;
