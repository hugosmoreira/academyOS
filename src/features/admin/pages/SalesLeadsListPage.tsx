import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Inbox, Mail, Phone, Building2 } from 'lucide-react';
import { useSalesLeads } from '../hooks/useSalesLeads';
import type { SalesLeadStatus } from '../../../types/database';

const STATUS_FILTERS: Array<{ key: SalesLeadStatus | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'demo_scheduled', label: 'Demo Scheduled' },
  { key: 'converted', label: 'Converted' },
  { key: 'lost', label: 'Lost' },
];

const STATUS_STYLES: Record<SalesLeadStatus, string> = {
  new: 'bg-primary/15 text-primary border border-primary/30',
  contacted: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
  demo_scheduled: 'bg-blue-500/10 text-blue-300 border border-blue-500/30',
  converted: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  lost: 'bg-surface-container-high text-on-surface-variant border border-surface-container-highest',
};

export default function SalesLeadsListPage() {
  const [status, setStatus] = useState<SalesLeadStatus | 'all'>('all');
  const query = useSalesLeads({ status });

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1200px] w-full mx-auto">
      <div className="flex flex-col gap-2 border-b border-surface-container-high pb-6">
        <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold flex items-center gap-1.5">
          <Inbox className="w-3 h-3 text-primary" /> Sales Pipeline
        </div>
        <h1 className="font-display text-3xl font-bold text-on-surface">Sales Leads</h1>
        <p className="text-sm text-on-surface-variant">
          Inbound requests from the Book a Demo form. Convert qualified leads into organizations.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatus(f.key)}
            className={
              'px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ' +
              (status === f.key
                ? 'bg-primary text-on-primary-fixed'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface border border-surface-container-high')
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {query.error && (
        <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {query.error instanceof Error ? query.error.message : 'Unable to load sales leads.'}
        </div>
      )}

      <div className="rounded-xl border border-surface-container-high bg-surface-container-low overflow-hidden">
        {query.isLoading ? (
          <div className="p-6 text-sm text-on-surface-variant">Loading leads...</div>
        ) : (query.data ?? []).length === 0 ? (
          <div className="p-10 text-center text-sm text-on-surface-variant">
            No sales leads in this view yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-bold border-b border-surface-container-high">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Academy</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Received</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(query.data ?? []).map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-surface-container-high last:border-b-0 hover:bg-surface-container/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-on-surface">{lead.full_name}</div>
                  </td>
                  <td className="px-5 py-4 text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5" />
                      {lead.academy_name || '—'}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-on-surface-variant">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" /> {lead.email}
                      </span>
                      {lead.phone && (
                        <span className="flex items-center gap-2 text-xs">
                          <Phone className="w-3.5 h-3.5" /> {lead.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        'px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest ' +
                        STATUS_STYLES[lead.status]
                      }
                    >
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-on-surface-variant text-xs">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/admin/sales-leads/${lead.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-fixed"
                    >
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
