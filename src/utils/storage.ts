import { Person, Account, IPO, Application } from '../types';

const STORAGE_KEYS = {
  PEOPLE: 'ipo_planner_people_v1',
  ACCOUNTS: 'ipo_planner_accounts_v1',
  IPOS: 'ipo_planner_ipos_v1',
  APPLICATIONS: 'ipo_planner_applications_v1',
};

export const INITIAL_PEOPLE: Person[] = [
  {
    id: 'p-1',
    name: 'Rahul',
    pan: 'ABCPR1234F',
    notes: 'Primary family investor account',
    isActive: true,
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'p-2',
    name: 'Kiran',
    pan: 'BCDPK5678G',
    notes: 'High net worth allocation account',
    isActive: true,
    createdAt: '2026-10-01T10:05:00.000Z',
  },
  {
    id: 'p-3',
    name: 'Narendra',
    pan: 'CDEPN9012H',
    notes: 'Senior account - HNI applications',
    isActive: true,
    createdAt: '2026-10-02T11:00:00.000Z',
  },
  {
    id: 'p-4',
    name: 'Miral',
    pan: 'DEFPW3456J',
    notes: 'Retail quota applicant',
    isActive: true,
    createdAt: '2026-10-02T11:30:00.000Z',
  },
];

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    personId: 'p-1',
    bankName: 'SBI',
    brokerName: 'Zerodha',
    accountNickname: 'SBI Primary',
    availableFunds: 50000,
    upiId: 'rahul@oksbi',
    dematNumber: '1208160012345678',
    notes: 'Default UPI linked to Zerodha',
    isActive: true,
  },
  {
    id: 'acc-2',
    personId: 'p-1',
    bankName: 'HDFC Bank',
    brokerName: 'Groww',
    accountNickname: 'HDFC Secondary',
    availableFunds: 40000,
    upiId: 'rahul@okhdfc',
    dematNumber: '1208160087654321',
    notes: 'Used for secondary shareholder bids',
    isActive: true,
  },
  {
    id: 'acc-3',
    personId: 'p-2',
    bankName: 'HDFC Bank',
    brokerName: 'Zerodha',
    accountNickname: 'HDFC Main HNI',
    availableFunds: 300000,
    upiId: 'kiran@okhdfc',
    dematNumber: '1208160023456789',
    notes: 'Primary funding account for SHNI',
    isActive: true,
  },
  {
    id: 'acc-4',
    personId: 'p-2',
    bankName: 'ICICI Bank',
    brokerName: 'Zerodha',
    accountNickname: 'ICICI Reserve',
    availableFunds: 100000,
    upiId: 'kiran@okicici',
    dematNumber: '1208160023456789',
    notes: 'Reserve account for mandate top-up',
    isActive: true,
  },
  {
    id: 'acc-5',
    personId: 'p-3',
    bankName: 'ICICI Bank',
    brokerName: 'Groww',
    accountNickname: 'ICICI Groww HNI',
    availableFunds: 250000,
    upiId: 'narendra@okicici',
    dematNumber: '1208160034567890',
    notes: 'Auto-mandate approved',
    isActive: true,
  },
  {
    id: 'acc-6',
    personId: 'p-4',
    bankName: 'Kotak Mahindra',
    brokerName: 'AngelOne',
    accountNickname: 'Kotak Angel',
    availableFunds: 150000,
    upiId: 'miral@okkotak',
    dematNumber: '1208160045678901',
    notes: 'Active for retail lot allocations',
    isActive: true,
  },
];

export const INITIAL_IPOS: IPO[] = [
  {
    id: 'ipo-1',
    name: 'Lumino Industries Ltd.',
    companyName: 'Lumino Industries Limited',
    symbol: 'LUMINO',
    openDate: '2026-10-21',
    closeDate: '2026-10-23',
    listingDate: '2026-10-28',
    priceBandMin: 350,
    priceBandMax: 373,
    issuePrice: 373,
    lotSize: 40,
    isActive: true,
    quotas: [
      {
        id: 'q-1-retail',
        ipoId: 'ipo-1',
        name: 'Small / Retail',
        type: 'RETAIL',
        minLots: 1,
        maxLots: 13,
      },
      {
        id: 'q-1-shni',
        ipoId: 'ipo-1',
        name: 'Small HNI (sHNI)',
        type: 'SHNI',
        minLots: 14,
        maxLots: 66,
      },
      {
        id: 'q-1-bhni',
        ipoId: 'ipo-1',
        name: 'Big HNI (bHNI)',
        type: 'BHNI',
        minLots: 67,
        maxLots: 200,
      },
      {
        id: 'q-1-shareholder',
        ipoId: 'ipo-1',
        name: 'Shareholder',
        type: 'SHAREHOLDER',
        minLots: 1,
        maxLots: 13,
      },
      {
        id: 'q-1-employee',
        ipoId: 'ipo-1',
        name: 'Employee',
        type: 'EMPLOYEE',
        minLots: 1,
        maxLots: 13,
        discountPerShare: 15,
      },
    ],
  },
  {
    id: 'ipo-2',
    name: 'ESDS Software Solution Ltd.',
    companyName: 'ESDS Software Solution Limited',
    symbol: 'ESDS',
    openDate: '2026-10-22',
    closeDate: '2026-10-24',
    listingDate: '2026-10-30',
    priceBandMin: 168,
    priceBandMax: 175,
    issuePrice: 175,
    lotSize: 85,
    isActive: true,
    quotas: [
      {
        id: 'q-2-retail',
        ipoId: 'ipo-2',
        name: 'Small / Retail',
        type: 'RETAIL',
        minLots: 1,
        maxLots: 13,
      },
      {
        id: 'q-2-shni',
        ipoId: 'ipo-2',
        name: 'Small HNI (sHNI)',
        type: 'SHNI',
        minLots: 14,
        maxLots: 67,
      },
      {
        id: 'q-2-bhni',
        ipoId: 'ipo-2',
        name: 'Big HNI (bHNI)',
        type: 'BHNI',
        minLots: 68,
        maxLots: 250,
      },
      {
        id: 'q-2-shareholder',
        ipoId: 'ipo-2',
        name: 'Shareholder',
        type: 'SHAREHOLDER',
        minLots: 1,
        maxLots: 13,
      },
    ],
  },
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-001',
    applicationNumber: 'APP-001',
    personId: 'p-1',
    accountId: 'acc-1',
    ipoId: 'ipo-1',
    quotaId: 'q-1-retail',
    lots: 1,
    shares: 40,
    appliedPrice: 373,
    totalAmount: 14920,
    upiId: 'rahul@oksbi',
    status: 'APPLIED',
    notes: 'Cut-off price applied via SBI UPI',
    createdAt: '2026-10-21T09:30:00.000Z',
    updatedAt: '2026-10-21T09:30:00.000Z',
  },
  {
    id: 'app-002',
    applicationNumber: 'APP-002',
    personId: 'p-1',
    accountId: 'acc-2',
    ipoId: 'ipo-1',
    quotaId: 'q-1-shareholder',
    lots: 1,
    shares: 40,
    appliedPrice: 373,
    totalAmount: 14920,
    upiId: 'rahul@okhdfc',
    status: 'APPLIED',
    notes: 'Eligible parent shares held in demat',
    createdAt: '2026-10-21T09:45:00.000Z',
    updatedAt: '2026-10-21T09:45:00.000Z',
  },
  {
    id: 'app-003',
    applicationNumber: 'APP-003',
    personId: 'p-2',
    accountId: 'acc-3',
    ipoId: 'ipo-1',
    quotaId: 'q-1-shni',
    lots: 14,
    shares: 560,
    appliedPrice: 373,
    totalAmount: 208880,
    upiId: 'kiran@okhdfc',
    status: 'MANDATE_PENDING',
    notes: '14 Lots minimum for sHNI category (> ₹2L)',
    createdAt: '2026-10-21T10:15:00.000Z',
    updatedAt: '2026-10-21T10:15:00.000Z',
  },
  {
    id: 'app-004',
    applicationNumber: 'APP-004',
    personId: 'p-2',
    accountId: 'acc-3',
    ipoId: 'ipo-2',
    quotaId: 'q-2-shni',
    lots: 14,
    shares: 1190,
    appliedPrice: 175,
    totalAmount: 208250,
    upiId: 'kiran@okhdfc',
    status: 'MANDATE_PENDING',
    notes: 'Need to transfer additional funds to clear this mandate!',
    createdAt: '2026-10-22T08:00:00.000Z',
    updatedAt: '2026-10-22T08:00:00.000Z',
  },
  {
    id: 'app-005',
    applicationNumber: 'APP-005',
    personId: 'p-3',
    accountId: 'acc-5',
    ipoId: 'ipo-2',
    quotaId: 'q-2-shni',
    lots: 14,
    shares: 1190,
    appliedPrice: 175,
    totalAmount: 208250,
    upiId: 'narendra@okicici',
    status: 'MANDATE_APPROVED',
    notes: 'UPI auto-pay mandate successfully approved in Google Pay',
    createdAt: '2026-10-22T08:30:00.000Z',
    updatedAt: '2026-10-22T09:00:00.000Z',
  },
  {
    id: 'app-006',
    applicationNumber: 'APP-006',
    personId: 'p-3',
    accountId: 'acc-5',
    ipoId: 'ipo-1',
    quotaId: 'q-1-retail',
    lots: 1,
    shares: 40,
    appliedPrice: 373,
    totalAmount: 14920,
    upiId: 'narendra@okicici',
    status: 'APPLIED',
    notes: 'Single retail lot application',
    createdAt: '2026-10-21T11:00:00.000Z',
    updatedAt: '2026-10-21T11:00:00.000Z',
  },
  {
    id: 'app-007',
    applicationNumber: 'APP-007',
    personId: 'p-4',
    accountId: 'acc-6',
    ipoId: 'ipo-2',
    quotaId: 'q-2-retail',
    lots: 1,
    shares: 85,
    appliedPrice: 175,
    totalAmount: 14875,
    upiId: 'miral@okkotak',
    status: 'MANDATE_PENDING',
    notes: 'Awaiting Kotak UPI confirmation SMS',
    createdAt: '2026-10-22T08:45:00.000Z',
    updatedAt: '2026-10-22T08:45:00.000Z',
  },
];

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

export function loadAllData() {
  return {
    people: loadFromStorage<Person[]>(STORAGE_KEYS.PEOPLE, INITIAL_PEOPLE),
    accounts: loadFromStorage<Account[]>(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS),
    ipos: loadFromStorage<IPO[]>(STORAGE_KEYS.IPOS, INITIAL_IPOS),
    applications: loadFromStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS),
  };
}

export function saveAllData(data: {
  people: Person[];
  accounts: Account[];
  ipos: IPO[];
  applications: Application[];
}) {
  saveToStorage(STORAGE_KEYS.PEOPLE, data.people);
  saveToStorage(STORAGE_KEYS.ACCOUNTS, data.accounts);
  saveToStorage(STORAGE_KEYS.IPOS, data.ipos);
  saveToStorage(STORAGE_KEYS.APPLICATIONS, data.applications);
}

export function resetAllDataToDefault() {
  saveToStorage(STORAGE_KEYS.PEOPLE, INITIAL_PEOPLE);
  saveToStorage(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
  saveToStorage(STORAGE_KEYS.IPOS, INITIAL_IPOS);
  saveToStorage(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  return {
    people: INITIAL_PEOPLE,
    accounts: INITIAL_ACCOUNTS,
    ipos: INITIAL_IPOS,
    applications: INITIAL_APPLICATIONS,
  };
}
