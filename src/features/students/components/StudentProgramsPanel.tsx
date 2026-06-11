import { useMemo, useState, type FormEvent } from 'react';
import { Award, Layers, Loader2, Plus, XCircle } from 'lucide-react';
import type { Student } from '../../../services/studentService';
import type { ProgramEnrollmentWithRelations } from '../../../services/studentEnrollmentService';
import { useToast } from '../../../components/Toast';
import { useProgramsQuery, useRanksQuery } from '../../programs/hooks/usePrograms';
import {
  useDeactivateProgramEnrollment,
  useEnrollStudentInProgram,
  useStudentProgramEnrollments,
  useUpdateProgramEnrollment,
} from '../hooks/useEnrollments';

type Props = {
  student: Student;
};

export default function StudentProgramsPanel({ student }: Props) {
  const toast = useToast();
  const enrollmentsQuery = useStudentProgramEnrollments(student.id);
  const programsQuery = useProgramsQuery(student.gym_id);
  const enroll = useEnrollStudentInProgram();
  const updateEnrollment = useUpdateProgramEnrollment();
  const deactivate = useDeactivateProgramEnrollment();

  const [formOpen, setFormOpen] = useState(false);
  const [programId, setProgramId] = useState('');
  const [rankId, setRankId] = useState('');
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [formError, setFormError] = useState<string | null>(null);

  const ranksQuery = useRanksQuery(programId || undefined);

  const enrollments = enrollmentsQuery.data ?? [];
  const programs = programsQuery.data ?? [];
  const ranks = ranksQuery.data ?? [];

  const availablePrograms = useMemo(() => {
    const enrolledProgramIds = new Set(enrollments.map((e) => e.program_id));
    return programs.filter((p) => !enrolledProgramIds.has(p.id));
  }, [programs, enrollments]);

  function openForm() {
    setProgramId(availablePrograms[0]?.id ?? '');
    setRankId('');
    setStartedAt(new Date().toISOString().slice(0, 10));
    setFormError(null);
    setFormOpen(true);
  }

  async function handleEnroll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!programId) {
      setFormError('Select a program.');
      return;
    }
    try {
      await enroll.mutateAsync({
        organization_id: student.organization_id,
        gym_id: student.gym_id,
        student_id: student.id,
        program_id: programId,
        rank_id: rankId || null,
        started_at: startedAt,
        status: 'active',
      });
      toast.success('Enrolled', 'Program enrollment was created.');
      setFormOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to enroll student.');
    }
  }

  async function handleRankChange(enrollmentId: string, newRankId: string) {
    try {
      await updateEnrollment.mutateAsync({
        id: enrollmentId,
        studentId: student.id,
        data: { rank_id: newRankId || null },
      });
      toast.success('Rank updated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update rank.';
      toast.error('Update failed', message);
    }
  }

  async function handleDeactivate(enrollmentId: string, programName: string) {
    try {
      await deactivate.mutateAsync({ id: enrollmentId, studentId: student.id });
      toast.success('Enrollment ended', `${programName} enrollment is now inactive.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to end enrollment.';
      toast.error('Update failed', message);
    }
  }

  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6 flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display text-lg font-bold text-on-surface mb-1 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Program Enrollments
          </h3>
          <p className="text-sm text-on-surface-variant max-w-xl">
            Programs this student trains in, with their current rank.
          </p>
        </div>
        <button
          type="button"
          onClick={openForm}
          className="flex items-center gap-2 bg-primary-container text-on-primary-container hover:brightness-110 transition-colors px-4 py-2 rounded font-bold text-xs uppercase tracking-wider shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Enroll in Program
        </button>
      </header>

      {enrollmentsQuery.isError && (
        <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {enrollmentsQuery.error instanceof Error
            ? enrollmentsQuery.error.message
            : 'Enrollments could not be loaded.'}
        </div>
      )}

      {enrollmentsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading enrollments...
        </div>
      ) : enrollments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-surface-container-high bg-surface p-8 text-center text-sm text-on-surface-variant">
          No program enrollment yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {enrollments.map((enrollment) => (
            <EnrollmentRow
              key={enrollment.id}
              enrollment={enrollment}
              onRankChange={handleRankChange}
              onDeactivate={handleDeactivate}
            />
          ))}
        </div>
      )}

      {formOpen && (
        <form
          onSubmit={handleEnroll}
          className="rounded-lg border border-surface-container-high bg-surface p-4 flex flex-col gap-4"
        >
          <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            New Enrollment
          </div>

          {availablePrograms.length === 0 ? (
            <div className="text-sm text-on-surface-variant">
              {programs.length === 0
                ? 'No programs exist for this gym yet. Create one on the Programs page first.'
                : 'This student is already enrolled in every active program.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Program
                <select
                  value={programId}
                  onChange={(event) => {
                    setProgramId(event.target.value);
                    setRankId('');
                  }}
                  className="bg-surface-container-low border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
                >
                  {availablePrograms.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Starting Rank
                <select
                  value={rankId}
                  onChange={(event) => setRankId(event.target.value)}
                  className="bg-surface-container-low border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
                >
                  <option value="">No rank</option>
                  {ranks.map((rank) => (
                    <option key={rank.id} value={rank.id}>
                      {rank.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Start Date
                <input
                  type="date"
                  value={startedAt}
                  onChange={(event) => setStartedAt(event.target.value)}
                  className="bg-surface-container-low border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
                />
              </label>
            </div>
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
            {availablePrograms.length > 0 && (
              <button
                type="submit"
                disabled={enroll.isPending}
                className="inline-flex items-center gap-2 bg-primary text-on-primary-fixed hover:brightness-110 px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider disabled:opacity-60"
              >
                {enroll.isPending ? 'Enrolling...' : 'Enroll'}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

type RowProps = {
  enrollment: ProgramEnrollmentWithRelations;
  onRankChange: (enrollmentId: string, rankId: string) => Promise<void>;
  onDeactivate: (enrollmentId: string, programName: string) => Promise<void>;
};

function EnrollmentRow({ enrollment, onRankChange, onDeactivate }: RowProps) {
  const ranksQuery = useRanksQuery(enrollment.program_id);
  const ranks = ranksQuery.data ?? [];
  const programName = enrollment.programs?.name ?? 'Program';

  return (
    <div className="rounded-lg border border-surface-container-high bg-surface p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1 min-w-[180px]">
        <div className="font-semibold text-on-surface">{programName}</div>
        <div className="text-xs text-on-surface-variant">
          Since {new Date(enrollment.started_at).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-on-surface-variant" />
        <select
          value={enrollment.rank_id ?? ''}
          onChange={(event) => void onRankChange(enrollment.id, event.target.value)}
          className="bg-surface-container-low border border-surface-container-high rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
        >
          <option value="">No rank</option>
          {ranks.map((rank) => (
            <option key={rank.id} value={rank.id}>
              {rank.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => void onDeactivate(enrollment.id, programName)}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-error"
      >
        <XCircle className="w-3.5 h-3.5" /> End Enrollment
      </button>
    </div>
  );
}
