/**
 * AI Agent Controller
 * Executes autonomous investigations across customer, device, velocity, and geolocation tools.
 */

const AIRiskAgent = require('../services/agentService');
const { isMongoDBConnected, memoryStore, persistStore } = require('../config/db');
const Transaction = require('../models/Transaction');
const RiskAuditLog = require('../models/RiskAuditLog');

async function findTx(id) {
  if (isMongoDBConnected()) {
    return await Transaction.findOne({ transactionId: id }).lean() || await Transaction.findById(id).lean();
  }
  return memoryStore.transactions.get(id) || null;
}

async function updateTxInvestigation(id, investigation) {
  if (isMongoDBConnected()) {
    await Transaction.findOneAndUpdate(
      { transactionId: id },
      { aiInvestigation: investigation, updatedAt: new Date() }
    );
  } else {
    const existing = memoryStore.transactions.get(id);
    if (existing) {
      existing.aiInvestigation = investigation;
      existing.updatedAt = new Date();
      memoryStore.transactions.set(id, existing);
      persistStore();
    }
  }
}

exports.investigateTransaction = async (req, res, next) => {
  try {
    const { transactionId, ...overrideData } = req.body;

    let targetTx = null;

    if (transactionId) {
      targetTx = await findTx(transactionId);
    }

    // Merge or fallback to payload
    const payload = {
      ...(targetTx || {}),
      ...overrideData,
      transactionId: transactionId || (targetTx && targetTx.transactionId) || `TXN-AGENT-${Date.now().toString().slice(-4)}`
    };

    if (!payload.amount && payload.amount !== 0) {
      return res.status(400).json({
        success: false,
        error: 'Transaction amount or existing transactionId is required for AI investigation.'
      });
    }

    const investigation = await AIRiskAgent.investigate(payload);

    if (targetTx && targetTx.transactionId) {
      await updateTxInvestigation(targetTx.transactionId, investigation);

      // Record audit log
      const auditEntry = {
        transactionId: targetTx.transactionId,
        previousStatus: targetTx.status,
        newStatus: targetTx.status,
        action: 'INVESTIGATE',
        reason: `AI Risk Agent investigation completed. Suggested action: ${investigation.recommendation}.`,
        actor: 'AI Risk Agent Orchestrator',
        metadata: {
          caseId: investigation.reviewCase.caseId,
          riskScore: investigation.riskScore,
          riskLevel: investigation.riskLevel
        },
        timestamp: new Date()
      };

      if (isMongoDBConnected()) {
        await RiskAuditLog.create(auditEntry);
      } else {
        memoryStore.auditLogs.unshift(auditEntry);
        persistStore();
      }
    }

    res.json({
      success: true,
      data: investigation
    });
  } catch (err) {
    next(err);
  }
};
