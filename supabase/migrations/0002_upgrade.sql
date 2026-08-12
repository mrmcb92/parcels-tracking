-- Parcel Tracking — upgrade pentru instalațiile existente
-- Idempotent: poate fi rulat în siguranță de mai multe ori.

-- ── Coloane lipsă pe packages ────────────────────────────────────────────────

alter table public.packages
  add column if not exists status_history jsonb default '[]'::jsonb,
  add column if not exists estimated_delivery text default '',
  add column if not exists archived boolean not null default false;

-- ── Packages: RLS pentru colete în grupuri ───────────────────────────────────
-- Fără aceste policy-uri, membrii unui grup nu pot vedea/edita coletele din grup.

drop policy if exists "Group members can view group parcels"
  on public.packages;

create policy "Group members can view group parcels"
  on public.packages for select
  using (
    exists (
      select 1 from public.group_members
      where group_id = packages.group_id and user_id = auth.uid()
    )
  );

drop policy if exists "Group members can insert group parcels"
  on public.packages;

create policy "Group members can insert group parcels"
  on public.packages for insert
  with check (
    exists (
      select 1 from public.group_members
      where group_id = packages.group_id and user_id = auth.uid()
    )
  );

drop policy if exists "Group members can update group parcels"
  on public.packages;

-- Membrii pot actualiza coletele din grup. with check: noile valori sunt
-- permise dacă coletul rămâne într-un grup din care suntem membri SAU e mutat
-- în spațiul personal (group_id = null) — doar dacă e coletul nostru.
-- Fără acest with check, mutarea unui colet din grup în "Coletele mele"
-- (group_id → null) e refuzată de RLS.
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

-- ── Groups: owner-ul nu poate schimba created_by ─────────────────────────────

drop policy if exists "Group owners can update and delete"
  on public.groups;

create policy "Group owners can update and delete"
  on public.groups for all
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

-- ── Shared links: doar owner-ul își vede linkurile ───────────────────────────
-- Accesul public trece exclusiv prin get_shared_package (RPC security definer).

drop policy if exists "Anyone can read shared links"
  on public.shared_links;

drop policy if exists "Owners can view their shared links"
  on public.shared_links;

create policy "Owners can view their shared links"
  on public.shared_links for select
  using (auth.uid() = created_by);

-- Gaură de securitate reparată: înainte, policy-ul de insert verifica doar
-- created_by, deci oricine putea crea un link public către ORICE colet din
-- baza de date. Acum poți distribui doar colete la care ai acces (proprii
-- sau din grupurile în care ești membru).
drop policy if exists "Owners can create shared links"
  on public.shared_links;

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

drop policy if exists "Owners can delete their shared links"
  on public.shared_links;

create policy "Owners can delete their shared links"
  on public.shared_links for delete
  using (auth.uid() = created_by);

-- ── Realtime: publică evenimentele packages ──────────────────────────────────
-- Fără includerea tabelului în publicația `supabase_realtime`, evenimentele
-- postgres_changes nu sunt difuzate și sync-ul în timp real între tab-uri
-- nu funcționează. Block-ul e idempotent (verifică apartenența), ca re-rularea
-- migrării să nu dea eroare.
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

-- index pentru filtrarea rapidă pe tip + proprietar (idempotent)
create index if not exists packages_type_user_idx
  on public.packages (type, user_id);

-- ── RPC-uri ──────────────────────────────────────────────────────────────────

-- Colete distribuite: doar câmpurile afișate public, fără user_id/group_id.
-- Drop prealabil: PostgreSQL nu permite schimbarea tipului de retur cu
-- create or replace, așa că la bazele vechi ștergem întâi funcția existentă.
drop function if exists get_shared_package(uuid);
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
drop function if exists get_group_by_invite(text);
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
drop function if exists join_group(text);
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
drop function if exists get_group_members(uuid);
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
drop function if exists remove_group_member(uuid, uuid);
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
