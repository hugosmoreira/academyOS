import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import { useTenant } from '../../tenancy/TenantProvider';
import { gymPath } from '../../tenancy/gymPaths';
import StudentForm, { type StudentFormValues } from '../components/StudentForm';
import { useCreatePortalInvite, useCreateStudent } from '../hooks/useStudents';

export default function StudentCreatePage() {
  const { gymId: gymIdFromUrl } = useParams<{ gymId?: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { activeOrganization, activeGym } = useTenant();
  const [formError, setFormError] = useState<string | null>(null);

  const orgId = activeOrganization?.organization.id;
  const gymId = activeGym?.gym.id ?? gymIdFromUrl ?? null;

  const createMutation = useCreateStudent();
  const inviteMutation = useCreatePortalInvite();

  const backHref = gymId ? gymPath(gymId, 'students') : '/app/gym-selector';

  function studentProfilePath(studentId: string): string {
    if (!gymId) return '/app/gym-selector';
    return gymPath(gymId, `students/${studentId}`);
  }

  async function handleSubmit(values: StudentFormValues) {
    setFormError(null);
    try {
      if (!orgId || !gymId) {
        throw new Error('Select a gym before creating a student.');
      }
      if (values.send_portal_invite && !values.email.trim()) {
        throw new Error('Email is required when sending a portal invite.');
      }

      const created = await createMutation.mutateAsync({
        organization_id: orgId,
        gym_id: gymId,
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
          await inviteMutation.mutateAsync({ studentId: created.id, email: values.email });
          toast.success('Portal invite created', 'Open the student profile to copy the invite link.');
        } catch (inviteError) {
          const message = inviteError instanceof Error
            ? inviteError.message
            : 'Unable to create portal invite.';
          toast.error('Invite failed', message);
        }
      }

      navigate(studentProfilePath(created.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save student.';
      setFormError(message);
      toast.error('Save failed', message);
    }
  }

  return (
    <>
      <div className="p-8 flex flex-col gap-8 max-w-[1200px] w-full mx-auto">
        <Link
          to={backHref}
          className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors inline-flex items-center gap-1.5 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to students
        </Link>
        <header className="flex flex-col gap-3 border-b border-surface-container-high pb-6">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
            <UserPlus className="w-3 h-3 text-primary" /> New Student
          </div>
          <h1 className="font-display text-3xl font-bold text-on-surface">Add a student</h1>
          <p className="text-sm text-on-surface-variant">
            Create the student record. Portal access is optional and can be sent now or later.
          </p>
        </header>
        {!gymId && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
            Select a gym before creating a student.
          </div>
        )}
      </div>

      <StudentForm
        open
        mode="create"
        loading={createMutation.isPending || inviteMutation.isPending}
        error={formError}
        onClose={() => navigate(backHref)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
