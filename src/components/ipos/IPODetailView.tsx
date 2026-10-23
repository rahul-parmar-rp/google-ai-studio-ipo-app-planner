import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, ApplicationStatus, QuotaType } from '../../types';
import { formatINR, formatDate, formatQuotaLabel } from '../../utils/formatters';
import { ApplicationStatusBadge, QuotaBadge } from '../common/StatusBadge';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Layers,
  PlusCircle,
  Share2,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Coins,
  ChevronRight,
} from 'lucide-react';

interface IPODetailViewProps {
  ipoId: string;
  onBack: () => void;
  onNewApplication: (ipoId: string) => void;
  onEditApplication: (app: Application) => void;
  onShareIpoSummary: (ipoId: string) => void;
  onManageAllotment: (app: Application) => void;
}

export const IPODetailView: React.FC<IPODetailViewProps> = ({
  ipoId,
  onBack,
  onNewApplication,
  onEditApplication,
  onShareIpoSummary,
  onManageAllotment,
}) => {
  const {
    ipos,
    applications,
    people,
    accounts,
    getIpoSummary,
    updateApplicationStatus,
    deleteApplication,
  } = useApp();

  const [selectedQuotaFilter, setSelectedQuotaFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  const ipo = ipos.find((i) => i.id === ipoId);
  const summary = getIpoSummary(ipoId);

  if (!ipo || !summary) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>IPO not found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded text-xs"
        >
          Back to List
        </button>
      </div>
    );
  }

  const ipoApplications = applications.filter((app) => app.ipoId === ipo.id);

  const filteredApplications = ipoApplications.filter((app) => {
    if (selectedQuotaFilter !== 'ALL') {
      const q = ipo.quotas.find((quota) => quota.id === app.quotaId);
      if (q?.type !== selectedQuotaFilter) return false;
    }
    if (selectedStatusFilter !== 'ALL' && app.status !== selectedStatusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All IPOs</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onShareIpoSummary(ipo.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Share {ipo.symbol} Summary</span>
          </button>

          <button
            onClick={() => onNewApplication(ipo.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Bid</span>
          </button>
        </div>
      </div>

      {/* Main IPO Header Showcase */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">{ipo.name}</h1>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {ipo.symbol}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{ipo.companyName}</p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${
                summary.status === 'OPEN'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : summary.status === 'UPCOMING'
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {summary.daysLeftText}
            </span>
          </div>
        </div>

        {/* Security parameters grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800/60 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Price Band</span>
            <span className="font-mono font-semibold text-white">
              ₹{ipo.priceBandMin} - ₹{ipo.priceBandMax}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Issue / Bid Price</span>
            <span className="font-mono font-bold text-emerald-400">
              ₹{ipo.issuePrice} / share
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Lot Size</span>
            <span className="font-mono font-semibold text-white">
              {ipo.lotSize} shares (₹{(ipo.lotSize * ipo.issuePrice).toLocaleString('en-IN')}/lot)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Subscription Window</span>
            <span className="text-slate-200">
              {formatDate(ipo.openDate)} - {formatDate(ipo.closeDate)}
            </span>
          </div>
        </div>

        {/* Quota Breakdown Pills (PRD 5.2) */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Applications by Category Quota:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedQuotaFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                selectedQuotaFilter === 'ALL'
                  ? 'bg-slate-700 text-white border-slate-600 font-bold'
                  : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              All Bids ({ipoApplications.length})
            </button>

            {ipo.quotas.map((quota) => {
              const count = summary.bidsByQuota[quota.type] || 0;
              const isSelected = selectedQuotaFilter === quota.type;
              return (
                <button
                  key={quota.id}
                  onClick={() => setSelectedQuotaFilter(quota.type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600/30 text-blue-200 border-blue-500 font-bold'
                      : 'bg-slate-950/50 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>{quota.name}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-white font-mono text-[10px]">
                    {count}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ({quota.minLots}-{quota.maxLots} lots)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Applications Table for this IPO */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Applications for {ipo.symbol} ({filteredApplications.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Total Capital: <strong className="text-emerald-400 font-mono">{formatINR(summary.totalCapital)}</strong>
            </p>
          </div>

          {/* Status filter dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
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
        </div>

        {filteredApplications.length === 0 ? (
          <div className="py-10 text-center text-slate-400 border border-dashed border-slate-800 rounded-lg">
            <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm">No applications found matching the selected filters.</p>
            <button
              onClick={() => onNewApplication(ipo.id)}
              className="mt-3 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
            >
              + Submit Bid for {ipo.symbol}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider">
                  <th className="pb-2.5 font-semibold">App ID</th>
                  <th className="pb-2.5 font-semibold">Applicant</th>
                  <th className="pb-2.5 font-semibold">Bank / Broker</th>
                  <th className="pb-2.5 font-semibold">UPI ID</th>
                  <th className="pb-2.5 font-semibold">Quota</th>
                  <th className="pb-2.5 font-semibold text-right">Lots</th>
                  <th className="pb-2.5 font-semibold text-right">Shares</th>
                  <th className="pb-2.5 font-semibold text-right">Amount</th>
                  <th className="pb-2.5 font-semibold">Status</th>
                  <th className="pb-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredApplications.map((app) => {
                  const person = people.find((p) => p.id === app.personId);
                  const account = accounts.find((a) => a.id === app.accountId);
                  const quota = ipo.quotas.find((q) => q.id === app.quotaId);

                  return (
                    <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-400">
                        {app.applicationNumber || app.id.slice(-6)}
                      </td>
                      <td className="py-3 font-semibold text-white">
                        {person?.name || 'Unknown'}
                        {person?.pan && (
                          <span className="text-[10px] text-slate-500 font-mono block">
                            PAN: {person.pan}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="text-slate-200 font-medium">
                          {account?.bankName || '—'}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {account?.brokerName || '—'}
                        </div>
                      </td>
                      <td className="py-3 font-mono text-slate-300 text-[11px]">
                        {app.upiId || account?.upiId || '—'}
                      </td>
                      <td className="py-3">
                        <QuotaBadge type={quota?.type || 'OTHER'} name={quota?.name} />
                      </td>
                      <td className="py-3 text-right font-mono font-semibold text-slate-200">
                        {app.lots}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-400">
                        {app.shares}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-400">
                        {formatINR(app.totalAmount)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <ApplicationStatusBadge status={app.status} />
                          <select
                            value={app.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as ApplicationStatus;
                              if (newStatus === 'ALLOTTED' || newStatus === 'NOT_ALLOTTED') {
                                onManageAllotment({ ...app, status: newStatus });
                              } else {
                                updateApplicationStatus(app.id, newStatus);
                              }
                            }}
                            className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 rounded px-1 py-0.5 cursor-pointer focus:outline-none"
                          >
                            <option value="DRAFT">Draft</option>
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
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditApplication(app)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Edit Bid"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete application ${app.applicationNumber}?`)) {
                                deleteApplication(app.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
