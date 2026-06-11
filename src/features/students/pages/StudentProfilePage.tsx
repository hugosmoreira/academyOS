import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  CalendarCheck,
  CreditCard,
  FileText,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { gymPath } from '../../tenancy/gymPaths';
import StudentPortalAccessPanel from '../components/StudentPortalAccessPanel';
import StudentProgramsPanel from '../components/StudentProgramsPanel';
import StudentSchedulePanel from '../components/StudentSchedulePanel';
import { useStudentQuery } from '../hooks/useStudents';

type TabKey =
  | 'overview'
  | 'schedule'
  | 'attendance'
  | 'progress'
  | 'programs'
  | 'waivers'
  | 'billing'
  | 'notes'
  | 'portal';

const TABS: Array<{ key: TabKey; label: string; icon: typeof Award }> = [
  { key: 'overview', label: 'Overview', icon: UserIcon },
  { key: 'schedule', label: 'Schedule', icon: CalendarCheck },
  { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { key: 'progress', label: 'Progress', icon: Sparkles },
  { key: 'programs', label: 'Programs', icon: Award },
  { key: 'waivers', label: 'Waivers', icon: FileText },
  { key: 'billing', label: 'Billing', icon: CreditCard },
  { key: 'notes', label: 'Notes', icon: FileText },
  { key: 'portal', label: 'Portal Access', icon: ShieldCheck },
];

export default function StudentProfilePage() {
  const { studentId, gymId } = useParams<{ studentId: string; gymId?: string }>();
  const [tab, setTab] = useState<TabKey>('overview');
  const studentQuery = useStudentQuery(studentId);
  const student = studentQuery.data;

  const backHref = gymId ? gymPath(gymId, 'students') : '/app/gym-selector';

  if (studentQuery.isLoading) {
    return <div className="p-8 text-sm text-on-surface-variant">Loading student...</div>;
  }

  if (!student) {
    return (
      <div className="p-8 max-w-2xl">
        <Link
          to={backHref}
          className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to students
        </Link>
        <div className="mt-6 rounded-xl border border-error/30 bg-error-container/10 p-6 text-sm text-error">
          {studentQuery.error instanceof Error ? studentQuery.error.message : 'Student not found.'}
        </div>
      </div>
    );
  }

  const fullName = `${student.first_name} ${student.last_name}`.trim();

  return (
    <div className="p-8 flex flex-col gap-8 max-w-[1200px] w-full mx-auto">
      <Link
        to={backHref}
        className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors inline-flex items-center gap-1.5 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to students
      </Link>

      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-surface-container-high pb-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
            <UserIcon className="w-3 h-3 text-primary" /> Student
          </div>
          <h1 className="font-display text-3xl font-bold text-on-surface">{fullName}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
            <span className="uppercase tracking-widest font-bold">{student.status}</span>
            {student.belt && (
              <>
                <span className="w-1 h-1 rounded-full bg-on-surface-variant/50" />
                <span>
                  {student.belt}
                  {student.stripes ? ` • ${student.stripes} stripes` : ''}
                </span>
              </>
            )}
            {student.email && (
              <>
                <span className="w-1 h-1 rounded-full bg-on-surface-variant/50" />
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {student.email}
                </span>
              </>
            )}
            {student.phone && (
              <>
                <span className="w-1 h-1 rounded-full bg-on-surface-variant/50" />
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {student.phone}
                </span>
              </>
            )}
          </div>
        </div>
        <Link
          to={backHref}
          className="inline-flex items-center gap-2 bg-surface-container border border-surface-container-high text-on-surface text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-md hover:bg-surface-container-high transition-all"
        >
          <Pencil className="w-4 h-4" /> Edit from list
        </Link>
      </header>

      <nav className="flex flex-wrap gap-1 border-b border-surface-container-high">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              'px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2 ' +
              (tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface')
            }
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </nav>

      <section>
        {tab === 'overview' && <OverviewTab student={student} />}
        {tab === 'schedule' && <StudentSchedulePanel student={student} />}
        {tab === 'attendance' && <PlaceholderTab title="Attendance" />}
        {tab === 'progress' && <PlaceholderTab title="Progress" />}
        {tab === 'programs' && <StudentProgramsPanel student={student} />}
        {tab === 'waivers' && <PlaceholderTab title="Waivers" />}
        {tab === 'billing' && <PlaceholderTab title="Billing" />}
        {tab === 'notes' && <PlaceholderTab title="Notes" />}
        {tab === 'portal' && <StudentPortalAccessPanel student={student} />}
      </section>
    </div>
  );
}

function OverviewTab({ student }: { student: NonNullable<ReturnType<typeof useStudentQuery>['data']> }) {
  const dateFmt = (value: string | null) =>
    value ? new Date(value).toLocaleDateString() : '—';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoCard title="Contact">
        <Row label="Email" value={student.email ?? '—'} />
        <Row label="Phone" value={student.phone ?? '—'} />
        <Row label="Date of birth" value={dateFmt(student.birthdate)} />
      </InfoCard>
      <InfoCard title="Belt & Status">
        <Row label="Status" value={student.status} />
        <Row label="Belt" value={student.belt ?? '—'} />
        <Row label="Stripes" value={String(student.stripes ?? 0)} />
        <Row label="Joined" value={dateFmt(student.joined_at)} />
      </InfoCard>
    </div>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center">
      <h3 className="font-display text-lg font-bold text-on-surface mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant">
        {title} for this student will appear here once the module is wired in.
      </p>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6">
      <h3 className="font-display text-sm font-bold text-on-surface mb-4 uppercase tracking-wider">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="text-on-surface font-medium">{value}</span>
    </div>
  );
}
