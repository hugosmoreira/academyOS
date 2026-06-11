import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthProvider';
import { useProfile } from '../../features/auth/ProfileProvider';
import LoadingScreen from './LoadingScreen';

/**
 * Sends an authenticated user to the route appropriate for their role.
 * - platform_super_admin -> /admin
 * - staff (owner/gym_admin/instructor/front_desk) -> /app/dashboard
 * - student/parent -> /portal/dashboard
 * - anyone else -> /access-denied
 *
 * Used from the login page and as a fallback redirect for "/".
 */
export default function RoleBasedRedirect({ fallback = '/login' }: { fallback?: string } = {}) {
  const { session, loading: authLoading } = useAuth();
  const { homeRoute, loading: profileLoading } = useProfile();

  if (authLoading) return <LoadingScreen />;
  if (!session) return <Navigate to={fallback} replace />;
  if (profileLoading) return <LoadingScreen />;

  return <Navigate to={homeRoute} replace />;
}
