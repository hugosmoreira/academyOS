import { Link } from 'react-router-dom';
import {
  Award,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { useProfile } from '../../auth/ProfileProvider';
import { usePortalSummary } from '../hooks/usePortalSummary';
import type { LinkedStudent } from '../services/portalService';

const QUICK_LINKS = [
  { label: 'Schedule', icon: CalendarDays, path: '/portal/schedule' },
  { label: 'Attendance', icon: CalendarCheck, path: '/portal/attendance' },
  { label: 'Progress', icon: Sparkles, path: '/portal/progress' },
  { label: 'Profile', icon: User, path: '/portal/profile' },
  { label: 'Billing', icon: CreditCard, path: '/portal/billing' },
  { label: 'Waivers', icon: ShieldCheck, path: '/portal/waivers' },
];

export default function PortalDashboard() {
  const { user } = useAuth();
  const { profile, primaryRole } = useProfile();
  const summaryQuery = usePortalSummary();

  const greetingName = profile?.full_name?.split(' ')[0] || user?.email || 'Athlete';
  const students = summaryQuery.data?.linkedStudents ?? [];
  const isParent = primaryRole === 'parent' || (summaryQuery.data?.hasParentLink ?? false);

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-[1100px] w-full mx-auto">
      <div className="border-b border-surface-container-high pb-6">
        <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 flex items-center gap-1.5">
          {isParent ? <Users className="w-3 h-3 text-primary" /> : <User className="w-3 h-3 text-primary" />}
          {isParent ? 'Parent Portal' : 'Student Portal'}
        </div>
        <h1 className="font-display text-3xl font-bold text-on-surface">Welcome back, {greetingName}.</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {isParent
            ? 'View your linked children, their schedules, and the family account.'
            : 'Your upcoming classes, attendance, and account in one place.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.label}
            to={link.path}
            className="rounded-xl border border-surface-container-high bg-surface-container-low p-4 flex flex-col gap-2 hover:border-primary/40 hover:bg-surface-container transition-colors"
          >
            <link.icon className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-on-surface">{link.label}</span>
          </Link>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
            <Award className="w-5 h-5" />
            {isParent ? 'Your Athletes' : 'Your Profile'}
          </h2>
        </div>

        {summaryQuery.isLoading ? (
          <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6 text-sm text-on-surface-variant">
            Loading your portal...
          </div>
        ) : summaryQuery.error ? (
          <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
            {summaryQuery.error instanceof Error ? summaryQuery.error.message : 'Unable to load portal.'}
          </div>
        ) : students.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-8 text-center">
            <p className="text-sm text-on-surface-variant mb-3">
              We couldn&apos;t find a student or family linked to your account yet.
            </p>
            <p className="text-xs text-on-surface-variant/80">
              If your gym just added you, give it a minute and refresh. Otherwise reach out to
              your front desk so they can link your portal account.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StudentCard({ student }: { student: LinkedStudent }) {
  const initials = `${student.first_name?.[0] ?? ''}${student.last_name?.[0] ?? ''}`.toUpperCase();
  const beltLabel = [student.belt, student.stripes ? `${student.stripes} stripes` : null]
    .filter(Boolean)
    .join(' • ');

  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary-container/30 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
          {initials || 'AC'}
        </div>
        <div>
          <div className="text-base font-semibold text-on-surface">
            {student.first_name} {student.last_name}
          </div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mt-0.5">
            {student.link_source === 'self' ? 'You' : 'Your Athlete'}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-surface-container-high bg-surface p-3">
          <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Status</div>
          <div className="text-sm font-semibold text-on-surface">{student.status}</div>
        </div>
        <div className="rounded-lg border border-surface-container-high bg-surface p-3">
          <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Rank</div>
          <div className="text-sm font-semibold text-on-surface">{beltLabel || '—'}</div>
        </div>
      </div>
      <Link
        to="/portal/classes"
        className="inline-flex items-center justify-end gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-fixed"
      >
        View schedule <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
