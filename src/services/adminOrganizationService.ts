import { supabase } from '../lib/supabase';
import type { Database, RoleKey } from '../types/database';
import { labelForRole } from './roleService';

export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

export type OrganizationListRow = Organization & {
  gym_count: number;
  member_count: number;
};

export async function listOrganizationsWithCounts(): Promise<OrganizationListRow[]> {
  const orgsPromise = supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false });
  const gymsPromise = supabase.from('gyms').select('id, organization_id');
  const membersPromise = supabase
    .from('organization_members')
    .select('organization_id, status')
    .eq('status', 'active');

  const [orgsResult, gymsResult, membersResult] = await Promise.all([
    orgsPromise,
    gymsPromise,
    membersPromise,
  ]);

  if (orgsResult.error) throw orgsResult.error;
  if (gymsResult.error) throw gymsResult.error;
  if (membersResult.error) throw membersResult.error;

  const gymCounts = new Map<string, number>();
  for (const gym of gymsResult.data ?? []) {
    gymCounts.set(gym.organization_id, (gymCounts.get(gym.organization_id) ?? 0) + 1);
  }

  const memberCounts = new Map<string, number>();
  for (const member of membersResult.data ?? []) {
    memberCounts.set(
      member.organization_id,
      (memberCounts.get(member.organization_id) ?? 0) + 1,
    );
  }

  return (orgsResult.data ?? []).map((org) => ({
    ...org,
    gym_count: gymCounts.get(org.id) ?? 0,
    member_count: memberCounts.get(org.id) ?? 0,
  }));
}

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

export type OrganizationMemberRow = {
  membership_id: string;
  organization_id: string;
  profile_id: string;
  role_key: RoleKey;
  role_label: string;
  status: string;
  full_name: string | null;
  email: string;
  created_at: string;
};

export async function listOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMemberRow[]> {
  const { data, error } = await supabase
    .from('organization_members')
    .select(
      'id, organization_id, profile_id, role_id, status, created_at, ' +
        'roles!inner(key), profiles!inner(full_name, email)',
    )
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  type RawRow = OrganizationMember & {
    roles: { key: RoleKey };
    profiles: { full_name: string | null; email: string };
  };

  return ((data ?? []) as unknown as RawRow[]).map((row) => ({
    membership_id: row.id,
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

export async function listOrganizationAuditLog(
  organizationId: string,
  limit = 25,
): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as AuditLog[];
}
