import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type Organization = Database['public']['Tables']['organizations']['Row'];

export async function listOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function countOrganizations(): Promise<number> {
  const { count, error } = await supabase
    .from('organizations')
    .select('id', { count: 'exact', head: true });

  if (error) throw error;
  return count ?? 0;
}

export async function getFirstOrganization(): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}
