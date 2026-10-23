import React from 'react';
import { ApplicationStatus, QuotaType } from '../../types';
import { formatQuotaLabel, formatStatusLabel } from '../../utils/formatters';

export const ApplicationStatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  let colorStyles = 'bg-slate-800 text-slate-300 border-slate-700';

  switch (status) {
    case 'DRAFT':
      colorStyles = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
      break;
    case 'APPLIED':
      colorStyles = 'bg-blue-950/70 text-blue-400 border-blue-800/50';
      break;
    case 'MANDATE_PENDING':
      colorStyles = 'bg-amber-950/70 text-amber-300 border-amber-800/50';
      break;
    case 'MANDATE_APPROVED':
      colorStyles = 'bg-emerald-950/70 text-emerald-300 border-emerald-800/50';
      break;
    case 'ALLOTMENT_PENDING':
      colorStyles = 'bg-purple-950/70 text-purple-300 border-purple-800/50';
      break;
    case 'ALLOTTED':
      colorStyles = 'bg-emerald-900/90 text-emerald-200 border-emerald-600 font-semibold';
      break;
    case 'NOT_ALLOTTED':
      colorStyles = 'bg-rose-950/70 text-rose-300 border-rose-800/50';
      break;
    case 'COMPLETED':
      colorStyles = 'bg-teal-950/70 text-teal-300 border-teal-800/50';
      break;
    case 'CANCELLED':
      colorStyles = 'bg-zinc-900 text-zinc-400 border-zinc-800 line-through';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-medium tracking-tight whitespace-nowrap ${colorStyles}`}
    >
      {formatStatusLabel(status)}
    </span>
  );
};

export const QuotaBadge: React.FC<{ type: QuotaType | string; name?: string }> = ({
  type,
  name,
}) => {
  let color = 'bg-slate-800 text-slate-300 border-slate-700';

  switch (type) {
    case 'RETAIL':
      color = 'bg-sky-950/60 text-sky-300 border-sky-800/50';
      break;
    case 'SHNI':
      color = 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50';
      break;
    case 'BHNI':
      color = 'bg-violet-950/60 text-violet-300 border-violet-800/50';
      break;
    case 'SHAREHOLDER':
      color = 'bg-amber-950/60 text-amber-300 border-amber-800/50';
      break;
    case 'EMPLOYEE':
      color = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-medium ${color}`}
      title={name || formatQuotaLabel(type)}
    >
      {name || formatQuotaLabel(type)}
    </span>
  );
};
