import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useOrganizationsWithCounts } from '../hooks/useOrganizations';
import OrganizationsTable from '../components/OrganizationsTable';

export default function OrganizationsListPage() {
  const query = useOrganizationsWithCounts();

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1200px] w-full mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-surface-container-high pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-on-surface">Business Accounts</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Optional grouping for owners operating multiple gym locations.
          </p>
        </div>
        <Link
          to="/admin/gyms/new"
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-md hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> New Gym
        </Link>
      </div>

      {query.error && (
        <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {query.error instanceof Error ? query.error.message : 'Unable to load organizations.'}
        </div>
      )}

      <OrganizationsTable
        organizations={query.data ?? []}
        loading={query.isLoading}
      />
    </div>
  );
}
