import { Navigate, useLocation } from 'react-router-dom';
import { useProfile } from '../../features/auth/ProfileProvider';
import { useTenant } from '../../features/tenancy/TenantProvider';
import { gymPath, remapPathToGym } from '../../features/tenancy/gymPaths';
import LoadingScreen from './LoadingScreen';

type AppGymRedirectProps = {
  /** Path segment under /app/gyms/:gymId/ (e.g. "dashboard", "students/new"). */
  segment: string;
};

/**
 * Redirects a fixed legacy flat /app/* path to the gym-scoped equivalent.
 */
export default function AppGymRedirect({ segment }: AppGymRedirectProps) {
  const { activeGym, loading } = useTenant();
  const { homeRoute } = useProfile();

  if (loading) return <LoadingScreen />;

  const gymId = activeGym?.gym.id;
  if (!gymId) return <Navigate to={homeRoute} replace />;

  return <Navigate to={gymPath(gymId, segment)} replace />;
}

/**
 * Redirects the current legacy flat /app/* pathname to its gym-scoped equivalent,
 * preserving dynamic segments (e.g. /app/students/:id).
 */
export function AppGymLegacyRedirect() {
  const { activeGym, loading } = useTenant();
  const { homeRoute } = useProfile();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  const gymId = activeGym?.gym.id;
  if (!gymId) return <Navigate to={homeRoute} replace state={{ from: location }} />;

  const target = remapPathToGym(location.pathname, gymId);
  if (!target) return <Navigate to={homeRoute} replace state={{ from: location }} />;

  return <Navigate to={`${target}${location.search}${location.hash}`} replace />;
}
