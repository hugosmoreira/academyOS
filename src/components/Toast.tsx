import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastVariant = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  push: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const VARIANT_STYLES: Record<ToastVariant, { wrapper: string; icon: React.ReactNode }> = {
  success: {
    wrapper: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  },
  error: {
    wrapper: 'border-red-500/40 bg-red-500/10 text-red-200',
    icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
  },
  info: {
    wrapper: 'border-primary/40 bg-primary/10 text-primary',
    icon: <Info className="w-4 h-4 text-primary" />,
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current, { id, ...toast }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (title, description) => push({ variant: 'success', title, description }),
      error: (title, description) => push({ variant: 'error', title, description }),
      info: (title, description) => push({ variant: 'info', title, description }),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => {
          const style = VARIANT_STYLES[toast.variant];
          return (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto rounded-lg border px-4 py-3 shadow-lg backdrop-blur-md flex items-start gap-3',
                style.wrapper,
              )}
            >
              <div className="mt-0.5">{style.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-snug truncate">{toast.title}</div>
                {toast.description && (
                  <div className="text-xs text-on-surface-variant mt-0.5 leading-snug break-words">
                    {toast.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="Dismiss"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
