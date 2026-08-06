const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const Enrollment = require('../models/Enrollment');
const Service = require('../models/Service');
const { getStartOfDayBelgium, getEndOfDayBelgium } = require('../utils/timezone');
const { sendCancellationEmails } = require('./enrollmentController');

const generateCancellationToken = () => crypto.randomBytes(24).toString('hex');

// Create new appointment
exports.createAppointment = async (req, res) => {
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
      message
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

    // Create appointment
    const appointment = await Appointment.create({
      service: serviceId,
      serviceTitle: serviceTitle || service.title,
      appointmentDate: selectedDate,
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
      cancellationToken: generateCancellationToken()
    });

    // Populate service details
    await appointment.populate('service');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
};

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, email, date } = req.query;
    let query = {};

    // Apply filters if provided
    if (status) query.status = status;
    if (email) query.email = email.toLowerCase();
    if (date) {
      // Range: start of Belgium day → end of Belgium day (avoids server-timezone drift)
      query.appointmentDate = {
        $gte: getStartOfDayBelgium(date),
        $lte: getEndOfDayBelgium(date)
      };
    }

    const appointments = await Appointment.find(query)
      .populate('service')
      .sort({ appointmentDate: -1, appointmentTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

// Get single appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('service');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message
    });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('service');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message
    });
  }
};

// Cancel appointment (customer self-service via email link)
exports.cancelAppointment = async (req, res) => {
  try {
    const { token } = req.body;

    const appointment = await Appointment.findById(req.params.id).select('+cancellationToken');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (!appointment.cancellationToken) {
      return res.status(403).json({
        success: false,
        message: 'This booking cannot be cancelled online. Please contact us directly.'
      });
    }

    if (!token || token !== appointment.cancellationToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired cancellation link.'
      });
    }

    if (appointment.status === 'cancelled') {
      await appointment.populate('service');
      return res.status(200).json({
        success: true,
        message: 'Appointment was already cancelled.',
        data: appointment
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed appointments cannot be cancelled.'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    await appointment.populate('service');

    // Keep the linked Enrollment record in sync so admin views match
    const enrollment = await Enrollment.findOneAndUpdate(
      {
        email: appointment.email,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime
      },
      { status: 'cancelled' },
      { new: true }
    ).populate('service');

    // Notify customer and admin. Use the enrollment when available (has enrollmentId).
    sendCancellationEmails(enrollment || appointment).catch(err =>
      console.error('❌ Cancellation email dispatch failed:', err.message)
    );

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting appointment',
      error: error.message
    });
  }
};

// Clear all appointments (admin utility)
exports.clearAllAppointments = async (req, res) => {
  try {
    const result = await Appointment.deleteMany({});

    console.log(`🗑️ Cleared ${result.deletedCount} appointments from database`);

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} appointments`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing appointments',
      error: error.message
    });
  }
};

// Get booked time slots for a specific date
exports.getBookedSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date'
      });
    }

    // Create date range for the entire day using Belgium timezone
    const startDate = getStartOfDayBelgium(date);
    const endDate = getEndOfDayBelgium(date);

    // Find all confirmed appointments for this date
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: startDate,
        $lte: endDate
      },
      status: { $in: ['confirmed', 'pending'] } // Only confirmed and pending appointments block slots
    }).select('appointmentTime');

    // Extract just the time slots
    const bookedSlots = appointments.map(apt => apt.appointmentTime);

    res.status(200).json({
      success: true,
      date: date,
      bookedSlots: bookedSlots,
      count: bookedSlots.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booked slots',
      error: error.message
    });
  }
};
