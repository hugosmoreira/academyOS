import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type HealthCheckResult = {
  configured: boolean;
  authenticated: boolean;
  organizationsOk: boolean;
  gymsOk: boolean;
  organizationsCount: number;
  gymsCount: number;
  errors: string[];
};

/**
 * Runs a health check against the Supabase backend.
 * Waits for an authenticated session before querying RLS-protected tables.
 */
export async function runSupabaseHealthCheck(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    configured: isSupabaseConfigured,
    authenticated: false,
    organizationsOk: false,
    gymsOk: false,
    organizationsCount: 0,
    gymsCount: 0,
    errors: [],
  };

  if (!isSupabaseConfigured) {
    const message =
      'Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_*).';
    result.errors.push(message);
    console.error('[AcademyOS] ❌ Supabase not configured:', message);
    return result;
  }

  console.info('[AcademyOS] ✅ Supabase client initialized.');

  // Check if a session exists before querying RLS-protected tables
  const { data: sessionData } = await supabase.auth.getSession();
  result.authenticated = Boolean(sessionData.session);

  if (!result.authenticated) {
    console.info(
      '[AcademyOS] ℹ️ No active session. Skipping RLS-protected table checks (login first).',
    );
    return result;
  }

  console.info('[AcademyOS] ✅ Authenticated session found.');

  const orgQuery = await supabase
    .from('organizations')
    .select('id', { count: 'exact', head: true });
  if (orgQuery.error) {
    result.errors.push(`organizations: ${orgQuery.error.message}`);
    console.error('[AcademyOS] ❌ Organizations query failed:', orgQuery.error);
  } else {
    result.organizationsOk = true;
    result.organizationsCount = orgQuery.count ?? 0;
    console.info(
      `[AcademyOS] ✅ Organizations loaded (${result.organizationsCount}).`,
    );
  }

  const gymQuery = await supabase
    .from('gyms')
    .select('id', { count: 'exact', head: true });
  if (gymQuery.error) {
    result.errors.push(`gyms: ${gymQuery.error.message}`);
    console.error('[AcademyOS] ❌ Gyms query failed:', gymQuery.error);
  } else {
    result.gymsOk = true;
    result.gymsCount = gymQuery.count ?? 0;
    console.info(`[AcademyOS] ✅ Gyms loaded (${result.gymsCount}).`);
  }

  return result;
}
