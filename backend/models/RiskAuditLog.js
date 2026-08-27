const mongoose = require('mongoose');

const RiskAuditLogSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    index: true
  },
  previousStatus: {
    type: String,
    default: null
  },
  newStatus: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['APPROVE', 'MANUAL_REVIEW', 'BLOCK', 'INVESTIGATE', 'CREATE', 'RE_ANALYZE'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  actor: {
    type: String,
    default: 'Risk Analyst'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('RiskAuditLog', RiskAuditLogSchema);
