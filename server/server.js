const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/halls', require('./routes/halls'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/setup', require('./routes/setup'));

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });
}

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});


app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  Seminar Hall Booking - MERN Backend`);
  console.log(`  Server running at: http://localhost:${PORT}`);
  console.log(`  Run 'npm run seed' to seed initial data`);
  console.log(`========================================\n`);
});
