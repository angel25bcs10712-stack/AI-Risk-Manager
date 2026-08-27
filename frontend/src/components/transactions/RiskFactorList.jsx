import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function RiskFactorList({ factors = [], riskScore = 0, title = 'Identified Risk Factors' }) {
  if (!factors || factors.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
        No significant risk factors flagged for this transaction.
      </div>
    );
  }

  const isHigh = riskScore >= 75;
  const isMed = riskScore >= 40 && riskScore < 75;

  return (
    <div className="space-y-2.5">
      {title && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title} ({factors.length})
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {isHigh ? 'High Severity Flags' : isMed ? 'Moderate Flags' : 'Verified Safe'}
          </span>
        </div>
      )}

      <div className="space-y-2">
        {factors.map((factor, idx) => {
          let badgeColor = 'border-slate-800 bg-slate-900/60 text-slate-300';
          let Icon = AlertCircle;
          let iconColor = 'text-blue-400';

          const textLower = factor.toLowerCase();
          if (textLower.includes('significantly') || textLower.includes('brand new device') || textLower.includes('severe') || textLower.includes('failure')) {
            badgeColor = 'border-rose-500/30 bg-rose-500/10 text-rose-200';
            Icon = ShieldAlert;
            iconColor = 'text-rose-400';
          } else if (textLower.includes('substantially') || textLower.includes('anomaly') || textLower.includes('elevated') || textLower.includes('unusual')) {
            badgeColor = 'border-amber-500/30 bg-amber-500/10 text-amber-200';
            Icon = AlertTriangle;
            iconColor = 'text-amber-400';
          } else if (textLower.includes('align') || textLower.includes('trusted') || textLower.includes('normal')) {
            badgeColor = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-400';
          }

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-start gap-3 transition ${badgeColor}`}
            >
              <span className="font-mono text-xs font-bold opacity-60 mt-0.5">{idx + 1}.</span>
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="text-xs leading-relaxed font-medium">
                {factor}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
