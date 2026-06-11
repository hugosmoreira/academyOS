import { useState } from 'react';
import {
  Filter, Plus, MoreVertical, Eye, Pencil, ArchiveRestore, Trash2, Loader2, Users as UsersIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useArchiveStudent,
  useCreateStudent,
  useCreatePortalInvite,
  useRestoreStudent,
  useStudentsQuery,
  useUpdateStudent,
  StudentForm,
} from '../features/students';
import type { StudentFormValues } from '../features/students/components/StudentForm';
import type { Student } from '../services/studentService';
import { useTenant } from '../features/tenancy/TenantProvider';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { gymPath } from '../features/tenancy/gymPaths';

type ActionMenuState = { id: string; x: number; y: number } | null;
type DialogMode = 'create' | 'edit' | null;
type ViewState = { open: boolean; student: Student | null };

const BELT_BADGE: Record<string, { text: string; bg: string; border: string }> = {
  White: { text: 'text-on-surface', bg: 'bg-on-surface/5', border: 'border-on-surface' },
  Blue: { text: 'text-[#2196F3]', bg: 'bg-[#2196F3]/10', border: 'border-[#2196F3]' },
  Purple: { text: 'text-[#9C27B0]', bg: 'bg-[#9C27B0]/10', border: 'border-[#9C27B0]' },
  Brown: { text: 'text-[#8B5A2B]', bg: 'bg-[#8B5A2B]/10', border: 'border-[#8B5A2B]' },
  Black: { text: 'text-on-surface', bg: 'bg-on-surface/5', border: 'border-on-surface' },
};

function getBeltBadge(belt: string | null) {
  return BELT_BADGE[belt ?? 'White'] ?? BELT_BADGE.White;
}

function getInitials(student: Student): string {
  return `${student.first_name?.[0] ?? ''}${student.last_name?.[0] ?? ''}`.toUpperCase() || '??';
}

export default function People() {
  const toast = useToast();
  const navigate = useNavigate();
  const { activeOrganization, activeGym } = useTenant();

  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editing, setEditing] = useState<Student | null>(null);
  const [viewing, setViewing] = useState<ViewState>({ open: false, student: null });
  const [confirmArchive, setConfirmArchive] = useState<Student | null>(null);
  const [actionMenu, setActionMenu] = useState<ActionMenuState>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const orgIdFromTenant = activeOrganization?.organization.id;
  const gymIdFromTenant = activeGym?.gym.id;
  const canInsert = Boolean(orgIdFromTenant && gymIdFromTenant);

  const studentsQuery = useStudentsQuery({
    organizationId: orgIdFromTenant,
    gymId: gymIdFromTenant,
    includeArchived: showArchived,
    search,
    enabled: Boolean(gymIdFromTenant),
  });

  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const archiveMutation = useArchiveStudent();
  const restoreMutation = useRestoreStudent();
  const invitePortalMutation = useCreatePortalInvite();

  const students = studentsQuery.data ?? [];

  function closeForm() {
    setDialogMode(null);
    setEditing(null);
    setFormError(null);
  }

  function openCreate() {
    if (!canInsert || !gymIdFromTenant) {
      toast.error(
        'No gym selected',
        'Select a gym before adding students.',
      );
      return;
    }
    navigate(gymPath(gymIdFromTenant, 'students/new'));
  }

  function openEdit(student: Student) {
    setEditing(student);
    setDialogMode('edit');
    setActionMenu(null);
  }

  function openView(student: Student) {
    setActionMenu(null);
    navigate(buildStudentProfilePath(activeGym?.gym.id, student.id));
  }

  async function handleSubmit(values: StudentFormValues) {
    setFormError(null);
    try {
      if (dialogMode === 'create') {
        if (!orgIdFromTenant || !gymIdFromTenant) {
          throw new Error('Select a gym before creating a student.');
        }
        if (values.send_portal_invite && !values.email.trim()) {
          throw new Error('Email is required when sending a portal invite.');
        }
        const created = await createMutation.mutateAsync({
          organization_id: orgIdFromTenant,
          gym_id: gymIdFromTenant,
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email || null,
          phone: values.phone || null,
          birthdate: values.birthdate || null,
          belt: values.belt,
          stripes: values.stripes,
          status: values.status,
          portal_access_enabled: false,
        });
        toast.success('Student added', `${values.first_name} ${values.last_name} was created.`);

        if (values.send_portal_invite) {
          try {
            await invitePortalMutation.mutateAsync({
              studentId: created.id,
              email: values.email,
            });
            toast.success('Portal invite created', 'Open the student profile to copy the invite link.');
            navigate(buildStudentProfilePath(activeGym?.gym.id, created.id));
            closeForm();
            return;
          } catch (inviteError) {
            const message = inviteError instanceof Error
              ? inviteError.message
              : 'Unable to create portal invite.';
            toast.error('Invite failed', message);
          }
        }
      } else if (dialogMode === 'edit' && editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          input: {
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email || null,
            phone: values.phone || null,
            birthdate: values.birthdate || null,
            belt: values.belt,
            stripes: values.stripes,
            status: values.status,
          },
        });
        toast.success('Student updated', `${values.first_name} ${values.last_name} saved.`);
      }
      closeForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save student.';
      setFormError(message);
      toast.error('Save failed', message);
    }
  }

  function buildStudentProfilePath(gymId: string | undefined, studentId: string): string {
    if (!gymId) return '/app/gym-selector';
    return gymPath(gymId, `students/${studentId}`);
  }

  async function handleArchive() {
    if (!confirmArchive) return;
    try {
      await archiveMutation.mutateAsync(confirmArchive.id);
      toast.success('Student archived', `${confirmArchive.first_name} ${confirmArchive.last_name} is now inactive.`);
      setConfirmArchive(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to archive student.';
      toast.error('Archive failed', message);
    }
  }

  async function handleRestore(student: Student) {
    try {
      await restoreMutation.mutateAsync(student.id);
      toast.success('Student restored', `${student.first_name} ${student.last_name} is active again.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to restore student.';
      toast.error('Restore failed', message);
    }
  }

  const totalShown = students.length;

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1400px] w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface">People & Students</h2>
          <p className="text-sm text-on-surface-variant mt-1">Manage your roster, track progression, and view attendance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
            className="bg-surface border border-surface-container-high rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary w-56"
          />
          <button
            type="button"
            onClick={() => setShowArchived((value) => !value)}
            className="flex items-center gap-2 border border-surface-container-high bg-transparent text-on-surface hover:bg-surface-container transition-colors px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold"
          >
            <Filter className="w-4 h-4" />
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary-container text-on-primary-container hover:brightness-110 transition-colors px-4 py-2 rounded font-bold text-xs uppercase tracking-wider shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add Student
          </button>
        </div>
      </div>

      {studentsQuery.isError && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          Live student data could not be loaded. Check the browser console for the Supabase error.
        </div>
      )}

      {!gymIdFromTenant && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          Select a gym to view and manage students.
        </div>
      )}

      <div className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container/50 border-b border-surface-container-high">
              <tr>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Student Name</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Contact</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Belt / Stripes</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Status</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {studentsQuery.isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <div className="flex items-center justify-center gap-2 text-on-surface-variant text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading students...
                    </div>
                  </td>
                </tr>
              )}

              {!studentsQuery.isLoading && students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center text-on-surface-variant">
                      <div className="w-12 h-12 rounded-full bg-surface-container border border-surface-container-high flex items-center justify-center mb-3">
                        <UsersIcon className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-semibold text-on-surface">No students yet. Add your first student.</div>
                      <button
                        type="button"
                        onClick={openCreate}
                        className="mt-4 inline-flex items-center gap-2 bg-primary text-on-primary-fixed hover:brightness-110 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Student
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {students.map((student) => {
                const badge = getBeltBadge(student.belt ?? 'White');
                const isArchived = student.status === 'archived';
                return (
                  <tr
                    key={student.id}
                    className="hover:bg-surface-container/30 transition-colors group cursor-pointer"
                    onClick={() => openView(student)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {student.avatar_url ? (
                          <img src={student.avatar_url} alt={`${student.first_name} ${student.last_name}`} className="w-10 h-10 rounded-full object-cover border border-surface-variant" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center border border-surface-variant">
                            <span className="text-sm font-medium text-on-surface">{getInitials(student)}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-base text-on-surface font-medium group-hover:text-primary transition-colors">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-sm text-on-surface-variant">{student.email ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{student.phone ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 border ${badge.border} ${badge.text} px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${badge.bg}`}>
                        <span>{student.belt ?? 'White'} Belt</span>
                        <span className="opacity-70">• {student.stripes} stripes</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${isArchived ? 'bg-red-500' : student.status === 'active' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                        <span className={`text-sm capitalize ${isArchived ? 'text-red-400 font-medium' : 'text-on-surface'}`}>
                          {student.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                      <div className="relative inline-flex">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            const rect = event.currentTarget.getBoundingClientRect();
                            setActionMenu(
                              actionMenu?.id === student.id
                                ? null
                                : { id: student.id, x: rect.right, y: rect.bottom },
                            );
                          }}
                          className="text-on-surface-variant hover:text-primary transition-colors p-1"
                          aria-label="Open actions"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {actionMenu?.id === student.id && (
                          <div
                            className="absolute right-0 top-8 z-30 w-44 rounded-md border border-surface-container-high bg-surface-container-low shadow-xl py-1"
                            onMouseLeave={() => setActionMenu(null)}
                          >
                            <button
                              type="button"
                              onClick={() => openView(student)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-container"
                            >
                              <Eye className="w-4 h-4" /> View
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(student)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-container"
                            >
                              <Pencil className="w-4 h-4" /> Edit
                            </button>
                            {isArchived ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setActionMenu(null);
                                  void handleRestore(student);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-container"
                              >
                                <ArchiveRestore className="w-4 h-4" /> Restore
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setActionMenu(null);
                                  setConfirmArchive(student);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" /> Archive
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-surface-container-high px-6 py-4 bg-surface-container/20 flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">
            Showing {totalShown} student{totalShown === 1 ? '' : 's'}
            {orgIdFromTenant && activeGym ? ` for ${activeGym.gym.name}` : ''}
          </p>
          {studentsQuery.isFetching && !studentsQuery.isLoading && (
            <span className="text-xs text-on-surface-variant flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...</span>
          )}
        </div>
      </div>

      <StudentForm
        open={dialogMode !== null}
        mode={dialogMode === 'edit' ? 'edit' : 'create'}
        initial={editing}
        loading={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirmArchive !== null}
        title={confirmArchive ? `Archive ${confirmArchive.first_name} ${confirmArchive.last_name}?` : 'Archive student?'}
        description="The student will be marked as archived. You can restore them later from the archived view."
        confirmLabel="Archive"
        loading={archiveMutation.isPending}
        destructive
        onConfirm={handleArchive}
        onCancel={() => setConfirmArchive(null)}
      />

      {viewing.open && viewing.student && (
        <StudentDetailDrawer
          student={viewing.student}
          onEdit={() => {
            const target = viewing.student!;
            setViewing({ open: false, student: null });
            openEdit(target);
          }}
          onClose={() => setViewing({ open: false, student: null })}
        />
      )}
    </div>
  );
}

function StudentDetailDrawer({
  student,
  onClose,
  onEdit,
}: {
  student: Student;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="relative ml-auto h-full w-full max-w-md bg-surface-container-low border-l border-surface-container-high shadow-2xl flex flex-col">
        <header className="flex items-center justify-between px-6 py-5 border-b border-surface-container-high">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Student Details</h2>
            <p className="text-xs text-on-surface-variant mt-1">Read-only view of the live record.</p>
          </div>
          <button onClick={onClose} type="button" aria-label="Close drawer" className="text-on-surface-variant hover:text-on-surface">
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <div className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">Name</div>
            <div className="text-on-surface font-medium">{student.first_name} {student.last_name}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">Email</div>
            <div className="text-on-surface">{student.email ?? '—'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">Phone</div>
            <div className="text-on-surface">{student.phone ?? '—'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">Belt / Stripes</div>
            <div className="text-on-surface">{student.belt ?? 'White'} Belt — {student.stripes} stripes</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">Status</div>
            <div className="text-on-surface capitalize">{student.status}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">Joined</div>
            <div className="text-on-surface">
              {student.joined_at ?? new Date(student.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-container-high">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
            Close
          </button>
          <button type="button" onClick={onEdit} className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md bg-primary text-on-primary-fixed hover:brightness-110">
            Edit
          </button>
        </footer>
      </aside>
    </div>
  );
}
