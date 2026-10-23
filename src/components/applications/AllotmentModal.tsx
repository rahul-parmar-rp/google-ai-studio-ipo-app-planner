import React, { useState, useEffect } from 'react';
import { Application, ApplicationStatus } from '../../types';
import { formatINR } from '../../utils/formatters';
import { X, Check, Award, AlertCircle } from 'lucide-react';

interface AllotmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  onSave: (
    appId: string,
    status: ApplicationStatus,
    extras: { sharesAllotted?: number; refundAmount?: number; notes?: string }
  ) => void;
}

export const AllotmentModal: React.FC<AllotmentModalProps> = ({
  isOpen,
  onClose,
  application,
  onSave,
}) => {
  const [status, setStatus] = useState<ApplicationStatus>('ALLOTTED');
  const [sharesAllotted, setSharesAllotted] = useState<number>(0);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (application) {
      const initialStatus =
        application.status === 'ALLOTTED' || application.status === 'NOT_ALLOTTED'
          ? application.status
          : 'ALLOTTED';
      setStatus(initialStatus);

      if (initialStatus === 'ALLOTTED') {
        setSharesAllotted(application.sharesAllotted || application.shares || 0);
        setRefundAmount(application.refundAmount || 0);
      } else {
        setSharesAllotted(0);
        setRefundAmount(application.refundAmount || application.totalAmount || 0);
      }
      setNotes(application.notes || '');
    }
  }, [application, isOpen]);

  if (!isOpen || !application) return null;

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    setStatus(newStatus);
    if (newStatus === 'ALLOTTED') {
      setSharesAllotted(application.shares || 0);
      setRefundAmount(0);
    } else if (newStatus === 'NOT_ALLOTTED') {
      setSharesAllotted(0);
      setRefundAmount(application.totalAmount);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(application.id, status, {
      sharesAllotted: Number(sharesAllotted) || 0,
      refundAmount: Number(refundAmount) || 0,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              Record Allotment Status — {application.applicationNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Applied Shares:</span>
              <span className="font-mono text-white font-semibold">
                {application.shares} shares ({application.lots} lots)
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Blocked Capital:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {formatINR(application.totalAmount)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Allotment Outcome
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleStatusChange('ALLOTTED')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                  status === 'ALLOTTED'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-xs'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                🎉 Allotted
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('NOT_ALLOTTED')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                  status === 'NOT_ALLOTTED'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500 shadow-xs'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                ❌ Not Allotted
              </button>
            </div>
          </div>

          {status === 'ALLOTTED' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Shares Allotted
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={sharesAllotted}
                onChange={(e) => setSharesAllotted(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Refund / Unblocked Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={refundAmount}
              onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Amount to be unblocked by bank or refunded to savings account.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Outcome Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Full allotment confirmed on Link Intime"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Allotment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
