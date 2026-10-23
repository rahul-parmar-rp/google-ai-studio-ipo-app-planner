import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';
import {
  TrendingUp,
  FileSpreadsheet,
  Coins,
  ShieldAlert,
  CheckCircle2,
  PieChart,
} from 'lucide-react';

export const MetricCards: React.FC = () => {
  const {
    activeIposList,
    applications,
    totalRequiredCapital,
    totalAvailableFunds,
    totalDeficit,
    accountsWithDeficitCount,
    ipos,
  } = useApp();

  const activeApps = applications.filter((a) => a.status !== 'CANCELLED');
  const surplusOrDeficit = totalAvailableFunds - totalRequiredCapital;
  const isNetDeficit = surplusOrDeficit < 0;

  // Breakdown of bids by type
  let shniCount = 0;
  let bhniCount = 0;
  let retailCount = 0;
  let shareholderCount = 0;

  activeApps.forEach((app) => {
    const ipo = ipos.find((i) => i.id === app.ipoId);
    const quota = ipo?.quotas.find((q) => q.id === app.quotaId);
    if (quota?.type === 'SHNI') shniCount++;
    else if (quota?.type === 'BHNI') bhniCount++;
    else if (quota?.type === 'RETAIL') retailCount++;
    else if (quota?.type === 'SHAREHOLDER') shareholderCount++;
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {/* Metric 1: Active IPOs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Active IPOs</span>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-white">{activeIposList.length}</div>
          <p className="text-xs text-slate-400 mt-0.5">
            {ipos.length} total offerings registered
          </p>
        </div>
      </div>

      {/* Metric 2: Total Applications */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Total Applications</span>
          <FileSpreadsheet className="w-4 h-4 text-blue-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-white">{activeApps.length}</div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span className="text-sky-300">{retailCount} Retail</span>
            <span>•</span>
            <span className="text-indigo-300">{shniCount + bhniCount} HNI</span>
            {shareholderCount > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-300">{shareholderCount} Shareholder</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metric 3: Required Capital */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Required Capital</span>
          <Coins className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-white">{formatINR(totalRequiredCapital)}</div>
          <p className="text-xs text-slate-400 mt-0.5">
            Active UPI mandate commitments
          </p>
        </div>
      </div>

      {/* Metric 4: Liquidity / Surplus / Shortfall */}
      <div
        className={`rounded-xl p-4 flex flex-col justify-between border ${
          accountsWithDeficitCount > 0
            ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
            : 'bg-slate-900/80 border-slate-800 text-slate-200'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Available Cash</span>
          {accountsWithDeficitCount > 0 ? (
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-white">{formatINR(totalAvailableFunds)}</div>
          <div className="mt-0.5 text-xs">
            {accountsWithDeficitCount > 0 ? (
              <span className="text-amber-400 font-medium">
                ⚠️ {accountsWithDeficitCount} bank account short (₹{totalDeficit.toLocaleString('en-IN')})
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">
                Surplus: +{formatINR(surplusOrDeficit)} [✓ Funded]
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
