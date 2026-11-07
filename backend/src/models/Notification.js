const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  reportId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['new_report', 'status_update', 'critical_alert', 'system'],
    default: 'new_report',
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);

