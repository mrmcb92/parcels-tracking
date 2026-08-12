-- Parcel Tracking — creare grup atomică (grup + owner membership)
-- Idempotent: poate fi rulat în siguranță de mai multe ori.

-- De ce: vechea abordare din frontend făcea două cereri separate
-- (INSERT groups, apoi INSERT group_members). Policy-ul SELECT pe `groups`
-- cere apartenența la grup, deci `.insert().select().single()` din prima
-- cerere rula înainte ca owner-ul să fie membru → PostgREST răspundea
-- PGRST116 (0 rânduri), iar modalul de creare nu trecea la pasul de
-- invitație. RPC-ul aceasta face ambele inserții atomic și returnează
-- rândul grupului.
drop function if exists create_group_with_owner(text);

create or replace function create_group_with_owner(p_name text)
returns json language plpgsql security definer as $$
declare v_group public.groups%rowtype;
begin
  if p_name is null or btrim(p_name) = '' then
    raise exception 'Group name is required';
  end if;
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.groups (name, created_by)
  values (btrim(p_name), auth.uid())
  returning * into v_group;

  insert into public.group_members (group_id, user_id, role)
  values (v_group.id, auth.uid(), 'owner');

  return json_build_object(
    'id', v_group.id,
    'name', v_group.name,
    'invite_code', v_group.invite_code,
    'created_by', v_group.created_by,
    'created_at', v_group.created_at
  );
end;
$$;
