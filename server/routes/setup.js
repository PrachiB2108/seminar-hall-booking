const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Hall = require('../models/Hall');

const router = express.Router();

// GET /api/setup  — run once to seed admin + halls
router.get('/', async (req, res) => {
  try {
    const results = [];

    // Admin user
    const existing = await User.findOne({ email: 'admin@college.edu' });
    if (!existing) {
      const hashed = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin',
        email: 'admin@college.edu',
        password: hashed,
        department: 'Administration',
        role: 'admin'
      });
      results.push('✅ Admin user created: admin@college.edu / admin123');
    } else {
      results.push('ℹ️ Admin user already exists');
    }

    // Default halls
    const hallCount = await Hall.countDocuments();
    if (hallCount === 0) {
      await Hall.insertMany([
        { name: 'Main Auditorium', location: 'Block A - Ground Floor', capacity: 500, facilities: 'Projector, Sound System, AC, Stage, WiFi' },
        { name: 'Seminar Hall 1', location: 'Block B - First Floor', capacity: 150, facilities: 'Projector, AC, WiFi, Whiteboard' },
        { name: 'Seminar Hall 2', location: 'Block B - Second Floor', capacity: 100, facilities: 'Projector, AC, WiFi' },
        { name: 'Conference Room', location: 'Block A - Third Floor', capacity: 30, facilities: 'Projector, AC, WiFi, Video Conferencing' },
        { name: 'Mini Auditorium', location: 'Block C - Ground Floor', capacity: 200, facilities: 'Projector, Sound System, AC, WiFi' }
      ]);
      results.push('✅ 5 default halls created');
    } else {
      results.push(`ℹ️ ${hallCount} halls already exist`);
    }

    res.json({ message: 'Setup complete', results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
