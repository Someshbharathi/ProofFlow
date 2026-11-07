let hasReportedDiagnostics = false;

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  // Supabase's publishable key is the current public key; retain anon-key
  // support for existing projects that still use the legacy variable name.
  const key = publishableKey || anonKey;
  if (!hasReportedDiagnostics) {
    console.info("[ProofFlow] Supabase configuration diagnostics", {
      runtime: typeof window === "undefined" ? "server" : "browser",
      supabaseUrlPresent: Boolean(url),
      publishableKeyPresent: Boolean(publishableKey),
      legacyAnonKeyPresent: Boolean(anonKey),
      configurationDetected: Boolean(url && key),
    });
    hasReportedDiagnostics = true;
  }
  return url && key ? { url, key } : null;
}
