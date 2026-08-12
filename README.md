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
- **Light / Dark theme** — toggle between a clean light look and a neutral dark look; the choice is remembered per device
- **Modern glassmorphism UI** — frosted-glass surfaces, neutral palette with a single blue accent
- English / Romanian language switcher
- **PWA** — installable on any device directly from the browser, works offline

## Supported Couriers

FAN Courier, Cargus, Sameday, DPD, GLS, Posta Romana, DHL, FedEx, UPS, Sinapseria, Dragon Star, PTT Express

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Hosting | GitHub Pages (via GitHub Actions) |
| Database | Supabase (PostgreSQL) |
| Auth | Google OAuth via Supabase |
| Realtime | Supabase Realtime subscriptions |
| Export | SheetJS (xlsx, lazy-loaded) |
| Offline | PWA / Service Worker |

---

## Setup Guide

### Step 1 — Supabase project

1. Go to [supabase.com](https://supabase.com) → Sign Up (free) → New project
2. Wait ~2 minutes for the project to initialize

### Step 2 — Create the database schema

The full schema lives in this repo:

- **`supabase/migrations/0001_init.sql`** — complete schema for new installs.
  Open it in Supabase → **SQL Editor** → **New query** → paste and run.

- **`supabase/migrations/0002_upgrade.sql`** — idempotent upgrade for
  **existing databases** created from an older version of this app
  (adds the missing `status_history`, `archived`, `estimated_delivery`
  columns, the group RLS policies, and the `get_group_members` /
  `remove_group_member` RPCs). Run it after `0001` if you already have data.

- **`supabase/migrations/0003_outgoing_parcels.sql`** — adds the
  **Shipped to clients** section (a `type` column — `'in'` for your own
  purchases, `'out'` for shipments to clients — plus a `client_name`
  column and the updated public-share function). Run it after `0001` +
  `0002` on an existing database.

- **`supabase/migrations/0004_group_creation_rpc.sql`** — adds the
  `create_group_with_owner` RPC that creates a group and its owner
  membership atomically. Run it after `0003` on an existing database.
  (The old two-request flow could leave an orphaned group when the
  `SELECT` on `groups` failed before the owner was a member.)

The migration includes:

- RLS on all tables (users manage their own parcels; group members can view
  and update parcels in shared groups; owners can manage their groups)
- Public read of shared parcels **only** through the `get_shared_package`
  RPC (owners can also revoke a shared link by deleting the row)
- The two group RPCs the app calls: `get_group_members` and
  `remove_group_member`

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

The app builds its redirect URL dynamically from `window.location.origin` +
`Vite BASE_URL`, so the same settings work on custom domains and forks.

### Step 6 — Create GitHub repository

Go to [github.com](https://github.com) → New repository → name: `parcels-tracking` → Create

### Step 7 — Add GitHub Secrets

In the repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Project URL from Step 3 |
| `VITE_SUPABASE_ANON_KEY` | Publishable key from Step 3 |

### Step 8 — Push code and enable GitHub Pages

This repo includes **`.github/workflows/deploy.yml`**, which:

1. Builds the app on every push to `main` (with `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`, and `VITE_BASE_URL=/parcels-tracking/` from the
   secrets / workflow)
2. Copies `index.html` to `404.html` so deep links (`#share/…`, `#invite/…`)
   work after a refresh
3. Publishes the `dist/` folder to GitHub Pages

Push the code, then go to repo → **Settings → Pages** → Source: **GitHub Actions** → Save.

After ~2 minutes the app is live at:
```
https://YOUR_GITHUB_USERNAME.github.io/parcels-tracking/
```

> All asset paths (`index.html`, `manifest.json`, `sw.js`, icons) are
> **relative**, so the app also works on a custom domain or any other base path.

---

## Local development

Create a `.env.local` file in the repo root:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Then run:

```bash
npm install
npm run dev
```

To point the app at a different base path (e.g. when testing the Pages
deployment locally), set `VITE_BASE_URL`:

```bash
VITE_BASE_URL=/parcels-tracking/ npm run dev
```

---

## Installing as a mobile app (PWA)

Open the app URL in your browser:
- **Android (Chrome)**: tap the three-dot menu → Add to Home Screen
- **iPhone (Safari)**: tap Share → Add to Home Screen

The app works offline and behaves like a native app.

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
- **Temă Light / Dark** — comută între un look luminos curat și unul întunecat neutru; alegerea e reținută pe fiecare device
- **Interfață glassmorphism modernă** — suprafețe din sticlă mată, paletă neutră cu un singur accent albastru
- Comutator de limbă Engleză / Română
- **PWA** — instalabilă pe orice device direct din browser, funcționează offline

## Curierii suportați

FAN Courier, Cargus, Sameday, DPD, GLS, Posta Română, DHL, FedEx, UPS, Sinapseria, Dragon Star, PTT Express

---

## Stack tehnologic

| Strat | Tehnologie |
|-------|-----------|
| Frontend | React 18 + Vite |
| Hosting | GitHub Pages (via GitHub Actions) |
| Bază de date | Supabase (PostgreSQL) |
| Autentificare | Google OAuth via Supabase |
| Timp real | Supabase Realtime subscriptions |
| Export | SheetJS (xlsx, încărcat la cerere) |
| Offline | PWA / Service Worker |

---

## Ghid de configurare

### Pasul 1 — Proiect Supabase

1. Mergi pe [supabase.com](https://supabase.com) → Sign Up (gratuit) → New project
2. Așteaptă ~2 minute până pornește proiectul

### Pasul 2 — Creează schema în baza de date

Schema completă e în acest repo:

- **`supabase/migrations/0001_init.sql`** — schema completă pentru o instalare nouă.
  Deschide fișierul în Supabase → **SQL Editor** → **New query** → lipește și rulează.

- **`supabase/migrations/0002_upgrade.sql`** — upgrade idempotent pentru
  **bazele de date existente** create cu o versiune mai veche a aplicației
  (adaugă coloanele lipsă `status_history`, `archived`, `estimated_delivery`,
  policy-urile RLS pentru grupuri și RPC-urile `get_group_members` /
  `remove_group_member`). Rulează-l după `0001` dacă ai deja date.

- **`supabase/migrations/0003_outgoing_parcels.sql`** — adaugă secțiunea
  **Colete expediate la clienți** (coloana `type` — `'in'` pentru
  cumpărăturile proprii, `'out'` pentru expedieri la clienți — plus coloana
  `client_name` și versiunea actualizată a funcției de share public).
  Rulează-l după `0001` + `0002` pe o bază de date existentă.

Migrarea include:

- RLS pe toate tabelele (utilizatorii își gestionează propriile colete; membrii
  unui grup văd și pot actualiza coletele din grup; owner-ii își gestionează
  grupurile)
- Citire publică a coletelor distribuite **doar** prin RPC-ul
  `get_shared_package` (owner-ul poate și revoca un link prin ștergerea
  înregistrării)
- Cele două RPC-uri de grup apelate de aplicație: `get_group_members` și
  `remove_group_member`

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

Aplicația construiește URL-ul de redirect dinamic din `window.location.origin` +
`VITE BASE_URL` Vite, deci aceleași setări funcționează pe domenii custom și pe fork-uri.

### Pasul 6 — Creezi repo-ul GitHub

Mergi pe [github.com](https://github.com) → New repository → nume: `parcels-tracking` → Create

### Pasul 7 — Adaugi secretele GitHub

În repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Nume | Valoare |
|------|---------|
| `VITE_SUPABASE_URL` | Project URL din Pasul 3 |
| `VITE_SUPABASE_ANON_KEY` | Publishable key din Pasul 3 |

### Pasul 8 — Uploadezi codul și activezi GitHub Pages

Acest repo include **`.github/workflows/deploy.yml`**, care:

1. Construiește aplicația la fiecare push pe `main` (cu `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY` și `VITE_BASE_URL=/parcels-tracking/` din secrete
   / workflow)
2. Copiază `index.html` în `404.html` pentru ca linkurile deep (`#share/…`,
   `#invite/…`) să funcționeze după refresh
3. Publică folderul `dist/` pe GitHub Pages

Uploadezi codul, apoi mergi la repo → **Settings → Pages** → Source: **GitHub Actions** → Save.

După ~2 minute aplicația e live la:
```
https://USERNAME_GITHUB.github.io/parcels-tracking/
```

> Toate path-urile către asset-uri (`index.html`, `manifest.json`, `sw.js`,
> iconițele) sunt **relative**, deci aplicația funcționează și pe un domeniu
> custom sau pe orice alt base path.

---

## Dezvoltare locală

Creezi un fișier `.env.local` în rădăcina repo-ului:

```bash
VITE_SUPABASE_URL=url_proiectului
VITE_SUPABASE_ANON_KEY=cheia_anon
```

Apoi rulezi:

```bash
npm install
npm run dev
```

Pentru un base path diferit (ex. când testezi local deploy-ul pe Pages), setezi `VITE_BASE_URL`:

```bash
VITE_BASE_URL=/parcels-tracking/ npm run dev
```

---

## Instalare ca aplicație mobilă (PWA)

Deschizi URL-ul aplicației în browser:
- **Android (Chrome)**: meniu trei puncte → Adaugă pe ecranul principal
- **iPhone (Safari)**: butonul Share → Adaugă pe ecranul principal

Aplicația funcționează offline și se comportă ca o aplicație nativă.
