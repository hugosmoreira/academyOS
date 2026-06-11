-- ============================================================================
-- AcademyOS: Legacy Setup Script
--
-- DEPRECATED: This script predates the formal migrations in
-- supabase/migrations/ and contains a dangerous handle_new_user() that
-- automatically grants organization_owner / gym_admin on the seed
-- "elite-discipline" org to every new auth user.
--
-- DO NOT RUN against a fresh database. The canonical setup is:
--
--   1. supabase/migrations/20260428020000_initial_multi_tenant_schema.sql
--   2. supabase/migrations/20260428030000_add_student_belt_stripes.sql
--   3. supabase/migrations/20260428040000_auth_onboarding_restructure.sql
--   4. supabase/seed.sql
--
-- The phase-1 onboarding migration ships a safe profile-only
-- handle_new_user() trigger and removes auto org-owner assignment.
-- If you previously ran this script, run the new migration to overwrite
-- the trigger.
-- ============================================================================


-- ════════════════════════════════════════════════════════════════
--  STEP 1: Add missing columns to existing tables
-- ════════════════════════════════════════════════════════════════

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists platform_role text;
alter table public.profiles add column if not exists updated_at timestamptz default now();

alter table public.organizations add column if not exists status text default 'active';
alter table public.organizations add column if not exists updated_at timestamptz default now();

alter table public.gyms add column if not exists timezone text default 'America/Los_Angeles';
alter table public.gyms add column if not exists status text default 'active';
alter table public.gyms add column if not exists updated_at timestamptz default now();

alter table public.students add column if not exists updated_at timestamptz default now();


-- ════════════════════════════════════════════════════════════════
--  STEP 2: Create the 3 missing tables the app requires
-- ════════════════════════════════════════════════════════════════

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  scope text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table if not exists public.gym_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gym_id, profile_id)
);


-- ════════════════════════════════════════════════════════════════
--  STEP 3: RLS helper functions
-- ════════════════════════════════════════════════════════════════

create or replace function public.is_platform_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and platform_role = 'platform_super_admin'
  );
$$;

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_platform_super_admin()
    or exists (
      select 1 from public.organization_members om
      where om.organization_id = target_organization_id
        and om.profile_id = auth.uid()
        and om.status = 'active'
    );
$$;

create or replace function public.has_org_role(target_organization_id uuid, role_key text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_platform_super_admin()
    or exists (
      select 1 from public.organization_members om
      join public.roles r on r.id = om.role_id
      where om.organization_id = target_organization_id
        and om.profile_id = auth.uid()
        and om.status = 'active'
        and r.key = role_key
    );
$$;


-- ════════════════════════════════════════════════════════════════
--  STEP 4: Enable RLS + policies
-- ════════════════════════════════════════════════════════════════

-- New tables
alter table public.roles enable row level security;
alter table public.organization_members enable row level security;
alter table public.gym_members enable row level security;

-- Existing tables
alter table public.organizations enable row level security;
alter table public.gyms enable row level security;
alter table public.students enable row level security;
alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.families enable row level security;
alter table public.ranks enable row level security;
alter table public.membership_plans enable row level security;
alter table public.class_templates enable row level security;
alter table public.class_sessions enable row level security;
alter table public.attendance_records enable row level security;

-- Policies on new tables (always safe — tables were just created)
create policy "roles_read" on public.roles for select to authenticated using (true);
create policy "org_members_read" on public.organization_members for select using (public.is_org_member(organization_id));
create policy "org_members_write" on public.organization_members for all using (public.has_org_role(organization_id, 'organization_owner')) with check (public.has_org_role(organization_id, 'organization_owner'));
create policy "gym_members_read" on public.gym_members for select using (public.is_org_member(organization_id));
create policy "gym_members_write" on public.gym_members for all using (public.has_org_role(organization_id, 'organization_owner')) with check (public.has_org_role(organization_id, 'organization_owner'));

-- Policies on existing tables (use exception handler in case AI Studio already created some)
do $$ begin execute 'create policy "orgs_read" on public.organizations for select using (public.is_org_member(id))'; exception when duplicate_object then null; end $$;
do $$ begin execute 'create policy "gyms_read" on public.gyms for select using (public.is_org_member(organization_id))'; exception when duplicate_object then null; end $$;
do $$ begin execute 'create policy "students_read" on public.students for select using (public.is_org_member(organization_id))'; exception when duplicate_object then null; end $$;
do $$ begin execute 'create policy "students_ins" on public.students for insert with check (public.is_org_member(organization_id))'; exception when duplicate_object then null; end $$;
do $$ begin execute 'create policy "students_upd" on public.students for update using (public.is_org_member(organization_id))'; exception when duplicate_object then null; end $$;
do $$ begin execute 'create policy "students_del" on public.students for delete using (public.is_org_member(organization_id))'; exception when duplicate_object then null; end $$;
do $$ begin execute 'create policy "profiles_read" on public.profiles for select using (id = auth.uid() or public.is_platform_super_admin())'; exception when duplicate_object then null; end $$;
do $$ begin execute 'create policy "profiles_upd" on public.profiles for update using (id = auth.uid())'; exception when duplicate_object then null; end $$;
do $$ begin execute 'create policy "profiles_ins" on public.profiles for insert with check (id = auth.uid())'; exception when duplicate_object then null; end $$;
do $$ begin execute 'create policy "programs_read" on public.programs for select using (public.is_org_member(organization_id))'; exception when duplicate_object then null; end $$;
do $$ begin execute 'create policy "families_read" on public.families for select using (public.is_org_member(organization_id))'; exception when duplicate_object then null; end $$;
do $$ begin execute 'create policy "plans_read" on public.membership_plans for select using (public.is_org_member(organization_id))'; exception when duplicate_object then null; end $$;
do $$ begin execute 'create policy "templates_read" on public.class_templates for select using (public.is_org_member(organization_id))'; exception when duplicate_object then null; end $$;

-- class_sessions and attendance_records don't have organization_id,
-- so use a simpler policy: allow any authenticated user to read
do $$ begin execute 'create policy "sessions_read" on public.class_sessions for select to authenticated using (true)'; exception when duplicate_object then null; end $$;
do $$ begin execute 'create policy "attendance_read" on public.attendance_records for select to authenticated using (true)'; exception when duplicate_object then null; end $$;
do $$ begin execute 'create policy "ranks_read" on public.ranks for select to authenticated using (true)'; exception when duplicate_object then null; end $$;


-- ════════════════════════════════════════════════════════════════
--  STEP 5: Auth triggers
-- ════════════════════════════════════════════════════════════════

-- 5a. Auto-confirm new signups (no email verification needed)
create or replace function public.auto_confirm_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update auth.users
  set email_confirmed_at = now(),
      confirmation_sent_at = now(),
      raw_app_meta_data = raw_app_meta_data || '{"provider":"email","providers":["email"]}'::jsonb
  where id = new.id and email_confirmed_at is null;
  return new;
end; $$;

drop trigger if exists auto_confirm_user_trigger on auth.users;
create trigger auto_confirm_user_trigger
  after insert on auth.users
  for each row execute function public.auto_confirm_user();

-- Confirm existing unconfirmed users
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now()),
    confirmation_sent_at = coalesce(confirmation_sent_at, now())
where email_confirmed_at is null;

-- 5b. Auto-create profile + assign org membership on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_org_id uuid;
  v_gym_id uuid;
  v_owner_role_id uuid;
  v_admin_role_id uuid;
begin
  -- Create profile row
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), profiles.full_name);

  -- Look up the seed org/gym/roles by slug/key (not hardcoded UUIDs)
  select id into v_org_id from public.organizations where slug = 'elite-discipline' limit 1;
  select id into v_owner_role_id from public.roles where key = 'organization_owner';
  select id into v_admin_role_id from public.roles where key = 'gym_admin';

  if v_org_id is not null and v_owner_role_id is not null then
    insert into public.organization_members (organization_id, profile_id, role_id, status)
    values (v_org_id, new.id, v_owner_role_id, 'active')
    on conflict (organization_id, profile_id) do nothing;

    select id into v_gym_id from public.gyms
    where organization_id = v_org_id and slug = 'hq' limit 1;

    if v_gym_id is not null and v_admin_role_id is not null then
      insert into public.gym_members (organization_id, gym_id, profile_id, role_id, status)
      values (v_org_id, v_gym_id, new.id, v_admin_role_id, 'active')
      on conflict (gym_id, profile_id) do nothing;
    end if;
  end if;

  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ════════════════════════════════════════════════════════════════
--  STEP 6: Seed data (dynamic — no hardcoded UUIDs)
-- ════════════════════════════════════════════════════════════════

-- Roles
insert into public.roles (key, name, scope, description) values
  ('platform_super_admin', 'Platform Super Admin', 'platform', 'Internal admin.'),
  ('organization_owner', 'Organization Owner', 'organization', 'Owns an academy.'),
  ('gym_admin', 'Gym Admin', 'gym', 'Manages a gym.'),
  ('instructor', 'Instructor', 'gym', 'Teaches classes.'),
  ('front_desk', 'Front Desk', 'gym', 'Check-ins and billing.'),
  ('student', 'Student', 'portal', 'Student portal.'),
  ('parent', 'Parent', 'portal', 'Parent portal.')
on conflict (key) do nothing;

-- Seed org, gyms, programs, ranks using a DO block so we can use variables
do $$
declare
  v_org_id uuid;
  v_gym1_id uuid;
  v_gym2_id uuid;
  v_prog_id uuid;
begin
  -- Get or create organization
  select id into v_org_id from public.organizations where slug = 'elite-discipline';
  if v_org_id is null then
    insert into public.organizations (name, slug)
    values ('Elite Discipline Association', 'elite-discipline')
    returning id into v_org_id;
  end if;

  -- Get or create HQ gym
  select id into v_gym1_id from public.gyms where organization_id = v_org_id and slug = 'hq';
  if v_gym1_id is null then
    insert into public.gyms (organization_id, name, slug, city, state)
    values (v_org_id, 'Elite Discipline HQ', 'hq', 'San Diego', 'CA')
    returning id into v_gym1_id;
  end if;

  -- Get or create North gym
  select id into v_gym2_id from public.gyms where organization_id = v_org_id and slug = 'north';
  if v_gym2_id is null then
    insert into public.gyms (organization_id, name, slug, city, state)
    values (v_org_id, 'Elite Discipline North', 'north', 'Carlsbad', 'CA')
    returning id into v_gym2_id;
  end if;

  -- Get or create program
  select id into v_prog_id from public.programs where organization_id = v_org_id and name = 'Adult BJJ Fundamentals';
  if v_prog_id is null then
    insert into public.programs (organization_id, gym_id, name)
    values (v_org_id, null, 'Adult BJJ Fundamentals')
    returning id into v_prog_id;
  end if;

  -- Seed ranks for the program
  if not exists (select 1 from public.ranks where program_id = v_prog_id and order_index = 1) then
    insert into public.ranks (program_id, name, order_index) values
      (v_prog_id, 'White Belt', 1),
      (v_prog_id, 'Blue Belt', 2),
      (v_prog_id, 'Purple Belt', 3),
      (v_prog_id, 'Brown Belt', 4),
      (v_prog_id, 'Black Belt', 5);
  end if;

  -- Seed additional programs
  if not exists (select 1 from public.programs where organization_id = v_org_id and name = 'Advanced No-Gi') then
    insert into public.programs (organization_id, gym_id, name) values (v_org_id, null, 'Advanced No-Gi');
  end if;
  if not exists (select 1 from public.programs where organization_id = v_org_id and name = 'Kids Martial Arts') then
    insert into public.programs (organization_id, gym_id, name) values (v_org_id, null, 'Kids Martial Arts');
  end if;
end;
$$;


-- ════════════════════════════════════════════════════════════════
--  STEP 7: Backfill existing users
-- ════════════════════════════════════════════════════════════════

-- Create profile rows for any auth users missing them
insert into public.profiles (id, full_name)
select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', '')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- Set email on profiles
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and (p.email is null or p.email = '');

-- Grant org + gym membership to all existing profiles (dynamic IDs)
do $$
declare
  v_org_id uuid;
  v_gym_id uuid;
  v_owner_role_id uuid;
  v_admin_role_id uuid;
begin
  select id into v_org_id from public.organizations where slug = 'elite-discipline';
  select id into v_gym_id from public.gyms where organization_id = v_org_id and slug = 'hq';
  select id into v_owner_role_id from public.roles where key = 'organization_owner';
  select id into v_admin_role_id from public.roles where key = 'gym_admin';

  if v_org_id is not null and v_owner_role_id is not null then
    insert into public.organization_members (organization_id, profile_id, role_id, status)
    select v_org_id, p.id, v_owner_role_id, 'active'
    from public.profiles p
    on conflict (organization_id, profile_id) do nothing;
  end if;

  if v_gym_id is not null and v_admin_role_id is not null then
    insert into public.gym_members (organization_id, gym_id, profile_id, role_id, status)
    select v_org_id, v_gym_id, p.id, v_admin_role_id, 'active'
    from public.profiles p
    on conflict (gym_id, profile_id) do nothing;
  end if;
end;
$$;


-- ════════════════════════════════════════════════════════════════
--  DONE ✅
-- ════════════════════════════════════════════════════════════════

