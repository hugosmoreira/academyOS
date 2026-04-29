import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';

export default function ProtectedRoute() {
  const { loading, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="rounded-xl border border-surface-container-high bg-surface-container-low px-6 py-5 text-sm text-on-surface-variant">
          Loading AcademyOS...
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
