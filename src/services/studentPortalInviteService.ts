import { supabase } from '../lib/supabase';
import type { Database, StudentPortalInviteStatus } from '../types/database';

export type StudentPortalInvite =
  Database['public']['Tables']['student_portal_invites']['Row'];

export type LookupStudentPortalInviteResult =
  Database['public']['Functions']['lookup_student_portal_invite_by_token']['Returns'][number];

export type CreateInviteResult = {
  id: string;
  inviteToken: string;
  status: StudentPortalInviteStatus;
  expiresAt: string;
};

function asCreateInviteResult(
  row: { id: string; invite_token: string; status: StudentPortalInviteStatus; expires_at: string },
): CreateInviteResult {
  return {
    id: row.id,
    inviteToken: row.invite_token,
    status: row.status,
    expiresAt: row.expires_at,
  };
}

export async function listStudentInvites(
  studentId: string,
): Promise<StudentPortalInvite[]> {
  const { data, error } = await supabase
    .from('student_portal_invites')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getActiveInvite(
  studentId: string,
): Promise<StudentPortalInvite | null> {
  const { data, error } = await supabase
    .from('student_portal_invites')
    .select('*')
    .eq('student_id', studentId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function createInvite(
  studentId: string,
  email?: string | null,
): Promise<CreateInviteResult> {
  const { data, error } = await supabase.rpc('create_student_portal_invite', {
    p_student_id: studentId,
    p_email: email ?? null,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) throw new Error('Invite could not be created');
  return asCreateInviteResult(row);
}

export async function resendInvite(inviteId: string): Promise<CreateInviteResult> {
  const { data, error } = await supabase.rpc('resend_student_portal_invite', {
    p_invite_id: inviteId,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) throw new Error('Invite could not be resent');
  return asCreateInviteResult(row);
}

export async function cancelInvite(inviteId: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_student_portal_invite', {
    p_invite_id: inviteId,
  });
  if (error) throw error;
}

export async function disablePortalAccess(studentId: string): Promise<void> {
  const { error } = await supabase.rpc('disable_student_portal_access', {
    p_student_id: studentId,
  });
  if (error) throw error;
}

export async function lookupInviteByToken(
  token: string,
): Promise<LookupStudentPortalInviteResult | null> {
  const { data, error } = await supabase.rpc('lookup_student_portal_invite_by_token', {
    p_token: token,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  return row ?? null;
}

export async function acceptInvite(token: string): Promise<{
  organizationId: string;
  gymId: string;
  studentId: string;
}> {
  const { data, error } = await supabase.rpc('accept_student_portal_invite', {
    p_token: token,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) throw new Error('Invite could not be accepted');
  return {
    organizationId: row.organization_id,
    gymId: row.gym_id,
    studentId: row.student_id,
  };
}

/** Returns the public accept-invite URL for an invite token. */
export function buildInviteLink(token: string, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/portal/accept-invite/${token}`;
}

/**
 * Calls the `student-portal-invite` Edge Function. Required when sending the
 * actual magic-link email since that needs the service role on the server.
 * Falls back-friendly: use `createInvite` if the function isn't deployed.
 */
export async function sendInviteEmail(
  studentId: string,
  email?: string | null,
): Promise<CreateInviteResult & { emailSent: boolean; warning?: string }> {
  const { data, error } = await supabase.functions.invoke<{
    inviteId: string;
    inviteToken: string;
    status: StudentPortalInviteStatus;
    expiresAt: string;
    emailSent: boolean;
    warning?: string;
  }>('student-portal-invite', {
    body: {
      studentId,
      email: email ?? null,
      sendEmail: true,
    },
  });
  if (error) throw error;
  if (!data) throw new Error('Invite function returned no data');
  return {
    id: data.inviteId,
    inviteToken: data.inviteToken,
    status: data.status,
    expiresAt: data.expiresAt,
    emailSent: data.emailSent,
    warning: data.warning,
  };
}

export type CreateTestingPortalLoginResult = {
  userId: string;
  studentId: string;
  email: string;
  reusedExistingUser: boolean;
  /** Set only when the function generated the password (none was provided). */
  temporaryPassword: string | null;
};

/**
 * Dev/testing path: calls the `admin-create-student-portal-user` Edge Function
 * to create a working portal login directly (no email round-trip). The
 * service role stays server-side; the function re-checks gym authorization
 * as the caller. Production flows should prefer the email invite.
 */
export async function createTestingPortalLogin(input: {
  studentId: string;
  email?: string | null;
  temporaryPassword?: string | null;
}): Promise<CreateTestingPortalLoginResult> {
  const { data, error } = await supabase.functions.invoke<CreateTestingPortalLoginResult>(
    'admin-create-student-portal-user',
    {
      body: {
        studentId: input.studentId,
        email: input.email ?? null,
        temporaryPassword: input.temporaryPassword ?? null,
      },
    },
  );
  if (error) {
    // FunctionsHttpError carries the JSON body with the real message.
    const context = (error as { context?: Response }).context;
    if (context) {
      const body = await context.json().catch(() => null);
      if (body?.error) throw new Error(body.error);
    }
    throw error;
  }
  if (!data) throw new Error('Portal login function returned no data');
  return data;
}

export type PortalAccessStatus =
  | 'no_access'
  | 'invite_pending'
  | 'invite_expired'
  | 'invite_cancelled'
  | 'enabled';

export type StudentPortalStatus = {
  status: PortalAccessStatus;
  invite: StudentPortalInvite | null;
  linkedProfileIds: string[];
  portalAccessEnabled: boolean;
};

/**
 * Resolves the portal access state for a single student by combining the
 * students.portal_access_enabled flag, the most recent invite, and the
 * student_user_links rows.
 */
export async function getStudentPortalStatus(
  studentId: string,
): Promise<StudentPortalStatus> {
  const [studentRow, latestInvite, links] = await Promise.all([
    supabase
      .from('students')
      .select('portal_access_enabled')
      .eq('id', studentId)
      .maybeSingle(),
    supabase
      .from('student_portal_invites')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('student_user_links')
      .select('profile_id')
      .eq('student_id', studentId)
      .eq('status', 'active'),
  ]);

  if (studentRow.error) throw studentRow.error;
  if (latestInvite.error) throw latestInvite.error;
  if (links.error) throw links.error;

  const portalAccessEnabled = studentRow.data?.portal_access_enabled ?? false;
  const linkedProfileIds = (links.data ?? []).map((row) => row.profile_id);
  const invite = latestInvite.data ?? null;

  let status: PortalAccessStatus = 'no_access';
  if (portalAccessEnabled && linkedProfileIds.length > 0) {
    status = 'enabled';
  } else if (invite?.status === 'pending') {
    const expired = new Date(invite.expires_at).getTime() < Date.now();
    status = expired ? 'invite_expired' : 'invite_pending';
  } else if (invite?.status === 'expired') {
    status = 'invite_expired';
  } else if (invite?.status === 'cancelled') {
    status = 'invite_cancelled';
  }

  return {
    status,
    invite,
    linkedProfileIds,
    portalAccessEnabled,
  };
}
