const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customerId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  merchant: {
    type: String,
    required: true
  },
  merchantCategory: {
    type: String,
    default: 'General Retail'
  },
  deviceId: {
    type: String,
    default: 'DEV_UNKNOWN'
  },
  deviceAge: {
    type: Number,
    default: 30
  },
  location: {
    type: String,
    required: true
  },
  usualLocation: {
    type: String,
    required: true
  },
  transactionHour: {
    type: Number,
    default: () => new Date().getHours()
  },
  transactionFrequency: {
    type: Number,
    default: 0
  },
  failedTransactions: {
    type: Number,
    default: 0
  },
  previousAverage: {
    type: Number,
    default: 100
  },
  accountAge: {
    type: Number,
    default: 90
  },
  previousChargebacks: {
    type: Number,
    default: 0
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  fraudProbability: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW'
  },
  riskFactors: {
    type: [String],
    default: []
  },
  recommendation: {
    type: String,
    enum: ['APPROVE', 'MANUAL REVIEW', 'BLOCK'],
    default: 'APPROVE'
  },
  status: {
    type: String,
    enum: ['APPROVED', 'UNDER_REVIEW', 'BLOCKED', 'PENDING'],
    default: 'PENDING'
  },
  aiInvestigation: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema);
