import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Play,
  Undo2,
  UserX,
} from 'lucide-react';
import { useTenant } from '../../tenancy/TenantProvider';
import { useAuth } from '../../auth/AuthProvider';
import { useToast } from '../../../components/Toast';
import { DAY_LABELS, formatClassTime } from '../../../services/classService';
import type { ClassSessionWithTemplate } from '../../../services/attendanceService';
import type { Student } from '../../../services/studentService';
import { useStudentsQuery } from '../../students/hooks/useStudents';
import { useClassTemplatesQuery } from '../../classes/hooks/useClasses';
import {
  useCheckInStudent,
  useClassSessionsByDate,
  useEligibleStudents,
  useGetOrCreateSession,
  useMarkStudentAbsent,
  useSessionAttendance,
  useUndoCheckIn,
} from '../hooks/useAttendance';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function weekdayOf(dateISO: string): number {
  // Parse as local date (T00:00) so the weekday matches the selected calendar day.
  return new Date(`${dateISO}T00:00:00`).getDay();
}

export default function AttendancePage() {
  const { gymId: gymIdFromUrl } = useParams<{ gymId?: string }>();
  const { activeGym, activeOrganization } = useTenant();
  const gymId = activeGym?.gym.id ?? gymIdFromUrl;
  const orgId = activeOrganization?.organization.id ?? activeGym?.organizationId ?? null;

  const [date, setDate] = useState(todayISO());
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const sessionsQuery = useClassSessionsByDate(gymId, date);
  const templatesQuery = useClassTemplatesQuery(gymId);
  const createSession = useGetOrCreateSession();
  const toast = useToast();

  const sessions = sessionsQuery.data ?? [];
  const weekday = weekdayOf(date);

  // Templates scheduled on this weekday that don't have a session row yet.
  const pendingTemplates = useMemo(() => {
    const templates = templatesQuery.data ?? [];
    const sessionTemplateIds = new Set(
      sessions.map((s) => s.class_template_id).filter(Boolean),
    );
    return templates.filter(
      (t) => t.day_of_week === weekday && !sessionTemplateIds.has(t.id),
    );
  }, [templatesQuery.data, sessions, weekday]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) ?? null;

  async function handleStartSession(templateId: string, templateName: string) {
    try {
      const session = await createSession.mutateAsync({ classTemplateId: templateId, date });
      setSelectedSessionId(session.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to open the class.';
      toast.error(`Could not open ${templateName}`, message);
    }
  }

  const loading = sessionsQuery.isLoading || templatesQuery.isLoading;
  const nothingScheduled = !loading && sessions.length === 0 && pendingTemplates.length === 0;

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1400px] w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface">Attendance</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Check students in to classes at {activeGym?.gym.name ?? 'this gym'}.
          </p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setSelectedSessionId(null);
          }}
          className="bg-surface border border-surface-container-high rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
        />
      </div>

      {!gymId && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          Select a gym to manage attendance.
        </div>
      )}

      {sessionsQuery.isError && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          {sessionsQuery.error instanceof Error
            ? sessionsQuery.error.message
            : 'Attendance could not be loaded.'}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-on-surface-variant text-sm py-16">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading classes...
        </div>
      ) : nothingScheduled ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low px-6 py-16 text-center">
          <div className="text-sm font-semibold text-on-surface mb-1">
            No classes scheduled for this date.
          </div>
          <p className="text-xs text-on-surface-variant">
            {DAY_LABELS[weekday]} has no class templates. Add classes on the Classes page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          {/* Session list */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {DAY_LABELS[weekday]} · {sessions.length + pendingTemplates.length} classes
            </h3>

            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => setSelectedSessionId(session.id)}
                className={
                  'rounded-xl border p-4 text-left transition-colors flex items-center justify-between gap-3 ' +
                  (selectedSessionId === session.id
                    ? 'border-primary bg-surface-container'
                    : 'border-surface-container-high bg-surface-container-low hover:bg-surface-container/60')
                }
              >
                <div>
                  <div className="font-semibold text-on-surface">
                    {session.class_templates?.name ?? 'Class'}
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    {formatClassTime(session.start_time)} – {formatClassTime(session.end_time)}
                    {session.class_templates?.programs?.name
                      ? ` · ${session.class_templates.programs.name}`
                      : ''}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0" />
              </button>
            ))}

            {pendingTemplates.map((template) => (
              <div
                key={template.id}
                className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-semibold text-on-surface">{template.name}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    {formatClassTime(template.start_time)} – {formatClassTime(template.end_time)}
                    {template.programs?.name ? ` · ${template.programs.name}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={createSession.isPending}
                  onClick={() => void handleStartSession(template.id, template.name)}
                  className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary-container text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-md hover:brightness-110 transition-all disabled:opacity-60 shrink-0"
                >
                  <Play className="w-3 h-3" /> Open
                </button>
              </div>
            ))}
          </div>

          {/* Roster */}
          {selectedSession ? (
            <SessionRoster
              key={selectedSession.id}
              session={selectedSession}
              gymId={gymId!}
              orgId={orgId}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-16 text-center text-sm text-on-surface-variant">
              Open a class to take attendance.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type RosterProps = {
  session: ClassSessionWithTemplate;
  gymId: string;
  orgId: string | null;
};

function SessionRoster({ session, gymId, orgId }: RosterProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [showAllStudents, setShowAllStudents] = useState(false);

  const rosterQuery = useSessionAttendance(session.id);
  const eligibleQuery = useEligibleStudents(session.class_template_id);
  const allStudentsQuery = useStudentsQuery({
    gymId,
    enabled: showAllStudents,
  });

  const checkIn = useCheckInStudent();
  const markAbsent = useMarkStudentAbsent();
  const undo = useUndoCheckIn();

  const records = rosterQuery.data ?? [];
  const recordByStudent = useMemo(() => {
    const map = new Map<string, (typeof records)[number]>();
    for (const record of records) map.set(record.student_id, record);
    return map;
  }, [records]);

  const students = useMemo(() => {
    const base: Student[] = showAllStudents
      ? (allStudentsQuery.data ?? [])
      : (eligibleQuery.data ?? []);
    const byId = new Map(base.map((s) => [s.id, s]));
    // Always include students who already have a record for this session,
    // even if their enrollment was later removed.
    for (const record of records) {
      if (record.students && !byId.has(record.student_id)) {
        byId.set(record.student_id, record.students as unknown as Student);
      }
    }
    return Array.from(byId.values());
  }, [showAllStudents, allStudentsQuery.data, eligibleQuery.data, records]);

  const sessionOrgId = session.organization_id ?? orgId;
  const working = checkIn.isPending || markAbsent.isPending || undo.isPending;

  async function handleCheckIn(student: Student) {
    if (!sessionOrgId) {
      toast.error('Check-in failed', 'Organization context is missing for this session.');
      return;
    }
    try {
      await checkIn.mutateAsync({
        organizationId: sessionOrgId,
        gymId,
        classSessionId: session.id,
        classTemplateId: session.class_template_id,
        studentId: student.id,
        checkedInBy: user?.id ?? null,
      });
      toast.success('Checked in', `${student.first_name} ${student.last_name} is checked in.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to check in.';
      toast.error('Check-in failed', message);
    }
  }

  async function handleAbsent(student: Student) {
    if (!sessionOrgId) return;
    try {
      await markAbsent.mutateAsync({
        organizationId: sessionOrgId,
        gymId,
        classSessionId: session.id,
        classTemplateId: session.class_template_id,
        studentId: student.id,
        checkedInBy: user?.id ?? null,
      });
      toast.success('Marked absent', `${student.first_name} ${student.last_name} marked absent.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to mark absent.';
      toast.error('Update failed', message);
    }
  }

  async function handleUndo(studentId: string, recordId: string) {
    try {
      await undo.mutateAsync({
        attendanceRecordId: recordId,
        classSessionId: session.id,
        studentId,
      });
      toast.success('Check-in removed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to undo check-in.';
      toast.error('Undo failed', message);
    }
  }

  const loading = rosterQuery.isLoading || (showAllStudents ? allStudentsQuery.isLoading : eligibleQuery.isLoading);
  const checkedInCount = records.filter((r) => r.status === 'present' || r.status === 'late').length;

  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low overflow-hidden">
      <div className="px-6 py-4 border-b border-surface-container-high flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-primary" />
            {session.class_templates?.name ?? 'Class'} Roster
          </div>
          <div className="text-xs text-on-surface-variant mt-0.5">
            {checkedInCount} checked in
            {session.class_templates?.capacity != null &&
              ` · capacity ${session.class_templates.capacity}`}
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
          <input
            type="checkbox"
            checked={showAllStudents}
            onChange={(event) => setShowAllStudents(event.target.checked)}
            className="accent-[var(--color-primary,#22c55e)]"
          />
          All students
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-on-surface-variant text-sm py-12">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading roster...
        </div>
      ) : students.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-on-surface-variant">
          No students assigned to this class yet.
          <div className="text-xs mt-1 opacity-80">
            Assign students from their profile&apos;s Schedule tab, or tick “All students”.
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-surface-container">
          {students.map((student) => {
            const record = recordByStudent.get(student.id);
            return (
              <li key={student.id} className="px-6 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-on-surface truncate">
                    {student.first_name} {student.last_name}
                  </div>
                  {student.belt && (
                    <div className="text-xs text-on-surface-variant">{student.belt}</div>
                  )}
                </div>

                {record ? (
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={
                        'inline-flex items-center gap-1.5 border rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold ' +
                        (record.status === 'absent'
                          ? 'bg-red-500/10 text-red-300 border-red-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30')
                      }
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {record.status}
                    </span>
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => void handleUndo(student.id, record.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-error disabled:opacity-60"
                    >
                      <Undo2 className="w-3.5 h-3.5" /> Undo
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => void handleCheckIn(student)}
                      className="inline-flex items-center gap-1.5 bg-primary text-on-primary-fixed text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-md hover:brightness-110 transition-all disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Check In
                    </button>
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => void handleAbsent(student)}
                      className="inline-flex items-center gap-1.5 border border-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-md hover:text-error hover:border-error/40 transition-colors disabled:opacity-60"
                    >
                      <UserX className="w-3 h-3" /> Absent
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
