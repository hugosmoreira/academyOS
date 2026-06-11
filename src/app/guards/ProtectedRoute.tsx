import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthProvider';
import LoadingScreen from './LoadingScreen';

/**
 * Base guard: requires an authenticated Supabase session.
 * Zone-specific guards (Admin/App/Portal) compose this behaviour.
 */
export default function ProtectedRoute() {
  const { loading, session } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
