import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { OrganizationListRow } from '../services/adminService';

type OrganizationsTableProps = {
  organizations: OrganizationListRow[];
  loading?: boolean;
  emptyMessage?: string;
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  suspended: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
  archived: 'bg-surface-container-high text-on-surface-variant border border-surface-container-highest',
};

export default function OrganizationsTable({
  organizations,
  loading,
  emptyMessage = 'No organizations yet. Provision one to get started.',
}: OrganizationsTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
        Loading organizations...
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-surface-container-high">
            <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Organization</th>
            <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Slug</th>
            <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Status</th>
            <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Gyms</th>
            <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Members</th>
            <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Created</th>
            <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <tr
              key={org.id}
              className="border-b border-surface-container-high/60 last:border-b-0 hover:bg-surface-container/40 transition-colors"
            >
              <td className="px-6 py-4 text-sm font-semibold text-on-surface">{org.name}</td>
              <td className="px-6 py-4 text-xs text-on-surface-variant font-mono">{org.slug}</td>
              <td className="px-6 py-4">
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                    STATUS_STYLES[org.status] ?? STATUS_STYLES.archived
                  }`}
                >
                  {org.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-on-surface">{org.gym_count}</td>
              <td className="px-6 py-4 text-sm text-on-surface">{org.member_count}</td>
              <td className="px-6 py-4 text-xs text-on-surface-variant">
                {new Date(org.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  to={`/admin/organizations/${org.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-fixed"
                >
                  Manage <ArrowRight className="w-3 h-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
