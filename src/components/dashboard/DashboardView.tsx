import React from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCards } from './MetricCards';
import { FundingDeficitAlerts } from './FundingDeficitAlerts';
import { formatINR, formatDate } from '../../utils/formatters';
import { ApplicationStatusBadge, QuotaBadge } from '../common/StatusBadge';
import { Account, Application, ApplicationStatus } from '../../types';
import {
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  Edit2,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  onNewApplication: (ipoId?: string) => void;
  onNewIPO: () => void;
  onEditApplication: (app: Application) => void;
  onUpdateAccountBalance: (account: Account) => void;
  onManageAllotment: (app: Application) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNewApplication,
  onNewIPO,
  onEditApplication,
  onUpdateAccountBalance,
  onManageAllotment,
}) => {
  const {
    ipos,
    activeIposList,
    applications,
    fundingSummaries,
    getIpoSummary,
    setActiveTab,
    setSelectedIpoId,
    updateApplicationStatus,
    people,
  } = useApp();

  const handleDrillDownIPO = (ipoId: string) => {
    setSelectedIpoId(ipoId);
    setActiveTab('ipos');
  };

  return (
    <div className="space-y-6">
      {/* 1. Control Tower Metrics */}
      <MetricCards />

      {/* 2. Funding Shortfall Alert if any */}
      <FundingDeficitAlerts onUpdateBalance={onUpdateAccountBalance} />

      {/* 3. Active IPOs Summary Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Active IPOs Summary
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ipos')}
              className="text-xs text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1 transition"
            >
              <span>View All ({ipos.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNewIPO}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Add IPO</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {activeIposList.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-lg">
              <Building2 className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm">No active IPOs found.</p>
              <button
                onClick={onNewIPO}
                className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white"
              >
                + Register First IPO
              </button>
            </div>
          ) : (
            activeIposList.map((ipo) => {
              const summary = getIpoSummary(ipo.id);
              if (!summary) return null;

              return (
                <div
                  key={ipo.id}
                  className="group bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* IPO Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {ipo.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <span className="font-mono text-emerald-400 font-semibold">{ipo.symbol}</span>
                          <span>•</span>
                          <span>Lot: {ipo.lotSize} sh</span>
                          <span>•</span>
                          <span>Price: ₹{ipo.issuePrice}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded border font-medium ${
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

                    {/* Stats pills */}
                    <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-900/90 rounded-lg p-2.5 border border-slate-800/60">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Applications</span>
                        <span className="text-base font-bold text-white">
                          {summary.applicationsCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Capital Blocked</span>
                        <span className="text-base font-bold text-emerald-400">
                          {formatINR(summary.totalCapital)}
                        </span>
                      </div>
                    </div>

                    {/* Quota breakdown tag pills */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {ipo.quotas.map((quota) => {
                        const count = summary.bidsByQuota[quota.type] || 0;
                        return (
                          <span
                            key={quota.id}
                            className={`text-[11px] px-2 py-0.5 rounded border ${
                              count > 0
                                ? 'bg-slate-800/90 text-slate-200 border-slate-700'
                                : 'bg-slate-900/40 text-slate-500 border-slate-800/50'
                            }`}
                          >
                            {quota.name}: <strong className="text-white">{count}</strong>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onNewApplication(ipo.id)}
                      className="flex-1 py-1 px-2.5 text-xs font-semibold rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 transition text-center"
                    >
                      + Add Bid
                    </button>
                    <button
                      onClick={() => handleDrillDownIPO(ipo.id)}
                      className="py-1 px-2.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1"
                    >
                      <span>View Apps</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Account Funding Status (PRD 5.1 Core Matrix Table) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Account Funding Status
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Available cash balances vs cumulative active mandate requirements
            </p>
          </div>
          <button
            onClick={() => setActiveTab('funding')}
            className="text-xs text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1"
          >
            <span>Full Funding Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider">
                <th className="pb-2.5 font-semibold">Applicant</th>
                <th className="pb-2.5 font-semibold">Bank</th>
                <th className="pb-2.5 font-semibold">Broker / Demat</th>
                <th className="pb-2.5 font-semibold text-right">Req. Funds</th>
                <th className="pb-2.5 font-semibold text-right">Available</th>
                <th className="pb-2.5 font-semibold text-right">Deficit / Surplus</th>
                <th className="pb-2.5 font-semibold text-center">Status</th>
                <th className="pb-2.5 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {fundingSummaries.map(({ account, person, requiredFunds, availableFunds, deficitOrSurplus, isDeficit, activeApplicationsCount }) => (
                <tr
                  key={account.id}
                  className={`hover:bg-slate-800/30 transition-colors ${
                    isDeficit ? 'bg-amber-950/15' : ''
                  }`}
                >
                  <td className="py-3 font-sans font-medium text-white">
                    {person.name}
                  </td>
                  <td className="py-3 font-sans text-slate-300">
                    {account.bankName}
                  </td>
                  <td className="py-3 font-sans text-slate-300">
                    <span className="text-slate-200">{account.brokerName}</span>
                    {account.accountNickname && (
                      <span className="text-slate-500 text-[11px] block">
                        {account.accountNickname}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right font-medium text-slate-200">
                    {formatINR(requiredFunds)}
                    <span className="text-[10px] text-slate-500 font-sans block">
                      ({activeApplicationsCount} bid{activeApplicationsCount !== 1 ? 's' : ''})
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-200 font-medium">
                    {formatINR(availableFunds)}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`font-semibold ${
                        isDeficit
                          ? 'text-rose-400 font-bold'
                          : deficitOrSurplus === 0
                          ? 'text-slate-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {isDeficit
                        ? `-${formatINR(Math.abs(deficitOrSurplus))}`
                        : `+${formatINR(deficitOrSurplus)}`}
                    </span>
                  </td>
                  <td className="py-3 text-center font-sans">
                    {isDeficit ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        ⚠️ Short
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        ✓ OK
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center font-sans">
                    <button
                      onClick={() => onUpdateAccountBalance(account)}
                      className="px-2 py-1 text-[11px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                      title="Adjust stated bank available funds"
                    >
                      Edit Funds
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Recent Active Applications Quick Flow */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Active Applications Queue
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live lifecycle status, mandate tracking, and fast status updates
            </p>
          </div>
          <button
            onClick={() => setActiveTab('applications')}
            className="text-xs text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1"
          >
            <span>View All ({applications.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider">
                <th className="pb-2.5 font-semibold">App #</th>
                <th className="pb-2.5 font-semibold">Applicant</th>
                <th className="pb-2.5 font-semibold">IPO Security</th>
                <th className="pb-2.5 font-semibold">Account / UPI</th>
                <th className="pb-2.5 font-semibold">Quota</th>
                <th className="pb-2.5 font-semibold text-right">Lots / Sh</th>
                <th className="pb-2.5 font-semibold text-right">Amount</th>
                <th className="pb-2.5 font-semibold">Status</th>
                <th className="pb-2.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {applications.slice(0, 6).map((app) => {
                const person = people.find((p) => p.id === app.personId);
                const ipo = ipos.find((i) => i.id === app.ipoId);
                const quota = ipo?.quotas.find((q) => q.id === app.quotaId);

                return (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-mono font-semibold text-slate-400">
                      {app.applicationNumber || app.id.slice(-6)}
                    </td>
                    <td className="py-2.5 font-medium text-white">
                      {person?.name || 'Unknown'}
                    </td>
                    <td className="py-2.5">
                      <div className="font-semibold text-slate-200">
                        {ipo?.symbol || 'IPO'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                        {ipo?.name}
                      </div>
                    </td>
                    <td className="py-2.5">
                      <div className="text-slate-300 font-mono text-[11px]">
                        {app.upiId || '—'}
                      </div>
                    </td>
                    <td className="py-2.5">
                      <QuotaBadge type={quota?.type || 'OTHER'} name={quota?.name} />
                    </td>
                    <td className="py-2.5 text-right font-mono">
                      <span className="font-semibold text-slate-200">{app.lots} Lot</span>
                      <span className="text-[10px] text-slate-500 block">
                        ({app.shares} sh)
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-emerald-400">
                      {formatINR(app.totalAmount)}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <ApplicationStatusBadge status={app.status} />
                        {/* Quick Status advance dropdown */}
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
                          title="Advance or change status"
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
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onEditApplication(app)}
                        className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                        title="Edit Application"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
