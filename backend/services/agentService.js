/**
 * AI Risk Agent Orchestrator
 * Implements autonomous investigative agent tools and generates structured timelines,
 * evidence dossiers, and explainable recommendations.
 */

const MLClient = require('./mlClient');

class AIRiskAgent {
  /**
   * Tool 1: getCustomerHistory
   */
  static async getCustomerHistory(customerId, tx) {
    const prevAvg = tx.previousAverage || 120.0;
    const accountAge = tx.accountAge || 180;
    const chargebacks = tx.previousChargebacks || 0;
    const usualLocation = tx.usualLocation || 'New York, US';

    return {
      tool: 'getCustomerHistory',
      status: 'SUCCESS',
      data: {
        customerId,
        accountAgeDays: accountAge,
        accountMaturity: accountAge > 90 ? 'ESTABLISHED' : accountAge > 30 ? 'MATURING' : 'NEW_ACCOUNT',
        historicalAverageAmount: prevAvg,
        chargebackCount: chargebacks,
        disputeRiskLevel: chargebacks >= 2 ? 'ELEVATED' : chargebacks === 1 ? 'MODERATE' : 'CLEAN',
        primaryHomeLocation: usualLocation,
        kycStatus: 'VERIFIED'
      }
    };
  }

  /**
   * Tool 2: getTransactionHistory
   */
  static async getTransactionHistory(customerId, merchant, tx) {
    const frequency = tx.transactionFrequency || 0;
    const failed = tx.failedTransactions || 0;

    return {
      tool: 'getTransactionHistory',
      status: 'SUCCESS',
      data: {
        customerId,
        merchantTarget: merchant,
        transactionsLast10Min: frequency,
        failedAttemptsLast10Min: failed,
        velocityRisk: frequency >= 5 ? 'HIGH_VELOCITY_SPIKE' : frequency >= 3 ? 'MODERATE_VELOCITY' : 'NORMAL',
        authenticationFriction: failed >= 3 ? 'SEVERE_FAILURE_SPIKE' : failed >= 1 ? 'MINOR_FRICTION' : 'NONE'
      }
    };
  }

  /**
   * Tool 3: checkDevice
   */
  static async checkDevice(deviceId, deviceAge, tx) {
    const age = deviceAge !== undefined ? deviceAge : 30;
    const isNew = age <= 2;

    return {
      tool: 'checkDevice',
      status: 'SUCCESS',
      data: {
        deviceId: deviceId || 'DEV_HARDWARE_FINGERPRINT_992',
        deviceAgeDays: age,
        isNewHardware: isNew,
        fingerprintStatus: isNew ? 'FIRST_SEEN' : 'RECOGNIZED_KNOWN_DEVICE',
        hardwareAnomalyScore: isNew ? 85 : 5,
        riskFlag: isNew ? 'SUSPICIOUS_UNFAMILIAR_DEVICE' : 'TRUSTED_DEVICE'
      }
    };
  }

  /**
   * Tool 4: checkLocation
   */
  static async checkLocation(location, usualLocation, tx) {
    const isMismatch = location && usualLocation && location.toLowerCase() !== usualLocation.toLowerCase();

    return {
      tool: 'checkLocation',
      status: 'SUCCESS',
      data: {
        transactionLocation: location,
        customerUsualLocation: usualLocation,
        isLocationMismatch: isMismatch,
        geoRiskAssessment: isMismatch ? 'UNUSUAL_CROSS_REGION_OR_COUNTRY' : 'DOMESTIC_ESTABLISHED_REGION',
        impossibleTravelVelocity: isMismatch && (tx.transactionFrequency > 2) ? 'DETECTED' : 'NOT_OBSERVED'
      }
    };
  }

  /**
   * Tool 5: calculateRisk
   */
  static async calculateRisk(features) {
    const prediction = await MLClient.predict(features);
    return {
      tool: 'calculateRisk',
      status: 'SUCCESS',
      data: prediction
    };
  }

  /**
   * Tool 6: createReviewCase
   */
  static createReviewCase(transactionId, findings, recommendation, riskLevel, riskScore) {
    return {
      caseId: `CASE-${transactionId}-${Date.now().toString().slice(-4)}`,
      status: 'OPEN_INVESTIGATION',
      severity: riskLevel,
      riskScore: riskScore,
      summary: findings.join(' '),
      proposedAction: recommendation,
      confidence: riskScore > 80 || riskScore < 20 ? 0.96 : 0.88,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Main Autonomous Investigation Workflow
   */
  static async investigate(tx) {
    const startTime = Date.now();
    const timeline = [];

    // Step 1: Ingestion
    timeline.push({
      step: 1,
      name: 'Transaction Ingestion & Feature Normalization',
      timestamp: new Date(startTime).toISOString(),
      status: 'COMPLETED',
      description: `Ingested payment transaction ${tx.transactionId || 'TXN-PENDING'} for amount $${parseFloat(tx.amount || 0).toLocaleString()} at merchant '${tx.merchant || 'Unknown'}'.`
    });

    // Step 2: ML Model Inference (calculateRisk)
    const mlResult = await this.calculateRisk(tx);
    timeline.push({
      step: 2,
      name: 'ML Risk Engine Evaluation',
      tool: 'calculateRisk',
      timestamp: new Date(startTime + 120).toISOString(),
      status: 'COMPLETED',
      output: mlResult.data,
      description: `Machine learning risk engine returned Fraud Probability: ${(mlResult.data.fraud_probability * 100).toFixed(1)}%, Risk Score: ${mlResult.data.risk_score}/100 (${mlResult.data.risk_level} RISK).`
    });

    // Step 3: Customer History (getCustomerHistory)
    const custHistory = await this.getCustomerHistory(tx.customerId || 'CUST-DEMO', tx);
    timeline.push({
      step: 3,
      name: 'Customer Profile & Historical Baseline Check',
      tool: 'getCustomerHistory',
      timestamp: new Date(startTime + 240).toISOString(),
      status: 'COMPLETED',
      output: custHistory.data,
      description: `Customer account age: ${custHistory.data.accountAgeDays} days (${custHistory.data.accountMaturity}). Historical avg: $${custHistory.data.historicalAverageAmount}. Chargeback count: ${custHistory.data.chargebackCount}.`
    });

    // Step 4: Device Hardware Check (checkDevice)
    const devCheck = await this.checkDevice(tx.deviceId, tx.deviceAge, tx);
    timeline.push({
      step: 4,
      name: 'Device Fingerprint & Hardware Integrity Analysis',
      tool: 'checkDevice',
      timestamp: new Date(startTime + 360).toISOString(),
      status: 'COMPLETED',
      output: devCheck.data,
      description: `Device ID: ${devCheck.data.deviceId}. Age: ${devCheck.data.deviceAgeDays} days. Status: ${devCheck.data.fingerprintStatus} (${devCheck.data.riskFlag}).`
    });

    // Step 5: Location & Travel Verification (checkLocation)
    const locCheck = await this.checkLocation(tx.location, tx.usualLocation, tx);
    timeline.push({
      step: 5,
      name: 'Geolocation & Travel Path Verification',
      tool: 'checkLocation',
      timestamp: new Date(startTime + 480).toISOString(),
      status: 'COMPLETED',
      output: locCheck.data,
      description: `Transaction location '${tx.location}' vs Usual '${tx.usualLocation}'. Mismatch: ${locCheck.data.isLocationMismatch ? 'YES' : 'NO'}. Impossible travel: ${locCheck.data.impossibleTravelVelocity}.`
    });

    // Step 6: Velocity & Authentication Friction (getTransactionHistory)
    const txnHistory = await this.getTransactionHistory(tx.customerId, tx.merchant, tx);
    timeline.push({
      step: 6,
      name: 'Velocity & Authentication Spike Analysis',
      tool: 'getTransactionHistory',
      timestamp: new Date(startTime + 600).toISOString(),
      status: 'COMPLETED',
      output: txnHistory.data,
      description: `Frequency: ${txnHistory.data.transactionsLast10Min} txns in 10m (${txnHistory.data.velocityRisk}). Failed attempts: ${txnHistory.data.failedAttemptsLast10Min} (${txnHistory.data.authenticationFriction}).`
    });

    // Step 7: Synthesis & Review Case Creation
    const findings = [];
    const amountRatio = (parseFloat(tx.amount || 0) / Math.max(parseFloat(tx.previousAverage || 100), 1)).toFixed(1);

    if (parseFloat(amountRatio) >= 3.0) {
      findings.push(`Transaction amount is substantially above historical average (${amountRatio}x higher than baseline $${tx.previousAverage}).`);
    }
    if (devCheck.data.isNewHardware) {
      findings.push(`Transaction initiated from a newly observed hardware device (${tx.deviceAge || 0} days old).`);
    }
    if (locCheck.data.isLocationMismatch) {
      findings.push(`Geographic origin (${tx.location}) deviates from customer established domicile (${tx.usualLocation}).`);
    }
    if (txnHistory.data.transactionsLast10Min >= 3) {
      findings.push(`Rapid transaction velocity detected (${txnHistory.data.transactionsLast10Min} orders in 10 minutes).`);
    }
    if (txnHistory.data.failedAttemptsLast10Min >= 2) {
      findings.push(`Authentication friction detected with ${txnHistory.data.failedAttemptsLast10Min} failed attempts.`);
    }

    if (findings.length === 0) {
      findings.push('Transaction metrics exhibit standard customer spending and known hardware credentials.');
    }

    const synthesizedReason = findings.join(' ');
    const reviewCase = this.createReviewCase(
      tx.transactionId || 'TXN-NEW',
      findings,
      mlResult.data.recommendation,
      mlResult.data.risk_level,
      mlResult.data.risk_score
    );

    timeline.push({
      step: 7,
      name: 'AI Risk Assessment & Case Generation',
      tool: 'createReviewCase',
      timestamp: new Date(startTime + 750).toISOString(),
      status: 'COMPLETED',
      output: reviewCase,
      description: `Synthesized risk profile: ${mlResult.data.risk_level} RISK (Score: ${mlResult.data.risk_score}). Recommendation: ${mlResult.data.recommendation}. Case ID: ${reviewCase.caseId}.`
    });

    return {
      transactionId: tx.transactionId,
      riskScore: mlResult.data.risk_score,
      fraudProbability: mlResult.data.fraud_probability,
      riskLevel: mlResult.data.risk_level,
      recommendation: mlResult.data.recommendation,
      reason: synthesizedReason,
      riskFactors: mlResult.data.risk_factors,
      evidence: {
        customer: custHistory.data,
        device: devCheck.data,
        location: locCheck.data,
        velocity: txnHistory.data
      },
      reviewCase: reviewCase,
      timeline: timeline,
      investigatedAt: new Date().toISOString(),
      executionDurationMs: Date.now() - startTime
    };
  }
}

module.exports = AIRiskAgent;
