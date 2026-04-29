import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const env = import.meta.env;

export const supabaseUrl =
  env.VITE_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ??
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[AcademyOS] Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_* equivalents) in .env to enable live data.',
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'missing-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  },
);
