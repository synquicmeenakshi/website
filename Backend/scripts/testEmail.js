/**
 * Email Test Script
 * Run with: node backend/scripts/testEmail.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const nodemailer = require('nodemailer');

const testEmail = async () => {
  console.log('=================================');
  console.log('Email Configuration Test');
  console.log('=================================\n');

  console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET');
  console.log('');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('❌ Email credentials not found in environment variables!');
    console.log('Make sure .env file exists in root directory with EMAIL_USER and EMAIL_PASSWORD');
    process.exit(1);
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    }
  });

  console.log('Testing connection to Gmail SMTP...\n');

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('Sending test email...\n');

    const info = await transporter.sendMail({
      from: `"ZenYourLife Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'ZenYourLife Email Test - ' + new Date().toLocaleString(),
      text: 'This is a test email from ZenYourLife. If you receive this, email configuration is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
          <h2 style="color: #DFB13B;">ZenYourLife Email Test</h2>
          <p>This is a test email from ZenYourLife.</p>
          <p>If you receive this, email configuration is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\nCheck inbox of:', process.env.EMAIL_USER);

  } catch (error) {
    console.log('❌ Email test failed!\n');
    console.log('Error:', error.message);

    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Tip: Make sure you are using an App Password, not your regular Gmail password.');
      console.log('   Go to: https://myaccount.google.com/apppasswords');
    }
  }

  console.log('\n=================================');
};

testEmail();
