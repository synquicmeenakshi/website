const mongoose = require('mongoose');

const rentalBookingSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'business', 'other']
  },

  // Property Information
  property: {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    guests: {
      type: Number
    },
    bedrooms: {
      type: Number
    },
    parking: {
      type: String
    }
  },

  // Booking Details
  booking: {
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required']
    },
    checkOutDate: {
      type: Date
    },
    checkInTime: {
      type: String,
      default: '10:30'
    },
    checkOutTime: {
      type: String,
      default: '10:00'
    },
    numberOfNights: {
      type: Number,
      default: 1
    },
    totalPrice: {
      type: Number
    }
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

  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },

  // Payment Information
  payment: {
    totalAmount: {
      type: Number
    },
    deposit: {
      type: Number
    },
    depositPaid: {
      type: Boolean,
      default: false
    },
    remainingBalance: {
      type: Number
    },
    balanceDueDate: {
      type: Date
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'deposit_paid', 'fully_paid', 'refunded'],
      default: 'pending'
    }
  },

  // Email Status
  emailSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
rentalBookingSchema.index({ email: 1, 'booking.checkInDate': 1 });
rentalBookingSchema.index({ status: 1 });
rentalBookingSchema.index({ createdAt: -1 });

// Generate booking ID before saving
rentalBookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    // Generate unique booking ID like ZN78564
    this.bookingId = 'ZN' + Math.floor(10000 + Math.random() * 90000);
  }
  next();
});

// Add bookingId field
rentalBookingSchema.add({
  bookingId: {
    type: String,
    unique: true
  }
});

module.exports = mongoose.model('RentalBooking', rentalBookingSchema);
