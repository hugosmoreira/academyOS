-- ============================================================================
-- Programs, Ranks, Class Templates, and Student Enrollments
-- ----------------------------------------------------------------------------
-- Operational foundation for the gym admin platform. Verified against the
-- hosted DB on 2026-06-10:
--   * programs:        only id/organization_id/gym_id/name/created_at
--   * ranks:           only id/program_id/name/order_index/created_at
--   * class_templates: id/org/gym/program_id/name/day_of_week/start_time/
--                      end_time/created_at
--   * student_program_enrollments / student_class_enrollments: missing
--   * RLS: all four tables were SELECT-only (no write policies at all), and
--     reads required org membership, locking out gym-scoped staff + portal.
--
-- Naming decisions (matching the live DB and the product spec):
--   * ranks.order_index            (not sort_order)
--   * class_templates.start_time/end_time (not starts_at/ends_at)
--   * student links use rank_id    (not current_rank_id)
--
-- Idempotent; guarded for both the hosted DB and canonical local DBs.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. programs columns
-- ----------------------------------------------------------------------------
alter table public.programs
  add column if not exists description text,
  add column if not exists age_group text
    check (age_group in ('kids', 'teens', 'adults', 'all')),
  add column if not exists training_type text
    check (training_type in ('gi', 'nogi', 'striking', 'mma', 'fitness', 'private')),
  add column if not exists status text not null default 'active'
    check (status in ('active', 'inactive')),
  add column if not exists updated_at timestamptz not null default now();

-- Canonical DBs carry an `active` boolean; keep status in sync once.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'programs' and column_name = 'active'
  ) then
    update public.programs set status = case when active then 'active' else 'inactive' end;
  end if;
end $$;

drop trigger if exists set_updated_at_programs on public.programs;
create trigger set_updated_at_programs
  before update on public.programs
  for each row execute function public.set_updated_at();

create index if not exists programs_gym_id_idx on public.programs (gym_id);

-- ----------------------------------------------------------------------------
-- 2. ranks columns
-- ----------------------------------------------------------------------------
alter table public.ranks
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists gym_id uuid references public.gyms(id) on delete cascade,
  add column if not exists color text,
  add column if not exists order_index integer not null default 0,
  add column if not exists minimum_classes integer,
  add column if not exists minimum_months integer,
  add column if not exists status text not null default 'active'
    check (status in ('active', 'inactive')),
  add column if not exists updated_at timestamptz not null default now();

-- Canonical DBs use sort_order; copy it into order_index once.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ranks' and column_name = 'sort_order'
  ) then
    update public.ranks set order_index = sort_order where order_index = 0;
  end if;
end $$;

update public.ranks r
  set organization_id = p.organization_id,
      gym_id = p.gym_id
  from public.programs p
  where r.program_id = p.id
    and (r.organization_id is null or r.gym_id is null);

drop trigger if exists set_updated_at_ranks on public.ranks;
create trigger set_updated_at_ranks
  before update on public.ranks
  for each row execute function public.set_updated_at();

create index if not exists ranks_program_id_idx on public.ranks (program_id, order_index);

-- ----------------------------------------------------------------------------
-- 3. class_templates columns
-- ----------------------------------------------------------------------------
alter table public.class_templates
  add column if not exists description text,
  add column if not exists instructor_profile_id uuid references public.profiles(id) on delete set null,
  add column if not exists capacity integer,
  add column if not exists day_of_week integer
    check (day_of_week between 0 and 6),
  add column if not exists start_time time,
  add column if not exists end_time time,
  add column if not exists status text not null default 'active'
    check (status in ('active', 'inactive')),
  add column if not exists updated_at timestamptz not null default now();

-- Canonical DBs use starts_at/ends_at (time, not null); copy + relax so the
-- app can write start_time/end_time everywhere.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'class_templates' and column_name = 'starts_at'
  ) then
    update public.class_templates set start_time = starts_at where start_time is null;
    update public.class_templates set end_time = ends_at where end_time is null;
    alter table public.class_templates alter column starts_at drop not null;
    alter table public.class_templates alter column ends_at drop not null;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'class_templates' and column_name = 'active'
  ) then
    update public.class_templates set status = case when active then 'active' else 'inactive' end;
  end if;
end $$;

drop trigger if exists set_updated_at_class_templates on public.class_templates;
create trigger set_updated_at_class_templates
  before update on public.class_templates
  for each row execute function public.set_updated_at();

create index if not exists class_templates_gym_day_idx
  on public.class_templates (gym_id, day_of_week);

-- ----------------------------------------------------------------------------
-- 4. student_program_enrollments
-- ----------------------------------------------------------------------------
create table if not exists public.student_program_enrollments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete restrict,
  rank_id uuid references public.ranks(id) on delete set null,
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  started_at date not null default current_date,
  ended_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, program_id)
);

-- Canonical DBs already have this table (current_rank_id, no gym_id) — align.
alter table public.student_program_enrollments
  add column if not exists gym_id uuid references public.gyms(id) on delete cascade,
  add column if not exists rank_id uuid references public.ranks(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

update public.student_program_enrollments spe
  set gym_id = s.gym_id
  from public.students s
  where spe.student_id = s.id
    and spe.gym_id is null;

drop trigger if exists set_updated_at_student_program_enrollments
  on public.student_program_enrollments;
create trigger set_updated_at_student_program_enrollments
  before update on public.student_program_enrollments
  for each row execute function public.set_updated_at();

create index if not exists student_program_enrollments_student_idx
  on public.student_program_enrollments (student_id, status);
create index if not exists student_program_enrollments_program_idx
  on public.student_program_enrollments (program_id, status);

-- ----------------------------------------------------------------------------
-- 5. student_class_enrollments
-- ----------------------------------------------------------------------------
create table if not exists public.student_class_enrollments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  class_template_id uuid not null references public.class_templates(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, class_template_id)
);

drop trigger if exists set_updated_at_student_class_enrollments
  on public.student_class_enrollments;
create trigger set_updated_at_student_class_enrollments
  before update on public.student_class_enrollments
  for each row execute function public.set_updated_at();

create index if not exists student_class_enrollments_student_idx
  on public.student_class_enrollments (student_id, status);
create index if not exists student_class_enrollments_template_idx
  on public.student_class_enrollments (class_template_id, status);

alter table public.student_program_enrollments enable row level security;
alter table public.student_class_enrollments enable row level security;

-- ----------------------------------------------------------------------------
-- 6. RLS — staff manage, portal users read their own
-- ----------------------------------------------------------------------------
-- Staff write predicate: platform admin, org owner, or gym staff. Programs
-- with gym_id null are org-wide and writable by org owners only.

-- programs ---------------------------------------------------------------
drop policy if exists "programs_read" on public.programs;
drop policy if exists "programs_select" on public.programs;
create policy "programs_select"
on public.programs for select
using (
  public.is_platform_super_admin()
  or public.is_org_member(organization_id)
  or (gym_id is not null and public.is_gym_member(gym_id))
  or exists (
    select 1
    from public.student_program_enrollments spe
    join public.student_user_links sul on sul.student_id = spe.student_id
    where spe.program_id = programs.id
      and sul.profile_id = auth.uid()
      and sul.status = 'active'
  )
);

drop policy if exists "programs_write" on public.programs;
create policy "programs_write"
on public.programs for all
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or (gym_id is not null and public.is_gym_member(gym_id))
)
with check (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or (gym_id is not null and public.is_gym_member(gym_id))
);

-- ranks --------------------------------------------------------------------
drop policy if exists "ranks_read" on public.ranks;
drop policy if exists "ranks_select" on public.ranks;
create policy "ranks_select"
on public.ranks for select
using (
  public.is_platform_super_admin()
  or (organization_id is not null and public.is_org_member(organization_id))
  or (gym_id is not null and public.is_gym_member(gym_id))
  or exists (
    select 1
    from public.student_program_enrollments spe
    join public.student_user_links sul on sul.student_id = spe.student_id
    where spe.program_id = ranks.program_id
      and sul.profile_id = auth.uid()
      and sul.status = 'active'
  )
);

drop policy if exists "ranks_write" on public.ranks;
create policy "ranks_write"
on public.ranks for all
using (
  public.is_platform_super_admin()
  or (organization_id is not null and public.has_org_role(organization_id, 'organization_owner'))
  or (gym_id is not null and public.is_gym_member(gym_id))
)
with check (
  public.is_platform_super_admin()
  or (organization_id is not null and public.has_org_role(organization_id, 'organization_owner'))
  or (gym_id is not null and public.is_gym_member(gym_id))
);

-- class_templates ------------------------------------------------------------
drop policy if exists "templates_read" on public.class_templates;
drop policy if exists "class_templates_select" on public.class_templates;
create policy "class_templates_select"
on public.class_templates for select
using (
  public.is_platform_super_admin()
  or public.is_org_member(organization_id)
  or public.is_gym_member(gym_id)
  or exists (
    select 1
    from public.student_class_enrollments sce
    join public.student_user_links sul on sul.student_id = sce.student_id
    where sce.class_template_id = class_templates.id
      and sul.profile_id = auth.uid()
      and sul.status = 'active'
  )
);

drop policy if exists "class_templates_write" on public.class_templates;
create policy "class_templates_write"
on public.class_templates for all
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or public.is_gym_member(gym_id)
)
with check (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or public.is_gym_member(gym_id)
);

-- student_program_enrollments -----------------------------------------------
drop policy if exists "student_program_enrollments_select" on public.student_program_enrollments;
create policy "student_program_enrollments_select"
on public.student_program_enrollments for select
using (
  public.is_platform_super_admin()
  or public.is_org_member(organization_id)
  or (gym_id is not null and public.is_gym_member(gym_id))
  or exists (
    select 1 from public.student_user_links sul
    where sul.student_id = student_program_enrollments.student_id
      and sul.profile_id = auth.uid()
      and sul.status = 'active'
  )
);

drop policy if exists "student_program_enrollments_write" on public.student_program_enrollments;
create policy "student_program_enrollments_write"
on public.student_program_enrollments for all
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or (gym_id is not null and public.is_gym_member(gym_id))
)
with check (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or (gym_id is not null and public.is_gym_member(gym_id))
);

-- student_class_enrollments ---------------------------------------------------
drop policy if exists "student_class_enrollments_select" on public.student_class_enrollments;
create policy "student_class_enrollments_select"
on public.student_class_enrollments for select
using (
  public.is_platform_super_admin()
  or public.is_org_member(organization_id)
  or (gym_id is not null and public.is_gym_member(gym_id))
  or exists (
    select 1 from public.student_user_links sul
    where sul.student_id = student_class_enrollments.student_id
      and sul.profile_id = auth.uid()
      and sul.status = 'active'
  )
);

drop policy if exists "student_class_enrollments_write" on public.student_class_enrollments;
create policy "student_class_enrollments_write"
on public.student_class_enrollments for all
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or (gym_id is not null and public.is_gym_member(gym_id))
)
with check (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or (gym_id is not null and public.is_gym_member(gym_id))
);

-- ----------------------------------------------------------------------------
-- 7. PostgREST schema reload
-- ----------------------------------------------------------------------------
notify pgrst, 'reload schema';
