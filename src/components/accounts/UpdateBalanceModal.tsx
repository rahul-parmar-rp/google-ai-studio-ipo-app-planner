import React, { useState, useEffect } from 'react';
import { Account } from '../../types';
import { formatINR } from '../../utils/formatters';
import { X, Check, Wallet, ArrowUpRight } from 'lucide-react';

interface UpdateBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onSave: (accountId: string, newBalance: number) => void;
}

export const UpdateBalanceModal: React.FC<UpdateBalanceModalProps> = ({
  isOpen,
  onClose,
  account,
  onSave,
}) => {
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (account) {
      setBalance(account.availableFunds || 0);
    }
  }, [account, isOpen]);

  if (!isOpen || !account) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(account.id, balance);
    onClose();
  };

  const quickAdd = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Update Available Funds</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <div className="text-xs text-slate-400">Account Target:</div>
            <div className="text-sm font-semibold text-white mt-0.5">
              {account.bankName} ({account.brokerName})
              {account.accountNickname && ` • ${account.accountNickname}`}
            </div>
            {account.upiId && (
              <div className="text-xs font-mono text-emerald-400 mt-0.5">
                UPI: {account.upiId}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Current Available Balance (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="any"
                required
                autoFocus
                value={balance}
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Formatted: <span className="font-mono text-emerald-400">{formatINR(balance)}</span>
            </p>
          </div>

          {/* Quick Increment Top-up Buttons */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5">
              Quick Top-up / Increment:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[15000, 50000, 100000, 200000].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => quickAdd(amt)}
                  className="py-1 px-2 text-[11px] font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  +{formatINR(amt)}
                </button>
              ))}
            </div>
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
              <span>Save Balance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
