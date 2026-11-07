"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Bell, Bot, ChartNoAxesCombined, ChevronDown, Compass, FileCheck2,
  FolderKanban, LayoutDashboard, LogOut, Menu, Milestone, Plus, ReceiptText,
  Scale, Settings2, Shield, Users, Wallet, Zap,
} from "lucide-react";
import { DemoPill, StatCard } from "@/components/dashboard/dashboard-ui";
import { WalletConnectionControl } from "@/components/wallet/wallet-connection-control";
import { useWallet } from "@/components/wallet/wallet-provider";
import { createClient } from "@/lib/supabase/client";
import { useAuthIdentity } from "@/components/auth/auth-identity";

export type DashboardNavItem = { label: string; href: string; icon: string };
export type DashboardStat = { label: string; value: string; unit: string; delta: string; icon: string; tone?: string };

const navIcons = {
  LayoutDashboard, FolderKanban, Plus, Milestone, Wallet, ReceiptText, Bot, Settings2,
  Compass, FileCheck2, Users, Shield, Scale, ChartNoAxesCombined,
};

function NetworkSelector() {
  const [open, setOpen] = useState(false);
  const { publicKey, devnetRpcStatus } = useWallet();
  const rpcLabel = devnetRpcStatus === "verified" ? "Devnet RPC verified" : devnetRpcStatus === "checking" ? "Checking Devnet RPC…" : devnetRpcStatus === "error" ? "Devnet RPC unavailable" : "Devnet RPC not checked";
  const rpcColor = devnetRpcStatus === "verified" ? "bg-emerald-400" : devnetRpcStatus === "error" ? "bg-rose-400" : "bg-amber-300";
  return <div className="relative">
    <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="ProofFlow app network: Solana Devnet" className="flex h-7 items-center gap-1.5 rounded-lg border border-white/[.08] bg-white/[.025] px-2 text-[9px] transition hover:border-violet-300/20 hover:bg-white/[.05] sm:px-2.5">
      <span aria-hidden="true" className={`size-1.5 rounded-full ${rpcColor}`} />
      <span className="font-medium text-slate-200">Devnet</span>
      <ChevronDown aria-hidden="true" size={12} className="hidden text-slate-500 sm:inline" />
    </button>
    {open && <div className="absolute right-0 top-9 z-40 w-60 rounded-xl border border-white/10 bg-[#151827] p-3 shadow-2xl"><p className="text-[10px] font-medium text-slate-200">ProofFlow network: Solana Devnet</p><p role="status" className="mt-2 flex items-center gap-1.5 text-[9px] text-slate-300"><span className={`size-1.5 rounded-full ${rpcColor}`} />{rpcLabel}</p><p className="mt-2 text-[9px] leading-4 text-amber-200">{publicKey ? "Phantom’s selected cluster is not exposed to this app. Confirm Devnet in Phantom; the wallet network remains unverified." : "Connect Phantom to verify the Devnet RPC and read a test SOL balance."}</p></div>}
  </div>;
}

function AccountMenu({ name, initials }: { name: string; initials: string }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function logout() {
    setSigningOut(true); setError("");
    try {
      const { error: signOutError } = await createClient().auth.signOut();
      if (signOutError) throw signOutError;
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Could not sign out. Please try again.");
      setSigningOut(false);
    }
  }
  return <div className="relative">
    <button onClick={() => setOpen(!open)} aria-label={`Open ${name} profile menu`} aria-expanded={open} className="flex items-center gap-1 rounded-xl p-1 transition hover:bg-white/[.06]">
      <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-purple-600 text-[10px] font-semibold text-white">{initials}</span>
      <ChevronDown aria-hidden="true" size={13} className="hidden text-slate-500 sm:block" />
    </button>
    {open && <div className="absolute right-0 top-12 z-40 w-52 rounded-xl border border-white/10 bg-[#151827] p-2 shadow-2xl"><p className="px-3 py-2 text-xs text-slate-400">Signed in · {name}</p>{error && <p role="alert" className="px-3 pb-2 text-[10px] text-rose-200">{error}</p>}<button type="button" disabled={signingOut} onClick={() => void logout()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-slate-300 transition hover:bg-white/[.06] disabled:opacity-50"><LogOut aria-hidden="true" size={14} />{signingOut ? "Signing out…" : "Sign out"}</button></div>}
  </div>;
}

function Notifications() {
  const [open, setOpen] = useState(false);
  return <div className="relative">
    <button onClick={() => setOpen(!open)} aria-label="Notifications" aria-expanded={open} className="grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white/[.06] hover:text-white"><Bell aria-hidden="true" size={14} /></button>
    {open && <div className="absolute right-0 top-11 z-40 w-56 rounded-xl border border-white/10 bg-[#151827] p-3 shadow-2xl"><p className="text-[10px] font-medium text-slate-200">Notifications</p><p className="mt-2 text-[9px] text-slate-500">No live notifications in this demo workspace.</p></div>}
  </div>;
}

function Sidebar({ role, nav, setDrawerOpen }: { role: string; nav: DashboardNavItem[]; setDrawerOpen: (open: boolean) => void }) {
  const settings = nav.find(item => item.label === "Settings");
  const mainLinks = nav.filter(item => item.label !== "Settings");
  return <>
    <div className="flex h-[48px] shrink-0 items-center gap-2 px-4">
      <Link href="/" aria-label="ProofFlow home" className="grid size-6 place-items-center rounded-md bg-gradient-to-br from-violet-400 to-fuchsia-600 text-white shadow-lg shadow-violet-950/40 transition hover:shadow-violet-500/30"><Zap aria-hidden="true" size={15} fill="currentColor" /></Link>
      <Link href="/" className="text-[13px] font-semibold tracking-tight">ProofFlow</Link>
    </div>
    <div className="mx-3 mb-3 mt-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-300/15 bg-violet-300/[.1] px-2.5 py-1 text-[9px] font-medium capitalize text-violet-200"><span className="size-1.5 rounded-full bg-violet-300" />{role}</div>
    <nav aria-label={`${role} navigation`} className="flex-1 overflow-y-auto px-2">
      {mainLinks.map(({ label, href, icon }) => {
        const Icon = navIcons[icon as keyof typeof navIcons] ?? LayoutDashboard;
        const active = label === "Overview";
        return <Link onClick={() => setDrawerOpen(false)} key={label} href={href} aria-current={active ? "page" : undefined} className={`group mb-0.5 flex items-center gap-2 rounded-lg px-2 py-[7px] text-[10px] transition duration-200 ${active ? "bg-gradient-to-r from-violet-500/35 to-violet-400/15 text-white shadow-[inset_0_0_0_1px_rgba(167,139,250,.15)]" : "text-slate-400 hover:bg-white/[.045] hover:text-slate-100"}`}>
          <Icon aria-hidden="true" size={12} className={active ? "text-violet-200" : "text-slate-500 group-hover:text-slate-300"} />{label}
        </Link>;
      })}
    </nav>
    {settings && <div className="border-t border-white/[.06] px-2 py-2"><Link onClick={() => setDrawerOpen(false)} href={settings.href} className="group flex items-center gap-2 rounded-lg px-2 py-[7px] text-[10px] text-slate-400 transition hover:bg-white/[.045] hover:text-slate-100"><Settings2 aria-hidden="true" size={12} className="text-slate-500 group-hover:text-slate-300" />Settings</Link></div>}
  </>;
}

export function DashboardLayout({ role, title, description, nav, name, initials, stats, middleLeft, middleRight, bottomLeft, bottomRight }: {
  role: string; title: string; description: string; nav: DashboardNavItem[]; name: string; initials: string;
  stats: DashboardStat[]; middleLeft: ReactNode; middleRight: ReactNode; bottomLeft: ReactNode; bottomRight: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const authenticatedName = useAuthIdentity() ?? name;
  const authenticatedInitials = authenticatedName.trim().split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase() || initials;
  const displayTitle = title.startsWith("Welcome back,") ? `Welcome back, ${authenticatedName}! 👋` : title;
  return <div className="relative min-h-screen overflow-clip bg-[#090911] text-slate-100">
    <div aria-hidden="true" className="dashboard-dots pointer-events-none absolute inset-0" />
    <aside className="dashboard-sidebar fixed inset-y-0 left-0 z-30 hidden w-[150px] flex-col border-r border-white/[.07] bg-[#0b0a14] md:flex"><Sidebar role={role} nav={nav} setDrawerOpen={setDrawerOpen} /></aside>
    {drawerOpen && <div className="fixed inset-0 z-40 md:hidden"><button aria-label="Close navigation overlay" onClick={() => setDrawerOpen(false)} className="absolute inset-0 bg-black/70" /><aside className="dashboard-sidebar relative flex h-full w-[150px] flex-col border-r border-white/[.08] bg-[#0b0a14]"><Sidebar role={role} nav={nav} setDrawerOpen={setDrawerOpen} /></aside></div>}
    <div className="relative min-h-screen md:pl-[150px]">
      <header className="sticky top-0 z-20 flex h-[40px] items-center justify-between border-b border-white/[.07] bg-[#090911]/90 px-3 backdrop-blur-xl sm:px-4">
        <div className="flex items-center gap-3"><button onClick={() => setDrawerOpen(!drawerOpen)} aria-label="Open navigation" aria-expanded={drawerOpen} className="grid size-8 place-items-center rounded-lg text-slate-300 transition hover:bg-white/[.06] md:hidden"><Menu aria-hidden="true" size={18} /></button><Link href="/" aria-label="ProofFlow home" className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-violet-400 to-fuchsia-600 text-white md:hidden"><Zap aria-hidden="true" size={15} fill="currentColor" /></Link><span className="hidden text-sm font-semibold tracking-tight sm:inline md:hidden">ProofFlow</span></div>
        <div className="flex items-center gap-1 sm:gap-2"><NetworkSelector /><WalletConnectionControl /><Notifications /><AccountMenu name={authenticatedName} initials={authenticatedInitials} /></div>
      </header>
      <main className="relative px-4 pb-6 pt-3 sm:px-4 sm:pt-3">
        <div className="mb-3 flex items-start justify-between gap-3"><div><h1 className="text-[18px] font-semibold tracking-[-.035em] sm:text-[19px]">{displayTitle}</h1><p className="mt-0.5 text-[9px] text-slate-400 sm:text-[10px]">{description}</p></div><DemoPill /></div>
        <section aria-label="Demo statistics" className="grid grid-cols-2 gap-2 md:grid-cols-4">{stats.map(stat => <StatCard key={stat.label} {...stat} />)}</section>
        <section aria-label="Dashboard overview" className="mt-3 grid items-stretch gap-3 md:grid-cols-2"><div className="min-w-0">{middleLeft}</div><div className="min-w-0">{middleRight}</div></section>
        <section aria-label="Dashboard activity" className="mt-3 grid items-stretch gap-3 md:grid-cols-2"><div className="min-w-0">{bottomLeft}</div><div className="min-w-0">{bottomRight}</div></section>
      </main>
    </div>
  </div>;
}
