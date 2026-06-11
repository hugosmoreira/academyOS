import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  KeyRound,
  MapPin,
  ShieldCheck,
  UserCog,
  UserX,
} from 'lucide-react';
import {
  useAdminUserDetail,
  useAssignGymMember,
  useAssignOrgMember,
  useDeactivateGymMembership,
  useDeactivateOrgMembership,
  useSendPasswordReset,
  useSetPlatformMember,
  useSetProfileStatus,
} from '../hooks/useAdminUsers';
import { useOrganizationsWithCounts } from '../hooks/useOrganizations';
import { useAllGymsWithContext } from '../hooks/useAdminGyms';
import {
  GYM_ROLE_KEYS,
  ORGANIZATION_ROLE_KEYS,
  PLATFORM_ROLE_KEYS,
  labelForRole,
} from '../../../services/roleService';
import type {
  GymRoleKey,
  OrganizationRoleKey,
  PlatformRoleKey,
  ProfileStatus,
} from '../../../types/database';

const PROFILE_STATUSES: ProfileStatus[] = ['active', 'pending', 'inactive', 'suspended'];

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const detailQuery = useAdminUserDetail(userId);
  const orgsQuery = useOrganizationsWithCounts();
  const gymsQuery = useAllGymsWithContext();

  const assignOrg = useAssignOrgMember();
  const assignGym = useAssignGymMember();
  const setPlatform = useSetPlatformMember();
  const setStatus = useSetProfileStatus();
  const deactivateOrg = useDeactivateOrgMembership();
  const deactivateGym = useDeactivateGymMembership();
  const sendReset = useSendPasswordReset();

  const [orgId, setOrgId] = useState('');
  const [orgRole, setOrgRole] = useState<OrganizationRoleKey>('organization_admin');
  const [gymId, setGymId] = useState('');
  const [gymRole, setGymRole] = useState<GymRoleKey>('gym_admin');
  const [platformRole, setPlatformRole] = useState<PlatformRoleKey>('platform_admin');

  useEffect(() => {
    if (!orgId && orgsQuery.data?.[0]) setOrgId(orgsQuery.data[0].id);
  }, [orgsQuery.data, orgId]);
  useEffect(() => {
    if (!gymId && gymsQuery.data?.[0]) setGymId(gymsQuery.data[0].id);
  }, [gymsQuery.data, gymId]);

  if (detailQuery.isLoading) {
    return <div className="p-8 text-sm text-on-surface-variant">Loading user...</div>;
  }
  if (!detailQuery.data) {
    return (
      <div className="p-8 max-w-2xl">
        <Link
          to="/admin/users"
          className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to users
        </Link>
        <div className="mt-6 rounded-xl border border-error/30 bg-error-container/10 p-6 text-sm text-error">
          User not found.
        </div>
      </div>
    );
  }

  const { profile, linked_students, platform_memberships, organization_memberships, gym_memberships } =
    detailQuery.data;

  return (
    <div className="p-8 flex flex-col gap-8 max-w-[1200px] w-full mx-auto">
      <Link
        to="/admin/users"
        className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1.5 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to users
      </Link>

      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-surface-container-high pb-6">
        <div className="flex flex-col gap-3">
          <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold flex items-center gap-1.5">
            <UserCog className="w-3 h-3 text-primary" /> User
          </div>
          <h1 className="font-display text-3xl font-bold text-on-surface">
            {profile.full_name || profile.email}
          </h1>
          <div className="flex items-center gap-3 text-xs text-on-surface-variant">
            <span>{profile.email}</span>
            <span className="w-1 h-1 rounded-full bg-on-surface-variant/50" />
            <span className="uppercase tracking-widest font-bold">{profile.status}</span>
            <span className="w-1 h-1 rounded-full bg-on-surface-variant/50" />
            <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Status
            </label>
            <select
              value={profile.status}
              onChange={(e) =>
                setStatus.mutate({ profileId: profile.id, status: e.target.value as ProfileStatus })
              }
              className="bg-background border border-surface-container-high rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              {PROFILE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={sendReset.isPending || !profile.email}
            onClick={() => sendReset.mutate(profile.email)}
            className="inline-flex items-center gap-2 bg-surface-container border border-surface-container-high text-on-surface text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md hover:bg-surface-container-high transition-colors disabled:opacity-60"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {sendReset.isPending
              ? 'Sending...'
              : sendReset.isSuccess
                ? 'Reset email sent'
                : 'Send password reset'}
          </button>
        </div>
      </header>

      {sendReset.error instanceof Error && (
        <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {sendReset.error.message}
        </div>
      )}

      {/* Linked student records (portal users) */}
      {linked_students.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
            <GraduationCap className="w-5 h-5" /> Linked Student Records
          </h2>
          <div className="rounded-xl border border-surface-container-high bg-surface-container-low overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-container-high">
                  <th className="text-xs text-on-surface-variant px-6 py-3 uppercase tracking-wider font-semibold">Student</th>
                  <th className="text-xs text-on-surface-variant px-6 py-3 uppercase tracking-wider font-semibold">Link Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {linked_students.map((link) => (
                  <tr key={link.link_id} className="border-b border-surface-container-high/60 last:border-b-0">
                    <td className="px-6 py-3 text-on-surface">
                      {[link.student_first_name, link.student_last_name].filter(Boolean).join(' ') || link.student_id}
                    </td>
                    <td className="px-6 py-3 text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                      {link.status}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {link.gym_id && (
                        <Link
                          to={`/app/gyms/${link.gym_id}/students/${link.student_id}`}
                          className="text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-fixed"
                        >
                          View student record
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Platform roles */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Platform Roles
        </h2>
        {platform_memberships.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-6 text-sm text-on-surface-variant">
            No platform-level access.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {platform_memberships.map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1.5 bg-primary-container/20 text-primary border border-primary/30 px-3 py-1.5 rounded-full text-xs uppercase tracking-widest font-bold"
              >
                <ShieldCheck className="w-3 h-3" />
                {m.role_label}
                <span className="opacity-60">· {m.status}</span>
              </span>
            ))}
          </div>
        )}
        <AssignBar
          label="Grant platform role"
          actionLabel="Grant"
          loading={setPlatform.isPending}
          error={setPlatform.error}
          onSubmit={() =>
            setPlatform.mutate({ profileId: profile.id, roleKey: platformRole, status: 'active' })
          }
        >
          <select
            value={platformRole}
            onChange={(e) => setPlatformRole(e.target.value as PlatformRoleKey)}
            className="bg-background border border-surface-container-high rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
          >
            {PLATFORM_ROLE_KEYS.map((k) => (
              <option key={k} value={k}>
                {labelForRole(k)}
              </option>
            ))}
          </select>
        </AssignBar>
      </section>

      {/* Organization memberships */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
          <Building2 className="w-5 h-5" /> Organization Memberships
        </h2>
        {organization_memberships.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-6 text-sm text-on-surface-variant">
            Not a member of any organization.
          </div>
        ) : (
          <MembershipTable
            rows={organization_memberships.map((m) => ({
              id: m.membership_id,
              primary: m.organization_name,
              role: m.role_label,
              status: m.status,
              linkTo: `/admin/organizations/${m.organization_id}`,
            }))}
            onDeactivate={(id) => deactivateOrg.mutate(id)}
          />
        )}
        <AssignBar
          label="Assign organization role"
          actionLabel="Assign"
          loading={assignOrg.isPending}
          error={assignOrg.error}
          onSubmit={() => {
            if (!orgId) return;
            assignOrg.mutate({ organizationId: orgId, profileId: profile.id, roleKey: orgRole });
          }}
        >
          <select
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            className="bg-background border border-surface-container-high rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary min-w-[200px]"
          >
            {(orgsQuery.data ?? []).map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <select
            value={orgRole}
            onChange={(e) => setOrgRole(e.target.value as OrganizationRoleKey)}
            className="bg-background border border-surface-container-high rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
          >
            {ORGANIZATION_ROLE_KEYS.map((k) => (
              <option key={k} value={k}>
                {labelForRole(k)}
              </option>
            ))}
          </select>
        </AssignBar>
      </section>

      {/* Gym memberships */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
          <MapPin className="w-5 h-5" /> Gym Memberships
        </h2>
        {gym_memberships.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-6 text-sm text-on-surface-variant">
            Not assigned to any gym.
          </div>
        ) : (
          <MembershipTable
            rows={gym_memberships.map((m) => ({
              id: m.membership_id,
              primary: m.gym_name,
              role: m.role_label,
              status: m.status,
              linkTo: `/admin/gyms/${m.gym_id}`,
            }))}
            onDeactivate={(id) => deactivateGym.mutate(id)}
          />
        )}
        <AssignBar
          label="Assign gym role"
          actionLabel="Assign"
          loading={assignGym.isPending}
          error={assignGym.error}
          onSubmit={() => {
            if (!gymId) return;
            assignGym.mutate({ gymId, profileId: profile.id, roleKey: gymRole });
          }}
        >
          <select
            value={gymId}
            onChange={(e) => setGymId(e.target.value)}
            className="bg-background border border-surface-container-high rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary min-w-[200px]"
          >
            {(gymsQuery.data ?? []).map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} · {g.organization_name ?? '—'}
              </option>
            ))}
          </select>
          <select
            value={gymRole}
            onChange={(e) => setGymRole(e.target.value as GymRoleKey)}
            className="bg-background border border-surface-container-high rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
          >
            {GYM_ROLE_KEYS.map((k) => (
              <option key={k} value={k}>
                {labelForRole(k)}
              </option>
            ))}
          </select>
        </AssignBar>
      </section>
    </div>
  );
}

type AssignBarProps = {
  label: string;
  actionLabel: string;
  loading: boolean;
  error: unknown;
  onSubmit: () => void;
  children: React.ReactNode;
};

function AssignBar({ label, actionLabel, loading, error, onSubmit, children }: AssignBarProps) {
  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-4 flex flex-col gap-3">
      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-bold">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {children}
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : actionLabel}
        </button>
      </div>
      {error instanceof Error && (
        <div className="rounded-md border border-error/30 bg-error-container/20 px-3 py-2 text-xs text-error">
          {error.message}
        </div>
      )}
    </div>
  );
}

type MembershipTableProps = {
  rows: Array<{
    id: string;
    primary: string;
    role: string;
    status: string;
    linkTo: string;
  }>;
  onDeactivate: (membershipId: string) => void;
};

function MembershipTable({ rows, onDeactivate }: MembershipTableProps) {
  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-surface-container-high">
            <th className="text-xs text-on-surface-variant px-6 py-3 uppercase tracking-wider font-semibold">Name</th>
            <th className="text-xs text-on-surface-variant px-6 py-3 uppercase tracking-wider font-semibold">Role</th>
            <th className="text-xs text-on-surface-variant px-6 py-3 uppercase tracking-wider font-semibold">Status</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-surface-container-high/60 last:border-b-0">
              <td className="px-6 py-3">
                <Link to={r.linkTo} className="text-on-surface hover:text-primary">
                  {r.primary}
                </Link>
              </td>
              <td className="px-6 py-3 text-on-surface">{r.role}</td>
              <td className="px-6 py-3 text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                {r.status}
              </td>
              <td className="px-6 py-3 text-right">
                {r.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => onDeactivate(r.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-error"
                  >
                    <UserX className="w-3.5 h-3.5" /> Deactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
