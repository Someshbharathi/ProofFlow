import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { redirectIfAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return <Suspense><AuthForm mode="login" configured={Boolean(getSupabaseConfig())} /></Suspense>;
}
