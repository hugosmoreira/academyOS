import { Navigate } from 'react-router-dom';
import { useTenant } from '../../tenancy/TenantProvider';
import LoadingScreen from '../../../app/guards/LoadingScreen';

/**
 * /app/kiosk -> /kiosk/:gymSlug
 * Resolves the active gym from TenantProvider so the staff app's
 * "Check-in Member" button continues to work after kiosk moved to a
 * top-level fullscreen route.
 */
export default function KioskRedirect() {
  const { activeGym, loading } = useTenant();

  if (loading) return <LoadingScreen message="Opening check-in..." />;

  const target = activeGym?.gym.slug ?? activeGym?.gym.id;
  if (!target) return <Navigate to="/app/dashboard" replace />;

  return <Navigate to={`/kiosk/${target}`} replace />;
}
