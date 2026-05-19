# Tracker Colete

Aplicație personală pentru urmărirea coletelor, accesibilă de pe orice device.  
Autentificare cu magic link (email), date sincronizate în cloud via Supabase.

---

## Setup complet (urmează pașii în ordine)

### Pasul 1 — Creează cont și proiect Supabase (gratuit)

1. Mergi pe [supabase.com](https://supabase.com) → Sign Up (gratuit)
2. **New project** → alege un nume (ex. `tracker-colete`) → setează o parolă DB → Create
3. Așteaptă ~2 minute până pornește proiectul

### Pasul 2 — Creează tabela în Supabase

În Supabase: **SQL Editor** → **New query** → lipești codul de mai jos → **Run**:

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
  category text default 'Altele',
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

### Pasul 3 — Ia credențialele Supabase

În Supabase: **Project Settings** → **API**  
Copiază și salvează:
- **Project URL** (ceva de forma `https://xxxx.supabase.co`)
- **anon public key** (șirul lung de sub "Project API keys")

### Pasul 4 — Configurează URL-ul de redirect în Supabase

În Supabase: **Authentication** → **URL Configuration**  
- **Site URL**: `https://USERNAME.github.io`  
- **Redirect URLs** (Add URL): `https://USERNAME.github.io/tracker-colete/`

(înlocuiește `USERNAME` cu username-ul tău GitHub)

### Pasul 5 — Creează repo-ul pe GitHub

Mergi pe [github.com](https://github.com) → **New repository**  
- Nume: `tracker-colete` (exact, cu cratimă)  
- Vizibilitate: Public sau Private (ambele funcționează)  
- **Nu** bifa README, .gitignore etc.  
- Create repository

### Pasul 6 — Adaugă secretele în GitHub

În repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Adaugă două secrete:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | URL-ul din pasul 3 |
| `VITE_SUPABASE_ANON_KEY` | anon key din pasul 3 |

### Pasul 7 — Push codul

Dezarhivează ZIP-ul, deschide terminalul în folderul `tracker-colete`:

```bash
npm install
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/tracker-colete.git
git push -u origin main
```

### Pasul 8 — Activează GitHub Pages

În repo → **Settings** → **Pages**  
Source: **GitHub Actions** → Save

GitHub Actions rulează automat. În ~2 minute aplicația e live la:
```
https://USERNAME.github.io/tracker-colete/
```

---

## Cum funcționează autentificarea

- Introduci email-ul → primești un link → apeși linkul → ești autentificat
- Funcționează pe orice device, orice browser
- Datele sunt ale tale, sincronizate instant pe toate device-urile

## Tracking automat

Opțional. Necesită un API key Anthropic (are costuri mici de utilizare).  
1. Generează key la [console.anthropic.com](https://console.anthropic.com/settings/keys)
2. În aplicație, apasă iconița 🔑 din header → introdu key-ul
3. Key-ul se salvează local în browser, nu în cloud

## Dacă schimbi numele repo-ului

Editează linia din `.github/workflows/deploy.yml`:
```yaml
VITE_BASE_URL: /NOUL_NUME/
```
Și actualizează URL-urile din Supabase (Authentication → URL Configuration).
