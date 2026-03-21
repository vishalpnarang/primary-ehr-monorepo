import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@primus/ui/lib';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'danger', onConfirm, onCancel,
}: ConfirmDialogProps) => {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCancel();
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-overlay" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-modal w-full max-w-sm animate-scale-in">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5">
          <div className="flex items-start gap-3">
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
              variant === 'danger' ? 'bg-red-50' : variant === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
            )}>
              <AlertTriangle className={cn(
                'w-5 h-5',
                variant === 'danger' ? 'text-red-500' : variant === 'warning' ? 'text-amber-500' : 'text-blue-500'
              )} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500 mt-1">{message}</p>
            </div>
            <button onClick={onCancel} className="p-1 hover:bg-slate-100 rounded text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onCancel}
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmRef}
              onClick={onConfirm}
              className={cn(
                'px-3 py-2 text-xs font-medium text-white rounded-lg transition-colors',
                variant === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
