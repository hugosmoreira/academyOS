import { useMemo } from 'react';
import { Award, Loader2, Sparkles } from 'lucide-react';
import { usePortalProgramEnrollments } from '../hooks/usePortalEnrollments';

export default function PortalProgressPage() {
  const { summaryQuery, enrollmentsQuery, students } = usePortalProgramEnrollments();
  const enrollments = enrollmentsQuery.data ?? [];

  const studentNames = useMemo(() => {
    const names = new Map<string, string>();
    for (const student of students) {
      names.set(student.id, `${student.first_name} ${student.last_name}`.trim());
    }
    return names;
  }, [students]);

  const loading = summaryQuery.isLoading || enrollmentsQuery.isLoading;
  const error = summaryQuery.error ?? enrollmentsQuery.error;

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-[900px] w-full mx-auto">
      <header className="border-b border-surface-container-high pb-6">
        <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-primary" /> My Progress
        </div>
        <h1 className="font-display text-3xl font-bold text-on-surface">Programs &amp; ranks</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Your active program enrollments and current rank in each.
        </p>
      </header>

      {error instanceof Error && (
        <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {error.message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading your progress...
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          No linked student records yet.
        </div>
      ) : enrollments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          No program enrollment yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="rounded-xl border border-surface-container-high bg-surface-container-low p-6"
            >
              <div className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2 flex items-center gap-1.5">
                <Award className="w-3 h-3 text-primary" />
                {enrollment.programs?.name ?? 'Program'}
                {students.length > 1 && (
                  <span className="opacity-70">
                    · {studentNames.get(enrollment.student_id) ?? ''}
                  </span>
                )}
              </div>
              {enrollment.ranks ? (
                <div
                  className="text-2xl font-display font-bold border border-surface-container-highest rounded-md inline-flex items-center gap-2 px-3 py-1 mb-3 text-on-surface"
                >
                  {enrollment.ranks.color && (
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-surface-container-highest"
                      style={{ backgroundColor: enrollment.ranks.color }}
                    />
                  )}
                  {enrollment.ranks.name}
                </div>
              ) : (
                <div className="text-sm text-on-surface-variant mb-3">No rank assigned yet.</div>
              )}
              <div className="text-sm text-on-surface-variant">
                Training since {new Date(enrollment.started_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
