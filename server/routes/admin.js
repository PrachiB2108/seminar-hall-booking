const express = require('express');
const Hall = require('../models/Hall');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { isAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(isAdmin);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [totalHalls, totalUsers, allBookings, recentBookings] = await Promise.all([
      Hall.countDocuments({ is_active: true }),
      User.countDocuments({ role: 'user' }),
      Booking.find(),
      Booking.find()
        .populate('hall', 'name')
        .populate('user', 'name department')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const stats = {
      totalHalls,
      totalUsers,
      totalBookings: allBookings.length,
      pendingBookings: allBookings.filter((b) => b.status === 'pending').length,
      approvedBookings: allBookings.filter((b) => b.status === 'approved').length,
      rejectedBookings: allBookings.filter((b) => b.status === 'rejected').length
    };

    const recent = recentBookings.map((b) => ({
      id: b._id,
      event_name: b.event_name,
      booking_date: b.booking_date,
      start_time: b.start_time,
      end_time: b.end_time,
      status: b.status,
      hall_name: b.hall ? b.hall.name : 'Unknown',
      user_name: b.user ? b.user.name : 'Unknown',
      user_department: b.user ? b.user.department : ''
    }));

    res.json({ stats, recentBookings: recent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (date) filter.booking_date = date;

    const bookings = await Booking.find(filter)
      .populate('hall', 'name location')
      .populate('user', 'name email department')
      .sort({ createdAt: -1 });

    const result = bookings.map((b) => ({
      id: b._id,
      event_name: b.event_name,
      event_description: b.event_description,
      booking_date: b.booking_date,
      start_time: b.start_time,
      end_time: b.end_time,
      status: b.status,
      admin_remarks: b.admin_remarks,
      hall_name: b.hall ? b.hall.name : 'Unknown',
      hall_location: b.hall ? b.hall.location : '',
      user_name: b.user ? b.user.name : 'Unknown',
      user_email: b.user ? b.user.email : '',
      user_department: b.user ? b.user.department : ''
    }));

    res.json({ bookings: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// PUT /api/admin/bookings/:id
router.put('/bookings/:id', async (req, res) => {
  try {
    const { status, admin_remarks } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending bookings can be approved or rejected' });
    }

    booking.status = status;
    booking.admin_remarks = admin_remarks || '';
    await booking.save();

    res.json({ message: `Booking ${status} successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// POST /api/admin/halls
router.post('/halls', async (req, res) => {
  try {
    const { name, location, capacity, facilities } = req.body;
    if (!name || !location || !capacity) {
      return res.status(400).json({ error: 'Name, location, and capacity are required' });
    }

    const hall = await Hall.create({
      name,
      location,
      capacity: parseInt(capacity),
      facilities: facilities || ''
    });

    res.status(201).json({ message: 'Hall added successfully', hall });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add hall' });
  }
});

// PUT /api/admin/halls/:id
router.put('/halls/:id', async (req, res) => {
  try {
    const { name, location, capacity, facilities, is_active } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (location !== undefined) update.location = location;
    if (capacity !== undefined) update.capacity = parseInt(capacity);
    if (facilities !== undefined) update.facilities = facilities;
    if (is_active !== undefined) update.is_active = is_active;

    const hall = await Hall.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!hall) return res.status(404).json({ error: 'Hall not found' });

    res.json({ message: 'Hall updated successfully', hall });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update hall' });
  }
});

// DELETE /api/admin/halls/:id
router.delete('/halls/:id', async (req, res) => {
  try {
    await Hall.findByIdAndUpdate(req.params.id, { is_active: false });
    res.json({ message: 'Hall removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove hall' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
