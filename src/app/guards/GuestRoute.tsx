import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthProvider';
import { useProfile } from '../../features/auth/ProfileProvider';
import LoadingScreen from './LoadingScreen';

/**
 * Routes inside this guard are reserved for unauthenticated visitors.
 * Authenticated users are bounced to their role-based home so they
 * can't reach the login / signup pages while signed in.
 */
export default function GuestRoute() {
  const { loading: authLoading, session } = useAuth();
  const { homeRoute, loading: profileLoading } = useProfile();

  if (authLoading) return <LoadingScreen />;
  if (!session) return <Outlet />;
  if (profileLoading) return <LoadingScreen />;

  return <Navigate to={homeRoute} replace />;
}
