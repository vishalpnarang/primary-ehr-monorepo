import React from 'react';
import { cn } from '../../lib/utils';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor = 'blue' | 'white' | 'gray' | 'red' | 'green';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  label?: string;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
};

const colorClasses: Record<SpinnerColor, string> = {
  blue:  'border-blue-200 border-t-blue-600',
  white: 'border-white/30 border-t-white',
  gray:  'border-gray-200 border-t-gray-600',
  red:   'border-red-200 border-t-red-600',
  green: 'border-green-200 border-t-green-600',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'blue',
  label = 'Loading…',
  className,
}) => {
  return (
    <div role="status" aria-label={label} className={cn('inline-flex', className)}>
      <div
        className={cn(
          'rounded-full animate-spin',
          sizeClasses[size],
          colorClasses[color]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Spinner;
