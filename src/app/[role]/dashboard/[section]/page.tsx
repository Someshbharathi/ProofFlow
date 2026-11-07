import Link from "next/link";
import { ArrowLeft, Clock3, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { Brand } from "@/components/brand";
import { PlaceholderNotice } from "@/components/dashboard/dashboard-ui";

const roles = ["client", "freelancer", "admin"];

export default async function DashboardPlaceholder({ params }: { params: Promise<{ role: string; section: string }> }) {
  const { role, section } = await params;
  if (!roles.includes(role)) notFound();
  const title = section.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase());
  return <main className="min-h-screen bg-[#090b14] px-5 py-8 text-slate-100 sm:px-8"><div className="mx-auto max-w-5xl"><header className="flex items-center justify-between border-b border-white/[.07] pb-6"><Brand /><span className="rounded-full border border-amber-300/15 bg-amber-300/[.06] px-3 py-1.5 text-[10px] text-amber-200">Demo workspace · {role}</span></header><section className="mx-auto mt-20 max-w-xl"><Link href={`/${role}/dashboard`} className="inline-flex items-center gap-2 text-xs text-slate-400 transition hover:text-white"><ArrowLeft size={14} /> Back to overview</Link><div className="glass mt-5 rounded-3xl p-7 sm:p-9"><span className="grid size-11 place-items-center rounded-2xl bg-violet-300/[.1] text-violet-200"><Clock3 size={19} /></span><p className="mt-7 text-[10px] font-semibold uppercase tracking-[.2em] text-violet-300">{role} workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-400">This section is part of the ProofFlow dashboard navigation. Its product workflow is not implemented in this frontend preview yet.</p><div className="mt-7"><PlaceholderNotice /></div><div className="mt-7 flex items-center gap-2 text-[10px] text-slate-500"><ShieldCheck size={14} className="text-violet-300" /> No wallet, AI service, or blockchain integration is active.</div><Link href={`/${role}/dashboard`} className="button-secondary mt-7 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs">Return to dashboard <ArrowLeft className="rotate-180" size={13} /></Link></div></section></div></main>;
}
