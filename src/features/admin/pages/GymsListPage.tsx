import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Plus } from 'lucide-react';
import { useAllGymsWithContext } from '../hooks/useAdminGyms';

export default function GymsListPage() {
  const query = useAllGymsWithContext();

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1200px] w-full mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-surface-container-high pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-on-surface">All Gyms</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Every gym location across the platform.
          </p>
        </div>
        <Link
          to="/admin/gyms/new"
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-md hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Gym
        </Link>
      </div>

      {query.error && (
        <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {query.error instanceof Error ? query.error.message : 'Unable to load gyms.'}
        </div>
      )}

      {query.isLoading ? (
        <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          Loading gyms...
        </div>
      ) : (query.data ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          No gyms have been provisioned yet.
        </div>
      ) : (
        <div className="rounded-xl border border-surface-container-high bg-surface-container-low overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-container-high">
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Gym</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Business Account</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Location</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Students</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Staff</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {(query.data ?? []).map((gym) => (
                <tr
                  key={gym.id}
                  className="border-b border-surface-container-high/60 last:border-b-0 hover:bg-surface-container/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-on-surface">
                    <Link to={`/admin/gyms/${gym.id}`} className="hover:text-primary">
                      <div className="font-semibold">{gym.name}</div>
                      <div className="text-xs text-on-surface-variant font-mono">{gym.slug}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {gym.organization_name ? (
                      <Link
                        to={`/admin/organizations/${gym.organization_id}`}
                        className="inline-flex items-center gap-1.5 text-primary hover:text-primary-fixed"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        {gym.organization_name}
                      </Link>
                    ) : (
                      <span className="text-on-surface-variant">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant">
                    {[gym.city, gym.region].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface">{gym.student_count}</td>
                  <td className="px-6 py-4 text-xs text-on-surface">{gym.member_count}</td>
                  <td className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                    {gym.status}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/admin/gyms/${gym.id}`}
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
