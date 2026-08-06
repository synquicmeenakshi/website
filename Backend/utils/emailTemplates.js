const BELGIUM_TIMEZONE = 'Europe/Brussels';
const { getTimeSlot } = require('./timezone');

// Email template for enrollment confirmation
exports.enrollmentConfirmationEmail = (enrollment) => {
  const durationMinutes = enrollment.service?.duration || 60;
  const timeSlot = getTimeSlot(enrollment.appointmentTime, durationMinutes);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #F4E5A1 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
          margin: -30px -30px 30px -30px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 20px 0;
        }
        .info-box {
          background-color: #f8f9fa;
          border-left: 4px solid #B8860B;
          padding: 15px;
          margin: 15px 0;
          border-radius: 5px;
        }
        .info-label {
          font-weight: bold;
          color: #B8860B;
          display: inline-block;
          width: 150px;
        }
        .info-value {
          color: #333;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background-color: #B8860B;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Booking Confirmed!</h1>
          <p style="margin: 10px 0 0 0;">Thank you for choosing ZenYourLife</p>
        </div>

        <div class="content">
          <p>Dear ${enrollment.fullName},</p>

          <p>Your appointment has been successfully confirmed! We're excited to welcome you.</p>

          <div class="info-box">
            <p style="margin: 5px 0;"><span class="info-label">Enrollment ID:</span> <span class="info-value">#${enrollment.enrollmentId}</span></p>
            <p style="margin: 5px 0;"><span class="info-label">Service:</span> <span class="info-value">${enrollment.serviceTitle}</span></p>
            <p style="margin: 5px 0;"><span class="info-label">Date:</span> <span class="info-value">${new Date(enrollment.appointmentDate).toLocaleDateString('en-US', { timeZone: BELGIUM_TIMEZONE, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
            <p style="margin: 5px 0;"><span class="info-label">Time:</span> <span class="info-value">${timeSlot} (Belgian time, ${durationMinutes} min)</span></p>
            <p style="margin: 5px 0;"><span class="info-label">Duration:</span> <span class="info-value">${enrollment.service.duration} minutes</span></p>
            <p style="margin: 5px 0;"><span class="info-label">Price:</span> <span class="info-value">€${enrollment.service.price}</span></p>
          </div>

          ${enrollment.specialRequests ? `
          <div class="info-box">
            <p style="margin: 5px 0;"><span class="info-label">Special Requests:</span></p>
            <p style="margin: 5px 0; padding-left: 10px;">${enrollment.specialRequests}</p>
          </div>
          ` : ''}

          <p><strong>What to Bring:</strong></p>
          <ul>
            <li>Please arrive 5 minutes early</li>
            <li>Wear comfortable clothing</li>
            <li>Bring any medical information if applicable</li>
          </ul>

          <p>If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.</p>

          <p style="margin-top: 20px;">Looking forward to seeing you!</p>

          <p style="margin-top: 20px;">
            <strong>Best regards,</strong><br>
            The ZenYourLife Team<br>
            📞 +32 123 456 789<br>
            📧 info@zenyouths.be
          </p>
        </div>

        <div class="footer">
          <p>© 2025 ZenYourLife. All rights reserved.</p>
          <p style="font-size: 12px; color: #999;">This is an automated confirmation email. Please do not reply directly to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for admin notification
exports.adminNotificationEmail = (enrollment) => {
  const durationMinutes = enrollment.service?.duration || 60;
  const timeSlot = getTimeSlot(enrollment.appointmentTime, durationMinutes);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          text-align: center;
          margin: -30px -30px 30px -30px;
        }
        .alert-badge {
          background-color: #B8860B;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          display: inline-block;
          margin-bottom: 10px;
        }
        .info-row {
          padding: 10px;
          border-bottom: 1px solid #eee;
          display: flex;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: bold;
          width: 180px;
          color: #4a5568;
        }
        .value {
          flex: 1;
          color: #2d3748;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="alert-badge">NEW BOOKING</div>
          <h2 style="margin: 10px 0;">New Appointment Booked</h2>
        </div>

        <div class="info-row">
          <div class="label">Enrollment ID:</div>
          <div class="value">#${enrollment.enrollmentId}</div>
        </div>

        <div class="info-row">
          <div class="label">Customer Name:</div>
          <div class="value">${enrollment.fullName}</div>
        </div>

        <div class="info-row">
          <div class="label">Email:</div>
          <div class="value">${enrollment.email}</div>
        </div>

        <div class="info-row">
          <div class="label">Phone:</div>
          <div class="value">${enrollment.phoneNumber}</div>
        </div>

        <div class="info-row">
          <div class="label">Service:</div>
          <div class="value">${enrollment.serviceTitle}</div>
        </div>

        <div class="info-row">
          <div class="label">Date:</div>
          <div class="value">${new Date(enrollment.appointmentDate).toLocaleDateString('en-US', { timeZone: BELGIUM_TIMEZONE, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>

        <div class="info-row">
          <div class="label">Time:</div>
          <div class="value">${timeSlot} (Belgian time, ${durationMinutes} min)</div>
        </div>

        <div class="info-row">
          <div class="label">Duration:</div>
          <div class="value">${enrollment.service.duration} minutes</div>
        </div>

        <div class="info-row">
          <div class="label">Price:</div>
          <div class="value">€${enrollment.service.price}</div>
        </div>

        ${enrollment.specialRequests ? `
        <div class="info-row">
          <div class="label">Special Requests:</div>
          <div class="value">${enrollment.specialRequests}</div>
        </div>
        ` : ''}

        ${enrollment.message ? `
        <div class="info-row">
          <div class="label">Message:</div>
          <div class="value">${enrollment.message}</div>
        </div>
        ` : ''}

        <div class="info-row">
          <div class="label">Status:</div>
          <div class="value" style="color: #10b981; font-weight: bold;">${enrollment.status.toUpperCase()}</div>
        </div>

        <div class="info-row">
          <div class="label">Booked At:</div>
          <div class="value">${new Date(enrollment.createdAt).toLocaleString('en-BE', { timeZone: BELGIUM_TIMEZONE })}</div>
        </div>
      </div>
    </body>
    </html>
  `;
};
