import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthProvider';
import { useProfile } from '../../features/auth/ProfileProvider';
import LoadingScreen from './LoadingScreen';

/**
 * Validates that the user has access to the :orgId URL param. Platform
 * super admins always pass; otherwise the user must be a member of the
 * organization (org-level or gym-level membership).
 */
export default function OrgRoute() {
  const { loading: authLoading, session } = useAuth();
  const {
    primaryRole,
    organizationMemberships,
    gymMemberships,
    loading: profileLoading,
    homeRoute,
  } = useProfile();
  const { orgId } = useParams<{ orgId: string }>();
  const location = useLocation();

  if (authLoading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  if (profileLoading) return <LoadingScreen />;

  if (primaryRole === 'platform_super_admin') return <Outlet />;

  if (!orgId) return <Navigate to={homeRoute} replace />;

  const inOrg =
    organizationMemberships.some((m) => m.organization.id === orgId) ||
    gymMemberships.some((m) => m.organizationId === orgId);

  if (!inOrg) return <Navigate to={homeRoute} replace />;
  return <Outlet />;
}
