const RentalBooking = require('../models/RentalBooking');
const nodemailer = require('nodemailer');
const { getStartOfDayBelgium, getEndOfDayBelgium, formatBelgiumDate, BELGIUM_TIMEZONE } = require('../utils/timezone');

// Create a new rental booking
exports.createRentalBooking = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      specialRequests,
      message,
      property,
      booking
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !gender) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled'
      });
    }

    // Parse the dates from booking info
    let checkInDate = new Date();
    let checkOutDate = new Date();
    let numberOfNights = 1;

    if (booking) {
      // New format with checkInDate and checkOutDate
      if (booking.checkInDate) {
        checkInDate = new Date(booking.checkInDate);
      }
      if (booking.checkOutDate) {
        checkOutDate = new Date(booking.checkOutDate);
      }
      if (booking.nights) {
        numberOfNights = booking.nights;
      } else if (booking.checkInDate && booking.checkOutDate) {
        // Calculate nights from dates
        const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
        numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      // Legacy support for old format
      if (!booking.checkInDate && booking.fullDate) {
        checkInDate = new Date(booking.fullDate);
        checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + 1);
      }
    }

    // Calculate total price
    const pricePerNight = property?.price || 0;
    const totalPrice = pricePerNight * numberOfNights;
    const deposit = totalPrice * 0.3; // 30% deposit

    // Create the rental booking
    const rentalBooking = await RentalBooking.create({
      firstName,
      lastName,
      email,
      phone,
      gender,
      property: property ? {
        propertyId: property.propertyId || null,
        name: property.name,
        price: property.price,
        guests: property.guests,
        bedrooms: property.bedrooms,
        parking: property.parking
      } : null,
      booking: {
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        checkInTime: booking?.checkInTime || '10:30 AM',
        checkOutTime: booking?.checkOutTime || '10:00 AM',
        numberOfNights: numberOfNights,
        totalPrice: totalPrice
      },
      specialRequests: specialRequests || '',
      message: message || '',
      status: 'confirmed',
      payment: {
        totalAmount: totalPrice,
        deposit: deposit,
        depositPaid: false,
        remainingBalance: totalPrice,
        paymentStatus: 'pending'
      }
    });

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║            📧 RENTAL BOOKING SAVED TO DATABASE                 ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    console.log('Booking ID:', rentalBooking.bookingId);
    console.log('Customer:', `${firstName} ${lastName}`);
    console.log('Email:', email);
    console.log('Property:', property?.name || 'N/A');
    console.log('Check-in Date:', checkInDate.toDateString());
    console.log('Check-out Date:', checkOutDate.toDateString());
    console.log('Number of Nights:', numberOfNights);
    console.log('Total Price:', `€${totalPrice}`);
    console.log('Status:', rentalBooking.status);

    // Send confirmation emails
    let emailSent = false;
    let adminEmailSent = false;
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD &&
          process.env.EMAIL_USER !== 'your-email@outlook.com' &&
          process.env.EMAIL_PASSWORD !== 'your-app-password-here') {

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });

        // Send email to customer
        const customerEmailHTML = generateCustomerEmailTemplate(rentalBooking);
        const customerMailOptions = {
          from: `"ZenYourLife Rentals" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `Thank You for Your Booking! - ZenYourLife`,
          html: customerEmailHTML
        };

        await transporter.sendMail(customerMailOptions);
        emailSent = true;
        console.log('\n✅ CUSTOMER EMAIL SENT SUCCESSFULLY!');

        // Send email to admin
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        const adminEmailHTML = generateAdminEmailTemplate(rentalBooking);
        const adminMailOptions = {
          from: `"ZenYourLife Booking System" <${process.env.EMAIL_USER}>`,
          to: adminEmail,
          subject: `New Rental Booking #${rentalBooking.bookingId} - ${firstName} ${lastName}`,
          html: adminEmailHTML
        };

        await transporter.sendMail(adminMailOptions);
        adminEmailSent = true;
        console.log('\n✅ ADMIN EMAIL SENT SUCCESSFULLY!');

        // Update email status in database
        rentalBooking.emailSent = true;
        await rentalBooking.save();
      }
    } catch (emailError) {
      console.error('\n❌ Error sending email:', emailError.message);
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                  ✅ BOOKING CREATED SUCCESSFULLY               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    res.status(201).json({
      success: true,
      message: emailSent ? 'Booking confirmed! Check your email for confirmation.' : 'Booking confirmed successfully',
      emailSent: emailSent,
      data: rentalBooking
    });

  } catch (error) {
    console.error('\n❌ Error creating rental booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Get all rental bookings
exports.getAllRentalBookings = async (req, res) => {
  try {
    const { status, email, startDate, endDate } = req.query;
    let query = {};

    // Apply filters
    if (status) query.status = status;
    if (email) query.email = email.toLowerCase();
    if (startDate || endDate) {
      query['booking.checkInDate'] = {};
      // Use Belgium timezone for date filtering
      if (startDate) query['booking.checkInDate'].$gte = getStartOfDayBelgium(startDate);
      if (endDate) query['booking.checkInDate'].$lte = getEndOfDayBelgium(endDate);
    }

    const bookings = await RentalBooking.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error('Error fetching rental bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// Get single rental booking by ID
exports.getRentalBookingById = async (req, res) => {
  try {
    const booking = await RentalBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

// Update rental booking status
exports.updateRentalBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const booking = await RentalBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { depositPaid, paymentStatus } = req.body;

    const updateData = {};
    if (depositPaid !== undefined) updateData['payment.depositPaid'] = depositPaid;
    if (paymentStatus) updateData['payment.paymentStatus'] = paymentStatus;

    if (depositPaid) {
      // Calculate remaining balance when deposit is paid
      const booking = await RentalBooking.findById(req.params.id);
      if (booking) {
        updateData['payment.remainingBalance'] = booking.payment.totalAmount - booking.payment.deposit;
      }
    }

    const updatedBooking = await RentalBooking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: updatedBooking
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
};

// Cancel rental booking
exports.cancelRentalBooking = async (req, res) => {
  try {
    const booking = await RentalBooking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};

// Delete rental booking
exports.deleteRentalBooking = async (req, res) => {
  try {
    const booking = await RentalBooking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting booking',
      error: error.message
    });
  }
};

// Helper function to generate customer email template (Thank you email)
function generateCustomerEmailTemplate(booking) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4A90E2 0%, #7DB4E6 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0 0 10px 0; font-size: 28px; }
        .header p { margin: 0; opacity: 0.9; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .thank-you-box { background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; border-left: 4px solid #4CAF50; }
        .thank-you-box h2 { color: #2E7D32; margin: 0 0 10px 0; }
        .thank-you-box p { color: #555; margin: 0; }
        .section-title { font-size: 18px; font-weight: bold; color: #4A90E2; margin: 25px 0 15px 0; border-bottom: 2px solid #4A90E2; padding-bottom: 5px; }
        .info-row { margin: 10px 0; padding: 12px 15px; background: white; border-radius: 5px; display: flex; justify-content: space-between; }
        .label { font-weight: 600; color: #555; }
        .value { color: #333; }
        .property-highlight { background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4A90E2; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        .contact-info { background: #fff; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Thank You for Choosing Us!</h1>
          <p>Booking Reference: #${booking.bookingId}</p>
        </div>
        <div class="content">
          <div class="thank-you-box">
            <h2>Thank You, ${booking.firstName}!</h2>
            <p>We truly appreciate your trust in ZenYourLife. Our team will review your booking and get back to you shortly with your confirmation details.</p>
          </div>

          <h3 style="color: #333;">Dear ${booking.firstName} ${booking.lastName},</h3>
          <p>We have received your rental property booking request and are excited to help you plan your perfect stay!</p>

          ${booking.property ? `
          <div class="property-highlight">
            <h3 style="margin-top: 0; color: #1976D2;">🏠 ${booking.property.name}</h3>
            <div style="margin-top: 15px;">
              <div style="margin: 8px 0;"><strong>Price:</strong> €${booking.property.price} per night</div>
              <div style="margin: 8px 0;"><strong>Guests:</strong> ${booking.property.guests} guests</div>
              <div style="margin: 8px 0;"><strong>Bedrooms:</strong> ${booking.property.bedrooms} bedrooms</div>
              <div style="margin: 8px 0;"><strong>Parking:</strong> ${booking.property.parking}</div>
            </div>
          </div>
          ` : ''}

          <div class="section-title">📅 Your Booking Details</div>
          <div class="info-row">
            <span class="label">Check-in Date:</span>
            <span class="value">${booking.booking.checkInDate.toLocaleDateString('en-US', { timeZone: 'Europe/Brussels', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div class="info-row">
            <span class="label">Check-out Date:</span>
            <span class="value">${booking.booking.checkOutDate ? booking.booking.checkOutDate.toLocaleDateString('en-US', { timeZone: 'Europe/Brussels', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Number of Nights:</span>
            <span class="value">${booking.booking.numberOfNights} night${booking.booking.numberOfNights > 1 ? 's' : ''}</span>
          </div>
          <div class="info-row">
            <span class="label">Check-in Time:</span>
            <span class="value">${booking.booking.checkInTime}</span>
          </div>
          <div class="info-row">
            <span class="label">Check-out Time:</span>
            <span class="value">${booking.booking.checkOutTime}</span>
          </div>

          <div class="section-title">💰 Payment Summary</div>
          <div class="info-row">
            <span class="label">Total Amount:</span>
            <span class="value">€${booking.payment.totalAmount}</span>
          </div>
          <div class="info-row">
            <span class="label">Deposit (30%):</span>
            <span class="value">€${booking.payment.deposit}</span>
          </div>

          <div class="contact-info">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #4A90E2;">What happens next?</p>
            <p style="margin: 0; color: #666; font-size: 14px;">Our team will review your booking and contact you within 24 hours to confirm availability and provide payment instructions.</p>
          </div>

          <div class="footer">
            <p>If you have any questions, feel free to reach out to us.</p>
            <p>Best regards,<br><strong>The ZenYourLife Team</strong></p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">© ${new Date().getFullYear()} ZenYourLife. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Helper function to generate admin notification email template
function generateAdminEmailTemplate(booking) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0 0 10px 0; font-size: 24px; }
        .header p { margin: 0; opacity: 0.9; font-size: 14px; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .alert-box { background: #FFF3E0; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #FF9800; }
        .section-title { font-size: 16px; font-weight: bold; color: #555; margin: 20px 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #ddd; }
        .info-row { margin: 8px 0; padding: 10px; background: white; border-radius: 5px; }
        .label { font-weight: 600; color: #555; display: inline-block; width: 140px; }
        .value { color: #333; }
        .customer-info { background: #E3F2FD; padding: 20px; border-radius: 10px; margin: 15px 0; }
        .property-info { background: #F3E5F5; padding: 20px; border-radius: 10px; margin: 15px 0; }
        .booking-info { background: #E8F5E9; padding: 20px; border-radius: 10px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; background: #f9f9f9; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Rental Booking Received!</h1>
          <p>Booking ID: #${booking.bookingId}</p>
        </div>
        <div class="content">
          <div class="alert-box">
            <strong>⚡ Action Required:</strong> A new rental booking has been submitted and requires your attention.
          </div>

          <div class="customer-info">
            <div class="section-title">👤 Customer Information</div>
            <div class="info-row">
              <span class="label">Name:</span>
              <span class="value">${booking.firstName} ${booking.lastName}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value"><a href="mailto:${booking.email}">${booking.email}</a></span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span class="value">${booking.phone}</span>
            </div>
            <div class="info-row">
              <span class="label">Gender:</span>
              <span class="value">${booking.gender}</span>
            </div>
          </div>

          ${booking.property ? `
          <div class="property-info">
            <div class="section-title">🏠 Property Details</div>
            <div class="info-row">
              <span class="label">Property:</span>
              <span class="value">${booking.property.name}</span>
            </div>
            <div class="info-row">
              <span class="label">Price:</span>
              <span class="value">€${booking.property.price} per night</span>
            </div>
            <div class="info-row">
              <span class="label">Guests:</span>
              <span class="value">${booking.property.guests}</span>
            </div>
            <div class="info-row">
              <span class="label">Bedrooms:</span>
              <span class="value">${booking.property.bedrooms}</span>
            </div>
            <div class="info-row">
              <span class="label">Parking:</span>
              <span class="value">${booking.property.parking}</span>
            </div>
          </div>
          ` : ''}

          <div class="booking-info">
            <div class="section-title">📅 Booking Details</div>
            <div class="info-row">
              <span class="label">Check-in Date:</span>
              <span class="value">${booking.booking.checkInDate.toLocaleDateString('en-US', { timeZone: 'Europe/Brussels', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="info-row">
              <span class="label">Check-out Date:</span>
              <span class="value">${booking.booking.checkOutDate ? booking.booking.checkOutDate.toLocaleDateString('en-US', { timeZone: 'Europe/Brussels', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Number of Nights:</span>
              <span class="value">${booking.booking.numberOfNights} night${booking.booking.numberOfNights > 1 ? 's' : ''}</span>
            </div>
            <div class="info-row">
              <span class="label">Check-in Time:</span>
              <span class="value">${booking.booking.checkInTime}</span>
            </div>
            <div class="info-row">
              <span class="label">Check-out Time:</span>
              <span class="value">${booking.booking.checkOutTime}</span>
            </div>
            <div class="info-row">
              <span class="label">Total Amount:</span>
              <span class="value">€${booking.payment.totalAmount}</span>
            </div>
            <div class="info-row">
              <span class="label">Deposit (30%):</span>
              <span class="value">€${booking.payment.deposit}</span>
            </div>
          </div>

          ${booking.specialRequests ? `
          <div class="section-title">📝 Special Requests</div>
          <div class="info-row" style="background: #FFFDE7;">
            <span class="value">${booking.specialRequests}</span>
          </div>
          ` : ''}

          ${booking.message ? `
          <div class="section-title">💬 Customer Message</div>
          <div class="info-row" style="background: #FFFDE7;">
            <span class="value">${booking.message}</span>
          </div>
          ` : ''}

          <div class="info-row" style="margin-top: 20px; background: #E3F2FD; text-align: center;">
            <span class="value">Booking submitted on: ${new Date().toLocaleString('en-US', {
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
}
