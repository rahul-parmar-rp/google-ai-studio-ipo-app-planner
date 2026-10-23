import React, { useState, useEffect } from 'react';
import { IPO, QuotaConfig, QuotaType } from '../../types';
import { X, Plus, Trash2, HelpCircle } from 'lucide-react';

interface IPOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ipoData: Omit<IPO, 'id'>) => void;
  initialIpo?: IPO | null;
}

export const IPOModal: React.FC<IPOModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialIpo,
}) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [openDate, setOpenDate] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [listingDate, setListingDate] = useState('');
  const [priceBandMin, setPriceBandMin] = useState<number>(100);
  const [priceBandMax, setPriceBandMax] = useState<number>(100);
  const [issuePrice, setIssuePrice] = useState<number>(100);
  const [lotSize, setLotSize] = useState<number>(40);
  const [isActive, setIsActive] = useState(true);
  const [quotas, setQuotas] = useState<QuotaConfig[]>([]);

  useEffect(() => {
    if (initialIpo) {
      setName(initialIpo.name);
      setCompanyName(initialIpo.companyName);
      setSymbol(initialIpo.symbol);
      setOpenDate(initialIpo.openDate);
      setCloseDate(initialIpo.closeDate);
      setListingDate(initialIpo.listingDate || '');
      setPriceBandMin(initialIpo.priceBandMin);
      setPriceBandMax(initialIpo.priceBandMax);
      setIssuePrice(initialIpo.issuePrice);
      setLotSize(initialIpo.lotSize);
      setIsActive(initialIpo.isActive);
      setQuotas(initialIpo.quotas);
    } else {
      // Default new IPO
      const today = new Date().toISOString().split('T')[0];
      const close = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setName('');
      setCompanyName('');
      setSymbol('');
      setOpenDate(today);
      setCloseDate(close);
      setListingDate('');
      setPriceBandMin(100);
      setPriceBandMax(100);
      setIssuePrice(100);
      setLotSize(50);
      setIsActive(true);
      setQuotas([
        {
          id: `q-temp-1`,
          ipoId: '',
          name: 'Small / Retail',
          type: 'RETAIL',
          minLots: 1,
          maxLots: 13,
        },
        {
          id: `q-temp-2`,
          ipoId: '',
          name: 'Small HNI (sHNI)',
          type: 'SHNI',
          minLots: 14,
          maxLots: 66,
        },
        {
          id: `q-temp-3`,
          ipoId: '',
          name: 'Big HNI (bHNI)',
          type: 'BHNI',
          minLots: 67,
          maxLots: 200,
        },
        {
          id: `q-temp-4`,
          ipoId: '',
          name: 'Shareholder',
          type: 'SHAREHOLDER',
          minLots: 1,
          maxLots: 13,
        },
      ]);
    }
  }, [initialIpo, isOpen]);

  // Auto-calculate recommended quota bounds when issuePrice or lotSize changes
  const applyRecommendedQuotas = () => {
    if (issuePrice <= 0 || lotSize <= 0) return;
    const lotAmount = issuePrice * lotSize;
    // Retail: up to ₹2,00,000
    const maxRetailLots = Math.max(1, Math.floor(200000 / lotAmount));
    // sHNI: min > ₹2,00,000, max <= ₹10,00,000
    const minShniLots = maxRetailLots + 1;
    const maxShniLots = Math.max(minShniLots, Math.floor(1000000 / lotAmount));
    // bHNI: min > ₹10,00,000
    const minBhniLots = maxShniLots + 1;

    setQuotas([
      {
        id: `q-temp-retail`,
        ipoId: initialIpo?.id || '',
        name: 'Small / Retail',
        type: 'RETAIL',
        minLots: 1,
        maxLots: maxRetailLots,
      },
      {
        id: `q-temp-shni`,
        ipoId: initialIpo?.id || '',
        name: 'Small HNI (sHNI)',
        type: 'SHNI',
        minLots: minShniLots,
        maxLots: maxShniLots,
      },
      {
        id: `q-temp-bhni`,
        ipoId: initialIpo?.id || '',
        name: 'Big HNI (bHNI)',
        type: 'BHNI',
        minLots: minBhniLots,
        maxLots: minBhniLots * 3,
      },
      {
        id: `q-temp-shareholder`,
        ipoId: initialIpo?.id || '',
        name: 'Shareholder',
        type: 'SHAREHOLDER',
        minLots: 1,
        maxLots: maxRetailLots,
      },
      {
        id: `q-temp-employee`,
        ipoId: initialIpo?.id || '',
        name: 'Employee',
        type: 'EMPLOYEE',
        minLots: 1,
        maxLots: maxRetailLots,
        discountPerShare: 0,
      },
    ]);
  };

  const addQuotaRow = () => {
    setQuotas((prev) => [
      ...prev,
      {
        id: `q-custom-${Date.now()}`,
        ipoId: initialIpo?.id || '',
        name: 'Custom Quota',
        type: 'OTHER',
        minLots: 1,
        maxLots: 10,
      },
    ]);
  };

  const removeQuotaRow = (idx: number) => {
    setQuotas((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuota = (idx: number, updates: Partial<QuotaConfig>) => {
    setQuotas((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...updates } : q))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !symbol.trim()) {
      alert('Please provide IPO Name and Trading Symbol');
      return;
    }
    if (quotas.length === 0) {
      alert('At least one quota tier must be configured');
      return;
    }

    onSave({
      name: name.trim(),
      companyName: companyName.trim() || name.trim(),
      symbol: symbol.trim().toUpperCase(),
      openDate,
      closeDate,
      listingDate: listingDate || undefined,
      priceBandMin: Number(priceBandMin) || 0,
      priceBandMax: Number(priceBandMax) || 0,
      issuePrice: Number(issuePrice) || Number(priceBandMax) || 0,
      lotSize: Number(lotSize) || 1,
      isActive,
      quotas,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div>
            <h2 className="text-base font-bold text-white">
              {initialIpo ? 'Edit IPO Offering' : 'Register New IPO Offering'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure security pricing, lot sizes, dates, and quota threshold tiers
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Security Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                IPO Display Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lumino Industries Ltd."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                NSE/BSE Symbol *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. LUMINO"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Full Company Name
              </label>
              <input
                type="text"
                placeholder="e.g. Lumino Industries Limited"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 2: Pricing & Lot Size */}
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Pricing & Lot Sizing
              </span>
              <button
                type="button"
                onClick={applyRecommendedQuotas}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium"
              >
                Auto-calculate SEBI Quotas
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Min Price (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={priceBandMin}
                  onChange={(e) => setPriceBandMin(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Max Price (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={priceBandMax}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setPriceBandMax(val);
                    if (!initialIpo) setIssuePrice(val);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Issue / Cut-off (₹) *</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={issuePrice}
                  onChange={(e) => setIssuePrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-emerald-500/60 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Lot Size (Shares) *</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={lotSize}
                  onChange={(e) => setLotSize(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-1">
              1 Lot = <strong className="text-white">{lotSize} shares</strong> @ ₹{issuePrice} ={' '}
              <strong className="text-emerald-400 font-mono">
                ₹{(lotSize * issuePrice).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          {/* Section 3: Subscription & Listing Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Open Date *
              </label>
              <input
                type="date"
                required
                value={openDate}
                onChange={(e) => setOpenDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Close Date *
              </label>
              <input
                type="date"
                required
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Listing Date
              </label>
              <input
                type="date"
                value={listingDate}
                onChange={(e) => setListingDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Section 4: Quota Configurations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Quota Categories & Lot Limits
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Define lot thresholds (Retail, sHNI, bHNI, Shareholder, Employee)
                </span>
              </div>
              <button
                type="button"
                onClick={addQuotaRow}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Quota</span>
              </button>
            </div>

            <div className="space-y-2">
              {quotas.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 grid grid-cols-12 gap-2 items-center text-xs"
                >
                  <div className="col-span-4 sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Category Name"
                      value={q.name}
                      onChange={(e) => updateQuota(idx, { name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-3">
                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateQuota(idx, { type: e.target.value as QuotaType })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                    >
                      <option value="RETAIL">Retail (&lt; ₹2L)</option>
                      <option value="SHNI">sHNI (₹2L - ₹10L)</option>
                      <option value="BHNI">bHNI (&gt; ₹10L)</option>
                      <option value="SHAREHOLDER">Shareholder</option>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Min"
                      title="Minimum Lots"
                      value={q.minLots}
                      onChange={(e) =>
                        updateQuota(idx, { minLots: parseInt(e.target.value, 10) || 1 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Max"
                      title="Maximum Lots"
                      value={q.maxLots}
                      onChange={(e) =>
                        updateQuota(idx, { maxLots: parseInt(e.target.value, 10) || 1 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">
                    {q.type === 'EMPLOYEE' && (
                      <input
                        type="number"
                        min="0"
                        placeholder="Disc ₹"
                        title="Discount per share"
                        value={q.discountPerShare || ''}
                        onChange={(e) =>
                          updateQuota(idx, {
                            discountPerShare: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-emerald-400 font-mono text-xs"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeQuotaRow(idx)}
                      disabled={quotas.length === 1}
                      className="text-slate-500 hover:text-rose-400 p-1 disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active status checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="ipo-active-toggle"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <label htmlFor="ipo-active-toggle" className="text-xs text-slate-300">
              Active IPO offering (visible on dashboard and available for new applications)
            </label>
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
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
            >
              {initialIpo ? 'Update Offering' : 'Create IPO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
