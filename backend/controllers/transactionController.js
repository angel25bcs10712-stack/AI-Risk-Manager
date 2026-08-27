/**
 * Transaction Controller
 * Handles retrieval, creation, ML analysis, re-scoring, and controlled actions (Approve, Review, Block).
 */

const { isMongoDBConnected, memoryStore, persistStore } = require('../config/db');
const Transaction = require('../models/Transaction');
const RiskAuditLog = require('../models/RiskAuditLog');
const MLClient = require('../services/mlClient');
const AIRiskAgent = require('../services/agentService');

// Helper to query either MongoDB or Memory Store
async function fetchAllTransactions() {
  if (isMongoDBConnected()) {
    return await Transaction.find().sort({ createdAt: -1 }).lean();
  }
  return Array.from(memoryStore.transactions.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function findTransactionById(id) {
  if (isMongoDBConnected()) {
    return await Transaction.findOne({ transactionId: id }).lean() || await Transaction.findById(id).lean();
  }
  return memoryStore.transactions.get(id) || null;
}

async function saveTransaction(txDoc) {
  if (isMongoDBConnected()) {
    return await Transaction.findOneAndUpdate(
      { transactionId: txDoc.transactionId },
      txDoc,
      { upsert: true, new: true }
    );
  }
  memoryStore.transactions.set(txDoc.transactionId, txDoc);
  persistStore();
  return txDoc;
}

async function recordAuditLog(logEntry) {
  if (isMongoDBConnected()) {
    return await RiskAuditLog.create(logEntry);
  }
  memoryStore.auditLogs.unshift(logEntry);
  persistStore();
  return logEntry;
}

exports.getTransactions = async (req, res, next) => {
  try {
    const { riskLevel, status, search, limit = 50, page = 1, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let list = await fetchAllTransactions();

    // Filter by risk level
    if (riskLevel && riskLevel !== 'ALL') {
      list = list.filter(t => t.riskLevel && t.riskLevel.toUpperCase() === riskLevel.toUpperCase());
    }

    // Filter by status
    if (status && status !== 'ALL') {
      list = list.filter(t => t.status && t.status.toUpperCase() === status.toUpperCase());
    }

    // Search query
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(t => 
        (t.transactionId && t.transactionId.toLowerCase().includes(q)) ||
        (t.customerId && t.customerId.toLowerCase().includes(q)) ||
        (t.merchant && t.merchant.toLowerCase().includes(q)) ||
        (t.location && t.location.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      }
      if (sortOrder === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    const total = list.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = list.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tx = await findTransactionById(id);

    if (!tx) {
      return res.status(404).json({
        success: false,
        error: `Transaction with ID '${id}' not found.`
      });
    }

    // Fetch related audit logs
    let auditLogs = [];
    if (isMongoDBConnected()) {
      auditLogs = await RiskAuditLog.find({ transactionId: tx.transactionId }).sort({ timestamp: -1 }).lean();
    } else {
      auditLogs = memoryStore.auditLogs.filter(l => l.transactionId === tx.transactionId);
    }

    res.json({
      success: true,
      data: {
        ...tx,
        auditLogs
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createAndAnalyzeTransaction = async (req, res, next) => {
  try {
    const body = req.body;

    const transactionId = body.transactionId || `TXN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const rawData = {
      transactionId,
      customerId: body.customerId,
      amount: parseFloat(body.amount),
      merchant: body.merchant,
      merchantCategory: body.merchantCategory || 'General Retail',
      deviceId: body.deviceId || `DEV-${Math.random().toString(36).substring(7).toUpperCase()}`,
      deviceAge: body.deviceAge !== undefined ? parseFloat(body.deviceAge) : 30,
      location: body.location,
      usualLocation: body.usualLocation,
      transactionHour: body.transactionHour !== undefined ? parseInt(body.transactionHour) : new Date().getHours(),
      transactionFrequency: parseInt(body.transactionFrequency) || 0,
      failedTransactions: parseInt(body.failedTransactions) || 0,
      previousAverage: parseFloat(body.previousAverage) || parseFloat(body.amount),
      accountAge: parseFloat(body.accountAge) || 90,
      previousChargebacks: parseInt(body.previousChargebacks) || 0
    };

    // 1. Call ML Model for inference
    const prediction = await MLClient.predict(rawData);

    // 2. Automatically run AI Agent investigation if High/Medium Risk or requested
    let aiInvestigation = null;
    if (body.runAgent || prediction.risk_level === 'HIGH' || prediction.risk_score >= 40) {
      aiInvestigation = await AIRiskAgent.investigate(rawData);
    }

    // Determine initial status
    let initialStatus = body.status;
    if (!initialStatus) {
      if (prediction.risk_score >= 80) initialStatus = 'UNDER_REVIEW';
      else if (prediction.risk_score >= 40) initialStatus = 'UNDER_REVIEW';
      else initialStatus = 'APPROVED';
    }

    const newTx = {
      ...rawData,
      riskScore: prediction.risk_score,
      fraudProbability: prediction.fraud_probability,
      riskLevel: prediction.risk_level,
      riskFactors: prediction.risk_factors,
      recommendation: prediction.recommendation,
      status: initialStatus,
      aiInvestigation,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const saved = await saveTransaction(newTx);

    // Create Audit Log
    await recordAuditLog({
      transactionId: saved.transactionId,
      previousStatus: 'NEW_SUBMISSION',
      newStatus: saved.status,
      action: 'CREATE',
      reason: `Automated ML Risk Scoring: ${prediction.risk_score}/100 (${prediction.risk_level} RISK).`,
      actor: 'RiskGuard Risk Engine',
      metadata: {
        riskScore: saved.riskScore,
        riskLevel: saved.riskLevel,
        recommendation: saved.recommendation
      },
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: saved,
      analysis: {
        riskScore: prediction.risk_score,
        fraudProbability: prediction.fraud_probability,
        riskLevel: prediction.risk_level,
        recommendation: prediction.recommendation,
        riskFactors: prediction.risk_factors
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.reanalyzeTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tx = await findTransactionById(id);

    if (!tx) {
      return res.status(404).json({
        success: false,
        error: `Transaction '${id}' not found.`
      });
    }

    const prediction = await MLClient.predict(tx);
    const aiInvestigation = await AIRiskAgent.investigate(tx);

    tx.riskScore = prediction.risk_score;
    tx.fraudProbability = prediction.fraud_probability;
    tx.riskLevel = prediction.risk_level;
    tx.riskFactors = prediction.risk_factors;
    tx.recommendation = prediction.recommendation;
    tx.aiInvestigation = aiInvestigation;
    tx.updatedAt = new Date();

    const updated = await saveTransaction(tx);

    await recordAuditLog({
      transactionId: tx.transactionId,
      previousStatus: tx.status,
      newStatus: tx.status,
      action: 'RE_ANALYZE',
      reason: 'Manual re-analysis requested by Risk Analyst.',
      actor: 'Risk Analyst',
      metadata: {
        updatedScore: tx.riskScore,
        updatedLevel: tx.riskLevel
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.takeAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reason, actor = 'Risk Analyst' } = req.body;

    const tx = await findTransactionById(id);
    if (!tx) {
      return res.status(404).json({
        success: false,
        error: `Transaction '${id}' not found.`
      });
    }

    const prevStatus = tx.status;
    let newStatus = prevStatus;

    if (action.toUpperCase() === 'APPROVE') {
      newStatus = 'APPROVED';
    } else if (action.toUpperCase() === 'BLOCK') {
      newStatus = 'BLOCKED';
    } else if (action.toUpperCase() === 'MANUAL_REVIEW') {
      newStatus = 'UNDER_REVIEW';
    }

    tx.status = newStatus;
    tx.updatedAt = new Date();

    const updated = await saveTransaction(tx);

    const auditEntry = await recordAuditLog({
      transactionId: tx.transactionId,
      previousStatus: prevStatus,
      newStatus: newStatus,
      action: action.toUpperCase(),
      reason: reason || `Manual decision executed by ${actor}`,
      actor: actor,
      metadata: {
        riskScore: tx.riskScore,
        riskLevel: tx.riskLevel,
        amount: tx.amount
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `Transaction ${tx.transactionId} updated to ${newStatus}.`,
      data: updated,
      auditLog: auditEntry
    });
  } catch (err) {
    next(err);
  }
};
