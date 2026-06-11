import {
  Plus, Users, UserPlus, UserMinus, TrendingUp,
  Building2, Layers, ClipboardList
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '../services/dashboardService';
import { useTenant } from '../features/tenancy/TenantProvider';
import { gymPath } from '../features/tenancy/gymPaths';

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US').format(value);
}

export default function Dashboard() {
  const { gymId: gymIdFromUrl } = useParams<{ gymId?: string }>();
  const { activeGym } = useTenant();
  const gymId = activeGym?.gym.id ?? gymIdFromUrl;

  const metricsQuery = useQuery({
    queryKey: ['dashboard', 'metrics', gymId ?? 'none'],
    queryFn: () => getDashboardMetrics(gymId!),
    enabled: Boolean(gymId),
    staleTime: 60_000,
  });

  const metrics = metricsQuery.data;

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
      {metricsQuery.isError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          Live metrics could not be loaded. Check the browser console for the Supabase error.
        </div>
      )}
      {!gymId && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          Select a gym to view dashboard metrics.
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-2 gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface">Overview</h2>
          <p className="text-secondary mt-1">Here's what's happening at your academy today.</p>
        </div>
        <Link to={gymPath(gymId, 'students')} className="bg-primary-container text-on-primary-container font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-lg hover:brightness-110 transition-all flex items-center gap-2">
           <Plus className="w-5 h-5" />
           NEW MEMBER
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-xs text-secondary uppercase tracking-wider font-semibold">Active Students</span>
            <Users className="w-5 h-5 text-tertiary" />
          </div>
          <div className="flex items-baseline gap-3">
             <span className="font-display text-4xl font-bold text-on-surface">{formatNumber(metrics?.activeStudents ?? 0)}</span>
             <span className="text-sm font-medium text-emerald-500 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" /> live
             </span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-xs text-secondary uppercase tracking-wider font-semibold">New This Month</span>
            <UserPlus className="w-5 h-5 text-tertiary" />
          </div>
          <div className="flex items-baseline gap-3">
             <span className="font-display text-4xl font-bold text-on-surface">{formatNumber(metrics?.newStudentsThisMonth ?? 0)}</span>
             <span className="text-sm font-medium text-on-surface-variant">students</span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-xs text-secondary uppercase tracking-wider font-semibold">Total Students</span>
            <UserMinus className="w-5 h-5 text-tertiary" />
          </div>
          <div className="flex items-baseline gap-3">
             <span className="font-display text-4xl font-bold text-on-surface">{formatNumber(metrics?.totalStudents ?? 0)}</span>
             <span className="text-sm font-medium text-on-surface-variant">all-time</span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs text-primary uppercase tracking-wider font-semibold">Location</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="font-display text-2xl font-bold text-primary truncate">{activeGym?.gym.name ?? '—'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Programs</span>
            <div className="font-display text-2xl font-bold text-on-surface mt-1">{formatNumber(metrics?.totalPrograms)}</div>
          </div>
          <Layers className="w-6 h-6 text-secondary" />
        </div>
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Classes Today</span>
            <div className="font-display text-2xl font-bold text-on-surface mt-1">{formatNumber(metrics?.classesToday)}</div>
          </div>
          <Building2 className="w-6 h-6 text-secondary" />
        </div>
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Checked In Today</span>
            <div className="font-display text-2xl font-bold text-on-surface mt-1">{formatNumber(metrics?.checkedInToday)}</div>
          </div>
          <ClipboardList className="w-6 h-6 text-secondary" />
        </div>
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Attendance This Week</span>
            <div className="font-display text-2xl font-bold text-on-surface mt-1">{formatNumber(metrics?.attendanceThisWeek)}</div>
          </div>
          <ClipboardList className="w-6 h-6 text-secondary" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 min-h-[200px] flex flex-col">
          <h3 className="text-xl font-bold text-on-surface mb-4">Membership Growth</h3>
          <div className="flex-1 rounded-xl border border-dashed border-surface-container-high bg-surface-container/30 p-8 flex items-center justify-center text-sm text-on-surface-variant text-center">
            Membership trends are not available yet.
          </div>
        </div>
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 min-h-[200px] flex flex-col">
          <h3 className="text-xl font-bold text-on-surface mb-4">Upcoming Classes</h3>
          <div className="flex-1 rounded-xl border border-dashed border-surface-container-high bg-surface-container/30 p-8 flex items-center justify-center text-sm text-on-surface-variant text-center">
            No upcoming classes scheduled.
          </div>
        </div>
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 min-h-[200px] flex flex-col">
          <h3 className="text-xl font-bold text-on-surface mb-4">Recent Activity</h3>
          <div className="flex-1 rounded-xl border border-dashed border-surface-container-high bg-surface-container/30 p-8 flex items-center justify-center text-sm text-on-surface-variant text-center">
            No recent activity to show.
          </div>
        </div>
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 min-h-[200px] flex flex-col">
          <h3 className="text-xl font-bold text-on-surface mb-4">Birthdays This Week</h3>
          <div className="flex-1 rounded-xl border border-dashed border-surface-container-high bg-surface-container/30 p-8 flex items-center justify-center text-sm text-on-surface-variant text-center">
            No birthdays this week.
          </div>
        </div>
      </div>
    </div>
  );
}
