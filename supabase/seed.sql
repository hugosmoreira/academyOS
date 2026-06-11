insert into public.roles (key, name, scope, description) values
  ('platform_super_admin', 'Platform Super Admin', 'platform', 'Internal AcademyOS administrator.'),
  ('organization_owner', 'Organization Owner', 'organization', 'Owns an academy organization and all gyms.'),
  ('gym_admin', 'Gym Admin', 'gym', 'Manages a single gym location.'),
  ('instructor', 'Instructor', 'gym', 'Teaches classes and manages attendance/progress.'),
  ('front_desk', 'Front Desk', 'gym', 'Handles check-ins, leads, and billing support.'),
  ('student', 'Student', 'portal', 'Student portal access.'),
  ('parent', 'Parent', 'portal', 'Parent portal access.')
on conflict (key) do update set
  name = excluded.name,
  scope = excluded.scope,
  description = excluded.description;

insert into public.permissions (key, name, description) values
  ('manage:organization', 'Manage Organization', 'Update organization-wide settings and membership.'),
  ('manage:gyms', 'Manage Gyms', 'Create and update gym locations.'),
  ('manage:gym_members', 'Manage Gym Members', 'Invite and update gym staff.'),
  ('manage:students', 'Manage Students', 'Create and update student records.'),
  ('manage:families', 'Manage Families', 'Create and update family records.'),
  ('manage:leads', 'Manage Leads', 'Create and update CRM records.'),
  ('manage:programs', 'Manage Programs', 'Create and update programs, ranks, and requirements.'),
  ('manage:classes', 'Manage Classes', 'Create and update schedules and class sessions.'),
  ('manage:attendance', 'Manage Attendance', 'Record and update class attendance.'),
  ('manage:billing', 'Manage Billing', 'Manage plans, invoices, and payments.'),
  ('manage:waivers', 'Manage Waivers', 'Manage documents and signatures.'),
  ('manage:events', 'Manage Events', 'Manage seminars, events, and registrations.'),
  ('manage:messaging', 'Manage Messaging', 'Send announcements and campaigns.'),
  ('view:reports', 'View Reports', 'View reporting and analytics.')
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.key in ('platform_super_admin', 'organization_owner')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'manage:gym_members',
  'manage:students',
  'manage:families',
  'manage:leads',
  'manage:programs',
  'manage:classes',
  'manage:attendance',
  'manage:billing',
  'manage:waivers',
  'manage:events',
  'manage:messaging',
  'view:reports'
)
where r.key = 'gym_admin'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('manage:classes', 'manage:attendance', 'manage:programs', 'view:reports')
where r.key = 'instructor'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('manage:students', 'manage:families', 'manage:leads', 'manage:attendance', 'manage:billing')
where r.key = 'front_desk'
on conflict do nothing;

insert into public.organizations (id, name, slug)
values ('11111111-1111-1111-1111-111111111111', 'Elite Discipline Association', 'elite-discipline')
on conflict (slug) do update set name = excluded.name;

insert into public.gyms (id, organization_id, name, slug, timezone, city, region)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Elite Discipline HQ', 'hq', 'America/Los_Angeles', 'San Diego', 'CA'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Elite Discipline North', 'north', 'America/Los_Angeles', 'Carlsbad', 'CA')
on conflict (organization_id, slug) do update set
  name = excluded.name,
  timezone = excluded.timezone,
  city = excluded.city,
  region = excluded.region;

insert into public.organization_settings (organization_id, settings)
values ('11111111-1111-1111-1111-111111111111', '{"defaultCurrency":"usd","defaultTimezone":"America/Los_Angeles"}')
on conflict (organization_id) do update set settings = excluded.settings;

insert into public.gym_settings (gym_id, organization_id, settings)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', '{"checkInWindowMinutes":30}'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '{"checkInWindowMinutes":30}')
on conflict (gym_id) do update set settings = excluded.settings;

insert into public.lead_pipeline_stages (organization_id, name, position, is_closed)
values
  ('11111111-1111-1111-1111-111111111111', 'New Lead', 1, false),
  ('11111111-1111-1111-1111-111111111111', 'Trial Booked', 2, false),
  ('11111111-1111-1111-1111-111111111111', 'Trial Attended', 3, false),
  ('11111111-1111-1111-1111-111111111111', 'Converted', 4, true),
  ('11111111-1111-1111-1111-111111111111', 'Lost', 5, true)
on conflict (organization_id, position) do update set
  name = excluded.name,
  is_closed = excluded.is_closed;

insert into public.lead_sources (organization_id, name)
values
  ('11111111-1111-1111-1111-111111111111', 'Website'),
  ('11111111-1111-1111-1111-111111111111', 'Instagram Ad'),
  ('11111111-1111-1111-1111-111111111111', 'Referral'),
  ('11111111-1111-1111-1111-111111111111', 'Walk-in')
on conflict (organization_id, name) do nothing;

insert into public.programs (id, organization_id, gym_id, name, discipline, description)
values
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', null, 'Adult BJJ Fundamentals', 'bjj', 'Core Brazilian Jiu-Jitsu curriculum for adults.'),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', null, 'Advanced No-Gi', 'bjj', 'Advanced no-gi grappling and competition preparation.'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', null, 'Kids Martial Arts', 'bjj', 'Youth program for discipline, safety, and fundamentals.')
on conflict (id) do update set
  name = excluded.name,
  discipline = excluded.discipline,
  description = excluded.description;

insert into public.ranks (organization_id, program_id, name, color, sort_order, minimum_classes, minimum_days)
values
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'White Belt', '#f8fafc', 1, 0, 0),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'Blue Belt', '#1e88e5', 2, 120, 365),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'Purple Belt', '#8e24aa', 3, 240, 730),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'Brown Belt', '#6d4c41', 4, 360, 1095),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'Black Belt', '#111827', 5, 500, 1825)
on conflict (program_id, sort_order) do update set
  name = excluded.name,
  color = excluded.color,
  minimum_classes = excluded.minimum_classes,
  minimum_days = excluded.minimum_days;

insert into public.membership_plans (organization_id, gym_id, name, description, price_cents, billing_interval)
values
  ('11111111-1111-1111-1111-111111111111', null, 'Fundamentals', 'Core curriculum access.', 15000, 'month'),
  ('11111111-1111-1111-1111-111111111111', null, 'Unlimited Elite', 'All-access pass to all classes and open mat.', 22000, 'month'),
  ('11111111-1111-1111-1111-111111111111', null, 'Kids Program', 'Youth program membership.', 12000, 'month');

-- ════════════════════════════════════════════════════════════════
--  Dev: bootstrap a platform super admin
--
--  AcademyOS no longer auto-assigns org owners on signup. To explore
--  the /admin area in development:
--
--    1. Sign up a Supabase auth user via the Dashboard (Authentication
--       -> Users -> "Add user") using the email you want to test with.
--    2. Confirm a `profiles` row was created by handle_new_user().
--    3. Run the statement below, replacing the email.
--
--    update public.profiles
--      set platform_role = 'platform_super_admin'
--      where email = 'platform-admin@academyos.test';
--
--    -- Mirror into platform_members so the new model picks it up too:
--    insert into public.platform_members (profile_id, role_key, status)
--    select id, 'platform_super_admin', 'active'
--      from public.profiles where email = 'platform-admin@academyos.test'
--    on conflict (profile_id, role_key) do nothing;
--
--  After signing in with that user the app will redirect to /admin.
--
-- ----------------------------------------------------------------
--  Dev: assign an org owner or gym staff role (no Edge Function)
--
--  Use the admin UI (/admin/users/:userId) to assign roles through
--  the assign_org_member / assign_gym_member RPCs. The raw SQL flow
--  for local-only testing looks like:
--
--    -- Assign organization owner
--    select public.assign_org_member(
--      '<organization_id>'::uuid,
--      (select id from public.profiles where email = 'owner@test.com'),
--      'organization_owner'
--    );
--
--    -- Assign coach to a gym
--    select public.assign_gym_member(
--      '<gym_id>'::uuid,
--      (select id from public.profiles where email = 'coach@test.com'),
--      'coach'
--    );
--
--  For production-quality flows, drive everything through the
--  /admin/organizations/new wizard, the per-user role assignment UI
--  on /admin/users/:userId, and the Edge Functions:
--    * supabase/functions/create-organization     (org + first gym + invite)
--    * supabase/functions/admin-invite-user       (invite any role + email)
-- ════════════════════════════════════════════════════════════════
