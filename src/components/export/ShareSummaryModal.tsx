import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatStatusLabel } from '../../utils/formatters';
import { X, Copy, Check, FileSpreadsheet, Share2 } from 'lucide-react';

interface ShareSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedIpoId?: string | null;
}

export const ShareSummaryModal: React.FC<ShareSummaryModalProps> = ({
  isOpen,
  onClose,
  preselectedIpoId,
}) => {
  const { ipos, applications, people, accounts, showToast } = useApp();
  const [selectedIpoId, setSelectedIpoId] = useState<string>(preselectedIpoId || 'ALL');
  const [copied, setCopied] = useState<boolean>(false);

  const targetIpo = useMemo(() => {
    if (selectedIpoId === 'ALL') return null;
    return ipos.find((i) => i.id === selectedIpoId) || null;
  }, [ipos, selectedIpoId]);

  const targetApplications = useMemo(() => {
    let list = applications.filter((a) => a.status !== 'CANCELLED');
    if (selectedIpoId !== 'ALL') {
      list = list.filter((a) => a.ipoId === selectedIpoId);
    }
    return list;
  }, [applications, selectedIpoId]);

  // Generate WhatsApp / Teams Text
  const shareText = useMemo(() => {
    const title = targetIpo
      ? `📋 IPO Application Summary: ${targetIpo.name}`
      : `📋 Multi-IPO Family Bidding Master Summary`;

    const lines: string[] = [title, '---------------------------------------------'];

    targetApplications.forEach((app, index) => {
      const person = people.find((p) => p.id === app.personId)?.name || 'Unknown';
      const account = accounts.find((a) => a.id === app.accountId);
      const ipo = ipos.find((i) => i.id === app.ipoId);
      const quota = ipo?.quotas.find((q) => q.id === app.quotaId)?.name || 'Quota';

      const bankInfo = account ? `${account.bankName} (${account.brokerName})` : 'Bank';
      const statusText = formatStatusLabel(app.status);
      const ipoPrefix = selectedIpoId === 'ALL' ? `[${ipo?.symbol || 'IPO'}] ` : '';

      lines.push(
        `${index + 1}. ${person} | ${bankInfo} | ${ipoPrefix}${quota} (${app.lots} Lot${
          app.lots > 1 ? 's' : ''
        }) | ${formatINR(app.totalAmount)} [${statusText}]`
      );
    });

    lines.push('---------------------------------------------');
    const totalCapital = targetApplications.reduce((sum, a) => sum + (a.totalAmount || 0), 0);
    lines.push(`Total Applications: ${targetApplications.length}`);
    lines.push(`Total Capital Blocked: ${formatINR(totalCapital)}`);

    return lines.join('\n');
  }, [targetIpo, selectedIpoId, targetApplications, people, accounts, ipos]);

  // Export CSV Function
  const exportCSV = () => {
    const headers = [
      'ApplicationId',
      'Person',
      'Bank',
      'Broker',
      'UPI_ID',
      'IPO',
      'Quota',
      'Lots',
      'Shares',
      'Amount',
      'Status',
    ];

    const rows = targetApplications.map((app) => {
      const person = people.find((p) => p.id === app.personId)?.name || 'Unknown';
      const account = accounts.find((a) => a.id === app.accountId);
      const ipo = ipos.find((i) => i.id === app.ipoId);
      const quota = ipo?.quotas.find((q) => q.id === app.quotaId)?.name || 'Quota';

      return [
        `"${app.applicationNumber || app.id}"`,
        `"${person}"`,
        `"${account?.bankName || ''}"`,
        `"${account?.brokerName || ''}"`,
        `"${app.upiId || account?.upiId || ''}"`,
        `"${ipo?.symbol || ipo?.name || ''}"`,
        `"${quota}"`,
        app.lots,
        app.shares,
        app.totalAmount,
        `"${app.status}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const namePrefix = targetIpo ? targetIpo.symbol.toLowerCase() : 'all-ipos';
    link.download = `ipo-applications-${namePrefix}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV export downloaded successfully', 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    showToast('Summary copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              Quick-Share Summary & CSV Export
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Target Filter */}
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-semibold text-slate-300">
              Filter by IPO Security:
            </label>
            <select
              value={selectedIpoId}
              onChange={(e) => setSelectedIpoId(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Active IPOs ({targetApplications.length} bids)</option>
              {ipos.map((ipo) => (
                <option key={ipo.id} value={ipo.id}>
                  {ipo.name} ({ipo.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Formatted Text Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400">
                WhatsApp / Teams Ready Format:
              </span>
              <span className="text-[11px] text-slate-500">
                {targetApplications.length} entries
              </span>
            </div>
            <textarea
              readOnly
              value={shareText}
              rows={9}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-300 focus:outline-none select-all"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={exportCSV}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={handleCopy}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text Summary</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
