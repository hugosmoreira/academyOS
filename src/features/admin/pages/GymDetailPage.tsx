import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, MapPin, Users, Pencil, GraduationCap, Mail, Phone, Clock } from 'lucide-react';
import { useAdminGym, useGymMembers, useGymStudentCount } from '../hooks/useAdminGyms';
import { useOrganization } from '../hooks/useOrganizations';

export default function GymDetailPage() {
  const { gymId } = useParams<{ gymId: string }>();
  const gymQuery = useAdminGym(gymId);
  const membersQuery = useGymMembers(gymId);
  const studentCountQuery = useGymStudentCount(gymId);
  const orgQuery = useOrganization(gymQuery.data?.organization_id);

  const gym = gymQuery.data;

  if (gymQuery.isLoading) {
    return <div className="p-8 text-sm text-on-surface-variant">Loading gym...</div>;
  }

  if (!gym) {
    return (
      <div className="p-8 max-w-2xl">
        <Link
          to="/admin/gyms"
          className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to gyms
        </Link>
        <div className="mt-6 rounded-xl border border-error/30 bg-error-container/10 p-6 text-sm text-error">
          Gym not found.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-8 max-w-[1200px] w-full mx-auto">
      <Link
        to="/admin/gyms"
        className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1.5 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to gyms
      </Link>

      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-surface-container-high pb-6">
        <div className="flex flex-col gap-3">
          <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-primary" /> Gym
          </div>
          <h1 className="font-display text-3xl font-bold text-on-surface">{gym.name}</h1>
          <div className="flex items-center gap-3 text-xs text-on-surface-variant">
            <span className="font-mono">{gym.slug}</span>
            <span className="w-1 h-1 rounded-full bg-on-surface-variant/50" />
            <span className="uppercase tracking-widest font-bold">{gym.status}</span>
            {orgQuery.data && (
              <>
                <span className="w-1 h-1 rounded-full bg-on-surface-variant/50" />
                <Link
                  to={`/admin/organizations/${orgQuery.data.id}`}
                  className="inline-flex items-center gap-1.5 text-primary hover:text-primary-fixed"
                >
                  <Building2 className="w-3 h-3" /> {orgQuery.data.name}
                </Link>
              </>
            )}
          </div>
        </div>
        <Link
          to={`/admin/gyms/${gym.id}/edit`}
          className="inline-flex items-center gap-2 bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-md hover:brightness-110 transition-all"
        >
          <Pencil className="w-4 h-4" /> Edit Gym
        </Link>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Active Staff" value={membersQuery.data?.length ?? 0} icon={<Users className="w-4 h-4" />} />
        <StatCard label="Students" value={studentCountQuery.data ?? 0} icon={<GraduationCap className="w-4 h-4" />} />
        <StatCard label="Timezone" value={gym.timezone} icon={<Clock className="w-4 h-4" />} />
      </section>

      <section className="rounded-xl border border-surface-container-high bg-surface-container-low p-6 flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-on-surface">Contact & Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Address line 1" value={gym.address_line1} />
          <InfoRow label="Address line 2" value={gym.address_line2} />
          <InfoRow label="City" value={gym.city} />
          <InfoRow label="State / Region" value={gym.region} />
          <InfoRow label="Postal code" value={gym.postal_code} />
          <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={gym.phone} />
          <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={gym.email} />
          <InfoRow label="Logo URL" value={gym.logo_url} />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
            <Users className="w-5 h-5" /> Staff
          </h2>
        </div>
        {membersQuery.isLoading ? (
          <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6 text-sm text-on-surface-variant">
            Loading staff...
          </div>
        ) : (membersQuery.data ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-6 text-sm text-on-surface-variant">
            No staff assigned to this gym yet.
          </div>
        ) : (
          <div className="rounded-xl border border-surface-container-high bg-surface-container-low overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-container-high">
                  <th className="text-xs text-on-surface-variant px-6 py-3 uppercase tracking-wider font-semibold">Name</th>
                  <th className="text-xs text-on-surface-variant px-6 py-3 uppercase tracking-wider font-semibold">Email</th>
                  <th className="text-xs text-on-surface-variant px-6 py-3 uppercase tracking-wider font-semibold">Role</th>
                  <th className="text-xs text-on-surface-variant px-6 py-3 uppercase tracking-wider font-semibold">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {(membersQuery.data ?? []).map((m) => (
                  <tr key={m.membership_id} className="border-b border-surface-container-high/60 last:border-b-0">
                    <td className="px-6 py-4 text-on-surface font-medium">{m.full_name || '—'}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{m.email}</td>
                    <td className="px-6 py-4 text-on-surface">{m.role_label}</td>
                    <td className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                      {m.status}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/users/${m.profile_id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-fixed"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-5">
      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-bold flex items-center gap-1.5 mb-2">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold text-on-surface font-display">{value}</div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string | null | undefined; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-bold flex items-center gap-1.5 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-sm text-on-surface">{value || '—'}</div>
    </div>
  );
}
