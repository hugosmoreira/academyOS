import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Filter, Loader2, MoreVertical, Search, UserPlus, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { listGymMembers, type GymMemberRow } from '../services/adminGymService';
import { useTenant } from '../features/tenancy/TenantProvider';
import { labelForRole } from '../services/roleService';

function getInitials(member: GymMemberRow): string {
  const name = member.full_name?.trim();
  if (name) {
    const parts = name.split(/\s+/);
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || '??';
  }
  return member.email.slice(0, 2).toUpperCase();
}

function accessBadgeClass(roleKey: string): string {
  if (roleKey === 'gym_owner' || roleKey === 'organization_owner') {
    return 'border-primary/30 text-primary bg-primary/5';
  }
  if (roleKey === 'gym_admin' || roleKey === 'organization_admin') {
    return 'border-on-surface-variant/30 text-on-surface-variant bg-surface-container';
  }
  return 'border-on-surface-variant/30 text-on-surface-variant bg-surface-container';
}

export default function Instructors() {
  const { gymId: gymIdFromUrl } = useParams<{ gymId?: string }>();
  const { activeGym } = useTenant();
  const gymId = activeGym?.gym.id ?? gymIdFromUrl;
  const [search, setSearch] = useState('');

  const membersQuery = useQuery({
    queryKey: ['gym', gymId, 'staff'],
    queryFn: () => listGymMembers(gymId!),
    enabled: Boolean(gymId),
  });

  const members = useMemo(() => {
    const rows = membersQuery.data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((member) =>
      [member.full_name, member.email, member.role_label]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [membersQuery.data, search]);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-surface-container-high pb-6">
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface mb-1">Staff & Instructors</h2>
          <p className="text-sm text-on-surface-variant">
            Manage your team for {activeGym?.gym.name ?? 'this gym'}.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="flex items-center gap-2 bg-primary-container text-on-primary-container font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg opacity-60 cursor-not-allowed"
        >
          <UserPlus className="w-4 h-4" /> Invite Staff Member
        </button>
      </div>

      {!gymId && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100 mb-6">
          Select a gym to view staff members.
        </div>
      )}

      {membersQuery.isError && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200 mb-6">
          {membersQuery.error instanceof Error
            ? membersQuery.error.message
            : 'Unable to load staff for this gym.'}
        </div>
      )}

      <div className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden">
        <div className="p-4 border-b border-surface-container-high flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container/30">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-on-surface-variant" />
            <span className="text-sm text-on-surface-variant">All roles</span>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find by name..."
              className="bg-surface border border-surface-container-high rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none w-64 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container/50 border-b border-surface-container-high">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Member Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Access Level</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {membersQuery.isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <div className="flex items-center justify-center gap-2 text-on-surface-variant text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading staff...
                    </div>
                  </td>
                </tr>
              )}

              {!membersQuery.isLoading && members.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center text-on-surface-variant">
                      <UsersRound className="w-8 h-8 mb-3 opacity-60" />
                      <div className="text-sm font-semibold text-on-surface">No staff members yet. Invite your first staff member.</div>
                    </div>
                  </td>
                </tr>
              )}

              {members.map((member) => (
                <tr key={member.membership_id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-surface-container-high border border-surface-container-highest flex items-center justify-center font-bold text-on-surface-variant">
                        {getInitials(member)}
                      </div>
                      <div>
                        <div className="font-bold text-base text-on-surface">
                          {member.full_name ?? member.email}
                        </div>
                        <div className="text-sm text-on-surface-variant">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface">{member.role_label}</td>
                  <td className="px-6 py-5 text-sm capitalize text-on-surface">{member.status}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border rounded ${accessBadgeClass(member.role_key)}`}>
                      {labelForRole(member.role_key)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button type="button" className="text-on-surface-variant hover:text-on-surface p-1" aria-label="Actions">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
