import React from 'react';
import { CheckCircle2, Clock, Ban, HelpCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const norm = (status || 'PENDING').toUpperCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = HelpCircle;
  let label = norm;

  if (norm === 'APPROVED') {
    styles = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50';
    Icon = CheckCircle2;
    label = 'APPROVED';
  } else if (norm === 'UNDER_REVIEW') {
    styles = 'bg-amber-950/40 text-amber-300 border-amber-800/50';
    Icon = Clock;
    label = 'IN REVIEW';
  } else if (norm === 'BLOCKED') {
    styles = 'bg-rose-950/40 text-rose-300 border-rose-800/50';
    Icon = Ban;
    label = 'BLOCKED';
  }

  const sizeClasses = size === 'sm' 
    ? 'text-[11px] px-2 py-0.5 gap-1' 
    : size === 'lg' 
    ? 'text-xs px-3 py-1.5 gap-1.5 font-bold tracking-wider' 
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border ${styles} ${sizeClasses}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{label}</span>
    </span>
  );
}
