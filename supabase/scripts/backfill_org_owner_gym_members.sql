-- Optional backfill: give organization owners/admins a gym_admin row for each gym
-- in their business account when they lack gym_members entries.
-- Safe to run multiple times (uses ON CONFLICT).

insert into public.gym_members (organization_id, gym_id, profile_id, role_id, status)
select
  g.organization_id,
  g.id as gym_id,
  om.profile_id,
  r.id as role_id,
  'active' as status
from public.organization_members om
join public.roles org_role on org_role.id = om.role_id
join public.gyms g on g.organization_id = om.organization_id
join public.roles r on r.key = 'gym_admin'
where org_role.key in ('organization_owner', 'organization_admin')
  and om.status = 'active'
  and not exists (
    select 1
    from public.gym_members gm
    where gm.gym_id = g.id
      and gm.profile_id = om.profile_id
  )
on conflict (gym_id, profile_id) do update
  set role_id = excluded.role_id,
      status = 'active',
      updated_at = now();
