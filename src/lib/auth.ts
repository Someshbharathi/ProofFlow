import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "client" | "freelancer" | "admin";
const dashboardForRole: Record<AppRole, string> = {
  client: "/client/dashboard",
  freelancer: "/freelancer/dashboard",
  admin: "/admin/dashboard",
};

export function dashboardPath(role: string | null | undefined) {
  return role && role in dashboardForRole ? dashboardForRole[role as AppRole] : "/login";
}

export async function redirectIfAuthenticated() {
  const supabase = await createClient();
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from("profiles").select("role, role_confirmed").eq("id", user.id).maybeSingle();
  if (profile?.role_confirmed) redirect(dashboardPath(profile.role));
}

export async function requireRole(requiredRole: AppRole) {
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=auth_not_configured");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile, error } = await supabase.from("profiles").select("role, role_confirmed, full_name").eq("id", user.id).maybeSingle();
  if (error || !profile || !profile.role_confirmed || !(profile.role in dashboardForRole)) redirect("/login?error=profile_unavailable");
  if (profile.role !== requiredRole) redirect(dashboardPath(profile.role));
  return { user, role: profile.role as AppRole, name: profile.full_name || user.email || "ProofFlow member" };
}
