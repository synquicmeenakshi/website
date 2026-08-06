const crypto = require('crypto');
const Enrollment = require('../models/Enrollment');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const nodemailer = require('nodemailer');
const { BELGIUM_TIMEZONE, getStartOfDayBelgium, getBelgiumDateStr, getTimeSlot, formatAppointmentDate } = require('../utils/timezone');
const { sendSms, formatPhoneNumber } = require('../services/twilioSmsService');

const FRONTEND_URL = (
  process.env.FRONTEND_URL
  || (process.env.NODE_ENV === 'production' ? 'https://zenyourlife.be' : 'http://localhost:5173')
).replace(/\/$/, '');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate customer confirmation email template
const generateCustomerEmailTemplate = (enrollment, cancelUrl) => {
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
        .thank-you-box { background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; border-left: 4px solid #4CAF50; }
        .thank-you-box h2 { color: #2E7D32; margin: 0 0 10px 0; }
        .section-title { font-size: 18px; font-weight: bold; color: #DFB13B; margin: 25px 0 15px 0; border-bottom: 2px solid #DFB13B; padding-bottom: 5px; }
        .info-row { margin: 10px 0; padding: 12px 15px; background: white; border-radius: 5px; }
        .label { font-weight: 600; color: #555; }
        .value { color: #333; }
        .service-highlight { background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #DFB13B; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Choosing Us!</h1>
          <p>Booking Reference: #${enrollment.enrollmentId}</p>
        </div>
        <div class="content">
          <div class="thank-you-box">
            <h2>Your Booking is Confirmed!</h2>
            <p>Thank you, ${enrollment.firstName}! We're excited to welcome you for your massage session.</p>
          </div>

          <div class="service-highlight">
            <h3 style="margin-top: 0; color: #C9A032;">💆 ${enrollment.serviceTitle}</h3>
            <div style="margin-top: 15px;">
              <div style="margin: 8px 0;"><strong>Duration:</strong> ${enrollment.service?.duration || 60} minutes</div>
              <div style="margin: 8px 0;"><strong>Price:</strong> €${enrollment.service?.price || 'N/A'}</div>
            </div>
          </div>

          <div class="section-title">📅 Appointment Details</div>
          <div class="info-row">
            <span class="label">Date:</span>
            <span class="value">${formattedDate}</span>
          </div>
          <div class="info-row">
            <span class="label">Time:</span>
            <span class="value">${timeSlot} <span style="color:#888;font-size:12px;">(Belgian time, ${durationMinutes} min)</span></span>
          </div>
          <div class="info-row">
            <span class="label">Day:</span>
            <span class="value">${enrollment.appointmentDay}</span>
          </div>

          <div class="section-title">📍 Location</div>
          <div class="info-row">
            <span class="value">Schapenbaan 45, 1731 Relegem</span>
          </div>

          <div style="background: #E3F2FD; padding: 15px; border-radius: 8px; margin-top: 25px; text-align: center;">
            <p style="margin: 0; color: #1976D2; font-weight: 500;">Please arrive 5 minutes before your appointment time.</p>
          </div>

          ${cancelUrl ? `
          <div style="text-align: center; margin-top: 30px;">
            <p style="margin: 0 0 12px 0; color: #555;">Need to cancel? You can do it in one click:</p>
            <a href="${cancelUrl}" style="display: inline-block; background: #B71C1C; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600;">Cancel Appointment</a>
            <p style="margin: 12px 0 0 0; color: #888; font-size: 12px;">Please cancel at least 24 hours in advance when possible.</p>
          </div>
          ` : ''}

          <div class="footer">
            <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
            <p>Best regards,<br><strong>The ZenYourLife Team</strong></p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">© ${new Date().getFullYear()} ZenYourLife. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate admin notification email template
const generateAdminEmailTemplate = (enrollment) => {
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
        .header { background: linear-gradient(135deg, #DFB13B 0%, #C9A032 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0 0 10px 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .alert-box { background: #FFF3E0; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #FF9800; }
        .section-title { font-size: 16px; font-weight: bold; color: #555; margin: 20px 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #ddd; }
        .info-row { margin: 8px 0; padding: 10px; background: white; border-radius: 5px; }
        .label { font-weight: 600; color: #555; display: inline-block; width: 140px; }
        .value { color: #333; }
        .customer-info { background: #E8F5E9; padding: 20px; border-radius: 10px; margin: 15px 0; }
        .service-info { background: #FFF8E1; padding: 20px; border-radius: 10px; margin: 15px 0; }
        .booking-info { background: #E3F2FD; padding: 20px; border-radius: 10px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; background: #f9f9f9; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Massage Booking!</h1>
          <p>Booking ID: #${enrollment.enrollmentId}</p>
        </div>
        <div class="content">
          <div class="alert-box">
            <strong>⚡ New Appointment:</strong> A customer has booked a massage session.
          </div>

          <div class="customer-info">
            <div class="section-title">👤 Customer Information</div>
            <div class="info-row">
              <span class="label">Name:</span>
              <span class="value">${enrollment.fullName}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value"><a href="mailto:${enrollment.email}">${enrollment.email}</a></span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span class="value">${enrollment.phoneNumber}</span>
            </div>
            <div class="info-row">
              <span class="label">Gender:</span>
              <span class="value">${enrollment.gender}</span>
            </div>
            <div class="info-row">
              <span class="label">Country:</span>
              <span class="value">${enrollment.country}</span>
            </div>
          </div>

          <div class="service-info">
            <div class="section-title">💆 Service Details</div>
            <div class="info-row">
              <span class="label">Service:</span>
              <span class="value">${enrollment.serviceTitle}</span>
            </div>
            <div class="info-row">
              <span class="label">Duration:</span>
              <span class="value">${enrollment.service?.duration || 60} minutes</span>
            </div>
            <div class="info-row">
              <span class="label">Price:</span>
              <span class="value">€${enrollment.service?.price || 'N/A'}</span>
            </div>
          </div>

          <div class="booking-info">
            <div class="section-title">📅 Appointment Schedule</div>
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">${formattedDate}</span>
            </div>
            <div class="info-row">
              <span class="label">Day:</span>
              <span class="value">${enrollment.appointmentDay}</span>
            </div>
            <div class="info-row">
              <span class="label">Time:</span>
              <span class="value">${timeSlot} (Belgian time, ${durationMinutes} min)</span>
            </div>
          </div>

          ${enrollment.specialRequests ? `
          <div class="section-title">📝 Special Requests</div>
          <div class="info-row" style="background: #FFFDE7;">
            <span class="value">${enrollment.specialRequests}</span>
          </div>
          ` : ''}

          ${enrollment.message ? `
          <div class="section-title">💬 Customer Message</div>
          <div class="info-row" style="background: #FFFDE7;">
            <span class="value">${enrollment.message}</span>
          </div>
          ` : ''}

          <div class="info-row" style="margin-top: 20px; background: #E8F5E9; text-align: center;">
            <span class="value">Booking created on: ${new Date().toLocaleString('en-US', {
              timeZone: BELGIUM_TIMEZONE,
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} (Brussels time)</span>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from ZenYourLife Booking System</p>
          <p>© ${new Date().getFullYear()} ZenYourLife. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Shared formatter for cancellation emails — accepts either an Enrollment or Appointment doc
const formatBookingForCancellation = (booking) => {
  const belgiumDateStr = getBelgiumDateStr(booking.appointmentDate);
  const [yr, mo, dy] = belgiumDateStr.split('-').map(Number);
  const formattedDate = new Date(Date.UTC(yr, mo - 1, dy)).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const durationMinutes = booking.service?.duration || 60;
  const timeSlot = getTimeSlot(booking.appointmentTime, durationMinutes);
  const fullName = booking.fullName || `${booking.firstName || ''} ${booking.lastName || ''}`.trim();
  return { formattedDate, durationMinutes, timeSlot, fullName };
};

// Customer cancellation confirmation email
const generateCustomerCancellationEmail = (booking) => {
  const { formattedDate, durationMinutes, timeSlot } = formatBookingForCancellation(booking);
  const reference = booking.enrollmentId ? `#${booking.enrollmentId}` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #B71C1C 0%, #8b1414 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0 0 10px 0; font-size: 26px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .notice-box { background: #FFEBEE; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #B71C1C; }
        .info-row { margin: 10px 0; padding: 12px 15px; background: white; border-radius: 5px; }
        .label { font-weight: 600; color: #555; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Appointment Cancelled</h1>
          ${reference ? `<p>Booking Reference: ${reference}</p>` : ''}
        </div>
        <div class="content">
          <div class="notice-box">
            <p style="margin: 0;">Hi ${booking.firstName}, your appointment has been cancelled. The following booking is no longer active:</p>
          </div>

          <div class="info-row">
            <span class="label">Service:</span>
            <span class="value">${booking.serviceTitle}</span>
          </div>
          <div class="info-row">
            <span class="label">Date:</span>
            <span class="value">${formattedDate}</span>
          </div>
          <div class="info-row">
            <span class="label">Time:</span>
            <span class="value">${timeSlot} <span style="color:#888;font-size:12px;">(Belgian time, ${durationMinutes} min)</span></span>
          </div>

          <div style="background: #E3F2FD; padding: 15px; border-radius: 8px; margin-top: 25px; text-align: center;">
            <p style="margin: 0; color: #1976D2;">You can book a new appointment anytime at <a href="${FRONTEND_URL}" style="color: #1976D2; font-weight: 600;">zenyourlife.be</a>.</p>
          </div>

          <div class="footer">
            <p>If you did not request this cancellation, please contact us immediately.</p>
            <p>Best regards,<br><strong>The ZenYourLife Team</strong></p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">© ${new Date().getFullYear()} ZenYourLife. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Admin cancellation notification email
const generateAdminCancellationEmail = (booking) => {
  const { formattedDate, durationMinutes, timeSlot, fullName } = formatBookingForCancellation(booking);
  const reference = booking.enrollmentId ? `#${booking.enrollmentId}` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #B71C1C 0%, #8b1414 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .alert-box { background: #FFEBEE; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #B71C1C; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
        .info-row { margin: 8px 0; padding: 10px; background: white; border-radius: 5px; }
        .label { font-weight: 600; color: #555; display: inline-block; width: 140px; }
        .value { color: #333; }
        .footer { text-align: center; padding: 15px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Booking Cancelled</h1>
          ${reference ? `<p>Booking ID: ${reference}</p>` : ''}
        </div>
        <div class="content">
          <div class="alert-box">
            <strong>A customer has cancelled their appointment.</strong> The time slot is now available again.
          </div>

          <div class="info-row"><span class="label">Customer:</span><span class="value">${fullName}</span></div>
          <div class="info-row"><span class="label">Email:</span><span class="value"><a href="mailto:${booking.email}">${booking.email}</a></span></div>
          <div class="info-row"><span class="label">Phone:</span><span class="value">${booking.phoneNumber || '—'}</span></div>
          <div class="info-row"><span class="label">Service:</span><span class="value">${booking.serviceTitle}</span></div>
          <div class="info-row"><span class="label">Date:</span><span class="value">${formattedDate}</span></div>
          <div class="info-row"><span class="label">Time:</span><span class="value">${timeSlot} (Belgian time, ${durationMinutes} min)</span></div>

          <div class="info-row" style="margin-top: 20px; background: #FFF3E0; text-align: center;">
            <span class="value">Cancelled on: ${new Date().toLocaleString('en-US', {
              timeZone: BELGIUM_TIMEZONE,
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} (Brussels time)</span>
          </div>

          <div class="footer">
            <p>This is an automated notification from ZenYourLife Booking System</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send cancellation notifications to both customer and admin. Errors are logged, never thrown.
exports.sendCancellationEmails = async (booking) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD ||
      process.env.EMAIL_USER === 'your-email@outlook.com' ||
      process.env.EMAIL_PASSWORD === 'your-app-password-here') {
    console.log('⏭️  Skipping cancellation emails (EMAIL_USER/EMAIL_PASSWORD not configured)');
    return;
  }

  const reference = booking.enrollmentId ? `#${booking.enrollmentId}` : '';
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  try {
    await transporter.sendMail({
      from: `"ZenYourLife" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: `Appointment Cancelled - ${booking.serviceTitle} | ZenYourLife`,
      html: generateCustomerCancellationEmail(booking)
    });
    console.log('📧 Cancellation email sent to customer:', booking.email);
  } catch (err) {
    console.error('❌ Error sending cancellation email to customer:', err.message);
  }

  try {
    await transporter.sendMail({
      from: `"ZenYourLife Booking System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `Cancellation ${reference} - ${booking.serviceTitle}`,
      html: generateAdminCancellationEmail(booking)
    });
    console.log('📧 Cancellation email sent to admin:', adminEmail);
  } catch (err) {
    console.error('❌ Error sending cancellation email to admin:', err.message);
  }
};

// Create new enrollment
exports.createEnrollment = async (req, res) => {
  try {
    const {
      serviceId,
      serviceTitle,
      selectedDate,
      selectedTime,
      firstName,
      lastName,
      email,
      phoneNumber,
      country,
      gender,
      specialRequests,
      message,
      reminderPreference
    } = req.body;

    // Validate required fields
    if (!serviceId || !selectedDate || !selectedTime || !firstName || !lastName || !email || !phoneNumber || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Convert selectedDate to proper Belgium midnight UTC timestamp
    // This ensures consistent storage regardless of which timezone the user booked from
    const appointmentDateUTC = getStartOfDayBelgium(selectedDate);

    // Get day of the week from the date in Belgium timezone
    const appointmentDay = new Intl.DateTimeFormat('en-US', {
      timeZone: BELGIUM_TIMEZONE,
      weekday: 'long'
    }).format(appointmentDateUTC);

    // Create enrollment (enrollmentId will be auto-generated)
    const enrollment = new Enrollment({
      service: serviceId,
      serviceTitle: serviceTitle || service.title,
      appointmentDate: appointmentDateUTC,
      appointmentDay: appointmentDay,
      appointmentTime: selectedTime,
      firstName,
      lastName,
      email,
      phoneNumber,
      country: country || 'BE',
      gender,
      specialRequests: specialRequests || '',
      message: message || '',
      reminderPreference: reminderPreference || 'email',
      status: 'confirmed'
    });

    await enrollment.save();

    // Token that authorizes the customer to cancel via the email link
    const cancellationToken = crypto.randomBytes(24).toString('hex');

    // Also create an appointment record to maintain booked slots functionality
    const appointment = await Appointment.create({
      service: serviceId,
      serviceTitle: serviceTitle || service.title,
      appointmentDate: appointmentDateUTC,
      appointmentTime: selectedTime,
      firstName,
      lastName,
      email,
      phoneNumber,
      country: country || 'BE',
      gender,
      specialRequests: specialRequests || '',
      message: message || '',
      status: 'confirmed',
      cancellationToken
    });

    const cancelUrl = `${FRONTEND_URL}/cancel/${appointment._id}?token=${cancellationToken}`;

    // Populate service details
    await enrollment.populate('service');

    // Console log the enrollment data with formatting
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                  📋 NEW ENROLLMENT CREATED                     ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('🆔 ENROLLMENT ID:', enrollment.enrollmentId);
    console.log('📅 DATABASE ID:', enrollment._id);
    console.log('🔗 CANCEL URL:', cancelUrl);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💆 SERVICE INFORMATION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Service Name:', enrollment.serviceTitle);
    console.log('  Category:', enrollment.service.category);
    console.log('  Duration:', enrollment.service.duration, 'minutes');
    console.log('  Price: €' + enrollment.service.price);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📅 APPOINTMENT SCHEDULE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Date:', new Date(enrollment.appointmentDate).toLocaleDateString('en-US', {
      timeZone: BELGIUM_TIMEZONE,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
    console.log('  Day:', enrollment.appointmentDay);
    console.log('  Time:', enrollment.appointmentTime);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 CUSTOMER INFORMATION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Full Name:', enrollment.fullName);
    console.log('  First Name:', enrollment.firstName);
    console.log('  Last Name:', enrollment.lastName);
    console.log('  Email:', enrollment.email);
    console.log('  Phone:', enrollment.phoneNumber);
    console.log('  Country:', enrollment.country);
    console.log('  Gender:', enrollment.gender);

    if (enrollment.specialRequests || enrollment.message) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💬 ADDITIONAL INFORMATION:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      if (enrollment.specialRequests) {
        console.log('  Special Requests:', enrollment.specialRequests);
      }
      if (enrollment.message) {
        console.log('  Message:', enrollment.message);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ℹ️  STATUS INFORMATION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Status:', enrollment.status.toUpperCase());
    console.log('  Created At:', new Date(enrollment.createdAt).toLocaleString('en-US', { timeZone: BELGIUM_TIMEZONE }));
    console.log('  Updated At:', new Date(enrollment.updatedAt).toLocaleString('en-US', { timeZone: BELGIUM_TIMEZONE }));

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                  ✅ ENROLLMENT SAVED SUCCESSFULLY               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Send confirmation emails (always send to customer regardless of reminder preference)
    let customerEmailSent = false;
    let adminEmailSent = false;
    let customerSmsSent = false;

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD &&
          process.env.EMAIL_USER !== 'your-email@outlook.com' &&
          process.env.EMAIL_PASSWORD !== 'your-app-password-here') {

        // ALWAYS send confirmation email to customer (reminder preference only affects 1-day-before reminder)
        try {
          const customerMailOptions = {
            from: `"ZenYourLife" <${process.env.EMAIL_USER}>`,
            to: enrollment.email,
            subject: `Booking Confirmed - ${enrollment.serviceTitle} | ZenYourLife`,
            html: generateCustomerEmailTemplate(enrollment, cancelUrl)
          };

          await transporter.sendMail(customerMailOptions);
          customerEmailSent = true;
          console.log('📧 Confirmation email sent to customer:', enrollment.email);
          console.log(`   (Reminder preference: ${reminderPreference} - will receive ${reminderPreference} reminder 1 day before)`);
        } catch (emailError) {
          console.error('❌ Error sending customer email:', emailError.message);
        }

        // Always send notification email to admin
        try {
          const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
          const adminMailOptions = {
            from: `"ZenYourLife Booking System" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `New Booking #${enrollment.enrollmentId} - ${enrollment.serviceTitle}`,
            html: generateAdminEmailTemplate(enrollment)
          };

          await transporter.sendMail(adminMailOptions);
          adminEmailSent = true;
          console.log('📧 Notification email sent to admin:', adminEmail);
        } catch (emailError) {
          console.error('❌ Error sending admin email:', emailError.message);
        }
      }
    } catch (emailError) {
      console.error('❌ Error with email setup:', emailError.message);
    }

    // Send immediate SMS confirmation if customer preference includes SMS
    if (reminderPreference === 'sms' || reminderPreference === 'both') {
      try {
        const formattedDate = formatAppointmentDate(enrollment.appointmentDate);
        const durationMinutes = enrollment.service?.duration || 60;
        const timeSlot = getTimeSlot(enrollment.appointmentTime, durationMinutes);

        const smsMessage = `Dear ${enrollment.firstName},

Your booking at Zen Your Life is confirmed!

Booking #${enrollment.enrollmentId}
Service: ${enrollment.serviceTitle}
Date: ${formattedDate}
Time: ${timeSlot} (Belgian time, ${durationMinutes} min)
Location: Schapenbaan 45, 1731 Relegem

Please arrive 5 minutes early.

Kind Regards,
Zen Your Life Team`;

        const formattedPhone = formatPhoneNumber(enrollment.phoneNumber, enrollment.country);
        customerSmsSent = await sendSms(formattedPhone, smsMessage);
        if (customerSmsSent) {
          console.log('📱 Confirmation SMS sent to customer:', formattedPhone);
        } else {
          console.log('❌ Failed to send confirmation SMS to customer:', formattedPhone);
        }
      } catch (smsError) {
        console.error('❌ Error sending confirmation SMS:', smsError.message);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('CONFIRMATION STATUS:');
    console.log('  Customer Email:', customerEmailSent ? '✅ Sent' : '❌ Not Sent');
    console.log('  Admin Email:', adminEmailSent ? '✅ Sent' : '❌ Not Sent');
    console.log('  Customer SMS:', (reminderPreference === 'sms' || reminderPreference === 'both')
      ? (customerSmsSent ? '✅ Sent' : '❌ Not Sent')
      : '⏭️  Skipped (email-only preference)');
    console.log('  Reminder Preference:', reminderPreference === 'sms' ? '📱 SMS' : reminderPreference === 'both' ? '📧📱 Email + SMS' : '📧 Email');
    console.log('═══════════════════════════════════════════════════════════════\n');

    res.status(201).json({
      success: true,
      message: customerEmailSent
        ? `Booking confirmed! Check your email for confirmation. You'll receive a ${reminderPreference === 'sms' ? 'SMS' : 'email'} reminder 1 day before your appointment.`
        : 'Booking confirmed successfully!',
      emailSent: customerEmailSent,
      data: enrollment
    });
  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════════════════════╗');
    console.error('║                  ❌ ENROLLMENT CREATION FAILED                  ║');
    console.error('╚════════════════════════════════════════════════════════════════╝');
    console.error('Error:', error.message);
    console.error('');

    res.status(400).json({
      success: false,
      message: 'Error creating enrollment',
      error: error.message
    });
  }
};

// Get all enrollments
exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('service')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollments',
      error: error.message
    });
  }
};

// Get single enrollment by ID
exports.getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id).populate('service');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollment',
      error: error.message
    });
  }
};

// Get enrollment by enrollment ID
exports.getEnrollmentByEnrollmentId = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      enrollmentId: req.params.enrollmentId
    }).populate('service');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollment',
      error: error.message
    });
  }
};

// Update enrollment status
exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('service');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Also update the corresponding appointment status
    // This ensures cancelled/completed enrollments free up the time slot
    await Appointment.findOneAndUpdate(
      {
        email: enrollment.email,
        appointmentDate: enrollment.appointmentDate,
        appointmentTime: enrollment.appointmentTime
      },
      { status }
    );

    res.status(200).json({
      success: true,
      message: 'Enrollment status updated successfully',
      data: enrollment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating enrollment',
      error: error.message
    });
  }
};

// Delete enrollment
exports.deleteEnrollment = async (req, res) => {
  try {
    // First find the enrollment to get its details before deleting
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Delete the corresponding appointment from Appointment collection
    // This ensures the time slot becomes available again
    await Appointment.findOneAndDelete({
      email: enrollment.email,
      appointmentDate: enrollment.appointmentDate,
      appointmentTime: enrollment.appointmentTime
    });

    // Now delete the enrollment
    await Enrollment.findByIdAndDelete(req.params.id);

    console.log(`✅ Deleted enrollment and corresponding appointment for ${enrollment.email} on ${enrollment.appointmentDate} at ${enrollment.appointmentTime}`);

    res.status(200).json({
      success: true,
      message: 'Enrollment and appointment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting enrollment',
      error: error.message
    });
  }
};

// Get unique users from enrollments
exports.getUniqueUsers = async (req, res) => {
  try {
    // Aggregate to get unique users by email with their info
    const users = await Enrollment.aggregate([
      {
        $group: {
          _id: '$email',
          firstName: { $first: '$firstName' },
          lastName: { $first: '$lastName' },
          fullName: { $first: '$fullName' },
          email: { $first: '$email' },
          phoneNumber: { $first: '$phoneNumber' },
          country: { $first: '$country' },
          gender: { $first: '$gender' },
          totalBookings: { $sum: 1 },
          firstBooking: { $min: '$createdAt' },
          lastBooking: { $max: '$createdAt' }
        }
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          firstName: 1,
          lastName: 1,
          fullName: 1,
          email: 1,
          phoneNumber: 1,
          country: 1,
          gender: 1,
          totalBookings: 1,
          firstBooking: 1,
          lastBooking: 1
        }
      },
      {
        $sort: { lastBooking: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching unique users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get user details by email
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Get user info from first enrollment
    const userInfo = await Enrollment.findOne({ email })
      .select('firstName lastName fullName email phoneNumber country gender')
      .lean();

    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all enrollments for this user
    const enrollments = await Enrollment.find({ email })
      .populate('service')
      .sort({ createdAt: -1 });

    // Calculate stats
    const stats = {
      totalBookings: enrollments.length,
      completedBookings: enrollments.filter(e => e.status === 'completed').length,
      pendingBookings: enrollments.filter(e => e.status === 'pending').length,
      cancelledBookings: enrollments.filter(e => e.status === 'cancelled').length
    };

    res.status(200).json({
      success: true,
      data: {
        user: userInfo,
        stats,
        bookings: enrollments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
};
