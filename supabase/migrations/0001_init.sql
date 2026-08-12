-- Parcel Tracking — schema inițială completă (instalare nouă)
-- Rulează întregul fișier o singură dată în Supabase → SQL Editor.
--
-- Ordinea este importantă:
--   1. Toate CREATE TABLE-urile la început (groups → group_members →
--      packages → shared_links), pentru că `packages.group_id`
--      referențiază `groups`, iar policy-urile RLS referențiază
--      `group_members`. Un CREATE POLICY care folosește un tabel încă
--      inexistent eșuează cu "relation does not exist".
--   2. Toate policy-urile RLS după ce tabelele există.

-- ── Groups ───────────────────────────────────────────────────────────────────

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users not null,
  invite_code text unique default encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz default now()
);

-- ── Group members ────────────────────────────────────────────────────────────

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups on delete cascade not null,
  user_id uuid references auth.users not null,
  role text default 'member',
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

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

-- ── Shared links ─────────────────────────────────────────────────────────────

create table public.shared_links (
  id uuid primary key default gen_random_uuid(),
  package_id text references public.packages on delete cascade not null,
  created_by uuid references auth.users not null,
  created_at timestamptz default now()
);

-- ── Row Level Security: enable on all tables ─────────────────────────────────

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.packages enable row level security;
alter table public.shared_links enable row level security;

-- ── Groups: policy-uri ───────────────────────────────────────────────────────

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

-- ── Group members: policy-uri ────────────────────────────────────────────────

create policy "Members can view their own memberships"
  on public.group_members for select
  using (auth.uid() = user_id);

create policy "Members can insert themselves"
  on public.group_members for insert
  with check (auth.uid() = user_id);

create policy "Members can delete themselves"
  on public.group_members for delete
  using (auth.uid() = user_id);

-- ── Packages: policy-uri ─────────────────────────────────────────────────────

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
-- with check: noile valori sunt permise dacă coletul rămâne într-un grup
-- din care suntem membri SAU e mutat în spațiul personal (group_id = null) —
-- doar dacă e coletul nostru. Fără acest with check, mutarea unui colet din
-- grup în "Coletele mele" (group_id → null) e refuzată de RLS.
create policy "Group members can update group parcels"
  on public.packages for update
  using (
    exists (
      select 1 from public.group_members
      where group_id = packages.group_id and user_id = auth.uid()
    )
  )
  with check (
    (packages.group_id is null and packages.user_id = auth.uid())
    or (
      packages.group_id is not null
      and exists (
        select 1 from public.group_members
        where group_id = packages.group_id and user_id = auth.uid()
      )
    )
  );

-- ── Shared links: policy-uri ─────────────────────────────────────────────────

-- Doar owner-ul își vede linkurile; accesul public trece exclusiv prin RPC.
create policy "Owners can view their shared links"
  on public.shared_links for select
  using (auth.uid() = created_by);

-- Poți distribui doar colete la care ai acces (proprii sau din grupul tău),
-- nu orice package_id din baza de date.
create policy "Owners can create shared links"
  on public.shared_links for insert
  with check (
    auth.uid() = created_by
    and exists (
      select 1 from public.packages
      where packages.id = package_id
        and (
          packages.user_id = auth.uid()
          or exists (
            select 1 from public.group_members
            where group_members.group_id = packages.group_id
              and group_members.user_id = auth.uid()
          )
        )
    )
  );

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

-- Crează un grup și rândul de owner în group_members, atomic.
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

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- Fără includerea tabelului în publicația `supabase_realtime`, evenimentele
-- postgres_changes nu sunt difuzate și sync-ul în timp real între tab-uri
-- nu funcționează. DO block idempotent: verifică și apartenența la publicație,
-- ca re-rularea migrării să nu dea eroare.
do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) and not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'packages'
  ) then
    alter publication supabase_realtime add table public.packages;
  end if;
end $$;

-- Index pentru filtrarea rapidă pe tip + proprietar.
create index if not exists packages_type_user_idx
  on public.packages (type, user_id);
