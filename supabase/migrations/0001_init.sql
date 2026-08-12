-- Parcel Tracking — schema inițială completă (instalare nouă)
-- Rulează întregul fișier o singură dată în Supabase → SQL Editor.

-- ── Packages ─────────────────────────────────────────────────────────────────

create table public.packages (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null default '',
  awb text not null default '',
  courier text default 'FAN Courier',
  status text default 'Comandat',
  date text default '',
  notes text default '',
  shop text default '',
  amount text default '',
  order_number text default '',
  products jsonb default '[]'::jsonb,
  status_history jsonb default '[]'::jsonb,
  estimated_delivery text default '',
  archived boolean not null default false,
  group_id uuid references public.groups on delete set null,
  type text not null default 'in',
  client_name text not null default '',
  created_at timestamptz default now()
);

alter table public.packages enable row level security;

-- Proprietarul poate face orice cu coletele lui.
create policy "Users manage their own parcels"
  on public.packages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Membrii unui grup văd coletele din acel grup.
create policy "Group members can view group parcels"
  on public.packages for select
  using (
    exists (
      select 1 from public.group_members
      where group_id = packages.group_id and user_id = auth.uid()
    )
  );

-- Membrii unui grup pot adăuga colete în grup.
create policy "Group members can insert group parcels"
  on public.packages for insert
  with check (
    exists (
      select 1 from public.group_members
      where group_id = packages.group_id and user_id = auth.uid()
    )
  );

-- Membrii unui grup pot actualiza coletele din grup (ex. status rapid).
create policy "Group members can update group parcels"
  on public.packages for update
  using (
    exists (
      select 1 from public.group_members
      where group_id = packages.group_id and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.group_members
      where group_id = packages.group_id and user_id = auth.uid()
    )
  );

-- ── Groups ───────────────────────────────────────────────────────────────────

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users not null,
  invite_code text unique default encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz default now()
);

alter table public.groups enable row level security;

create policy "Group members can view their group"
  on public.groups for select
  using (
    exists (
      select 1 from public.group_members
      where group_id = groups.id and user_id = auth.uid()
    )
  );

create policy "Authenticated users can create groups"
  on public.groups for insert
  with check (auth.uid() = created_by);

-- Owner-ul poate actualiza/șterge grupul, dar nu poate schimba created_by.
create policy "Group owners can update and delete"
  on public.groups for all
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

-- ── Group members ────────────────────────────────────────────────────────────

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups on delete cascade not null,
  user_id uuid references auth.users not null,
  role text default 'member',
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

alter table public.group_members enable row level security;

create policy "Members can view their own memberships"
  on public.group_members for select
  using (auth.uid() = user_id);

create policy "Members can insert themselves"
  on public.group_members for insert
  with check (auth.uid() = user_id);

create policy "Members can delete themselves"
  on public.group_members for delete
  using (auth.uid() = user_id);

-- ── Shared links ─────────────────────────────────────────────────────────────

create table public.shared_links (
  id uuid primary key default gen_random_uuid(),
  package_id text references public.packages on delete cascade not null,
  created_by uuid references auth.users not null,
  created_at timestamptz default now()
);

alter table public.shared_links enable row level security;

-- Doar owner-ul își vede linkurile; accesul public trece exclusiv prin RPC.
create policy "Owners can view their shared links"
  on public.shared_links for select
  using (auth.uid() = created_by);

create policy "Owners can create shared links"
  on public.shared_links for insert
  with check (auth.uid() = created_by);

create policy "Owners can delete their shared links"
  on public.shared_links for delete
  using (auth.uid() = created_by);

-- ── RPC-uri ──────────────────────────────────────────────────────────────────

-- Colete distribuite: doar câmpurile afișate public, fără user_id/group_id.
create or replace function get_shared_package(p_token uuid)
returns json language plpgsql security definer as $$
declare result json;
begin
  select json_build_object(
    'name', p.name,
    'awb', p.awb,
    'courier', p.courier,
    'status', p.status,
    'amount', p.amount,
    'order_number', p.order_number,
    'notes', p.notes,
    'shop', p.shop,
    'date', p.date,
    'type', p.type,
    'client_name', p.client_name
  ) into result
  from public.packages p
  join public.shared_links s on s.package_id = p.id
  where s.id = p_token;
  return result;
end;
$$;

-- Grup după codul de invitație (fără autentificare — doar numele).
create or replace function get_group_by_invite(p_code text)
returns json language plpgsql security definer as $$
declare result json;
begin
  select json_build_object('id', g.id, 'name', g.name)
  into result
  from public.groups g
  where g.invite_code = p_code;
  return result;
end;
$$;

-- Alătură-te unui grup prin codul de invitație.
create or replace function join_group(p_invite_code text)
returns void language plpgsql security definer as $$
declare v_group_id uuid;
begin
  select id into v_group_id from public.groups where invite_code = p_invite_code;
  if v_group_id is null then raise exception 'Invalid invite code'; end if;
  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, auth.uid(), 'member')
  on conflict (group_id, user_id) do nothing;
end;
$$;

-- Lista membrilor unui grup (doar pentru membrii grupului).
create or replace function get_group_members(p_group_id uuid)
returns json language plpgsql security definer as $$
declare result json;
begin
  if not exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid()
  ) then
    raise exception 'Not a member of this group';
  end if;

  select coalesce(json_agg(json_build_object(
    'user_id', gm.user_id,
    'role', gm.role,
    'email', u.email
  ) order by gm.joined_at), '[]'::json)
  into result
  from public.group_members gm
  left join auth.users u on u.id = gm.user_id
  where gm.group_id = p_group_id;
  return result;
end;
$$;

-- Elimină un membru dintr-un grup (doar owner-ul; owner-ul nu poate fi eliminat).
create or replace function remove_group_member(p_group_id uuid, p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  if not exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid() and role = 'owner'
  ) then
    raise exception 'Only the group owner can remove members';
  end if;

  delete from public.group_members
  where group_id = p_group_id and user_id = p_user_id and role <> 'owner';
end;
$$;
