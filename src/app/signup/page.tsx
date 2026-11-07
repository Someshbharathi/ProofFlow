import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { redirectIfAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  await redirectIfAuthenticated();
  return <Suspense><AuthForm mode="signup" configured={Boolean(getSupabaseConfig())} /></Suspense>;
}
