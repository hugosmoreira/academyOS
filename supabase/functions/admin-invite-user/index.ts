// Supabase Edge Function: admin-invite-user
// ----------------------------------------------------------------------------
// Platform-admin-only RPC for inviting a user to an organization or gym with
// an explicit role. The function:
//
//   1. Verifies the caller is a platform_super_admin (or platform_admin via
//      platform_members).
//   2. Inserts a row into public.organization_invites with the requested
//      organization_id, gym_id, email, full_name and role_key.
//   3. Optionally sends a Supabase magic-link invite email so the user can
//      claim the account immediately (sendInvite=true).
//
// Deploy with:
//   supabase functions deploy admin-invite-user --no-verify-jwt
//
// Required env vars on the function:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
// ----------------------------------------------------------------------------

// @ts-expect-error -- Deno provides this remote import at runtime.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-expect-error -- Deno provides this remote import at runtime.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-expect-error -- Deno global is available in the runtime.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
// @ts-expect-error -- Deno global is available in the runtime.
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
}

type InviteUserPayload = {
  organizationId: string;
  gymId?: string | null;
  email: string;
  fullName?: string | null;
  roleKey: string;
  sendInvite?: boolean;
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

  // Accept platform_super_admin via profiles.platform_role, OR any active
  // platform_admin via platform_members.
  const callerId = callerUser.user.id;
  const [{ data: profile }, { data: platformMemberships }] = await Promise.all([
    admin.from('profiles').select('platform_role').eq('id', callerId).maybeSingle(),
    admin
      .from('platform_members')
      .select('role_key, status')
      .eq('profile_id', callerId)
      .eq('status', 'active'),
  ]);

  const isPlatformSuper = profile?.platform_role === 'platform_super_admin';
  const platformRoles = (platformMemberships ?? []).map((m) => m.role_key);
  const isPlatformAdmin =
    isPlatformSuper ||
    platformRoles.includes('platform_super_admin') ||
    platformRoles.includes('platform_admin');

  if (!isPlatformAdmin) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }

  let payload: InviteUserPayload;
  try {
    payload = (await req.json()) as InviteUserPayload;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  if (!payload.organizationId || !payload.email || !payload.roleKey) {
    return jsonResponse(
      { error: 'organizationId, email, and roleKey are required.' },
      400,
    );
  }

  const { data: invite, error: inviteError } = await admin
    .from('organization_invites')
    .insert({
      organization_id: payload.organizationId,
      gym_id: payload.gymId ?? null,
      email: payload.email.trim().toLowerCase(),
      full_name: payload.fullName ?? null,
      role_key: payload.roleKey,
      created_by: callerId,
    })
    .select('*')
    .single();

  if (inviteError) {
    return jsonResponse({ error: inviteError.message }, 500);
  }

  let userEmailSent = false;
  if (payload.sendInvite) {
    const redirectTo = `${SUPABASE_URL}/auth/v1/verify?type=invite`;
    const { error: emailError } = await admin.auth.admin.inviteUserByEmail(
      payload.email.trim().toLowerCase(),
      {
        data: { full_name: payload.fullName ?? '' },
        redirectTo,
      },
    );
    if (emailError) {
      return jsonResponse(
        {
          inviteId: invite.id,
          inviteToken: invite.token,
          warning: `Invite created but email failed: ${emailError.message}`,
        },
        207,
      );
    }
    userEmailSent = true;
  }

  return jsonResponse({
    inviteId: invite.id,
    inviteToken: invite.token,
    expiresAt: invite.expires_at,
    emailSent: userEmailSent,
  });
});
