import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Award,
  Layers,
  Loader2,
  Pencil,
  Plus,
} from 'lucide-react';
import { gymPath } from '../../tenancy/gymPaths';
import { useToast } from '../../../components/Toast';
import { AGE_GROUP_LABELS, TRAINING_TYPE_LABELS } from '../../../services/programService';
import type { Rank } from '../../../services/rankService';
import {
  useArchiveRank,
  useCreateRank,
  useProgramQuery,
  useRanksQuery,
  useReorderRanks,
  useUpdateRank,
} from '../hooks/usePrograms';

type RankFormValues = {
  name: string;
  color: string;
  minimum_classes: string;
  minimum_months: string;
};

const EMPTY_RANK_FORM: RankFormValues = {
  name: '',
  color: '',
  minimum_classes: '',
  minimum_months: '',
};

export default function ProgramDetailPage() {
  const { gymId, programId } = useParams<{ gymId?: string; programId: string }>();
  const toast = useToast();

  const programQuery = useProgramQuery(programId);
  const ranksQuery = useRanksQuery(programId);
  const createRank = useCreateRank();
  const updateRank = useUpdateRank();
  const reorderRanks = useReorderRanks();
  const archiveRank = useArchiveRank();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Rank | null>(null);
  const [values, setValues] = useState<RankFormValues>(EMPTY_RANK_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const program = programQuery.data;
  const ranks = ranksQuery.data ?? [];
  const backHref = gymPath(gymId, 'programs');
  const saving = createRank.isPending || updateRank.isPending;
  const reordering = reorderRanks.isPending;

  function openCreate() {
    setEditing(null);
    setValues(EMPTY_RANK_FORM);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(rank: Rank) {
    setEditing(rank);
    setValues({
      name: rank.name,
      color: rank.color ?? '',
      minimum_classes: rank.minimum_classes != null ? String(rank.minimum_classes) : '',
      minimum_months: rank.minimum_months != null ? String(rank.minimum_months) : '',
    });
    setFormError(null);
    setFormOpen(true);
  }

  function parseOptionalInt(value: string): number | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!program || !programId) return;
    const name = values.name.trim();
    if (!name) {
      setFormError('Rank name is required.');
      return;
    }
    try {
      if (editing) {
        await updateRank.mutateAsync({
          rankId: editing.id,
          programId,
          data: {
            name,
            color: values.color.trim() || null,
            minimum_classes: parseOptionalInt(values.minimum_classes),
            minimum_months: parseOptionalInt(values.minimum_months),
          },
        });
        toast.success('Rank updated', `${name} was saved.`);
      } else {
        await createRank.mutateAsync({
          organization_id: program.organization_id,
          gym_id: program.gym_id,
          program_id: programId,
          name,
          color: values.color.trim() || null,
          order_index: ranks.length,
          minimum_classes: parseOptionalInt(values.minimum_classes),
          minimum_months: parseOptionalInt(values.minimum_months),
          status: 'active',
        });
        toast.success('Rank added', `${name} was added to ${program.name}.`);
      }
      setFormOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save rank.');
    }
  }

  async function handleMove(rank: Rank, direction: -1 | 1) {
    if (!programId) return;
    const index = ranks.findIndex((r) => r.id === rank.id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= ranks.length) return;
    const reordered = [...ranks];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    try {
      await reorderRanks.mutateAsync({
        programId,
        orderedRankIds: reordered.map((r) => r.id),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reorder ranks.';
      toast.error('Reorder failed', message);
    }
  }

  async function handleArchive(rank: Rank) {
    if (!programId) return;
    try {
      await archiveRank.mutateAsync({ rankId: rank.id, programId });
      toast.success('Rank archived', `${rank.name} is no longer selectable.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to archive rank.';
      toast.error('Archive failed', message);
    }
  }

  if (programQuery.isLoading) {
    return <div className="p-8 text-sm text-on-surface-variant">Loading program...</div>;
  }

  if (!program) {
    return (
      <div className="p-8 max-w-2xl">
        <Link
          to={backHref}
          className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to programs
        </Link>
        <div className="mt-6 rounded-xl border border-error/30 bg-error-container/10 p-6 text-sm text-error">
          {programQuery.error instanceof Error ? programQuery.error.message : 'Program not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-8 max-w-[1200px] w-full mx-auto">
      <Link
        to={backHref}
        className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors inline-flex items-center gap-1.5 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to programs
      </Link>

      <header className="flex flex-col gap-3 border-b border-surface-container-high pb-6">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
          <Layers className="w-3 h-3 text-primary" /> Program
        </div>
        <h1 className="font-display text-3xl font-bold text-on-surface">{program.name}</h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
          <span className="uppercase tracking-widest font-bold">{program.status}</span>
          {program.age_group && (
            <>
              <span className="w-1 h-1 rounded-full bg-on-surface-variant/50" />
              <span>{AGE_GROUP_LABELS[program.age_group]}</span>
            </>
          )}
          {program.training_type && (
            <>
              <span className="w-1 h-1 rounded-full bg-on-surface-variant/50" />
              <span>{TRAINING_TYPE_LABELS[program.training_type]}</span>
            </>
          )}
        </div>
        {program.description && (
          <p className="text-sm text-on-surface-variant max-w-2xl">{program.description}</p>
        )}
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
            <Award className="w-5 h-5" /> Ranks & Belts
          </h2>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary-container text-on-primary-container hover:brightness-110 transition-colors px-4 py-2 rounded font-bold text-xs uppercase tracking-wider shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Rank
          </button>
        </div>

        {ranksQuery.isError && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
            {ranksQuery.error instanceof Error
              ? ranksQuery.error.message
              : 'Ranks could not be loaded.'}
          </div>
        )}

        {ranksQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading ranks...
          </div>
        ) : ranks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
            No ranks yet. Add the first rank for this program (e.g. White Belt).
          </div>
        ) : (
          <div className="rounded-xl border border-surface-container-high bg-surface-container-low overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container/50 border-b border-surface-container-high">
                <tr>
                  <th className="text-xs text-on-surface-variant px-6 py-3 uppercase tracking-wider font-semibold w-24">Order</th>
                  <th className="text-xs text-on-surface-variant px-6 py-3 uppercase tracking-wider font-semibold">Rank</th>
                  <th className="text-xs text-on-surface-variant px-6 py-3 uppercase tracking-wider font-semibold">Min. Classes</th>
                  <th className="text-xs text-on-surface-variant px-6 py-3 uppercase tracking-wider font-semibold">Min. Months</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {ranks.map((rank, index) => (
                  <tr key={rank.id} className="hover:bg-surface-container/30 transition-colors">
                    <td className="px-6 py-3">
                      <div className="inline-flex items-center gap-1">
                        <span className="text-on-surface-variant w-6">{index + 1}</span>
                        <button
                          type="button"
                          disabled={index === 0 || reordering}
                          onClick={() => void handleMove(rank, -1)}
                          className="p-1 text-on-surface-variant hover:text-on-surface disabled:opacity-30"
                          aria-label={`Move ${rank.name} up`}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === ranks.length - 1 || reordering}
                          onClick={() => void handleMove(rank, 1)}
                          className="p-1 text-on-surface-variant hover:text-on-surface disabled:opacity-30"
                          aria-label={`Move ${rank.name} down`}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {rank.color && (
                          <span
                            className="w-3 h-3 rounded-full border border-surface-container-highest"
                            style={{ backgroundColor: rank.color }}
                          />
                        )}
                        <span className="font-semibold text-on-surface">{rank.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-on-surface-variant">
                      {rank.minimum_classes ?? '—'}
                    </td>
                    <td className="px-6 py-3 text-on-surface-variant">
                      {rank.minimum_months ?? '—'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(rank)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleArchive(rank)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-error"
                        >
                          <Archive className="w-3.5 h-3.5" /> Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl border border-surface-container-high bg-surface-container-low p-6 flex flex-col gap-4"
          >
            <h3 className="font-display text-xl font-bold text-on-surface">
              {editing ? `Edit ${editing.name}` : `Add Rank to ${program.name}`}
            </h3>

            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Name
              <input
                value={values.name}
                onChange={(event) => setValues((v) => ({ ...v, name: event.target.value }))}
                placeholder="White Belt"
                className="bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Color (optional)
              <input
                value={values.color}
                onChange={(event) => setValues((v) => ({ ...v, color: event.target.value }))}
                placeholder="#FFFFFF or white"
                className="bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Minimum Classes
                <input
                  type="number"
                  min={0}
                  value={values.minimum_classes}
                  onChange={(event) =>
                    setValues((v) => ({ ...v, minimum_classes: event.target.value }))
                  }
                  placeholder="Optional"
                  className="bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Minimum Months
                <input
                  type="number"
                  min={0}
                  value={values.minimum_months}
                  onChange={(event) =>
                    setValues((v) => ({ ...v, minimum_months: event.target.value }))
                  }
                  placeholder="Optional"
                  className="bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface normal-case font-normal tracking-normal focus:outline-none focus:border-primary"
                />
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
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Rank'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
