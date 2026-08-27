import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import StatusBadge from '../components/common/StatusBadge';
import { 
  Search, 
  Filter, 
  Download, 
  RotateCcw, 
  ExternalLink, 
  Bot, 
  ArrowUpDown, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function TransactionsPage() {
  const { openActionModal, refreshKey, addToast } = useApp();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params = {
        limit: 15,
        page,
        sortBy,
        sortOrder
      };
      if (search.trim()) params.search = search.trim();
      if (riskFilter !== 'ALL') params.riskLevel = riskFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.getTransactions(params);
      setTransactions(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      addToast('Failed to retrieve transactions.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, riskFilter, statusFilter, sortBy, sortOrder, refreshKey]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      addToast('No transaction data to export.', 'warning');
      return;
    }

    const headers = ['Transaction ID', 'Customer ID', 'Amount', 'Merchant', 'Category', 'Location', 'Risk Score', 'Risk Level', 'Recommendation', 'Status', 'Created At'];
    const rows = transactions.map(t => [
      t.transactionId,
      t.customerId,
      t.amount,
      `"${t.merchant}"`,
      `"${t.merchantCategory || 'Retail'}"`,
      `"${t.location}"`,
      t.riskScore,
      t.riskLevel,
      t.recommendation,
      t.status,
      t.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riskguard_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Transactions exported to CSV successfully.', 'success');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Transaction Risk Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and inspect scored payment events with risk telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/analyze"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>New Live Analysis</span>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Transaction ID, Customer, Merchant, or Location..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-20 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition"
            >
              Search
            </button>
          </form>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => { setRiskFilter(lvl); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  riskFilter === lvl 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl === 'ALL' ? 'All Risk' : lvl}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            {[
              { label: 'All Status', val: 'ALL' },
              { label: 'Approved', val: 'APPROVED' },
              { label: 'In Review', val: 'UNDER_REVIEW' },
              { label: 'Blocked', val: 'BLOCKED' }
            ].map((st) => (
              <button
                key={st.val}
                onClick={() => { setStatusFilter(st.val); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === st.val 
                    ? 'bg-slate-800 text-white border border-slate-700' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 select-none">
              <tr>
                <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => { setSortBy('createdAt'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">
                    <span>Timestamp</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => { setSortBy('amount'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Merchant</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => { setSortBy('riskScore'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-mono">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Fetching transactions ledger...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No transactions found matching the specified search and filter criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const score = tx.riskScore || 0;
                  const isHigh = score >= 75;
                  const isMed = score >= 40 && score < 75;

                  return (
                    <tr
                      key={tx.transactionId}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/transactions/${tx.transactionId}`)}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {new Date(tx.createdAt || Date.now()).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Transaction ID */}
                      <td className="py-3 px-4 font-mono font-medium text-blue-400">
                        {tx.transactionId}
                      </td>

                      {/* Customer ID */}
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {tx.customerId}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        ${parseFloat(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Merchant */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{tx.merchant}</div>
                        <div className="text-[10px] text-slate-400">{tx.merchantCategory || 'Retail'}</div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <div className="text-slate-300">{tx.location}</div>
                        {tx.location !== tx.usualLocation && (
                          <div className="text-[10px] text-amber-400 font-mono">Usual: {tx.usualLocation}</div>
                        )}
                      </td>

                      {/* Risk Score */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-extrabold ${isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {score}
                          </span>
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Risk Level */}
                      <td className="py-3 px-4">
                        <RiskBadge level={tx.riskLevel} score={tx.riskScore} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusBadge status={tx.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/agent?id=${tx.transactionId}`)}
                            title="AI Investigation"
                            className="p-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:text-violet-200 transition"
                          >
                            <Bot className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openActionModal(tx)}
                            title="Decision Action"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition text-[11px] font-semibold px-2"
                          >
                            Action
                          </button>

                          <Link
                            to={`/transactions/${tx.transactionId}`}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-bold text-white">{transactions.length}</span> of <span className="font-bold text-white">{pagination.total}</span> transactions
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono px-2">
              Page {page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
