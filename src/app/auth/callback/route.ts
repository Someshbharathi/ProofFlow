import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const config = getSupabaseConfig();
  if (!config) return NextResponse.redirect(new URL("/login?error=auth_not_configured", request.url));
  const code = request.nextUrl.searchParams.get("code");
  const roleParam = request.nextUrl.searchParams.get("role");
  const requestedRole = roleParam === "freelancer" ? "freelancer" : "client";
  const response = NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: cookiesToSet => cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });
  if (!code) return response;
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return response;
  const { data: profile } = await supabase.from("profiles").select("role, role_confirmed").eq("id", data.user.id).maybeSingle();
  if (!profile) return response;
  if (!profile.role_confirmed) {
    const { error: finalizeError } = await supabase.rpc("finalize_initial_profile", { requested_role: requestedRole });
    if (finalizeError) return NextResponse.redirect(new URL("/login?error=profile_unavailable", request.url), { headers: response.headers });
  }
  const { data: finalProfile } = await supabase.from("profiles").select("role, role_confirmed").eq("id", data.user.id).maybeSingle();
  if (!finalProfile?.role_confirmed) return NextResponse.redirect(new URL("/login?error=profile_unavailable", request.url), { headers: response.headers });
  const destination = finalProfile.role === "admin" ? "/admin/dashboard" : finalProfile.role === "freelancer" ? "/freelancer/dashboard" : "/client/dashboard";
  return NextResponse.redirect(new URL(destination, request.url), { headers: response.headers });
}
