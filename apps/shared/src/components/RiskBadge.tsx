import React from 'react';
import { AlertOctagon, Activity, DollarSign, ShieldOff, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { RiskFlag } from '../../types';

export interface RiskBadgeProps {
  flag: RiskFlag;
  className?: string;
}

type RiskType = RiskFlag['type'];

const typeConfig: Record<
  RiskType,
  { bg: string; text: string; border: string; Icon: React.FC<{ size?: number; className?: string }> }
> = {
  'high-risk': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    Icon: AlertOctagon,
  },
  'care-gap': {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    Icon: Activity,
  },
  'outstanding-balance': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    Icon: DollarSign,
  },
  dnr: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    Icon: ShieldOff,
  },
  'fall-risk': {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    Icon: AlertTriangle,
  },
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ flag, className }) => {
  const config = typeConfig[flag.type];
  const { Icon } = config;

  return (
    <span
      role="img"
      aria-label={flag.label}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <Icon size={10} className="shrink-0" aria-hidden="true" />
      {flag.label}
    </span>
  );
};

export default RiskBadge;
