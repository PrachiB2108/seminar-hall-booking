const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Hall = require('../models/Hall');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Create admin user
  const existingAdmin = await User.findOne({ email: 'admin@college.edu' });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@college.edu',
      password: hashedPassword,
      department: 'Administration',
      role: 'admin'
    });
    console.log('Admin user created: admin@college.edu / admin123');
  } else {
    console.log('Admin user already exists');
  }

  // Create default halls
  const hallCount = await Hall.countDocuments();
  if (hallCount === 0) {
    await Hall.insertMany([
      { name: 'Main Auditorium', location: 'Block A - Ground Floor', capacity: 500, facilities: 'Projector, Sound System, AC, Stage, WiFi' },
      { name: 'Seminar Hall 1', location: 'Block B - First Floor', capacity: 150, facilities: 'Projector, AC, WiFi, Whiteboard' },
      { name: 'Seminar Hall 2', location: 'Block B - Second Floor', capacity: 100, facilities: 'Projector, AC, WiFi' },
      { name: 'Conference Room', location: 'Block A - Third Floor', capacity: 30, facilities: 'Projector, AC, WiFi, Video Conferencing' },
      { name: 'Mini Auditorium', location: 'Block C - Ground Floor', capacity: 200, facilities: 'Projector, Sound System, AC, WiFi' }
    ]);
    console.log('Default halls created');
  } else {
    console.log('Halls already exist');
  }

  await mongoose.disconnect();
  console.log('Seeding complete!');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
