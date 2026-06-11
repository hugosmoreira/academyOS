import { CalendarCheck, Loader2 } from 'lucide-react';
import type { Student } from '../../../services/studentService';
import { useStudentAttendance } from '../../attendance/hooks/useAttendance';

const STATUS_STYLES: Record<string, string> = {
  present: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  late: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  absent: 'bg-red-500/10 text-red-300 border-red-500/30',
  excused: 'bg-surface-container text-on-surface-variant border-surface-container-highest',
};

type Props = {
  student: Student;
};

export default function StudentAttendancePanel({ student }: Props) {
  const attendanceQuery = useStudentAttendance(student.id);
  const entries = attendanceQuery.data ?? [];
  const attendedCount = entries.filter(
    (e) => e.status === 'present' || e.status === 'late',
  ).length;

  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6 flex flex-col gap-6">
      <header>
        <h3 className="font-display text-lg font-bold text-on-surface mb-1 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-primary" /> Attendance History
        </h3>
        <p className="text-sm text-on-surface-variant">
          {entries.length > 0
            ? `${attendedCount} classes attended (showing the most recent ${entries.length} records).`
            : 'Check-ins recorded for this student.'}
        </p>
      </header>

      {attendanceQuery.isError && (
        <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {attendanceQuery.error instanceof Error
            ? attendanceQuery.error.message
            : 'Attendance could not be loaded.'}
        </div>
      )}

      {attendanceQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading attendance...
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-surface-container-high bg-surface p-8 text-center text-sm text-on-surface-variant">
          No attendance records yet.
        </div>
      ) : (
        <div className="rounded-lg border border-surface-container-high bg-surface overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container/50 border-b border-surface-container-high">
              <tr>
                <th className="text-xs text-on-surface-variant px-5 py-3 uppercase tracking-wider font-semibold">Date</th>
                <th className="text-xs text-on-surface-variant px-5 py-3 uppercase tracking-wider font-semibold">Class</th>
                <th className="text-xs text-on-surface-variant px-5 py-3 uppercase tracking-wider font-semibold">Instructor</th>
                <th className="text-xs text-on-surface-variant px-5 py-3 uppercase tracking-wider font-semibold">Status</th>
                <th className="text-xs text-on-surface-variant px-5 py-3 uppercase tracking-wider font-semibold">Checked In</th>
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
                  <td className="px-5 py-3 text-on-surface-variant">
                    {entry.class_sessions?.class_templates?.profiles?.full_name ?? '—'}
                  </td>
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
                  <td className="px-5 py-3 text-on-surface-variant whitespace-nowrap">
                    {new Date(entry.checked_in_at).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
