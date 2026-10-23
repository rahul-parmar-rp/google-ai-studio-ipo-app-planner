import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, ApplicationStatus, QuotaConfig } from '../../types';
import { formatINR, formatDate, formatQuotaLabel } from '../../utils/formatters';
import {
  X,
  AlertTriangle,
  Info,
  Check,
  Calculator,
  User,
  CreditCard,
  Building2,
  Tag,
} from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialApplication?: Application | null;
  defaultIpoId?: string | null;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  initialApplication,
  defaultIpoId,
}) => {
  const {
    people,
    accounts,
    ipos,
    applications,
    addApplication,
    updateApplication,
    validateApplicationInput,
  } = useApp();

  const [personId, setPersonId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [ipoId, setIpoId] = useState<string>('');
  const [quotaId, setQuotaId] = useState<string>('');
  const [lots, setLots] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number | undefined>(undefined);
  const [upiId, setUpiId] = useState<string>('');
  const [status, setStatus] = useState<ApplicationStatus>('APPLIED');
  const [notes, setNotes] = useState<string>('');
  const [allowDuplicateOverride, setAllowDuplicateOverride] = useState<boolean>(false);

  // Initialize or reset form state
  useEffect(() => {
    if (!isOpen) return;

    if (initialApplication) {
      setPersonId(initialApplication.personId);
      setAccountId(initialApplication.accountId);
      setIpoId(initialApplication.ipoId);
      setQuotaId(initialApplication.quotaId);
      setLots(initialApplication.lots);
      setCustomPrice(initialApplication.appliedPrice);
      setUpiId(initialApplication.upiId || '');
      setStatus(initialApplication.status);
      setNotes(initialApplication.notes || '');
      setAllowDuplicateOverride(true);
    } else {
      const activePeople = people.filter((p) => p.isActive);
      const defaultPerson = activePeople[0]?.id || '';
      const initialIpo = defaultIpoId || ipos.find((i) => i.isActive)?.id || ipos[0]?.id || '';
      const ipoObj = ipos.find((i) => i.id === initialIpo);
      const defaultQuota = ipoObj?.quotas[0]?.id || '';

      setPersonId(defaultPerson);
      setIpoId(initialIpo);
      setQuotaId(defaultQuota);
      setLots(ipoObj?.quotas[0]?.minLots || 1);
      setCustomPrice(undefined);
      setStatus('APPLIED');
      setNotes('');
      setAllowDuplicateOverride(false);

      // Select first account for this person
      const personAccs = accounts.filter((a) => a.personId === defaultPerson && a.isActive);
      if (personAccs.length > 0) {
        setAccountId(personAccs[0].id);
        setUpiId(personAccs[0].upiId || '');
      } else {
        setAccountId('');
        setUpiId('');
      }
    }
  }, [isOpen, initialApplication, defaultIpoId, people, ipos, accounts]);

  // When person changes, filter accounts and select first
  const availableAccountsForPerson = useMemo(() => {
    return accounts.filter((a) => a.personId === personId && a.isActive);
  }, [accounts, personId]);

  const handlePersonChange = (newPersonId: string) => {
    setPersonId(newPersonId);
    const personAccs = accounts.filter((a) => a.personId === newPersonId && a.isActive);
    if (personAccs.length > 0) {
      setAccountId(personAccs[0].id);
      setUpiId(personAccs[0].upiId || '');
    } else {
      setAccountId('');
      setUpiId('');
    }
  };

  const handleAccountChange = (newAccountId: string) => {
    setAccountId(newAccountId);
    const acc = accounts.find((a) => a.id === newAccountId);
    if (acc?.upiId) {
      setUpiId(acc.upiId);
    }
  };

  // Selected entities
  const selectedIPO = useMemo(() => ipos.find((i) => i.id === ipoId), [ipos, ipoId]);
  const selectedQuota = useMemo(
    () => selectedIPO?.quotas.find((q) => q.id === quotaId),
    [selectedIPO, quotaId]
  );
  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === accountId),
    [accounts, accountId]
  );
  const selectedPerson = useMemo(
    () => people.find((p) => p.id === personId),
    [people, personId]
  );

  // When IPO changes, update quota selection
  const handleIpoChange = (newIpoId: string) => {
    setIpoId(newIpoId);
    const ipoObj = ipos.find((i) => i.id === newIpoId);
    if (ipoObj && ipoObj.quotas.length > 0) {
      setQuotaId(ipoObj.quotas[0].id);
      setLots(ipoObj.quotas[0].minLots || 1);
    }
  };

  // When quota changes, adjust lots to minLots if necessary
  const handleQuotaChange = (newQuotaId: string) => {
    setQuotaId(newQuotaId);
    const q = selectedIPO?.quotas.find((quota) => quota.id === newQuotaId);
    if (q) {
      if (lots < q.minLots || lots > q.maxLots) {
        setLots(q.minLots);
      }
    }
  };

  // Dynamic calculations
  const lotSize = selectedIPO?.lotSize || 1;
  const shares = lots * lotSize;
  const discount = selectedQuota?.discountPerShare || 0;
  const issuePrice = selectedIPO?.issuePrice || 0;
  const appliedPrice = customPrice !== undefined ? customPrice : Math.max(0, issuePrice - discount);
  const totalAmount = shares * appliedPrice;

  // Real-time validation run
  const validation = useMemo(() => {
    return validateApplicationInput({
      id: initialApplication?.id,
      personId,
      accountId,
      ipoId,
      quotaId,
      lots,
    });
  }, [
    validateApplicationInput,
    initialApplication,
    personId,
    accountId,
    ipoId,
    quotaId,
    lots,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!personId || !accountId || !ipoId || !quotaId) {
      alert('Please fill out all required application fields.');
      return;
    }

    if (lots <= 0) {
      alert('Lot count must be greater than zero.');
      return;
    }

    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    if (validation.isDuplicate && !allowDuplicateOverride) {
      const confirmOverride = confirm(
        'Warning: Duplicate PAN detected for this IPO in Retail/HNI quota. Submitting multiple bids under one PAN will be rejected by the registrar. Proceed anyway?'
      );
      if (!confirmOverride) return;
    }

    if (initialApplication) {
      updateApplication(initialApplication.id, {
        personId,
        accountId,
        ipoId,
        quotaId,
        lots,
        appliedPrice,
        upiId: upiId.trim(),
        status,
        notes: notes.trim(),
      });
    } else {
      addApplication({
        personId,
        accountId,
        ipoId,
        quotaId,
        lots,
        appliedPrice,
        upiId: upiId.trim(),
        status,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>{initialApplication ? 'Edit Application Bid' : 'New IPO Bid Application'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Bind applicant, bank account, UPI ID, quota tier, and compute mandate amount
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Validation Warnings / Alerts */}
          {validation.warnings.length > 0 && (
            <div className="space-y-2">
              {validation.warnings.map((warn, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                    warn.includes('Duplicate')
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                      : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div className="space-y-1">
                    <p>{warn}</p>
                    {warn.includes('Duplicate') && (
                      <label className="flex items-center gap-2 text-[11px] text-rose-300 font-semibold cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={allowDuplicateOverride}
                          onChange={(e) => setAllowDuplicateOverride(e.target.checked)}
                          className="rounded bg-slate-900 border-rose-500 text-rose-500 focus:ring-0"
                        />
                        <span>Confirm and override duplicate PAN warning</span>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 1: Applicant and IPO Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Applicant */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Applicant (Person) *</span>
              </label>
              <select
                value={personId}
                onChange={(e) => handlePersonChange(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {people
                  .filter((p) => p.isActive)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.pan ? `(PAN: ${p.pan})` : ''}
                    </option>
                  ))}
              </select>
            </div>

            {/* Target IPO */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>IPO Offering *</span>
              </label>
              <select
                value={ipoId}
                onChange={(e) => handleIpoChange(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {ipos.map((ipo) => (
                  <option key={ipo.id} value={ipo.id}>
                    {ipo.name} ({ipo.symbol}) — ₹{ipo.issuePrice}/sh
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Account Selection and UPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Bank & Broker Account *</span>
              </label>
              {availableAccountsForPerson.length === 0 ? (
                <div className="text-xs text-rose-400 py-1.5">
                  No active accounts found for this applicant. Please add an account first.
                </div>
              ) : (
                <select
                  value={accountId}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {availableAccountsForPerson.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName} ({acc.brokerName}) — Bal: {formatINR(acc.availableFunds)}
                    </option>
                  ))}
                </select>
              )}
              {selectedAccount && (
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>
                    Stated Balance:{' '}
                    <strong className="text-white font-mono">
                      {formatINR(selectedAccount.availableFunds)}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                UPI ID for Mandate
              </label>
              <input
                type="text"
                placeholder="e.g. rahul@oksbi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Auto-filled from bank account, or provide custom UPI ID
              </span>
            </div>
          </div>

          {/* Section 3: Quota and Lots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-400" />
                <span>Quota Category *</span>
              </label>
              <select
                value={quotaId}
                onChange={(e) => handleQuotaChange(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {selectedIPO?.quotas.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name} ({q.minLots} to {q.maxLots} lots)
                    {q.discountPerShare ? ` [₹${q.discountPerShare} Disc]` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Number of Lots *
                </label>
                {selectedQuota && (
                  <span className="text-[11px] text-slate-400">
                    Allowed: {selectedQuota.minLots} - {selectedQuota.maxLots} lots
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={lots}
                  onChange={(e) => setLots(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
                {/* Preset quick lot buttons */}
                {selectedQuota && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setLots(selectedQuota.minLots)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded"
                      title="Set to minimum quota lots"
                    >
                      Min ({selectedQuota.minLots})
                    </button>
                    {selectedQuota.maxLots !== selectedQuota.minLots && (
                      <button
                        type="button"
                        onClick={() => setLots(selectedQuota.maxLots)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded"
                        title="Set to maximum quota lots"
                      >
                        Max ({selectedQuota.maxLots})
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Real-time Dynamic Financial Calculation Box */}
          <div className="bg-slate-950 rounded-xl p-4 border border-emerald-500/30 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              Live Mandate Calculation
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Total Shares</span>
                <span className="font-mono font-semibold text-white">
                  {lots} × {lotSize} = <strong className="text-emerald-400">{shares} sh</strong>
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Effective Price</span>
                <span className="font-mono font-semibold text-white">
                  ₹{appliedPrice}
                  {discount > 0 && (
                    <span className="text-[10px] text-emerald-400 block">
                      (₹{discount} discount applied)
                    </span>
                  )}
                </span>
              </div>

              <div className="col-span-2 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20 text-right">
                <span className="text-[11px] text-emerald-300 uppercase block font-semibold">
                  Required Application Amount
                </span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {formatINR(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 5: Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Application Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="DRAFT">Draft (Planned)</option>
                <option value="APPLIED">Applied</option>
                <option value="MANDATE_PENDING">Mandate Pending</option>
                <option value="MANDATE_APPROVED">Mandate Approved</option>
                <option value="ALLOTMENT_PENDING">Allotment Pending</option>
                <option value="ALLOTTED">Allotted</option>
                <option value="NOT_ALLOTTED">Not Allotted</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Application Notes / Ref Number
              </label>
              <input
                type="text"
                placeholder="e.g. Approved via Google Pay / Zerodha order ID"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialApplication ? 'Update Bid' : 'Confirm & Save Bid'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
