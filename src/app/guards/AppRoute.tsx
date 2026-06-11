import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthProvider';
import { useProfile } from '../../features/auth/ProfileProvider';
import LoadingScreen from './LoadingScreen';

/**
 * Guard for the gym operator app at /app/*.
 * Allows gym staff and platform admins (for support/testing).
 * Portal users are bounced to /portal; users with no roles to /access-denied.
 */
export default function AppRoute() {
  const { loading: authLoading, session } = useAuth();
  const { zone, homeRoute, primaryRole, loading: profileLoading } = useProfile();
  const location = useLocation();

  if (authLoading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  if (profileLoading) return <LoadingScreen />;

  if (zone === 'app' || primaryRole === 'platform_super_admin') return <Outlet />;
  if (primaryRole === 'none') return <Navigate to="/access-denied" replace />;
  return <Navigate to={homeRoute} replace />;
}
