const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    facilities: { type: String, default: '' },
    image_url: { type: String, default: '/images/hall-default.jpg' },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hall', hallSchema);
