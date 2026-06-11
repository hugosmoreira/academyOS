import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, MapPin } from 'lucide-react';
import { useTenant } from '../TenantProvider';

export default function GymSelectorPage() {
  const tenant = useTenant();
  const navigate = useNavigate();

  // Auto-forward when the user is only assigned to one gym.
  useEffect(() => {
    if (!tenant.loading && tenant.gyms.length === 1) {
      navigate(`/app/gyms/${tenant.gyms[0].gym.id}/dashboard`, { replace: true });
    }
  }, [tenant.loading, tenant.gyms, navigate]);

  if (tenant.loading) {
    return <div className="p-8 text-sm text-on-surface-variant">Loading gyms...</div>;
  }

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1100px] w-full mx-auto">
      <header className="border-b border-surface-container-high pb-6">
        <h1 className="font-display text-3xl font-bold text-on-surface">Select a gym</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Choose which location you want to manage today.
        </p>
      </header>

      {tenant.gyms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          You are not assigned to any gym yet. Contact your gym owner or platform admin.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenant.gyms.map((membership) => (
            <Link
              key={membership.gym.id}
              to={`/app/gyms/${membership.gym.id}/dashboard`}
              onClick={() => tenant.setActiveGymId(membership.gym.id)}
              className="rounded-xl border border-surface-container-high bg-surface-container-low p-5 hover:border-primary/40 transition-colors flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-bold flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-primary" /> Gym
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                  {membership.roleKey.replace('_', ' ')}
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-on-surface">{membership.gym.name}</h2>
              <div className="text-xs text-on-surface-variant flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                {[membership.gym.city, membership.gym.region].filter(Boolean).join(', ') ||
                  'No location set'}
              </div>
              <div className="mt-auto text-xs font-bold uppercase tracking-wider text-primary inline-flex items-center gap-1.5">
                Open dashboard <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
