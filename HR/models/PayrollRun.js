const mongoose = require('mongoose');

const SummarySchema = new mongoose.Schema({
  createdCount: {
    type: Number,
    default: 0,
    min: [0, 'Created count cannot be negative']
  },
  skippedCount: {
    type: Number,
    default: 0,
    min: [0, 'Skipped count cannot be negative']
  },
  errorList: {
    type: [{
      employeeId: mongoose.Schema.Types.ObjectId,
      reason: String
    }],
    default: []
  }
}, { _id: false, suppressReservedKeysWarning: true });

const PayrollRunSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required']
  },
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2000, 'Year must be a valid year'],
    max: [2100, 'Year must be a valid year']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Created by is required']
  },
  status: {
    type: String,
    enum: {
      values: ['running', 'done', 'failed'],
      message: 'Status must be one of: running, done, failed'
    },
    default: 'running'
  },
  summary: {
    type: SummarySchema,
    default: () => ({
      createdCount: 0,
      skippedCount: 0,
      errorList: []
    })
  }
}, {
  timestamps: true
});

// Index for company, month, year queries
PayrollRunSchema.index({ company: 1, year: 1, month: 1 });
PayrollRunSchema.index({ company: 1, status: 1 });
PayrollRunSchema.index({ createdBy: 1 });

module.exports = mongoose.model('PayrollRun', PayrollRunSchema);

