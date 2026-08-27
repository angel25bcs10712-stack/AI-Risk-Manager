import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import InvestigationTimeline from '../components/agent/InvestigationTimeline';
import AgentAssessmentCard from '../components/agent/AgentAssessmentCard';
import EvidenceBoard from '../components/agent/EvidenceBoard';
import RiskBadge from '../components/common/RiskBadge';
import { 
  Bot, 
  Sparkles, 
  Play, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Ban, 
  ShieldCheck, 
  Cpu, 
  Layers
} from 'lucide-react';

export default function AIAgentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openActionModal, addToast } = useApp();

  const queryTxId = searchParams.get('id');

  const [availableTransactions, setAvailableTransactions] = useState([]);
  const [selectedTxId, setSelectedTxId] = useState(queryTxId || '');
  const [selectedTx, setSelectedTx] = useState(null);
  const [investigation, setInvestigation] = useState(null);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Fetch recent high/medium risk transactions for quick investigation selection
  useEffect(() => {
    async function loadTransactions() {
      setIsLoadingList(true);
      try {
        const res = await api.getTransactions({ limit: 25, sortBy: 'riskScore', sortOrder: 'desc' });
        const list = res.data || [];
        setAvailableTransactions(list);

        if (queryTxId) {
          const matched = list.find(t => t.transactionId === queryTxId);
          if (matched) {
            setSelectedTx(matched);
            setSelectedTxId(matched.transactionId);
            runAgentInvestigation(matched);
          } else {
            // Fetch directly
            try {
              const single = await api.getTransactionById(queryTxId);
              if (single.data) {
                setSelectedTx(single.data);
                setSelectedTxId(single.data.transactionId);
                runAgentInvestigation(single.data);
              }
            } catch (e) {
              console.warn(e);
            }
          }
        } else if (list.length > 0) {
          // Select highest risk by default
          setSelectedTx(list[0]);
          setSelectedTxId(list[0].transactionId);
          runAgentInvestigation(list[0]);
        }
      } catch (err) {
        addToast('Failed to load transaction candidate list.', 'error');
      } finally {
        setIsLoadingList(false);
      }
    }

    loadTransactions();
  }, [queryTxId]);

  const runAgentInvestigation = async (targetTx) => {
    if (!targetTx) return;
    setIsInvestigating(true);
    setInvestigation(null);

    try {
      const res = await api.investigateWithAgent({
        transactionId: targetTx.transactionId,
        amount: targetTx.amount,
        customerId: targetTx.customerId,
        merchant: targetTx.merchant,
        merchantCategory: targetTx.merchantCategory,
        deviceId: targetTx.deviceId,
        deviceAge: targetTx.deviceAge,
        location: targetTx.location,
        usualLocation: targetTx.usualLocation,
        transactionFrequency: targetTx.transactionFrequency,
        failedTransactions: targetTx.failedTransactions,
        previousAverage: targetTx.previousAverage,
        accountAge: targetTx.accountAge,
        previousChargebacks: targetTx.previousChargebacks
      });

      setInvestigation(res.data);
      addToast(`AI Investigation complete for ${targetTx.transactionId}`, 'success');
    } catch (err) {
      addToast(err.message || 'AI Investigation failed.', 'error');
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleSelectTxChange = (txId) => {
    setSelectedTxId(txId);
    const target = availableTransactions.find(t => t.transactionId === txId);
    if (target) {
      setSelectedTx(target);
      runAgentInvestigation(target);
    }
  };

  const handleControlledAction = (actionType) => {
    if (!selectedTx) return;
    openActionModal(selectedTx, (updated) => {
      setSelectedTx(prev => ({ ...prev, ...updated }));
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-slate-900/60 to-indigo-950/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 text-xs font-semibold mb-2 font-mono">
              <Bot className="w-3.5 h-3.5 text-violet-400" />
              <span>Autonomous Multi-Tool Forensic Agent</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              AI Risk Investigation Agent
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Deploys conceptual forensic tools to examine customer baselines, device fingerprints, geo travel anomalies, and auth velocity before synthesizing an actionable recommendation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => runAgentInvestigation(selectedTx)}
              disabled={isInvestigating || !selectedTx}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-violet-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isInvestigating ? 'animate-spin' : ''}`} />
              <span>{isInvestigating ? 'Agent Investigating...' : 'Re-Run Agent'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target Transaction Selector Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            Select Investigation Target:
          </label>
          <select
            value={selectedTxId}
            onChange={(e) => handleSelectTxChange(e.target.value)}
            disabled={isLoadingList || isInvestigating}
            className="flex-1 max-w-xl bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-violet-500 transition"
          >
            {availableTransactions.map((t) => (
              <option key={t.transactionId} value={t.transactionId}>
                {t.transactionId} — ${parseFloat(t.amount || 0).toLocaleString()} at {t.merchant} [{t.riskLevel} RISK: {t.riskScore}/100]
              </option>
            ))}
          </select>
        </div>

        {selectedTx && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono">Current Status:</span>
            <span className="font-bold text-white font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {selectedTx.status || 'PENDING'}
            </span>
          </div>
        )}
      </div>

      {/* Investigation Workspace Grid */}
      {isInvestigating ? (
        <div className="glass-panel rounded-2xl p-16 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 border-3 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">AI Agent In Progress</h3>
            <p className="text-xs text-slate-400 font-mono">
              Executing getCustomerHistory() → checkDevice() → checkLocation() → calculateRisk() → createReviewCase()
            </p>
          </div>
        </div>
      ) : investigation ? (
        <div className="space-y-6">
          {/* Top Assessment Dossier Card */}
          <AgentAssessmentCard
            investigation={investigation}
            onActionClick={handleControlledAction}
          />

          {/* Evidence Board (4 Quadrants) */}
          <EvidenceBoard evidence={investigation.evidence} />

          {/* Sequential 7-Step Tool Timeline */}
          <InvestigationTimeline timeline={investigation.timeline} />
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
          Select a transaction above to initiate autonomous AI investigation.
        </div>
      )}
    </div>
  );
}
