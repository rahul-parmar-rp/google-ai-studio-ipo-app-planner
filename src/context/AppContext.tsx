import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Person,
  Account,
  IPO,
  Application,
  ApplicationStatus,
  AccountFundingSummary,
  IPOSummary,
  ActiveTab,
  QuotaConfig,
  QuotaType,
} from '../types';
import {
  loadAllData,
  saveAllData,
  resetAllDataToDefault,
} from '../utils/storage';
import { getDaysLeft } from '../utils/formatters';

export function isFundingCommitted(status: ApplicationStatus): boolean {
  // Applications that block or commit bank/UPI funds
  return [
    'DRAFT',
    'APPLIED',
    'MANDATE_PENDING',
    'MANDATE_APPROVED',
    'ALLOTMENT_PENDING',
    'ALLOTTED',
  ].includes(status);
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
  isBalanceDeficit: boolean;
  deficitAmount: number;
}

interface AppContextType {
  people: Person[];
  accounts: Account[];
  ipos: IPO[];
  applications: Application[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedIpoId: string | null;
  setSelectedIpoId: (id: string | null) => void;
  notification: { type: 'success' | 'error' | 'warning' | 'info'; message: string } | null;
  setNotification: (notif: { type: 'success' | 'error' | 'warning' | 'info'; message: string } | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;

  // Aggregate Metrics & Summaries
  fundingSummaries: AccountFundingSummary[];
  totalRequiredCapital: number;
  totalAvailableFunds: number;
  totalDeficit: number;
  accountsWithDeficitCount: number;
  activeIposList: IPO[];
  getIpoSummary: (ipoId: string) => IPOSummary | null;
  
  // Validation
  validateApplicationInput: (data: {
    id?: string;
    personId: string;
    accountId: string;
    ipoId: string;
    quotaId: string;
    lots: number;
  }) => ValidationResult;

  // Actions - People
  addPerson: (person: Omit<Person, 'id' | 'createdAt'>) => Person;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => boolean;

  // Actions - Accounts
  addAccount: (account: Omit<Account, 'id'>) => Account;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  updateAccountBalance: (id: string, newBalance: number) => void;
  deleteAccount: (id: string) => boolean;

  // Actions - IPOs
  addIPO: (ipo: Omit<IPO, 'id'>) => IPO;
  updateIPO: (id: string, updates: Partial<IPO>) => void;
  deleteIPO: (id: string) => boolean;

  // Actions - Applications
  addApplication: (appData: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'shares' | 'totalAmount' | 'appliedPrice'> & { appliedPrice?: number }) => Application;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus, extras?: { sharesAllotted?: number; refundAmount?: number; notes?: string }) => void;
  deleteApplication: (id: string) => void;
  duplicateApplication: (id: string) => Application | null;

  // Backup & Reset
  resetToSampleData: () => void;
  exportBackupJson: () => void;
  importBackupJson: (jsonString: string) => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedIpoId, setSelectedIpoId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  // Load data on initial mount
  useEffect(() => {
    const loaded = loadAllData();
    setPeople(loaded.people);
    setAccounts(loaded.accounts);
    setIpos(loaded.ipos);
    setApplications(loaded.applications);
    setDataLoaded(true);
  }, []);

  // Save data on changes after initial load
  useEffect(() => {
    if (!dataLoaded) return;
    saveAllData({ people, accounts, ipos, applications });
  }, [people, accounts, ipos, applications, dataLoaded]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Funding Summaries for each account
  const fundingSummaries: AccountFundingSummary[] = useMemo(() => {
    return accounts.map((acc) => {
      const person = people.find((p) => p.id === acc.personId) || {
        id: acc.personId,
        name: 'Unknown Applicant',
        isActive: false,
        createdAt: '',
      };

      const linkedApps = applications.filter(
        (app) => app.accountId === acc.id && isFundingCommitted(app.status)
      );

      const requiredFunds = linkedApps.reduce((sum, app) => sum + (app.totalAmount || 0), 0);
      const availableFunds = acc.availableFunds || 0;
      const deficitOrSurplus = availableFunds - requiredFunds;
      const isDeficit = deficitOrSurplus < 0;

      return {
        account: acc,
        person,
        requiredFunds,
        availableFunds,
        deficitOrSurplus,
        isDeficit,
        activeApplicationsCount: linkedApps.length,
        applications: linkedApps,
      };
    });
  }, [accounts, people, applications]);

  // Aggregate Metrics
  const totalRequiredCapital = useMemo(() => {
    return applications
      .filter((app) => isFundingCommitted(app.status))
      .reduce((sum, app) => sum + (app.totalAmount || 0), 0);
  }, [applications]);

  const totalAvailableFunds = useMemo(() => {
    return accounts
      .filter((a) => a.isActive)
      .reduce((sum, a) => sum + (a.availableFunds || 0), 0);
  }, [accounts]);

  const totalDeficit = useMemo(() => {
    return fundingSummaries.reduce((sum, summary) => {
      return summary.isDeficit ? sum + Math.abs(summary.deficitOrSurplus) : sum;
    }, 0);
  }, [fundingSummaries]);

  const accountsWithDeficitCount = useMemo(() => {
    return fundingSummaries.filter((s) => s.isDeficit && s.account.isActive).length;
  }, [fundingSummaries]);

  const activeIposList = useMemo(() => {
    return ipos.filter((ipo) => ipo.isActive);
  }, [ipos]);

  const getIpoSummary = (ipoId: string): IPOSummary | null => {
    const ipo = ipos.find((i) => i.id === ipoId);
    if (!ipo) return null;

    const ipoApps = applications.filter((app) => app.ipoId === ipoId && app.status !== 'CANCELLED');
    const totalCapital = ipoApps.reduce((sum, app) => sum + (app.totalAmount || 0), 0);

    const bidsByQuota: Record<QuotaType, number> = {
      RETAIL: 0,
      SHNI: 0,
      BHNI: 0,
      SHAREHOLDER: 0,
      EMPLOYEE: 0,
      OTHER: 0,
    };

    ipoApps.forEach((app) => {
      const quota = ipo.quotas.find((q) => q.id === app.quotaId);
      const qType = quota?.type || 'OTHER';
      bidsByQuota[qType] = (bidsByQuota[qType] || 0) + 1;
    });

    const daysInfo = getDaysLeft(ipo.closeDate, ipo.openDate);

    return {
      ipo,
      applicationsCount: ipoApps.length,
      totalCapital,
      bidsByQuota,
      status: daysInfo.status,
      daysLeftText: daysInfo.text,
    };
  };

  // Validation function
  const validateApplicationInput = (data: {
    id?: string;
    personId: string;
    accountId: string;
    ipoId: string;
    quotaId: string;
    lots: number;
  }): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isDuplicate = false;
    let isBalanceDeficit = false;
    let deficitAmount = 0;

    const person = people.find((p) => p.id === data.personId);
    const account = accounts.find((a) => a.id === data.accountId);
    const ipo = ipos.find((i) => i.id === data.ipoId);
    const quota = ipo?.quotas.find((q) => q.id === data.quotaId);

    if (!person) errors.push('Applicant is required');
    if (!account) errors.push('Bank & Demat Account is required');
    if (!ipo) errors.push('IPO is required');
    if (!quota) errors.push('Quota category is required');

    if (account && !account.isActive) {
      errors.push(`Account ${account.bankName} (${account.brokerName}) is inactive`);
    }

    if (person && !person.isActive) {
      errors.push(`Applicant ${person.name} is marked inactive`);
    }

    if (data.lots <= 0 || !Number.isInteger(data.lots)) {
      errors.push('Lot count must be a positive whole integer');
    }

    if (quota) {
      if (data.lots < quota.minLots) {
        errors.push(`Minimum lots required for ${quota.name} is ${quota.minLots}`);
      }
      if (data.lots > quota.maxLots) {
        errors.push(`Maximum lots allowed for ${quota.name} is ${quota.maxLots}`);
      }
    }

    if (ipo) {
      const schedule = getDaysLeft(ipo.closeDate, ipo.openDate);
      if (schedule.status === 'UPCOMING') {
        warnings.push(`Notice: ${ipo.name} opens on ${ipo.openDate}. You are pre-planning draft bids.`);
      } else if (schedule.status === 'CLOSED') {
        warnings.push(`Warning: ${ipo.name} closed on ${ipo.closeDate}.`);
      }
    }

    // Duplicate Check: Same person + same IPO in non-shareholder/employee quota
    if (person && ipo && quota) {
      const isExemptQuota = quota.type === 'SHAREHOLDER' || quota.type === 'EMPLOYEE';
      if (!isExemptQuota) {
        const existingApp = applications.find(
          (app) =>
            app.id !== data.id &&
            app.personId === data.personId &&
            app.ipoId === data.ipoId &&
            app.status !== 'CANCELLED' &&
            (() => {
              const appQuota = ipo.quotas.find((q) => q.id === app.quotaId);
              return appQuota?.type !== 'SHAREHOLDER' && appQuota?.type !== 'EMPLOYEE';
            })()
        );

        if (existingApp) {
          isDuplicate = true;
          warnings.push(
            `Duplicate PAN Alert: ${person.name} already has an active application (${existingApp.applicationNumber || 'Bid'}) for ${ipo.symbol}. Under SEBI regulations, multiple bids on the same PAN in Retail/HNI will be rejected by the registrar. Ensure this is intentional before applying.`
          );
        }
      }
    }

    // Account Balance Deficit Check
    if (account && ipo && quota && data.lots > 0) {
      const discount = quota.discountPerShare || 0;
      const effectivePrice = Math.max(0, ipo.issuePrice - discount);
      const appAmount = data.lots * ipo.lotSize * effectivePrice;

      // Other active applications on this account
      const existingReq = applications
        .filter((app) => app.accountId === account.id && app.id !== data.id && isFundingCommitted(app.status))
        .reduce((sum, app) => sum + (app.totalAmount || 0), 0);

      const projectedRequired = existingReq + appAmount;
      if (projectedRequired > account.availableFunds) {
        isBalanceDeficit = true;
        deficitAmount = projectedRequired - account.availableFunds;
        warnings.push(
          `Funding Deficit Alert: Adding this application requires ₹${appAmount.toLocaleString('en-IN')}. Total account requirement will be ₹${projectedRequired.toLocaleString('en-IN')}, exceeding current balance of ₹${account.availableFunds.toLocaleString('en-IN')} by ₹${deficitAmount.toLocaleString('en-IN')}.`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      isDuplicate,
      isBalanceDeficit,
      deficitAmount,
    };
  };

  // Actions - People
  const addPerson = (personData: Omit<Person, 'id' | 'createdAt'>): Person => {
    const newPerson: Person = {
      ...personData,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPeople((prev) => [...prev, newPerson]);
    showToast(`Added applicant ${newPerson.name}`, 'success');
    return newPerson;
  };

  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Applicant details updated', 'success');
  };

  const deletePerson = (id: string): boolean => {
    const hasApps = applications.some((a) => a.personId === id && a.status !== 'CANCELLED');
    if (hasApps) {
      showToast('Cannot delete applicant with active applications', 'error');
      return false;
    }
    setPeople((prev) => prev.filter((p) => p.id !== id));
    setAccounts((prev) => prev.filter((a) => a.personId !== id));
    showToast('Applicant and associated accounts removed', 'info');
    return true;
  };

  // Actions - Accounts
  const addAccount = (accountData: Omit<Account, 'id'>): Account => {
    const newAccount: Account = {
      ...accountData,
      id: `acc-${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAccount]);
    showToast(`Added account ${newAccount.bankName} / ${newAccount.brokerName}`, 'success');
    return newAccount;
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    showToast('Account details updated', 'success');
  };

  const updateAccountBalance = (id: string, newBalance: number) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, availableFunds: Math.max(0, newBalance) } : a))
    );
    showToast('Account balance updated', 'success');
  };

  const deleteAccount = (id: string): boolean => {
    const hasApps = applications.some((a) => a.accountId === id && a.status !== 'CANCELLED');
    if (hasApps) {
      showToast('Cannot delete account linked to active applications', 'error');
      return false;
    }
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    showToast('Account removed', 'info');
    return true;
  };

  // Actions - IPOs
  const addIPO = (ipoData: Omit<IPO, 'id'>): IPO => {
    const newIpoId = `ipo-${Date.now()}`;
    const newIPO: IPO = {
      ...ipoData,
      id: newIpoId,
      quotas: ipoData.quotas.map((q, idx) => ({
        ...q,
        id: q.id || `q-${newIpoId}-${idx}`,
        ipoId: newIpoId,
      })),
    };
    setIpos((prev) => [...prev, newIPO]);
    showToast(`Added IPO ${newIPO.name}`, 'success');
    return newIPO;
  };

  const updateIPO = (id: string, updates: Partial<IPO>) => {
    setIpos((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    showToast('IPO details updated', 'success');
  };

  const deleteIPO = (id: string): boolean => {
    const hasApps = applications.some((a) => a.ipoId === id && a.status !== 'CANCELLED');
    if (hasApps) {
      showToast('Cannot delete IPO with active applications', 'error');
      return false;
    }
    setIpos((prev) => prev.filter((i) => i.id !== id));
    if (selectedIpoId === id) setSelectedIpoId(null);
    showToast('IPO removed', 'info');
    return true;
  };

  // Actions - Applications
  const addApplication = (
    appData: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'shares' | 'totalAmount' | 'appliedPrice'> & {
      appliedPrice?: number;
    }
  ): Application => {
    const ipo = ipos.find((i) => i.id === appData.ipoId);
    const quota = ipo?.quotas.find((q) => q.id === appData.quotaId);
    const lotSize = ipo?.lotSize || 1;
    const discount = quota?.discountPerShare || 0;
    const appliedPrice = appData.appliedPrice ?? (ipo ? Math.max(0, ipo.issuePrice - discount) : 0);
    const shares = appData.lots * lotSize;
    const totalAmount = shares * appliedPrice;

    const count = applications.length + 1;
    const appNumber = appData.applicationNumber || `APP-${String(count).padStart(3, '0')}`;

    const newApp: Application = {
      ...appData,
      id: `app-${Date.now()}`,
      applicationNumber: appNumber,
      appliedPrice,
      shares,
      totalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setApplications((prev) => [newApp, ...prev]);
    showToast(`Application ${appNumber} created`, 'success');
    return newApp;
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        const updated = { ...app, ...updates, updatedAt: new Date().toISOString() };
        // Recalculate shares and amount if lots or price changed
        const ipo = ipos.find((i) => i.id === updated.ipoId);
        const quota = ipo?.quotas.find((q) => q.id === updated.quotaId);
        const lotSize = ipo?.lotSize || 1;
        const discount = quota?.discountPerShare || 0;
        const price = updated.appliedPrice ?? (ipo ? Math.max(0, ipo.issuePrice - discount) : 0);

        updated.shares = updated.lots * lotSize;
        updated.appliedPrice = price;
        updated.totalAmount = updated.shares * price;
        return updated;
      })
    );
    showToast('Application updated', 'success');
  };

  const updateApplicationStatus = (
    id: string,
    status: ApplicationStatus,
    extras?: { sharesAllotted?: number; refundAmount?: number; notes?: string }
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        return {
          ...app,
          status,
          ...(extras || {}),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    showToast(`Status updated to ${status.replace('_', ' ')}`, 'info');
  };

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    showToast('Application deleted', 'info');
  };

  const duplicateApplication = (id: string): Application | null => {
    const target = applications.find((a) => a.id === id);
    if (!target) return null;

    const count = applications.length + 1;
    const newApp: Application = {
      ...target,
      id: `app-${Date.now()}`,
      applicationNumber: `APP-${String(count).padStart(3, '0')}`,
      status: 'DRAFT',
      notes: target.notes ? `${target.notes} (Copy)` : 'Copy of bid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setApplications((prev) => [newApp, ...prev]);
    showToast(`Duplicated as ${newApp.applicationNumber} (Draft)`, 'success');
    return newApp;
  };

  // Backup & Reset
  const resetToSampleData = () => {
    const reset = resetAllDataToDefault();
    setPeople(reset.people);
    setAccounts(reset.accounts);
    setIpos(reset.ipos);
    setApplications(reset.applications);
    setSelectedIpoId(null);
    showToast('Reset data to default sample scenario', 'info');
  };

  const exportBackupJson = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        people,
        accounts,
        ipos,
        applications,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ipo-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON exported successfully', 'success');
  };

  const importBackupJson = (jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      const data = parsed.data || parsed;
      if (!Array.isArray(data.people) || !Array.isArray(data.accounts) || !Array.isArray(data.ipos)) {
        return { success: false, message: 'Invalid backup format: Missing core entities.' };
      }
      setPeople(data.people);
      setAccounts(data.accounts);
      setIpos(data.ipos);
      setApplications(data.applications || []);
      showToast('Backup imported successfully', 'success');
      return { success: true, message: 'Data restored successfully' };
    } catch (e) {
      return { success: false, message: 'Could not parse JSON file.' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        people,
        accounts,
        ipos,
        applications,
        activeTab,
        setActiveTab,
        selectedIpoId,
        setSelectedIpoId,
        notification,
        setNotification,
        showToast,
        fundingSummaries,
        totalRequiredCapital,
        totalAvailableFunds,
        totalDeficit,
        accountsWithDeficitCount,
        activeIposList,
        getIpoSummary,
        validateApplicationInput,
        addPerson,
        updatePerson,
        deletePerson,
        addAccount,
        updateAccount,
        updateAccountBalance,
        deleteAccount,
        addIPO,
        updateIPO,
        deleteIPO,
        addApplication,
        updateApplication,
        updateApplicationStatus,
        deleteApplication,
        duplicateApplication,
        resetToSampleData,
        exportBackupJson,
        importBackupJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
