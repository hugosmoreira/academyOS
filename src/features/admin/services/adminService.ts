import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database';

export type PlatformStats = {
  totalOrganizations: number;
  activeOrganizations: number;
  totalGyms: number;
  totalUsers: number;
  pendingInvites: number;
  newSalesLeads: number;
  openSalesLeads: number;
};

export async function getPlatformStats(): Promise<PlatformStats> {
  const { data, error } = await supabase.rpc('get_platform_stats');
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  return {
    totalOrganizations: Number(row?.total_organizations ?? 0),
    activeOrganizations: Number(row?.active_organizations ?? 0),
    totalGyms: Number(row?.total_gyms ?? 0),
    totalUsers: Number(row?.total_users ?? 0),
    pendingInvites: Number(row?.pending_invites ?? 0),
    newSalesLeads: Number(row?.new_sales_leads ?? 0),
    openSalesLeads: Number(row?.open_sales_leads ?? 0),
  };
}

export type OrganizationListRow = Database['public']['Tables']['organizations']['Row'] & {
  gym_count: number;
  member_count: number;
};

export async function listOrganizationsWithCounts(): Promise<OrganizationListRow[]> {
  // Fetch orgs + gym ids + membership ids in three lightweight queries and
  // join client-side. Avoids a costly view migration and keeps RLS in play.
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

export async function getRecentOrganizations(limit = 5): Promise<OrganizationListRow[]> {
  const all = await listOrganizationsWithCounts();
  return all.slice(0, limit);
}

export type CreateOrganizationInput = {
  orgName: string;
  orgSlug: string;
  gymName: string;
  gymSlug: string;
  ownerEmail?: string;
  ownerFullName?: string;
  gymTimezone?: string;
};

export type CreateOrganizationResult = {
  organizationId: string;
  gymId: string;
  inviteId: string | null;
  inviteToken: string | null;
};

export async function createOrganizationBundle(
  input: CreateOrganizationInput,
): Promise<CreateOrganizationResult> {
  const { data, error } = await supabase.rpc('admin_create_organization_bundle', {
    p_org_name: input.orgName,
    p_org_slug: input.orgSlug,
    p_gym_name: input.gymName,
    p_gym_slug: input.gymSlug,
    p_owner_email: input.ownerEmail ?? null,
    p_owner_full_name: input.ownerFullName ?? null,
    p_gym_timezone: input.gymTimezone ?? 'America/Los_Angeles',
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) throw new Error('Organization creation returned no result');

  return {
    organizationId: row.organization_id,
    gymId: row.gym_id,
    inviteId: row.invite_id ?? null,
    inviteToken: row.invite_token ?? null,
  };
}

export type CreateGymInput = {
  gymName: string;
  gymSlug: string;
  gymTimezone?: string;
  ownerEmail?: string;
  ownerFullName?: string;
  organizationId?: string;
  newOrgName?: string;
  newOrgSlug?: string;
};

export type CreateGymResult = CreateOrganizationResult;

export async function createGymBundle(input: CreateGymInput): Promise<CreateGymResult> {
  const { data, error } = await supabase.rpc('admin_create_gym_bundle', {
    p_gym_name: input.gymName,
    p_gym_slug: input.gymSlug,
    p_gym_timezone: input.gymTimezone ?? 'America/Los_Angeles',
    p_owner_email: input.ownerEmail ?? null,
    p_owner_full_name: input.ownerFullName ?? null,
    p_organization_id: input.organizationId ?? null,
    p_new_org_name: input.newOrgName ?? null,
    p_new_org_slug: input.newOrgSlug ?? null,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) throw new Error('Gym creation returned no result');

  return {
    organizationId: row.organization_id,
    gymId: row.gym_id,
    inviteId: row.invite_id ?? null,
    inviteToken: row.invite_token ?? null,
  };
}
