import { createServerClient } from "@supabase/ssr";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";

let hasReportedEnvFile = false;

export async function createClient() {
  if (!hasReportedEnvFile) {
    console.info("[ProofFlow] Supabase env file diagnostic", {
      projectRootEnvLocalPresent: existsSync(resolve(process.cwd(), ".env.local")),
    });
    hasReportedEnvFile = true;
  }
  const config = getSupabaseConfig();
  if (!config) return null;
  const cookieStore = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Server Components cannot write cookies; middleware refreshes them. */ }
      },
    },
  });
}
