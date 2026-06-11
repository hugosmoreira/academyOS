import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type Gym = Database['public']['Tables']['gyms']['Row'];
export type GymInsert = Database['public']['Tables']['gyms']['Insert'];

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

export async function listGymsByOrganization(organizationId: string): Promise<Gym[]> {
  return listGyms(organizationId);
}

export async function createGym(input: GymInsert): Promise<Gym> {
  const { data, error } = await supabase.from('gyms').insert(input).select('*').single();
  if (error) throw error;
  return data;
}

export async function getGym(id: string): Promise<Gym | null> {
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getGymBySlugOrId(slugOrId: string): Promise<Gym | null> {
  if (UUID_RE.test(slugOrId)) {
    return getGym(slugOrId);
  }

  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('slug', slugOrId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export type GymUpdate = Database['public']['Tables']['gyms']['Update'];

export async function updateGym(id: string, patch: GymUpdate): Promise<Gym> {
  const { data, error } = await supabase
    .from('gyms')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
