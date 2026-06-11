import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthProvider';
import { useProfile } from '../../features/auth/ProfileProvider';
import LoadingScreen from './LoadingScreen';

export default function AdminRoute() {
  const { loading: authLoading, session } = useAuth();
  const { primaryRole, homeRoute, loading: profileLoading } = useProfile();
  const location = useLocation();

  if (authLoading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  if (profileLoading) return <LoadingScreen />;

  if (primaryRole !== 'platform_super_admin') {
    if (primaryRole === 'none') return <Navigate to="/access-denied" replace />;
    return <Navigate to={homeRoute} replace />;
  }

  return <Outlet />;
}
