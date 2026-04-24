const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
    event_name: { type: String, required: true, trim: true },
    event_description: { type: String, default: '' },
    booking_date: { type: String, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    attendees: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending'
    },
    admin_remarks: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
