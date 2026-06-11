import { supabase } from '../../lib/supabase';
import type { Database, RoleKey } from '../../types/database';

export type Organization = Database['public']['Tables']['organizations']['Row'];
export type Gym = Database['public']['Tables']['gyms']['Row'];

export type OrganizationMembership = {
  id: string;
  organization: Organization;
  roleKey: RoleKey;
};

export type GymMembership = {
  id: string;
  organizationId: string;
  gym: Gym;
  roleKey: RoleKey;
};

type OrganizationMemberRow = Database['public']['Tables']['organization_members']['Row'];
type GymMemberRow = Database['public']['Tables']['gym_members']['Row'];

export async function getOrganizationMemberships(profileId: string): Promise<OrganizationMembership[]> {
  const { data, error } = await supabase
    .from('organization_members')
    .select('id, organizations(*), roles(key)')
    .eq('profile_id', profileId)
    .eq('status', 'active');

  if (error) throw error;

  return ((data ?? []) as unknown as OrganizationMemberRow[]).flatMap((membership) => {
    if (!membership.organizations || !membership.roles) return [];
    return [{
      id: membership.id,
      organization: membership.organizations,
      roleKey: membership.roles.key,
    }];
  });
}

export async function getGymMemberships(profileId: string): Promise<GymMembership[]> {
  const { data, error } = await supabase
    .from('gym_members')
    .select('id, organization_id, gyms(*), roles(key)')
    .eq('profile_id', profileId)
    .eq('status', 'active');

  if (error) throw error;

  return ((data ?? []) as unknown as GymMemberRow[]).flatMap((membership) => {
    if (!membership.gyms || !membership.roles) return [];
    return [{
      id: membership.id,
      organizationId: membership.organization_id,
      gym: membership.gyms,
      roleKey: membership.roles.key,
    }];
  });
}

const ORG_WIDE_GYM_ACCESS_ROLES: RoleKey[] = ['organization_owner', 'organization_admin'];

export type PrefetchedMemberships = {
  orgMemberships: OrganizationMembership[];
  gymMemberships: GymMembership[];
};

/**
 * Returns all gyms the user can operate: direct gym_members rows plus every gym
 * under organizations where the user is owner/admin.
 *
 * Pass `prefetched` when the memberships are already loaded (ProfileProvider
 * does) so this only issues the extra org-wide gyms query instead of
 * re-fetching organization_members and gym_members.
 */
export async function getAccessibleGyms(
  profileId: string,
  prefetched?: PrefetchedMemberships,
): Promise<GymMembership[]> {
  const [orgMemberships, gymMemberships] = prefetched
    ? [prefetched.orgMemberships, prefetched.gymMemberships]
    : await Promise.all([
        getOrganizationMemberships(profileId),
        getGymMemberships(profileId),
      ]);

  const gymMap = new Map<string, GymMembership>();
  for (const membership of gymMemberships) {
    gymMap.set(membership.gym.id, membership);
  }

  const orgIdsWithFullAccess = orgMemberships
    .filter((m) => ORG_WIDE_GYM_ACCESS_ROLES.includes(m.roleKey))
    .map((m) => m.organization.id);

  if (orgIdsWithFullAccess.length > 0) {
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .in('organization_id', orgIdsWithFullAccess)
      .order('name', { ascending: true });

    if (error) throw error;

    for (const gym of data ?? []) {
      if (gymMap.has(gym.id)) continue;
      const orgMembership = orgMemberships.find((m) => m.organization.id === gym.organization_id);
      gymMap.set(gym.id, {
        id: `org-access-${gym.id}`,
        organizationId: gym.organization_id,
        gym,
        roleKey: orgMembership?.roleKey ?? 'organization_owner',
      });
    }
  }

  return Array.from(gymMap.values()).sort((a, b) => a.gym.name.localeCompare(b.gym.name));
}

export async function canAccessGym(gymId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_access_gym', { p_gym_id: gymId });
  if (error) throw error;
  return Boolean(data);
}
