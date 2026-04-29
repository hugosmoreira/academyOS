import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type Student = Database['public']['Tables']['students']['Row'];
export type StudentInsert = Database['public']['Tables']['students']['Insert'];
export type StudentUpdate = Database['public']['Tables']['students']['Update'];
export type MemberStatus = Database['public']['Enums']['member_status'];

export type ListStudentsOptions = {
  organizationId?: string;
  gymId?: string;
  includeArchived?: boolean;
  search?: string;
  limit?: number;
};

export async function listStudents(options: ListStudentsOptions = {}): Promise<Student[]> {
  let query = supabase
    .from('students')
    .select('*')
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true });

  if (options.organizationId) query = query.eq('organization_id', options.organizationId);
  if (options.gymId) query = query.eq('gym_id', options.gymId);
  if (!options.includeArchived) query = query.neq('status', 'archived');
  if (options.search && options.search.trim().length > 0) {
    const term = options.search.trim();
    query = query.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`,
    );
  }
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function countStudents(options: { organizationId?: string; status?: MemberStatus } = {}): Promise<number> {
  let query = supabase
    .from('students')
    .select('id', { count: 'exact', head: true });

  if (options.organizationId) query = query.eq('organization_id', options.organizationId);
  if (options.status) query = query.eq('status', options.status);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function countStudentsCreatedSince(sinceISO: string, organizationId?: string): Promise<number> {
  let query = supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', sinceISO);
  if (organizationId) query = query.eq('organization_id', organizationId);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function getStudent(id: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function createStudent(input: StudentInsert): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .insert(input)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateStudent(id: string, input: StudentUpdate): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function archiveStudent(id: string): Promise<Student> {
  return updateStudent(id, { status: 'archived' });
}

export async function restoreStudent(id: string): Promise<Student> {
  return updateStudent(id, { status: 'active' });
}
