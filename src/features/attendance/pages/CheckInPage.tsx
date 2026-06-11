import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, QrCode, Search, UserRound } from 'lucide-react';
import { useTenant } from '../../tenancy/TenantProvider';
import { useAuth } from '../../auth/AuthProvider';
import { useToast } from '../../../components/Toast';
import type { Student } from '../../../services/studentService';
import { DAY_LABELS, formatClassTime } from '../../../services/classService';
import { getOrCreateClassSession } from '../../../services/attendanceService';
import { useStudentsQuery } from '../../students/hooks/useStudents';
import { useStudentClassEnrollments } from '../../students/hooks/useEnrollments';
import { useCheckInStudent } from '../hooks/useAttendance';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CheckInPage() {
  const { gymId: gymIdFromUrl } = useParams<{ gymId?: string }>();
  const { activeGym, activeOrganization } = useTenant();
  const gymId = activeGym?.gym.id ?? gymIdFromUrl;
  const orgId = activeOrganization?.organization.id ?? activeGym?.organizationId ?? null;

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Student | null>(null);

  const studentsQuery = useStudentsQuery({
    gymId,
    search: search.trim() || undefined,
    limit: 12,
    enabled: Boolean(gymId) && search.trim().length > 0,
  });

  const students = studentsQuery.data ?? [];

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[800px] w-full mx-auto">
      <div>
        <h2 className="font-display text-3xl font-bold text-on-surface flex items-center gap-3">
          <QrCode className="w-7 h-7 text-primary" /> Check-in Member
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Find a student and check them in to one of today&apos;s classes at{' '}
          {activeGym?.gym.name ?? 'this gym'}.
        </p>
      </div>

      {!gymId && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          Select a gym to check members in.
        </div>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setSelected(null);
          }}
          placeholder="Search active students by name or email..."
          className="w-full bg-surface-container-low border border-surface-container-high rounded-xl pl-11 pr-4 py-3 text-base text-on-surface focus:border-primary focus:outline-none"
        />
      </div>

      {studentsQuery.isError && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          {studentsQuery.error instanceof Error
            ? studentsQuery.error.message
            : 'Students could not be loaded.'}
        </div>
      )}

      {search.trim() && studentsQuery.isLoading && (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Loader2 className="w-4 h-4 animate-spin" /> Searching...
        </div>
      )}

      {search.trim() && !studentsQuery.isLoading && students.length === 0 && (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-8 text-center text-sm text-on-surface-variant">
          No students match your search.
        </div>
      )}

      {!selected && students.length > 0 && (
        <ul className="flex flex-col gap-2">
          {students.map((student) => (
            <li key={student.id}>
              <button
                type="button"
                onClick={() => setSelected(student)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-surface-container-high bg-surface-container-low hover:bg-surface-container/60 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container-high border border-surface-container-highest flex items-center justify-center">
                  <UserRound className="w-5 h-5 text-on-surface-variant" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-on-surface truncate">
                    {student.first_name} {student.last_name}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {student.belt ?? 'No belt'} · {student.status}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && gymId && (
        <SelectedStudentCard
          student={selected}
          gymId={gymId}
          orgId={orgId}
          onDone={() => {
            setSelected(null);
            setSearch('');
          }}
          onBack={() => setSelected(null)}
        />
      )}
    </div>
  );
}

type CardProps = {
  student: Student;
  gymId: string;
  orgId: string | null;
  onDone: () => void;
  onBack: () => void;
};

function SelectedStudentCard({ student, gymId, orgId, onDone, onBack }: CardProps) {
  const { user } = useAuth();
  const toast = useToast();
  const checkIn = useCheckInStudent();
  const [creatingSession, setCreatingSession] = useState(false);

  const enrollmentsQuery = useStudentClassEnrollments(student.id);
  const today = new Date().getDay();

  const todaysClasses = useMemo(
    () =>
      (enrollmentsQuery.data ?? [])
        .filter((e) => e.class_templates && e.class_templates.day_of_week === today)
        .map((e) => e.class_templates!)
        .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? '')),
    [enrollmentsQuery.data, today],
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const working = creatingSession || checkIn.isPending;

  async function handleCheckIn(templateId: string, templateName: string) {
    const effectiveOrgId = student.organization_id ?? orgId;
    if (!effectiveOrgId) {
      toast.error('Check-in failed', 'Organization context is missing.');
      return;
    }
    setCreatingSession(true);
    try {
      const session = await getOrCreateClassSession(templateId, todayISO());
      await checkIn.mutateAsync({
        organizationId: effectiveOrgId,
        gymId,
        classSessionId: session.id,
        classTemplateId: templateId,
        studentId: student.id,
        checkedInBy: user?.id ?? null,
      });
      toast.success(
        'Checked in',
        `${student.first_name} ${student.last_name} → ${templateName}.`,
      );
      onDone();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to check in.';
      toast.error('Check-in failed', message);
    } finally {
      setCreatingSession(false);
    }
  }

  return (
    <div className="rounded-2xl border border-surface-container-high bg-surface-container-low p-6 flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-surface-container-high border border-surface-container-highest flex items-center justify-center">
          <UserRound className="w-7 h-7 text-on-surface-variant" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-xl font-bold text-on-surface">
            {student.first_name} {student.last_name}
          </div>
          <div className="text-sm text-on-surface-variant">
            {student.belt ?? 'No belt'}
            {student.stripes ? ` · ${student.stripes} stripes` : ''} · {student.status}
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface"
        >
          Back
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Today&apos;s classes ({DAY_LABELS[today]})
        </div>

        {enrollmentsQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading classes...
          </div>
        ) : todaysClasses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-surface-container-high bg-surface p-6 text-center text-sm text-on-surface-variant">
            This student has no classes assigned today. Assign classes from their profile&apos;s
            Schedule tab, or use the Attendance page with “All students”.
          </div>
        ) : todaysClasses.length === 1 ? (
          <button
            type="button"
            disabled={working}
            onClick={() => void handleCheckIn(todaysClasses[0].id, todaysClasses[0].name)}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary-fixed text-sm font-bold uppercase tracking-wider py-4 rounded-xl hover:brightness-110 transition-all disabled:opacity-60"
          >
            {working ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Check in to {todaysClasses[0].name} (
            {formatClassTime(todaysClasses[0].start_time)})
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            {todaysClasses.map((cls) => (
              <label
                key={cls.id}
                className={
                  'flex items-center justify-between gap-3 rounded-lg border p-4 cursor-pointer transition-colors ' +
                  (selectedTemplateId === cls.id
                    ? 'border-primary bg-surface-container'
                    : 'border-surface-container-high bg-surface hover:bg-surface-container/50')
                }
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="class"
                    checked={selectedTemplateId === cls.id}
                    onChange={() => setSelectedTemplateId(cls.id)}
                  />
                  <div>
                    <div className="font-semibold text-on-surface">{cls.name}</div>
                    <div className="text-xs text-on-surface-variant">
                      {formatClassTime(cls.start_time)} – {formatClassTime(cls.end_time)}
                    </div>
                  </div>
                </div>
              </label>
            ))}
            <button
              type="button"
              disabled={working || !selectedTemplateId}
              onClick={() => {
                const cls = todaysClasses.find((c) => c.id === selectedTemplateId);
                if (cls) void handleCheckIn(cls.id, cls.name);
              }}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary-fixed text-sm font-bold uppercase tracking-wider py-4 rounded-xl hover:brightness-110 transition-all disabled:opacity-60 mt-1"
            >
              {working ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Check In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
