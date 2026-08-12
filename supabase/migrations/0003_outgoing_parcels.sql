-- Parcel Tracking — colete expediate la clienți
-- Idempotent: poate fi rulat în siguranță de mai multe ori.

-- ── Coloane noi pe packages ──────────────────────────────────────────────────

-- type: 'in' = cumpărături proprii (comportament existent), 'out' = expediate la clienți
alter table public.packages
  add column if not exists type text not null default 'in';

-- Numele clientului pentru expedieri
alter table public.packages
  add column if not exists client_name text not null default '';

-- Index pentru filtrarea rapidă pe tip + proprietar
create index if not exists packages_type_user_idx
  on public.packages (type, user_id);

-- ── get_shared_package expune și câmpurile noi ───────────────────────────────
-- Drop prealabil: PostgreSQL nu permite schimbarea tipului de retur cu
-- create or replace.
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
