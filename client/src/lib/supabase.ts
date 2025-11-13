import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // In development, allow missing envs and use placeholder values so the app can run
  // without a real Supabase project. If you want strict behavior, set these env vars.
  // This mirrors the server-side behavior.
  // eslint-disable-next-line no-console
  console.warn(
    "⚠️  Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Using placeholder values for development."
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder_key"
);

export default supabase;
