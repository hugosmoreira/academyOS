// Supabase Edge Function: create-organization
// ----------------------------------------------------------------------------
// Production-grade organization provisioning. Requires the service role key
// to create the owner's Supabase auth user and to bypass RLS on the bundle
// insert. The browser must call this function via supabase.functions.invoke
// using a JWT for a platform_super_admin profile.
//
// The function:
//   1. Verifies the caller is a platform super admin.
//   2. Calls admin_create_organization_bundle to create org + gym + invite.
//   3. Optionally creates the owner's Supabase auth user (when send_invite
//      is true) using the Admin API and sends a Supabase magic-link invite.
//   4. Returns { organizationId, gymId, inviteId, inviteToken, ownerUserId }.
//
// Deploy with:
//   supabase functions deploy create-organization --no-verify-jwt
//
// Required env vars on the function:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   SUPABASE_ANON_KEY (optional, only if you need to issue scoped clients)
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

type CreateOrganizationPayload = {
  orgName: string;
  orgSlug: string;
  gymName: string;
  gymSlug: string;
  ownerEmail?: string;
  ownerFullName?: string;
  gymTimezone?: string;
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

  // Verify caller is a platform super admin by inspecting the JWT.
  const accessToken = authHeader.replace(/^Bearer\s+/i, '');
  const { data: callerUser, error: callerError } = await admin.auth.getUser(accessToken);
  if (callerError || !callerUser?.user) {
    return jsonResponse({ error: 'Invalid session' }, 401);
  }
  const { data: callerProfile, error: profileError } = await admin
    .from('profiles')
    .select('platform_role')
    .eq('id', callerUser.user.id)
    .maybeSingle();
  if (profileError) {
    return jsonResponse({ error: profileError.message }, 500);
  }
  if (callerProfile?.platform_role !== 'platform_super_admin') {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }

  let payload: CreateOrganizationPayload;
  try {
    payload = (await req.json()) as CreateOrganizationPayload;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  if (!payload.orgName || !payload.orgSlug || !payload.gymName || !payload.gymSlug) {
    return jsonResponse({ error: 'orgName, orgSlug, gymName, and gymSlug are required.' }, 400);
  }

  const { data: bundle, error: bundleError } = await admin.rpc(
    'admin_create_organization_bundle',
    {
      p_org_name: payload.orgName,
      p_org_slug: payload.orgSlug,
      p_gym_name: payload.gymName,
      p_gym_slug: payload.gymSlug,
      p_owner_email: payload.ownerEmail ?? null,
      p_owner_full_name: payload.ownerFullName ?? null,
      p_gym_timezone: payload.gymTimezone ?? 'America/Los_Angeles',
    },
  );

  if (bundleError) {
    return jsonResponse({ error: bundleError.message }, 500);
  }

  const row = Array.isArray(bundle) ? bundle[0] : bundle;
  if (!row) {
    return jsonResponse({ error: 'Bundle RPC returned no rows.' }, 500);
  }

  let ownerUserId: string | null = null;
  if (payload.sendInvite && payload.ownerEmail) {
    const redirectTo = `${SUPABASE_URL}/auth/v1/verify?type=invite`;
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      payload.ownerEmail,
      {
        data: { full_name: payload.ownerFullName ?? '' },
        redirectTo,
      },
    );
    if (inviteError) {
      return jsonResponse(
        {
          ...row,
          ownerUserId: null,
          warning: `Organization created but invite email failed: ${inviteError.message}`,
        },
        207,
      );
    }
    ownerUserId = invited.user?.id ?? null;
  }

  return jsonResponse({
    organizationId: row.organization_id,
    gymId: row.gym_id,
    inviteId: row.invite_id,
    inviteToken: row.invite_token,
    ownerUserId,
  });
});
