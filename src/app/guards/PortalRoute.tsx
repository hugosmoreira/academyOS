import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthProvider';
import { useProfile } from '../../features/auth/ProfileProvider';
import LoadingScreen from './LoadingScreen';

/**
 * Guard for the student / parent portal at /portal/*.
 * Allows users whose primary role is student or parent.
 */
export default function PortalRoute() {
  const { loading: authLoading, session } = useAuth();
  const { zone, homeRoute, primaryRole, loading: profileLoading } = useProfile();
  const location = useLocation();

  if (authLoading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  if (profileLoading) return <LoadingScreen />;

  if (zone === 'portal') return <Outlet />;
  if (primaryRole === 'none') return <Navigate to="/access-denied" replace />;
  return <Navigate to={homeRoute} replace />;
}
