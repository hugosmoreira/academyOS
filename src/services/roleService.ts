import { supabase } from '../lib/supabase';
import type {
  Database,
  GymRoleKey,
  OrganizationRoleKey,
  PlatformRoleKey,
  RoleKey,
} from '../types/database';

export type Role = Database['public']['Tables']['roles']['Row'];
export type RoleScope = 'platform' | 'organization' | 'gym' | 'portal';

export const PLATFORM_ROLE_KEYS: PlatformRoleKey[] = [
  'platform_super_admin',
  'platform_admin',
  'sales_admin',
  'support_admin',
];

export const ORGANIZATION_ROLE_KEYS: OrganizationRoleKey[] = [
  'organization_owner',
  'organization_admin',
  'organization_billing_manager',
];

export const GYM_ROLE_KEYS: GymRoleKey[] = [
  'gym_owner',
  'gym_admin',
  'head_coach',
  'coach',
  'assistant_coach',
  'instructor',
  'front_desk',
  'billing_staff',
];

export const ROLE_LABELS: Record<RoleKey, string> = {
  platform_super_admin: 'Platform Super Admin',
  platform_admin: 'Platform Admin',
  sales_admin: 'Sales Admin',
  support_admin: 'Support Admin',
  organization_owner: 'Organization Owner',
  organization_admin: 'Organization Admin',
  organization_billing_manager: 'Billing Manager',
  gym_owner: 'Gym Owner',
  gym_admin: 'Gym Admin',
  head_coach: 'Head Coach',
  coach: 'Coach',
  assistant_coach: 'Assistant Coach',
  instructor: 'Instructor',
  front_desk: 'Front Desk',
  billing_staff: 'Billing Staff',
  student: 'Student',
  parent: 'Parent',
};

export function labelForRole(key: string): string {
  return (ROLE_LABELS as Record<string, string>)[key] ?? key;
}

let cachedRoles: Role[] | null = null;

export async function listRoles(force = false): Promise<Role[]> {
  if (cachedRoles && !force) return cachedRoles;
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('scope', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  cachedRoles = data ?? [];
  return cachedRoles;
}

export async function listRolesByScope(scope: RoleScope): Promise<Role[]> {
  const roles = await listRoles();
  return roles.filter((r) => r.scope === scope);
}

export type PlatformMembershipRow = {
  id: string;
  profile_id: string;
  role_key: PlatformRoleKey;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
};

export async function listPlatformMembers(): Promise<PlatformMembershipRow[]> {
  const { data, error } = await supabase
    .from('platform_members')
    .select('id, profile_id, role_key, status, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PlatformMembershipRow[];
}

export async function listPlatformMembersForProfile(
  profileId: string,
): Promise<PlatformMembershipRow[]> {
  const { data, error } = await supabase
    .from('platform_members')
    .select('id, profile_id, role_key, status, created_at')
    .eq('profile_id', profileId);
  if (error) throw error;
  return (data ?? []) as PlatformMembershipRow[];
}

export async function setPlatformMember(
  profileId: string,
  roleKey: PlatformRoleKey,
  status: 'active' | 'inactive' | 'suspended' = 'active',
): Promise<string> {
  const { data, error } = await supabase.rpc('set_platform_member', {
    p_profile_id: profileId,
    p_role_key: roleKey,
    p_status: status,
  });
  if (error) throw error;
  return data as unknown as string;
}

export async function assignOrgMember(
  organizationId: string,
  profileId: string,
  roleKey: OrganizationRoleKey,
  status: 'active' | 'inactive' = 'active',
): Promise<string> {
  const { data, error } = await supabase.rpc('assign_org_member', {
    p_organization_id: organizationId,
    p_profile_id: profileId,
    p_role_key: roleKey,
    p_status: status,
  });
  if (error) throw error;
  return data as unknown as string;
}

export async function assignGymMember(
  gymId: string,
  profileId: string,
  roleKey: GymRoleKey,
  status: 'active' | 'inactive' = 'active',
): Promise<string> {
  const { data, error } = await supabase.rpc('assign_gym_member', {
    p_gym_id: gymId,
    p_profile_id: profileId,
    p_role_key: roleKey,
    p_status: status,
  });
  if (error) throw error;
  return data as unknown as string;
}

/**
 * True when the profile has at least one active student_user_links row tied
 * to a student with portal_access_enabled. Used for admin labeling - never
 * for primary routing (use ProfileProvider for that).
 */
export async function isStudentPortalUser(profileId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('student_user_links')
    .select('student_id, students!inner(portal_access_enabled)')
    .eq('profile_id', profileId)
    .eq('students.portal_access_enabled', true)
    .limit(1);
  if (error) {
    if (error.code === 'PGRST205' || error.code === 'PGRST204') return false;
    throw error;
  }
  return (data ?? []).length > 0;
}

export async function isPlatformAdmin(profileId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('platform_role')
    .eq('id', profileId)
    .maybeSingle();
  if (error) throw error;
  return data?.platform_role === 'platform_super_admin'
    || data?.platform_role === 'platform_admin';
}
