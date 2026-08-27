import React from 'react';

export default function RiskMeter({ score = 0, size = 'lg', showLabels = true }) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  let colorClass = 'text-emerald-400';
  let strokeColor = '#10B981';
  let bgGradient = 'from-emerald-500/20 to-transparent';
  let levelText = 'LOW RISK';
  let badgeColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';

  if (clampedScore >= 75) {
    colorClass = 'text-rose-400';
    strokeColor = '#EF4444';
    bgGradient = 'from-rose-500/20 to-transparent';
    levelText = 'HIGH RISK';
    badgeColor = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  } else if (clampedScore >= 40) {
    colorClass = 'text-amber-400';
    strokeColor = '#F59E0B';
    bgGradient = 'from-amber-500/20 to-transparent';
    levelText = 'MEDIUM RISK';
    badgeColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  }

  // Semi-circle gauge calculation
  const radius = 64;
  const circumference = Math.PI * radius; // 180 deg arc
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
        {/* SVG Arc Gauge */}
        <svg className="w-44 h-44 -rotate-90 transform origin-center translate-y-10" viewBox="0 0 160 160">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#1E293B"
            strokeWidth="14"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
          {/* Active Colored Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="14"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Score Display */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <div className={`text-3xl font-extrabold font-mono tracking-tight ${colorClass}`}>
            {clampedScore}
            <span className="text-xs font-normal text-slate-400 ml-0.5">/100</span>
          </div>
        </div>
      </div>

      {showLabels && (
        <div className="mt-2 flex flex-col items-center gap-1">
          <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${badgeColor}`}>
            {levelText}
          </span>
          <div className="flex justify-between w-36 text-[10px] text-slate-400 font-mono mt-1">
            <span>0 LOW</span>
            <span>40 MED</span>
            <span>75+ HIGH</span>
          </div>
        </div>
      )}
    </div>
  );
}
