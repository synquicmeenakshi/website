const express = require('express');
const router = express.Router();
const BlockedDate = require('../models/BlockedDate');
const BookingSettings = require('../models/BookingSettings');
const Appointment = require('../models/Appointment');
const { BELGIUM_TIMEZONE, getStartOfDayBelgium, getEndOfDayBelgium, getBelgiumDateStr } = require('../utils/timezone');

// ==================== BOOKING SETTINGS ROUTES ====================

// GET booking settings (time slots, weekly schedule, etc.)
router.get('/settings', async (req, res) => {
  try {
    let settings = await BookingSettings.findOne({ settingsType: 'booking' });

    // If no settings exist, create default with weekly schedule
    if (!settings) {
      settings = await BookingSettings.create({
        settingsType: 'booking',
        timeSlots: ['12:30', '1:30', '2:30', '3:30', '4:30', '5:30'],
        weeklySchedule: {
          sunday: { isWorking: false, timeSlots: [] },
          monday: { isWorking: true, timeSlots: ['12:30', '1:30', '2:30', '3:30', '4:30', '5:30'] },
          tuesday: { isWorking: true, timeSlots: ['12:30', '1:30', '2:30', '3:30', '4:30', '5:30'] },
          wednesday: { isWorking: true, timeSlots: ['12:30', '1:30', '2:30', '3:30', '4:30', '5:30'] },
          thursday: { isWorking: true, timeSlots: ['12:30', '1:30', '2:30', '3:30', '4:30', '5:30'] },
          friday: { isWorking: true, timeSlots: ['12:30', '1:30', '2:30', '3:30', '4:30', '5:30'] },
          saturday: { isWorking: false, timeSlots: [] }
        }
      });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching booking settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking settings',
      error: error.message
    });
  }
});

// PUT update booking settings (time slots, weekly schedule, etc.)
router.put('/settings', async (req, res) => {
  try {
    const { timeSlots, minAdvanceBooking, maxAdvanceBooking, isBookingEnabled, weeklySchedule } = req.body;

    let settings = await BookingSettings.findOne({ settingsType: 'booking' });

    if (!settings) {
      settings = new BookingSettings({ settingsType: 'booking' });
    }

    if (timeSlots) settings.timeSlots = timeSlots;
    if (minAdvanceBooking !== undefined) settings.minAdvanceBooking = minAdvanceBooking;
    if (maxAdvanceBooking !== undefined) settings.maxAdvanceBooking = maxAdvanceBooking;
    if (isBookingEnabled !== undefined) settings.isBookingEnabled = isBookingEnabled;
    if (weeklySchedule) settings.weeklySchedule = weeklySchedule;

    await settings.save();

    console.log('✅ Booking settings updated');

    res.status(200).json({
      success: true,
      message: 'Booking settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating booking settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking settings',
      error: error.message
    });
  }
});

// PUT update specific day schedule
router.put('/settings/day/:day', async (req, res) => {
  try {
    const { day } = req.params;
    const { isWorking, timeSlots } = req.body;

    const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    if (!validDays.includes(day.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day. Must be one of: ' + validDays.join(', ')
      });
    }

    let settings = await BookingSettings.findOne({ settingsType: 'booking' });

    if (!settings) {
      settings = new BookingSettings({ settingsType: 'booking' });
    }

    // Update the specific day's schedule
    settings.weeklySchedule[day.toLowerCase()] = {
      isWorking: isWorking !== undefined ? isWorking : settings.weeklySchedule[day.toLowerCase()].isWorking,
      timeSlots: timeSlots || settings.weeklySchedule[day.toLowerCase()].timeSlots
    };

    await settings.save();

    console.log(`✅ ${day} schedule updated`);

    res.status(200).json({
      success: true,
      message: `${day} schedule updated successfully`,
      data: settings.weeklySchedule[day.toLowerCase()]
    });
  } catch (error) {
    console.error('Error updating day schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update day schedule',
      error: error.message
    });
  }
});

// GET time slots for a specific date (considering day of week and blocked dates)
router.get('/available-slots/:date', async (req, res) => {
  try {
    const checkDate = new Date(req.params.date);
    checkDate.setUTCHours(0, 0, 0, 0);

    // Use Belgium timezone for day-of-week to avoid UTC mismatch
    const dayOfWeek = new Intl.DateTimeFormat('en-US', {
      timeZone: BELGIUM_TIMEZONE,
      weekday: 'long'
    }).format(getStartOfDayBelgium(req.params.date)).toLowerCase();

    // Get settings
    let settings = await BookingSettings.findOne({ settingsType: 'booking' });
    if (!settings) {
      settings = await BookingSettings.create({ settingsType: 'booking' });
    }

    // Check if it's a working day
    const daySchedule = settings.weeklySchedule[dayOfWeek];
    if (!daySchedule.isWorking) {
      return res.status(200).json({
        success: true,
        date: checkDate.toISOString(),
        dayOfWeek,
        isWorkingDay: false,
        availableSlots: [],
        blockedSlots: [],
        message: `${dayOfWeek} is not a working day`
      });
    }

    // Check for blocked date using Belgium-day range to avoid UTC boundary mismatch
    const blockedDate = await BlockedDate.findOne({
      date: {
        $gte: getStartOfDayBelgium(req.params.date),
        $lte: getEndOfDayBelgium(req.params.date)
      },
      isActive: true
    });

    let availableSlots = [...daySchedule.timeSlots];
    let blockedSlots = [];

    if (blockedDate) {
      if (blockedDate.isFullDayBlocked) {
        return res.status(200).json({
          success: true,
          date: checkDate.toISOString(),
          dayOfWeek,
          isWorkingDay: true,
          isFullDayBlocked: true,
          availableSlots: [],
          blockedSlots: daySchedule.timeSlots,
          message: 'This date is fully blocked'
        });
      } else {
        // Remove blocked time slots from available slots
        blockedSlots = blockedDate.blockedTimeSlots;
        availableSlots = availableSlots.filter(slot => !blockedSlots.includes(slot));
      }
    }

    res.status(200).json({
      success: true,
      date: checkDate.toISOString(),
      dayOfWeek,
      isWorkingDay: true,
      isFullDayBlocked: false,
      availableSlots,
      blockedSlots,
      allDaySlots: daySchedule.timeSlots
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available slots',
      error: error.message
    });
  }
});

// ==================== BLOCKED DATES ROUTES ====================

// GET all blocked dates (for admin)
router.get('/', async (req, res) => {
  try {
    const blockedDates = await BlockedDate.find({}).sort({ date: 1 });
    res.status(200).json({
      success: true,
      count: blockedDates.length,
      data: blockedDates
    });
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blocked dates',
      error: error.message
    });
  }
});

// GET active blocked dates (for frontend booking)
router.get('/active', async (req, res) => {
  try {
    const blockedDates = await BlockedDate.find({ isActive: true });

    // Return structured data with date, dateStr (Belgium calendar YYYY-MM-DD), isFullDayBlocked, and blockedTimeSlots
    // dateStr is the authoritative comparison key — immune to browser timezone
    const data = blockedDates.map(bd => ({
      date: bd.date.toISOString(),
      dateStr: getBelgiumDateStr(bd.date),
      isFullDayBlocked: bd.isFullDayBlocked,
      blockedTimeSlots: bd.blockedTimeSlots || []
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error('Error fetching active blocked dates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blocked dates',
      error: error.message
    });
  }
});

// POST - Block a new date (with optional specific time slots)
router.post('/', async (req, res) => {
  try {
    const { date, reason, blockedTimeSlots } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    // Normalize the date to start of day (UTC)
    const blockedDate = new Date(date);
    blockedDate.setUTCHours(0, 0, 0, 0);

    // Check for existing confirmed/pending bookings on this date
    const startOfDay = getStartOfDayBelgium(date);
    const endOfDay = getEndOfDayBelgium(date);

    const isFullDay = !blockedTimeSlots || blockedTimeSlots.length === 0;

    if (isFullDay) {
      // Full day block — reject if ANY booking exists on this day
      const existingBooking = await Appointment.findOne({
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['confirmed', 'pending'] }
      });
      if (existingBooking) {
        return res.status(409).json({
          success: false,
          message: `Cannot block this date — there is already a confirmed booking at ${existingBooking.appointmentTime}. Cancel or reschedule the booking first.`
        });
      }
    } else {
      // Partial block — reject only if a booking exists on one of the requested slots
      const conflictingBooking = await Appointment.findOne({
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        appointmentTime: { $in: blockedTimeSlots },
        status: { $in: ['confirmed', 'pending'] }
      });
      if (conflictingBooking) {
        return res.status(409).json({
          success: false,
          message: `Cannot block time slot "${conflictingBooking.appointmentTime}" — there is already a confirmed booking. Cancel or reschedule the booking first.`
        });
      }
    }

    // Check if this exact date already exists
    const existingBlock = await BlockedDate.findOne({ date: blockedDate });

    if (existingBlock) {
      // If blocking specific time slots, merge them
      if (blockedTimeSlots && blockedTimeSlots.length > 0) {
        // Add new time slots to existing ones (avoid duplicates)
        const mergedSlots = [...new Set([...existingBlock.blockedTimeSlots, ...blockedTimeSlots])];
        existingBlock.blockedTimeSlots = mergedSlots;
        existingBlock.isFullDayBlocked = false;
        if (reason) existingBlock.reason = reason;
        await existingBlock.save();

        return res.status(200).json({
          success: true,
          message: 'Time slots added to existing blocked date',
          data: existingBlock
        });
      } else {
        // Trying to block whole day when already blocked
        return res.status(400).json({
          success: false,
          message: 'This date is already blocked'
        });
      }
    }

    // Create new blocked date
    const newBlockedDate = await BlockedDate.create({
      date: blockedDate,
      reason: reason || '',
      blockedTimeSlots: blockedTimeSlots || [],
      isFullDayBlocked: isFullDay
    });

    console.log('✅ Date blocked:', blockedDate.toISOString(), isFullDay ? '(Full Day)' : `(Slots: ${blockedTimeSlots.join(', ')})`);

    res.status(201).json({
      success: true,
      message: isFullDay ? 'Full day blocked successfully' : 'Time slots blocked successfully',
      data: newBlockedDate
    });
  } catch (error) {
    console.error('Error blocking date:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block date',
      error: error.message
    });
  }
});

// POST - Block multiple dates at once
router.post('/bulk', async (req, res) => {
  try {
    const { dates, reason, blockedTimeSlots } = req.body;

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dates array is required'
      });
    }

    const results = {
      blocked: [],
      skipped: [],
      conflicting: []
    };

    const isFullDay = !blockedTimeSlots || blockedTimeSlots.length === 0;

    for (const dateStr of dates) {
      const blockedDate = new Date(dateStr);
      blockedDate.setUTCHours(0, 0, 0, 0);

      // Check for existing confirmed/pending bookings on this date
      const startOfDay = getStartOfDayBelgium(dateStr);
      const endOfDay = getEndOfDayBelgium(dateStr);

      let hasConflict = false;
      if (isFullDay) {
        const existingBooking = await Appointment.findOne({
          appointmentDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $in: ['confirmed', 'pending'] }
        });
        if (existingBooking) {
          results.conflicting.push({ date: blockedDate.toISOString(), slot: existingBooking.appointmentTime });
          hasConflict = true;
        }
      } else {
        const conflictingBooking = await Appointment.findOne({
          appointmentDate: { $gte: startOfDay, $lte: endOfDay },
          appointmentTime: { $in: blockedTimeSlots },
          status: { $in: ['confirmed', 'pending'] }
        });
        if (conflictingBooking) {
          results.conflicting.push({ date: blockedDate.toISOString(), slot: conflictingBooking.appointmentTime });
          hasConflict = true;
        }
      }

      if (hasConflict) continue;

      const existingBlock = await BlockedDate.findOne({ date: blockedDate });

      if (existingBlock && isFullDay) {
        results.skipped.push(blockedDate.toISOString());
      } else if (existingBlock) {
        // Merge time slots
        const mergedSlots = [...new Set([...existingBlock.blockedTimeSlots, ...blockedTimeSlots])];
        existingBlock.blockedTimeSlots = mergedSlots;
        existingBlock.isFullDayBlocked = false;
        await existingBlock.save();
        results.blocked.push(blockedDate.toISOString());
      } else {
        await BlockedDate.create({
          date: blockedDate,
          reason: reason || '',
          blockedTimeSlots: blockedTimeSlots || [],
          isFullDayBlocked: isFullDay
        });
        results.blocked.push(blockedDate.toISOString());
      }
    }

    console.log('✅ Bulk dates blocked:', results.blocked.length, '| Conflicting:', results.conflicting.length);

    const conflictMsg = results.conflicting.length > 0
      ? `, ${results.conflicting.length} skipped due to existing bookings`
      : '';

    res.status(201).json({
      success: true,
      message: `Blocked ${results.blocked.length} dates, skipped ${results.skipped.length} (already blocked)${conflictMsg}`,
      data: results
    });
  } catch (error) {
    console.error('Error bulk blocking dates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block dates',
      error: error.message
    });
  }
});

// PUT - Toggle blocked date status
router.put('/:id/toggle', async (req, res) => {
  try {
    const blockedDate = await BlockedDate.findById(req.params.id);

    if (!blockedDate) {
      return res.status(404).json({
        success: false,
        message: 'Blocked date not found'
      });
    }

    blockedDate.isActive = !blockedDate.isActive;
    await blockedDate.save();

    console.log('✅ Blocked date toggled:', blockedDate.date, blockedDate.isActive);

    res.status(200).json({
      success: true,
      message: `Date ${blockedDate.isActive ? 'blocked' : 'unblocked'} successfully`,
      data: blockedDate
    });
  } catch (error) {
    console.error('Error toggling blocked date:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle blocked date',
      error: error.message
    });
  }
});

// PUT - Update blocked date (reason, time slots, etc.)
router.put('/:id', async (req, res) => {
  try {
    const { reason, isActive, blockedTimeSlots } = req.body;

    const blockedDate = await BlockedDate.findById(req.params.id);

    if (!blockedDate) {
      return res.status(404).json({
        success: false,
        message: 'Blocked date not found'
      });
    }

    if (reason !== undefined) blockedDate.reason = reason;
    if (isActive !== undefined) blockedDate.isActive = isActive;
    if (blockedTimeSlots !== undefined) {
      blockedDate.blockedTimeSlots = blockedTimeSlots;
      blockedDate.isFullDayBlocked = blockedTimeSlots.length === 0;
    }

    await blockedDate.save();

    res.status(200).json({
      success: true,
      message: 'Blocked date updated successfully',
      data: blockedDate
    });
  } catch (error) {
    console.error('Error updating blocked date:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blocked date',
      error: error.message
    });
  }
});

// DELETE - Remove a blocked date
router.delete('/:id', async (req, res) => {
  try {
    const blockedDate = await BlockedDate.findByIdAndDelete(req.params.id);

    if (!blockedDate) {
      return res.status(404).json({
        success: false,
        message: 'Blocked date not found'
      });
    }

    console.log('✅ Blocked date removed:', blockedDate.date);

    res.status(200).json({
      success: true,
      message: 'Blocked date removed successfully'
    });
  } catch (error) {
    console.error('Error removing blocked date:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove blocked date',
      error: error.message
    });
  }
});

// DELETE - Remove specific time slot from a blocked date
router.delete('/:id/slot/:slot', async (req, res) => {
  try {
    const blockedDate = await BlockedDate.findById(req.params.id);
    const slotToRemove = decodeURIComponent(req.params.slot);

    if (!blockedDate) {
      return res.status(404).json({
        success: false,
        message: 'Blocked date not found'
      });
    }

    // Remove the specific time slot
    blockedDate.blockedTimeSlots = blockedDate.blockedTimeSlots.filter(slot => slot !== slotToRemove);

    // If no more time slots, delete the entire record
    if (blockedDate.blockedTimeSlots.length === 0 && !blockedDate.isFullDayBlocked) {
      await BlockedDate.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Last time slot removed, blocked date deleted'
      });
    }

    await blockedDate.save();

    res.status(200).json({
      success: true,
      message: 'Time slot removed successfully',
      data: blockedDate
    });
  } catch (error) {
    console.error('Error removing time slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove time slot',
      error: error.message
    });
  }
});

// Check if a specific date is blocked (with time slot info)
router.get('/check/:date', async (req, res) => {
  try {
    // Normalize using Belgium timezone to avoid day-boundary mismatch
    const checkDate = new Date(getStartOfDayBelgium(req.params.date));
    checkDate.setUTCHours(0, 0, 0, 0);

    const blockedDate = await BlockedDate.findOne({
      date: {
        $gte: getStartOfDayBelgium(req.params.date),
        $lte: getEndOfDayBelgium(req.params.date)
      },
      isActive: true
    });

    res.status(200).json({
      success: true,
      isBlocked: !!blockedDate,
      isFullDayBlocked: blockedDate?.isFullDayBlocked || false,
      blockedTimeSlots: blockedDate?.blockedTimeSlots || [],
      data: blockedDate
    });
  } catch (error) {
    console.error('Error checking blocked date:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check blocked date',
      error: error.message
    });
  }
});

module.exports = router;
