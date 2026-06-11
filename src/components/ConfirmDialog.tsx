import { AlertTriangle } from 'lucide-react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/70"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md rounded-xl border border-surface-container-high bg-surface-container-low p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className={destructive ? 'text-red-400' : 'text-primary'}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-on-surface mb-1">{title}</h3>
            {description && (
              <p className="text-sm text-on-surface-variant">{description}</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              destructive
                ? 'px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md bg-red-500/90 hover:bg-red-500 text-white disabled:opacity-60 disabled:cursor-not-allowed'
                : 'px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md bg-primary text-on-primary-fixed hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed'
            }
          >
            {loading ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
