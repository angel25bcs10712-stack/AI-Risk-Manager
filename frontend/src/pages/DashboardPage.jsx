import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import KPISection from '../components/dashboard/KPISection';
import VolumeChart from '../components/dashboard/VolumeChart';
import RiskDistributionChart from '../components/dashboard/RiskDistributionChart';
import HighRiskTrendChart from '../components/dashboard/HighRiskTrendChart';
import CategoryRiskChart from '../components/dashboard/CategoryRiskChart';
import RecentTransactionsTable from '../components/dashboard/RecentTransactionsTable';
import { ShieldCheck, Sparkles, RefreshCw, ArrowRight, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { refreshKey, addToast } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [analyticsRes, txRes] = await Promise.all([
        api.getAnalytics(),
        api.getTransactions({ limit: 12, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);

      setAnalytics(analyticsRes.data);
      setTransactions(txRes.data || []);
    } catch (err) {
      addToast('Failed to load dashboard metrics. Retrying...', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-indigo-950/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold mb-2 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time ML Fraud Shield Active</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Payment Risk & Fraud Command Center
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Continuous transaction scoring, autonomous multi-tool forensic investigation, and explainable decision enforcement.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
              <span>Refresh Feed</span>
            </button>

            <Link
              to="/analyze"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <span>Test Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/agent"
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-violet-600/20"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Risk Agent</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Section */}
      <KPISection kpis={analytics ? analytics.kpis : {}} />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Volume Trend Area Chart */}
        <VolumeChart data={analytics ? analytics.hourlyTrend : []} />

        {/* 2. Risk Distribution Donut */}
        <RiskDistributionChart data={analytics ? analytics.riskDistribution : []} />

        {/* 3. High Risk Attack Velocity Chart */}
        <HighRiskTrendChart data={analytics ? analytics.hourlyTrend : []} />

        {/* 4. Risk by Merchant Category */}
        <CategoryRiskChart data={analytics ? analytics.categoryRiskData : []} />
      </div>

      {/* Recent Suspicious Transactions Feed */}
      <RecentTransactionsTable 
        transactions={transactions} 
        isLoading={isLoading} 
      />
    </div>
  );
}
