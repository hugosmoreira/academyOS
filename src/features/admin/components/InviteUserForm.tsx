import { useMemo, useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrganizationInvite } from '../../../services/inviteService';
import type { GymRoleKey, OrganizationRoleKey, RoleKey } from '../../../types/database';
import {
  GYM_ROLE_KEYS,
  ORGANIZATION_ROLE_KEYS,
  labelForRole,
} from '../../../services/roleService';

type InviteUserFormProps = {
  organizationId: string;
  gyms?: Array<{ id: string; name: string }>;
};

type ScopeOption = 'organization' | 'gym';

export default function InviteUserForm({ organizationId, gyms = [] }: InviteUserFormProps) {
  const queryClient = useQueryClient();
  const [showBusinessAccountRoles, setShowBusinessAccountRoles] = useState(false);
  const [scope, setScope] = useState<ScopeOption>(gyms.length > 0 ? 'gym' : 'organization');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [orgRole, setOrgRole] = useState<OrganizationRoleKey>('organization_admin');
  const [gymRole, setGymRole] = useState<GymRoleKey>('coach');
  const [gymId, setGymId] = useState(gyms[0]?.id ?? '');
  const [result, setResult] = useState<{ token: string } | null>(null);

  const effectiveScope = gyms.length > 0 && !showBusinessAccountRoles ? 'gym' : scope;

  const mutation = useMutation({
    mutationFn: async () => {
      const roleKey: RoleKey = effectiveScope === 'organization' ? orgRole : gymRole;
      return createOrganizationInvite({
        organizationId,
        gymId: effectiveScope === 'gym' ? gymId || null : null,
        email,
        fullName: fullName || null,
        roleKey,
      });
    },
    onSuccess: (invite) => {
      setResult({ token: invite.token });
      setEmail('');
      setFullName('');
      queryClient.invalidateQueries({
        queryKey: ['admin', 'organization', organizationId, 'invites'],
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });

  const inviteLink = useMemo(
    () => (result?.token ? `${window.location.origin}/signup/invite/${result.token}` : null),
    [result],
  );

  const selectedGymName = gyms.find((g) => g.id === gymId)?.name;

  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-5 flex flex-col gap-4">
      <h3 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
        <Mail className="w-4 h-4 text-primary" /> Invite staff to gym
      </h3>

      {gyms.length > 0 ? (
        <p className="text-xs text-on-surface-variant">
          Invites are gym-scoped by default. Staff land in the gym app for the selected location.
        </p>
      ) : (
        <p className="text-xs text-on-surface-variant">
          No gyms are linked to this business account yet. Create a gym before sending gym-scoped invites.
        </p>
      )}

      {gyms.length > 0 && (
        <label className="inline-flex items-center gap-2 text-xs text-on-surface-variant">
          <input
            type="checkbox"
            checked={showBusinessAccountRoles}
            onChange={(event) => {
              setShowBusinessAccountRoles(event.target.checked);
              setScope(event.target.checked ? 'organization' : 'gym');
            }}
            className="rounded border-surface-container-high"
          />
          Invite to business account role (multi-location admin)
        </label>
      )}

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <Input label="Full name" value={fullName} onChange={setFullName} placeholder="Optional" />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />

        {effectiveScope === 'gym' && gyms.length > 0 && (
          <Select
            label="Gym"
            value={gymId}
            onChange={setGymId}
            options={gyms.map((g) => ({ value: g.id, label: g.name }))}
          />
        )}
        <Select
          label={effectiveScope === 'organization' ? 'Business account role' : 'Gym role'}
          value={effectiveScope === 'organization' ? orgRole : gymRole}
          onChange={(v) =>
            effectiveScope === 'organization'
              ? setOrgRole(v as OrganizationRoleKey)
              : setGymRole(v as GymRoleKey)
          }
          options={(effectiveScope === 'organization' ? ORGANIZATION_ROLE_KEYS : GYM_ROLE_KEYS).map(
            (k) => ({ value: k, label: labelForRole(k) }),
          )}
        />

        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={mutation.isPending || !email.trim() || (effectiveScope === 'gym' && !gymId)}
            className="inline-flex items-center gap-2 bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" /> {mutation.isPending ? 'Creating...' : 'Create invite'}
          </button>
          <p className="text-[11px] text-on-surface-variant">
            {effectiveScope === 'gym' && selectedGymName
              ? `Invite for ${selectedGymName}.`
              : 'Creates a pending invite. Deploy the admin-invite-user Edge Function to email the link automatically.'}
          </p>
        </div>

        {mutation.error instanceof Error && (
          <div className="md:col-span-2 rounded-md border border-error/30 bg-error-container/20 px-3 py-2 text-xs text-error">
            {mutation.error.message}
          </div>
        )}
        {inviteLink && (
          <div className="md:col-span-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-on-surface flex flex-col gap-2">
            <span className="font-semibold">Invite link created. Share with the user:</span>
            <div className="bg-background rounded p-2 font-mono text-xs break-all">{inviteLink}</div>
          </div>
        )}
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full bg-background border border-surface-container-high rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-surface-container-high rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
