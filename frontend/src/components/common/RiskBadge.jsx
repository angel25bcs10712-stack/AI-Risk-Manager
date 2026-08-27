import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ level, score, showIcon = true, size = 'md' }) {
  const normalizedLevel = (level || 'LOW').toUpperCase();

  let styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let Icon = ShieldCheck;
  let label = 'LOW RISK';

  if (normalizedLevel === 'HIGH' || score >= 75) {
    styles = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    Icon = ShieldAlert;
    label = 'HIGH RISK';
  } else if (normalizedLevel === 'MEDIUM' || score >= 40) {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    Icon = AlertTriangle;
    label = 'MEDIUM RISK';
  }

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1' 
    : size === 'lg' 
    ? 'text-sm px-3.5 py-1.5 gap-2 font-bold tracking-wide' 
    : 'text-xs px-2.5 py-1 gap-1.5 font-semibold';

  return (
    <span className={`inline-flex items-center rounded-full border ${styles} ${sizeClasses} shadow-sm backdrop-blur-sm`}>
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
      {score !== undefined && (
        <span className="opacity-75 font-mono text-[11px]">({score})</span>
      )}
    </span>
  );
}
