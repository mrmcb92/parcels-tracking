# Parcel Tracking

A personal parcel and AWB tracking app, accessible from any device. Built with React, Supabase, and GitHub Pages.

---

## Features

- Add, edit, and delete parcels with AWB, courier, shop, amount, status, and date
- Automatic status checking via GitHub Actions (runs 4 times/day without any user action)
- Manual status check button on each parcel card
- Direct tracking link via 17track.net for all couriers
- Filter and search by name, AWB, or shop
- Export to CSV and Excel
- Google Sign-In authentication — each user sees only their own parcels
- English / Romanian language switcher
- PWA — installable on any device directly from the browser
- Data stored in Supabase cloud, synced across all devices

## Supported Couriers

FAN Courier, Cargus, Sameday, DPD, GLS, Posta Romana, and any other courier via 17track.net

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Hosting | GitHub Pages |
| Database | Supabase (PostgreSQL) |
| Auth | Google OAuth via Supabase |
| Auto-tracking | GitHub Actions cron + Anthropic API |
| Manual tracking | Supabase Edge Functions + Anthropic API |
| Export | SheetJS (xlsx) |

---

## Setup Guide

### Step 1 — Supabase project

1. Go to [supabase.com](https://supabase.com) → Sign Up (free) → New project
2. Wait ~2 minutes for the project to start

### Step 2 — Create the database table

In Supabase → **SQL Editor** → **New query** → paste and run:

```sql
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
  category text default '',
  last_event text default '',
  last_location text default '',
  last_checked timestamptz,
  created_at timestamptz default now()
);

alter table public.packages enable row level security;

create policy "Users manage their own parcels"
  on public.packages
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### Step 3 — Get Supabase credentials

In Supabase → **Settings → API Keys**:
- Copy the **Project URL** (format: `https://xxxx.supabase.co`)
- Copy the **Publishable key** (starts with `sb_publishable_`)

Also go to **Settings → API Keys → Legacy anon, service_role API keys**:
- Copy the **service_role** key (needed for GitHub Actions cron)

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
- **Redirect URLs** → Add URL: `https://YOUR_GITHUB_USERNAME.github.io/tracker-colete/`

### Step 6 — Create GitHub repository

Go to [github.com](https://github.com) → New repository → name: `tracker-colete` → Create

### Step 7 — Add GitHub Secrets

In the repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Project URL from Step 3 |
| `VITE_SUPABASE_ANON_KEY` | Publishable key from Step 3 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key from Step 3 |
| `ANTHROPIC_API_KEY` | Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com/settings/keys) |

### Step 8 — Push code and enable GitHub Pages

Push the code to GitHub, then go to repo → **Settings → Pages** → Source: **GitHub Actions** → Save.

After ~2 minutes the app is live at:
```
https://YOUR_GITHUB_USERNAME.github.io/tracker-colete/
```

### Step 9 — Deploy Supabase Edge Function

In Supabase → **Edge Functions → Deploy a new function → Via Editor**:
- Paste the contents of `supabase/functions/check-tracking/index.ts`
- Set function name to `check-tracking`
- Click **Deploy function**

Then go to **Edge Functions → Secrets** → add:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

---

## How auto-tracking works

GitHub Actions runs automatically at **06:00, 12:00, 18:00, and 00:00 UTC** (09:00, 15:00, 21:00, 03:00 Romania time). It checks all active parcels (not Delivered or Returned), updates their status and last event in Supabase. When you open the app, data is already up to date.

You can also trigger it manually: **Actions tab → Auto Tracking Check → Run workflow**.

---

## Installing as a mobile app (PWA)

Open `https://YOUR_GITHUB_USERNAME.github.io/tracker-colete/` in your browser:
- **Android (Chrome)**: tap the three-dot menu → Add to Home Screen
- **iPhone (Safari)**: tap Share → Add to Home Screen

The app works offline and behaves like a native app.

---
---

# Parcel Tracking (Română)

O aplicație personală pentru urmărirea coletelor și AWB-urilor, accesibilă de pe orice device. Construită cu React, Supabase și GitHub Pages.

---

## Funcționalități

- Adaugă, editează și șterge colete cu AWB, curier, magazin, sumă, status și dată
- Verificare automată a statusului prin GitHub Actions (rulează de 4 ori/zi fără nicio acțiune din partea utilizatorului)
- Buton de verificare manuală a statusului pe fiecare card
- Link direct de tracking prin 17track.net pentru toți curierii
- Filtrare și căutare după nume, AWB sau magazin
- Export în CSV și Excel
- Autentificare cu Google — fiecare utilizator vede doar propriile colete
- Comutator de limbă Engleză / Română
- PWA — instalabilă pe orice device direct din browser
- Date stocate în cloud Supabase, sincronizate pe toate device-urile

## Curierii suportați

FAN Courier, Cargus, Sameday, DPD, GLS, Posta Română, și orice alt curier prin 17track.net

---

## Stack tehnologic

| Strat | Tehnologie |
|-------|-----------|
| Frontend | React + Vite |
| Hosting | GitHub Pages |
| Bază de date | Supabase (PostgreSQL) |
| Autentificare | Google OAuth via Supabase |
| Tracking automat | GitHub Actions cron + Anthropic API |
| Tracking manual | Supabase Edge Functions + Anthropic API |
| Export | SheetJS (xlsx) |

---

## Ghid de configurare

### Pasul 1 — Proiect Supabase

1. Mergi pe [supabase.com](https://supabase.com) → Sign Up (gratuit) → New project
2. Așteaptă ~2 minute până pornește proiectul

### Pasul 2 — Creează tabela în baza de date

În Supabase → **SQL Editor** → **New query** → lipești și rulezi:

```sql
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
  category text default '',
  last_event text default '',
  last_location text default '',
  last_checked timestamptz,
  created_at timestamptz default now()
);

alter table public.packages enable row level security;

create policy "Utilizatorii gestionează propriile colete"
  on public.packages
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### Pasul 3 — Obții credențialele Supabase

În Supabase → **Settings → API Keys**:
- Copiezi **Project URL** (format: `https://xxxx.supabase.co`)
- Copiezi **Publishable key** (începe cu `sb_publishable_`)

Mergi și la **Settings → API Keys → Legacy anon, service_role API keys**:
- Copiezi cheia **service_role** (necesară pentru cron-ul GitHub Actions)

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
- **Redirect URLs** → Add URL: `https://USERNAME_GITHUB.github.io/tracker-colete/`

### Pasul 6 — Creezi repo-ul GitHub

Mergi pe [github.com](https://github.com) → New repository → nume: `tracker-colete` → Create

### Pasul 7 — Adaugi secretele GitHub

În repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Nume | Valoare |
|------|---------|
| `VITE_SUPABASE_URL` | Project URL din Pasul 3 |
| `VITE_SUPABASE_ANON_KEY` | Publishable key din Pasul 3 |
| `SUPABASE_SERVICE_ROLE_KEY` | Cheia service_role din Pasul 3 |
| `ANTHROPIC_API_KEY` | API key-ul Anthropic de la [console.anthropic.com](https://console.anthropic.com/settings/keys) |

### Pasul 8 — Push cod și activezi GitHub Pages

Uploadezi codul pe GitHub, apoi mergi la repo → **Settings → Pages** → Source: **GitHub Actions** → Save.

După ~2 minute aplicația e live la:
```
https://USERNAME_GITHUB.github.io/tracker-colete/
```

### Pasul 9 — Deployezi Supabase Edge Function

În Supabase → **Edge Functions → Deploy a new function → Via Editor**:
- Lipești conținutul fișierului `supabase/functions/check-tracking/index.ts`
- Setezi numele funcției la `check-tracking`
- Apeși **Deploy function**

Apoi mergi la **Edge Functions → Secrets** → adaugi:

| Nume | Valoare |
|------|---------|
| `ANTHROPIC_API_KEY` | API key-ul tău Anthropic |

---

## Cum funcționează tracking-ul automat

GitHub Actions rulează automat la **06:00, 12:00, 18:00 și 00:00 UTC** (09:00, 15:00, 21:00, 03:00 ora României). Verifică toate coletele active (nu Livrat sau Retur), actualizează statusul și ultimul eveniment în Supabase. Când deschizi aplicația, datele sunt deja actualizate.

Poți declanșa și manual: **tab Actions → Auto Tracking Check → Run workflow**.

---

## Instalare ca aplicație mobilă (PWA)

Deschizi `https://USERNAME_GITHUB.github.io/tracker-colete/` în browser:
- **Android (Chrome)**: meniu trei puncte → Adaugă pe ecranul principal
- **iPhone (Safari)**: butonul Share → Adaugă pe ecranul principal

Aplicația funcționează offline și se comportă ca o aplicație nativă.
