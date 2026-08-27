import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import StatCard from '../components/common/StatCard';
import VolumeChart from '../components/dashboard/VolumeChart';
import RiskDistributionChart from '../components/dashboard/RiskDistributionChart';
import CategoryRiskChart from '../components/dashboard/CategoryRiskChart';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Ban, 
  Clock, 
  Percent, 
  CheckCircle2,
  PieChart as PieIcon,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export default function AnalyticsPage() {
  const { refreshKey, addToast } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await api.getAnalytics();
        setAnalytics(res.data);
      } catch (err) {
        addToast('Failed to load analytics metrics.', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [refreshKey]);

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-16 text-center text-slate-400 font-mono">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Aggregating enterprise fraud analytics...
      </div>
    );
  }

  const kpis = analytics ? analytics.kpis : {};
  const statusData = analytics ? analytics.statusDistribution : [];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold mb-2 font-mono">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Payment Risk Intelligence & Prevention Telemetry</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Risk Analytics & Decision Funnel
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Aggregated payment volume protection, approval conversion rates, and threat vector distribution.
        </p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Transactions"
          value={(kpis.totalTransactions || 0).toLocaleString()}
          subtitle="Processed to Date"
          icon={TrendingUp}
          color="blue"
        />

        <StatCard
          title="High Risk Volume"
          value={(kpis.highRiskTransactions || 0).toLocaleString()}
          subtitle={`${kpis.fraudRiskRate || 0}% of Traffic`}
          icon={Ban}
          color="red"
        />

        <StatCard
          title="Approval Rate"
          value={`${kpis.approvalRate || 0}%`}
          subtitle="Frictionless Approvals"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Review Rate"
          value={`${kpis.reviewRate || 0}%`}
          subtitle="Step-Up 2FA Routing"
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Block Rate"
          value={`${kpis.blockRate || 0}%`}
          subtitle="Strict Threat Intercepts"
          icon={Ban}
          color="red"
        />

        <StatCard
          title="Fraud Saved ($)"
          value={`$${(kpis.blockedFraudVolumeUSD || 0).toLocaleString()}`}
          subtitle="Prevented Loss Total"
          icon={DollarSign}
          color="emerald"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Decision Funnel Chart */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between h-80 border border-slate-800">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Decision Outcome Funnel</span>
            </h3>
            <p className="text-xs text-slate-400">Total volume of transactions by final operational decision</p>
          </div>

          <div className="w-full h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1E293B', borderRadius: '8px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Risk Distribution Donut */}
        <RiskDistributionChart data={analytics ? analytics.riskDistribution : []} />

        {/* 3. Hourly Attack Pattern Area Chart */}
        <VolumeChart data={analytics ? analytics.hourlyTrend : []} />

        {/* 4. Merchant Category Breakdown */}
        <CategoryRiskChart data={analytics ? analytics.categoryRiskData : []} />
      </div>
    </div>
  );
}
