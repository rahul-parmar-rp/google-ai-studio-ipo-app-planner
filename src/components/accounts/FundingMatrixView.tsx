import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';
import { Account, Application } from '../../types';
import { ApplicationStatusBadge, QuotaBadge } from '../common/StatusBadge';
import {
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  Building,
  CreditCard,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface FundingMatrixViewProps {
  onUpdateBalance: (account: Account) => void;
  onEditApplication: (app: Application) => void;
}

export const FundingMatrixView: React.FC<FundingMatrixViewProps> = ({
  onUpdateBalance,
  onEditApplication,
}) => {
  const {
    fundingSummaries,
    totalRequiredCapital,
    totalAvailableFunds,
    totalDeficit,
    accountsWithDeficitCount,
    ipos,
    people,
  } = useApp();

  const [selectedPersonFilter, setSelectedPersonFilter] = useState<string>('ALL');
  const [onlyDeficitFilter, setOnlyDeficitFilter] = useState<boolean>(false);
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedAccountId((prev) => (prev === id ? null : id));
  };

  const filteredSummaries = fundingSummaries.filter((summary) => {
    if (selectedPersonFilter !== 'ALL' && summary.person.id !== selectedPersonFilter) {
      return false;
    }
    if (onlyDeficitFilter && !summary.isDeficit) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Liquidity Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span>Account Funding & Liquidity Matrix</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated multi-IPO fund demand across individual bank and broker accounts
          </p>
        </div>

        {/* Global summary badge */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="text-slate-400">Total Mandates:</span>
            <span className="font-mono font-bold text-amber-400">
              {formatINR(totalRequiredCapital)}
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="text-slate-400">Available:</span>
            <span className="font-mono font-bold text-white">
              {formatINR(totalAvailableFunds)}
            </span>
          </div>
        </div>
      </div>

      {/* Deficit Alert Banner if any */}
      {accountsWithDeficitCount > 0 && (
        <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-rose-200">
              Immediate Attention Required: {accountsWithDeficitCount} bank account(s) have a total funding deficit of {formatINR(totalDeficit)}.
            </p>
            <p className="text-rose-300/80">
              When IPO mandates are presented for UPI authorization, bank servers check account balances.
              Transfer sufficient capital to each account below before the mandate approval window expires.
            </p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">Filter Applicant:</span>
          </div>
          <select
            value={selectedPersonFilter}
            onChange={(e) => setSelectedPersonFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Applicants ({people.length})</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyDeficitFilter}
            onChange={(e) => setOnlyDeficitFilter(e.target.checked)}
            className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
          />
          <span>Show only accounts with funding deficit</span>
        </label>
      </div>

      {/* Funding Matrix Cards / Detailed Table */}
      <div className="space-y-4">
        {filteredSummaries.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-900 border border-dashed border-slate-800 rounded-xl">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/50 mb-2" />
            <p className="text-sm font-semibold text-slate-200">All filtered accounts are fully funded!</p>
            <p className="text-xs text-slate-500 mt-1">No funding deficits detected for current selection.</p>
          </div>
        ) : (
          filteredSummaries.map(
            ({
              account,
              person,
              requiredFunds,
              availableFunds,
              deficitOrSurplus,
              isDeficit,
              activeApplicationsCount,
              applications: linkedApps,
            }) => {
              const isExpanded = expandedAccountId === account.id;

              return (
                <div
                  key={account.id}
                  className={`border rounded-xl bg-slate-900/90 transition-all ${
                    isDeficit
                      ? 'border-rose-500/40 shadow-lg shadow-rose-950/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Account Summary Row */}
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Account Identity */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-lg shrink-0 ${
                          isDeficit
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {person.name}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {account.bankName}
                          </span>
                          <span className="text-xs text-slate-400">
                            via {account.brokerName}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                          {account.accountNickname && (
                            <span>Nickname: {account.accountNickname}</span>
                          )}
                          {account.upiId && (
                            <span className="font-mono text-emerald-400">
                              UPI: {account.upiId}
                            </span>
                          )}
                          {account.dematNumber && (
                            <span className="font-mono text-slate-500">
                              Demat: {account.dematNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Financial Metrics */}
                    <div className="grid grid-cols-3 gap-3 bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-sans block">
                          Required
                        </span>
                        <span className="font-bold text-slate-200">
                          {formatINR(requiredFunds)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-sans block">
                          Available
                        </span>
                        <span className="font-bold text-white">
                          {formatINR(availableFunds)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-sans block">
                          {isDeficit ? 'Shortfall' : 'Surplus'}
                        </span>
                        <span
                          className={`font-bold ${
                            isDeficit ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {isDeficit
                            ? `-${formatINR(Math.abs(deficitOrSurplus))}`
                            : `+${formatINR(deficitOrSurplus)}`}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions & Expand Button */}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onUpdateBalance(account)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                          isDeficit
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Update Balance</span>
                      </button>

                      <button
                        onClick={() => toggleExpand(account.id)}
                        className="px-2 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition flex items-center gap-1"
                        title="Show/Hide applications tied to this account"
                      >
                        <span className="text-[11px]">
                          {activeApplicationsCount} bid{activeApplicationsCount !== 1 ? 's' : ''}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Bids Drawer */}
                  {isExpanded && (
                    <div className="border-t border-slate-800 bg-slate-950/60 p-4">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Active Applications Blocking Funds on this Account ({linkedApps.length})
                      </h4>

                      {linkedApps.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">
                          No active bids currently requiring funds from this account.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-500">
                                <th className="pb-2 font-medium">App ID</th>
                                <th className="pb-2 font-medium">IPO Offering</th>
                                <th className="pb-2 font-medium">Quota</th>
                                <th className="pb-2 font-medium text-right">Lots</th>
                                <th className="pb-2 font-medium text-right">Mandate Value</th>
                                <th className="pb-2 font-medium">Status</th>
                                <th className="pb-2 font-medium text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40 font-mono">
                              {linkedApps.map((app) => {
                                const ipo = ipos.find((i) => i.id === app.ipoId);
                                const quota = ipo?.quotas.find((q) => q.id === app.quotaId);

                                return (
                                  <tr key={app.id} className="hover:bg-slate-900/60">
                                    <td className="py-2 text-slate-400">
                                      {app.applicationNumber || app.id.slice(-6)}
                                    </td>
                                    <td className="py-2 font-sans font-medium text-white">
                                      {ipo?.symbol} ({ipo?.name})
                                    </td>
                                    <td className="py-2 font-sans">
                                      <QuotaBadge
                                        type={quota?.type || 'OTHER'}
                                        name={quota?.name}
                                      />
                                    </td>
                                    <td className="py-2 text-right text-slate-300">
                                      {app.lots} ({app.shares} sh)
                                    </td>
                                    <td className="py-2 text-right font-bold text-emerald-400">
                                      {formatINR(app.totalAmount)}
                                    </td>
                                    <td className="py-2 font-sans">
                                      <ApplicationStatusBadge status={app.status} />
                                    </td>
                                    <td className="py-2 text-right font-sans">
                                      <button
                                        onClick={() => onEditApplication(app)}
                                        className="text-slate-400 hover:text-white underline text-[11px]"
                                      >
                                        Edit
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
          )
        )}
      </div>
    </div>
  );
};
