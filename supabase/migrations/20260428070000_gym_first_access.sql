-- Gym-first access helper: verifies platform admin, org owner/admin, or gym member.

create or replace function public.can_access_gym(p_gym_id uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  if auth.uid() is null then
    return false;
  end if;

  if public.is_platform_super_admin() then
    return true;
  end if;

  select organization_id into v_org_id
  from public.gyms
  where id = p_gym_id;

  if v_org_id is null then
    return false;
  end if;

  if public.has_org_role(v_org_id, 'organization_owner')
     or public.has_org_role(v_org_id, 'organization_admin') then
    return true;
  end if;

  return public.is_gym_member(p_gym_id);
end;
$$;

grant execute on function public.can_access_gym(uuid) to authenticated;

notify pgrst, 'reload schema';
