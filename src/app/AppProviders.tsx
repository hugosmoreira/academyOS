import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../features/auth/AuthProvider';
import { TenantProvider } from '../features/tenancy/TenantProvider';
import { ToastProvider } from '../components/Toast';
import { queryClient } from '../lib/queryClient';
import { runSupabaseHealthCheck } from '../services/healthCheck';

/**
 * Runs the health check once after the auth state is resolved.
 * This ensures RLS-protected queries actually return data.
 */
function HealthCheck() {
  const { loading, session } = useAuth();

  useEffect(() => {
    if (loading) return; // Wait for auth to resolve
    void runSupabaseHealthCheck();
  }, [loading, session]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <TenantProvider>
            <HealthCheck />
            {children}
          </TenantProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
