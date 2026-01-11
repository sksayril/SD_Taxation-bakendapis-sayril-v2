const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required']
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Actor (user ID) is required'],
    refPath: 'actorModel'
  },
  actorModel: {
    type: String,
    enum: ['SuperAdmin', 'Admin', 'Employee', 'HR'],
    required: [true, 'Actor model is required']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    maxlength: [200, 'Action cannot exceed 200 characters']
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false // We use custom timestamp field
});

// Indexes for common queries
AuditLogSchema.index({ company: 1, timestamp: -1 });
AuditLogSchema.index({ actor: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ company: 1, action: 1, timestamp: -1 });

// Static method to log an action
AuditLogSchema.statics.log = async function(companyId, actorId, actorModel, action, meta = {}) {
  return await this.create({
    company: companyId,
    actor: actorId,
    actorModel: actorModel,
    action: action,
    meta: meta,
    timestamp: new Date()
  });
};

module.exports = mongoose.model('AuditLog', AuditLogSchema);

