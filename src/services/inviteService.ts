import { supabase } from '../lib/supabase';
import type { Database, RoleKey } from '../types/database';

export type OrganizationInvite = Database['public']['Tables']['organization_invites']['Row'];
export type OrganizationInviteInsert =
  Database['public']['Tables']['organization_invites']['Insert'];

export async function listPendingInvites(organizationId?: string): Promise<OrganizationInvite[]> {
  let query = supabase
    .from('organization_invites')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (organizationId) query = query.eq('organization_id', organizationId);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function listInvitesForOrganization(
  organizationId: string,
): Promise<OrganizationInvite[]> {
  const { data, error } = await supabase
    .from('organization_invites')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export type CreateInviteInput = {
  organizationId: string;
  gymId?: string | null;
  email: string;
  fullName?: string | null;
  roleKey: RoleKey;
};

export async function createOrganizationInvite(
  input: CreateInviteInput,
): Promise<OrganizationInvite> {
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

export type AdminInviteUserPayload = {
  organizationId: string;
  gymId?: string | null;
  email: string;
  fullName?: string | null;
  roleKey: RoleKey;
  sendInvite?: boolean;
};

export type AdminInviteUserResult = {
  inviteId: string;
  inviteToken: string;
  expiresAt?: string;
  emailSent?: boolean;
  warning?: string;
};

/**
 * Calls the admin-invite-user Edge Function. Pass sendInvite=true to also
 * send a Supabase magic-link email (requires the function to be deployed
 * with a service role key).
 */
export async function adminInviteUser(
  input: AdminInviteUserPayload,
): Promise<AdminInviteUserResult> {
  const { data, error } = await supabase.functions.invoke<AdminInviteUserResult>(
    'admin-invite-user',
    {
      body: {
        organizationId: input.organizationId,
        gymId: input.gymId ?? null,
        email: input.email,
        fullName: input.fullName ?? null,
        roleKey: input.roleKey,
        sendInvite: input.sendInvite ?? false,
      },
    },
  );
  if (error) throw error;
  if (!data) throw new Error('Invite returned no data');
  return data;
}

export async function revokeInvite(inviteId: string): Promise<void> {
  const { error } = await supabase
    .from('organization_invites')
    .update({ status: 'revoked' })
    .eq('id', inviteId);

  if (error) throw error;
}

export type LookupInviteResult = Database['public']['Functions']['lookup_invite_by_token']['Returns'][number];

export async function lookupInviteByToken(token: string): Promise<LookupInviteResult | null> {
  const { data, error } = await supabase.rpc('lookup_invite_by_token', { p_token: token });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  return row ?? null;
}

export async function acceptInvite(token: string): Promise<{
  organizationId: string;
  gymId: string | null;
  roleKey: RoleKey;
}> {
  const { data, error } = await supabase.rpc('accept_organization_invite', { p_token: token });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) throw new Error('Invite could not be accepted');
  return {
    organizationId: row.organization_id,
    gymId: row.gym_id,
    roleKey: row.role_key as RoleKey,
  };
}
