-- ════════════════════════════════════════════════════════════════
--  STEP 1 ONLY — run this first in Supabase SQL Editor
--  Creates sales_leads + submit_sales_lead (fixes /admin/sales-leads)
--  Safe to re-run. Takes ~5 seconds.
-- ════════════════════════════════════════════════════════════════

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

alter table public.profiles
  add column if not exists status text not null default 'active';

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

notify pgrst, 'reload schema';
