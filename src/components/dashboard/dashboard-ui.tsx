"use client";

import { useState, type ReactNode } from "react";
import { Activity, ArrowDownLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, Clock3, Coins, FolderKanban, Layers, LockKeyhole, Shield, Users, Wallet, WalletCards } from "lucide-react";
import type { Project, Transaction } from "@/lib/dashboard-data";

export function DemoPill() {
  return <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-300/[.07] px-2.5 py-1 text-[9px] font-medium tracking-wide text-violet-200"><span aria-hidden="true" className="size-1.5 rounded-full bg-violet-300" /> DEMO DATA</span>;
}

export function StatCard({ label, value, unit, delta, icon, tone }: { label: string; value: string; unit: string; delta: string; icon: string; tone?: string }) {
  const icons = { ArrowDownLeft, ArrowUpRight, Shield, FolderKanban, Folder: FolderKanban, Layers, Wallet, WalletCards, LockKeyhole, Coins, Clock: Clock3, Check: CheckCircle2, Users };
  const Icon = icons[icon as keyof typeof icons] ?? Activity;
  const accent = tone === "green" ? "border-emerald-300/[.1] bg-emerald-300/[.08] text-emerald-200" : "border-violet-300/[.1] bg-violet-300/[.08] text-violet-200";
  return <article className="group min-h-[60px] rounded-xl border border-white/[.075] bg-gradient-to-br from-[#151423] to-[#10111a] p-2.5 transition duration-200 hover:-translate-y-0.5 hover:border-violet-300/25 hover:bg-[#171526] hover:shadow-[0_8px_28px_rgba(124,58,237,.12)] sm:p-2.5"><div className="flex items-center justify-between gap-1.5"><h2 className="text-[9px] leading-tight text-slate-400 sm:text-[10px]">{label}</h2><span className={`grid size-7 shrink-0 place-items-center rounded-lg border ${accent}`}><Icon aria-hidden="true" size={14} /></span></div><p className="mt-1 text-[16px] font-semibold tracking-tight sm:text-[17px]">{value}<span className="ml-1 text-[9px] font-normal text-slate-400">{unit}</span></p><span className="sr-only">{delta}</span></article>;
}

export function DashboardSection({ title, description, action, children, className = "" }: { title: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`dashboard-panel flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-white/[.075] bg-gradient-to-br from-[#12111d] to-[#0e0f17] ${className}`}><header className="flex min-h-[42px] items-center justify-between gap-2 border-b border-white/[.06] px-3 py-2"><div className="min-w-0"><h2 className="text-[11px] font-semibold text-slate-100">{title}</h2>{description && <span className="sr-only">{description}</span>}</div>{action}</header>{children}</section>;
}

export function ChartPanel({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return <DashboardSection title={title} description={description} action={action} className="h-full"><div className="p-2.5">{children}</div></DashboardSection>;
}

export function ActivityPanel({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return <DashboardSection title={title} description={description} action={action}>{children}</DashboardSection>;
}

export function StatusBadge({ status }: { status: string }) {
  const color = /released|complete|approved|resolved/i.test(status) ? "border-emerald-300/15 bg-emerald-300/[.06] text-emerald-200" : /review|pending|due|high/i.test(status) ? "border-amber-300/15 bg-amber-300/[.06] text-amber-200" : /progress|escrow|normal/i.test(status) ? "border-blue-300/15 bg-blue-300/[.06] text-blue-200" : "border-white/10 bg-white/[.04] text-slate-400";
  return <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-[9px] font-medium ${color}`}>{status}</span>;
}

export function ProjectList({ projects, counterpartyLabel }: { projects: Project[]; counterpartyLabel: string }) {
  return <div className="divide-y divide-white/[.055]">{projects.map(project => <article key={project.name} className="p-4 transition hover:bg-white/[.025] sm:px-5"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl border border-violet-300/10 bg-gradient-to-br from-violet-400/[.14] to-blue-400/[.07] text-[9px] font-semibold text-violet-100">{project.initials}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-[11px] font-medium">{project.name}</h3><StatusBadge status={project.status} /></div><p className="mt-1 text-[9px] text-slate-500">{counterpartyLabel}: {project.counterparty}</p></div><div className="text-right"><p className="text-[10px] font-medium">{project.amount}</p><p className="mt-1 text-[9px] text-slate-600">demo amount</p></div></div><div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-violet-400 to-blue-400 transition-all duration-500" style={{ width: `${project.progress}%` }} /></div><span className="text-[9px] text-slate-500">{project.progress}%</span></div><div className="mt-2 flex justify-between gap-2 text-[9px] text-slate-500"><span>{project.milestones}</span><span className="text-right">{project.due}</span></div></article>)}</div>;
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return <div className="divide-y divide-white/[.055]">{transactions.map((item, index) => <div key={`${item.title}-${index}`} className="flex items-center gap-3 px-4 py-3.5 sm:px-5"><span className={`grid size-8 shrink-0 place-items-center rounded-xl ${item.direction === "in" ? "bg-emerald-300/[.08] text-emerald-200" : "bg-violet-300/[.08] text-violet-200"}`}>{item.direction === "in" ? <ArrowDownLeft aria-hidden="true" size={14} /> : <ArrowUpRight aria-hidden="true" size={14} />}</span><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium">{item.title}</p><p className="mt-1 truncate text-[9px] text-slate-500">{item.project} · {item.date}</p></div><div className="text-right"><p className={`text-[10px] font-medium ${item.direction === "in" ? "text-emerald-200" : "text-slate-200"}`}>{item.amount}</p><div className="mt-1"><StatusBadge status={item.status} /></div></div></div>)}</div>;
}

export function EmptyState({ title, copy }: { title: string; copy: string }) {
  return <div className="grid min-h-36 place-items-center px-6 py-8 text-center"><div><span className="mx-auto grid size-9 place-items-center rounded-xl bg-white/[.04] text-slate-500"><FolderKanban size={16} /></span><p className="mt-3 text-xs font-medium text-slate-300">{title}</p><p className="mt-1 text-[10px] text-slate-500">{copy}</p></div></div>;
}

export function ActionQueue({ items, type }: { items: { title: string; project: string; person?: string; amount?: string; date?: string; client?: string; budget?: string; received?: string; initials?: string }[]; type: "approval" | "invitation" }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const visible = items.filter(item => !dismissed.includes(item.title));
  const act = (title: string, action: string) => { setDismissed(current => [...current, title]); setMessage(`${title} · ${action}`); window.setTimeout(() => setMessage(""), 2800); };
  if (!visible.length) return <><EmptyState title={type === "approval" ? "You’re all caught up" : "No more invitations"} copy="There’s nothing else waiting in this demo workspace." />{message && <p role="status" className="border-t border-white/[.06] px-4 py-3 text-[10px] text-violet-200">{message}</p>}</>;
  return <>{visible.map(item => <article key={item.title} className="border-b border-white/[.055] p-4 last:border-0 sm:px-5"><div className="flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-violet-300/[.08] text-[9px] font-semibold text-violet-200">{item.initials ?? item.person?.split(" ").map(x => x[0]).join("")}</span><div className="min-w-0 flex-1"><p className="text-[10px] font-medium">{item.title}</p><p className="mt-1 text-[9px] text-slate-500">{item.project} · {item.person ?? item.client}</p><p className="mt-1 text-[9px] text-slate-600">{item.date ?? item.received} · {item.amount ?? item.budget}</p></div></div><div className="mt-3 flex justify-end gap-2">{type === "approval" ? <><button onClick={() => act(item.title, "rejected in demo")} className="rounded-lg border border-white/[.09] px-3 py-1.5 text-[9px] text-slate-400 transition hover:border-rose-300/20 hover:text-rose-200">Reject</button><button onClick={() => act(item.title, "marked reviewed in demo")} className="rounded-lg bg-violet-400/[.14] px-3 py-1.5 text-[9px] font-medium text-violet-100 transition hover:bg-violet-400/25">Review <ArrowRight aria-hidden="true" className="ml-1 inline" size={11} /></button></> : <><button onClick={() => act(item.title, "opened preview details")} className="rounded-lg border border-white/[.09] px-3 py-1.5 text-[9px] text-slate-300 transition hover:bg-white/[.05]">View</button><button onClick={() => act(item.title, "accepted in demo")} className="rounded-lg bg-violet-400/[.14] px-3 py-1.5 text-[9px] font-medium text-violet-100 transition hover:bg-violet-400/25">Accept <Check aria-hidden="true" size={11} className="ml-1 inline" /></button></>}</div></article>)}{message && <p role="status" className="border-t border-white/[.06] px-4 py-3 text-[10px] text-violet-200">{message}</p>}</>;
}

export function PlaceholderNotice() {
  return <div className="rounded-xl border border-violet-300/10 bg-violet-300/[.035] p-4 text-[10px] leading-5 text-slate-400"><Clock3 aria-hidden="true" className="mr-2 inline text-violet-300" size={14} /> This section is a clearly marked frontend placeholder. No live wallet, AI, or blockchain operations are available in this demo.</div>;
}
