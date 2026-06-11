import { Link } from 'react-router-dom';
import { Building2, MapPin, Users, Mail, Plus, ArrowRight, ShieldCheck, Inbox } from 'lucide-react';
import { useAdminStats } from '../hooks/useAdminStats';
import { useRecentOrganizations } from '../hooks/useOrganizations';
import AdminStatCard from '../components/AdminStatCard';
import OrganizationsTable from '../components/OrganizationsTable';

export default function AdminDashboard() {
  const statsQuery = useAdminStats();
  const recentQuery = useRecentOrganizations(5);

  const statsLoading = statsQuery.isLoading;
  const stats = statsQuery.data;

  return (
    <div className="p-8 flex flex-col gap-8 max-w-[1200px] w-full mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-surface-container-high pb-6">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-primary" /> Platform Admin
          </div>
          <h1 className="font-display text-3xl font-bold text-on-surface">Welcome back</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Provision new gyms, monitor activity, and manage owner invites.
          </p>
        </div>
        <Link
          to="/admin/gyms/new"
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-md hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Gym
        </Link>
      </div>

      {statsQuery.error && (
        <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {statsQuery.error instanceof Error ? statsQuery.error.message : 'Unable to load stats.'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <AdminStatCard
          label="Gyms"
          value={stats?.totalGyms ?? 0}
          icon={MapPin}
          loading={statsLoading}
        />
        <AdminStatCard
          label="Business Accounts"
          value={stats?.totalOrganizations ?? 0}
          hint={`${stats?.activeOrganizations ?? 0} active`}
          icon={Building2}
          loading={statsLoading}
        />
        <AdminStatCard
          label="Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          loading={statsLoading}
        />
        <AdminStatCard
          label="Pending Invites"
          value={stats?.pendingInvites ?? 0}
          icon={Mail}
          loading={statsLoading}
        />
        <AdminStatCard
          label="New Sales Leads"
          value={stats?.newSalesLeads ?? 0}
          hint={`${stats?.openSalesLeads ?? 0} open`}
          icon={Inbox}
          loading={statsLoading}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-on-surface">Recent Organizations</h2>
          <Link
            to="/admin/organizations"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-fixed"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <OrganizationsTable
          organizations={recentQuery.data ?? []}
          loading={recentQuery.isLoading}
        />
      </div>
    </div>
  );
}
