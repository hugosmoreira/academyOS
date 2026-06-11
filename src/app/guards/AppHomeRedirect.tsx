import { Navigate } from 'react-router-dom';
import { useProfile } from '../../features/auth/ProfileProvider';
import LoadingScreen from './LoadingScreen';

/** Sends /app index to the role-aware home route (gym dashboard or gym-selector). */
export default function AppHomeRedirect() {
  const { homeRoute, loading } = useProfile();
  if (loading) return <LoadingScreen />;
  return <Navigate to={homeRoute} replace />;
}
