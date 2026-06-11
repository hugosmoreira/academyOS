-- Extend gym-scoped RLS to class_templates, class_sessions, and attendance_records.

-- class_templates
drop policy if exists "class_templates_select_gym_staff" on public.class_templates;
create policy "class_templates_select_gym_staff"
on public.class_templates for select
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or public.is_gym_member(gym_id)
);

drop policy if exists "class_templates_insert_gym_staff" on public.class_templates;
create policy "class_templates_insert_gym_staff"
on public.class_templates for insert
with check (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or public.is_gym_member(gym_id)
);

drop policy if exists "class_templates_update_gym_staff" on public.class_templates;
create policy "class_templates_update_gym_staff"
on public.class_templates for update
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or public.is_gym_member(gym_id)
);

-- class_sessions
drop policy if exists "class_sessions_select_gym_staff" on public.class_sessions;
create policy "class_sessions_select_gym_staff"
on public.class_sessions for select
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or public.is_gym_member(gym_id)
);

drop policy if exists "class_sessions_insert_gym_staff" on public.class_sessions;
create policy "class_sessions_insert_gym_staff"
on public.class_sessions for insert
with check (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or public.is_gym_member(gym_id)
);

drop policy if exists "class_sessions_update_gym_staff" on public.class_sessions;
create policy "class_sessions_update_gym_staff"
on public.class_sessions for update
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or public.is_gym_member(gym_id)
);

-- attendance_records
drop policy if exists "attendance_records_select_gym_staff" on public.attendance_records;
create policy "attendance_records_select_gym_staff"
on public.attendance_records for select
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or public.is_gym_member(gym_id)
);

drop policy if exists "attendance_records_insert_gym_staff" on public.attendance_records;
create policy "attendance_records_insert_gym_staff"
on public.attendance_records for insert
with check (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or public.is_gym_member(gym_id)
);

drop policy if exists "attendance_records_update_gym_staff" on public.attendance_records;
create policy "attendance_records_update_gym_staff"
on public.attendance_records for update
using (
  public.is_platform_super_admin()
  or public.has_org_role(organization_id, 'organization_owner')
  or public.is_gym_member(gym_id)
);

notify pgrst, 'reload schema';
