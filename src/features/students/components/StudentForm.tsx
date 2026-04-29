import { useEffect, useState, type FormEvent } from 'react';
import { Save, X } from 'lucide-react';
import type { Student, MemberStatus } from '../../../services/studentService';

const BELT_OPTIONS = ['White', 'Blue', 'Purple', 'Brown', 'Black'];
const STATUS_OPTIONS: MemberStatus[] = ['active', 'inactive', 'prospect', 'suspended', 'archived'];

export type StudentFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  belt: string;
  stripes: number;
  status: MemberStatus;
};

type StudentFormProps = {
  initial?: Student | null;
  open: boolean;
  mode: 'create' | 'edit';
  loading: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: StudentFormValues) => void | Promise<void>;
};

const EMPTY: StudentFormValues = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  belt: 'White',
  stripes: 0,
  status: 'active',
};

export default function StudentForm({ initial, open, mode, loading, error, onClose, onSubmit }: StudentFormProps) {
  const [values, setValues] = useState<StudentFormValues>(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setValues({
        first_name: initial.first_name ?? '',
        last_name: initial.last_name ?? '',
        email: initial.email ?? '',
        phone: initial.phone ?? '',
        belt: initial.belt ?? 'White',
        stripes: initial.stripes ?? 0,
        status: (initial.status as MemberStatus) ?? 'active',
      });
    } else {
      setValues(EMPTY);
    }
  }, [initial, open]);

  if (!open) return null;

  function handleChange<K extends keyof StudentFormValues>(key: K, value: StudentFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <aside className="relative ml-auto h-full w-full max-w-md bg-surface-container-low border-l border-surface-container-high shadow-2xl flex flex-col">
        <header className="flex items-center justify-between px-6 py-5 border-b border-surface-container-high">
          <div>
            <h2 className="text-lg font-bold text-on-surface">
              {mode === 'create' ? 'Add Student' : 'Edit Student'}
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              {mode === 'create'
                ? 'Saved directly to Supabase using the active organization and gym.'
                : 'Update the record. Changes are saved to Supabase.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">First name</label>
              <input
                required
                value={values.first_name}
                onChange={(event) => handleChange('first_name', event.target.value)}
                className="w-full bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Last name</label>
              <input
                required
                value={values.last_name}
                onChange={(event) => handleChange('last_name', event.target.value)}
                className="w-full bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Email</label>
            <input
              type="email"
              value={values.email}
              onChange={(event) => handleChange('email', event.target.value)}
              className="w-full bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Phone</label>
            <input
              value={values.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              className="w-full bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Belt</label>
              <select
                value={values.belt}
                onChange={(event) => handleChange('belt', event.target.value)}
                className="w-full bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              >
                {BELT_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Stripes</label>
              <input
                type="number"
                min={0}
                max={4}
                value={values.stripes}
                onChange={(event) => handleChange('stripes', Number(event.target.value))}
                className="w-full bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Status</label>
            <select
              value={values.status}
              onChange={(event) => handleChange('status', event.target.value as MemberStatus)}
              className="w-full bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </form>

        <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-container-high">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={(event) => {
              event.preventDefault();
              const form = event.currentTarget.closest('aside')?.querySelector('form');
              if (form) form.requestSubmit();
            }}
            className="bg-primary text-on-primary-fixed hover:brightness-110 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : mode === 'create' ? 'Add Student' : 'Save Changes'}
          </button>
        </footer>
      </aside>
    </div>
  );
}
