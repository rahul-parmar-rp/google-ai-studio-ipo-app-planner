import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Person, Account } from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  Users,
  CreditCard,
  PlusCircle,
  Edit2,
  Trash2,
  Wallet,
  Building,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

interface PeopleAccountsViewProps {
  onNewPerson: () => void;
  onEditPerson: (person: Person) => void;
  onNewAccount: (defaultPersonId?: string) => void;
  onEditAccount: (account: Account) => void;
  onUpdateAccountBalance: (account: Account) => void;
}

export const PeopleAccountsView: React.FC<PeopleAccountsViewProps> = ({
  onNewPerson,
  onEditPerson,
  onNewAccount,
  onEditAccount,
  onUpdateAccountBalance,
}) => {
  const { people, accounts, applications, deletePerson, deleteAccount } = useApp();
  const [selectedPersonId, setSelectedPersonId] = useState<string>('ALL');

  const filteredPeople =
    selectedPersonId === 'ALL'
      ? people
      : people.filter((p) => p.id === selectedPersonId);

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Applicants & Account Configuration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage individual PAN identities, funding bank accounts, broker demat linkages, and UPI IDs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNewAccount()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            <span>+ Link Bank/Broker</span>
          </button>

          <button
            onClick={onNewPerson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Applicant</span>
          </button>
        </div>
      </div>

      {/* People and Accounts Grid */}
      <div className="space-y-5">
        {filteredPeople.map((person) => {
          const personAccounts = accounts.filter((a) => a.personId === person.id);
          const totalAvailableForPerson = personAccounts.reduce(
            (sum, a) => sum + (a.availableFunds || 0),
            0
          );
          const personApps = applications.filter(
            (a) => a.personId === person.id && a.status !== 'CANCELLED'
          );

          return (
            <div
              key={person.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
            >
              {/* Applicant Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-emerald-400">
                    {person.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{person.name}</h3>
                      {person.pan && (
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          PAN: {person.pan}
                        </span>
                      )}
                      {!person.isActive && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-500">
                          Inactive
                        </span>
                      )}
                    </div>
                    {person.notes && (
                      <p className="text-xs text-slate-400 mt-0.5">{person.notes}</p>
                    )}
                  </div>
                </div>

                {/* Right totals & edit buttons */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Total Liquid Cash</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      {formatINR(totalAvailableForPerson)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
                    <button
                      onClick={() => onNewAccount(person.id)}
                      className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                      title="Add Bank/Broker account for this person"
                    >
                      + Add Account
                    </button>
                    <button
                      onClick={() => onEditPerson(person)}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit Applicant"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove applicant ${person.name}? Associated accounts without active bids will also be removed.`)) {
                          deletePerson(person.id);
                        }
                      }}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete Applicant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mapped Accounts Subgrid */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Linked Bank & Broker Mappings ({personAccounts.length}):</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {personApps.length} active application{personApps.length !== 1 ? 's' : ''} placed
                  </span>
                </div>

                {personAccounts.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 bg-slate-950/50 border border-dashed border-slate-800/80 rounded-lg text-xs">
                    No bank accounts linked yet. Click "+ Add Account" to configure bank & broker mappings.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {personAccounts.map((account) => {
                      const accountBids = applications.filter(
                        (a) => a.accountId === account.id && a.status !== 'CANCELLED'
                      );

                      return (
                        <div
                          key={account.id}
                          className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-3.5 flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="font-bold text-white text-sm">
                                  {account.bankName}
                                </span>
                                <span className="text-xs text-slate-400 block">
                                  via <strong className="text-slate-300">{account.brokerName}</strong>
                                </span>
                              </div>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                  account.isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-slate-800 text-slate-500'
                                }`}
                              >
                                {account.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            {account.accountNickname && (
                              <div className="text-xs text-slate-400 mt-1">
                                Nickname: {account.accountNickname}
                              </div>
                            )}

                            {account.upiId && (
                              <div className="text-xs font-mono text-emerald-400 mt-1">
                                UPI: {account.upiId}
                              </div>
                            )}

                            {account.dematNumber && (
                              <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                                Demat: {account.dematNumber}
                              </div>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase block">
                                Stated Balance
                              </span>
                              <span className="font-mono font-bold text-white text-sm">
                                {formatINR(account.availableFunds)}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onUpdateAccountBalance(account)}
                                className="px-2 py-1 text-[11px] font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                                title="Update bank balance"
                              >
                                Edit Funds
                              </button>
                              <button
                                onClick={() => onEditAccount(account)}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                title="Edit account details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Remove account ${account.bankName} / ${account.brokerName}?`)) {
                                    deleteAccount(account.id);
                                  }
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                                title="Delete account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
