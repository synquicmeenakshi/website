const express = require('express');
const router = express.Router();
const transporter = require('../config/emailConfig');
const { sendSms, formatPhoneNumber } = require('../services/twilioSmsService');

// Send message to customer (email or SMS)
router.post('/send', async (req, res) => {
  try {
    const { type, to, subject, message, customerName, country } = req.body;

    if (!type || !to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Type, recipient, and message are required'
      });
    }

    if (type === 'email') {
      // Send email
      const mailOptions = {
        from: `"Zen Your Life" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject || 'Message from Zen Your Life',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #DFB13B 0%, #C9A032 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Zen Your Life</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="color: #333; font-size: 16px;">Dear ${customerName || 'Valued Customer'},</p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DFB13B;">
                <p style="color: #333; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                Best regards,<br>
                <strong>Zen Your Life Team</strong>
              </p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                Schapenbaan 45, 1731 Relegem<br>
                Contact: nadia.delens@zenyourlife.be
              </p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        success: true,
        message: 'Email sent successfully'
      });

    } else if (type === 'sms') {
      // Send SMS via Twilio
      const formattedNumber = formatPhoneNumber(to, country || 'BE');

      const smsMessage = `Dear ${customerName || 'Customer'},\n\n${message}\n\nKind Regards,\nZen Your Life Team`;

      const sent = await sendSms(formattedNumber, smsMessage);

      if (sent) {
        return res.status(200).json({
          success: true,
          message: 'SMS sent successfully'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to send SMS. Please check Twilio configuration.'
        });
      }

    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid message type. Use "email" or "sms"'
      });
    }

  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

module.exports = router;
