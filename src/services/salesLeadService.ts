import { supabase } from '../lib/supabase';
import type { Database, SalesLeadStatus } from '../types/database';

export type SalesLead = Database['public']['Tables']['sales_leads']['Row'];

function isMissingTableError(error: { code?: string; message?: string }): boolean {
  const msg = error.message?.toLowerCase() ?? '';
  return (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    msg.includes('does not exist') ||
    msg.includes('schema cache') ||
    msg.includes('could not find the table')
  );
}

function toSalesLeadError(error: { code?: string; message?: string }): Error {
  if (isMissingTableError(error)) {
    return new Error(
      'The sales_leads table is not set up in Supabase yet. Open the SQL Editor, run supabase/repair_hosted_minimum.sql (or the full 20260428050000 migration), then hard-refresh this page.',
    );
  }
  return new Error(error.message ?? 'Unable to load sales leads.');
}

export type SubmitSalesLeadInput = {
  fullName: string;
  email: string;
  phone?: string | null;
  academyName?: string | null;
  message?: string | null;
  source?: string;
};

export async function submitSalesLead(input: SubmitSalesLeadInput): Promise<string> {
  const { data, error } = await supabase.rpc('submit_sales_lead', {
    p_full_name: input.fullName,
    p_email: input.email,
    p_phone: input.phone ?? null,
    p_academy_name: input.academyName ?? null,
    p_message: input.message ?? null,
    p_source: input.source ?? 'book_demo',
  });

  if (error) throw error;
  return data as unknown as string;
}

export type ListSalesLeadsOptions = {
  status?: SalesLeadStatus | 'all';
  limit?: number;
};

export async function listSalesLeads(options: ListSalesLeadsOptions = {}): Promise<SalesLead[]> {
  let query = supabase
    .from('sales_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw toSalesLeadError(error);
  return data ?? [];
}

export async function getSalesLead(id: string): Promise<SalesLead | null> {
  const { data, error } = await supabase
    .from('sales_leads')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function updateSalesLeadStatus(
  id: string,
  status: SalesLeadStatus,
): Promise<SalesLead> {
  const { data, error } = await supabase
    .from('sales_leads')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export type ConvertLeadInput = {
  leadId: string;
  orgName: string;
  orgSlug: string;
  gymName: string;
  gymSlug: string;
  ownerEmail?: string | null;
  ownerFullName?: string | null;
  gymTimezone?: string;
};

export type ConvertLeadResult = {
  organizationId: string;
  gymId: string;
  inviteId: string | null;
  inviteToken: string | null;
};

export async function convertSalesLeadToOrganization(
  input: ConvertLeadInput,
): Promise<ConvertLeadResult> {
  const { data, error } = await supabase.rpc('convert_sales_lead_to_organization', {
    p_lead_id: input.leadId,
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
  if (!row) throw new Error('Lead conversion returned no result');

  return {
    organizationId: row.organization_id,
    gymId: row.gym_id,
    inviteId: row.invite_id ?? null,
    inviteToken: row.invite_token ?? null,
  };
}

export async function countSalesLeadsByStatus(): Promise<Record<SalesLeadStatus, number>> {
  const { data, error } = await supabase
    .from('sales_leads')
    .select('status');

  if (error) throw error;

  const counts: Record<SalesLeadStatus, number> = {
    new: 0,
    contacted: 0,
    demo_scheduled: 0,
    converted: 0,
    lost: 0,
  };
  for (const row of data ?? []) {
    const status = row.status as SalesLeadStatus;
    if (status in counts) counts[status] += 1;
  }
  return counts;
}
