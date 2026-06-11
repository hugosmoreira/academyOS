-- ════════════════════════════════════════════════════════════════
--  Auth, Routing & Onboarding Restructure
--  Migrates AcademyOS away from the dangerous public-signup →
--  auto-org-owner flow into a platform-admin-driven invite model.
--
--  Adds:
--    * organization_invites table + RLS
--    * Profile-only handle_new_user() trigger (no auto org assignment)
--    * Platform admin policies (gyms / memberships)
--    * admin_create_organization_bundle() RPC
--    * accept_organization_invite() RPC
--    * get_platform_stats() RPC for admin dashboard
--    * Optional gyms.logo_url column
--    * Helpful indexes
-- ════════════════════════════════════════════════════════════════

-- ------------------------------------------------------------------
-- 1. Optional column: gyms.logo_url (used by admin/branding UI later)
-- ------------------------------------------------------------------
alter table public.gyms
  add column if not exists logo_url text;

-- ------------------------------------------------------------------
-- 2. organization_invites table
-- ------------------------------------------------------------------
create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  email text not null,
  full_name text,
  role_key text not null,
  token uuid not null unique default gen_random_uuid(),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  accepted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists organization_invites_token_idx
  on public.organization_invites (token);

create index if not exists organization_invites_email_status_idx
  on public.organization_invites (lower(email), status);

create index if not exists organization_invites_org_idx
  on public.organization_invites (organization_id);

drop trigger if exists set_updated_at_organization_invites on public.organization_invites;
create trigger set_updated_at_organization_invites
  before update on public.organization_invites
  for each row execute function public.set_updated_at();

alter table public.organization_invites enable row level security;

-- Platform admin full CRUD; org owners can manage their own org invites.
drop policy if exists "organization_invites_select_admin_or_owner"
  on public.organization_invites;
create policy "organization_invites_select_admin_or_owner"
on public.organization_invites for select
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
);

drop policy if exists "organization_invites_modify_admin_or_owner"
  on public.organization_invites;
create policy "organization_invites_modify_admin_or_owner"
on public.organization_invites for all
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
)
with check (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
);

-- ------------------------------------------------------------------
-- 3. Platform admin RLS additions (gyms + memberships)
--    The base migration only allowed organization_owner to manage
--    gyms / org members. Platform admin needs to bootstrap orgs.
-- ------------------------------------------------------------------
drop policy if exists "gyms_insert_platform_admin" on public.gyms;
create policy "gyms_insert_platform_admin"
on public.gyms for insert
with check (public.is_platform_super_admin());

drop policy if exists "gyms_update_platform_admin" on public.gyms;
create policy "gyms_update_platform_admin"
on public.gyms for update
using (public.is_platform_super_admin())
with check (public.is_platform_super_admin());

drop policy if exists "organization_members_manage_platform_admin"
  on public.organization_members;
create policy "organization_members_manage_platform_admin"
on public.organization_members for all
using (public.is_platform_super_admin())
with check (public.is_platform_super_admin());

drop policy if exists "gym_members_manage_platform_admin" on public.gym_members;
create policy "gym_members_manage_platform_admin"
on public.gym_members for all
using (public.is_platform_super_admin())
with check (public.is_platform_super_admin());

-- ------------------------------------------------------------------
-- 4. Safe handle_new_user() — profile only, NO auto org assignment.
--    Replaces the dangerous version in supabase/setup.sql.
-- ------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------
-- 5. admin_create_organization_bundle()
--    Platform-admin-only RPC that atomically creates:
--      * organization
--      * first gym
--      * organization_invite for the owner (if email provided)
--    Auth user creation requires the service role, so that step
--    lives in the Edge Function. This RPC covers the dev/no-Edge
--    flow plus the DB writes required by the Edge Function.
-- ------------------------------------------------------------------
create or replace function public.admin_create_organization_bundle(
  p_org_name text,
  p_org_slug text,
  p_gym_name text,
  p_gym_slug text,
  p_owner_email text default null,
  p_owner_full_name text default null,
  p_gym_timezone text default 'America/Los_Angeles'
)
returns table (
  organization_id uuid,
  gym_id uuid,
  invite_id uuid,
  invite_token uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_org_id uuid;
  v_gym_id uuid;
  v_invite_id uuid;
  v_invite_token uuid;
begin
  if not public.is_platform_super_admin() then
    raise exception 'Only platform super admins can create organizations';
  end if;

  insert into public.organizations (name, slug)
  values (p_org_name, p_org_slug)
  returning id into v_org_id;

  insert into public.gyms (organization_id, name, slug, timezone)
  values (v_org_id, p_gym_name, p_gym_slug, coalesce(p_gym_timezone, 'America/Los_Angeles'))
  returning id into v_gym_id;

  if p_owner_email is not null and length(trim(p_owner_email)) > 0 then
    insert into public.organization_invites (
      organization_id,
      gym_id,
      email,
      full_name,
      role_key,
      created_by
    )
    values (
      v_org_id,
      v_gym_id,
      lower(trim(p_owner_email)),
      p_owner_full_name,
      'organization_owner',
      v_actor
    )
    returning id, token into v_invite_id, v_invite_token;
  end if;

  insert into public.audit_logs (
    organization_id, gym_id, actor_profile_id, action, entity_table, entity_id, metadata
  )
  values (
    v_org_id, v_gym_id, v_actor, 'organization.created', 'organizations', v_org_id,
    jsonb_build_object(
      'name', p_org_name,
      'slug', p_org_slug,
      'gym_slug', p_gym_slug,
      'invite_id', v_invite_id
    )
  );

  return query select v_org_id, v_gym_id, v_invite_id, v_invite_token;
end;
$$;

grant execute on function public.admin_create_organization_bundle(
  text, text, text, text, text, text, text
) to authenticated;

-- ------------------------------------------------------------------
-- 6. accept_organization_invite()
--    Called by an authenticated user (matching invite email) to
--    claim their membership. Assigns organization_owner / gym_admin
--    rows based on the invite payload, then marks the invite accepted.
-- ------------------------------------------------------------------
create or replace function public.accept_organization_invite(p_token uuid)
returns table (
  organization_id uuid,
  gym_id uuid,
  role_key text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_user_email text;
  v_invite public.organization_invites%rowtype;
  v_org_role_id uuid;
  v_gym_role_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select email into v_user_email from auth.users where id = v_user_id;
  if v_user_email is null then
    raise exception 'Authenticated user has no email';
  end if;

  select * into v_invite
  from public.organization_invites
  where token = p_token
  limit 1;

  if v_invite.id is null then
    raise exception 'Invite not found';
  end if;

  if v_invite.status <> 'pending' then
    raise exception 'Invite is no longer pending (status: %)', v_invite.status;
  end if;

  if v_invite.expires_at < now() then
    update public.organization_invites
      set status = 'expired', updated_at = now()
      where id = v_invite.id;
    raise exception 'Invite expired';
  end if;

  if lower(v_invite.email) <> lower(v_user_email) then
    raise exception 'Invite email does not match the authenticated user';
  end if;

  -- Resolve role ids
  select id into v_org_role_id from public.roles where key = v_invite.role_key;
  if v_org_role_id is null then
    raise exception 'Unknown role_key %', v_invite.role_key;
  end if;

  -- Insert org membership for owners; downstream roles use gym_members.
  if v_invite.role_key = 'organization_owner' then
    insert into public.organization_members (organization_id, profile_id, role_id, status)
    values (v_invite.organization_id, v_user_id, v_org_role_id, 'active')
    on conflict (organization_id, profile_id) do update
      set role_id = excluded.role_id, status = 'active', updated_at = now();
  end if;

  -- Always set a gym membership when invite carries a gym (owner gets gym_admin too).
  if v_invite.gym_id is not null then
    select id into v_gym_role_id from public.roles
      where key = case when v_invite.role_key = 'organization_owner'
                       then 'gym_admin'
                       else v_invite.role_key end;
    if v_gym_role_id is not null then
      insert into public.gym_members (organization_id, gym_id, profile_id, role_id, status)
      values (v_invite.organization_id, v_invite.gym_id, v_user_id, v_gym_role_id, 'active')
      on conflict (gym_id, profile_id) do update
        set role_id = excluded.role_id, status = 'active', updated_at = now();
    end if;
  end if;

  update public.organization_invites
    set status = 'accepted',
        accepted_at = now(),
        accepted_by = v_user_id,
        updated_at = now()
    where id = v_invite.id;

  insert into public.audit_logs (
    organization_id, gym_id, actor_profile_id, action, entity_table, entity_id, metadata
  )
  values (
    v_invite.organization_id, v_invite.gym_id, v_user_id,
    'invite.accepted', 'organization_invites', v_invite.id,
    jsonb_build_object('role_key', v_invite.role_key)
  );

  return query select v_invite.organization_id, v_invite.gym_id, v_invite.role_key;
end;
$$;

grant execute on function public.accept_organization_invite(uuid) to authenticated;

-- ------------------------------------------------------------------
-- 7. lookup_invite_by_token()
--    Lightweight read used by /signup/invite/:token landing page.
--    Returns just enough metadata to confirm the invite exists,
--    without exposing the full row to anonymous users.
-- ------------------------------------------------------------------
create or replace function public.lookup_invite_by_token(p_token uuid)
returns table (
  organization_name text,
  organization_slug text,
  gym_name text,
  email text,
  full_name text,
  role_key text,
  status text,
  expires_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    o.name as organization_name,
    o.slug as organization_slug,
    g.name as gym_name,
    i.email,
    i.full_name,
    i.role_key,
    i.status,
    i.expires_at
  from public.organization_invites i
  join public.organizations o on o.id = i.organization_id
  left join public.gyms g on g.id = i.gym_id
  where i.token = p_token;
$$;

grant execute on function public.lookup_invite_by_token(uuid) to anon, authenticated;

-- ------------------------------------------------------------------
-- 8. get_platform_stats()
--    Aggregate counts surfaced by the platform admin dashboard.
-- ------------------------------------------------------------------
create or replace function public.get_platform_stats()
returns table (
  total_organizations bigint,
  active_organizations bigint,
  total_gyms bigint,
  total_users bigint,
  pending_invites bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from public.organizations) as total_organizations,
    (select count(*) from public.organizations where status = 'active') as active_organizations,
    (select count(*) from public.gyms) as total_gyms,
    (select count(*) from public.profiles) as total_users,
    (select count(*) from public.organization_invites where status = 'pending') as pending_invites
  where public.is_platform_super_admin();
$$;

grant execute on function public.get_platform_stats() to authenticated;

-- ------------------------------------------------------------------
-- 9. Helpful indexes (idempotent)
-- ------------------------------------------------------------------
create index if not exists organization_members_org_status_idx
  on public.organization_members (organization_id, status);

create index if not exists gym_members_gym_status_idx
  on public.gym_members (gym_id, status);

create index if not exists gym_members_profile_idx
  on public.gym_members (profile_id);

create index if not exists organization_members_profile_idx
  on public.organization_members (profile_id);
