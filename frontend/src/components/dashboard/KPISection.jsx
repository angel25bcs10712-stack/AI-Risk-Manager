import React from 'react';
import StatCard from '../common/StatCard';
import { 
  Receipt, 
  ShieldAlert, 
  Clock, 
  Ban, 
  Percent, 
  TrendingUp, 
  ShieldCheck,
  DollarSign
} from 'lucide-react';

export default function KPISection({ kpis = {} }) {
  const totalTx = kpis.totalTransactions || 0;
  const highRisk = kpis.highRiskTransactions || 0;
  const inReview = kpis.transactionsUnderReview || 0;
  const blocked = kpis.blockedTransactions || 0;
  const fraudRate = kpis.fraudRiskRate || 0;
  const avgScore = kpis.averageRiskScore || 0;
  const totalVolume = kpis.totalVolumeUSD || 0;
  const blockedAmount = kpis.blockedFraudVolumeUSD || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* 1. Total Transactions */}
      <StatCard
        title="Total Transactions"
        value={totalTx.toLocaleString()}
        subtitle={`$${totalVolume.toLocaleString()} Total Vol`}
        icon={Receipt}
        color="blue"
      />

      {/* 2. High Risk Transactions */}
      <StatCard
        title="High Risk (75+)"
        value={highRisk.toLocaleString()}
        subtitle={`${((highRisk / Math.max(totalTx, 1)) * 100).toFixed(1)}% of total`}
        icon={ShieldAlert}
        color="red"
      />

      {/* 3. Transactions Under Review */}
      <StatCard
        title="Under Review"
        value={inReview.toLocaleString()}
        subtitle="Requires Analyst 2FA"
        icon={Clock}
        color="amber"
      />

      {/* 4. Blocked Transactions */}
      <StatCard
        title="Blocked"
        value={blocked.toLocaleString()}
        subtitle={`$${blockedAmount.toLocaleString()} Prevented`}
        icon={Ban}
        color="red"
      />

      {/* 5. Fraud Risk Rate */}
      <StatCard
        title="Fraud Risk Rate"
        value={`${fraudRate}%`}
        subtitle="Calculated Real-Time"
        icon={Percent}
        color={fraudRate > 25 ? 'red' : fraudRate > 10 ? 'amber' : 'emerald'}
      />

      {/* 6. Avg Risk Score */}
      <StatCard
        title="Avg Risk Score"
        value={`${avgScore}/100`}
        subtitle="Global Fleet Index"
        icon={TrendingUp}
        color={avgScore >= 60 ? 'red' : avgScore >= 40 ? 'amber' : 'emerald'}
      />
    </div>
  );
}
