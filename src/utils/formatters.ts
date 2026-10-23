/**
 * Utilities for formatting Indian Currency (INR), dates, and numbers.
 */

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `₹${formatted}`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getDaysLeft(closeDateStr: string, openDateStr?: string): {
  status: 'UPCOMING' | 'OPEN' | 'CLOSED';
  text: string;
  badgeColor: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const close = new Date(closeDateStr);
  close.setHours(23, 59, 59, 999);

  const open = openDateStr ? new Date(openDateStr) : null;
  if (open) open.setHours(0, 0, 0, 0);

  if (open && today.getTime() < open.getTime()) {
    const diffTime = open.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      status: 'UPCOMING',
      text: diffDays === 1 ? 'Opens tomorrow' : `Opens in ${diffDays} days`,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
  }

  if (today.getTime() > close.getTime()) {
    return {
      status: 'CLOSED',
      text: 'Closed',
      badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
  }

  const diffTime = close.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      status: 'OPEN',
      text: 'Closes today',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };
  } else if (diffDays === 1) {
    return {
      status: 'OPEN',
      text: 'Closes tomorrow',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
  } else {
    return {
      status: 'OPEN',
      text: `Closes in ${diffDays} days`,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
  }
}

export function formatQuotaLabel(type: string): string {
  switch (type) {
    case 'RETAIL':
      return 'Retail / Small';
    case 'SHNI':
      return 'Small HNI (sHNI)';
    case 'BHNI':
      return 'Big HNI (bHNI)';
    case 'SHAREHOLDER':
      return 'Shareholder';
    case 'EMPLOYEE':
      return 'Employee';
    default:
      return type;
  }
}

export function formatStatusLabel(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'APPLIED':
      return 'Applied';
    case 'MANDATE_PENDING':
      return 'Mandate Pending';
    case 'MANDATE_APPROVED':
      return 'Mandate Approved';
    case 'ALLOTMENT_PENDING':
      return 'Allotment Pending';
    case 'ALLOTTED':
      return 'Allotted';
    case 'NOT_ALLOTTED':
      return 'Not Allotted';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}
