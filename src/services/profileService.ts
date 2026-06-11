import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type Profile = Database['public']['Tables']['profiles']['Row'];

/** PostgREST returns 404 when a table is missing from the schema cache. */
function isMissingTableError(error: { code?: string; message?: string }): boolean {
  const msg = error.message?.toLowerCase() ?? '';
  return (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    msg.includes('does not exist') ||
    msg.includes('schema cache') ||
    msg.includes('could not find the table')
  );
}

export async function getProfile(profileId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function listProfiles(limit?: number): Promise<Profile[]> {
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function countStudentLinks(profileId: string): Promise<number> {
  const { count, error } = await supabase
    .from('student_user_links')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('status', 'active');

  if (error) {
    if (isMissingTableError(error)) return 0;
    throw error;
  }
  return count ?? 0;
}

export async function countParentLinks(profileId: string): Promise<number> {
  const { count, error } = await supabase
    .from('parent_user_links')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId);

  if (error) {
    if (isMissingTableError(error)) return 0;
    throw error;
  }
  return count ?? 0;
}
