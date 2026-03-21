import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps {
  variant?: 'text' | 'card' | 'table' | 'avatar' | 'custom';
  lines?: number;
  rows?: number;
  className?: string;
}

const pulse = 'animate-pulse bg-gray-200 rounded';

const TextSkeleton: React.FC<{ lines: number }> = ({ lines }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cn(pulse, 'h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')}
      />
    ))}
  </div>
);

const CardSkeleton: React.FC = () => (
  <div className={cn('rounded-lg border border-gray-100 p-4 space-y-3', pulse)}>
    <div className="flex items-center gap-3">
      <div className={cn(pulse, 'h-10 w-10 rounded-full')} />
      <div className="flex-1 space-y-1.5">
        <div className={cn(pulse, 'h-4 w-1/2')} />
        <div className={cn(pulse, 'h-3 w-1/3')} />
      </div>
    </div>
    <div className={cn(pulse, 'h-4 w-full')} />
    <div className={cn(pulse, 'h-4 w-5/6')} />
    <div className={cn(pulse, 'h-4 w-2/3')} />
  </div>
);

const TableSkeleton: React.FC<{ rows: number }> = ({ rows }) => (
  <div className="space-y-0">
    <div className={cn(pulse, 'h-10 w-full mb-1')} />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
        <div className={cn(pulse, 'h-4 w-1/4')} />
        <div className={cn(pulse, 'h-4 w-1/3')} />
        <div className={cn(pulse, 'h-4 w-1/5')} />
        <div className={cn(pulse, 'h-4 w-1/6 ml-auto')} />
      </div>
    ))}
  </div>
);

const AvatarSkeleton: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className={cn(pulse, 'h-10 w-10 rounded-full shrink-0')} />
    <div className="space-y-1.5 flex-1">
      <div className={cn(pulse, 'h-4 w-32')} />
      <div className={cn(pulse, 'h-3 w-24')} />
    </div>
  </div>
);

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  lines = 3,
  rows = 5,
  className,
}) => {
  if (variant === 'text') return <TextSkeleton lines={lines} />;
  if (variant === 'card') return <CardSkeleton />;
  if (variant === 'table') return <TableSkeleton rows={rows} />;
  if (variant === 'avatar') return <AvatarSkeleton />;

  return <div className={cn(pulse, 'h-4 w-full', className)} aria-hidden="true" />;
};

export default Skeleton;
