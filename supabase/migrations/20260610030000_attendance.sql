-- ============================================================================
-- Attendance: class sessions + attendance records
-- ----------------------------------------------------------------------------
-- Verified against the hosted DB on 2026-06-10:
--   * class_sessions: has id/organization_id/gym_id/class_template_id/
--     session_date/starts_at/created_at — missing start_time/end_time/status/
--     updated_at
--   * attendance_records: has id/gym_id/class_session_id/student_id/
--     checked_in_at/status/created_at — missing organization_id/
--     class_template_id/checked_in_by/notes/updated_at, the status check, and
--     the duplicate-check-in unique constraint
--   * RLS on both was SELECT-only (sessions_read had qual `true`), so staff
--     could never write attendance and anyone authenticated could read
--     sessions.
--
-- Idempotent; guarded for canonical local DBs as well.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. class_sessions columns
-- ----------------------------------------------------------------------------
alter table public.class_sessions
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists session_date date,
  add column if not exists start_time time,
  add column if not exists end_time time,
  add column if not exists status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled')),
  add column if not exists updated_at timestamptz not null default now();

update public.class_sessions cs
  set organization_id = g.organization_id
  from public.gyms g
  where cs.gym_id = g.id
    and cs.organization_id is null;

-- Canonical DBs use starts_at/ends_at timestamptz; derive the new columns.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'class_sessions' and column_name = 'starts_at'
  ) then
    update public.class_sessions
      set session_date = coalesce(session_date, starts_at::date),
          start_time = coalesce(start_time, starts_at::time)
      where starts_at is not null;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'class_sessions' and column_name = 'ends_at'
  ) then
    update public.class_sessions
      set end_time = coalesce(end_time, ends_at::time)
      where ends_at is not null;
  end if;
end $$;

drop trigger if exists set_updated_at_class_sessions on public.class_sessions;
create trigger set_updated_at_class_sessions
  before update on public.class_sessions
  for each row execute function public.set_updated_at();

-- One session per template per date, so get-or-create is race-safe.
create unique index if not exists class_sessions_template_date_uniq
  on public.class_sessions (class_template_id, session_date)
  where class_template_id is not null;

create index if not exists class_sessions_gym_date_idx
  on public.class_sessions (gym_id, session_date);

-- ----------------------------------------------------------------------------
-- 2. attendance_records columns
-- ----------------------------------------------------------------------------
alter table public.attendance_records
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists class_template_id uuid references public.class_templates(id) on delete set null,
  add column if not exists checked_in_by uuid references public.profiles(id) on delete set null,
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default now();

update public.attendance_records ar
  set organization_id = g.organization_id
  from public.gyms g
  where ar.gym_id = g.id
    and ar.organization_id is null;

update public.attendance_records ar
  set class_template_id = cs.class_template_id
  from public.class_sessions cs
  where ar.class_session_id = cs.id
    and ar.class_template_id is null;

-- Status check: normalize any legacy values first, then enforce.
update public.attendance_records
  set status = 'present'
  where status not in ('present', 'late', 'absent', 'excused');

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'attendance_records_status_check'
      and conrelid = 'public.attendance_records'::regclass
  ) then
    alter table public.attendance_records
      add constraint attendance_records_status_check
      check (status in ('present', 'late', 'absent', 'excused'));
  end if;
end $$;

drop trigger if exists set_updated_at_attendance_records on public.attendance_records;
create trigger set_updated_at_attendance_records
  before update on public.attendance_records
  for each row execute function public.set_updated_at();

-- Prevent duplicate check-ins.
create unique index if not exists attendance_records_session_student_uniq
  on public.attendance_records (class_session_id, student_id);

create index if not exists attendance_records_student_time_idx
  on public.attendance_records (student_id, checked_in_at desc);
create index if not exists attendance_records_gym_time_idx
  on public.attendance_records (gym_id, checked_in_at desc);

-- ----------------------------------------------------------------------------
-- 3. RLS
-- ----------------------------------------------------------------------------
alter table public.class_sessions enable row level security;
alter table public.attendance_records enable row level security;

-- class_sessions: staff read/write; portal users can read sessions their
-- linked students attended or that belong to a class they're enrolled in.
drop policy if exists "sessions_read" on public.class_sessions;
drop policy if exists "class_sessions_select_gym_staff" on public.class_sessions;
drop policy if exists "class_sessions_insert_gym_staff" on public.class_sessions;
drop policy if exists "class_sessions_update_gym_staff" on public.class_sessions;
drop policy if exists "class_sessions_select" on public.class_sessions;
create policy "class_sessions_select"
on public.class_sessions for select
using (
  public.is_platform_super_admin()
  or public.is_org_member(organization_id)
  or public.is_gym_member(gym_id)
  or exists (
    select 1
    from public.student_class_enrollments sce
    join public.student_user_links sul on sul.student_id = sce.student_id
    where sce.class_template_id = class_sessions.class_template_id
      and sul.profile_id = auth.uid()
      and sul.status = 'active'
  )
);

drop policy if exists "class_sessions_write" on public.class_sessions;
create policy "class_sessions_write"
on public.class_sessions for all
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

-- attendance_records: staff read/write; portal users read their own records.
drop policy if exists "attendance_read" on public.attendance_records;
drop policy if exists "attendance_records_select_gym_staff" on public.attendance_records;
drop policy if exists "attendance_records_insert_gym_staff" on public.attendance_records;
drop policy if exists "attendance_records_update_gym_staff" on public.attendance_records;
drop policy if exists "attendance_records_select" on public.attendance_records;
create policy "attendance_records_select"
on public.attendance_records for select
using (
  public.is_platform_super_admin()
  or public.is_org_member(organization_id)
  or public.is_gym_member(gym_id)
  or exists (
    select 1 from public.student_user_links sul
    where sul.student_id = attendance_records.student_id
      and sul.profile_id = auth.uid()
      and sul.status = 'active'
  )
);

drop policy if exists "attendance_records_write" on public.attendance_records;
create policy "attendance_records_write"
on public.attendance_records for all
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

-- ----------------------------------------------------------------------------
-- 4. PostgREST schema reload
-- ----------------------------------------------------------------------------
notify pgrst, 'reload schema';
