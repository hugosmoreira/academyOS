-- ============================================================================
-- Hosted Supabase repair: student portal invites
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor when:
--   * /portal/accept-invite/:token returns "function does not exist"
--   * /app/.../portal-access shows missing table errors
--   * student_portal_invites is not present
--
-- Safe to re-run. Skips helper replacements (uses existing is_org_member,
-- is_gym_member, has_org_role, set_updated_at, is_platform_super_admin).
-- ============================================================================

-- Prerequisite columns -------------------------------------------------------
alter table public.students
  add column if not exists portal_access_enabled boolean not null default false;

-- Invite table ---------------------------------------------------------------
create table if not exists public.student_portal_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  email text not null,
  invite_token uuid not null unique default gen_random_uuid(),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  accepted_user_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_portal_invites_token_idx
  on public.student_portal_invites (invite_token);
create index if not exists student_portal_invites_student_status_idx
  on public.student_portal_invites (student_id, status);
create index if not exists student_portal_invites_email_status_idx
  on public.student_portal_invites (lower(email), status);
create unique index if not exists student_portal_invites_one_pending_per_student
  on public.student_portal_invites (student_id)
  where status = 'pending';

drop trigger if exists set_updated_at_student_portal_invites
  on public.student_portal_invites;
create trigger set_updated_at_student_portal_invites
  before update on public.student_portal_invites
  for each row execute function public.set_updated_at();

alter table public.student_portal_invites enable row level security;

drop policy if exists "student_portal_invites_select_staff"
  on public.student_portal_invites;
create policy "student_portal_invites_select_staff"
on public.student_portal_invites for select
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or public.is_gym_member(gym_id)
);

drop policy if exists "student_portal_invites_modify_staff"
  on public.student_portal_invites;
create policy "student_portal_invites_modify_staff"
on public.student_portal_invites for all
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

-- Gym-scoped + portal SELECT on students -------------------------------------
drop policy if exists "students_select_org_member" on public.students;
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
  or (
    portal_access_enabled = true
    and to_regclass('public.parent_student_links') is not null
    and exists (
      select 1
      from public.parent_student_links psl
      where psl.student_id = students.id
        and psl.parent_profile_id = auth.uid()
    )
  )
);

drop policy if exists "students_insert_org_manager" on public.students;
drop policy if exists "students_update_org_member" on public.students;
drop policy if exists "students_delete_org_owner" on public.students;
drop policy if exists "students_insert_gym_staff" on public.students;
drop policy if exists "students_update_gym_staff" on public.students;
drop policy if exists "students_delete_gym_staff" on public.students;

create policy "students_insert_gym_staff"
on public.students for insert
with check (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or public.is_gym_member(gym_id)
);

create policy "students_update_gym_staff"
on public.students for update
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

create policy "students_delete_gym_staff"
on public.students for delete
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or public.is_gym_member(gym_id)
);

-- Helper + RPCs --------------------------------------------------------------
create or replace function public.can_manage_gym_students(target_gym_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_super_admin()
    or exists (
      select 1
      from public.gyms g
      where g.id = target_gym_id
        and public.has_org_role(g.organization_id, 'organization_owner')
    )
    or public.is_gym_member(target_gym_id);
$$;

grant execute on function public.can_manage_gym_students(uuid) to authenticated;

create or replace function public.lookup_student_portal_invite_by_token(p_token uuid)
returns table (
  id uuid,
  student_id uuid,
  organization_id uuid,
  gym_id uuid,
  email text,
  status text,
  expires_at timestamptz,
  student_first_name text,
  student_last_name text,
  gym_name text,
  organization_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    spi.id,
    spi.student_id,
    spi.organization_id,
    spi.gym_id,
    spi.email,
    spi.status,
    spi.expires_at,
    s.first_name,
    s.last_name,
    g.name,
    o.name
  from public.student_portal_invites spi
  join public.students s on s.id = spi.student_id
  join public.gyms g on g.id = spi.gym_id
  join public.organizations o on o.id = spi.organization_id
  where spi.invite_token = p_token
  limit 1;
$$;

grant execute on function public.lookup_student_portal_invite_by_token(uuid)
  to anon, authenticated;

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
declare
  v_actor uuid := auth.uid();
  v_student public.students%rowtype;
  v_email text;
  v_invite_id uuid;
  v_invite_token uuid;
  v_status text;
  v_expires_at timestamptz;
begin
  if v_actor is null then raise exception 'Authentication required'; end if;

  select * into v_student from public.students where id = p_student_id;
  if v_student.id is null then raise exception 'Student not found'; end if;

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

  update public.student_portal_invites
    set status = 'cancelled', updated_at = now()
    where student_id = p_student_id and status = 'pending';

  insert into public.student_portal_invites (
    organization_id, gym_id, student_id, email, created_by
  ) values (
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

  return query select v_invite_id, v_invite_token, v_status, v_expires_at;
end;
$$;

grant execute on function public.create_student_portal_invite(uuid, text)
  to authenticated;

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
declare
  v_user_id uuid := auth.uid();
  v_user_email text;
  v_invite public.student_portal_invites%rowtype;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;

  select email into v_user_email from auth.users where id = v_user_id;
  if v_user_email is null then raise exception 'Authenticated user has no email'; end if;

  select * into v_invite from public.student_portal_invites where invite_token = p_token limit 1;
  if v_invite.id is null then raise exception 'Invite not found'; end if;

  if v_invite.status <> 'pending' then
    raise exception 'Invite is no longer pending (status: %)', v_invite.status;
  end if;

  if v_invite.expires_at < now() then
    update public.student_portal_invites
      set status = 'expired', updated_at = now()
      where id = v_invite.id;
    raise exception 'Invite has expired';
  end if;

  if lower(v_invite.email) <> lower(v_user_email) then
    raise exception 'Invite email does not match the authenticated user';
  end if;

  insert into public.student_user_links (organization_id, student_id, profile_id)
  values (v_invite.organization_id, v_invite.student_id, v_user_id)
  on conflict (student_id, profile_id) do nothing;

  update public.students
    set portal_access_enabled = true, updated_at = now()
    where id = v_invite.student_id;

  update public.student_portal_invites
    set status = 'accepted',
        accepted_at = now(),
        accepted_user_id = v_user_id,
        updated_at = now()
    where id = v_invite.id;

  if to_regclass('public.audit_logs') is not null then
    insert into public.audit_logs (
      organization_id, gym_id, actor_profile_id, action, entity_table, entity_id, metadata
    ) values (
      v_invite.organization_id, v_invite.gym_id, v_user_id,
      'student_portal_invite.accepted', 'student_portal_invites', v_invite.id,
      jsonb_build_object('student_id', v_invite.student_id)
    );
  end if;

  return query select v_invite.organization_id, v_invite.gym_id, v_invite.student_id;
end;
$$;

grant execute on function public.accept_student_portal_invite(uuid) to authenticated;

create or replace function public.cancel_student_portal_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_invite public.student_portal_invites%rowtype;
begin
  if v_actor is null then raise exception 'Authentication required'; end if;

  select * into v_invite from public.student_portal_invites where id = p_invite_id;
  if v_invite.id is null then raise exception 'Invite not found'; end if;

  if not public.can_manage_gym_students(v_invite.gym_id) then
    raise exception 'Not authorized to cancel invites for this gym';
  end if;

  if v_invite.status <> 'pending' then return; end if;

  update public.student_portal_invites
    set status = 'cancelled', updated_at = now()
    where id = p_invite_id;

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

grant execute on function public.cancel_student_portal_invite(uuid) to authenticated;

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
declare
  v_invite public.student_portal_invites%rowtype;
begin
  select * into v_invite from public.student_portal_invites where id = p_invite_id;
  if v_invite.id is null then raise exception 'Invite not found'; end if;

  if not public.can_manage_gym_students(v_invite.gym_id) then
    raise exception 'Not authorized to resend invites for this gym';
  end if;

  return query select * from public.create_student_portal_invite(v_invite.student_id, v_invite.email);
end;
$$;

grant execute on function public.resend_student_portal_invite(uuid) to authenticated;

create or replace function public.disable_student_portal_access(p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_student public.students%rowtype;
begin
  if v_actor is null then raise exception 'Authentication required'; end if;

  select * into v_student from public.students where id = p_student_id;
  if v_student.id is null then raise exception 'Student not found'; end if;

  if not public.can_manage_gym_students(v_student.gym_id) then
    raise exception 'Not authorized to manage this student';
  end if;

  delete from public.student_user_links where student_id = p_student_id;

  update public.student_portal_invites
    set status = 'cancelled', updated_at = now()
    where student_id = p_student_id and status = 'pending';

  update public.students
    set portal_access_enabled = false, updated_at = now()
    where id = p_student_id;

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

grant execute on function public.disable_student_portal_access(uuid) to authenticated;

notify pgrst, 'reload schema';
