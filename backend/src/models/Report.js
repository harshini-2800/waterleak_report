const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'In Progress', 'Resolved'],
    required: true,
  },
  note: { type: String, default: '' },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: String, default: 'System' }
}, { _id: false });

const ReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  reporterName: {
    type: String,
    required: true,
    trim: true,
  },
  reporterEmail: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  street: {
    type: String,
    required: true,
    trim: true,
  },
  landmark: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: String,
    enum: [
      'Burst Pipe',
      'Leaking Tap / Hydrant',
      'Low Pressure Seepage',
      'Main Pipeline Fracture',
      'Overflowing Drain / Tank',
      'Pavement / Road Seepage',
      'Other'
    ],
    default: 'Burst Pipe',
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
    index: true,
  },
  image: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'In Progress', 'Resolved'],
    default: 'Pending',
    index: true,
  },
  isDemo: {
    type: Boolean,
    default: false,
    index: true,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  resolutionDurationHours: {
    type: Number,
    default: null,
  },
  statusHistory: [StatusHistorySchema],
  similarReportsCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', ReportSchema);

