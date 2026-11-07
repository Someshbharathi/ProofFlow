"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase/config";

type Role = "client" | "freelancer";
const friendlyError = (message: string) => {
  if (/invalid login credentials/i.test(message)) return "That email and password combination wasn’t recognized.";
  if (/already registered|already been registered|user already exists/i.test(message)) return "An account with this email already exists. Try signing in instead.";
  if (/email not confirmed/i.test(message)) return "Please confirm your email using the link we sent you.";
  if (/rate limit|too many requests/i.test(message)) return "Too many attempts. Please wait a moment and try again.";
  return message;
};

export function AuthForm({ mode, configured }: { mode: "login" | "signup"; configured: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignup = mode === "signup";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("client");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => { getSupabaseConfig(); }, []);
  const setupError = searchParams.get("error") === "auth_not_configured" && !configured ? "Authentication is not configured yet. Add Supabase environment values to enable sign-in." : searchParams.get("error") === "profile_unavailable" ? "Your account profile could not be loaded. Contact the workspace administrator." : searchParams.get("error") === "oauth_failed" ? "Google sign-in was canceled or could not be completed. Check the provider configuration and try again." : "";

  async function finishLogin(supabase: ReturnType<typeof createClient>, userId: string) {
    const { data: profile, error: profileError } = await supabase.from("profiles").select("role, role_confirmed").eq("id", userId).maybeSingle();
    if (profileError || !profile?.role_confirmed) {
      await supabase.auth.signOut();
      throw new Error("Your ProofFlow profile is not ready. Please complete signup or contact support.");
    }
    router.replace(profile.role === "admin" ? "/admin/dashboard" : profile.role === "freelancer" ? "/freelancer/dashboard" : "/client/dashboard");
    router.refresh();
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setNotice("");
    if (!configured) { setError("Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) to .env.local first."); return; }
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) { setError("Enter a valid email address."); return; }
    if (password.length < 8) { setError("Use a password with at least 8 characters."); return; }
    if (isSignup && !fullName.trim()) { setError("Enter your full name."); return; }
    if (isSignup && password !== confirmPassword) { setError("The passwords do not match."); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      if (isSignup) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { data: { full_name: fullName.trim(), role }, emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}` },
        });
        if (authError) throw authError;
        if (!data.session) { setNotice("Account created. Check your email to confirm the address, then sign in."); return; }
        if (!data.user) throw new Error("Account was created, but the sign-in session was not returned. Check your email for confirmation.");
        await finishLogin(supabase, data.user.id);
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (authError) throw authError;
        await finishLogin(supabase, data.user.id);
      }
    } catch (cause) {
      setError(friendlyError(cause instanceof Error ? cause.message : "Something went wrong. Please try again."));
    } finally { setLoading(false); }
  }

  async function googleSignIn() {
    setError(""); setNotice("");
    if (!configured) { setError("Google sign-in is unavailable until Supabase is configured."); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?role=${role}`, queryParams: { prompt: "select_account" } },
      });
      if (oauthError) throw oauthError;
    } catch (cause) {
      setError(friendlyError(cause instanceof Error ? cause.message : "Could not start Google sign-in."));
      setLoading(false);
    }
  }

  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090911] px-4 py-10 text-slate-100">
    <div aria-hidden="true" className="dashboard-dots pointer-events-none absolute inset-0 opacity-70" />
    <div className="relative z-10 w-full max-w-[440px]">
      <div className="mx-auto mb-7 w-fit"><Brand /></div>
      <section className="rounded-2xl border border-white/[.09] bg-[#10101a] p-6 shadow-[0_22px_80px_rgba(0,0,0,.45)] sm:p-8">
        <div className="mb-6 text-center"><span className="mx-auto grid size-11 place-items-center rounded-xl border border-violet-300/15 bg-violet-300/[.08] text-violet-200"><LockKeyhole size={18} /></span><h1 className="mt-4 text-2xl font-semibold tracking-tight">{isSignup ? "Create your account" : "Welcome back"}</h1><p className="mt-2 text-sm text-slate-400">{isSignup ? "Choose your workspace and get started with ProofFlow." : "Sign in to continue to your ProofFlow workspace."}</p></div>
        {(setupError || error) && <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-300/15 bg-rose-300/[.06] p-3 text-xs leading-5 text-rose-100"><AlertCircle size={15} className="mt-0.5 shrink-0" />{error || setupError}</p>}
        {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-300/15 bg-emerald-300/[.05] p-3 text-xs leading-5 text-emerald-100">{notice}</p>}
        <button type="button" onClick={() => void googleSignIn()} disabled={!configured || loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[.1] bg-white/[.035] text-sm font-medium transition hover:border-violet-300/25 hover:bg-white/[.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <LoaderCircle size={16} className="animate-spin" /> : <GoogleMark />}Continue with Google</button>
        {!configured && <p className="mt-2 text-center text-[10px] text-amber-200">Connect Supabase to enable authentication.</p>}
        <div className="my-5 flex items-center gap-3 text-[10px] text-slate-600"><span className="h-px flex-1 bg-white/[.08]" />OR CONTINUE WITH EMAIL<span className="h-px flex-1 bg-white/[.08]" /></div>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {isSignup && <label className="block text-xs font-medium text-slate-300">Full name<input autoComplete="name" value={fullName} onChange={event => setFullName(event.target.value)} className="auth-input mt-2" placeholder="Your name" maxLength={100} /></label>}
          <label className="block text-xs font-medium text-slate-300">Email address<input autoComplete="email" type="email" value={email} onChange={event => setEmail(event.target.value)} className="auth-input mt-2" placeholder="you@example.com" maxLength={254} /></label>
          {isSignup && <fieldset><legend className="text-xs font-medium text-slate-300">I’m joining as</legend><div className="mt-2 grid grid-cols-2 gap-2">{(["client", "freelancer"] as const).map(value => <button type="button" key={value} aria-pressed={role === value} onClick={() => setRole(value)} className={`h-10 rounded-xl border text-xs font-medium capitalize transition ${role === value ? "border-violet-300/35 bg-violet-400/[.12] text-violet-100" : "border-white/[.09] bg-white/[.02] text-slate-400 hover:border-white/[.16]"}`}>{value}</button>)}</div></fieldset>}
          <div><label htmlFor="password" className="block text-xs font-medium text-slate-300">Password</label><div className="relative mt-2"><input id="password" autoComplete={isSignup ? "new-password" : "current-password"} type={showPassword ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} className="auth-input pr-11" placeholder={isSignup ? "At least 8 characters" : "Your password"} minLength={8} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(value => !value)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-500 transition hover:text-violet-200">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></div>
          {isSignup && <label className="block text-xs font-medium text-slate-300">Confirm password<input autoComplete="new-password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="auth-input mt-2" placeholder="Repeat your password" /></label>}
          <button type="submit" disabled={!configured || loading} className="metro-button-primary mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-[#140c20] transition disabled:cursor-not-allowed disabled:opacity-50">{loading && <LoaderCircle size={15} className="animate-spin" />}{isSignup ? "Create account" : "Sign in"}</button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">{isSignup ? "Already have an account?" : "New to ProofFlow?"} <Link href={isSignup ? "/login" : "/signup"} className="font-medium text-violet-300 transition hover:text-violet-200">{isSignup ? "Sign in" : "Create an account"}</Link></p>
        <p className="mt-4 text-center text-[10px] leading-4 text-slate-600">Wallet connection is separate from account sign-in. ProofFlow never asks for private keys or recovery phrases.</p>
      </section>
    </div>
  </main>;
}

function GoogleMark() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.09-1.92 3.27-4.75 3.27-8.1Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.15A11 11 0 0 0 1 12c0 1.78.43 3.46 1.15 4.95l3.69-2.84Z"/><path fill="#EA4335" d="M12 5.36c1.62 0 3.06.56 4.21 1.64l3.16-3.16C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.85 6.05l3.69 2.84C6.71 7.29 9.14 5.36 12 5.36Z"/></svg>; }
