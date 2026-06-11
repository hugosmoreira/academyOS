-- ════════════════════════════════════════════════════════════════
--  Hosted Supabase repair (minimum)
--  Run this in SQL Editor when /admin/sales-leads shows 404 errors
--  for sales_leads, student_user_links, or parent_user_links.
--
--  Safe to re-run (idempotent). Does NOT require parent_user_links
--  backfill or the full initial schema.
-- ════════════════════════════════════════════════════════════════

-- Helpers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_platform_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select true from public.profiles
     where id = auth.uid() and platform_role = 'platform_super_admin' limit 1),
    false
  );
$$;

create or replace function public.is_org_member(p_org_id uuid)
returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  if public.is_platform_super_admin() then
    return true;
  end if;
  if to_regclass('public.organization_members') is null then
    return false;
  end if;
  return exists (
    select 1 from public.organization_members om
    where om.organization_id = p_org_id
      and om.profile_id = auth.uid()
      and om.status = 'active'
  );
end;
$$;

-- profiles.status (app expects this column)
alter table public.profiles
  add column if not exists status text not null default 'active';

-- ── sales_leads (required for /admin/sales-leads and /book-demo) ──
create table if not exists public.sales_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  academy_name text,
  message text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'demo_scheduled', 'converted', 'lost')),
  source text not null default 'book_demo',
  assigned_to uuid references public.profiles(id) on delete set null,
  converted_organization_id uuid references public.organizations(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sales_leads_status_created_idx
  on public.sales_leads (status, created_at desc);

drop trigger if exists set_updated_at_sales_leads on public.sales_leads;
create trigger set_updated_at_sales_leads
  before update on public.sales_leads
  for each row execute function public.set_updated_at();

alter table public.sales_leads enable row level security;

drop policy if exists "sales_leads_select_platform_admin" on public.sales_leads;
create policy "sales_leads_select_platform_admin"
on public.sales_leads for select using (public.is_platform_super_admin());

drop policy if exists "sales_leads_modify_platform_admin" on public.sales_leads;
create policy "sales_leads_modify_platform_admin"
on public.sales_leads for all
using (public.is_platform_super_admin())
with check (public.is_platform_super_admin());

-- ── platform_members ──
create table if not exists public.platform_members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_key text not null,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'suspended')),
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, role_key)
);

drop trigger if exists set_updated_at_platform_members on public.platform_members;
create trigger set_updated_at_platform_members
  before update on public.platform_members
  for each row execute function public.set_updated_at();

alter table public.platform_members enable row level security;

drop policy if exists "platform_members_select_self_or_admin" on public.platform_members;
create policy "platform_members_select_self_or_admin"
on public.platform_members for select
using (profile_id = auth.uid() or public.is_platform_super_admin());

drop policy if exists "platform_members_modify_admin" on public.platform_members;
create policy "platform_members_modify_admin"
on public.platform_members for all
using (public.is_platform_super_admin())
with check (public.is_platform_super_admin());

insert into public.platform_members (profile_id, role_key, status)
select id, platform_role, 'active'
from public.profiles
where platform_role is not null
on conflict (profile_id, role_key) do nothing;

-- ── Portal link tables (stops 404 on ProfileProvider count queries) ──
do $$
begin
  if not exists (select 1 from pg_type where typname = 'member_status') then
    create type public.member_status as enum (
      'active', 'inactive', 'prospect', 'suspended', 'archived'
    );
  end if;
end$$;

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  primary_gym_id uuid references public.gyms(id) on delete set null,
  name text not null,
  billing_email text,
  phone text,
  status public.member_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if to_regclass('public.students') is not null then
    create table if not exists public.student_user_links (
      id uuid primary key default gen_random_uuid(),
      organization_id uuid not null references public.organizations(id) on delete cascade,
      student_id uuid not null references public.students(id) on delete cascade,
      profile_id uuid not null references public.profiles(id) on delete cascade,
      created_at timestamptz not null default now(),
      unique (student_id, profile_id)
    );
    alter table public.student_user_links enable row level security;
    drop policy if exists "student_user_links_select_own" on public.student_user_links;
    create policy "student_user_links_select_own"
    on public.student_user_links for select
    using (profile_id = auth.uid() or public.is_org_member(organization_id));
  end if;
end$$;

create table if not exists public.parent_user_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (family_id, profile_id)
);

alter table public.parent_user_links enable row level security;

drop policy if exists "parent_user_links_select_own" on public.parent_user_links;
create policy "parent_user_links_select_own"
on public.parent_user_links for select
using (profile_id = auth.uid() or public.is_org_member(organization_id));

-- ── RPCs ──
create or replace function public.submit_sales_lead(
  p_full_name text,
  p_email text,
  p_phone text default null,
  p_academy_name text default null,
  p_message text default null,
  p_source text default 'book_demo'
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_full_name text := trim(coalesce(p_full_name, ''));
  v_email text := lower(trim(coalesce(p_email, '')));
  v_lead_id uuid;
begin
  if length(v_full_name) = 0 then raise exception 'Full name is required'; end if;
  if length(v_email) = 0 or v_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    raise exception 'Valid email is required';
  end if;
  insert into public.sales_leads (full_name, email, phone, academy_name, message, source)
  values (
    v_full_name, v_email,
    nullif(trim(coalesce(p_phone, '')), ''),
    nullif(trim(coalesce(p_academy_name, '')), ''),
    nullif(trim(coalesce(p_message, '')), ''),
    coalesce(nullif(trim(p_source), ''), 'book_demo')
  )
  returning id into v_lead_id;
  return v_lead_id;
end;
$$;

grant execute on function public.submit_sales_lead(text, text, text, text, text, text)
  to anon, authenticated;

create or replace function public.get_platform_stats()
returns table (
  total_organizations bigint,
  active_organizations bigint,
  total_gyms bigint,
  total_users bigint,
  pending_invites bigint,
  new_sales_leads bigint,
  open_sales_leads bigint
)
language plpgsql security definer set search_path = public as $$
declare
  v_pending_invites bigint := 0;
begin
  if to_regclass('public.organization_invites') is not null then
    select count(*) into v_pending_invites
    from public.organization_invites where status = 'pending';
  end if;

  return query
  select
    (select count(*)::bigint from public.organizations),
    (select count(*)::bigint from public.organizations where status = 'active'),
    (select count(*)::bigint from public.gyms),
    (select count(*)::bigint from public.profiles),
    v_pending_invites,
    (select count(*)::bigint from public.sales_leads where status = 'new'),
    (select count(*)::bigint from public.sales_leads
     where status in ('new', 'contacted', 'demo_scheduled'))
  where public.is_platform_super_admin();
end;
$$;

grant execute on function public.get_platform_stats() to authenticated;

-- Reload PostgREST schema cache so REST API sees new tables immediately
notify pgrst, 'reload schema';
