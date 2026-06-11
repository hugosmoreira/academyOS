// Supabase Edge Function: student-portal-invite
// ----------------------------------------------------------------------------
// Server-side wrapper around create_student_portal_invite + Supabase Auth
// admin invite email. Lets a gym admin trigger a portal invite for a student
// without exposing the service role key to the browser.
//
// The function:
//   1. Verifies the caller is authenticated.
//   2. Authorizes via can_manage_gym_students(student.gym_id) (RPC enforces).
//   3. Creates (or rotates) the invite via create_student_portal_invite RPC.
//   4. Optionally sends a Supabase magic-link email with a deep link to
//      /portal/accept-invite/:token (sendEmail=true).
//
// Deploy with:
//   supabase functions deploy student-portal-invite --no-verify-jwt
//
// Required env vars:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   APP_PORTAL_BASE_URL (e.g. https://app.academyos.com)
// ----------------------------------------------------------------------------

// @ts-expect-error -- Deno provides this remote import at runtime.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-expect-error -- Deno provides this remote import at runtime.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-expect-error -- Deno global is available in the runtime.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
// @ts-expect-error -- Deno global is available in the runtime.
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
// @ts-expect-error -- Deno global is available in the runtime.
const APP_PORTAL_BASE_URL = Deno.env.get('APP_PORTAL_BASE_URL');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
}

type Payload = {
  studentId: string;
  email?: string | null;
  sendEmail?: boolean;
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing Authorization header' }, 401);
  }

  const admin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const accessToken = authHeader.replace(/^Bearer\s+/i, '');
  const { data: callerUser, error: callerError } = await admin.auth.getUser(accessToken);
  if (callerError || !callerUser?.user) {
    return jsonResponse({ error: 'Invalid session' }, 401);
  }

  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  if (!payload.studentId) {
    return jsonResponse({ error: 'studentId is required.' }, 400);
  }

  // Call the RPC as the caller, not as service role, so RLS + the function's
  // can_manage_gym_students check both apply.
  const caller = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await caller.rpc('create_student_portal_invite', {
    p_student_id: payload.studentId,
    p_email: payload.email ?? null,
  });

  if (error) {
    return jsonResponse({ error: error.message }, 400);
  }

  const row = Array.isArray(data) ? data[0] : null;
  if (!row) {
    return jsonResponse({ error: 'Invite was not created.' }, 500);
  }

  let emailSent = false;
  let warning: string | undefined;

  if (payload.sendEmail) {
    const baseUrl = APP_PORTAL_BASE_URL ?? '';
    const acceptUrl = `${baseUrl}/portal/accept-invite/${row.invite_token}`;
    const targetEmail = payload.email
      ?? (await admin.from('student_portal_invites').select('email').eq('id', row.id).maybeSingle())
        .data?.email
      ?? null;

    if (!targetEmail) {
      warning = 'Invite created but email is missing on the invite row.';
    } else {
      const { error: emailError } = await admin.auth.admin.inviteUserByEmail(
        String(targetEmail).trim().toLowerCase(),
        {
          data: { portal_invite_token: row.invite_token, portal_accept_url: acceptUrl },
          redirectTo: acceptUrl,
        },
      );
      if (emailError) {
        warning = `Invite created but email failed: ${emailError.message}`;
      } else {
        emailSent = true;
      }
    }
  }

  return jsonResponse({
    inviteId: row.id,
    inviteToken: row.invite_token,
    status: row.status,
    expiresAt: row.expires_at,
    emailSent,
    warning,
  });
});
