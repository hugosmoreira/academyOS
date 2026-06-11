import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import { useOrganization } from '../hooks/useOrganizations';
import { useUpdateOrganization } from '../hooks/useAdminOrganization';
import type { OrganizationUpdate } from '../../../services/organizationService';

const STATUSES = ['active', 'inactive', 'suspended'] as const;

export default function OrganizationEditPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const orgQuery = useOrganization(orgId);
  const updateOrg = useUpdateOrganization();

  const [form, setForm] = useState<OrganizationUpdate>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (orgQuery.data) {
      setForm({
        name: orgQuery.data.name,
        slug: orgQuery.data.slug,
        status: orgQuery.data.status,
      });
    }
  }, [orgQuery.data]);

  if (orgQuery.isLoading) {
    return <div className="p-8 text-sm text-on-surface-variant">Loading organization...</div>;
  }
  if (!orgQuery.data || !orgId) {
    return (
      <div className="p-8 max-w-2xl">
        <Link
          to="/admin/organizations"
          className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to organizations
        </Link>
        <div className="mt-6 rounded-xl border border-error/30 bg-error-container/10 p-6 text-sm text-error">
          Organization not found.
        </div>
      </div>
    );
  }

  function update<K extends keyof OrganizationUpdate>(key: K, value: OrganizationUpdate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!orgId) return;
    await updateOrg.mutateAsync({ id: orgId, patch: form });
    setSaved(true);
  }

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[800px] w-full mx-auto">
      <Link
        to={`/admin/organizations/${orgId}`}
        className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1.5 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to organization
      </Link>

      <header className="border-b border-surface-container-high pb-6">
        <h1 className="font-display text-3xl font-bold text-on-surface">Edit Organization</h1>
        <p className="text-sm text-on-surface-variant mt-1">{orgQuery.data.name}</p>
      </header>

      <form className="grid grid-cols-1 gap-5" onSubmit={handleSubmit}>
        <Field label="Name" value={form.name ?? ''} onChange={(v) => update('name', v)} required />
        <Field label="Slug" value={form.slug ?? ''} onChange={(v) => update('slug', v)} required />
        <div>
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

        {updateOrg.error && (
          <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
            {updateOrg.error instanceof Error ? updateOrg.error.message : 'Unable to save.'}
          </div>
        )}

        {saved && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-on-surface flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Organization saved.
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={updateOrg.isPending}
            className="inline-flex items-center gap-2 bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-md hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> {updateOrg.isPending ? 'Saving...' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/admin/organizations/${orgId}`)}
            className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface border border-surface-container-high rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-on-surface-variant mb-2 block uppercase tracking-wider">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-background border border-surface-container-high rounded-md px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
