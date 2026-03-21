import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

// --- Types ---
export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  severity: ToastSeverity;
  title: string;
  description?: string;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

// --- Context ---
const ToastContext = createContext<ToastContextValue | null>(null);

// --- Config ---
const severityConfig: Record<
  ToastSeverity,
  { container: string; icon: React.FC<{ size?: number; className?: string }>; iconClass: string }
> = {
  success: { container: 'border-green-200 bg-white',  icon: CheckCircle2,  iconClass: 'text-green-500' },
  error:   { container: 'border-red-200 bg-white',    icon: AlertCircle,   iconClass: 'text-red-500' },
  warning: { container: 'border-amber-200 bg-white',  icon: AlertTriangle, iconClass: 'text-amber-500' },
  info:    { container: 'border-blue-200 bg-white',   icon: Info,          iconClass: 'text-blue-500' },
};

// --- Single Toast ---
const ToastCard: React.FC<{ item: ToastItem; onDismiss: (id: string) => void }> = ({ item, onDismiss }) => {
  const config = severityConfig[item.severity];
  const { icon: Icon } = config;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), item.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [item.id, item.duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3.5 shadow-lg min-w-[300px] max-w-[380px]',
        'animate-in slide-in-from-bottom-2 fade-in duration-200',
        config.container
      )}
    >
      <Icon size={18} className={cn('shrink-0 mt-0.5', config.iconClass)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
        {item.description && (
          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
        )}
        {item.action && (
          <button
            type="button"
            onClick={item.action.onClick}
            className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 focus-visible:underline"
          >
            {item.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="shrink-0 text-gray-400 hover:text-gray-600 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
};

// --- Provider ---
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);
  const MAX = 3;

  const toast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => {
      const next = [...prev, { ...item, id }];
      return next.length > MAX ? next.slice(next.length - MAX) : next;
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {ReactDOM.createPortal(
        <div
          aria-live="polite"
          aria-atomic="false"
          className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end"
        >
          {toasts.map((item) => (
            <ToastCard key={item.id} item={item} onDismiss={dismiss} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// --- Hook ---
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default ToastProvider;
