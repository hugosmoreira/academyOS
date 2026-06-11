// Supabase Edge Function: admin-create-student-portal-user
// ----------------------------------------------------------------------------
// Dev/testing helper for the student portal: lets a gym admin (or platform
// admin) create a working portal login for a student directly, without the
// email invite round-trip. The service role key never leaves this function.
//
// The function:
//   1. Verifies the caller is authenticated.
//   2. Authorizes via the can_manage_gym_students RPC executed AS THE CALLER,
//      so gym scoping and RLS rules decide — not the service role.
//   3. Creates (or reuses) the auth user for the given email, setting the
//      provided temporary password (or generating one).
//   4. Upserts the profiles row.
//   5. Upserts student_user_links (status active) and flips
//      students.portal_access_enabled = true.
//   6. Cancels pending invites and records an accepted invite row so the
//      Portal Access panel reflects the state.
//
// Deploy with:
//   supabase functions deploy admin-create-student-portal-user
//
// Required env vars (provided automatically on hosted functions):
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

type Payload = {
  studentId: string;
  email?: string | null;
  temporaryPassword?: string | null;
  fullName?: string | null;
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

function generatePassword(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  // Base64url, trimmed to 16 chars + suffix to satisfy common complexity rules.
  return btoa(String.fromCharCode(...bytes))
    .replace(/[+/=]/g, '')
    .slice(0, 16) + '!1';
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

  const { data: student, error: studentError } = await admin
    .from('students')
    .select('id, organization_id, gym_id, email, first_name, last_name, portal_access_enabled')
    .eq('id', payload.studentId)
    .maybeSingle();
  if (studentError) {
    return jsonResponse({ error: studentError.message }, 400);
  }
  if (!student) {
    return jsonResponse({ error: 'Student not found.' }, 404);
  }

  // Authorize as the caller: platform admin, org owner, or gym staff only.
  const caller = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: canManage, error: authzError } = await caller.rpc('can_manage_gym_students', {
    target_gym_id: student.gym_id,
  });
  if (authzError) {
    return jsonResponse({ error: authzError.message }, 400);
  }
  if (!canManage) {
    return jsonResponse({ error: 'Not authorized to manage students for this gym.' }, 403);
  }

  const email = String(payload.email ?? student.email ?? '').trim().toLowerCase();
  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return jsonResponse({ error: 'A valid email is required.' }, 400);
  }

  const password = payload.temporaryPassword?.trim() || generatePassword();
  const passwordGenerated = !payload.temporaryPassword?.trim();
  if (password.length < 8) {
    return jsonResponse({ error: 'Temporary password must be at least 8 characters.' }, 400);
  }

  const fullName =
    payload.fullName?.trim() ||
    `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim();

  // Create the auth user, or reuse the existing account for this email.
  let userId: string | null = null;
  let reusedExistingUser = false;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError) {
    const alreadyExists = /already.*(registered|exists)|duplicate/i.test(createError.message);
    if (!alreadyExists) {
      return jsonResponse({ error: `Could not create auth user: ${createError.message}` }, 400);
    }
    const { data: existingProfile, error: lookupError } = await admin
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle();
    if (lookupError || !existingProfile) {
      return jsonResponse(
        { error: 'An auth user with this email exists but no profile row was found for it.' },
        409,
      );
    }
    userId = existingProfile.id;
    reusedExistingUser = true;
    // Only overwrite the password when the admin explicitly provided one.
    if (!passwordGenerated) {
      const { error: pwError } = await admin.auth.admin.updateUserById(userId, { password });
      if (pwError) {
        return jsonResponse({ error: `Could not set temporary password: ${pwError.message}` }, 400);
      }
    }
  } else {
    userId = created.user?.id ?? null;
  }

  if (!userId) {
    return jsonResponse({ error: 'Auth user could not be resolved.' }, 500);
  }

  const { error: profileError } = await admin.from('profiles').upsert(
    { id: userId, email, full_name: fullName },
    { onConflict: 'id' },
  );
  if (profileError) {
    return jsonResponse({ error: `Profile upsert failed: ${profileError.message}` }, 400);
  }

  const { error: linkError } = await admin.from('student_user_links').upsert(
    {
      organization_id: student.organization_id,
      gym_id: student.gym_id,
      student_id: student.id,
      profile_id: userId,
      status: 'active',
    },
    { onConflict: 'student_id,profile_id' },
  );
  if (linkError) {
    return jsonResponse({ error: `Student link failed: ${linkError.message}` }, 400);
  }

  const { error: enableError } = await admin
    .from('students')
    .update({ portal_access_enabled: true })
    .eq('id', student.id);
  if (enableError) {
    return jsonResponse({ error: `Could not enable portal access: ${enableError.message}` }, 400);
  }

  // Reflect the state in the invite history: cancel pending, record accepted.
  await admin
    .from('student_portal_invites')
    .update({ status: 'cancelled' })
    .eq('student_id', student.id)
    .eq('status', 'pending');

  const { error: inviteError } = await admin.from('student_portal_invites').insert({
    organization_id: student.organization_id,
    gym_id: student.gym_id,
    student_id: student.id,
    email,
    status: 'accepted',
    accepted_at: new Date().toISOString(),
    accepted_user_id: userId,
    created_by: callerUser.user.id,
  });
  if (inviteError) {
    // Non-fatal: the login works either way; the panel just won't show the row.
    console.warn('Could not record accepted invite:', inviteError.message);
  }

  return jsonResponse({
    userId,
    studentId: student.id,
    email,
    reusedExistingUser,
    // Echo only generated passwords so the admin can copy them; admin-typed
    // passwords are never echoed back.
    temporaryPassword: passwordGenerated ? password : null,
  });
});
