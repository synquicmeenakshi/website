const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  // Auto-incrementing Enrollment ID
  enrollmentId: {
    type: Number,
    unique: true
  },

  // Service Information
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  serviceTitle: {
    type: String,
    required: true
  },

  // Appointment Date and Time
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentDay: {
    type: String,
    required: true
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required']
  },

  // Customer Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  fullName: {
    type: String
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  country: {
    type: String,
    default: 'BE'
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other']
  },

  // Additional Information
  specialRequests: {
    type: String,
    trim: true,
    default: ''
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },

  // Reminder Preferences
  reminderPreference: {
    type: String,
    enum: ['email', 'sms', 'both'],
    default: 'email'
  },
  reminderSentToCustomer: {
    type: Boolean,
    default: false
  },
  reminderSentToAdmin: {
    type: Boolean,
    default: false
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

// Create a separate counter collection for auto-incrementing
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1000 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Pre-save hook to auto-increment enrollmentId
enrollmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Get and increment the counter
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'enrollmentId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      this.enrollmentId = counter.seq;

      // Generate full name
      if (!this.fullName) {
        this.fullName = `${this.firstName} ${this.lastName}`;
      }

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Indexes for faster queries
enrollmentSchema.index({ enrollmentId: 1 }, { unique: true });
enrollmentSchema.index({ email: 1, appointmentDate: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ appointmentDate: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
