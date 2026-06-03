# Parcel Tracking

A personal parcel tracking app accessible from any device. Built with React, Supabase, and deployed on GitHub Pages.

---

## Features

- **Multiple products per parcel** — add as many items as you want (name + quantity); the parcel title is generated automatically from the product list
- Add, edit, and delete parcels with confirmation modal to prevent accidental deletion
- Fields per parcel: products, AWB, courier, shop, amount, status, order number, date, notes
- **Quick status change** — one click directly on the parcel card (Ordered → In delivery → Delivered)
- Direct tracking link — opens the courier's official tracking page
- Filter by status and search by name, AWB, or shop
- Export to **CSV** and **Excel** (includes all fields and products)
- **Share a parcel** via a read-only public link — no account needed for the viewer
- **Groups** — create groups, invite people via link, add parcels shared within the group
- Move parcels between personal space and any group
- Real-time sync — data updates across all open tabs instantly
- **Google Sign-In** — each user sees only their own parcels
- English / Romanian language switcher
- **PWA** — installable on any device directly from the browser

## Supported Couriers

FAN Courier, Cargus, Sameday, DPD, GLS, Posta Romana, DHL, FedEx, UPS, Sinapseria, Dragon Star, PTT Express

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Hosting | GitHub Pages |
| Database | Supabase (PostgreSQL) |
| Auth | Google OAuth via Supabase |
| Realtime | Supabase Realtime subscriptions |
| Export | SheetJS (xlsx) |
| Offline | PWA / Service Worker |

---

## Setup Guide

### Step 1 — Supabase project

1. Go to [supabase.com](https://supabase.com) → Sign Up (free) → New project
2. Wait ~2 minutes for the project to initialize

### Step 2 — Create the database tables

In Supabase → **SQL Editor** → **New query** → paste and run:

```sql
-- Packages table
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
  group_id uuid,
  created_at timestamptz default now()
);

alter table public.packages enable row level security;

create policy "Users manage their own parcels"
  on public.packages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Groups table
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

create policy "Group owners can update and delete"
  on public.groups for all
  using (auth.uid() = created_by);

-- Group members table
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

-- Shared links table
create table public.shared_links (
  id uuid primary key default gen_random_uuid(),
  package_id text references public.packages on delete cascade not null,
  created_by uuid references auth.users not null,
  created_at timestamptz default now()
);

alter table public.shared_links enable row level security;

create policy "Anyone can read shared links"
  on public.shared_links for select using (true);

create policy "Owners can create shared links"
  on public.shared_links for insert
  with check (auth.uid() = created_by);

-- RPC: get shared parcel (public, no auth required)
create or replace function get_shared_package(p_token uuid)
returns json language plpgsql security definer as $$
declare result json;
begin
  select row_to_json(p) into result
  from public.packages p
  join public.shared_links s on s.package_id = p.id
  where s.id = p_token;
  return result;
end;
$$;

-- RPC: get group by invite code (public)
create or replace function get_group_by_invite(p_code text)
returns json language plpgsql security definer as $$
declare result json;
begin
  select row_to_json(g) into result
  from public.groups g
  where g.invite_code = p_code;
  return result;
end;
$$;

-- RPC: join group via invite code
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
```

> **Already have the app running?** If you're upgrading from an older version, run this migration instead:
> ```sql
> alter table packages
>   add column if not exists order_number text default '',
>   add column if not exists products jsonb default '[]'::jsonb,
>   add column if not exists group_id uuid;
>
> alter table packages
>   drop column if exists last_event,
>   drop column if exists last_location,
>   drop column if exists last_checked,
>   drop column if exists category;
> ```

### Step 3 — Get Supabase credentials

In Supabase → **Settings → API Keys**:
- Copy the **Project URL** (format: `https://xxxx.supabase.co`)
- Copy the **Publishable key** (starts with `sb_publishable_`)

### Step 4 — Configure Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → New Project
2. **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
3. Configure OAuth Consent Screen if prompted (External, fill in app name and email)
4. Application type: **Web application**
5. Authorized redirect URIs: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
6. Copy **Client ID** and **Client Secret**
7. In Supabase → **Authentication → Sign In / Providers → Google** → Enable → paste credentials → Save

### Step 5 — Configure Supabase redirect URLs

In Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://YOUR_GITHUB_USERNAME.github.io`
- **Redirect URLs** → Add: `https://YOUR_GITHUB_USERNAME.github.io/parcels-tracking/`

### Step 6 — Create GitHub repository

Go to [github.com](https://github.com) → New repository → name: `parcels-tracking` → Create

### Step 7 — Add GitHub Secrets

In the repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Project URL from Step 3 |
| `VITE_SUPABASE_ANON_KEY` | Publishable key from Step 3 |

### Step 8 — Push code and enable GitHub Pages

Push the code to GitHub, then go to repo → **Settings → Pages** → Source: **GitHub Actions** → Save.

After ~2 minutes the app is live at:
```
https://YOUR_GITHUB_USERNAME.github.io/parcels-tracking/
```

---

## Installing as a mobile app (PWA)

Open the app URL in your browser:
- **Android (Chrome)**: tap the three-dot menu → Add to Home Screen
- **iPhone (Safari)**: tap Share → Add to Home Screen

The app works offline and behaves like a native app.

---

---

# Parcel Tracking (Română)

O aplicație personală pentru urmărirea coletelor, accesibilă de pe orice device. Construită cu React, Supabase și publicată pe GitHub Pages.

---

## Funcționalități

- **Mai multe produse per colet** — adaugi câte articole vrei (nume + cantitate); titlul coletului se generează automat din lista de produse
- Adaugă, editează și șterge colete cu modal de confirmare pentru a evita ștergerea accidentală
- Câmpuri per colet: produse, AWB, curier, magazin, sumă, status, număr comandă, dată, note
- **Schimbare rapidă de status** — un singur click direct pe cardul coletului (Comandat → In livrare → Livrat)
- Link direct de tracking — deschide pagina oficială a curierului
- Filtrare după status și căutare după nume, AWB sau magazin
- Export în **CSV** și **Excel** (include toate câmpurile și produsele)
- **Distribuie un colet** printr-un link public read-only — vizitatorul nu are nevoie de cont
- **Grupuri** — creează grupuri, invită persoane prin link, adaugă colete partajate în cadrul grupului
- Mută colete între spațiul personal și orice grup
- Sincronizare în timp real — datele se actualizează instantaneu pe toate tab-urile deschise
- **Autentificare cu Google** — fiecare utilizator vede doar propriile colete
- Comutator de limbă Engleză / Română
- **PWA** — instalabilă pe orice device direct din browser

## Curierii suportați

FAN Courier, Cargus, Sameday, DPD, GLS, Posta Română, DHL, FedEx, UPS, Sinapseria, Dragon Star, PTT Express

---

## Stack tehnologic

| Strat | Tehnologie |
|-------|-----------|
| Frontend | React 18 + Vite |
| Hosting | GitHub Pages |
| Bază de date | Supabase (PostgreSQL) |
| Autentificare | Google OAuth via Supabase |
| Timp real | Supabase Realtime subscriptions |
| Export | SheetJS (xlsx) |
| Offline | PWA / Service Worker |

---

## Ghid de configurare

### Pasul 1 — Proiect Supabase

1. Mergi pe [supabase.com](https://supabase.com) → Sign Up (gratuit) → New project
2. Așteaptă ~2 minute până pornește proiectul

### Pasul 2 — Creează tabelele în baza de date

În Supabase → **SQL Editor** → **New query** → lipești și rulezi:

```sql
-- Tabela packages (colete)
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
  group_id uuid,
  created_at timestamptz default now()
);

alter table public.packages enable row level security;

create policy "Utilizatorii gestionează propriile colete"
  on public.packages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tabela groups (grupuri)
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users not null,
  invite_code text unique default encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz default now()
);

alter table public.groups enable row level security;

create policy "Membrii pot vedea grupul lor"
  on public.groups for select
  using (
    exists (
      select 1 from public.group_members
      where group_id = groups.id and user_id = auth.uid()
    )
  );

create policy "Utilizatorii autentificați pot crea grupuri"
  on public.groups for insert
  with check (auth.uid() = created_by);

create policy "Proprietarii pot actualiza și șterge"
  on public.groups for all
  using (auth.uid() = created_by);

-- Tabela group_members (membri grupuri)
create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups on delete cascade not null,
  user_id uuid references auth.users not null,
  role text default 'member',
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

alter table public.group_members enable row level security;

create policy "Membrii pot vedea propriile membership-uri"
  on public.group_members for select
  using (auth.uid() = user_id);

create policy "Membrii se pot adăuga singuri"
  on public.group_members for insert
  with check (auth.uid() = user_id);

create policy "Membrii se pot elimina singuri"
  on public.group_members for delete
  using (auth.uid() = user_id);

-- Tabela shared_links (linkuri de distribuire)
create table public.shared_links (
  id uuid primary key default gen_random_uuid(),
  package_id text references public.packages on delete cascade not null,
  created_by uuid references auth.users not null,
  created_at timestamptz default now()
);

alter table public.shared_links enable row level security;

create policy "Oricine poate citi linkurile distribuite"
  on public.shared_links for select using (true);

create policy "Proprietarii pot crea linkuri"
  on public.shared_links for insert
  with check (auth.uid() = created_by);

-- RPC: obține coletul distribuit (fără autentificare)
create or replace function get_shared_package(p_token uuid)
returns json language plpgsql security definer as $$
declare result json;
begin
  select row_to_json(p) into result
  from public.packages p
  join public.shared_links s on s.package_id = p.id
  where s.id = p_token;
  return result;
end;
$$;

-- RPC: obține grupul după codul de invitație
create or replace function get_group_by_invite(p_code text)
returns json language plpgsql security definer as $$
declare result json;
begin
  select row_to_json(g) into result
  from public.groups g
  where g.invite_code = p_code;
  return result;
end;
$$;

-- RPC: alătură-te unui grup prin codul de invitație
create or replace function join_group(p_invite_code text)
returns void language plpgsql security definer as $$
declare v_group_id uuid;
begin
  select id into v_group_id from public.groups where invite_code = p_invite_code;
  if v_group_id is null then raise exception 'Cod de invitație invalid'; end if;
  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, auth.uid(), 'member')
  on conflict (group_id, user_id) do nothing;
end;
$$;
```

> **Ai aplicația deja instalată?** Dacă faci upgrade de la o versiune mai veche, rulează în schimb această migrare:
> ```sql
> alter table packages
>   add column if not exists order_number text default '',
>   add column if not exists products jsonb default '[]'::jsonb,
>   add column if not exists group_id uuid;
>
> alter table packages
>   drop column if exists last_event,
>   drop column if exists last_location,
>   drop column if exists last_checked,
>   drop column if exists category;
> ```

### Pasul 3 — Obții credențialele Supabase

În Supabase → **Settings → API Keys**:
- Copiezi **Project URL** (format: `https://xxxx.supabase.co`)
- Copiezi **Publishable key** (începe cu `sb_publishable_`)

### Pasul 4 — Configurezi Google OAuth

1. Mergi pe [console.cloud.google.com](https://console.cloud.google.com) → New Project
2. **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
3. Configurezi OAuth Consent Screen dacă îți cere (External, completezi numele aplicației și emailul)
4. Application type: **Web application**
5. Authorized redirect URIs: `https://ID_PROIECT.supabase.co/auth/v1/callback`
6. Copiezi **Client ID** și **Client Secret**
7. În Supabase → **Authentication → Sign In / Providers → Google** → Enable → lipești credențialele → Save

### Pasul 5 — Configurezi URL-urile de redirect în Supabase

În Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://USERNAME_GITHUB.github.io`
- **Redirect URLs** → Add URL: `https://USERNAME_GITHUB.github.io/parcels-tracking/`

### Pasul 6 — Creezi repo-ul GitHub

Mergi pe [github.com](https://github.com) → New repository → nume: `parcels-tracking` → Create

### Pasul 7 — Adaugi secretele GitHub

În repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Nume | Valoare |
|------|---------|
| `VITE_SUPABASE_URL` | Project URL din Pasul 3 |
| `VITE_SUPABASE_ANON_KEY` | Publishable key din Pasul 3 |

### Pasul 8 — Uploadezi codul și activezi GitHub Pages

Uploadezi codul pe GitHub, apoi mergi la repo → **Settings → Pages** → Source: **GitHub Actions** → Save.

După ~2 minute aplicația e live la:
```
https://USERNAME_GITHUB.github.io/parcels-tracking/
```

---

## Instalare ca aplicație mobilă (PWA)

Deschizi URL-ul aplicației în browser:
- **Android (Chrome)**: meniu trei puncte → Adaugă pe ecranul principal
- **iPhone (Safari)**: butonul Share → Adaugă pe ecranul principal

Aplicația funcționează offline și se comportă ca o aplicație nativă.
