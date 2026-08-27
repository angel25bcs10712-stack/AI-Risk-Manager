import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  User, 
  ExternalLink,
  Clock,
  Ban,
  CheckCircle2
} from 'lucide-react';

export default function AuditLogsPage() {
  const { refreshKey, addToast } = useApp();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAuditLogs({ limit: 100 });
      setLogs(res.data || []);
    } catch (err) {
      addToast('Failed to fetch audit log trail.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [refreshKey]);

  const filteredLogs = logs.filter(l => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (l.transactionId && l.transactionId.toLowerCase().includes(q)) ||
      (l.actor && l.actor.toLowerCase().includes(q)) ||
      (l.reason && l.reason.toLowerCase().includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold mb-2 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Immutable Compliance & Governance Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Risk Decision Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete tamper-evident log of all automated ML scorings, AI Agent investigations, and analyst decisions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by Transaction ID, Actor, Reason, or Action..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Transition</th>
                <th className="py-3.5 px-4">Operational Reason</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading audit records...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No audit records found matching your query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  let actionBadge = 'bg-slate-800 text-slate-300 border-slate-700';
                  if (log.action === 'BLOCK') actionBadge = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
                  else if (log.action === 'APPROVE') actionBadge = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                  else if (log.action === 'MANUAL_REVIEW') actionBadge = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
                  else if (log.action === 'INVESTIGATE') actionBadge = 'bg-violet-500/15 text-violet-300 border-violet-500/30';

                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      {/* Transaction ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-blue-400">
                        {log.transactionId}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border ${actionBadge}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Transition */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                        <span className="text-slate-400">{log.previousStatus || 'INIT'}</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span className="text-white font-bold">{log.newStatus}</span>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 text-slate-300 max-w-md">
                        <div className="line-clamp-2 leading-relaxed">
                          {log.reason}
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.actor || 'System'}</span>
                        </div>
                      </td>

                      {/* Inspect Link */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/transactions/${log.transactionId}`}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition inline-block"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
