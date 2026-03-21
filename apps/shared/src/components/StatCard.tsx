import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Skeleton } from './Skeleton';

export interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    isGood?: boolean;
  };
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  suffix?: string;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  icon,
  loading = false,
  className,
  suffix,
  description,
}) => {
  const trendGood = trend ? (trend.isGood !== undefined ? trend.isGood : trend.direction === 'up') : undefined;

  if (loading) {
    return (
      <div className={cn('rounded-xl border border-gray-200 bg-white p-5', className)}>
        <Skeleton variant="custom" className="h-3 w-24 mb-3" />
        <Skeleton variant="custom" className="h-8 w-32 mb-2" />
        <Skeleton variant="custom" className="h-3 w-16" />
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-5', className)}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        {icon && (
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 flex-wrap">
        <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">
          {value}
          {suffix && <span className="text-base font-medium text-gray-500 ml-1">{suffix}</span>}
        </p>

        {trend && (
          <div
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium mb-0.5',
              trendGood ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            )}
            aria-label={`${trend.direction === 'up' ? 'Up' : 'Down'} ${Math.abs(trend.value)}%`}
          >
            {trend.direction === 'up' ? (
              <TrendingUp size={12} aria-hidden="true" />
            ) : (
              <TrendingDown size={12} aria-hidden="true" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {description && (
        <p className="text-xs text-gray-400 mt-1.5">{description}</p>
      )}
    </div>
  );
};

export default StatCard;
