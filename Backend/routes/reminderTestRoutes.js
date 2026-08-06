const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const { sendCustomerReminder, sendAdminReminder, sendCustomerSmsReminder, sendAdminSmsReminder } = require('../services/reminderScheduler');
const { sendTestSms, formatPhoneNumber } = require('../services/twilioSmsService');
const transporter = require('../config/emailConfig');

// Send a simple test email
router.post('/send-test-email', async (req, res) => {
  try {
    const { email = 'parv@synquic.com', subject = 'Test Email from ZenYourLife', message = 'This is a test email to verify email functionality is working correctly.' } = req.body;

    console.log('Sending test email to:', email);

    const mailOptions = {
      from: `"ZenYourLife" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #B8860B 0%, #DAA520 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background: #B8860B; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Test Email</h1>
              <p>ZenYourLife Email System</p>
            </div>
            <div class="content">
              <h2>Email Functionality Test</h2>
              <p>${message}</p>
              <p><strong>Sent at:</strong> ${new Date().toLocaleString('en-BE', { timeZone: 'Europe/Brussels' })}</p>
              <p><strong>Environment:</strong> ${process.env.SERVER_ENV || 'development'}</p>
              <p><strong>Email Service:</strong> Gmail (Nodemailer)</p>
              <a href="https://zenyourlife.be" class="button">Visit ZenYourLife</a>
            </div>
            <div class="footer">
              <p>This is an automated test email from ZenYourLife</p>
              <p>© ${new Date().getFullYear()} ZenYourLife. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Test email sent successfully!',
      details: {
        recipient: email,
        subject: subject,
        messageId: info.messageId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// Test customer reminder for a specific enrollment
router.post('/test-customer-reminder/:enrollmentId', async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ enrollmentId: req.params.enrollmentId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    console.log('Testing customer reminder for enrollment:', enrollment.enrollmentId);
    const sent = await sendCustomerReminder(enrollment);

    res.json({
      success: sent,
      message: sent ? 'Customer reminder email sent successfully!' : 'Failed to send customer reminder',
      enrollment: {
        id: enrollment.enrollmentId,
        customer: enrollment.fullName,
        email: enrollment.email,
        appointmentDate: enrollment.appointmentDate,
        appointmentTime: enrollment.appointmentTime
      }
    });
  } catch (error) {
    console.error('Error testing customer reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing customer reminder',
      error: error.message
    });
  }
});

// Test admin reminder for a specific enrollment
router.post('/test-admin-reminder/:enrollmentId', async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ enrollmentId: req.params.enrollmentId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    console.log('Testing admin reminder for enrollment:', enrollment.enrollmentId);
    const sent = await sendAdminReminder(enrollment);

    res.json({
      success: sent,
      message: sent ? 'Admin reminder email sent successfully!' : 'Failed to send admin reminder',
      enrollment: {
        id: enrollment.enrollmentId,
        customer: enrollment.fullName,
        appointmentDate: enrollment.appointmentDate,
        appointmentTime: enrollment.appointmentTime
      }
    });
  } catch (error) {
    console.error('Error testing admin reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing admin reminder',
      error: error.message
    });
  }
});

// Test both reminders for a specific enrollment
router.post('/test-both/:enrollmentId', async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ enrollmentId: req.params.enrollmentId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    console.log('Testing both reminders for enrollment:', enrollment.enrollmentId);

    const customerSent = await sendCustomerReminder(enrollment);
    const adminSent = await sendAdminReminder(enrollment);

    res.json({
      success: customerSent || adminSent,
      message: 'Test complete',
      results: {
        customerReminder: customerSent ? 'Sent successfully' : 'Failed',
        adminReminder: adminSent ? 'Sent successfully' : 'Failed'
      },
      enrollment: {
        id: enrollment.enrollmentId,
        customer: enrollment.fullName,
        customerEmail: enrollment.email,
        appointmentDate: enrollment.appointmentDate,
        appointmentTime: enrollment.appointmentTime,
        reminderPreference: enrollment.reminderPreference
      }
    });
  } catch (error) {
    console.error('Error testing reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing reminders',
      error: error.message
    });
  }
});

// Get all enrollments for testing
router.get('/enrollments', async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ status: { $in: ['pending', 'confirmed'] } })
      .sort({ appointmentDate: 1 })
      .limit(10);

    res.json({
      success: true,
      message: 'Recent enrollments for testing',
      data: enrollments.map(e => ({
        enrollmentId: e.enrollmentId,
        customer: e.fullName,
        email: e.email,
        appointmentDate: e.appointmentDate,
        appointmentTime: e.appointmentTime,
        reminderPreference: e.reminderPreference,
        reminderSentToCustomer: e.reminderSentToCustomer,
        reminderSentToAdmin: e.reminderSentToAdmin,
        status: e.status
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollments',
      error: error.message
    });
  }
});

// Reset reminder flags for an enrollment (for re-testing)
router.post('/reset-flags/:enrollmentId', async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndUpdate(
      { enrollmentId: req.params.enrollmentId },
      {
        reminderSentToCustomer: false,
        reminderSentToAdmin: false
      },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      message: 'Reminder flags reset successfully',
      enrollment: {
        id: enrollment.enrollmentId,
        reminderSentToCustomer: enrollment.reminderSentToCustomer,
        reminderSentToAdmin: enrollment.reminderSentToAdmin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting flags',
      error: error.message
    });
  }
});

// ============== SMS TEST ROUTES ==============

// Test SMS to a specific phone number
router.post('/test-sms', async (req, res) => {
  try {
    const { phoneNumber, countryCode = 'BE' } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    console.log('Testing SMS to:', phoneNumber, 'Country:', countryCode);
    const formattedNumber = formatPhoneNumber(phoneNumber, countryCode);
    const sent = await sendTestSms(phoneNumber, countryCode);

    res.json({
      success: sent,
      message: sent ? 'Test SMS sent successfully!' : 'Failed to send test SMS. Check Twilio credentials.',
      details: {
        originalNumber: phoneNumber,
        formattedNumber: formattedNumber,
        countryCode: countryCode
      }
    });
  } catch (error) {
    console.error('Error testing SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing SMS',
      error: error.message
    });
  }
});

// Test customer SMS reminder for a specific enrollment
router.post('/test-customer-sms/:enrollmentId', async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ enrollmentId: req.params.enrollmentId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    console.log('Testing customer SMS reminder for enrollment:', enrollment.enrollmentId);
    const sent = await sendCustomerSmsReminder(enrollment);

    res.json({
      success: sent,
      message: sent ? 'Customer SMS reminder sent successfully!' : 'Failed to send customer SMS reminder. Check Twilio credentials.',
      enrollment: {
        id: enrollment.enrollmentId,
        customer: enrollment.fullName,
        phone: enrollment.phoneNumber,
        country: enrollment.country,
        appointmentDate: enrollment.appointmentDate,
        appointmentTime: enrollment.appointmentTime
      }
    });
  } catch (error) {
    console.error('Error testing customer SMS reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing customer SMS reminder',
      error: error.message
    });
  }
});

// Test admin SMS reminder for a specific enrollment
router.post('/test-admin-sms/:enrollmentId', async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ enrollmentId: req.params.enrollmentId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    console.log('Testing admin SMS reminder for enrollment:', enrollment.enrollmentId);
    const sent = await sendAdminSmsReminder(enrollment);

    res.json({
      success: sent,
      message: sent ? 'Admin SMS reminder sent successfully!' : 'Failed to send admin SMS reminder. Check ADMIN_PHONE_NUMBER and Twilio credentials.',
      enrollment: {
        id: enrollment.enrollmentId,
        customer: enrollment.fullName,
        appointmentDate: enrollment.appointmentDate,
        appointmentTime: enrollment.appointmentTime
      }
    });
  } catch (error) {
    console.error('Error testing admin SMS reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing admin SMS reminder',
      error: error.message
    });
  }
});

// Test all reminders (email + SMS) for a specific enrollment
router.post('/test-all/:enrollmentId', async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ enrollmentId: req.params.enrollmentId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    console.log('Testing all reminders for enrollment:', enrollment.enrollmentId);

    const customerEmailSent = await sendCustomerReminder(enrollment);
    const customerSmsSent = await sendCustomerSmsReminder(enrollment);
    const adminEmailSent = await sendAdminReminder(enrollment);
    const adminSmsSent = await sendAdminSmsReminder(enrollment);

    res.json({
      success: customerEmailSent || customerSmsSent || adminEmailSent || adminSmsSent,
      message: 'Test complete',
      results: {
        customerEmail: customerEmailSent ? 'Sent successfully' : 'Failed',
        customerSms: customerSmsSent ? 'Sent successfully' : 'Failed or not configured',
        adminEmail: adminEmailSent ? 'Sent successfully' : 'Failed',
        adminSms: adminSmsSent ? 'Sent successfully' : 'Failed or not configured'
      },
      enrollment: {
        id: enrollment.enrollmentId,
        customer: enrollment.fullName,
        email: enrollment.email,
        phone: enrollment.phoneNumber,
        country: enrollment.country,
        appointmentDate: enrollment.appointmentDate,
        appointmentTime: enrollment.appointmentTime,
        reminderPreference: enrollment.reminderPreference
      }
    });
  } catch (error) {
    console.error('Error testing all reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing reminders',
      error: error.message
    });
  }
});

// Check Twilio configuration status
router.get('/twilio-status', (req, res) => {
  const twilioConfigured = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );

  const adminPhoneConfigured = !!process.env.ADMIN_PHONE_NUMBER;

  res.json({
    success: true,
    twilioConfigured: twilioConfigured,
    adminPhoneConfigured: adminPhoneConfigured,
    message: twilioConfigured
      ? 'Twilio is configured and ready for SMS reminders'
      : 'Twilio is NOT configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your .env file',
    details: {
      accountSid: process.env.TWILIO_ACCOUNT_SID ? 'Set (hidden)' : 'Not set',
      authToken: process.env.TWILIO_AUTH_TOKEN ? 'Set (hidden)' : 'Not set',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER ? 'Set (hidden)' : 'Not set',
      adminPhone: process.env.ADMIN_PHONE_NUMBER ? 'Set (hidden)' : 'Not set'
    }
  });
});

module.exports = router;
