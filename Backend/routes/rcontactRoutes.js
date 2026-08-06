const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const RContactMessage = require('../models/RContactMessage');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Function to send admin notification email
const sendAdminNotificationEmail = async (contactData) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: `New Rental Inquiry from ${contactData.firstName} ${contactData.lastName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #6EA8FF 0%, #4A90E2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #e0e0e0;
          }
          .info-row {
            display: flex;
            padding: 12px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .info-label {
            font-weight: 600;
            color: #555;
            width: 120px;
          }
          .info-value {
            color: #333;
          }
          .message-box {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            border: 1px solid #e0e0e0;
          }
          .message-label {
            font-weight: 600;
            color: #555;
            margin-bottom: 10px;
          }
          .message-content {
            color: #333;
            white-space: pre-wrap;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #888;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>New Rental Inquiry</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">A new customer is interested in your rental property</p>
        </div>

        <div class="content">
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${contactData.firstName} ${contactData.lastName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value"><a href="mailto:${contactData.email}">${contactData.email}</a></span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone:</span>
            <span class="info-value">${contactData.countryCode} ${contactData.phone || 'Not provided'}</span>
          </div>
          <div class="info-row" style="border-bottom: none;">
            <span class="info-label">Date:</span>
            <span class="info-value">${new Date().toLocaleString('en-US', {
              timeZone: 'Europe/Brussels',
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} (Brussels time)</span>
          </div>

          <div class="message-box">
            <div class="message-label">Message:</div>
            <div class="message-content">${contactData.message}</div>
          </div>
        </div>

        <div class="footer">
          <p>This is an automated notification from ZenYourLife Rental System</p>
          <p>© ${new Date().getFullYear()} ZenYourLife. All rights reserved.</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return false;
  }
};

// POST - Submit a new rental contact message
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, countryCode, phone, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (firstName, lastName, email, message)'
      });
    }

    const contactMessage = new RContactMessage({
      firstName,
      lastName,
      email,
      countryCode: countryCode || '+32',
      phone,
      message
    });

    await contactMessage.save();

    // Send email notification to admin (don't wait for it to complete)
    sendAdminNotificationEmail({
      firstName,
      lastName,
      email,
      countryCode: countryCode || '+32',
      phone,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully!',
      data: contactMessage
    });
  } catch (error) {
    console.error('Error saving rental contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again.'
    });
  }
});

// GET - Get all rental contact messages (for admin)
router.get('/', async (req, res) => {
  try {
    const messages = await RContactMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching rental contact messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// GET - Get single message by ID
router.get('/:id', async (req, res) => {
  try {
    const message = await RContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Error fetching rental contact message:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch message' });
  }
});

// PUT - Update message status (for admin)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const message = await RContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Error updating rental contact message:', error);
    res.status(500).json({ success: false, message: 'Failed to update message' });
  }
});

// DELETE - Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const message = await RContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting rental contact message:', error);
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
});

module.exports = router;
