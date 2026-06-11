import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../features/auth/AuthProvider';
import { ProfileProvider } from '../features/auth/ProfileProvider';
import { TenantProvider } from '../features/tenancy/TenantProvider';
import { ToastProvider } from '../components/Toast';
import { queryClient } from '../lib/queryClient';
import { runSupabaseHealthCheck } from '../services/healthCheck';

// Module-level so React StrictMode double-mounts and session refreshes
// don't re-trigger the check.
let healthCheckRan = false;

/**
 * Diagnostic only: runs the Supabase health check once per app boot, in dev
 * builds (or when VITE_DEBUG_HEALTHCHECK=true), after a session exists so the
 * RLS-protected count queries are meaningful. Production renders make zero
 * health-check requests.
 */
function HealthCheck() {
  const { loading, session } = useAuth();

  useEffect(() => {
    const debugEnabled =
      import.meta.env.DEV || import.meta.env.VITE_DEBUG_HEALTHCHECK === 'true';
    if (!debugEnabled || healthCheckRan) return;
    if (loading || !session) return; // Wait for a signed-in session
    healthCheckRan = true;
    void runSupabaseHealthCheck();
  }, [loading, session]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <ProfileProvider>
            <TenantProvider>
              <HealthCheck />
              {children}
            </TenantProvider>
          </ProfileProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
