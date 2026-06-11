-- Gym-first provisioning: create gym (+ hidden org if needed) and invite gym owner.

create or replace function public.admin_create_gym_bundle(
  p_gym_name text,
  p_gym_slug text,
  p_gym_timezone text default 'America/Los_Angeles',
  p_owner_email text default null,
  p_owner_full_name text default null,
  p_organization_id uuid default null,
  p_new_org_name text default null,
  p_new_org_slug text default null
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
  v_actor uuid := auth.uid();
  v_org_id uuid;
  v_gym_id uuid;
  v_invite_id uuid;
  v_invite_token uuid;
  v_org_name text;
  v_org_slug text;
begin
  if not public.is_platform_super_admin() then
    raise exception 'Only platform super admins can create gyms';
  end if;

  if p_gym_name is null or length(trim(p_gym_name)) = 0 then
    raise exception 'Gym name is required';
  end if;
  if p_gym_slug is null or length(trim(p_gym_slug)) = 0 then
    raise exception 'Gym slug is required';
  end if;

  if p_organization_id is not null then
    select id into v_org_id from public.organizations where id = p_organization_id;
    if v_org_id is null then
      raise exception 'Business account not found';
    end if;
  else
    v_org_name := coalesce(nullif(trim(p_new_org_name), ''), trim(p_gym_name) || ' Account');
    v_org_slug := coalesce(nullif(trim(p_new_org_slug), ''), trim(p_gym_slug) || '-account');

    insert into public.organizations (name, slug)
    values (v_org_name, v_org_slug)
    returning id into v_org_id;
  end if;

  insert into public.gyms (organization_id, name, slug, timezone)
  values (
    v_org_id,
    trim(p_gym_name),
    trim(p_gym_slug),
    coalesce(nullif(trim(p_gym_timezone), ''), 'America/Los_Angeles')
  )
  returning id into v_gym_id;

  if p_owner_email is not null and length(trim(p_owner_email)) > 0 then
    insert into public.organization_invites (
      organization_id,
      gym_id,
      email,
      full_name,
      role_key,
      created_by
    )
    values (
      v_org_id,
      v_gym_id,
      lower(trim(p_owner_email)),
      p_owner_full_name,
      'gym_owner',
      v_actor
    )
    returning id, token into v_invite_id, v_invite_token;
  end if;

  insert into public.audit_logs (
    organization_id, gym_id, actor_profile_id, action, entity_table, entity_id, metadata
  )
  values (
    v_org_id, v_gym_id, v_actor, 'gym.created', 'gyms', v_gym_id,
    jsonb_build_object(
      'name', trim(p_gym_name),
      'slug', trim(p_gym_slug),
      'invite_id', v_invite_id,
      'role_key', 'gym_owner'
    )
  );

  return query select v_org_id, v_gym_id, v_invite_id, v_invite_token;
end;
$$;

grant execute on function public.admin_create_gym_bundle(
  text, text, text, text, text, uuid, text, text
) to authenticated;

notify pgrst, 'reload schema';
