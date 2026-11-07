const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'admin',
  },
  name: {
    type: String,
    default: 'Administrator'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Admin', AdminSchema);

