import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  // Fail loudly instead of creating a broken client that errors at runtime.
  throw new Error(
    "VITE_SUPABASE_URL și VITE_SUPABASE_ANON_KEY lipsesc. " +
    "Adaugă-le în .env.local (dev) sau ca repository secrets (CI)."
  );
}

export const supabase = createClient(url, key);
