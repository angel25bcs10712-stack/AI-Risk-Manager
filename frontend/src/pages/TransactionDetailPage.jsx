import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import StatusBadge from '../components/common/StatusBadge';
import RiskMeter from '../components/common/RiskMeter';
import RiskFactorList from '../components/transactions/RiskFactorList';
import CustomerBaselineComparison from '../components/transactions/CustomerBaselineComparison';
import { 
  ArrowLeft, 
  Bot, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Ban, 
  FileText, 
  CreditCard, 
  Building2, 
  MapPin, 
  Smartphone, 
  ShieldCheck, 
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function TransactionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openActionModal, addToast, refreshKey } = useApp();

  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const fetchTransaction = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTransactionById(id);
      setTransaction(res.data);
    } catch (err) {
      addToast(`Could not find transaction '${id}'.`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [id, refreshKey]);

  const handleReanalyze = async () => {
    setIsReanalyzing(true);
    try {
      const res = await api.reanalyzeTransaction(id);
      setTransaction(res.data);
      addToast('Transaction re-evaluated with latest ML weights.', 'success');
    } catch (err) {
      addToast('Re-analysis failed.', 'error');
    } finally {
      setIsReanalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 font-mono">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading transaction telemetry dossier...
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center space-y-4">
        <p className="text-slate-400">Transaction ID not found.</p>
        <Link to="/transactions" className="inline-block px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold text-white">
          Back to Transactions
        </Link>
      </div>
    );
  }

  const score = transaction.riskScore || 0;
  const fraudProb = (transaction.fraudProbability ? (transaction.fraudProbability * 100).toFixed(1) : (score).toString()) + '%';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/transactions"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white font-mono tracking-tight">
                {transaction.transactionId}
              </h1>
              <StatusBadge status={transaction.status} size="md" />
              <RiskBadge level={transaction.riskLevel} score={transaction.riskScore} size="md" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged on {new Date(transaction.createdAt || Date.now()).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Re-analyze Button */}
          <button
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin text-blue-400' : ''}`} />
            <span>Re-Scoring</span>
          </button>

          {/* AI Investigation Button */}
          <button
            onClick={() => navigate(`/agent?id=${transaction.transactionId}`)}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-violet-600/20"
          >
            <Bot className="w-4 h-4" />
            <span>Launch AI Investigation</span>
          </button>

          {/* Execute Decision Action Button */}
          <button
            onClick={() => openActionModal(transaction, (updated) => setTransaction(prev => ({ ...prev, ...updated })))}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
          >
            <span>Take Controlled Action</span>
          </button>
        </div>
      </div>

      {/* Main Grid Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Risk Score & Decision Summary */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Risk Assessment</span>
              <span className="text-xs font-mono text-slate-400">ML Confidence: High</span>
            </div>

            <div className="py-6 flex flex-col items-center justify-center">
              <RiskMeter score={score} size="lg" showLabels={true} />
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Fraud Probability:</span>
                <span className="font-mono font-bold text-white">{fraudProb}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Classification Level:</span>
                <RiskBadge level={transaction.riskLevel} size="sm" />
              </div>
              <div className="flex justify-between text-slate-300 items-center">
                <span className="text-slate-400">Recommended Action:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                  transaction.recommendation === 'BLOCK' ? 'bg-rose-500/20 text-rose-300' : transaction.recommendation === 'MANUAL REVIEW' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {transaction.recommendation}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>Policy actions are recorded to the immutable risk audit trail.</span>
          </div>
        </div>

        {/* Right 2 Columns: Transaction Metadata & Risk Factors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Amount</span>
              <span className="text-lg font-mono font-extrabold text-white">
                ${parseFloat(transaction.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Merchant</span>
              <span className="text-sm font-bold text-white truncate block">{transaction.merchant}</span>
              <span className="text-[10px] text-slate-400">{transaction.merchantCategory}</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Origin Location</span>
              <span className="text-sm font-bold text-white truncate block">{transaction.location}</span>
              <span className="text-[10px] text-slate-400 truncate block">Usual: {transaction.usualLocation}</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Hardware Fingerprint</span>
              <span className="text-xs font-mono font-semibold text-slate-200 truncate block">{transaction.deviceId}</span>
              <span className="text-[10px] text-slate-400">{transaction.deviceAge || 0} days active</span>
            </div>
          </div>

          {/* Risk Factors Explanation */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Why was this transaction flagged?
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">ML Attribution Engine</span>
            </div>

            <RiskFactorList factors={transaction.riskFactors} riskScore={transaction.riskScore} title="" />
          </div>

          {/* Customer Baseline Comparison */}
          <CustomerBaselineComparison transaction={transaction} />
        </div>
      </div>

      {/* Audit Log Timeline for this Transaction */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Transaction Audit Trail</h3>
          </div>
          <span className="text-xs text-slate-400">Compliance Log History</span>
        </div>

        {transaction.auditLogs && transaction.auditLogs.length > 0 ? (
          <div className="space-y-3">
            {transaction.auditLogs.map((log, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {log.action}
                  </span>
                  <span className="text-slate-200">{log.reason}</span>
                </div>

                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span>Actor: {log.actor || 'System'}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No manual actions recorded yet. Automated ML baseline initial score applied.</p>
        )}
      </div>
    </div>
  );
}
