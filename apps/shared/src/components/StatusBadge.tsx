import React from 'react';
import { cn } from '../../lib/utils';

export type StatusColor = 'red' | 'yellow' | 'green' | 'blue' | 'gray' | 'purple' | 'orange';

export interface StatusBadgeProps {
  status: string;
  color?: StatusColor;
  dot?: boolean;
  className?: string;
}

const colorClasses: Record<StatusColor, { badge: string; dot: string }> = {
  red:    { badge: 'bg-red-100 text-red-800',       dot: 'bg-red-500' },
  yellow: { badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  green:  { badge: 'bg-green-100 text-green-800',   dot: 'bg-green-500' },
  blue:   { badge: 'bg-blue-100 text-blue-800',     dot: 'bg-blue-500' },
  gray:   { badge: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400' },
  purple: { badge: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
  orange: { badge: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  color = 'gray',
  dot = false,
  className,
}) => {
  const classes = colorClasses[color];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        classes.badge,
        className
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', classes.dot)}
          aria-hidden="true"
        />
      )}
      {status}
    </span>
  );
};

export default StatusBadge;
