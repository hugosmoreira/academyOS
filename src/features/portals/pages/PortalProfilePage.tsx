import { Award, Mail, Phone, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { useProfile } from '../../auth/ProfileProvider';
import { usePortalSummary } from '../hooks/usePortalSummary';

export default function PortalProfilePage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const summaryQuery = usePortalSummary();
  const student = summaryQuery.data?.linkedStudents.find((row) => row.link_source === 'self')
    ?? summaryQuery.data?.linkedStudents[0]
    ?? null;

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-[900px] w-full mx-auto">
      <header className="border-b border-surface-container-high pb-6">
        <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 flex items-center gap-1.5">
          <UserIcon className="w-3 h-3 text-primary" /> My Profile
        </div>
        <h1 className="font-display text-3xl font-bold text-on-surface">
          {profile?.full_name || user?.email}
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          The information your gym has on file for you.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Account">
          <Row label="Email" value={profile?.email ?? user?.email ?? '—'} icon={<Mail className="w-3.5 h-3.5" />} />
          <Row label="Phone" value={profile?.phone ?? '—'} icon={<Phone className="w-3.5 h-3.5" />} />
        </Card>
        <Card title="Student">
          {summaryQuery.isLoading ? (
            <p className="text-sm text-on-surface-variant">Loading...</p>
          ) : student ? (
            <>
              <Row label="Name" value={`${student.first_name} ${student.last_name}`.trim()} />
              <Row label="Status" value={student.status} />
              <Row
                label="Belt"
                value={`${student.belt ?? '—'}${student.stripes ? ` • ${student.stripes} stripes` : ''}`}
                icon={<Award className="w-3.5 h-3.5" />}
              />
            </>
          ) : (
            <p className="text-sm text-on-surface-variant">
              No student record is linked to your account yet. Reach out to the front desk to link
              you up.
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6 flex flex-col gap-3">
      <h2 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider mb-1">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-on-surface-variant inline-flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-on-surface font-medium">{value}</span>
    </div>
  );
}
