const BlockedDate = require('../models/BlockedDate');
const BookingSettings = require('../models/BookingSettings');
const Appointment = require('../models/Appointment');
const { BELGIUM_TIMEZONE, getStartOfDayBelgium, getEndOfDayBelgium } = require('../utils/timezone');

/**
 * Server-side booking validation middleware.
 * Checks: master switch, working day, blocked dates, time slot availability.
 * All date logic uses Belgium timezone (Europe/Brussels).
 */
const validateBooking = async (req, res, next) => {
  try {
    const { selectedDate, selectedTime } = req.body;

    if (!selectedDate || !selectedTime) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required'
      });
    }

    // 1. Get booking settings
    const settings = await BookingSettings.findOne({ settingsType: 'booking' });
    if (!settings) {
      return res.status(500).json({
        success: false,
        message: 'Booking settings not configured'
      });
    }

    // 2. Check master kill-switch
    if (!settings.isBookingEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Bookings are currently disabled'
      });
    }

    // 3. Determine day of week in Belgium timezone
    const appointmentDateUTC = getStartOfDayBelgium(selectedDate);
    const dayName = new Intl.DateTimeFormat('en-US', {
      timeZone: BELGIUM_TIMEZONE,
      weekday: 'long'
    }).format(appointmentDateUTC).toLowerCase();

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayNames.find(d => d === dayName);

    if (!dayKey) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date'
      });
    }

    // 4. Check if it's a working day
    const daySchedule = settings.weeklySchedule[dayKey];
    if (!daySchedule || !daySchedule.isWorking) {
      return res.status(400).json({
        success: false,
        message: `Cannot book on ${dayKey} — it is a closed/non-working day`
      });
    }

    // 5. Check if the requested time slot is valid for this day
    if (daySchedule.timeSlots.length > 0 && !daySchedule.timeSlots.includes(selectedTime)) {
      return res.status(400).json({
        success: false,
        message: `Time slot "${selectedTime}" is not available on ${dayKey}`
      });
    }

    // 6. Check blocked dates — `BlockedDate.date` is stored at UTC midnight of the Belgium
    // calendar day, so we query by an exact-day range rather than strict equality to be safe.
    const blockedDate = await BlockedDate.findOne({
      date: {
        $gte: getStartOfDayBelgium(selectedDate),
        $lte: getEndOfDayBelgium(selectedDate)
      },
      isActive: true
    });

    if (blockedDate) {
      if (blockedDate.isFullDayBlocked) {
        return res.status(400).json({
          success: false,
          message: `This date is fully blocked${blockedDate.reason ? ': ' + blockedDate.reason : ''}`
        });
      }

      // Check if the specific time slot is blocked
      if (blockedDate.blockedTimeSlots.includes(selectedTime)) {
        return res.status(400).json({
          success: false,
          message: `Time slot "${selectedTime}" is blocked on this date`
        });
      }
    }

    // 7. Check for double-booking (same date + same time already confirmed/pending)
    const startOfDay = getStartOfDayBelgium(selectedDate);
    const endOfDay = getEndOfDayBelgium(selectedDate);

    const existingAppointment = await Appointment.findOne({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      appointmentTime: selectedTime,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: `Time slot "${selectedTime}" is already booked on this date`
      });
    }

    // All checks passed
    next();
  } catch (error) {
    console.error('Booking validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating booking availability',
      error: error.message
    });
  }
};

module.exports = validateBooking;
