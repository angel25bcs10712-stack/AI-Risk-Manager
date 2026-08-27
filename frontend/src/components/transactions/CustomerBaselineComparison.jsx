import React from 'react';
import { DollarSign, Clock, Smartphone, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function CustomerBaselineComparison({ transaction = {} }) {
  const amount = parseFloat(transaction.amount || 0);
  const prevAvg = parseFloat(transaction.previousAverage || amount);
  const ratio = prevAvg > 0 ? (amount / prevAvg).toFixed(1) : '1.0';
  const isRatioHigh = parseFloat(ratio) >= 3.0;

  const isNewDevice = (transaction.deviceAge !== undefined && transaction.deviceAge <= 2);
  const isLocationMismatch = transaction.location && transaction.usualLocation && (transaction.location.toLowerCase() !== transaction.usualLocation.toLowerCase());
  const freq = transaction.transactionFrequency || 0;
  const failed = transaction.failedTransactions || 0;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Customer Historical Baseline Comparison
          </h4>
          <p className="text-[11px] text-slate-400">Current transaction deviation against established customer profile</p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
          ID: {transaction.customerId || 'CUST-N/A'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* 1. Spend Deviation */}
        <div className={`p-3.5 rounded-xl border ${isRatioHigh ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900/60 border-slate-800'}`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Spend Deviation</span>
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono text-base font-bold text-white">${amount.toLocaleString()}</span>
            <span className={`font-mono text-xs font-bold ${isRatioHigh ? 'text-rose-400' : 'text-emerald-400'}`}>
              {ratio}x Avg
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Typical Avg: <span className="text-slate-300 font-mono">${prevAvg.toLocaleString()}</span>
          </div>
        </div>

        {/* 2. Device Age */}
        <div className={`p-3.5 rounded-xl border ${isNewDevice ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900/60 border-slate-800'}`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Device Profile</span>
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono text-base font-bold text-white">{transaction.deviceAge || 0} days</span>
            <span className={`font-mono text-xs font-bold ${isNewDevice ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isNewDevice ? 'NEW DEVICE' : 'KNOWN'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            {transaction.deviceId || 'DEV-HARDWARE'}
          </div>
        </div>

        {/* 3. Geolocation */}
        <div className={`p-3.5 rounded-xl border ${isLocationMismatch ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900/60 border-slate-800'}`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Location Check</span>
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="mt-1 font-semibold text-white truncate">
            {transaction.location || 'Unknown'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            Usual: <span className="text-slate-300">{transaction.usualLocation || 'Same'}</span>
          </div>
        </div>

        {/* 4. Velocity & Auth */}
        <div className={`p-3.5 rounded-xl border ${freq >= 4 || failed >= 2 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900/60 border-slate-800'}`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Velocity & Auth</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono text-base font-bold text-white">{freq} tx / 10m</span>
            <span className={`font-mono text-xs font-bold ${failed > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {failed} failed
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Account Age: <span className="text-slate-300 font-mono">{transaction.accountAge || 90}d</span>
          </div>
        </div>
      </div>
    </div>
  );
}
