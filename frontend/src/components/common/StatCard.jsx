import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  color = 'blue',
  badge
}) {
  const colorMap = {
    blue: 'border-blue-500/20 text-blue-400 bg-blue-500/10',
    red: 'border-rose-500/20 text-rose-400 bg-rose-500/10',
    amber: 'border-amber-500/20 text-amber-400 bg-amber-500/10',
    emerald: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10',
    indigo: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/10'
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 transition-all duration-200 relative overflow-hidden flex flex-col justify-between">
      {/* Subtle background glow */}
      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none ${colorMap[color]}`} />

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          {Icon && (
            <div className={`p-2 rounded-xl border ${colorMap[color]}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
            {value}
          </span>
          {badge && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              {badge}
            </span>
          )}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-slate-400">{subtitle}</span>
          )}
          {trend && (
            <span className={`font-semibold flex items-center gap-1 ${trendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trendPositive ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
