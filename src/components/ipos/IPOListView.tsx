import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IPO } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { IPODetailView } from './IPODetailView';
import {
  Building2,
  Calendar,
  PlusCircle,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface IPOListViewProps {
  onNewIPO: () => void;
  onEditIPO: (ipo: IPO) => void;
  onNewApplication: (ipoId: string) => void;
  onEditApplication: (app: any) => void;
  onShareIpoSummary: (ipoId: string) => void;
  onManageAllotment: (app: any) => void;
}

export const IPOListView: React.FC<IPOListViewProps> = ({
  onNewIPO,
  onEditIPO,
  onNewApplication,
  onEditApplication,
  onShareIpoSummary,
  onManageAllotment,
}) => {
  const { ipos, selectedIpoId, setSelectedIpoId, getIpoSummary, deleteIPO } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'UPCOMING' | 'CLOSED'>('ALL');

  // If a specific IPO is selected, render drill-down view!
  if (selectedIpoId) {
    return (
      <IPODetailView
        ipoId={selectedIpoId}
        onBack={() => setSelectedIpoId(null)}
        onNewApplication={onNewApplication}
        onEditApplication={onEditApplication}
        onShareIpoSummary={onShareIpoSummary}
        onManageAllotment={onManageAllotment}
      />
    );
  }

  const filteredIPOs = ipos.filter((ipo) => {
    const matchesSearch =
      ipo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ipo.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ipo.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter !== 'ALL') {
      const summary = getIpoSummary(ipo.id);
      if (summary?.status !== statusFilter) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span>IPO Master Catalog</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage issue details, lot multipliers, price cut-offs, and quota limits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewIPO}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Register New IPO</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search company or ticker symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'OPEN', 'UPCOMING', 'CLOSED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition ${
                statusFilter === filter
                  ? 'bg-slate-800 text-emerald-400 border-slate-700 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800/80 hover:bg-slate-900'
              }`}
            >
              {filter === 'ALL' ? 'All IPOs' : filter.charAt(0) + filter.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of IPO Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIPOs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl">
            <Building2 className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-medium">No IPOs found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting search or add a new security</p>
            <button
              onClick={onNewIPO}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white"
            >
              + Register New IPO
            </button>
          </div>
        ) : (
          filteredIPOs.map((ipo) => {
            const summary = getIpoSummary(ipo.id);
            if (!summary) return null;

            return (
              <div
                key={ipo.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">
                        {ipo.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="font-mono text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          {ipo.symbol}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span>₹{ipo.issuePrice}/sh</span>
                        <span className="text-slate-500">•</span>
                        <span>{ipo.lotSize} sh/lot</span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] px-2 py-0.5 rounded border font-semibold ${
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

                  {/* Summary Block */}
                  <div className="mt-4 bg-slate-950/80 rounded-lg p-3 border border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Bids Placed</span>
                      <span className="text-base font-bold text-white font-mono">
                        {summary.applicationsCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Capital Required</span>
                      <span className="text-base font-bold text-emerald-400 font-mono">
                        {formatINR(summary.totalCapital)}
                      </span>
                    </div>
                  </div>

                  {/* Quota pills preview */}
                  <div className="mt-3">
                    <span className="text-[11px] text-slate-400 block mb-1">Configured Quotas:</span>
                    <div className="flex flex-wrap gap-1">
                      {ipo.quotas.map((q) => (
                        <span
                          key={q.id}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {q.name} ({q.minLots}-{q.maxLots} lots)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
                    <span>Window: {formatDate(ipo.openDate)} - {formatDate(ipo.closeDate)}</span>
                    {ipo.listingDate && (
                      <span className="text-slate-400">List: {formatDate(ipo.listingDate)}</span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditIPO(ipo)}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Edit IPO settings"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove IPO ${ipo.symbol}? Applications must be deleted first.`)) {
                          deleteIPO(ipo.id);
                        }
                      }}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      title="Delete IPO"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNewApplication(ipo.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-500 text-white transition"
                    >
                      + Bid
                    </button>
                    <button
                      onClick={() => setSelectedIpoId(ipo.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition"
                    >
                      <span>Drill Down</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
