import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RiskBadge from '../common/RiskBadge';
import StatusBadge from '../common/StatusBadge';
import { useApp } from '../../context/AppContext';
import { 
  Bot, 
  ExternalLink, 
  CheckCircle2, 
  Ban, 
  Clock, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function RecentTransactionsTable({ transactions = [], isLoading = false }) {
  const { openActionModal } = useApp();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center min-h-[250px]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-400 font-mono">Loading suspicious transactions feed...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center text-slate-400">
        No transactions found matching the filter criteria.
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Recent Suspicious Transactions</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Live Feed
            </span>
          </h3>
          <p className="text-xs text-slate-400">Transactions evaluated by RiskGuard ML Risk Engine</p>
        </div>
        <Link 
          to="/transactions" 
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
        >
          View All Transactions <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Merchant</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Risk Score</th>
              <th className="py-3 px-4">Risk Level</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {transactions.slice(0, 10).map((tx) => {
              const score = tx.riskScore || 0;
              const isHigh = score >= 75;
              const isMed = score >= 40 && score < 75;

              return (
                <tr 
                  key={tx.transactionId}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/transactions/${tx.transactionId}`)}
                >
                  {/* Transaction ID */}
                  <td className="py-3.5 px-4 font-mono font-medium text-blue-400 flex items-center gap-1.5">
                    {tx.transactionId}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    ${parseFloat(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Merchant */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{tx.merchant}</div>
                    <div className="text-[11px] text-slate-400">{tx.merchantCategory || 'Retail'}</div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4">
                    <div className="text-slate-300">{tx.location}</div>
                    {tx.location !== tx.usualLocation && (
                      <div className="text-[10px] text-amber-400 font-mono">Usual: {tx.usualLocation}</div>
                    )}
                  </td>

                  {/* Risk Score Progress Bar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-extrabold ${isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {score}
                      </span>
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Risk Level Badge */}
                  <td className="py-3.5 px-4">
                    <RiskBadge level={tx.riskLevel} score={tx.riskScore} size="sm" />
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={tx.status} size="sm" />
                  </td>

                  {/* Quick Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {/* AI Agent Investigate button */}
                      <button
                        onClick={() => navigate(`/agent?id=${tx.transactionId}`)}
                        title="Launch AI Risk Agent Investigation"
                        className="p-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:text-violet-200 transition flex items-center gap-1"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold hidden xl:inline">Investigate</span>
                      </button>

                      {/* Controlled Action Trigger Modal */}
                      <button
                        onClick={() => openActionModal(tx)}
                        title="Approve / Review / Block"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition text-[11px] font-semibold px-2"
                      >
                        Action
                      </button>

                      <Link
                        to={`/transactions/${tx.transactionId}`}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="View Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
