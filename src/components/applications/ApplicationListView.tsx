import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, ApplicationStatus, QuotaType } from '../../types';
import { formatINR, formatDate, formatStatusLabel } from '../../utils/formatters';
import { ApplicationStatusBadge, QuotaBadge } from '../common/StatusBadge';
import {
  Layers,
  Search,
  Filter,
  PlusCircle,
  Download,
  Share2,
  Copy,
  Edit2,
  Trash2,
  Award,
  ArrowUpDown,
  Coins,
} from 'lucide-react';

interface ApplicationListViewProps {
  onNewApplication: () => void;
  onEditApplication: (app: Application) => void;
  onManageAllotment: (app: Application) => void;
  onOpenShareModal: () => void;
}

export const ApplicationListView: React.FC<ApplicationListViewProps> = ({
  onNewApplication,
  onEditApplication,
  onManageAllotment,
  onOpenShareModal,
}) => {
  const {
    applications,
    people,
    accounts,
    ipos,
    updateApplicationStatus,
    deleteApplication,
    duplicateApplication,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPerson, setSelectedPerson] = useState<string>('ALL');
  const [selectedIpo, setSelectedIpo] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedQuotaType, setSelectedQuotaType] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'appNumber' | 'amount' | 'applicant' | 'ipo'>('appNumber');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const person = people.find((p) => p.id === app.personId);
      const account = accounts.find((a) => a.id === app.accountId);
      const ipo = ipos.find((i) => i.id === app.ipoId);
      const quota = ipo?.quotas.find((q) => q.id === app.quotaId);

      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matches =
          (app.applicationNumber || '').toLowerCase().includes(query) ||
          (person?.name || '').toLowerCase().includes(query) ||
          (person?.pan || '').toLowerCase().includes(query) ||
          (ipo?.symbol || '').toLowerCase().includes(query) ||
          (ipo?.name || '').toLowerCase().includes(query) ||
          (account?.bankName || '').toLowerCase().includes(query) ||
          (account?.brokerName || '').toLowerCase().includes(query) ||
          (app.upiId || '').toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (selectedPerson !== 'ALL' && app.personId !== selectedPerson) return false;
      if (selectedIpo !== 'ALL' && app.ipoId !== selectedIpo) return false;
      if (selectedStatus !== 'ALL' && app.status !== selectedStatusFilterNormalized(selectedStatus))
        return false;
      if (selectedQuotaType !== 'ALL' && quota?.type !== selectedQuotaType) return false;

      return true;
    });
  }, [
    applications,
    people,
    accounts,
    ipos,
    searchTerm,
    selectedPerson,
    selectedIpo,
    selectedStatus,
    selectedQuotaType,
  ]);

  function selectedStatusFilterNormalized(status: string) {
    return status;
  }

  // Sorted list
  const sortedApps = useMemo(() => {
    return [...filteredApps].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'amount') {
        comparison = (a.totalAmount || 0) - (b.totalAmount || 0);
      } else if (sortField === 'applicant') {
        const nameA = people.find((p) => p.id === a.personId)?.name || '';
        const nameB = people.find((p) => p.id === b.personId)?.name || '';
        comparison = nameA.localeCompare(nameB);
      } else if (sortField === 'ipo') {
        const symbolA = ipos.find((i) => i.id === a.ipoId)?.symbol || '';
        const symbolB = ipos.find((i) => i.id === b.ipoId)?.symbol || '';
        comparison = symbolA.localeCompare(symbolB);
      } else {
        comparison = (a.applicationNumber || a.id).localeCompare(b.applicationNumber || b.id);
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredApps, sortField, sortAsc, people, ipos]);

  const toggleSort = (field: 'appNumber' | 'amount' | 'applicant' | 'ipo') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const totalCapitalFiltered = filteredApps.reduce((sum, a) => sum + (a.totalAmount || 0), 0);
  const allottedCount = filteredApps.filter((a) => a.status === 'ALLOTTED').length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Applications Master Register</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full tabular list of all applications across all family members and broker entities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export / Share</span>
          </button>

          <button
            onClick={onNewApplication}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Bid</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-400">Total Filtered:</span>
            <span className="font-bold text-white ml-1.5">{filteredApps.length} bids</span>
          </div>
          <div className="hidden sm:block text-slate-700">•</div>
          <div>
            <span className="text-slate-400">Total Capital:</span>
            <span className="font-mono font-bold text-emerald-400 ml-1.5">
              {formatINR(totalCapitalFiltered)}
            </span>
          </div>
          {allottedCount > 0 && (
            <>
              <div className="hidden sm:block text-slate-700">•</div>
              <div>
                <span className="text-slate-400">Allotted:</span>
                <span className="font-bold text-emerald-300 ml-1.5">{allottedCount} bids</span>
              </div>
            </>
          )}
        </div>

        <div className="text-[11px] text-slate-500">
          Click column headers to sort bids
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID, applicant, symbol, UPI, bank..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Person Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Applicants ({people.length})</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* IPO Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedIpo}
              onChange={(e) => setSelectedIpo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All IPO Securities</option>
              {ipos.map((ipo) => (
                <option key={ipo.id} value={ipo.id}>
                  {ipo.symbol} ({ipo.name})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
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
      </div>

      {/* Applications Master Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {sortedApps.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Layers className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold">No applications found.</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing filters or create a new bid application.</p>
            <button
              onClick={onNewApplication}
              className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white"
            >
              + Create Application
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th
                    onClick={() => toggleSort('appNumber')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      <span>App ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('applicant')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      <span>Applicant</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('ipo')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      <span>IPO</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Bank & Broker</th>
                  <th className="py-3 px-3">UPI ID</th>
                  <th className="py-3 px-3">Quota</th>
                  <th className="py-3 px-3 text-right">Lots</th>
                  <th
                    onClick={() => toggleSort('amount')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Total Amount</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {sortedApps.map((app) => {
                  const person = people.find((p) => p.id === app.personId);
                  const account = accounts.find((a) => a.id === app.accountId);
                  const ipo = ipos.find((i) => i.id === app.ipoId);
                  const quota = ipo?.quotas.find((q) => q.id === app.quotaId);

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-300">
                        {app.applicationNumber || app.id.slice(-6)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        <div>{person?.name || 'Unknown'}</div>
                        {person?.pan && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            {person.pan}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-white font-mono">
                          {ipo?.symbol || 'IPO'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                          {ipo?.name}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-200">{account?.bankName || '—'}</div>
                        <div className="text-[11px] text-slate-500">{account?.brokerName}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {app.upiId || account?.upiId || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <QuotaBadge type={quota?.type || 'OTHER'} name={quota?.name} />
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        <span className="font-semibold text-white">{app.lots} Lot</span>
                        <span className="text-[10px] text-slate-500 block">
                          ({app.shares} sh)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        {formatINR(app.totalAmount)}
                      </td>
                      <td className="py-3 px-3">
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
                            className="text-[10px] bg-slate-950 text-slate-300 border border-slate-700 rounded px-1 py-0.5 cursor-pointer focus:outline-none"
                            title="Update status"
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
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onManageAllotment(app)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-300 hover:bg-slate-800"
                            title="Record Allotment"
                          >
                            <Award className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => duplicateApplication(app.id)}
                            className="p-1 rounded text-slate-400 hover:text-blue-300 hover:bg-slate-800"
                            title="Duplicate Bid"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditApplication(app)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Edit"
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
