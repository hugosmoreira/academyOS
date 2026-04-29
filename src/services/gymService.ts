import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type Gym = Database['public']['Tables']['gyms']['Row'];

export async function listGyms(organizationId?: string): Promise<Gym[]> {
  let query = supabase.from('gyms').select('*').order('name', { ascending: true });
  if (organizationId) query = query.eq('organization_id', organizationId);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function countGyms(organizationId?: string): Promise<number> {
  let query = supabase
    .from('gyms')
    .select('id', { count: 'exact', head: true });
  if (organizationId) query = query.eq('organization_id', organizationId);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function getFirstGym(organizationId?: string): Promise<Gym | null> {
  let query = supabase
    .from('gyms')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1);
  if (organizationId) query = query.eq('organization_id', organizationId);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ?? null;
}
