import { supabase } from '../lib/supabase';
import type { Database, RoleKey } from '../types/database';
import { labelForRole } from './roleService';

export type Gym = Database['public']['Tables']['gyms']['Row'];
export type GymInsert = Database['public']['Tables']['gyms']['Insert'];
export type GymUpdate = Database['public']['Tables']['gyms']['Update'];
export type GymMember = Database['public']['Tables']['gym_members']['Row'];

export type GymListRow = Gym & {
  organization_name: string | null;
  member_count: number;
  student_count: number;
};

export async function listAllGymsWithContext(): Promise<GymListRow[]> {
  const gymsPromise = supabase
    .from('gyms')
    .select('*, organizations!inner(name)')
    .order('created_at', { ascending: false });
  const membersPromise = supabase
    .from('gym_members')
    .select('gym_id, status')
    .eq('status', 'active');
  const studentsPromise = supabase.from('students').select('gym_id, status');

  const [gymsResult, membersResult, studentsResult] = await Promise.all([
    gymsPromise,
    membersPromise,
    studentsPromise,
  ]);

  if (gymsResult.error) throw gymsResult.error;
  if (membersResult.error) throw membersResult.error;
  if (studentsResult.error) throw studentsResult.error;

  const memberCounts = new Map<string, number>();
  for (const m of membersResult.data ?? []) {
    memberCounts.set(m.gym_id, (memberCounts.get(m.gym_id) ?? 0) + 1);
  }
  const studentCounts = new Map<string, number>();
  for (const s of studentsResult.data ?? []) {
    if (s.status === 'active') {
      studentCounts.set(s.gym_id, (studentCounts.get(s.gym_id) ?? 0) + 1);
    }
  }

  type Row = Gym & { organizations: { name: string } | null };
  return ((gymsResult.data ?? []) as unknown as Row[]).map((row) => ({
    ...row,
    organization_name: row.organizations?.name ?? null,
    member_count: memberCounts.get(row.id) ?? 0,
    student_count: studentCounts.get(row.id) ?? 0,
  }));
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

export async function createGym(input: GymInsert): Promise<Gym> {
  const { data, error } = await supabase
    .from('gyms')
    .insert(input)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export type GymMemberRow = {
  membership_id: string;
  gym_id: string;
  organization_id: string;
  profile_id: string;
  role_key: RoleKey;
  role_label: string;
  status: string;
  full_name: string | null;
  email: string;
  created_at: string;
};

export async function listGymMembers(gymId: string): Promise<GymMemberRow[]> {
  const { data, error } = await supabase
    .from('gym_members')
    .select(
      'id, gym_id, organization_id, profile_id, role_id, status, created_at, ' +
        'roles!inner(key), profiles!inner(full_name, email)',
    )
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  type RawRow = GymMember & {
    roles: { key: RoleKey };
    profiles: { full_name: string | null; email: string };
  };

  return ((data ?? []) as unknown as RawRow[]).map((row) => ({
    membership_id: row.id,
    gym_id: row.gym_id,
    organization_id: row.organization_id,
    profile_id: row.profile_id,
    role_key: row.roles.key,
    role_label: labelForRole(row.roles.key),
    status: row.status,
    full_name: row.profiles.full_name,
    email: row.profiles.email,
    created_at: row.created_at,
  }));
}

export async function countGymStudents(gymId: string): Promise<number> {
  const { count, error } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('gym_id', gymId);

  if (error) throw error;
  return count ?? 0;
}
