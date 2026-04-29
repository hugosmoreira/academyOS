create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create type public.member_status as enum ('active', 'inactive', 'prospect', 'suspended', 'archived');
create type public.billing_status as enum ('draft', 'open', 'paid', 'past_due', 'void', 'refunded');
create type public.payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');
create type public.booking_status as enum ('requested', 'confirmed', 'attended', 'no_show', 'cancelled');
create type public.attendance_status as enum ('present', 'late', 'excused', 'absent');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  platform_role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gyms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  timezone text not null default 'America/Los_Angeles',
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  phone text,
  email text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  scope text not null check (scope in ('platform', 'organization', 'gym', 'portal')),
  description text,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table public.gym_members (
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

create table public.audit_logs (
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

create table public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  bio text,
  hire_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.families (
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

create table public.students (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete restrict,
  family_id uuid references public.families(id) on delete set null,
  first_name text not null,
  last_name text not null,
  preferred_name text,
  email text,
  phone text,
  birthdate date,
  status public.member_status not null default 'active',
  joined_at date,
  avatar_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  relationship text not null,
  is_primary_contact boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.student_user_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, profile_id)
);

create table public.parent_user_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (family_id, profile_id)
);

create table public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  name text not null,
  relationship text,
  phone text not null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  author_profile_id uuid references public.profiles(id) on delete set null,
  note text not null,
  visibility text not null default 'staff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_tags (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table public.student_tag_links (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  tag_id uuid not null references public.student_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, tag_id)
);

create table public.student_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  storage_path text not null,
  document_type text not null,
  uploaded_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table public.lead_pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  position integer not null,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, position)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  pipeline_stage_id uuid references public.lead_pipeline_stages(id) on delete set null,
  source_id uuid references public.lead_sources(id) on delete set null,
  assigned_profile_id uuid references public.profiles(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  status text not null default 'open',
  notes text,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_profile_id uuid references public.profiles(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  activity_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.trial_bookings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete restrict,
  lead_id uuid references public.leads(id) on delete set null,
  class_session_id uuid,
  program_interest text,
  booked_for timestamptz not null,
  status public.booking_status not null default 'requested',
  waiver_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_follow_ups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  assigned_profile_id uuid references public.profiles(id) on delete set null,
  due_at timestamptz not null,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  name text not null,
  discipline text not null default 'bjj',
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ranks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  name text not null,
  color text,
  sort_order integer not null,
  minimum_classes integer,
  minimum_days integer,
  created_at timestamptz not null default now(),
  unique (program_id, sort_order)
);

create table public.rank_requirements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  rank_id uuid not null references public.ranks(id) on delete cascade,
  name text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.student_program_enrollments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete restrict,
  current_rank_id uuid references public.ranks(id) on delete set null,
  started_at date not null default current_date,
  ended_at date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, program_id)
);

create table public.student_rank_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete restrict,
  rank_id uuid not null references public.ranks(id) on delete restrict,
  promoted_by_profile_id uuid references public.profiles(id) on delete set null,
  promoted_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create table public.promotion_eligibility_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  from_rank_id uuid references public.ranks(id) on delete cascade,
  to_rank_id uuid not null references public.ranks(id) on delete cascade,
  minimum_classes integer,
  minimum_days integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.promotion_reviews (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  student_id uuid not null references public.students(id) on delete cascade,
  reviewer_profile_id uuid references public.profiles(id) on delete set null,
  target_rank_id uuid references public.ranks(id) on delete restrict,
  status text not null default 'pending',
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.promotion_review_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  promotion_review_id uuid not null references public.promotion_reviews(id) on delete cascade,
  requirement_id uuid references public.rank_requirements(id) on delete set null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create table public.class_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete cascade,
  program_id uuid references public.programs(id) on delete set null,
  name text not null,
  description text,
  capacity integer,
  day_of_week integer check (day_of_week between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete cascade,
  class_template_id uuid references public.class_templates(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trial_bookings
  add constraint trial_bookings_class_session_id_fkey
  foreign key (class_session_id) references public.class_sessions(id) on delete set null;

create table public.class_instructors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  class_session_id uuid not null references public.class_sessions(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'instructor',
  created_at timestamptz not null default now(),
  unique (class_session_id, profile_id)
);

create table public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  class_template_id uuid references public.class_templates(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table public.attendance_kiosk_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete cascade,
  class_session_id uuid references public.class_sessions(id) on delete set null,
  opened_by_profile_id uuid references public.profiles(id) on delete set null,
  token_hash text not null,
  expires_at timestamptz not null,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete cascade,
  class_session_id uuid not null references public.class_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status public.attendance_status not null default 'present',
  checked_in_at timestamptz not null default now(),
  checked_in_by_profile_id uuid references public.profiles(id) on delete set null,
  kiosk_session_id uuid references public.attendance_kiosk_sessions(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  unique (class_session_id, student_id)
);

create table public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  name text not null,
  description text,
  price_cents integer not null,
  currency text not null default 'usd',
  billing_interval text not null default 'month',
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  student_id uuid not null references public.students(id) on delete cascade,
  membership_plan_id uuid references public.membership_plans(id) on delete restrict,
  status text not null default 'active',
  starts_at date not null,
  ends_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.family_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  family_id uuid not null references public.families(id) on delete cascade,
  membership_plan_id uuid references public.membership_plans(id) on delete restrict,
  status text not null default 'active',
  starts_at date not null,
  ends_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  student_id uuid references public.students(id) on delete set null,
  family_id uuid references public.families(id) on delete set null,
  invoice_number text not null,
  status public.billing_status not null default 'draft',
  subtotal_cents integer not null default 0,
  discount_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0,
  due_date date,
  issued_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, invoice_number)
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_amount_cents integer not null,
  total_cents integer not null,
  created_at timestamptz not null default now()
);

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  family_id uuid references public.families(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  provider text not null default 'stripe',
  provider_payment_method_id text,
  brand text,
  last4 text,
  exp_month integer,
  exp_year integer,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  payment_method_id uuid references public.payment_methods(id) on delete set null,
  amount_cents integer not null,
  currency text not null default 'usd',
  status public.payment_status not null default 'pending',
  provider text not null default 'stripe',
  provider_payment_id text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.payment_failures (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  failure_code text,
  failure_message text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.discounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  percent_off numeric(5,2),
  amount_off_cents integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  discount_id uuid references public.discounts(id) on delete cascade,
  redeem_by date,
  max_redemptions integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table public.membership_freezes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_membership_id uuid references public.student_memberships(id) on delete cascade,
  family_membership_id uuid references public.family_memberships(id) on delete cascade,
  starts_at date not null,
  ends_at date not null,
  reason text,
  created_at timestamptz not null default now()
);

create table public.cancellations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_membership_id uuid references public.student_memberships(id) on delete set null,
  family_membership_id uuid references public.family_memberships(id) on delete set null,
  reason text,
  effective_at date not null,
  created_at timestamptz not null default now()
);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  payment_id uuid not null references public.payments(id) on delete cascade,
  amount_cents integer not null,
  reason text,
  provider_refund_id text,
  created_at timestamptz not null default now()
);

create table public.stripe_customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  family_id uuid references public.families(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now()
);

create table public.stripe_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_membership_id uuid references public.student_memberships(id) on delete set null,
  family_membership_id uuid references public.family_memberships(id) on delete set null,
  stripe_subscription_id text not null unique,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.document_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  body text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.waiver_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  document_template_id uuid references public.document_templates(id) on delete cascade,
  name text not null,
  required_for text not null default 'students',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.waiver_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  waiver_template_id uuid not null references public.waiver_templates(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  family_id uuid references public.families(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.signed_waivers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  waiver_assignment_id uuid references public.waiver_assignments(id) on delete set null,
  signed_by_profile_id uuid references public.profiles(id) on delete set null,
  signer_name text not null,
  signer_email text,
  signature_storage_path text,
  signed_body text not null,
  signed_at timestamptz not null default now(),
  ip_address inet,
  user_agent text
);

create table public.signature_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  signed_waiver_id uuid references public.signed_waivers(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  name text not null,
  description text,
  capacity integer,
  price_cents integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  family_id uuid references public.families(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  status text not null default 'registered',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.private_lesson_availability (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete cascade,
  instructor_profile_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.private_lesson_bookings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete cascade,
  instructor_profile_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.booking_status not null default 'requested',
  price_cents integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.private_lesson_payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  private_lesson_booking_id uuid not null references public.private_lesson_bookings(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  channel text not null check (channel in ('email', 'sms', 'in_app')),
  subject text,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.message_campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  template_id uuid references public.message_templates(id) on delete set null,
  name text not null,
  channel text not null,
  status text not null default 'draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.message_recipients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  message_campaign_id uuid not null references public.message_campaigns(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  student_id uuid references public.students(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  delivery_status text not null default 'pending',
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  title text not null,
  body text not null,
  audience text not null default 'all',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  in_app_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table public.sms_opt_ins (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  phone text not null,
  opted_in_at timestamptz,
  opted_out_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.email_opt_ins (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  email text not null,
  opted_in_at timestamptz,
  opted_out_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.daily_gym_metrics (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete cascade,
  metric_date date not null,
  active_students integer not null default 0,
  new_students integer not null default 0,
  lost_students integer not null default 0,
  attendance_count integer not null default 0,
  revenue_cents integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (gym_id, metric_date)
);

create table public.monthly_gym_metrics (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete cascade,
  metric_month date not null,
  active_students integer not null default 0,
  new_students integer not null default 0,
  lost_students integer not null default 0,
  attendance_count integer not null default 0,
  revenue_cents integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (gym_id, metric_month)
);

create table public.student_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  student_id uuid not null references public.students(id) on delete cascade,
  event_type text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.organization_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gym_settings (
  gym_id uuid primary key references public.gyms(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.branding_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete cascade,
  logo_url text,
  primary_color text,
  accent_color text,
  custom_domain text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.public_pages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete cascade,
  slug text not null,
  title text not null,
  body jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table public.integration_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,
  settings jsonb not null default '{}'::jsonb,
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider)
);

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.is_platform_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and platform_role = 'platform_super_admin'
  );
$$;

create or replace function public.is_org_member(target_organization_id uuid)
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
      where om.organization_id = target_organization_id
        and om.profile_id = auth.uid()
        and om.status = 'active'
    );
$$;

create or replace function public.has_org_role(target_organization_id uuid, role_key text)
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
      where om.organization_id = target_organization_id
        and om.profile_id = auth.uid()
        and om.status = 'active'
        and r.key = role_key
    );
$$;

create or replace function public.is_gym_member(target_gym_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_super_admin()
    or exists (
      select 1
      from public.gym_members gm
      where gm.gym_id = target_gym_id
        and gm.profile_id = auth.uid()
        and gm.status = 'active'
    );
$$;

create or replace function public.has_permission(target_organization_id uuid, target_gym_id uuid, permission_key text)
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
      join public.role_permissions rp on rp.role_id = om.role_id
      join public.permissions p on p.id = rp.permission_id
      where om.organization_id = target_organization_id
        and om.profile_id = auth.uid()
        and om.status = 'active'
        and p.key = permission_key
    )
    or exists (
      select 1
      from public.gym_members gm
      join public.role_permissions rp on rp.role_id = gm.role_id
      join public.permissions p on p.id = rp.permission_id
      where gm.organization_id = target_organization_id
        and (target_gym_id is null or gm.gym_id = target_gym_id)
        and gm.profile_id = auth.uid()
        and gm.status = 'active'
        and p.key = permission_key
    );
$$;

create policy "profiles_select_own_or_staff"
on public.profiles for select
using (
  id = auth.uid()
  or public.is_platform_super_admin()
  or exists (
    select 1
    from public.organization_members om
    where om.profile_id = profiles.id
      and public.is_org_member(om.organization_id)
  )
);

create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "organizations_select_member"
on public.organizations for select
using (public.is_org_member(id));

create policy "gyms_select_member"
on public.gyms for select
using (public.is_org_member(organization_id));

create policy "organization_members_select_member"
on public.organization_members for select
using (public.is_org_member(organization_id));

create policy "gym_members_select_member"
on public.gym_members for select
using (public.is_org_member(organization_id));

create policy "roles_select_authenticated"
on public.roles for select
to authenticated
using (true);

create policy "permissions_select_authenticated"
on public.permissions for select
to authenticated
using (true);

create policy "role_permissions_select_authenticated"
on public.role_permissions for select
to authenticated
using (true);

create policy "stripe_webhook_events_service_role_only"
on public.stripe_webhook_events for all
using (false)
with check (false);

do $$
declare
  table_name text;
begin
  for table_name in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end;
$$;

do $$
declare
  table_name text;
begin
  for table_name in
    select c.table_name
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.column_name = 'organization_id'
      and c.table_name not in (
        'organization_members',
        'gym_members',
        'stripe_webhook_events'
      )
  loop
    execute format(
      'create policy %I on public.%I for select using (public.is_org_member(organization_id))',
      table_name || '_select_org_member',
      table_name
    );
    execute format(
      'create policy %I on public.%I for insert with check (public.has_org_role(organization_id, ''organization_owner'') or public.has_permission(organization_id, null, ''manage:'' || %L))',
      table_name || '_insert_org_manager',
      table_name,
      table_name
    );
    execute format(
      'create policy %I on public.%I for update using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id))',
      table_name || '_update_org_member',
      table_name
    );
    execute format(
      'create policy %I on public.%I for delete using (public.has_org_role(organization_id, ''organization_owner''))',
      table_name || '_delete_org_owner',
      table_name
    );
  end loop;
end;
$$;

create policy "organizations_insert_platform_admin"
on public.organizations for insert
with check (public.is_platform_super_admin());

create policy "organizations_update_owner"
on public.organizations for update
using (public.has_org_role(id, 'organization_owner'))
with check (public.has_org_role(id, 'organization_owner'));

create policy "gyms_insert_org_owner"
on public.gyms for insert
with check (public.has_org_role(organization_id, 'organization_owner'));

create policy "gyms_update_org_owner"
on public.gyms for update
using (public.has_org_role(organization_id, 'organization_owner'))
with check (public.has_org_role(organization_id, 'organization_owner'));

create policy "organization_members_manage_owner"
on public.organization_members for all
using (public.has_org_role(organization_id, 'organization_owner'))
with check (public.has_org_role(organization_id, 'organization_owner'));

create policy "gym_members_manage_owner_or_admin"
on public.gym_members for all
using (
  public.has_org_role(organization_id, 'organization_owner')
  or public.has_permission(organization_id, gym_id, 'manage:gym_members')
)
with check (
  public.has_org_role(organization_id, 'organization_owner')
  or public.has_permission(organization_id, gym_id, 'manage:gym_members')
);

create policy "student_user_links_select_own"
on public.student_user_links for select
using (profile_id = auth.uid() or public.is_org_member(organization_id));

create policy "parent_user_links_select_own"
on public.parent_user_links for select
using (profile_id = auth.uid() or public.is_org_member(organization_id));

create policy "students_select_linked_portal"
on public.students for select
using (
  public.is_org_member(organization_id)
  or exists (
    select 1 from public.student_user_links sul
    where sul.student_id = students.id and sul.profile_id = auth.uid()
  )
  or exists (
    select 1
    from public.parent_user_links pul
    join public.family_members fm on fm.family_id = pul.family_id
    where fm.student_id = students.id and pul.profile_id = auth.uid()
  )
);

create policy "families_select_linked_parent"
on public.families for select
using (
  public.is_org_member(organization_id)
  or exists (
    select 1 from public.parent_user_links pul
    where pul.family_id = families.id and pul.profile_id = auth.uid()
  )
);

create policy "trial_bookings_public_insert"
on public.trial_bookings for insert
to anon
with check (status = 'requested');

do $$
declare
  table_name text;
begin
  for table_name in
    select c.table_name
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.column_name = 'updated_at'
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_set_updated_at',
      table_name
    );
  end loop;
end;
$$;

create index organizations_slug_idx on public.organizations(slug);
create index gyms_org_idx on public.gyms(organization_id);
create index organization_members_profile_idx on public.organization_members(profile_id);
create index gym_members_profile_idx on public.gym_members(profile_id);
create index students_org_gym_idx on public.students(organization_id, gym_id);
create index students_status_idx on public.students(gym_id, status);
create index students_name_idx on public.students(last_name, first_name);
create index leads_stage_idx on public.leads(gym_id, pipeline_stage_id);
create index class_sessions_gym_starts_idx on public.class_sessions(gym_id, starts_at);
create index attendance_student_checked_idx on public.attendance_records(student_id, checked_in_at);
create index invoices_status_due_idx on public.invoices(gym_id, status, due_date);
create index payments_gym_created_idx on public.payments(gym_id, created_at);
create index student_rank_history_student_promoted_idx on public.student_rank_history(student_id, promoted_at);
create index active_student_memberships_idx on public.student_memberships(student_id) where status = 'active';
create index unpaid_invoices_idx on public.invoices(gym_id, due_date) where status in ('open', 'past_due');
create index open_leads_idx on public.leads(gym_id, next_follow_up_at) where status = 'open';
create index unresolved_payment_failures_idx on public.payment_failures(gym_id, created_at) where resolved_at is null;
