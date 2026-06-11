import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import { useAdminGym, useUpdateGym } from '../hooks/useAdminGyms';
import type { GymUpdate } from '../../../services/adminGymService';

const STATUSES = ['active', 'inactive', 'suspended'] as const;

export default function GymEditPage() {
  const { gymId } = useParams<{ gymId: string }>();
  const navigate = useNavigate();
  const gymQuery = useAdminGym(gymId);
  const updateGym = useUpdateGym();

  const [form, setForm] = useState<GymUpdate>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (gymQuery.data) {
      setForm({
        name: gymQuery.data.name,
        slug: gymQuery.data.slug,
        timezone: gymQuery.data.timezone,
        address_line1: gymQuery.data.address_line1,
        address_line2: gymQuery.data.address_line2,
        city: gymQuery.data.city,
        region: gymQuery.data.region,
        postal_code: gymQuery.data.postal_code,
        phone: gymQuery.data.phone,
        email: gymQuery.data.email,
        logo_url: gymQuery.data.logo_url,
        status: gymQuery.data.status,
      });
    }
  }, [gymQuery.data]);

  if (gymQuery.isLoading) {
    return <div className="p-8 text-sm text-on-surface-variant">Loading gym...</div>;
  }
  if (!gymQuery.data || !gymId) {
    return (
      <div className="p-8 max-w-2xl">
        <Link
          to="/admin/gyms"
          className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to gyms
        </Link>
        <div className="mt-6 rounded-xl border border-error/30 bg-error-container/10 p-6 text-sm text-error">
          Gym not found.
        </div>
      </div>
    );
  }

  function update<K extends keyof GymUpdate>(key: K, value: GymUpdate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!gymId) return;
    await updateGym.mutateAsync({ id: gymId, patch: form });
    setSaved(true);
  }

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[900px] w-full mx-auto">
      <Link
        to={`/admin/gyms/${gymId}`}
        className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1.5 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to gym
      </Link>

      <header className="border-b border-surface-container-high pb-6">
        <h1 className="font-display text-3xl font-bold text-on-surface">Edit Gym</h1>
        <p className="text-sm text-on-surface-variant mt-1">{gymQuery.data.name}</p>
      </header>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
        <Field label="Gym name" value={form.name ?? ''} onChange={(v) => update('name', v)} required />
        <Field label="Slug" value={form.slug ?? ''} onChange={(v) => update('slug', v)} required />
        <Field label="Address line 1" value={form.address_line1 ?? ''} onChange={(v) => update('address_line1', v || null)} className="md:col-span-2" />
        <Field label="Address line 2" value={form.address_line2 ?? ''} onChange={(v) => update('address_line2', v || null)} className="md:col-span-2" />
        <Field label="City" value={form.city ?? ''} onChange={(v) => update('city', v || null)} />
        <Field label="State / Region" value={form.region ?? ''} onChange={(v) => update('region', v || null)} />
        <Field label="Postal code" value={form.postal_code ?? ''} onChange={(v) => update('postal_code', v || null)} />
        <Field label="Phone" value={form.phone ?? ''} onChange={(v) => update('phone', v || null)} />
        <Field label="Email" type="email" value={form.email ?? ''} onChange={(v) => update('email', v || null)} />
        <Field label="Timezone" value={form.timezone ?? ''} onChange={(v) => update('timezone', v)} />
        <Field label="Logo URL" value={form.logo_url ?? ''} onChange={(v) => update('logo_url', v || null)} className="md:col-span-2" />

        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-on-surface-variant mb-2 block uppercase tracking-wider">
            Status
          </label>
          <select
            value={form.status ?? 'active'}
            onChange={(e) => update('status', e.target.value)}
            className="w-full bg-background border border-surface-container-high rounded-md px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {updateGym.error && (
          <div className="md:col-span-2 rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
            {updateGym.error instanceof Error ? updateGym.error.message : 'Unable to save gym.'}
          </div>
        )}

        {saved && (
          <div className="md:col-span-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-on-surface flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Gym saved successfully.
          </div>
        )}

        <div className="md:col-span-2 flex gap-3 pt-2">
          <button
            type="submit"
            disabled={updateGym.isPending}
            className="inline-flex items-center gap-2 bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-md hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> {updateGym.isPending ? 'Saving...' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/admin/gyms/${gymId}`)}
            className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface border border-surface-container-high rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
};

function Field({ label, value, onChange, type = 'text', required, className }: FieldProps) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-on-surface-variant mb-2 block uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-background border border-surface-container-high rounded-md px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
