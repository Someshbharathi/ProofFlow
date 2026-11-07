import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

export function createClient() {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Authentication is not configured. Add the Supabase URL and publishable key (or legacy anon key) to .env.local.");
  return createBrowserClient(config.url, config.key);
}
