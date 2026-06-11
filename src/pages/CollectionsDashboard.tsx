import { Download, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useTenant } from '../features/tenancy/TenantProvider';
import { getGymCollectionsSummary } from '../services/collectionsService';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function CollectionsDashboard() {
  const { gymId: gymIdFromUrl } = useParams<{ gymId?: string }>();
  const { activeGym } = useTenant();
  const gymId = activeGym?.gym.id ?? gymIdFromUrl;

  const summaryQuery = useQuery({
    queryKey: ['collections', gymId, 'summary'],
    queryFn: () => getGymCollectionsSummary(gymId!),
    enabled: Boolean(gymId),
  });

  const summary = summaryQuery.data;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-1">Collections Dashboard</h1>
          <p className="text-sm text-on-surface-variant">
            Past-due balances and failed payments for {activeGym?.gym.name ?? 'this gym'}.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="flex items-center gap-2 bg-surface text-on-surface border border-surface-container-highest opacity-60 cursor-not-allowed py-2 px-4 rounded-lg text-sm font-semibold"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {!gymId && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100 mb-6">
          Select a gym to view collections data.
        </div>
      )}

      {summaryQuery.isError && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200 mb-6">
          {summaryQuery.error instanceof Error
            ? summaryQuery.error.message
            : 'Unable to load collections for this gym.'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 shadow-sm">
          <div className="text-xs font-bold text-on-surface-variant mb-2">Total Past Due</div>
          <div className="text-4xl font-display font-bold text-on-surface">
            {summaryQuery.isLoading ? '—' : formatCurrency(summary?.pastDueTotalCents ?? 0)}
          </div>
        </div>
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 shadow-sm">
          <div className="text-xs font-bold text-on-surface-variant mb-2">Members in Arrears</div>
          <div className="text-4xl font-display font-bold text-on-surface">
            {summaryQuery.isLoading ? '—' : summary?.membersInArrears ?? 0}
          </div>
        </div>
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 shadow-sm">
          <div className="text-xs font-bold text-on-surface-variant mb-2">Open Invoices</div>
          <div className="text-4xl font-display font-bold text-primary">
            {summaryQuery.isLoading ? '—' : summary?.openInvoiceCount ?? 0}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-on-surface mb-6">Action Required</h2>

      {summaryQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading overdue accounts...
        </div>
      ) : (summary?.openInvoiceCount ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          No past-due student accounts.
        </div>
      ) : (
        <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6 text-sm text-on-surface-variant">
          {summary?.openInvoiceCount} open invoice{summary?.openInvoiceCount === 1 ? '' : 's'} need attention.
          Detailed invoice actions will appear here as billing workflows are expanded.
        </div>
      )}
    </div>
  );
}
