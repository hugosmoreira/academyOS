import { useMemo, useState, type FormEvent } from 'react';
import { CalendarDays, Loader2, Plus, XCircle } from 'lucide-react';
import type { Student } from '../../../services/studentService';
import { DAY_LABELS, formatClassTime } from '../../../services/classService';
import { useToast } from '../../../components/Toast';
import { useClassTemplatesQuery } from '../../classes/hooks/useClasses';
import {
  useDeactivateClassEnrollment,
  useEnrollStudentInClass,
  useStudentClassEnrollments,
} from '../hooks/useEnrollments';

type Props = {
  student: Student;
};

export default function StudentSchedulePanel({ student }: Props) {
  const toast = useToast();
  const enrollmentsQuery = useStudentClassEnrollments(student.id);
  const classesQuery = useClassTemplatesQuery(student.gym_id);
  const enroll = useEnrollStudentInClass();
  const remove = useDeactivateClassEnrollment();

  const [formOpen, setFormOpen] = useState(false);
  const [classTemplateId, setClassTemplateId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const enrollments = enrollmentsQuery.data ?? [];
  const classes = classesQuery.data ?? [];

  const availableClasses = useMemo(() => {
    const assignedIds = new Set(enrollments.map((e) => e.class_template_id));
    return classes.filter((cls) => !assignedIds.has(cls.id));
  }, [classes, enrollments]);

  const sortedEnrollments = useMemo(
    () =>
      [...enrollments].sort((a, b) => {
        const dayA = a.class_templates?.day_of_week ?? 0;
        const dayB = b.class_templates?.day_of_week ?? 0;
        if (dayA !== dayB) return dayA - dayB;
        return (a.class_templates?.start_time ?? '').localeCompare(
          b.class_templates?.start_time ?? '',
        );
      }),
    [enrollments],
  );

  function openForm() {
    setClassTemplateId(availableClasses[0]?.id ?? '');
    setFormError(null);
    setFormOpen(true);
  }

  async function handleAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!classTemplateId) {
      setFormError('Select a class.');
      return;
    }
    try {
      await enroll.mutateAsync({
        organization_id: student.organization_id,
        gym_id: student.gym_id,
        student_id: student.id,
        class_template_id: classTemplateId,
        status: 'active',
      });
      toast.success('Class assigned', 'The class was added to this student\'s schedule.');
      setFormOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to assign class.');
    }
  }

  async function handleRemove(enrollmentId: string, className: string) {
    try {
      await remove.mutateAsync({ id: enrollmentId, studentId: student.id });
      toast.success('Class removed', `${className} was removed from the schedule.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to remove class.';
      toast.error('Update failed', message);
    }
  }

  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6 flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display text-lg font-bold text-on-surface mb-1 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" /> Weekly Schedule
          </h3>
          <p className="text-sm text-on-surface-variant max-w-xl">
            Recurring classes this student is assigned to. These appear in the student portal.
          </p>
        </div>
        <button
          type="button"
          onClick={openForm}
          className="flex items-center gap-2 bg-primary-container text-on-primary-container hover:brightness-110 transition-colors px-4 py-2 rounded font-bold text-xs uppercase tracking-wider shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Assign Class
        </button>
      </header>

      {enrollmentsQuery.isError && (
        <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {enrollmentsQuery.error instanceof Error
            ? enrollmentsQuery.error.message
            : 'Schedule could not be loaded.'}
        </div>
      )}

      {enrollmentsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading schedule...
        </div>
      ) : sortedEnrollments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-surface-container-high bg-surface p-8 text-center text-sm text-on-surface-variant">
          No classes assigned yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedEnrollments.map((enrollment) => {
            const cls = enrollment.class_templates;
            return (
              <div
                key={enrollment.id}
                className="rounded-lg border border-surface-container-high bg-surface p-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-1 min-w-[180px]">
                  <div className="font-semibold text-on-surface">{cls?.name ?? 'Class'}</div>
                  <div className="text-xs text-on-surface-variant">
                    {cls?.day_of_week != null ? DAY_LABELS[cls.day_of_week] : '—'} ·{' '}
                    {formatClassTime(cls?.start_time ?? null)} –{' '}
                    {formatClassTime(cls?.end_time ?? null)}
                    {cls?.programs?.name ? ` · ${cls.programs.name}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRemove(enrollment.id, cls?.name ?? 'Class')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-error"
                >
                  <XCircle className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <form
          onSubmit={handleAssign}
          className="rounded-lg border border-surface-container-high bg-surface p-4 flex flex-col gap-4"
        >
          <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Assign Class
          </div>

          {availableClasses.length === 0 ? (
            <div className="text-sm text-on-surface-variant">
              {classes.length === 0
                ? 'No classes exist for this gym yet. Create one on the Classes page first.'
                : 'This student is already assigned to every active class.'}
            </div>
          ) : (
            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Class
              <select
                value={classTemplateId}
                onChange={(event) => setClassTemplateId(event.target.value)}
                className="bg-surface-container-low border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
              >
                {availableClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.day_of_week != null ? `${DAY_LABELS[cls.day_of_week]} ` : ''}
                    {formatClassTime(cls.start_time)} — {cls.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {formError && (
            <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface"
            >
              Cancel
            </button>
            {availableClasses.length > 0 && (
              <button
                type="submit"
                disabled={enroll.isPending}
                className="inline-flex items-center gap-2 bg-primary text-on-primary-fixed hover:brightness-110 px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider disabled:opacity-60"
              >
                {enroll.isPending ? 'Assigning...' : 'Assign'}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
