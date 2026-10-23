import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { DashboardView } from './components/dashboard/DashboardView';
import { IPOListView } from './components/ipos/IPOListView';
import { FundingMatrixView } from './components/accounts/FundingMatrixView';
import { ApplicationListView } from './components/applications/ApplicationListView';
import { PeopleAccountsView } from './components/accounts/PeopleAccountsView';
import { ApplicationModal } from './components/applications/ApplicationModal';
import { IPOModal } from './components/ipos/IPOModal';
import { PersonModal } from './components/accounts/PersonModal';
import { AccountModal } from './components/accounts/AccountModal';
import { UpdateBalanceModal } from './components/accounts/UpdateBalanceModal';
import { AllotmentModal } from './components/applications/AllotmentModal';
import { ShareSummaryModal } from './components/export/ShareSummaryModal';
import { Application, IPO, Person, Account } from './types';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

function AppContent() {
  const {
    activeTab,
    notification,
    setNotification,
    people,
    addPerson,
    updatePerson,
    addAccount,
    updateAccount,
    updateAccountBalance,
    addIPO,
    updateIPO,
    updateApplicationStatus,
  } = useApp();

  // Application Modal state
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [appModalDefaultIpoId, setAppModalDefaultIpoId] = useState<string | null>(null);

  // IPO Modal state
  const [isIpoModalOpen, setIsIpoModalOpen] = useState(false);
  const [editingIpo, setEditingIpo] = useState<IPO | null>(null);

  // Person Modal state
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  // Account Modal state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [defaultPersonIdForAccount, setDefaultPersonIdForAccount] = useState<string | undefined>(
    undefined
  );

  // Fast Balance Update Modal state
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [accountForBalanceUpdate, setAccountForBalanceUpdate] = useState<Account | null>(null);

  // Allotment Modal state
  const [isAllotmentModalOpen, setIsAllotmentModalOpen] = useState(false);
  const [appForAllotment, setAppForAllotment] = useState<Application | null>(null);

  // Share & CSV Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalIpoId, setShareModalIpoId] = useState<string | null>(null);

  // Handlers
  const handleOpenNewApplication = (ipoId?: string) => {
    setEditingApplication(null);
    setAppModalDefaultIpoId(ipoId || null);
    setIsAppModalOpen(true);
  };

  const handleEditApplication = (app: Application) => {
    setEditingApplication(app);
    setAppModalDefaultIpoId(null);
    setIsAppModalOpen(true);
  };

  const handleOpenNewIPO = () => {
    setEditingIpo(null);
    setIsIpoModalOpen(true);
  };

  const handleEditIPO = (ipo: IPO) => {
    setEditingIpo(ipo);
    setIsIpoModalOpen(true);
  };

  const handleOpenNewPerson = () => {
    setEditingPerson(null);
    setIsPersonModalOpen(true);
  };

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
    setIsPersonModalOpen(true);
  };

  const handleOpenNewAccount = (personId?: string) => {
    setEditingAccount(null);
    setDefaultPersonIdForAccount(personId);
    setIsAccountModalOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setDefaultPersonIdForAccount(undefined);
    setIsAccountModalOpen(true);
  };

  const handleTriggerBalanceUpdate = (account: Account) => {
    setAccountForBalanceUpdate(account);
    setIsBalanceModalOpen(true);
  };

  const handleManageAllotment = (app: Application) => {
    setAppForAllotment(app);
    setIsAllotmentModalOpen(true);
  };

  const handleOpenShareModal = (ipoId?: string) => {
    setShareModalIpoId(ipoId || null);
    setIsShareModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-xl backdrop-blur-md border animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`flex items-center gap-2 text-xs font-semibold ${
              notification.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-600'
                : notification.type === 'warning'
                ? 'bg-amber-950/90 text-amber-200 border-amber-600'
                : notification.type === 'info'
                ? 'bg-blue-950/90 text-blue-200 border-blue-600'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-600'
            }`}
          >
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {notification.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
            {notification.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
            {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 hover:opacity-75"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Top Header & Tab Navigation */}
      <Header
        onOpenNewApplication={() => handleOpenNewApplication()}
        onOpenNewIPO={handleOpenNewIPO}
        onOpenShareModal={() => handleOpenShareModal()}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNewApplication={handleOpenNewApplication}
            onNewIPO={handleOpenNewIPO}
            onEditApplication={handleEditApplication}
            onUpdateAccountBalance={handleTriggerBalanceUpdate}
            onManageAllotment={handleManageAllotment}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationListView
            onNewApplication={() => handleOpenNewApplication()}
            onEditApplication={handleEditApplication}
            onManageAllotment={handleManageAllotment}
            onOpenShareModal={() => handleOpenShareModal()}
          />
        )}

        {activeTab === 'funding' && (
          <FundingMatrixView
            onUpdateBalance={handleTriggerBalanceUpdate}
            onEditApplication={handleEditApplication}
          />
        )}

        {activeTab === 'ipos' && (
          <IPOListView
            onNewIPO={handleOpenNewIPO}
            onEditIPO={handleEditIPO}
            onNewApplication={handleOpenNewApplication}
            onEditApplication={handleEditApplication}
            onShareIpoSummary={(ipoId) => handleOpenShareModal(ipoId)}
            onManageAllotment={handleManageAllotment}
          />
        )}

        {activeTab === 'people-accounts' && (
          <PeopleAccountsView
            onNewPerson={handleOpenNewPerson}
            onEditPerson={handleEditPerson}
            onNewAccount={handleOpenNewAccount}
            onEditAccount={handleEditAccount}
            onUpdateAccountBalance={handleTriggerBalanceUpdate}
          />
        )}
      </main>

      {/* Footer info & offline badge */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>IPO Application Planner • Multi-Account Demat & Quota Orchestrator</span>
          <span className="text-[11px] text-slate-600">
            Offline Enabled (PWA) • All data stored locally on your device
          </span>
        </div>
      </footer>

      {/* In-App Modals */}
      <ApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        initialApplication={editingApplication}
        defaultIpoId={appModalDefaultIpoId}
      />

      <IPOModal
        isOpen={isIpoModalOpen}
        onClose={() => setIsIpoModalOpen(false)}
        initialIpo={editingIpo}
        onSave={(data) => {
          if (editingIpo) {
            updateIPO(editingIpo.id, data);
          } else {
            addIPO(data);
          }
        }}
      />

      <PersonModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
        initialPerson={editingPerson}
        onSave={(data) => {
          if (editingPerson) {
            updatePerson(editingPerson.id, data);
          } else {
            addPerson(data);
          }
        }}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        people={people}
        initialAccount={editingAccount}
        defaultPersonId={defaultPersonIdForAccount}
        onSave={(data) => {
          if (editingAccount) {
            updateAccount(editingAccount.id, data);
          } else {
            addAccount(data);
          }
        }}
      />

      <UpdateBalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        account={accountForBalanceUpdate}
        onSave={(accId, newBal) => updateAccountBalance(accId, newBal)}
      />

      <AllotmentModal
        isOpen={isAllotmentModalOpen}
        onClose={() => setIsAllotmentModalOpen(false)}
        application={appForAllotment}
        onSave={(appId, status, extras) =>
          updateApplicationStatus(appId, status, extras)
        }
      />

      <ShareSummaryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        preselectedIpoId={shareModalIpoId}
      />

      {/* Non-intrusive Offline indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
