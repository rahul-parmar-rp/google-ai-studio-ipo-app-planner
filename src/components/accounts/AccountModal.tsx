import React, { useState, useEffect } from 'react';
import { Account, Person } from '../../types';
import { formatINR } from '../../utils/formatters';
import { X, Check, CreditCard, Building } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  initialAccount?: Account | null;
  defaultPersonId?: string;
  onSave: (account: Omit<Account, 'id'>) => void;
}

const COMMON_BANKS = [
  'SBI',
  'HDFC Bank',
  'ICICI Bank',
  'Kotak Mahindra',
  'Axis Bank',
  'Bank of Baroda',
  'Punjab National Bank',
  'IndusInd Bank',
];

const COMMON_BROKERS = [
  'Zerodha',
  'Groww',
  'AngelOne',
  'Upstox',
  'ICICI Direct',
  'HDFC Sky',
  'Kotak Neo',
  'SBI Securities',
  'Dhan',
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  people,
  initialAccount,
  defaultPersonId,
  onSave,
}) => {
  const [personId, setPersonId] = useState('');
  const [bankName, setBankName] = useState('SBI');
  const [brokerName, setBrokerName] = useState('Zerodha');
  const [accountNickname, setAccountNickname] = useState('');
  const [availableFunds, setAvailableFunds] = useState<number>(50000);
  const [upiId, setUpiId] = useState('');
  const [dematNumber, setDematNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialAccount) {
      setPersonId(initialAccount.personId);
      setBankName(initialAccount.bankName);
      setBrokerName(initialAccount.brokerName);
      setAccountNickname(initialAccount.accountNickname || '');
      setAvailableFunds(initialAccount.availableFunds);
      setUpiId(initialAccount.upiId || '');
      setDematNumber(initialAccount.dematNumber || '');
      setNotes(initialAccount.notes || '');
      setIsActive(initialAccount.isActive);
    } else {
      setPersonId(defaultPersonId || people[0]?.id || '');
      setBankName('SBI');
      setBrokerName('Zerodha');
      setAccountNickname('');
      setAvailableFunds(50000);
      setUpiId('');
      setDematNumber('');
      setNotes('');
      setIsActive(true);
    }
  }, [initialAccount, defaultPersonId, people, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personId || !bankName.trim() || !brokerName.trim()) {
      alert('Please fill out all required fields');
      return;
    }

    onSave({
      personId,
      bankName: bankName.trim(),
      brokerName: brokerName.trim(),
      accountNickname: accountNickname.trim() || undefined,
      availableFunds: Number(availableFunds) || 0,
      upiId: upiId.trim() || undefined,
      dematNumber: dematNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      isActive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              {initialAccount ? 'Edit Bank & Broker Account' : 'Add Bank & Broker Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Account Holder (Applicant) *
            </label>
            <select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.pan ? `(${p.pan})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Funding Bank Name *
              </label>
              <input
                type="text"
                list="bank-suggestions"
                required
                placeholder="e.g. HDFC Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <datalist id="bank-suggestions">
                {COMMON_BANKS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Broker / Demat *
              </label>
              <input
                type="text"
                list="broker-suggestions"
                required
                placeholder="e.g. Zerodha"
                value={brokerName}
                onChange={(e) => setBrokerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <datalist id="broker-suggestions">
                {COMMON_BROKERS.map((br) => (
                  <option key={br} value={br} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Account Nickname
              </label>
              <input
                type="text"
                placeholder="e.g. Primary HNI Bids"
                value={accountNickname}
                onChange={(e) => setAccountNickname(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Available Funds (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={availableFunds}
                onChange={(e) => setAvailableFunds(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-emerald-400 mt-0.5 block font-mono">
                {formatINR(availableFunds)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                UPI ID for Mandates
              </label>
              <input
                type="text"
                placeholder="e.g. name@okhdfc"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Demat BOID / DP ID
              </label>
              <input
                type="text"
                placeholder="e.g. 1208160012345678"
                value={dematNumber}
                onChange={(e) => setDematNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Internal Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Auto-pay mandate approved on Google Pay"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="acc-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <label htmlFor="acc-active" className="text-xs text-slate-300">
              Active Account (available for bidding and mandate routing)
            </label>
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
              <span>{initialAccount ? 'Save Changes' : 'Add Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
