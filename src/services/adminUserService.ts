import { supabase } from '../lib/supabase';
import type {
  Database,
  GymRoleKey,
  OrganizationRoleKey,
  PlatformRoleKey,
  ProfileStatus,
  RoleKey,
} from '../types/database';
import { labelForRole } from './roleService';

export type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * What kind of login this is. A user can technically hold several roles; the
 * primary type uses the precedence Platform > Gym staff > Student portal >
 * Parent portal > No access.
 */
export type AdminAccountType =
  | 'platform'
  | 'staff'
  | 'student_portal'
  | 'parent_portal'
  | 'no_access';

export const ACCOUNT_TYPE_LABELS: Record<AdminAccountType, string> = {
  platform: 'Platform',
  staff: 'Gym Staff',
  student_portal: 'Student Portal',
  parent_portal: 'Parent Portal',
  no_access: 'No Access',
};

export type AdminUserListRow = Profile & {
  platform_roles: PlatformRoleKey[];
  organization_count: number;
  gym_count: number;
  student_link_count: number;
  parent_link_count: number;
  account_type: AdminAccountType;
};

function resolveAccountType(row: {
  platform_role: string | null;
  platform_roles: PlatformRoleKey[];
  organization_count: number;
  gym_count: number;
  student_link_count: number;
  parent_link_count: number;
}): AdminAccountType {
  if (row.platform_roles.length > 0 || row.platform_role) return 'platform';
  if (row.organization_count > 0 || row.gym_count > 0) return 'staff';
  if (row.student_link_count > 0) return 'student_portal';
  if (row.parent_link_count > 0) return 'parent_portal';
  return 'no_access';
}

export async function listAdminUsers(limit = 200): Promise<AdminUserListRow[]> {
  const profilesPromise = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  const platformPromise = supabase
    .from('platform_members')
    .select('profile_id, role_key')
    .eq('status', 'active');

  const orgPromise = supabase
    .from('organization_members')
    .select('profile_id')
    .eq('status', 'active');

  const gymPromise = supabase
    .from('gym_members')
    .select('profile_id')
    .eq('status', 'active');

  const studentLinkPromise = supabase
    .from('student_user_links')
    .select('profile_id')
    .eq('status', 'active');

  const parentLinkPromise = supabase
    .from('parent_user_links')
    .select('profile_id');

  const [
    profilesResult,
    platformResult,
    orgResult,
    gymResult,
    studentLinkResult,
    parentLinkResult,
  ] = await Promise.all([
    profilesPromise,
    platformPromise,
    orgPromise,
    gymPromise,
    studentLinkPromise,
    parentLinkPromise,
  ]);

  if (profilesResult.error) throw profilesResult.error;
  if (platformResult.error) throw platformResult.error;
  if (orgResult.error) throw orgResult.error;
  if (gymResult.error) throw gymResult.error;
  if (studentLinkResult.error) throw studentLinkResult.error;
  if (parentLinkResult.error) throw parentLinkResult.error;

  const platformByProfile = new Map<string, PlatformRoleKey[]>();
  for (const row of platformResult.data ?? []) {
    const list = platformByProfile.get(row.profile_id) ?? [];
    list.push(row.role_key as PlatformRoleKey);
    platformByProfile.set(row.profile_id, list);
  }

  const countBy = (rows: Array<{ profile_id: string }> | null) => {
    const counts = new Map<string, number>();
    for (const row of rows ?? []) {
      counts.set(row.profile_id, (counts.get(row.profile_id) ?? 0) + 1);
    }
    return counts;
  };

  const orgCounts = countBy(orgResult.data);
  const gymCounts = countBy(gymResult.data);
  const studentLinkCounts = countBy(studentLinkResult.data);
  const parentLinkCounts = countBy(parentLinkResult.data);

  return (profilesResult.data ?? []).map((profile) => {
    const counts = {
      platform_role: profile.platform_role,
      platform_roles: platformByProfile.get(profile.id) ?? [],
      organization_count: orgCounts.get(profile.id) ?? 0,
      gym_count: gymCounts.get(profile.id) ?? 0,
      student_link_count: studentLinkCounts.get(profile.id) ?? 0,
      parent_link_count: parentLinkCounts.get(profile.id) ?? 0,
    };
    return {
      ...profile,
      ...counts,
      account_type: resolveAccountType(counts),
    };
  });
}

export type LinkedStudentRecord = {
  link_id: string;
  student_id: string;
  gym_id: string | null;
  status: string;
  student_first_name: string | null;
  student_last_name: string | null;
};

export type AdminUserDetail = {
  profile: Profile;
  linked_students: LinkedStudentRecord[];
  platform_memberships: Array<{
    id: string;
    role_key: PlatformRoleKey;
    role_label: string;
    status: 'active' | 'inactive' | 'suspended';
    created_at: string;
  }>;
  organization_memberships: Array<{
    membership_id: string;
    organization_id: string;
    organization_name: string;
    role_key: RoleKey;
    role_label: string;
    status: string;
  }>;
  gym_memberships: Array<{
    membership_id: string;
    organization_id: string;
    gym_id: string;
    gym_name: string;
    role_key: RoleKey;
    role_label: string;
    status: string;
  }>;
};

export async function getAdminUserDetail(profileId: string): Promise<AdminUserDetail | null> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) return null;

  const platformPromise = supabase
    .from('platform_members')
    .select('id, role_key, status, created_at')
    .eq('profile_id', profileId);

  const orgPromise = supabase
    .from('organization_members')
    .select(
      'id, organization_id, status, roles!inner(key), organizations!inner(name)',
    )
    .eq('profile_id', profileId);

  const gymPromise = supabase
    .from('gym_members')
    .select(
      'id, organization_id, gym_id, status, roles!inner(key), gyms!inner(name)',
    )
    .eq('profile_id', profileId);

  const studentLinksPromise = supabase
    .from('student_user_links')
    .select('id, student_id, gym_id, status, students(first_name, last_name)')
    .eq('profile_id', profileId);

  const [platformResult, orgResult, gymResult, studentLinksResult] = await Promise.all([
    platformPromise,
    orgPromise,
    gymPromise,
    studentLinksPromise,
  ]);

  if (platformResult.error) throw platformResult.error;
  if (orgResult.error) throw orgResult.error;
  if (gymResult.error) throw gymResult.error;
  if (studentLinksResult.error) throw studentLinksResult.error;

  type RawOrg = {
    id: string;
    organization_id: string;
    status: string;
    roles: { key: RoleKey };
    organizations: { name: string };
  };
  type RawGym = {
    id: string;
    organization_id: string;
    gym_id: string;
    status: string;
    roles: { key: RoleKey };
    gyms: { name: string };
  };

  type RawStudentLink = {
    id: string;
    student_id: string;
    gym_id: string | null;
    status: string;
    students: { first_name: string | null; last_name: string | null } | null;
  };

  return {
    profile,
    linked_students: ((studentLinksResult.data ?? []) as unknown as RawStudentLink[]).map((row) => ({
      link_id: row.id,
      student_id: row.student_id,
      gym_id: row.gym_id,
      status: row.status,
      student_first_name: row.students?.first_name ?? null,
      student_last_name: row.students?.last_name ?? null,
    })),
    platform_memberships: (platformResult.data ?? []).map((row) => ({
      id: row.id,
      role_key: row.role_key as PlatformRoleKey,
      role_label: labelForRole(row.role_key),
      status: row.status as 'active' | 'inactive' | 'suspended',
      created_at: row.created_at,
    })),
    organization_memberships: ((orgResult.data ?? []) as unknown as RawOrg[]).map((row) => ({
      membership_id: row.id,
      organization_id: row.organization_id,
      organization_name: row.organizations.name,
      role_key: row.roles.key,
      role_label: labelForRole(row.roles.key),
      status: row.status,
    })),
    gym_memberships: ((gymResult.data ?? []) as unknown as RawGym[]).map((row) => ({
      membership_id: row.id,
      organization_id: row.organization_id,
      gym_id: row.gym_id,
      gym_name: row.gyms.name,
      role_key: row.roles.key,
      role_label: labelForRole(row.roles.key),
      status: row.status,
    })),
  };
}

/** Sends the standard Supabase reset-password email to the user. */
export async function sendPasswordResetForUser(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });
  if (error) throw error;
}

export async function setProfileStatus(
  profileId: string,
  status: ProfileStatus,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', profileId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deactivateOrgMembership(membershipId: string): Promise<void> {
  const { error } = await supabase
    .from('organization_members')
    .update({ status: 'inactive' })
    .eq('id', membershipId);
  if (error) throw error;
}

export async function deactivateGymMembership(membershipId: string): Promise<void> {
  const { error } = await supabase
    .from('gym_members')
    .update({ status: 'inactive' })
    .eq('id', membershipId);
  if (error) throw error;
}

export type CreateInviteForUserInput = {
  organizationId: string;
  gymId?: string | null;
  email: string;
  fullName?: string | null;
  roleKey: OrganizationRoleKey | GymRoleKey;
};

export async function createInviteForUser(input: CreateInviteForUserInput) {
  const { data, error } = await supabase
    .from('organization_invites')
    .insert({
      organization_id: input.organizationId,
      gym_id: input.gymId ?? null,
      email: input.email.trim().toLowerCase(),
      full_name: input.fullName ?? null,
      role_key: input.roleKey,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
