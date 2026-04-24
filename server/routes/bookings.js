const express = require('express');
const Booking = require('../models/Booking');
const Hall = require('../models/Hall');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { hall_id, event_name, event_description, booking_date, start_time, end_time, attendees } = req.body;

    if (!hall_id || !event_name || !booking_date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Hall, event name, date, start time and end time are required' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (booking_date < today) return res.status(400).json({ error: 'Cannot book for a past date' });
    if (start_time >= end_time) return res.status(400).json({ error: 'End time must be after start time' });

    const conflict = await Booking.findOne({
      hall: hall_id,
      booking_date,
      status: { $in: ['pending', 'approved'] },
      start_time: { $lt: end_time },
      end_time: { $gt: start_time }
    });

    if (conflict) return res.status(400).json({ error: 'This time slot is already booked or has a pending request' });

    const booking = await Booking.create({
      user: req.user._id,
      hall: hall_id,
      event_name,
      event_description: event_description || '',
      booking_date,
      start_time,
      end_time,
      attendees: attendees || 0
    });

    const hall = await Hall.findById(hall_id);
    res.status(201).json({
      message: 'Booking request submitted successfully',
      booking: {
        ...booking.toObject(),
        hall_name: hall ? hall.name : '',
        hall_location: hall ? hall.location : ''
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/bookings/my
router.get('/my', isAuthenticated, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('hall', 'name location capacity')
      .sort({ booking_date: -1 });

    const result = bookings.map((b) => ({
      id: b._id,
      event_name: b.event_name,
      event_description: b.event_description,
      booking_date: b.booking_date,
      start_time: b.start_time,
      end_time: b.end_time,
      attendees: b.attendees,
      status: b.status,
      admin_remarks: b.admin_remarks,
      hall_name: b.hall ? b.hall.name : 'Unknown',
      hall_location: b.hall ? b.hall.location : '',
      hall_capacity: b.hall ? b.hall.capacity : 0
    }));

    res.json({ bookings: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(400).json({ error: 'Booking is already cancelled' });

    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;
