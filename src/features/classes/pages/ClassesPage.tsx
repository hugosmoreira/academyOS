import { useMemo, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Archive,
  ArchiveRestore,
  CalendarDays,
  Filter,
  Loader2,
  Pencil,
  Plus,
} from 'lucide-react';
import { useTenant } from '../../tenancy/TenantProvider';
import { useToast } from '../../../components/Toast';
import { listGymMembers } from '../../../services/adminGymService';
import {
  type ClassTemplateWithRelations,
  DAY_LABELS,
  formatClassTime,
} from '../../../services/classService';
import { useProgramsQuery } from '../../programs/hooks/usePrograms';
import {
  useArchiveClassTemplate,
  useClassTemplatesQuery,
  useCreateClassTemplate,
  useRestoreClassTemplate,
  useUpdateClassTemplate,
} from '../hooks/useClasses';

type FormValues = {
  name: string;
  program_id: string;
  instructor_profile_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  capacity: string;
};

const EMPTY_FORM: FormValues = {
  name: '',
  program_id: '',
  instructor_profile_id: '',
  day_of_week: '1',
  start_time: '18:00',
  end_time: '19:00',
  capacity: '',
};

export default function ClassesPage() {
  const { gymId: gymIdFromUrl } = useParams<{ gymId?: string }>();
  const { activeGym, activeOrganization } = useTenant();
  const toast = useToast();
  const gymId = activeGym?.gym.id ?? gymIdFromUrl;
  const orgId = activeOrganization?.organization.id ?? activeGym?.organizationId;

  const [showInactive, setShowInactive] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClassTemplateWithRelations | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const classesQuery = useClassTemplatesQuery(gymId, showInactive);
  const programsQuery = useProgramsQuery(gymId);
  const staffQuery = useQuery({
    queryKey: ['gym', gymId, 'staff'],
    queryFn: () => listGymMembers(gymId!),
    enabled: Boolean(gymId),
  });

  const createMutation = useCreateClassTemplate();
  const updateMutation = useUpdateClassTemplate();
  const archiveMutation = useArchiveClassTemplate();
  const restoreMutation = useRestoreClassTemplate();

  const classes = classesQuery.data ?? [];
  const programs = programsQuery.data ?? [];
  const staff = staffQuery.data ?? [];
  const saving = createMutation.isPending || updateMutation.isPending;

  const classesByDay = useMemo(() => {
    const byDay = new Map<number, ClassTemplateWithRelations[]>();
    for (const cls of classes) {
      const day = cls.day_of_week ?? 0;
      const list = byDay.get(day) ?? [];
      list.push(cls);
      byDay.set(day, list);
    }
    return byDay;
  }, [classes]);

  function openCreate() {
    setEditing(null);
    setValues({ ...EMPTY_FORM, program_id: programs[0]?.id ?? '' });
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(cls: ClassTemplateWithRelations) {
    setEditing(cls);
    setValues({
      name: cls.name,
      program_id: cls.program_id ?? '',
      instructor_profile_id: cls.instructor_profile_id ?? '',
      day_of_week: String(cls.day_of_week ?? 1),
      start_time: cls.start_time?.slice(0, 5) ?? '18:00',
      end_time: cls.end_time?.slice(0, 5) ?? '19:00',
      capacity: cls.capacity != null ? String(cls.capacity) : '',
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const name = values.name.trim();
    if (!name) {
      setFormError('Class name is required.');
      return;
    }
    if (!values.start_time || !values.end_time) {
      setFormError('Start and end times are required.');
      return;
    }
    if (values.end_time <= values.start_time) {
      setFormError('End time must be after the start time.');
      return;
    }
    const capacity = values.capacity.trim() ? Math.max(0, Math.floor(Number(values.capacity))) : null;
    const payload = {
      name,
      program_id: values.program_id || null,
      instructor_profile_id: values.instructor_profile_id || null,
      day_of_week: Number(values.day_of_week),
      start_time: values.start_time,
      end_time: values.end_time,
      capacity,
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ classTemplateId: editing.id, data: payload });
        toast.success('Class updated', `${name} was saved.`);
      } else {
        if (!gymId || !orgId) throw new Error('Select a gym before creating a class.');
        await createMutation.mutateAsync({
          ...payload,
          organization_id: orgId,
          gym_id: gymId,
          status: 'active',
        });
        toast.success('Class created', `${name} is on the weekly schedule.`);
      }
      setFormOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save class.');
    }
  }

  async function handleArchiveToggle(cls: ClassTemplateWithRelations) {
    try {
      if (cls.status === 'active') {
        await archiveMutation.mutateAsync(cls.id);
        toast.success('Class deactivated', `${cls.name} was removed from the schedule.`);
      } else {
        await restoreMutation.mutateAsync(cls.id);
        toast.success('Class restored', `${cls.name} is back on the schedule.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update class.';
      toast.error('Update failed', message);
    }
  }

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1400px] w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface">Class Schedule</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Recurring weekly classes for {activeGym?.gym.name ?? 'this gym'}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowInactive((value) => !value)}
            className="flex items-center gap-2 border border-surface-container-high bg-transparent text-on-surface hover:bg-surface-container transition-colors px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold"
          >
            <Filter className="w-4 h-4" />
            {showInactive ? 'Hide Inactive' : 'Show Inactive'}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary-container text-on-primary-container hover:brightness-110 transition-colors px-4 py-2 rounded font-bold text-xs uppercase tracking-wider shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add Class
          </button>
        </div>
      </div>

      {!gymId && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          Select a gym to manage the class schedule.
        </div>
      )}

      {classesQuery.isError && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          {classesQuery.error instanceof Error
            ? classesQuery.error.message
            : 'Classes could not be loaded.'}
        </div>
      )}

      {classesQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 text-on-surface-variant text-sm py-16">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading classes...
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low px-6 py-16">
          <div className="flex flex-col items-center justify-center text-center text-on-surface-variant">
            <div className="w-12 h-12 rounded-full bg-surface-container border border-surface-container-high flex items-center justify-center mb-3">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-on-surface">
              No classes scheduled yet. Create your first class.
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 inline-flex items-center gap-2 bg-primary text-on-primary-fixed hover:brightness-110 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" /> Add Class
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {DAY_LABELS.map((dayLabel, dayIndex) => {
            const dayClasses = classesByDay.get(dayIndex) ?? [];
            if (dayClasses.length === 0) return null;
            return (
              <section key={dayLabel} className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {dayLabel}
                </h3>
                <div className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-surface-container">
                      {dayClasses.map((cls) => (
                        <tr key={cls.id} className="hover:bg-surface-container/30 transition-colors">
                          <td className="px-6 py-4 w-44 whitespace-nowrap text-on-surface font-semibold">
                            {formatClassTime(cls.start_time)} – {formatClassTime(cls.end_time)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-on-surface">{cls.name}</div>
                            <div className="text-xs text-on-surface-variant mt-0.5">
                              {cls.programs?.name ?? 'No program'}
                              {cls.capacity != null && ` · Capacity ${cls.capacity}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant">
                            {cls.profiles?.full_name || cls.profiles?.email || 'No instructor'}
                          </td>
                          <td className="px-6 py-4 w-28">
                            <span
                              className={
                                'inline-flex items-center border rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold ' +
                                (cls.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-surface-container text-on-surface-variant border-surface-container-highest')
                              }
                            >
                              {cls.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(cls)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleArchiveToggle(cls)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-error"
                              >
                                {cls.status === 'active' ? (
                                  <>
                                    <Archive className="w-3.5 h-3.5" /> Deactivate
                                  </>
                                ) : (
                                  <>
                                    <ArchiveRestore className="w-3.5 h-3.5" /> Restore
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl border border-surface-container-high bg-surface-container-low p-6 flex flex-col gap-4 my-8"
          >
            <h3 className="font-display text-xl font-bold text-on-surface">
              {editing ? `Edit ${editing.name}` : 'Add Class'}
            </h3>

            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Class Name
              <input
                value={values.name}
                onChange={(event) => setValues((v) => ({ ...v, name: event.target.value }))}
                placeholder="Adults BJJ Fundamentals"
                className="bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Program
                <select
                  value={values.program_id}
                  onChange={(event) => setValues((v) => ({ ...v, program_id: event.target.value }))}
                  className="bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
                >
                  <option value="">No program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Instructor
                <select
                  value={values.instructor_profile_id}
                  onChange={(event) =>
                    setValues((v) => ({ ...v, instructor_profile_id: event.target.value }))
                  }
                  className="bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
                >
                  <option value="">No instructor</option>
                  {staff.map((member) => (
                    <option key={member.profile_id} value={member.profile_id}>
                      {member.full_name || member.email}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Day
                <select
                  value={values.day_of_week}
                  onChange={(event) => setValues((v) => ({ ...v, day_of_week: event.target.value }))}
                  className="bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
                >
                  {DAY_LABELS.map((label, index) => (
                    <option key={label} value={index}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Start
                <input
                  type="time"
                  value={values.start_time}
                  onChange={(event) => setValues((v) => ({ ...v, start_time: event.target.value }))}
                  className="bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                End
                <input
                  type="time"
                  value={values.end_time}
                  onChange={(event) => setValues((v) => ({ ...v, end_time: event.target.value }))}
                  className="bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Capacity (optional)
              <input
                type="number"
                min={0}
                value={values.capacity}
                onChange={(event) => setValues((v) => ({ ...v, capacity: event.target.value }))}
                placeholder="Leave empty for unlimited"
                className="bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
              />
            </label>

            {formError && (
              <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
                {formError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-primary text-on-primary-fixed hover:brightness-110 px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider disabled:opacity-60"
              >
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Class'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
