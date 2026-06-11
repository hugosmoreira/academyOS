import { useMemo } from 'react';
import { CalendarCheck, Loader2 } from 'lucide-react';
import { usePortalAttendance } from '../hooks/usePortalEnrollments';

const STATUS_STYLES: Record<string, string> = {
  present: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  late: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  absent: 'bg-red-500/10 text-red-300 border-red-500/30',
  excused: 'bg-surface-container text-on-surface-variant border-surface-container-highest',
};

export default function PortalAttendancePage() {
  const { summaryQuery, attendanceQuery, students } = usePortalAttendance();
  const entries = attendanceQuery.data ?? [];

  const studentNames = useMemo(() => {
    const names = new Map<string, string>();
    for (const student of students) {
      names.set(student.id, `${student.first_name} ${student.last_name}`.trim());
    }
    return names;
  }, [students]);

  const attendedTotal = entries.filter(
    (e) => e.status === 'present' || e.status === 'late',
  ).length;

  const byProgram = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of entries) {
      if (entry.status !== 'present' && entry.status !== 'late') continue;
      const program = entry.class_sessions?.class_templates?.programs?.name ?? 'Other';
      counts.set(program, (counts.get(program) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const loading = summaryQuery.isLoading || attendanceQuery.isLoading;
  const error = summaryQuery.error ?? attendanceQuery.error;

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-[900px] w-full mx-auto">
      <header className="border-b border-surface-container-high pb-6">
        <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 flex items-center gap-1.5">
          <CalendarCheck className="w-3 h-3 text-primary" /> My Attendance
        </div>
        <h1 className="font-display text-3xl font-bold text-on-surface">Training history</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Your check-ins at the gym, most recent first.
        </p>
      </header>

      {error instanceof Error && (
        <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {error.message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading your attendance...
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          We don&apos;t have any students linked to your account yet.
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          No attendance records yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Classes Attended
              </div>
              <div className="font-display text-4xl font-bold text-on-surface">{attendedTotal}</div>
            </div>
            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                By Program
              </div>
              {byProgram.length === 0 ? (
                <div className="text-sm text-on-surface-variant">—</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {byProgram.map(([program, count]) => (
                    <div key={program} className="flex items-center justify-between text-sm">
                      <span className="text-on-surface">{program}</span>
                      <span className="text-on-surface-variant font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-surface-container-high bg-surface-container-low overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container/50 border-b border-surface-container-high">
                <tr>
                  <th className="text-xs text-on-surface-variant px-5 py-3 uppercase tracking-wider font-semibold">Date</th>
                  <th className="text-xs text-on-surface-variant px-5 py-3 uppercase tracking-wider font-semibold">Class</th>
                  {students.length > 1 && (
                    <th className="text-xs text-on-surface-variant px-5 py-3 uppercase tracking-wider font-semibold">Student</th>
                  )}
                  <th className="text-xs text-on-surface-variant px-5 py-3 uppercase tracking-wider font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-5 py-3 text-on-surface whitespace-nowrap">
                      {entry.class_sessions?.session_date
                        ? new Date(`${entry.class_sessions.session_date}T00:00:00`).toLocaleDateString()
                        : new Date(entry.checked_in_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-on-surface">
                      {entry.class_sessions?.class_templates?.name ?? '—'}
                    </td>
                    {students.length > 1 && (
                      <td className="px-5 py-3 text-on-surface-variant">
                        {studentNames.get(entry.student_id) ?? '—'}
                      </td>
                    )}
                    <td className="px-5 py-3">
                      <span
                        className={
                          'inline-flex items-center border rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold ' +
                          (STATUS_STYLES[entry.status] ?? STATUS_STYLES.excused)
                        }
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
