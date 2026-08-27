/**
 * Analytics Controller
 * Aggregates real-time KPIs, risk distributions, volume charts, and fraud prevention metrics.
 */

const { isMongoDBConnected, memoryStore } = require('../config/db');
const Transaction = require('../models/Transaction');

async function getAllTransactions() {
  if (isMongoDBConnected()) {
    return await Transaction.find().lean();
  }
  return Array.from(memoryStore.transactions.values());
}

exports.getAnalytics = async (req, res, next) => {
  try {
    const list = await getAllTransactions();

    const total = list.length;
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
    let underReviewCount = 0;
    let blockedCount = 0;
    let approvedCount = 0;
    let totalScoreSum = 0;
    let blockedAmountSum = 0;
    let totalVolumeSum = 0;

    const categoryMap = {};
    const hourMap = {};

    list.forEach(tx => {
      const score = tx.riskScore || 0;
      const amount = tx.amount || 0;
      totalScoreSum += score;
      totalVolumeSum += amount;

      if (tx.riskLevel === 'HIGH' || score >= 75) highRiskCount++;
      else if (tx.riskLevel === 'MEDIUM' || score >= 40) mediumRiskCount++;
      else lowRiskCount++;

      if (tx.status === 'BLOCKED') {
        blockedCount++;
        blockedAmountSum += amount;
      } else if (tx.status === 'UNDER_REVIEW') {
        underReviewCount++;
      } else if (tx.status === 'APPROVED') {
        approvedCount++;
      }

      // Category aggregation
      const cat = tx.merchantCategory || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, totalTx: 0, highRiskTx: 0, totalAmount: 0, avgRiskScore: 0, sumScore: 0 };
      }
      categoryMap[cat].totalTx++;
      categoryMap[cat].totalAmount += amount;
      categoryMap[cat].sumScore += score;
      if (tx.riskLevel === 'HIGH' || score >= 75) {
        categoryMap[cat].highRiskTx++;
      }

      // Hour aggregation
      const hour = tx.transactionHour !== undefined ? tx.transactionHour : 12;
      if (!hourMap[hour]) {
        hourMap[hour] = { hour: `${hour.toString().padStart(2, '0')}:00`, total: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0, volume: 0 };
      }
      hourMap[hour].total++;
      hourMap[hour].volume += amount;
      if (score >= 75) hourMap[hour].highRisk++;
      else if (score >= 40) hourMap[hour].mediumRisk++;
      else hourMap[hour].lowRisk++;
    });

    const avgRiskScore = total > 0 ? Math.round(totalScoreSum / total) : 0;
    const fraudRate = total > 0 ? parseFloat(((highRiskCount / total) * 100).toFixed(2)) : 0;
    const approvalRate = total > 0 ? parseFloat(((approvedCount / total) * 100).toFixed(2)) : 0;
    const reviewRate = total > 0 ? parseFloat(((underReviewCount / total) * 100).toFixed(2)) : 0;
    const blockRate = total > 0 ? parseFloat(((blockedCount / total) * 100).toFixed(2)) : 0;

    // Build Category chart data
    const categoryRiskData = Object.values(categoryMap).map(c => ({
      category: c.category,
      totalTransactions: c.totalTx,
      highRiskTransactions: c.highRiskTx,
      totalVolume: Math.round(c.totalAmount),
      averageRiskScore: Math.round(c.sumScore / c.totalTx),
      riskRate: parseFloat(((c.highRiskTx / c.totalTx) * 100).toFixed(1))
    })).sort((a, b) => b.averageRiskScore - a.averageRiskScore);

    // Build Volume & Trend charts (24 hours formatted)
    const hourlyTrend = [];
    for (let h = 0; h < 24; h++) {
      const label = `${h.toString().padStart(2, '0')}:00`;
      hourlyTrend.push(hourMap[h] || {
        hour: label,
        total: 0,
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        volume: 0
      });
    }

    // Risk distribution pie/donut chart data
    const riskDistribution = [
      { name: 'Low Risk', value: lowRiskCount, percentage: total > 0 ? Math.round((lowRiskCount / total) * 100) : 0, color: '#10B981' },
      { name: 'Medium Risk', value: mediumRiskCount, percentage: total > 0 ? Math.round((mediumRiskCount / total) * 100) : 0, color: '#F59E0B' },
      { name: 'High Risk', value: highRiskCount, percentage: total > 0 ? Math.round((highRiskCount / total) * 100) : 0, color: '#EF4444' }
    ];

    // Status distribution
    const statusDistribution = [
      { name: 'Approved', count: approvedCount, color: '#10B981' },
      { name: 'Under Review', count: underReviewCount, color: '#F59E0B' },
      { name: 'Blocked', count: blockedCount, color: '#EF4444' }
    ];

    res.json({
      success: true,
      data: {
        kpis: {
          totalTransactions: total,
          highRiskTransactions: highRiskCount,
          transactionsUnderReview: underReviewCount,
          blockedTransactions: blockedCount,
          approvedTransactions: approvedCount,
          fraudRiskRate: fraudRate,
          averageRiskScore: avgRiskScore,
          totalVolumeUSD: Math.round(totalVolumeSum),
          blockedFraudVolumeUSD: Math.round(blockedAmountSum),
          approvalRate: approvalRate,
          reviewRate: reviewRate,
          blockRate: blockRate
        },
        riskDistribution,
        statusDistribution,
        categoryRiskData,
        hourlyTrend
      }
    });
  } catch (err) {
    next(err);
  }
};
