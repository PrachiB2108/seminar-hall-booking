const express = require('express');
const Hall = require('../models/Hall');
const Booking = require('../models/Booking');

const router = express.Router();

// GET /api/halls
router.get('/', async (req, res) => {
  try {
    const halls = await Hall.find({ is_active: true }).sort({ name: 1 });
    res.json({ halls });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch halls' });
  }
});

// GET /api/halls/:id
router.get('/:id', async (req, res) => {
  try {
    const hall = await Hall.findOne({ _id: req.params.id, is_active: true });
    if (!hall) return res.status(404).json({ error: 'Hall not found' });
    res.json({ hall });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hall details' });
  }
});

// GET /api/halls/:id/availability
router.get('/:id/availability', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    const bookings = await Booking.find({
      hall: req.params.id,
      booking_date: date,
      status: { $in: ['pending', 'approved'] }
    })
      .populate('user', 'name')
      .sort({ start_time: 1 });

    const result = bookings.map((b) => ({
      id: b._id,
      event_name: b.event_name,
      start_time: b.start_time,
      end_time: b.end_time,
      status: b.status,
      booked_by: b.user ? b.user.name : 'Unknown'
    }));

    res.json({ bookings: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

module.exports = router;
