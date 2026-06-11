import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];

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

export async function getOrganization(id: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function updateOrganizationStatus(id: string, status: string): Promise<Organization> {
  const { data, error } = await supabase
    .from('organizations')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];

export async function updateOrganization(id: string, patch: OrganizationUpdate): Promise<Organization> {
  const { data, error } = await supabase
    .from('organizations')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
