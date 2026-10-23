export type QuotaType = 'RETAIL' | 'SHNI' | 'BHNI' | 'SHAREHOLDER' | 'EMPLOYEE' | 'OTHER';

export type ApplicationStatus = 
  | 'DRAFT'
  | 'APPLIED'
  | 'MANDATE_PENDING'
  | 'MANDATE_APPROVED'
  | 'ALLOTMENT_PENDING'
  | 'ALLOTTED'
  | 'NOT_ALLOTTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Person {
  id: string;
  name: string;
  pan?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Account {
  id: string;
  personId: string;
  bankName: string;
  brokerName: string;
  accountNickname?: string;
  availableFunds: number;
  upiId?: string;
  dematNumber?: string;
  notes?: string;
  isActive: boolean;
}

export interface QuotaConfig {
  id: string;
  ipoId: string;
  name: string;
  type: QuotaType;
  minLots: number;
  maxLots: number;
  discountPerShare?: number;
}

export interface IPO {
  id: string;
  name: string;
  companyName: string;
  symbol: string;
  openDate: string; // YYYY-MM-DD
  closeDate: string; // YYYY-MM-DD
  listingDate?: string; // YYYY-MM-DD
  priceBandMin: number;
  priceBandMax: number;
  issuePrice: number; // Cut-off or bid price used for calculations
  lotSize: number;
  quotas: QuotaConfig[];
  isActive: boolean;
}

export interface Application {
  id: string;
  applicationNumber?: string;
  personId: string;
  accountId: string;
  ipoId: string;
  quotaId: string;
  lots: number;
  shares: number;
  appliedPrice: number;
  totalAmount: number;
  upiId?: string;
  status: ApplicationStatus;
  sharesAllotted?: number;
  refundAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountFundingSummary {
  account: Account;
  person: Person;
  requiredFunds: number;
  availableFunds: number;
  deficitOrSurplus: number; // available - required; negative means deficit
  isDeficit: boolean;
  activeApplicationsCount: number;
  applications: Application[];
}

export interface IPOSummary {
  ipo: IPO;
  applicationsCount: number;
  totalCapital: number;
  bidsByQuota: Record<QuotaType, number>;
  status: 'UPCOMING' | 'OPEN' | 'CLOSED';
  daysLeftText: string;
}

export type ActiveTab = 'dashboard' | 'applications' | 'ipos' | 'funding' | 'people-accounts';
