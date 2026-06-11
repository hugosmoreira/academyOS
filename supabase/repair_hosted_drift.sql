-- ============================================================================
-- Hosted schema repair: align live DB with the app's queries
-- ----------------------------------------------------------------------------
-- The hosted project was provisioned from partial repair scripts and is
-- missing columns/tables the frontend queries (verified 2026-06-10 by probing
-- PostgREST):
--   * students: birthdate, avatar_url, joined_at, preferred_name, metadata
--   * profiles: avatar_url, phone
--   * attendance_records: gym_id, status, created_at
--   * class_sessions: gym_id, starts_at
--   * student_user_links: gym_id, status, updated_at
--   * parent_user_links: status
--   * audit_logs table (RPCs write to it when present)
--
-- It also fixes a real production bug: the student portal invite RPCs are
-- declared RETURNS TABLE(id, status, ...) which makes plpgsql treat `id` and
-- `status` as variables. Unqualified references like `where id = p_invite_id`
-- then fail with 42702 "column reference is ambiguous". The functions are
-- recreated with `#variable_conflict use_column`.
--
-- Idempotent; safe to re-run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Missing columns
-- ----------------------------------------------------------------------------
alter table public.students
  add column if not exists birthdate date,
  add column if not exists avatar_url text,
  add column if not exists joined_at date,
  add column if not exists preferred_name text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists phone text;

alter table public.class_sessions
  add column if not exists gym_id uuid references public.gyms(id) on delete cascade,
  add column if not exists starts_at timestamptz;

update public.class_sessions cs
  set gym_id = ct.gym_id
  from public.class_templates ct
  where cs.class_template_id = ct.id
    and cs.gym_id is null;

alter table public.attendance_records
  add column if not exists gym_id uuid references public.gyms(id) on delete cascade,
  add column if not exists status text not null default 'present',
  add column if not exists created_at timestamptz not null default now();

update public.attendance_records ar
  set gym_id = cs.gym_id
  from public.class_sessions cs
  where ar.class_session_id = cs.id
    and ar.gym_id is null;

create index if not exists attendance_records_gym_id_idx
  on public.attendance_records (gym_id);
create index if not exists class_sessions_gym_id_idx
  on public.class_sessions (gym_id);

alter table public.student_user_links
  add column if not exists gym_id uuid references public.gyms(id) on delete cascade,
  add column if not exists status text not null default 'active'
    check (status in ('active', 'disabled')),
  add column if not exists updated_at timestamptz not null default now();

update public.student_user_links sul
  set gym_id = s.gym_id
  from public.students s
  where sul.student_id = s.id
    and sul.gym_id is null;

create index if not exists student_user_links_profile_id_idx
  on public.student_user_links (profile_id);
create index if not exists student_user_links_student_id_idx
  on public.student_user_links (student_id);

alter table public.parent_user_links
  add column if not exists status text not null default 'active'
    check (status in ('active', 'disabled'));

-- ----------------------------------------------------------------------------
-- 1b. family_members (referenced by the students portal SELECT policy below;
--     CREATE POLICY validates table references even behind to_regclass guards)
-- ----------------------------------------------------------------------------
create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  relationship text not null,
  is_primary_contact boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.family_members enable row level security;

drop policy if exists "family_members_select_org_member" on public.family_members;
create policy "family_members_select_org_member"
on public.family_members for select
using (
  public.is_platform_super_admin()
  or public.is_org_member(organization_id)
  or exists (
    select 1 from public.parent_user_links pul
    where pul.family_id = family_members.family_id
      and pul.profile_id = auth.uid()
  )
);

drop policy if exists "family_members_modify_org_owner" on public.family_members;
create policy "family_members_modify_org_owner"
on public.family_members for all
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
)
with check (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
);

-- ----------------------------------------------------------------------------
-- 2. audit_logs (invite RPCs insert into it when the table exists)
-- ----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_table text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

drop policy if exists "audit_logs_select_platform_admin" on public.audit_logs;
create policy "audit_logs_select_platform_admin"
on public.audit_logs for select
using (public.is_platform_super_admin());

-- ----------------------------------------------------------------------------
-- 3. Recreate invite RPCs with #variable_conflict use_column
-- ----------------------------------------------------------------------------
-- create_student_portal_invite: previously failed with 42702 on
-- `where id = p_student_id` and `status = 'pending'` for authenticated users.
create or replace function public.create_student_portal_invite(
  p_student_id uuid,
  p_email text default null
)
returns table (
  id uuid,
  invite_token uuid,
  status text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_actor uuid := auth.uid();
  v_student public.students%rowtype;
  v_email text;
  v_invite_id uuid;
  v_invite_token uuid;
  v_status text;
  v_expires_at timestamptz;
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  select * into v_student from public.students s where s.id = p_student_id;
  if v_student.id is null then
    raise exception 'Student not found';
  end if;

  if not public.can_manage_gym_students(v_student.gym_id) then
    raise exception 'Not authorized to manage students for this gym';
  end if;

  v_email := lower(trim(coalesce(p_email, v_student.email, '')));
  if length(v_email) = 0 then
    raise exception 'Email is required to send a portal invite';
  end if;
  if v_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    raise exception 'Invalid email address';
  end if;

  update public.student_portal_invites spi
    set status = 'cancelled', updated_at = now()
    where spi.student_id = p_student_id and spi.status = 'pending';

  insert into public.student_portal_invites (
    organization_id, gym_id, student_id, email, created_by
  )
  values (
    v_student.organization_id, v_student.gym_id, v_student.id, v_email, v_actor
  )
  returning student_portal_invites.id,
           student_portal_invites.invite_token,
           student_portal_invites.status,
           student_portal_invites.expires_at
    into v_invite_id, v_invite_token, v_status, v_expires_at;

  if to_regclass('public.audit_logs') is not null then
    insert into public.audit_logs (
      organization_id, gym_id, actor_profile_id, action, entity_table, entity_id, metadata
    ) values (
      v_student.organization_id, v_student.gym_id, v_actor,
      'student_portal_invite.created', 'student_portal_invites', v_invite_id,
      jsonb_build_object('student_id', v_student.id, 'email', v_email)
    );
  end if;

  return query
  select v_invite_id, v_invite_token, v_status, v_expires_at;
end;
$$;

grant execute on function public.create_student_portal_invite(uuid, text)
  to authenticated;

-- accept_student_portal_invite: recreated with the directive and with
-- student_user_links.gym_id/status now populated on link creation.
create or replace function public.accept_student_portal_invite(p_token uuid)
returns table (
  organization_id uuid,
  gym_id uuid,
  student_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_user_id uuid := auth.uid();
  v_user_email text;
  v_invite public.student_portal_invites%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select email into v_user_email from auth.users u where u.id = v_user_id;
  if v_user_email is null then
    raise exception 'Authenticated user has no email';
  end if;

  select * into v_invite
  from public.student_portal_invites spi
  where spi.invite_token = p_token
  limit 1;

  if v_invite.id is null then
    raise exception 'Invite not found';
  end if;

  if v_invite.status <> 'pending' then
    raise exception 'Invite is no longer pending (status: %)', v_invite.status;
  end if;

  if v_invite.expires_at < now() then
    update public.student_portal_invites spi
      set status = 'expired', updated_at = now()
      where spi.id = v_invite.id;
    raise exception 'Invite has expired';
  end if;

  if lower(v_invite.email) <> lower(v_user_email) then
    raise exception 'Invite email does not match the authenticated user';
  end if;

  insert into public.student_user_links (organization_id, gym_id, student_id, profile_id, status)
  values (v_invite.organization_id, v_invite.gym_id, v_invite.student_id, v_user_id, 'active')
  on conflict (student_id, profile_id) do update
    set status = 'active', gym_id = excluded.gym_id, updated_at = now();

  update public.students s
    set portal_access_enabled = true, updated_at = now()
    where s.id = v_invite.student_id;

  update public.student_portal_invites spi
    set status = 'accepted',
        accepted_at = now(),
        accepted_user_id = v_user_id,
        updated_at = now()
    where spi.id = v_invite.id;

  if to_regclass('public.audit_logs') is not null then
    insert into public.audit_logs (
      organization_id, gym_id, actor_profile_id, action, entity_table, entity_id, metadata
    ) values (
      v_invite.organization_id, v_invite.gym_id, v_user_id,
      'student_portal_invite.accepted', 'student_portal_invites', v_invite.id,
      jsonb_build_object('student_id', v_invite.student_id)
    );
  end if;

  return query
  select v_invite.organization_id, v_invite.gym_id, v_invite.student_id;
end;
$$;

grant execute on function public.accept_student_portal_invite(uuid)
  to authenticated;

-- resend_student_portal_invite: this is the one observed failing live with
-- 42702 "column reference \"id\" is ambiguous".
create or replace function public.resend_student_portal_invite(p_invite_id uuid)
returns table (
  id uuid,
  invite_token uuid,
  status text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_invite public.student_portal_invites%rowtype;
begin
  select * into v_invite
  from public.student_portal_invites spi
  where spi.id = p_invite_id;

  if v_invite.id is null then
    raise exception 'Invite not found';
  end if;

  if not public.can_manage_gym_students(v_invite.gym_id) then
    raise exception 'Not authorized to resend invites for this gym';
  end if;

  return query
  select c.id, c.invite_token, c.status, c.expires_at
  from public.create_student_portal_invite(v_invite.student_id, v_invite.email) c;
end;
$$;

grant execute on function public.resend_student_portal_invite(uuid)
  to authenticated;

-- cancel_student_portal_invite: returns void (no output-column conflict) but
-- recreated with the directive for consistency and future-proofing.
create or replace function public.cancel_student_portal_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_actor uuid := auth.uid();
  v_invite public.student_portal_invites%rowtype;
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  select * into v_invite
  from public.student_portal_invites spi
  where spi.id = p_invite_id;

  if v_invite.id is null then
    raise exception 'Invite not found';
  end if;

  if not public.can_manage_gym_students(v_invite.gym_id) then
    raise exception 'Not authorized to cancel invites for this gym';
  end if;

  if v_invite.status <> 'pending' then
    return;
  end if;

  update public.student_portal_invites spi
    set status = 'cancelled', updated_at = now()
    where spi.id = p_invite_id;

  if to_regclass('public.audit_logs') is not null then
    insert into public.audit_logs (
      organization_id, gym_id, actor_profile_id, action, entity_table, entity_id, metadata
    ) values (
      v_invite.organization_id, v_invite.gym_id, v_actor,
      'student_portal_invite.cancelled', 'student_portal_invites', v_invite.id,
      jsonb_build_object('student_id', v_invite.student_id)
    );
  end if;
end;
$$;

grant execute on function public.cancel_student_portal_invite(uuid)
  to authenticated;

-- disable_student_portal_access: keeps the link rows but marks them disabled
-- so the admin UI can still show history; the students RLS gate keys off
-- portal_access_enabled so access is revoked either way.
create or replace function public.disable_student_portal_access(p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_actor uuid := auth.uid();
  v_student public.students%rowtype;
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  select * into v_student from public.students s where s.id = p_student_id;
  if v_student.id is null then
    raise exception 'Student not found';
  end if;

  if not public.can_manage_gym_students(v_student.gym_id) then
    raise exception 'Not authorized to manage this student';
  end if;

  update public.student_user_links sul
    set status = 'disabled', updated_at = now()
    where sul.student_id = p_student_id;

  update public.student_portal_invites spi
    set status = 'cancelled', updated_at = now()
    where spi.student_id = p_student_id and spi.status = 'pending';

  update public.students s
    set portal_access_enabled = false, updated_at = now()
    where s.id = p_student_id;

  if to_regclass('public.audit_logs') is not null then
    insert into public.audit_logs (
      organization_id, gym_id, actor_profile_id, action, entity_table, entity_id, metadata
    ) values (
      v_student.organization_id, v_student.gym_id, v_actor,
      'student_portal_access.disabled', 'students', v_student.id,
      jsonb_build_object('student_id', v_student.id)
    );
  end if;
end;
$$;

grant execute on function public.disable_student_portal_access(uuid)
  to authenticated;

-- ----------------------------------------------------------------------------
-- 4. Students portal SELECT policy: require an active link
-- ----------------------------------------------------------------------------
-- Same shape as before but the self-link branch now also requires
-- student_user_links.status = 'active' so disabled links lose access even if
-- portal_access_enabled is later re-enabled for a different login.
drop policy if exists "students_select_linked_portal" on public.students;
create policy "students_select_linked_portal"
on public.students for select
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or public.is_gym_member(gym_id)
  or (
    portal_access_enabled = true
    and exists (
      select 1 from public.student_user_links sul
      where sul.student_id = students.id
        and sul.profile_id = auth.uid()
        and sul.status = 'active'
    )
  )
  or (
    portal_access_enabled = true
    and to_regclass('public.parent_user_links') is not null
    and to_regclass('public.family_members') is not null
    and exists (
      select 1
      from public.parent_user_links pul
      join public.family_members fm on fm.family_id = pul.family_id
      where fm.student_id = students.id
        and pul.profile_id = auth.uid()
    )
  )
);

-- ----------------------------------------------------------------------------
-- 5. RLS gaps (verified against hosted pg_policies)
-- ----------------------------------------------------------------------------
-- student_user_links/parent_user_links were only visible to the linked user
-- and org members. Gym staff need them for the Portal Access panel, and
-- platform admins need them for /admin/users account classification.
drop policy if exists "student_user_links_select_own" on public.student_user_links;
create policy "student_user_links_select_own"
on public.student_user_links for select
using (
  profile_id = auth.uid()
  or public.is_org_member(organization_id)
  or public.is_platform_super_admin()
  or (gym_id is not null and public.is_gym_member(gym_id))
);

drop policy if exists "parent_user_links_select_own" on public.parent_user_links;
create policy "parent_user_links_select_own"
on public.parent_user_links for select
using (
  profile_id = auth.uid()
  or public.is_org_member(organization_id)
  or public.is_platform_super_admin()
);

-- profiles could only be updated by their owner, so the /admin/users
-- "disable user" action silently failed for platform admins.
drop policy if exists "profiles_update_platform_admin" on public.profiles;
create policy "profiles_update_platform_admin"
on public.profiles for update
using (public.is_platform_super_admin())
with check (public.is_platform_super_admin());

-- ----------------------------------------------------------------------------
-- 6. PostgREST schema reload
-- ----------------------------------------------------------------------------
notify pgrst, 'reload schema';
