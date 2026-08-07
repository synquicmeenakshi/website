const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Enrollment = require('../models/Enrollment');
const { sendCustomerSmsReminder, sendAdminSmsReminder, initializeTwilio } = require('./twilioSmsService');
const { BELGIUM_TIMEZONE, getStartOfDayBelgium, getEndOfDayBelgium, getBelgiumDateStr, getTimeSlot } = require('../utils/timezone');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate customer reminder email template (sent 1 day before)
const generateCustomerReminderTemplate = (enrollment) => {
  const belgiumDateStr = getBelgiumDateStr(enrollment.appointmentDate);
  const [yr, mo, dy] = belgiumDateStr.split('-').map(Number);
  const formattedDate = new Date(Date.UTC(yr, mo - 1, dy)).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const durationMinutes = enrollment.service?.duration || 60;
  const timeSlot = getTimeSlot(enrollment.appointmentTime, durationMinutes);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #DFB13B 0%, #C9A032 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0 0 10px 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .reminder-box { background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; border-left: 4px solid #2196F3; }
        .reminder-box h2 { color: #1565C0; margin: 0 0 10px 0; }
        .section-title { font-size: 18px; font-weight: bold; color: #DFB13B; margin: 25px 0 15px 0; border-bottom: 2px solid #DFB13B; padding-bottom: 5px; }
        .info-row { margin: 10px 0; padding: 12px 15px; background: white; border-radius: 5px; }
        .label { font-weight: 600; color: #555; }
        .value { color: #333; }
        .highlight-box { background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #DFB13B; text-align: center; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Appointment Reminder</h1>
          <p>Your massage session is tomorrow!</p>
        </div>
        <div class="content">
          <div class="reminder-box">
            <h2>Don't Forget!</h2>
            <p>Dear ${enrollment.firstName}, this is a friendly reminder about your upcoming massage appointment.</p>
          </div>

          <div class="highlight-box">
            <h3 style="margin-top: 0; color: #C9A032;">Your Appointment is Tomorrow!</h3>
            <p style="font-size: 24px; font-weight: bold; color: #333; margin: 15px 0;">${formattedDate}</p>
            <p style="font-size: 20px; color: #666;">at ${timeSlot} <span style="font-size: 14px; color: #999;">(Belgian time, ${durationMinutes} min)</span></p>
          </div>

          <div class="section-title">Service Details</div>
          <div class="info-row">
            <span class="label">Service:</span>
            <span class="value">${enrollment.serviceTitle}</span>
          </div>

          <div class="section-title">Location</div>
          <div class="info-row">
            <span class="value">Schapenbaan 45, 1731 Relegem</span>
          </div>

          <div style="background: #E8F5E9; padding: 15px; border-radius: 8px; margin-top: 25px; text-align: center;">
            <p style="margin: 0; color: #2E7D32; font-weight: 500;">Please arrive 5 minutes before your appointment time.</p>
          </div>

          <div class="footer">
            <p>Need to reschedule? Please contact us as soon as possible.</p>
            <p>Best regards,<br><strong>The Meenakshi Team</strong></p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">© ${new Date().getFullYear()} Meenakshi. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate admin reminder email template (sent 1 day before appointment)
const generateAdminReminderTemplate = (enrollment) => {
  const belgiumDateStr = getBelgiumDateStr(enrollment.appointmentDate);
  const [yr, mo, dy] = belgiumDateStr.split('-').map(Number);
  const formattedDate = new Date(Date.UTC(yr, mo - 1, dy)).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const durationMinutes = enrollment.service?.duration || 60;
  const timeSlot = getTimeSlot(enrollment.appointmentTime, durationMinutes);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF5722 0%, #E64A19 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0 0 10px 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .upcoming-box { background: #FFF3E0; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #FF9800; text-align: center; }
        .section-title { font-size: 16px; font-weight: bold; color: #555; margin: 20px 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #ddd; }
        .info-row { margin: 8px 0; padding: 10px; background: white; border-radius: 5px; }
        .label { font-weight: 600; color: #555; display: inline-block; width: 120px; }
        .value { color: #333; }
        .time-highlight { background: linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; background: #f9f9f9; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Appointment Tomorrow!</h1>
          <p>Booking ID: #${enrollment.enrollmentId}</p>
        </div>
        <div class="content">
          <div class="upcoming-box">
            <strong>Heads Up!</strong> You have an appointment scheduled for tomorrow.
          </div>

          <div class="time-highlight">
            <p style="font-size: 14px; color: #666; margin: 0;">Appointment Time</p>
            <p style="font-size: 28px; font-weight: bold; color: #D32F2F; margin: 10px 0;">${timeSlot} <span style="font-size: 16px; color: #888; font-weight: normal;">(Belgian time, ${durationMinutes} min)</span></p>
            <p style="font-size: 14px; color: #666; margin: 0;">${formattedDate}</p>
          </div>

          <div class="section-title">Customer Details</div>
          <div class="info-row">
            <span class="label">Name:</span>
            <span class="value">${enrollment.fullName || `${enrollment.firstName} ${enrollment.lastName}`}</span>
          </div>
          <div class="info-row">
            <span class="label">Phone:</span>
            <span class="value">${enrollment.phoneNumber}</span>
          </div>
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">${enrollment.email}</span>
          </div>
          <div class="info-row">
            <span class="label">Gender:</span>
            <span class="value">${enrollment.gender}</span>
          </div>

          <div class="section-title">Service</div>
          <div class="info-row">
            <span class="label">Service:</span>
            <span class="value">${enrollment.serviceTitle}</span>
          </div>

          ${enrollment.specialRequests ? `
          <div class="section-title">Special Requests</div>
          <div class="info-row" style="background: #FFFDE7;">
            <span class="value">${enrollment.specialRequests}</span>
          </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>This is an automated reminder from Meenakshi Booking System</p>
          <p>© ${new Date().getFullYear()} Meenakshi. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send customer reminder email (1 day before)
const sendCustomerReminder = async (enrollment) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('Email credentials not configured, skipping customer reminder');
    return false;
  }

  try {
    const mailOptions = {
      from: `"Meenakshi" <${process.env.EMAIL_USER}>`,
      to: enrollment.email,
      subject: `Reminder: Your Massage Appointment Tomorrow - ${enrollment.serviceTitle}`,
      html: generateCustomerReminderTemplate(enrollment)
    };

    await transporter.sendMail(mailOptions);
    console.log(`Customer reminder sent to: ${enrollment.email} for appointment on ${enrollment.appointmentDate}`);
    return true;
  } catch (error) {
    console.error('Error sending customer reminder:', error.message);
    return false;
  }
};

// Send admin reminder email (1 day before)
const sendAdminReminder = async (enrollment) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('Email credentials not configured, skipping admin reminder');
    return false;
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const mailOptions = {
      from: `"Meenakshi Booking System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `Appointment Tomorrow: ${enrollment.fullName || `${enrollment.firstName} ${enrollment.lastName}`} - ${enrollment.serviceTitle}`,
      html: generateAdminReminderTemplate(enrollment)
    };

    await transporter.sendMail(mailOptions);
    console.log(`Admin reminder sent for appointment #${enrollment.enrollmentId} at ${enrollment.appointmentTime}`);
    return true;
  } catch (error) {
    console.error('Error sending admin reminder:', error.message);
    return false;
  }
};

// Check and send customer reminders (appointments tomorrow in Belgium timezone)
const checkCustomerReminders = async () => {
  try {
    // Use actual UTC time for all calculations
    const nowUTC = new Date();
    const todayDateStr = getBelgiumDateStr(nowUTC);

    console.log(`[Reminder] Running at ${nowUTC.toISOString()} (Belgium: ${nowUTC.toLocaleString('en-US', { timeZone: BELGIUM_TIMEZONE })})`);

    // Calculate tomorrow by adding 24 hours to today's start in Belgium
    const todayStart = getStartOfDayBelgium(todayDateStr);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowDateStr = getBelgiumDateStr(tomorrowStart);
    const tomorrowEnd = getEndOfDayBelgium(tomorrowDateStr);

    console.log(`[Reminder] Looking for appointments between ${tomorrowStart.toISOString()} and ${tomorrowEnd.toISOString()} (Belgium tomorrow: ${tomorrowDateStr})`);

    // Find appointments for tomorrow that haven't received customer reminder (EMAIL)
    // Email is MANDATORY for all customers regardless of their reminder preference
    const emailEnrollments = await Enrollment.find({
      appointmentDate: {
        $gte: tomorrowStart,
        $lte: tomorrowEnd
      },
      reminderSentToCustomer: false,
      status: { $in: ['pending', 'confirmed'] }
    }).populate('service');

    console.log(`[Reminder] Found ${emailEnrollments.length} appointments for tomorrow needing EMAIL reminders (email is mandatory for all)`);

    // Process each enrollment: email is mandatory, SMS is additional for 'sms' or 'both' preference
    for (const enrollment of emailEnrollments) {
      let emailSent = false;
      let smsSent = false;

      // Step 1: Send email (MANDATORY for all customers)
      emailSent = await sendCustomerReminder(enrollment);
      if (emailSent) {
        console.log(`[Reminder] ✅ Customer email reminder sent for enrollment #${enrollment.enrollmentId}`);
      } else {
        console.log(`[Reminder] ❌ Failed to send customer email reminder for enrollment #${enrollment.enrollmentId}`);
      }

      // Step 2: Send SMS if customer preference includes SMS ('sms' or 'both')
      if (enrollment.reminderPreference === 'sms' || enrollment.reminderPreference === 'both') {
        console.log(`[Reminder] Attempting SMS to ${enrollment.phoneNumber} (country: ${enrollment.country}) for enrollment #${enrollment.enrollmentId}`);
        smsSent = await sendCustomerSmsReminder(enrollment);
        if (smsSent) {
          console.log(`[Reminder] ✅ Customer SMS reminder sent for enrollment #${enrollment.enrollmentId}`);
        } else {
          console.log(`[Reminder] ❌ Failed to send customer SMS reminder for enrollment #${enrollment.enrollmentId} - Check Twilio account (trial accounts only send to verified numbers)`);
        }
      }

      // Mark as sent if email was successful (email is mandatory)
      if (emailSent) {
        await Enrollment.findByIdAndUpdate(enrollment._id, {
          reminderSentToCustomer: true
        });
        console.log(`[Reminder] ✅ Enrollment #${enrollment.enrollmentId} marked as reminder sent (email: ${emailSent}, sms: ${smsSent})`);
      }
    }
  } catch (error) {
    console.error('[Reminder] Error checking customer reminders:', error.message);
  }
};

// Check and send admin reminders (appointments tomorrow in Belgium timezone)
const checkAdminReminders = async () => {
  try {
    const nowUTC = new Date();
    const todayDateStr = getBelgiumDateStr(nowUTC);

    console.log(`[Admin Reminder] Running at ${nowUTC.toISOString()} (Belgium: ${nowUTC.toLocaleString('en-US', { timeZone: BELGIUM_TIMEZONE })})`);

    // Calculate tomorrow's date range in Belgium timezone
    const todayStart = getStartOfDayBelgium(todayDateStr);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowDateStr = getBelgiumDateStr(tomorrowStart);
    const tomorrowEnd = getEndOfDayBelgium(tomorrowDateStr);

    console.log(`[Admin Reminder] Looking for appointments between ${tomorrowStart.toISOString()} and ${tomorrowEnd.toISOString()} (Belgium tomorrow: ${tomorrowDateStr})`);

    // Find tomorrow's appointments that haven't received admin reminder
    const enrollments = await Enrollment.find({
      appointmentDate: {
        $gte: tomorrowStart,
        $lte: tomorrowEnd
      },
      reminderSentToAdmin: false,
      status: { $in: ['pending', 'confirmed'] }
    }).populate('service');

    console.log(`[Admin Reminder] Found ${enrollments.length} appointments for tomorrow needing admin reminders`);

    for (const enrollment of enrollments) {
      // Send email reminder to admin
      const emailSent = await sendAdminReminder(enrollment);

      // Also send SMS reminder to admin if configured
      const smsSent = await sendAdminSmsReminder(enrollment);

      if (emailSent || smsSent) {
        await Enrollment.findByIdAndUpdate(enrollment._id, {
          reminderSentToAdmin: true
        });
        console.log(`[Admin Reminder] ✅ Sent (email: ${emailSent}, sms: ${smsSent}) for enrollment #${enrollment.enrollmentId}`);
      } else {
        console.log(`[Admin Reminder] ❌ Failed to send for enrollment #${enrollment.enrollmentId}`);
      }
    }
  } catch (error) {
    console.error('[Admin Reminder] Error checking admin reminders:', error.message);
  }
};

// Start the scheduler
const startReminderScheduler = () => {
  console.log('Starting reminder scheduler...');

  // Get server timezone info
  const serverTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log(`Server timezone: ${serverTz}`);
  console.log(`Business timezone: ${BELGIUM_TIMEZONE}`);

  // Initialize Twilio for SMS reminders
  initializeTwilio();

  // Check customer and admin reminders every day at 9:00 AM Belgium time (for tomorrow's appointments)
  cron.schedule('0 9 * * *', () => {
    console.log('[Reminder] Running customer reminder check at 9:00 AM Belgium time');
    checkCustomerReminders();
    console.log('[Admin Reminder] Running admin reminder check at 9:00 AM Belgium time');
    checkAdminReminders();
  }, {
    timezone: BELGIUM_TIMEZONE
  });

  console.log(`Reminder scheduler started successfully (${BELGIUM_TIMEZONE})`);
  console.log('- Customer reminders: Daily at 9:00 AM Belgium time (for next day appointments)');
  console.log('- Admin reminders: Daily at 9:00 AM Belgium time (for next day appointments)');
  console.log('- SMS reminders: Enabled if Twilio credentials are configured');
};

module.exports = {
  startReminderScheduler,
  checkCustomerReminders,
  checkAdminReminders,
  sendCustomerReminder,
  sendAdminReminder,
  sendCustomerSmsReminder,
  sendAdminSmsReminder
};
