import { supabase } from '../lib/supabase';

export type GymCollectionsSummary = {
  pastDueTotalCents: number;
  membersInArrears: number;
  openInvoiceCount: number;
  /** False when the invoices table is not provisioned yet — show the empty state. */
  billingReady: boolean;
};

function isMissingSchemaError(error: { code?: string; message?: string }): boolean {
  const msg = error.message?.toLowerCase() ?? '';
  return (
    error.code === 'PGRST205' ||
    error.code === 'PGRST204' ||
    error.code === '42P01' ||
    error.code === '42703' ||
    msg.includes('does not exist') ||
    msg.includes('schema cache')
  );
}

export async function getGymCollectionsSummary(gymId: string): Promise<GymCollectionsSummary> {
  const { data, error } = await supabase
    .from('invoices')
    .select('id, total_cents, status, student_id')
    .eq('gym_id', gymId)
    .in('status', ['open', 'past_due']);

  if (error) {
    if (isMissingSchemaError(error)) {
      console.warn('[AcademyOS] Billing tables are not provisioned yet; showing empty collections state.');
      return { pastDueTotalCents: 0, membersInArrears: 0, openInvoiceCount: 0, billingReady: false };
    }
    throw error;
  }

  const rows = data ?? [];
  const studentIds = new Set<string>();

  let pastDueTotalCents = 0;
  for (const row of rows) {
    pastDueTotalCents += Number(row.total_cents ?? 0);
    if (row.student_id) studentIds.add(row.student_id);
  }

  return {
    pastDueTotalCents,
    membersInArrears: studentIds.size,
    openInvoiceCount: rows.length,
    billingReady: true,
  };
}
