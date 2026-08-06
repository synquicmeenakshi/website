const twilio = require('twilio');
const { getBelgiumDateStr, getTimeSlot } = require('../utils/timezone');

// Initialize Twilio client
let twilioClient = null;

const initializeTwilio = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('Twilio credentials not configured. SMS reminders will be disabled.');
    return false;
  }

  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('Twilio client initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Twilio client:', error.message);
    return false;
  }
};

// Format phone number to E.164 format
const formatPhoneNumber = (phoneNumber, countryCode = 'BE') => {
  // Remove any non-numeric characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // If already in E.164 format (starts with +), return as is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Country code mappings
  const countryCodes = {
    'BE': '+32',
    'IN': '+91',
    'US': '+1',
    'GB': '+44',
    'FR': '+33',
    'DE': '+49',
    'NL': '+31',
    'ES': '+34',
    'IT': '+39',
    'PT': '+351',
    'AT': '+43',
    'CH': '+41',
    'IE': '+353',
    'LU': '+352'
  };

  const prefix = countryCodes[countryCode] || '+32'; // Default to Belgium

  // Remove leading 0 if present (common in European numbers)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  return prefix + cleaned;
};

// Generate customer reminder SMS message
const generateCustomerSmsReminder = (enrollment) => {
  const belgiumDateStr = getBelgiumDateStr(enrollment.appointmentDate);
  const [yr, mo, dy] = belgiumDateStr.split('-').map(Number);
  const formattedDate = new Date(Date.UTC(yr, mo - 1, dy)).toLocaleDateString('en-GB', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const durationMinutes = enrollment.service?.duration || 60;
  const timeSlot = getTimeSlot(enrollment.appointmentTime, durationMinutes);

  return `Dear ${enrollment.firstName},

This is a friendly reminder for your upcoming appointment at Zen Your Life.

Service: ${enrollment.serviceTitle}
Date: ${formattedDate}
Time: ${timeSlot} (Belgian time, ${durationMinutes} min)
Location: Schapenbaan 45, 1731 Relegem

Please arrive 5 minutes early. To reschedule or cancel, kindly contact us in advance.

We look forward to seeing you!

Kind Regards,
Zen Your Life Team`;
};

// Generate admin reminder SMS message
const generateAdminSmsReminder = (enrollment) => {
  const belgiumDateStr = getBelgiumDateStr(enrollment.appointmentDate);
  const [yr, mo, dy] = belgiumDateStr.split('-').map(Number);
  const formattedDate = new Date(Date.UTC(yr, mo - 1, dy)).toLocaleDateString('en-GB', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const durationMinutes = enrollment.service?.duration || 60;
  const timeSlot = getTimeSlot(enrollment.appointmentTime, durationMinutes);

  let message = `APPOINTMENT TOMORROW

Client: ${enrollment.fullName || `${enrollment.firstName} ${enrollment.lastName}`}
Service: ${enrollment.serviceTitle}
Date: ${formattedDate}
Time: ${timeSlot} (Belgian time, ${durationMinutes} min)
Phone: ${enrollment.phoneNumber}`;

  if (enrollment.specialRequests) {
    message += `\nNotes: ${enrollment.specialRequests}`;
  }

  return message;
};

// Send SMS via Twilio
const sendSms = async (to, message) => {
  if (!twilioClient) {
    const initialized = initializeTwilio();
    if (!initialized) {
      console.log('[Twilio] Not initialized, cannot send SMS');
      return false;
    }
  }

  try {
    console.log(`[Twilio] Sending SMS from ${process.env.TWILIO_PHONE_NUMBER} to ${to}`);
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log(`[Twilio] ✅ SMS sent successfully to ${to}. SID: ${result.sid}, Status: ${result.status}`);
    return true;
  } catch (error) {
    console.error(`[Twilio] ❌ Error sending SMS to ${to}:`, error.message);
    if (error.code === 21608) {
      console.error('[Twilio] The "from" phone number is not enabled for SMS. Check your Twilio phone number capabilities.');
    } else if (error.code === 21211) {
      console.error(`[Twilio] Invalid "to" phone number: ${to}. Check phone number formatting.`);
    } else if (error.code === 21608 || error.code === 21614) {
      console.error('[Twilio] Phone number is not SMS-capable or not valid for the destination country.');
    } else if (error.code === 21610) {
      console.error('[Twilio] Recipient has opted out of SMS messages.');
    } else if (error.code === 21408) {
      console.error('[Twilio] Permission not enabled for the destination country. Check Twilio Geographic Permissions.');
    } else if (error.code === 21219) {
      console.error('[Twilio] TRIAL ACCOUNT: You can only send SMS to verified phone numbers. Add the recipient at https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
    }
    return false;
  }
};

// Send customer reminder SMS (1 day before)
const sendCustomerSmsReminder = async (enrollment) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('Twilio credentials not configured, skipping customer SMS reminder');
    return false;
  }

  try {
    const phoneNumber = formatPhoneNumber(enrollment.phoneNumber, enrollment.country);
    const message = generateCustomerSmsReminder(enrollment);

    const sent = await sendSms(phoneNumber, message);

    if (sent) {
      console.log(`Customer SMS reminder sent to: ${phoneNumber} for appointment on ${enrollment.appointmentDate}`);
    }

    return sent;
  } catch (error) {
    console.error('Error sending customer SMS reminder:', error.message);
    return false;
  }
};

// Send admin reminder SMS (15 min before)
const sendAdminSmsReminder = async (enrollment) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('Twilio credentials not configured, skipping admin SMS reminder');
    return false;
  }

  try {
    const adminPhone = process.env.ADMIN_PHONE_NUMBER;

    if (!adminPhone) {
      console.log('Admin phone number not configured, skipping admin SMS reminder');
      return false;
    }

    const message = generateAdminSmsReminder(enrollment);
    const sent = await sendSms(adminPhone, message);

    if (sent) {
      console.log(`Admin SMS reminder sent for appointment #${enrollment.enrollmentId}`);
    }

    return sent;
  } catch (error) {
    console.error('Error sending admin SMS reminder:', error.message);
    return false;
  }
};

// Test SMS function (for testing purposes)
const sendTestSms = async (phoneNumber, countryCode = 'BE') => {
  const formattedNumber = formatPhoneNumber(phoneNumber, countryCode);
  const testMessage = `ZenYourLife Test: This is a test SMS from ZenYourLife booking system. If you received this, SMS notifications are working correctly!`;

  return await sendSms(formattedNumber, testMessage);
};

module.exports = {
  initializeTwilio,
  sendSms,
  sendCustomerSmsReminder,
  sendAdminSmsReminder,
  sendTestSms,
  formatPhoneNumber,
  generateCustomerSmsReminder,
  generateAdminSmsReminder
};
