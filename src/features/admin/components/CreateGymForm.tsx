import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Building2, MapPin, User, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCreateGym } from '../hooks/useCreateGym';
import { listOrganizationsWithCounts, type CreateGymResult } from '../services/adminService';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type CreateGymFormProps = {
  onSuccess?: (result: CreateGymResult) => void;
};

export default function CreateGymForm({ onSuccess }: CreateGymFormProps) {
  const [searchParams] = useSearchParams();
  const presetAccountId = searchParams.get('accountId') ?? '';
  const [gymName, setGymName] = useState('');
  const [gymSlug, setGymSlug] = useState('');
  const [gymSlugTouched, setGymSlugTouched] = useState(false);
  const [gymTimezone, setGymTimezone] = useState('America/Los_Angeles');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [attachToAccount, setAttachToAccount] = useState(Boolean(presetAccountId));
  const [organizationId, setOrganizationId] = useState(presetAccountId);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');
  const [newOrgSlugTouched, setNewOrgSlugTouched] = useState(false);

  const mutation = useCreateGym();
  const organizationsQuery = useQuery({
    queryKey: ['admin', 'organizations', 'all'],
    queryFn: listOrganizationsWithCounts,
  });

  useEffect(() => {
    if (!presetAccountId) return;
    setAttachToAccount(true);
    setOrganizationId(presetAccountId);
  }, [presetAccountId]);

  useEffect(() => {
    if (!gymSlugTouched) setGymSlug(slugify(gymName));
  }, [gymName, gymSlugTouched]);

  useEffect(() => {
    if (!attachToAccount && !newOrgSlugTouched) {
      setNewOrgName(gymName ? `${gymName} Account` : '');
      setNewOrgSlug(gymSlug ? `${gymSlug}-account` : '');
    }
  }, [attachToAccount, gymName, gymSlug, newOrgSlugTouched]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.reset();
    try {
      const result = await mutation.mutateAsync({
        gymName: gymName.trim(),
        gymSlug: gymSlug.trim(),
        gymTimezone,
        ownerEmail: ownerEmail.trim() || undefined,
        ownerFullName: ownerName.trim() || undefined,
        organizationId: attachToAccount && organizationId ? organizationId : undefined,
        newOrgName: attachToAccount ? undefined : (newOrgName.trim() || undefined),
        newOrgSlug: attachToAccount ? undefined : (newOrgSlug.trim() || undefined),
      });
      onSuccess?.(result);
    } catch {
      // mutation.error surfaced below
    }
  }

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : mutation.error ? 'Unable to create gym.' : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
          <MapPin className="w-3.5 h-3.5 text-primary" /> Gym
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-on-surface">Gym name</span>
            <input
              value={gymName}
              onChange={(event) => setGymName(event.target.value)}
              placeholder="Elite Discipline HQ"
              required
              className="bg-surface border border-surface-container-high rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-on-surface">Gym slug</span>
            <input
              value={gymSlug}
              onChange={(event) => {
                setGymSlugTouched(true);
                setGymSlug(event.target.value);
              }}
              placeholder="elite-discipline-hq"
              required
              className="bg-surface border border-surface-container-high rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
            />
          </label>
          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-xs font-semibold text-on-surface">Timezone</span>
            <input
              value={gymTimezone}
              onChange={(event) => setGymTimezone(event.target.value)}
              className="bg-surface border border-surface-container-high rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
          <User className="w-3.5 h-3.5 text-primary" /> Gym owner invite
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-on-surface">Owner email</span>
            <div className="relative">
              <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={ownerEmail}
                onChange={(event) => setOwnerEmail(event.target.value)}
                placeholder="owner@academy.com"
                className="w-full bg-surface border border-surface-container-high rounded-lg pl-9 pr-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-on-surface">Owner full name</span>
            <input
              value={ownerName}
              onChange={(event) => setOwnerName(event.target.value)}
              placeholder="Alex Rivera"
              className="bg-surface border border-surface-container-high rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            <Building2 className="w-3.5 h-3.5 text-primary" /> Business account (optional)
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-on-surface-variant">
            <input
              type="checkbox"
              checked={attachToAccount}
              onChange={(event) => setAttachToAccount(event.target.checked)}
              className="rounded border-surface-container-high"
            />
            Attach to existing account
          </label>
        </div>

        {attachToAccount ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-on-surface">Business account</span>
            <select
              value={organizationId}
              onChange={(event) => setOrganizationId(event.target.value)}
              required={attachToAccount}
              className="bg-surface border border-surface-container-high rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="">Select an account...</option>
              {(organizationsQuery.data ?? []).map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.gym_count} gym{org.gym_count === 1 ? '' : 's'})
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="text-xs text-on-surface-variant">
            A business account is created automatically for standalone gyms. You only need to
            group locations when an owner operates multiple gyms.
          </p>
        )}
      </section>

      {errorMessage && (
        <div className="rounded-lg border border-error/30 bg-error-container/10 px-4 py-3 text-sm text-error">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-md hover:brightness-110 transition-all disabled:opacity-60"
      >
        {mutation.isPending ? 'Creating gym...' : 'Create Gym'}
        {!mutation.isPending && <ArrowRight className="w-4 h-4" />}
      </button>
    </form>
  );
}
