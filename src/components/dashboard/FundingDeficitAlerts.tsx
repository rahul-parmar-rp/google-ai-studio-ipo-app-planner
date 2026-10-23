import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';
import { AlertTriangle, ArrowRight, ArrowUpRight, DollarSign } from 'lucide-react';
import { Account } from '../../types';

interface FundingDeficitAlertsProps {
  onUpdateBalance: (account: Account) => void;
}

export const FundingDeficitAlerts: React.FC<FundingDeficitAlertsProps> = ({
  onUpdateBalance,
}) => {
  const { fundingSummaries, setActiveTab } = useApp();

  const deficitAccounts = fundingSummaries.filter(
    (summary) => summary.isDeficit && summary.account.isActive
  );

  if (deficitAccounts.length === 0) return null;

  return (
    <div className="bg-amber-950/30 border border-amber-500/50 rounded-xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-200">
              Funding Shortfall Detected ({deficitAccounts.length} Account
              {deficitAccounts.length > 1 ? 's' : ''})
            </h3>
            <p className="text-xs text-amber-300/80 mt-0.5 max-w-2xl">
              The required funds for pending IPO bids exceed the stated bank balance.
              Transfer additional funds to prevent UPI mandate failure or rejection by banks.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('funding')}
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4"
        >
          <span>View Full Funding Matrix</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {deficitAccounts.map(({ account, person, requiredFunds, availableFunds, deficitOrSurplus }) => {
          const shortfall = Math.abs(deficitOrSurplus);
          return (
            <div
              key={account.id}
              className="bg-slate-900/90 border border-amber-500/30 rounded-lg p-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{person.name}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold">
                    Short: {formatINR(shortfall)}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {account.bankName} ({account.brokerName})
                  {account.accountNickname && ` • ${account.accountNickname}`}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Required:</span>
                  <span className="font-semibold text-slate-200">{formatINR(requiredFunds)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Available:</span>
                  <span className="text-slate-300">{formatINR(availableFunds)}</span>
                </div>
              </div>

              <button
                onClick={() => onUpdateBalance(account)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition"
              >
                <span>Update Available Funds</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
