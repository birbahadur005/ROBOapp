import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const { t } = useLanguage();

  const getStyle = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300';
      case 'RESCHEDULED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300';
      case 'CANCELLED':
        return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-400';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'PENDING': return t('status_pending', 'Pending');
      case 'ACCEPTED': return t('status_accepted', 'Accepted');
      case 'REJECTED': return t('status_rejected', 'Rejected');
      case 'RESCHEDULED': return t('status_rescheduled', 'Rescheduled');
      case 'COMPLETED': return t('status_completed', 'Completed');
      case 'CANCELLED': return t('status_cancelled', 'Cancelled');
      case 'EXPIRED': return t('status_expired', 'Expired');
      default: return status;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5 font-semibold'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${getStyle()} ${sizeClasses[size]}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-80 animate-pulse"></span>
      {getLabel()}
    </span>
  );
};
