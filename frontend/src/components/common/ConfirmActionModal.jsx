import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import { ShieldAlert, CheckCircle2, Clock, Ban, X, AlertTriangle } from 'lucide-react';

export default function ConfirmActionModal() {
  const { activeActionModal, closeActionModal, addToast, triggerRefresh } = useApp();
  const [action, setAction] = useState('BLOCK'); // 'APPROVE' | 'MANUAL_REVIEW' | 'BLOCK'
  const [reason, setReason] = useState('');
  const [actor, setActor] = useState('Senior Risk Officer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  if (!activeActionModal || !activeActionModal.transaction) return null;

  const tx = activeActionModal.transaction;

  // Preset quick reasons
  const quickReasons = {
    APPROVE: [
      'Verified customer identity via secondary MFA verification.',
      'Customer confirmed legitimate travel and high-value purchase.',
      'False positive: Spending pattern matches previous seasonal behavior.'
    ],
    MANUAL_REVIEW: [
      'Elevated transaction amount requires manual phone verification.',
      'Unrecognized device location mismatch; request 2FA authentication.',
      'Velocity surge detected on new hardware profile.'
    ],
    BLOCK: [
      'Confirmed unauthorized account takeover attempt.',
      'Card testing attack: Repeated failed authentication attempts detected.',
      'High-risk geographic anomaly and newly registered hardware fingerprint.'
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      addToast('Please provide an operational reason for the decision.', 'warning');
      return;
    }

    if (action === 'BLOCK' && !confirmedCheck) {
      addToast('Please check the confirmation box to authorize blocking this transaction.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.takeAction(tx.transactionId, {
        action,
        reason,
        actor
      });

      addToast(`Transaction ${tx.transactionId} marked as ${action} successfully.`, 'success');
      triggerRefresh();
      if (activeActionModal.onComplete) {
        activeActionModal.onComplete(res.data);
      }
      closeActionModal();
    } catch (err) {
      addToast(err.message || 'Failed to update transaction action.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-lg w-full rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${action === 'BLOCK' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : action === 'APPROVE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
              {action === 'BLOCK' ? <Ban className="w-5 h-5" /> : action === 'APPROVE' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Execute Risk Decision</h3>
              <p className="text-xs text-slate-400 font-mono">ID: {tx.transactionId} • ${parseFloat(tx.amount || 0).toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={closeActionModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Action Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Decision Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAction('APPROVE')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${action === 'APPROVE' ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30' : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'}`}
              >
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>

              <button
                type="button"
                onClick={() => setAction('MANUAL_REVIEW')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${action === 'MANUAL_REVIEW' ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/30' : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'}`}
              >
                <Clock className="w-4 h-4" /> In Review
              </button>

              <button
                type="button"
                onClick={() => setAction('BLOCK')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${action === 'BLOCK' ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30' : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'}`}
              >
                <Ban className="w-4 h-4" /> Block
              </button>
            </div>
          </div>

          {/* Quick preset reasons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Quick Templates
            </label>
            <div className="space-y-1.5">
              {quickReasons[action].map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setReason(preset)}
                  className="w-full text-left text-xs p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
                >
                  • {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Audit Justification & Notes <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide clear rationale for compliance and dispute resolution..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition resize-none"
              required
            />
          </div>

          {/* Actor Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Acting Officer / System ID
            </label>
            <input
              type="text"
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Confirmation Warning if Blocking */}
          {action === 'BLOCK' && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-rose-200">
                <p className="font-semibold mb-1">Controlled Action Confirmation</p>
                <label className="flex items-center gap-2 cursor-pointer mt-1 font-medium text-rose-300">
                  <input
                    type="checkbox"
                    checked={confirmedCheck}
                    onChange={(e) => setConfirmedCheck(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-rose-500 text-rose-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Are you sure you want to mark this transaction as blocked?</span>
                </label>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeActionModal}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (action === 'BLOCK' && !confirmedCheck)}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 shadow-lg ${action === 'BLOCK' ? 'bg-rose-600 hover:bg-rose-500 disabled:opacity-50' : action === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'}`}
            >
              {isSubmitting ? 'Recording Action...' : `Confirm & Apply ${action}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
