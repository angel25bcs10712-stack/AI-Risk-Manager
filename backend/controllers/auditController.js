/**
 * Audit Logs Controller
 * Provides audit trail for compliance, investigations, and risk decisions.
 */

const { isMongoDBConnected, memoryStore } = require('../config/db');
const RiskAuditLog = require('../models/RiskAuditLog');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { transactionId, limit = 50 } = req.query;

    let logs = [];
    if (isMongoDBConnected()) {
      const query = transactionId ? { transactionId } : {};
      logs = await RiskAuditLog.find(query).sort({ timestamp: -1 }).limit(parseInt(limit)).lean();
    } else {
      logs = memoryStore.auditLogs;
      if (transactionId) {
        logs = logs.filter(l => l.transactionId === transactionId);
      }
      logs = logs.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      data: logs
    });
  } catch (err) {
    next(err);
  }
};
