import { useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Archive, ArchiveRestore, Filter, Layers, Loader2, Pencil, Plus } from 'lucide-react';
import { useTenant } from '../../tenancy/TenantProvider';
import { gymPath } from '../../tenancy/gymPaths';
import { useToast } from '../../../components/Toast';
import {
  AGE_GROUP_LABELS,
  TRAINING_TYPE_LABELS,
  type Program,
} from '../../../services/programService';
import type { ProgramAgeGroup, ProgramTrainingType } from '../../../types/database';
import {
  useArchiveProgram,
  useCreateProgram,
  useProgramsQuery,
  useRestoreProgram,
  useUpdateProgram,
} from '../hooks/usePrograms';

type FormValues = {
  name: string;
  description: string;
  age_group: '' | ProgramAgeGroup;
  training_type: '' | ProgramTrainingType;
};

const EMPTY_FORM: FormValues = { name: '', description: '', age_group: '', training_type: '' };

export default function ProgramsPage() {
  const { gymId: gymIdFromUrl } = useParams<{ gymId?: string }>();
  const { activeGym, activeOrganization } = useTenant();
  const toast = useToast();
  const gymId = activeGym?.gym.id ?? gymIdFromUrl;
  const orgId = activeOrganization?.organization.id ?? activeGym?.organizationId;

  const [showInactive, setShowInactive] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const programsQuery = useProgramsQuery(gymId, showInactive);
  const createMutation = useCreateProgram();
  const updateMutation = useUpdateProgram();
  const archiveMutation = useArchiveProgram();
  const restoreMutation = useRestoreProgram();

  const programs = useMemo(() => programsQuery.data ?? [], [programsQuery.data]);
  const saving = createMutation.isPending || updateMutation.isPending;

  function openCreate() {
    setEditing(null);
    setValues(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(program: Program) {
    setEditing(program);
    setValues({
      name: program.name,
      description: program.description ?? '',
      age_group: program.age_group ?? '',
      training_type: program.training_type ?? '',
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const name = values.name.trim();
    if (!name) {
      setFormError('Program name is required.');
      return;
    }
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          programId: editing.id,
          data: {
            name,
            description: values.description.trim() || null,
            age_group: values.age_group || null,
            training_type: values.training_type || null,
          },
        });
        toast.success('Program updated', `${name} was saved.`);
      } else {
        if (!gymId || !orgId) throw new Error('Select a gym before creating a program.');
        await createMutation.mutateAsync({
          organization_id: orgId,
          gym_id: gymId,
          name,
          description: values.description.trim() || null,
          age_group: values.age_group || null,
          training_type: values.training_type || null,
          status: 'active',
        });
        toast.success('Program created', `${name} is ready. Add ranks from its detail page.`);
      }
      setFormOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save program.');
    }
  }

  async function handleArchiveToggle(program: Program) {
    try {
      if (program.status === 'active') {
        await archiveMutation.mutateAsync(program.id);
        toast.success('Program deactivated', `${program.name} is now inactive.`);
      } else {
        await restoreMutation.mutateAsync(program.id);
        toast.success('Program restored', `${program.name} is active again.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update program.';
      toast.error('Update failed', message);
    }
  }

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1400px] w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface">Programs</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Training programs for {activeGym?.gym.name ?? 'this gym'}. Each program holds its own ranks.
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
            Create Program
          </button>
        </div>
      </div>

      {!gymId && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          Select a gym to manage programs.
        </div>
      )}

      {programsQuery.isError && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          {programsQuery.error instanceof Error
            ? programsQuery.error.message
            : 'Programs could not be loaded.'}
        </div>
      )}

      <div className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container/50 border-b border-surface-container-high">
              <tr>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Program</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Age Group</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Training Type</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Status</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {programsQuery.isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <div className="flex items-center justify-center gap-2 text-on-surface-variant text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading programs...
                    </div>
                  </td>
                </tr>
              )}

              {!programsQuery.isLoading && programs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center text-on-surface-variant">
                      <div className="w-12 h-12 rounded-full bg-surface-container border border-surface-container-high flex items-center justify-center mb-3">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-semibold text-on-surface">
                        No programs configured yet. Create your first program.
                      </div>
                      <button
                        type="button"
                        onClick={openCreate}
                        className="mt-4 inline-flex items-center gap-2 bg-primary text-on-primary-fixed hover:brightness-110 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create Program
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      to={gymPath(gymId, `programs/${program.id}`)}
                      className="font-semibold text-on-surface hover:text-primary transition-colors"
                    >
                      {program.name}
                    </Link>
                    {program.description && (
                      <div className="text-xs text-on-surface-variant mt-1 line-clamp-1">
                        {program.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {program.age_group ? AGE_GROUP_LABELS[program.age_group] : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {program.training_type ? TRAINING_TYPE_LABELS[program.training_type] : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        'inline-flex items-center border rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold ' +
                        (program.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-surface-container text-on-surface-variant border-surface-container-highest')
                      }
                    >
                      {program.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(program)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleArchiveToggle(program)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-error"
                      >
                        {program.status === 'active' ? (
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
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl border border-surface-container-high bg-surface-container-low p-6 flex flex-col gap-4"
          >
            <h3 className="font-display text-xl font-bold text-on-surface">
              {editing ? `Edit ${editing.name}` : 'Create Program'}
            </h3>

            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Name
              <input
                value={values.name}
                onChange={(event) => setValues((v) => ({ ...v, name: event.target.value }))}
                placeholder="Adults BJJ"
                className="bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Description
              <textarea
                value={values.description}
                onChange={(event) => setValues((v) => ({ ...v, description: event.target.value }))}
                rows={3}
                placeholder="Fundamentals and advanced Brazilian Jiu-Jitsu."
                className="bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary resize-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Age Group
                <select
                  value={values.age_group}
                  onChange={(event) =>
                    setValues((v) => ({ ...v, age_group: event.target.value as FormValues['age_group'] }))
                  }
                  className="bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
                >
                  <option value="">Not set</option>
                  {(Object.keys(AGE_GROUP_LABELS) as ProgramAgeGroup[]).map((key) => (
                    <option key={key} value={key}>
                      {AGE_GROUP_LABELS[key]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Training Type
                <select
                  value={values.training_type}
                  onChange={(event) =>
                    setValues((v) => ({
                      ...v,
                      training_type: event.target.value as FormValues['training_type'],
                    }))
                  }
                  className="bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
                >
                  <option value="">Not set</option>
                  {(Object.keys(TRAINING_TYPE_LABELS) as ProgramTrainingType[]).map((key) => (
                    <option key={key} value={key}>
                      {TRAINING_TYPE_LABELS[key]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

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
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Program'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
