import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthProvider';
import { useProfile } from '../../features/auth/ProfileProvider';
import { useTenant } from '../../features/tenancy/TenantProvider';
import { canAccessGym } from '../../features/tenancy/tenancy.service';
import LoadingScreen from './LoadingScreen';

/**
 * Validates the user has access to the :gymId URL param via can_access_gym RPC.
 * Platform admins always pass. When validated, the gym is synced into
 * TenantProvider so legacy pages reading activeGym continue to work.
 */
export default function GymRoute() {
  const { loading: authLoading, session } = useAuth();
  const { primaryRole, loading: profileLoading, homeRoute } = useProfile();
  const { gymId } = useParams<{ gymId: string }>();
  const tenant = useTenant();
  const location = useLocation();
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!gymId) return;
    if (tenant.activeGym?.gym.id !== gymId) {
      tenant.setActiveGymId(gymId);
    }
  }, [gymId, tenant]);

  useEffect(() => {
    if (!gymId || !session) return;
    if (primaryRole === 'platform_super_admin') {
      setHasAccess(true);
      setAccessChecked(true);
      return;
    }

    let cancelled = false;
    setAccessChecked(false);
    void canAccessGym(gymId)
      .then((allowed) => {
        if (!cancelled) {
          setHasAccess(allowed);
          setAccessChecked(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasAccess(false);
          setAccessChecked(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [gymId, session, primaryRole]);

  if (authLoading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  if (profileLoading) return <LoadingScreen />;
  if (!gymId) return <Navigate to={homeRoute} replace />;

  if (primaryRole === 'platform_super_admin') return <Outlet />;
  if (!accessChecked) return <LoadingScreen />;
  if (!hasAccess) return <Navigate to={homeRoute} replace />;

  return <Outlet />;
}
