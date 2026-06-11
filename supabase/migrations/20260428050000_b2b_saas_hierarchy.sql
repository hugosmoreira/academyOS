-- ════════════════════════════════════════════════════════════════
--  B2B SaaS Hierarchy
--  Builds on 20260428020000 (initial schema) + 20260428040000
--  (auth restructure). Adds the missing pieces for a professional
--  multi-tenant product:
--
--    * sales_leads + public submit RPC + convert RPC
--    * platform_members + has_platform_role / is_platform_admin helpers
--    * parent_student_links + backfill from family_members
--    * Expanded role seed (sales/support/platform admins, org admin,
--      billing manager, gym_owner, head_coach, coach, assistant_coach,
--      billing_staff) + role_permissions
--    * profiles.status, gyms.state alias (kept as column for compat)
--    * Indexes for hot lookups
--    * Permissive platform-admin RLS on new tables; tighter rules
--      land in a follow-up migration once the UI is stable.
--
--  PARTIAL-DB SAFE: If your hosted project skipped parts of the
--  initial schema (e.g. parent_user_links), optional backfills and
--  permission grants are skipped instead of failing the whole script.
-- ════════════════════════════════════════════════════════════════

-- ------------------------------------------------------------------
-- 0. Prerequisite helpers (no-op when already applied from 20260428020000)
-- ------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_platform_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select true from public.profiles
      where id = auth.uid()
        and platform_role = 'platform_super_admin'
      limit 1
    ),
    false
  );
$$;

create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_super_admin()
    or exists (
      select 1 from public.organization_members om
      where om.organization_id = p_org_id
        and om.profile_id = auth.uid()
        and om.status = 'active'
    );
$$;

create or replace function public.has_org_role(p_org_id uuid, p_role_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_super_admin()
    or exists (
      select 1
      from public.organization_members om
      join public.roles r on r.id = om.role_id
      where om.organization_id = p_org_id
        and om.profile_id = auth.uid()
        and om.status = 'active'
        and r.key = p_role_key
    );
$$;

-- ------------------------------------------------------------------
-- 1. profiles.status column (active / inactive / pending / suspended)
-- ------------------------------------------------------------------
alter table public.profiles
  add column if not exists status text not null default 'active';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_status_check
      check (status in ('active', 'inactive', 'pending', 'suspended'));
  end if;
end$$;

-- ------------------------------------------------------------------
-- 2. sales_leads table
-- ------------------------------------------------------------------
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

create index if not exists sales_leads_email_idx
  on public.sales_leads (lower(email));

drop trigger if exists set_updated_at_sales_leads on public.sales_leads;
create trigger set_updated_at_sales_leads
  before update on public.sales_leads
  for each row execute function public.set_updated_at();

alter table public.sales_leads enable row level security;

drop policy if exists "sales_leads_select_platform_admin" on public.sales_leads;
create policy "sales_leads_select_platform_admin"
on public.sales_leads for select
using (public.is_platform_super_admin());

drop policy if exists "sales_leads_modify_platform_admin" on public.sales_leads;
create policy "sales_leads_modify_platform_admin"
on public.sales_leads for all
using (public.is_platform_super_admin())
with check (public.is_platform_super_admin());

-- ------------------------------------------------------------------
-- 3. platform_members table (normalized platform-level roles)
-- ------------------------------------------------------------------
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

create index if not exists platform_members_profile_status_idx
  on public.platform_members (profile_id, status);

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

-- Backfill from the legacy profiles.platform_role column.
insert into public.platform_members (profile_id, role_key, status)
select id, platform_role, 'active'
from public.profiles
where platform_role is not null
on conflict (profile_id, role_key) do nothing;

-- ------------------------------------------------------------------
-- 4. parent_student_links table (+ optional backfill from family model)
--    Skipped entirely when public.students is missing.
--    Backfill skipped when parent_user_links / family_members missing
--    (common on partial hosted schemas).
-- ------------------------------------------------------------------
do $$
begin
  if to_regclass('public.students') is null then
    raise notice 'Skipping parent_student_links: public.students not found';
    return;
  end if;

  create table if not exists public.parent_student_links (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    parent_profile_id uuid not null references public.profiles(id) on delete cascade,
    student_id uuid not null references public.students(id) on delete cascade,
    relationship text,
    created_at timestamptz not null default now(),
    unique (parent_profile_id, student_id)
  );

  create index if not exists parent_student_links_parent_idx
    on public.parent_student_links (parent_profile_id);

  create index if not exists parent_student_links_student_idx
    on public.parent_student_links (student_id);

  alter table public.parent_student_links enable row level security;

  drop policy if exists "parent_student_links_select" on public.parent_student_links;
  create policy "parent_student_links_select"
  on public.parent_student_links for select
  using (
    public.is_platform_super_admin()
    or parent_profile_id = auth.uid()
    or public.is_org_member(organization_id)
  );

  drop policy if exists "parent_student_links_modify" on public.parent_student_links;
  create policy "parent_student_links_modify"
  on public.parent_student_links for all
  using (
    public.is_platform_super_admin()
    or public.is_org_member(organization_id)
  )
  with check (
    public.is_platform_super_admin()
    or public.is_org_member(organization_id)
  );

  if to_regclass('public.parent_user_links') is not null
     and to_regclass('public.family_members') is not null
  then
    insert into public.parent_student_links (organization_id, parent_profile_id, student_id, relationship)
    select pul.organization_id, pul.profile_id, fm.student_id, fm.relationship
    from public.parent_user_links pul
    join public.family_members fm on fm.family_id = pul.family_id
    where fm.student_id is not null
    on conflict (parent_profile_id, student_id) do nothing;
  else
    raise notice 'Skipping parent_student_links backfill: parent_user_links or family_members not found';
  end if;
end$$;

-- ------------------------------------------------------------------
-- 5. Expanded role seed
--    Add roles requested by the B2B hierarchy plan. Keep legacy keys
--    (instructor, gym_admin) for backwards compatibility.
-- ------------------------------------------------------------------
do $$
begin
  if to_regclass('public.roles') is null then
    raise notice 'Skipping expanded roles seed: public.roles not found';
    return;
  end if;

  insert into public.roles (key, name, scope, description) values
    ('platform_admin',                'Platform Admin',                'platform',     'Cross-tenant operational admin.'),
    ('sales_admin',                   'Sales Admin',                   'platform',     'Manages sales leads and onboarding pipeline.'),
    ('support_admin',                 'Support Admin',                 'platform',     'Read-only cross-tenant support agent.'),
    ('organization_admin',            'Organization Admin',            'organization', 'Non-owner organization administrator.'),
    ('organization_billing_manager',  'Organization Billing Manager',  'organization', 'Billing and revenue admin for an organization.'),
    ('gym_owner',                     'Gym Owner',                     'gym',          'Owns a single gym location.'),
    ('head_coach',                    'Head Coach',                    'gym',          'Lead instructor responsible for programs and promotions.'),
    ('coach',                         'Coach',                         'gym',          'Instructor with class and student management access.'),
    ('assistant_coach',               'Assistant Coach',               'gym',          'Limited instructor with attendance access only.'),
    ('billing_staff',                 'Billing Staff',                 'gym',          'Front-of-house billing and collections specialist.')
  on conflict (key) do update set
    name = excluded.name,
    scope = excluded.scope,
    description = excluded.description;

  if to_regclass('public.permissions') is null
     or to_regclass('public.role_permissions') is null then
    raise notice 'Skipping role_permissions grants: permissions tables not found';
    return;
  end if;

  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id
  from public.roles r
  cross join public.permissions p
  where r.key in ('platform_admin', 'organization_admin')
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id
  from public.roles r
  join public.permissions p
    on p.key in ('manage:leads', 'view:reports')
  where r.key = 'sales_admin'
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id
  from public.roles r
  join public.permissions p on p.key = 'view:reports'
  where r.key = 'support_admin'
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id
  from public.roles r
  join public.permissions p
    on p.key in ('manage:billing', 'view:reports')
  where r.key = 'organization_billing_manager'
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id
  from public.roles r
  join public.permissions p
    on p.key in (
      'manage:gyms', 'manage:gym_members', 'manage:students',
      'manage:families', 'manage:leads', 'manage:programs',
      'manage:classes', 'manage:attendance', 'manage:billing',
      'manage:waivers', 'manage:events', 'manage:messaging',
      'view:reports'
    )
  where r.key = 'gym_owner'
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id
  from public.roles r
  join public.permissions p
    on p.key in (
      'manage:students', 'manage:programs', 'manage:classes',
      'manage:attendance', 'manage:events', 'view:reports'
    )
  where r.key = 'head_coach'
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id
  from public.roles r
  join public.permissions p
    on p.key in ('manage:classes', 'manage:attendance', 'manage:students')
  where r.key = 'coach'
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id
  from public.roles r
  join public.permissions p on p.key = 'manage:attendance'
  where r.key = 'assistant_coach'
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id
  from public.roles r
  join public.permissions p
    on p.key in ('manage:billing', 'manage:leads')
  where r.key = 'billing_staff'
  on conflict do nothing;
end$$;

-- ------------------------------------------------------------------
-- 6. Helper functions: has_platform_role / is_platform_admin
--    Dual-read against platform_members and legacy profiles.platform_role.
-- ------------------------------------------------------------------
create or replace function public.has_platform_role(p_role_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select true from public.platform_members pm
      where pm.profile_id = auth.uid()
        and pm.status = 'active'
        and pm.role_key = p_role_key
      limit 1
    ),
    (
      select case when p_role_key = 'platform_super_admin'
             then exists (
               select 1 from public.profiles
               where id = auth.uid()
                 and platform_role = 'platform_super_admin'
             )
             else false end
    )
  );
$$;

grant execute on function public.has_platform_role(text) to authenticated;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_platform_role('platform_super_admin')
      or public.has_platform_role('platform_admin');
$$;

grant execute on function public.is_platform_admin() to authenticated;

-- ------------------------------------------------------------------
-- 7. submit_sales_lead() — public RPC for /book-demo
-- ------------------------------------------------------------------
create or replace function public.submit_sales_lead(
  p_full_name text,
  p_email text,
  p_phone text default null,
  p_academy_name text default null,
  p_message text default null,
  p_source text default 'book_demo'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text := trim(coalesce(p_full_name, ''));
  v_email text := lower(trim(coalesce(p_email, '')));
  v_lead_id uuid;
begin
  if length(v_full_name) = 0 then
    raise exception 'Full name is required';
  end if;
  if length(v_email) = 0 or v_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    raise exception 'Valid email is required';
  end if;

  insert into public.sales_leads (
    full_name, email, phone, academy_name, message, source
  ) values (
    v_full_name,
    v_email,
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

-- ------------------------------------------------------------------
-- 8. convert_sales_lead_to_organization() — admin-only convert flow
-- ------------------------------------------------------------------
create or replace function public.convert_sales_lead_to_organization(
  p_lead_id uuid,
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
  v_lead public.sales_leads%rowtype;
  v_bundle record;
begin
  if not public.is_platform_super_admin() then
    raise exception 'Only platform super admins can convert leads';
  end if;

  select * into v_lead from public.sales_leads where id = p_lead_id;
  if v_lead.id is null then
    raise exception 'Sales lead % not found', p_lead_id;
  end if;
  if v_lead.status = 'converted' then
    raise exception 'Sales lead already converted';
  end if;

  select * into v_bundle from public.admin_create_organization_bundle(
    p_org_name,
    p_org_slug,
    p_gym_name,
    p_gym_slug,
    coalesce(p_owner_email, v_lead.email),
    coalesce(p_owner_full_name, v_lead.full_name),
    p_gym_timezone
  );

  update public.sales_leads
    set status = 'converted',
        converted_organization_id = v_bundle.organization_id,
        updated_at = now()
    where id = p_lead_id;

  insert into public.audit_logs (
    organization_id, actor_profile_id, action, entity_table, entity_id, metadata
  ) values (
    v_bundle.organization_id, auth.uid(),
    'sales_lead.converted', 'sales_leads', p_lead_id,
    jsonb_build_object(
      'organization_id', v_bundle.organization_id,
      'gym_id', v_bundle.gym_id,
      'invite_id', v_bundle.invite_id
    )
  );

  return query select
    v_bundle.organization_id,
    v_bundle.gym_id,
    v_bundle.invite_id,
    v_bundle.invite_token;
end;
$$;

grant execute on function public.convert_sales_lead_to_organization(
  uuid, text, text, text, text, text, text, text
) to authenticated;

-- ------------------------------------------------------------------
-- 9. Replace accept_organization_invite() to handle expanded roles.
--    Org-scoped admin roles -> organization_members. Gym-scoped roles
--    (including the new ones) -> gym_members. Org owners also get a
--    gym_admin row when invite carries a gym.
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
  v_role_scope text;
  v_role_id uuid;
  v_gym_role_id uuid;
  v_gym_role_key text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select email into v_user_email from auth.users where id = v_user_id;
  if v_user_email is null then
    raise exception 'Authenticated user has no email';
  end if;

  select * into v_invite from public.organization_invites where token = p_token limit 1;
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

  select scope, id into v_role_scope, v_role_id
    from public.roles where key = v_invite.role_key;
  if v_role_id is null then
    raise exception 'Unknown role_key %', v_invite.role_key;
  end if;

  -- Organization-scoped roles -> organization_members.
  if v_role_scope = 'organization' then
    insert into public.organization_members (organization_id, profile_id, role_id, status)
    values (v_invite.organization_id, v_user_id, v_role_id, 'active')
    on conflict (organization_id, profile_id) do update
      set role_id = excluded.role_id, status = 'active', updated_at = now();
  end if;

  -- If invite ships with a gym, also create a gym_members row.
  -- Owners default to gym_admin on the named gym for backwards compat.
  if v_invite.gym_id is not null then
    if v_role_scope = 'gym' then
      v_gym_role_key := v_invite.role_key;
    elsif v_invite.role_key = 'organization_owner' then
      v_gym_role_key := 'gym_admin';
    else
      v_gym_role_key := null;
    end if;

    if v_gym_role_key is not null then
      select id into v_gym_role_id from public.roles where key = v_gym_role_key;
      if v_gym_role_id is not null then
        insert into public.gym_members (organization_id, gym_id, profile_id, role_id, status)
        values (v_invite.organization_id, v_invite.gym_id, v_user_id, v_gym_role_id, 'active')
        on conflict (gym_id, profile_id) do update
          set role_id = excluded.role_id, status = 'active', updated_at = now();
      end if;
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
  ) values (
    v_invite.organization_id, v_invite.gym_id, v_user_id,
    'invite.accepted', 'organization_invites', v_invite.id,
    jsonb_build_object('role_key', v_invite.role_key)
  );

  return query select v_invite.organization_id, v_invite.gym_id, v_invite.role_key;
end;
$$;

grant execute on function public.accept_organization_invite(uuid) to authenticated;

-- ------------------------------------------------------------------
-- 10. Update get_platform_stats() to include sales lead counts.
-- ------------------------------------------------------------------
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
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pending_invites bigint := 0;
begin
  if to_regclass('public.organization_invites') is not null then
    select count(*) into v_pending_invites
    from public.organization_invites
    where status = 'pending';
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

-- Reload PostgREST schema cache after creating new tables
notify pgrst, 'reload schema';

-- ------------------------------------------------------------------
-- 11. assign_org_member / assign_gym_member / set_platform_role
--     Convenience admin RPCs so the UI never writes membership rows
--     directly (keeps RLS simple and audit-trail consistent).
-- ------------------------------------------------------------------
create or replace function public.assign_org_member(
  p_organization_id uuid,
  p_profile_id uuid,
  p_role_key text,
  p_status text default 'active'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role_id uuid;
  v_membership_id uuid;
begin
  if not (public.is_platform_super_admin()
          or public.has_org_role(p_organization_id, 'organization_owner')) then
    raise exception 'Only org owners or platform admins can assign organization roles';
  end if;

  select id into v_role_id from public.roles where key = p_role_key;
  if v_role_id is null then
    raise exception 'Unknown role_key %', p_role_key;
  end if;

  insert into public.organization_members (organization_id, profile_id, role_id, status)
  values (p_organization_id, p_profile_id, v_role_id, coalesce(p_status, 'active'))
  on conflict (organization_id, profile_id) do update
    set role_id = excluded.role_id,
        status = excluded.status,
        updated_at = now()
  returning id into v_membership_id;

  insert into public.audit_logs (
    organization_id, actor_profile_id, action, entity_table, entity_id, metadata
  ) values (
    p_organization_id, auth.uid(),
    'organization_member.assigned', 'organization_members', v_membership_id,
    jsonb_build_object('profile_id', p_profile_id, 'role_key', p_role_key)
  );

  return v_membership_id;
end;
$$;

grant execute on function public.assign_org_member(uuid, uuid, text, text) to authenticated;

create or replace function public.assign_gym_member(
  p_gym_id uuid,
  p_profile_id uuid,
  p_role_key text,
  p_status text default 'active'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_role_id uuid;
  v_membership_id uuid;
begin
  select organization_id into v_org_id from public.gyms where id = p_gym_id;
  if v_org_id is null then
    raise exception 'Gym % not found', p_gym_id;
  end if;

  if not (public.is_platform_super_admin()
          or public.has_org_role(v_org_id, 'organization_owner')
          or public.has_org_role(v_org_id, 'organization_admin')) then
    raise exception 'Only org owners/admins or platform admins can assign gym roles';
  end if;

  select id into v_role_id from public.roles where key = p_role_key;
  if v_role_id is null then
    raise exception 'Unknown role_key %', p_role_key;
  end if;

  insert into public.gym_members (organization_id, gym_id, profile_id, role_id, status)
  values (v_org_id, p_gym_id, p_profile_id, v_role_id, coalesce(p_status, 'active'))
  on conflict (gym_id, profile_id) do update
    set role_id = excluded.role_id,
        status = excluded.status,
        updated_at = now()
  returning id into v_membership_id;

  insert into public.audit_logs (
    organization_id, gym_id, actor_profile_id, action, entity_table, entity_id, metadata
  ) values (
    v_org_id, p_gym_id, auth.uid(),
    'gym_member.assigned', 'gym_members', v_membership_id,
    jsonb_build_object('profile_id', p_profile_id, 'role_key', p_role_key)
  );

  return v_membership_id;
end;
$$;

grant execute on function public.assign_gym_member(uuid, uuid, text, text) to authenticated;

create or replace function public.set_platform_member(
  p_profile_id uuid,
  p_role_key text,
  p_status text default 'active'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_platform_super_admin() then
    raise exception 'Only platform super admins can manage platform roles';
  end if;

  insert into public.platform_members (profile_id, role_key, status, granted_by)
  values (p_profile_id, p_role_key, coalesce(p_status, 'active'), auth.uid())
  on conflict (profile_id, role_key) do update
    set status = excluded.status,
        updated_at = now()
  returning id into v_id;

  -- Keep profiles.platform_role mirrored for legacy code paths.
  if p_role_key = 'platform_super_admin' and coalesce(p_status, 'active') = 'active' then
    update public.profiles set platform_role = 'platform_super_admin'
      where id = p_profile_id;
  end if;

  insert into public.audit_logs (
    actor_profile_id, action, entity_table, entity_id, metadata
  ) values (
    auth.uid(),
    'platform_member.set', 'platform_members', v_id,
    jsonb_build_object('profile_id', p_profile_id, 'role_key', p_role_key, 'status', p_status)
  );

  return v_id;
end;
$$;

grant execute on function public.set_platform_member(uuid, text, text) to authenticated;
