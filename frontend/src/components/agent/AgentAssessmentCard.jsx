import React from 'react';
import RiskBadge from '../common/RiskBadge';
import RiskMeter from '../common/RiskMeter';
import { Bot, Sparkles, CheckCircle2, AlertTriangle, Ban, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function AgentAssessmentCard({ investigation = {}, onActionClick }) {
  const riskScore = investigation.riskScore !== undefined ? investigation.riskScore : 0;
  const riskLevel = investigation.riskLevel || 'LOW';
  const recommendation = investigation.recommendation || 'APPROVE';
  const reason = investigation.reason || 'Transaction analysis normal.';
  const confidence = investigation.reviewCase ? (investigation.reviewCase.confidence * 100).toFixed(0) : '94';
  const caseId = investigation.reviewCase ? investigation.reviewCase.caseId : `CASE-${Date.now().toString().slice(-4)}`;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-violet-500/30 bg-gradient-to-b from-violet-950/20 via-slate-900/50 to-slate-900 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>AI Risk Assessment Dossier</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {caseId}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Autonomous synthesis & actionable recommendation</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] uppercase font-semibold text-slate-400">Model Confidence</span>
          <div className="text-sm font-mono font-bold text-violet-400">{confidence}%</div>
        </div>
      </div>

      {/* Assessment Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 items-center">
        {/* Risk Meter */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
          <RiskMeter score={riskScore} size="md" showLabels={true} />
        </div>

        {/* Core AI Synthesis & Recommendation */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Recommended Policy Action
            </span>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-extrabold px-4 py-2 rounded-xl border flex items-center gap-2 tracking-wide shadow-md ${
                recommendation === 'BLOCK'
                  ? 'bg-rose-600/20 text-rose-400 border-rose-500/40 shadow-rose-900/20'
                  : recommendation === 'MANUAL REVIEW'
                  ? 'bg-amber-600/20 text-amber-400 border-amber-500/40 shadow-amber-900/20'
                  : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 shadow-emerald-900/20'
              }`}>
                {recommendation === 'BLOCK' ? <Ban className="w-4 h-4" /> : recommendation === 'MANUAL REVIEW' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {recommendation}
              </span>
              <RiskBadge level={riskLevel} score={riskScore} size="lg" />
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              AI Forensic Reasoning
            </span>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
              "{reason}"
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {onActionClick && (
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Controlled execution requires analyst authorization.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onActionClick('APPROVE')}
              className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
            </button>
            <button
              onClick={() => onActionClick('MANUAL_REVIEW')}
              className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600 border border-amber-500/40 hover:border-amber-500 text-amber-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Request Review
            </button>
            <button
              onClick={() => onActionClick('BLOCK')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
            >
              <Ban className="w-3.5 h-3.5" /> Block Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
