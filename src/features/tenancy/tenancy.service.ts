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
