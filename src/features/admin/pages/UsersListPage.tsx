import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { ACCOUNT_TYPE_LABELS, type AdminAccountType } from '../../../services/adminUserService';

const ACCOUNT_TYPE_STYLES: Record<AdminAccountType, string> = {
  platform: 'bg-primary-container/20 text-primary border-primary/30',
  staff: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  student_portal: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  parent_portal: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
  no_access: 'bg-surface-container text-on-surface-variant border-surface-container-highest',
};

export default function UsersListPage() {
  const query = useAdminUsers();

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1200px] w-full mx-auto">
      <div className="border-b border-surface-container-high pb-6">
        <h1 className="font-display text-3xl font-bold text-on-surface">Users</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Every login account: platform team, gym staff, and student/parent portal users.
          Student records without a login live under each gym&apos;s Students page.
        </p>
      </div>

      {query.error && (
        <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {query.error instanceof Error ? query.error.message : 'Unable to load users.'}
        </div>
      )}

      {query.isLoading ? (
        <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          Loading users...
        </div>
      ) : (query.data ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          No profiles found.
        </div>
      ) : (
        <div className="rounded-xl border border-surface-container-high bg-surface-container-low overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-container-high">
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Name</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Email</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Account Type</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Platform Role</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Orgs</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Gyms</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Portal Links</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {(query.data ?? []).map((profile) => (
                <tr
                  key={profile.id}
                  className="border-b border-surface-container-high/60 last:border-b-0 hover:bg-surface-container/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-on-surface font-semibold">
                    {profile.full_name || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{profile.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        'inline-flex items-center border rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold ' +
                        ACCOUNT_TYPE_STYLES[profile.account_type]
                      }
                    >
                      {ACCOUNT_TYPE_LABELS[profile.account_type]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant">
                    {profile.platform_roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {profile.platform_roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center gap-1 bg-primary-container/20 text-primary border border-primary/30 px-2 py-1 rounded-full uppercase tracking-widest font-bold"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {role}
                          </span>
                        ))}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface">{profile.organization_count}</td>
                  <td className="px-6 py-4 text-xs text-on-surface">{profile.gym_count}</td>
                  <td className="px-6 py-4 text-xs text-on-surface">
                    {profile.student_link_count > 0 || profile.parent_link_count > 0 ? (
                      <span className="text-on-surface-variant">
                        {profile.student_link_count > 0 && `${profile.student_link_count} student`}
                        {profile.student_link_count > 0 && profile.parent_link_count > 0 && ' · '}
                        {profile.parent_link_count > 0 && `${profile.parent_link_count} parent`}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                    {profile.status}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/admin/users/${profile.id}`}
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
    </div>
  );
}
