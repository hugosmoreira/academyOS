import { useMemo } from 'react';
import { CalendarDays, Loader2 } from 'lucide-react';
import { DAY_LABELS, formatClassTime } from '../../../services/classService';
import { usePortalClassEnrollments } from '../hooks/usePortalEnrollments';

export default function PortalSchedulePage() {
  const { summaryQuery, enrollmentsQuery, students } = usePortalClassEnrollments();
  const enrollments = enrollmentsQuery.data ?? [];

  const studentNames = useMemo(() => {
    const names = new Map<string, string>();
    for (const student of students) {
      names.set(student.id, `${student.first_name} ${student.last_name}`.trim());
    }
    return names;
  }, [students]);

  const byDay = useMemo(() => {
    const map = new Map<number, typeof enrollments>();
    for (const enrollment of enrollments) {
      if (!enrollment.class_templates) continue;
      const day = enrollment.class_templates.day_of_week ?? 0;
      const list = map.get(day) ?? [];
      list.push(enrollment);
      map.set(day, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) =>
        (a.class_templates?.start_time ?? '').localeCompare(b.class_templates?.start_time ?? ''),
      );
    }
    return map;
  }, [enrollments]);

  const loading = summaryQuery.isLoading || enrollmentsQuery.isLoading;
  const error = summaryQuery.error ?? enrollmentsQuery.error;

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-[900px] w-full mx-auto">
      <header className="border-b border-surface-container-high pb-6">
        <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 flex items-center gap-1.5">
          <CalendarDays className="w-3 h-3 text-primary" /> My Schedule
        </div>
        <h1 className="font-display text-3xl font-bold text-on-surface">Weekly classes</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          The recurring classes you&apos;re enrolled in at your gym.
        </p>
      </header>

      {error instanceof Error && (
        <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {error.message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading your schedule...
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          We don&apos;t have any students linked to your account yet.
        </div>
      ) : enrollments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          No classes assigned yet.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {DAY_LABELS.map((dayLabel, dayIndex) => {
            const dayEnrollments = byDay.get(dayIndex) ?? [];
            if (dayEnrollments.length === 0) return null;
            return (
              <section key={dayLabel} className="flex flex-col gap-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {dayLabel}
                </h2>
                <div className="flex flex-col gap-2">
                  {dayEnrollments.map((enrollment) => {
                    const cls = enrollment.class_templates!;
                    return (
                      <div
                        key={enrollment.id}
                        className="rounded-xl border border-surface-container-high bg-surface-container-low p-4 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-semibold text-on-surface">{cls.name}</div>
                          <div className="text-xs text-on-surface-variant mt-0.5">
                            {cls.programs?.name ?? ''}
                            {students.length > 1 && (
                              <> · {studentNames.get(enrollment.student_id) ?? ''}</>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-on-surface font-semibold whitespace-nowrap">
                          {formatClassTime(cls.start_time)} – {formatClassTime(cls.end_time)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
