/**
 * Database & Memory Store Seeder
 * Populates realistic transactions analyzed with ML scoring and risk audit logs.
 */

const fs = require('fs');
const path = require('path');
const { isMongoDBConnected, memoryStore, persistStore } = require('../config/db');
const Transaction = require('../models/Transaction');
const RiskAuditLog = require('../models/RiskAuditLog');
const MLClient = require('./mlClient');
const AIRiskAgent = require('./agentService');

async function seedData(force = false) {
  const rawPath = path.join(__dirname, '..', 'data', 'demoTransactions.json');
  if (!fs.existsSync(rawPath)) {
    console.warn('[Seeder] demoTransactions.json not found.');
    return;
  }

  const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  console.log(`[Seeder] Processing ${rawData.length} demo transactions through ML engine...`);

  const processedList = [];
  const auditLogs = [];

  for (const raw of rawData) {
    // Run prediction to get exact risk scores and factors
    const prediction = await MLClient.predict(raw);

    // If transaction is High Risk or Under Review, run AI agent investigation
    let aiInvestigation = null;
    if (prediction.risk_level === 'HIGH' || prediction.risk_score >= 40) {
      aiInvestigation = await AIRiskAgent.investigate({
        ...raw,
        previousAverage: raw.previousAverage,
        deviceId: raw.deviceId,
        deviceAge: raw.deviceAge,
        location: raw.location,
        usualLocation: raw.usualLocation
      });
    }

    const doc = {
      ...raw,
      riskScore: prediction.risk_score,
      fraudProbability: prediction.fraud_probability,
      riskLevel: prediction.risk_level,
      riskFactors: prediction.risk_factors,
      recommendation: prediction.recommendation,
      status: raw.status || (prediction.risk_score >= 80 ? 'BLOCKED' : prediction.risk_score >= 40 ? 'UNDER_REVIEW' : 'APPROVED'),
      aiInvestigation: aiInvestigation,
      createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
      updatedAt: new Date()
    };

    processedList.push(doc);

    // Create initial audit log entry
    auditLogs.push({
      transactionId: doc.transactionId,
      previousStatus: 'PENDING',
      newStatus: doc.status,
      action: doc.status === 'BLOCKED' ? 'BLOCK' : doc.status === 'UNDER_REVIEW' ? 'MANUAL_REVIEW' : 'APPROVE',
      reason: doc.riskFactors[0] || 'Automated policy evaluation baseline',
      actor: doc.status === 'APPROVED' ? 'RiskGuard Auto-Rule Engine' : 'AI Risk Orchestrator',
      metadata: {
        riskScore: doc.riskScore,
        riskLevel: doc.riskLevel,
        amount: doc.amount
      },
      timestamp: doc.createdAt
    });
  }

  if (isMongoDBConnected()) {
    try {
      const count = await Transaction.countDocuments();
      if (count === 0 || force) {
        if (force) {
          await Transaction.deleteMany({});
          await RiskAuditLog.deleteMany({});
        }
        await Transaction.insertMany(processedList);
        await RiskAuditLog.insertMany(auditLogs);
        console.log(`[Seeder] Seeded ${processedList.length} transactions and ${auditLogs.length} audit logs into MongoDB.`);
      } else {
        console.log(`[Seeder] MongoDB already contains ${count} transactions. Skipping re-seed.`);
      }
    } catch (err) {
      console.error('[Seeder] MongoDB insertion error:', err.message);
    }
  }

  // Populate memory/file store
  if (memoryStore.transactions.size === 0 || force) {
    memoryStore.transactions.clear();
    memoryStore.auditLogs = [];
    processedList.forEach(t => memoryStore.transactions.set(t.transactionId, t));
    memoryStore.auditLogs.push(...auditLogs);
    persistStore();
    console.log(`[Seeder] Seeded ${memoryStore.transactions.size} records into Memory/File fallback store.`);
  }
}

module.exports = { seedData };
