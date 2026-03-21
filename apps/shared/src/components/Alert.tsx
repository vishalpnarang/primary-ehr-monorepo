import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface AlertAction {
  label: string;
  onClick: () => void;
}

export interface AlertProps {
  severity?: AlertSeverity;
  title?: string;
  description?: string;
  dismissible?: boolean;
  actions?: AlertAction[];
  className?: string;
  onDismiss?: () => void;
}

const severityConfig: Record<
  AlertSeverity,
  { container: string; icon: React.FC<{ size?: number; className?: string }>; iconClass: string; titleClass: string; descClass: string }
> = {
  critical: {
    container: 'bg-red-50 border-red-200',
    icon: AlertCircle,
    iconClass: 'text-red-500',
    titleClass: 'text-red-800',
    descClass: 'text-red-700',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
    titleClass: 'text-amber-800',
    descClass: 'text-amber-700',
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: Info,
    iconClass: 'text-blue-500',
    titleClass: 'text-blue-800',
    descClass: 'text-blue-700',
  },
  success: {
    container: 'bg-green-50 border-green-200',
    icon: CheckCircle2,
    iconClass: 'text-green-500',
    titleClass: 'text-green-800',
    descClass: 'text-green-700',
  },
};

export const Alert: React.FC<AlertProps> = ({
  severity = 'info',
  title,
  description,
  dismissible = false,
  actions,
  className,
  onDismiss,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const config = severityConfig[severity];
  const { icon: Icon } = config;

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className={cn('rounded-md border p-4', config.container, className)}
    >
      <div className="flex gap-3">
        <Icon size={18} className={cn('shrink-0 mt-0.5', config.iconClass)} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {title && (
            <p className={cn('text-sm font-semibold', config.titleClass)}>{title}</p>
          )}
          {description && (
            <p className={cn('text-sm mt-0.5', config.descClass)}>{description}</p>
          )}
          {actions && actions.length > 0 && (
            <div className="flex gap-2 mt-3">
              {actions.map((action, idx) => (
                <Button key={idx} variant="ghost" size="sm" onClick={action.onClick}>
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss alert"
            className={cn(
              'shrink-0 -mt-0.5 -mr-0.5 rounded p-0.5 transition-colors',
              config.iconClass,
              'hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1'
            )}
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
