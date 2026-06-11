import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Clock,
  Mail,
  MapPin,
  Pencil,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  useOrganization,
  useOrganizationGyms,
  useOrganizationInvites,
} from '../hooks/useOrganizations';
import {
  useOrganizationAuditLog,
  useOrganizationMembers,
} from '../hooks/useAdminOrganization';
import InviteUserForm from '../components/InviteUserForm';

const INVITE_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
  accepted: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  expired: 'bg-surface-container-high text-on-surface-variant border border-surface-container-highest',
  revoked: 'bg-red-500/10 text-red-300 border border-red-500/30',
};

type TabKey = 'overview' | 'gyms' | 'users' | 'audit';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'gyms', label: 'Gyms' },
  { key: 'users', label: 'Users' },
  { key: 'audit', label: 'Audit Log' },
];

export default function OrganizationDetailPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [tab, setTab] = useState<TabKey>('overview');

  const orgQuery = useOrganization(orgId);
  const gymsQuery = useOrganizationGyms(orgId);
  const invitesQuery = useOrganizationInvites(orgId);
  const membersQuery = useOrganizationMembers(orgId);
  const auditQuery = useOrganizationAuditLog(orgId, 25);

  const org = orgQuery.data;

  if (orgQuery.isLoading) {
    return <div className="p-8 text-sm text-on-surface-variant">Loading organization...</div>;
  }

  if (!org) {
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

  return (
    <div className="p-8 flex flex-col gap-8 max-w-[1200px] w-full mx-auto">
      <Link
        to="/admin/organizations"
        className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors inline-flex items-center gap-1.5 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to organizations
      </Link>

      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-surface-container-high pb-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
            <Building2 className="w-3 h-3 text-primary" /> Organization
          </div>
          <h1 className="font-display text-3xl font-bold text-on-surface">{org.name}</h1>
          <div className="flex items-center gap-3 text-xs text-on-surface-variant">
            <span className="font-mono">{org.slug}</span>
            <span className="w-1 h-1 rounded-full bg-on-surface-variant/50" />
            <span className="uppercase tracking-widest font-bold">{org.status}</span>
            <span className="w-1 h-1 rounded-full bg-on-surface-variant/50" />
            <span>Created {new Date(org.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <Link
          to={`/admin/organizations/${org.id}/edit`}
          className="inline-flex items-center gap-2 bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-md hover:brightness-110 transition-all"
        >
          <Pencil className="w-4 h-4" /> Edit Organization
        </Link>
      </header>

      <nav className="flex gap-1 border-b border-surface-container-high">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              'px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ' +
              (tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface')
            }
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Gyms"
            value={(gymsQuery.data ?? []).length}
            icon={<MapPin className="w-4 h-4" />}
          />
          <StatCard
            label="Members"
            value={(membersQuery.data ?? []).length}
            icon={<Users className="w-4 h-4" />}
          />
          <StatCard
            label="Pending Invites"
            value={(invitesQuery.data ?? []).filter((i) => i.status === 'pending').length}
            icon={<Mail className="w-4 h-4" />}
          />
        </section>
      )}

      {tab === 'gyms' && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Gyms
            </h2>
            <Link
              to={`/admin/gyms/new?accountId=${org.id}`}
              className="inline-flex items-center gap-2 bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md hover:brightness-110 transition-all"
            >
              Add gym
            </Link>
          </div>
          {gymsQuery.isLoading ? (
            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6 text-sm text-on-surface-variant">
              Loading gyms...
            </div>
          ) : (gymsQuery.data ?? []).length === 0 ? (
            <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-6 text-sm text-on-surface-variant">
              No gyms yet for this business account.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(gymsQuery.data ?? []).map((gym) => (
                <Link
                  key={gym.id}
                  to={`/admin/gyms/${gym.id}`}
                  className="rounded-xl border border-surface-container-high bg-surface-container-low p-5 hover:border-primary/40 transition-colors"
                >
                  <div className="text-sm font-semibold text-on-surface">{gym.name}</div>
                  <div className="text-xs text-on-surface-variant font-mono mt-1">{gym.slug}</div>
                  <div className="text-xs text-on-surface-variant mt-3">
                    {[gym.city, gym.region].filter(Boolean).join(', ') || 'No location set'}
                  </div>
                  <div className="mt-3 text-xs font-bold uppercase tracking-wider text-primary inline-flex items-center gap-1.5">
                    Manage <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'users' && (
        <>
          <InviteUserForm
            organizationId={org.id}
            gyms={(gymsQuery.data ?? []).map((g) => ({ id: g.id, name: g.name }))}
          />
          <section>
            <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" /> Organization Members
            </h2>
            {membersQuery.isLoading ? (
              <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6 text-sm text-on-surface-variant">
                Loading members...
              </div>
            ) : (membersQuery.data ?? []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-6 text-sm text-on-surface-variant">
                No org-level members yet. Gym staff are managed on individual gym pages.
              </div>
            ) : (
              <div className="rounded-xl border border-surface-container-high bg-surface-container-low overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-surface-container-high">
                      <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Name</th>
                      <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Email</th>
                      <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Role</th>
                      <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Status</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(membersQuery.data ?? []).map((m) => (
                      <tr
                        key={m.membership_id}
                        className="border-b border-surface-container-high/60 last:border-b-0"
                      >
                        <td className="px-6 py-4 text-on-surface font-medium">{m.full_name || '—'}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{m.email}</td>
                        <td className="px-6 py-4 text-on-surface">{m.role_label}</td>
                        <td className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                          {m.status}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/admin/users/${m.profile_id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-fixed"
                          >
                            View <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5" /> Owner Invites
            </h2>
            <InvitesTable
              invites={invitesQuery.data ?? []}
              loading={invitesQuery.isLoading}
            />
          </section>
        </>
      )}

      {tab === 'audit' && (
        <section>
          <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" /> Audit Log
          </h2>
          {auditQuery.isLoading ? (
            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6 text-sm text-on-surface-variant">
              Loading audit log...
            </div>
          ) : (auditQuery.data ?? []).length === 0 ? (
            <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-6 text-sm text-on-surface-variant">
              No activity recorded yet.
            </div>
          ) : (
            <div className="rounded-xl border border-surface-container-high bg-surface-container-low overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-container-high">
                    <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">When</th>
                    <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Action</th>
                    <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Entity</th>
                  </tr>
                </thead>
                <tbody>
                  {(auditQuery.data ?? []).map((log) => (
                    <tr key={log.id} className="border-b border-surface-container-high/60 last:border-b-0">
                      <td className="px-6 py-4 text-xs text-on-surface-variant">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-on-surface font-mono text-xs">{log.action}</td>
                      <td className="px-6 py-4 text-on-surface-variant text-xs">
                        {log.entity_table ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-5">
      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-bold flex items-center gap-1.5 mb-2">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold text-on-surface font-display">{value}</div>
    </div>
  );
}

function InvitesTable({
  invites,
  loading,
}: {
  invites: Array<{
    id: string;
    email: string;
    role_key: string;
    status: string;
    expires_at: string;
    token: string;
  }>;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6 text-sm text-on-surface-variant">
        Loading invites...
      </div>
    );
  }
  if (invites.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-6 text-sm text-on-surface-variant">
        No invites for this organization yet.
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-surface-container-high">
            <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Email</th>
            <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Role</th>
            <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Status</th>
            <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Expires</th>
            <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Token</th>
          </tr>
        </thead>
        <tbody>
          {invites.map((invite) => (
            <tr key={invite.id} className="border-b border-surface-container-high/60 last:border-b-0">
              <td className="px-6 py-4 text-sm text-on-surface">{invite.email}</td>
              <td className="px-6 py-4 text-xs text-on-surface-variant flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {invite.role_key}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                    INVITE_STATUS_STYLES[invite.status] ?? INVITE_STATUS_STYLES.expired
                  }`}
                >
                  {invite.status}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-on-surface-variant">
                {new Date(invite.expires_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-[10px] font-mono text-on-surface-variant break-all">
                {invite.token}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
