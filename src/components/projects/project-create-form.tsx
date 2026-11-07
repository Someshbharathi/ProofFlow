"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type MilestoneDraft = { key: string; title: string; description: string; amount: string; dueDate: string };

function todayLocal() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function parseAmount(value: string) {
  if (!/^\d+(\.\d{1,9})?$/.test(value.trim())) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function describeSaveError(cause: unknown) {
  if (cause && typeof cause === "object" && "message" in cause) {
    const error = cause as { code?: unknown; message: unknown };
    const code = typeof error.code === "string" ? error.code : "";
    const message = typeof error.message === "string" ? error.message : "Project creation failed.";
    return `${code ? `Database error ${code}: ` : ""}${message}`;
  }
  return "Project creation failed with an unknown error. Check the browser console and try again.";
}

const inputClass = "auth-input mt-2";

export function ProjectCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [skills, setSkills] = useState("");
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([{ key: "milestone-initial", title: "", description: "", amount: "", dueDate: "" }]);
  const [today, setToday] = useState("");
  const [saving, setSaving] = useState<"draft" | "open" | null>(null);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState("");

  useEffect(() => setToday(todayLocal()), []);

  const allocation = useMemo(() => milestones.reduce((sum, milestone) => sum + (Number(milestone.amount) || 0), 0), [milestones]);
  const remaining = (Number(budget) || 0) - allocation;

  function updateMilestone(key: string, field: keyof Omit<MilestoneDraft, "key">, value: string) {
    setMilestones(current => current.map(milestone => milestone.key === key ? { ...milestone, [field]: value } : milestone));
  }

  async function saveProject(status: "draft" | "open") {
    setError(""); setCreatedId("");
    if (!title.trim() || title.trim().length > 120) { setError("Enter a project title with 120 characters or fewer."); return; }
    if (!description.trim() || description.trim().length > 5000) { setError("Enter a project description with 5000 characters or fewer."); return; }
    const parsedBudget = parseAmount(budget);
    if (parsedBudget === null) { setError("Enter a positive SOL budget with no more than 9 decimal places."); return; }
    const minDate = today || todayLocal();
    if (!deadline || deadline < minDate) { setError("Choose a project deadline that is today or later."); return; }
    const requiredSkills = skills.split(",").map(skill => skill.trim().toLowerCase()).filter(Boolean);
    if (requiredSkills.length > 20 || requiredSkills.some(skill => skill.length > 40)) { setError("Use at most 20 skills, each 40 characters or fewer."); return; }

    const milestonePayload: { title: string; description: string; amount: number; due_date: string }[] = [];
    for (const [index, milestone] of milestones.entries()) {
      const isBlank = !milestone.title.trim() && !milestone.description.trim() && !milestone.amount.trim() && !milestone.dueDate;
      if (isBlank) continue;
      const amount = parseAmount(milestone.amount);
      if (!milestone.title.trim() || milestone.title.trim().length > 120 || amount === null || !milestone.dueDate) {
        setError(`Complete the title, positive amount, and due date for milestone ${index + 1}, or remove it.`); return;
      }
      if (milestone.description.length > 2000) { setError(`Milestone ${index + 1} description must be 2000 characters or fewer.`); return; }
      if (milestone.dueDate < minDate || milestone.dueDate > deadline) { setError(`Milestone ${index + 1} due date must be today or later and no later than the project deadline.`); return; }
      milestonePayload.push({ title: milestone.title.trim(), description: milestone.description.trim(), amount, due_date: milestone.dueDate });
    }
    if (milestonePayload.length === 0) { setError("Add at least one complete milestone before saving the project."); return; }
    if (allocation > parsedBudget + 1e-9) { setError("Total milestone allocation cannot exceed the project budget."); return; }

    setSaving(status);
    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error(authError?.message ?? "No authenticated Supabase user was found in the browser session. Sign in again and retry.");
      }
      const { data, error: saveError } = await supabase.rpc("create_project_with_milestones", {
        p_title: title.trim(),
        p_description: description.trim(),
        p_budget_amount: parsedBudget,
        p_deadline: deadline,
        p_required_skills: requiredSkills,
        p_status: status,
        p_milestones: milestonePayload,
      });
      if (saveError) {
        console.error("[ProofFlow] Project creation RPC failed", { code: saveError.code, message: saveError.message });
        setError(describeSaveError(saveError));
        return;
      }
      if (typeof data !== "string") throw new Error("The database did not return the created project ID.");
      setCreatedId(data);
      router.refresh();
    } catch (cause) {
      console.error("[ProofFlow] Project creation request failed", cause instanceof Error ? { name: cause.name, message: cause.message } : { name: "unknown" });
      setError(describeSaveError(cause));
    } finally {
      setSaving(null);
    }
  }

  return <div className="space-y-4">
    {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose-300/15 bg-rose-300/[.06] p-3 text-[11px] leading-5 text-rose-100"><AlertCircle size={14} className="mt-0.5 shrink-0" />{error}</p>}
    {createdId && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/[.05] p-3 text-[11px] leading-5 text-emerald-100"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /><span>Project saved successfully. Its budget is not escrowed or funded. <Link className="font-medium text-emerald-100 underline underline-offset-2" href={`/client/dashboard/projects/${createdId}`}>View project</Link></span></div>}

    <section className="rounded-xl border border-white/[.07] bg-black/10 p-4 sm:p-5">
      <h2 className="text-xs font-semibold text-white">Project details</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-[10px] font-medium text-slate-300 sm:col-span-2">Project title <span aria-hidden="true" className="text-violet-300">*</span><input required maxLength={120} value={title} onChange={event => setTitle(event.target.value)} className={inputClass} placeholder="e.g. Design and build a portfolio site" /></label>
        <label className="block text-[10px] font-medium text-slate-300 sm:col-span-2">Description <span aria-hidden="true" className="text-violet-300">*</span><textarea required maxLength={5000} rows={5} value={description} onChange={event => setDescription(event.target.value)} className="auth-input mt-2 h-auto min-h-28 resize-y py-3" placeholder="Describe the goals, deliverables, and expectations for this project." /></label>
        <label className="block text-[10px] font-medium text-slate-300">Budget (SOL) <span aria-hidden="true" className="text-violet-300">*</span><div className="relative mt-2"><input required inputMode="decimal" value={budget} onChange={event => setBudget(event.target.value)} className="auth-input mt-0 pr-16" placeholder="0.00" /><span className="absolute inset-y-0 right-3 flex items-center text-[10px] text-slate-500">SOL</span></div></label>
        <label className="block text-[10px] font-medium text-slate-300">Deadline <span aria-hidden="true" className="text-violet-300">*</span><input required type="date" min={today || undefined} value={deadline} onChange={event => setDeadline(event.target.value)} className={inputClass} /></label>
        <label className="block text-[10px] font-medium text-slate-300 sm:col-span-2">Required skills <span className="font-normal text-slate-500">(comma separated)</span><input value={skills} onChange={event => setSkills(event.target.value)} className={inputClass} placeholder="TypeScript, UI design, Solana" /></label>
      </div>
    </section>

    <section className="rounded-xl border border-white/[.07] bg-black/10 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xs font-semibold text-white">Milestones</h2><p className="mt-1 text-[9px] text-slate-500">Amounts reserve part of the project budget; they do not fund escrow.</p></div><button type="button" onClick={() => setMilestones(current => [...current, { key: crypto.randomUUID(), title: "", description: "", amount: "", dueDate: "" }])} disabled={milestones.length >= 50} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-violet-300/15 bg-violet-300/[.06] px-3 text-[9px] font-medium text-violet-100 transition hover:bg-violet-300/[.12] disabled:opacity-40"><Plus size={12} /> Add milestone</button></div>
      <div className="mt-4 space-y-3">
        {milestones.map((milestone, index) => <fieldset key={milestone.key} className="rounded-xl border border-white/[.065] bg-white/[.015] p-3 sm:p-4"><legend className="sr-only">Milestone {index + 1}</legend>
          <div className="flex items-center justify-between gap-2"><p className="text-[10px] font-medium text-slate-300">Milestone {index + 1}</p><button type="button" onClick={() => setMilestones(current => current.filter(item => item.key !== milestone.key))} aria-label={`Remove milestone ${index + 1}`} className="grid size-7 place-items-center rounded-lg text-slate-500 transition hover:bg-rose-300/[.06] hover:text-rose-200"><Trash2 size={13} /></button></div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-[9px] text-slate-400 sm:col-span-2">Title<input maxLength={120} value={milestone.title} onChange={event => updateMilestone(milestone.key, "title", event.target.value)} className="auth-input mt-1.5 h-9 text-[11px]" placeholder="e.g. Wireframes approved" /></label>
            <label className="block text-[9px] text-slate-400 sm:col-span-2">Description<input maxLength={2000} value={milestone.description} onChange={event => updateMilestone(milestone.key, "description", event.target.value)} className="auth-input mt-1.5 h-9 text-[11px]" placeholder="What will be delivered? (optional)" /></label>
            <label className="block text-[9px] text-slate-400">Amount (SOL)<input inputMode="decimal" value={milestone.amount} onChange={event => updateMilestone(milestone.key, "amount", event.target.value)} className="auth-input mt-1.5 h-9 text-[11px]" placeholder="0.00" /></label>
            <label className="block text-[9px] text-slate-400">Due date<input type="date" min={today || undefined} max={deadline || undefined} value={milestone.dueDate} onChange={event => updateMilestone(milestone.key, "dueDate", event.target.value)} className="auth-input mt-1.5 h-9 text-[11px]" /></label>
          </div>
        </fieldset>)}
      </div>
      <div className="mt-4 grid gap-2 rounded-lg border border-white/[.06] bg-black/20 p-3 text-[10px] sm:grid-cols-2"><p className="flex justify-between gap-2 text-slate-400"><span>Allocated</span><span className="font-medium text-white">{allocation.toFixed(4)} SOL</span></p><p className="flex justify-between gap-2 text-slate-400"><span>Remaining</span><span className={`font-medium ${remaining < -1e-9 ? "text-rose-200" : "text-white"}`}>{remaining.toFixed(4)} SOL</span></p></div>
    </section>

    <p className="rounded-lg border border-amber-300/10 bg-amber-300/[.035] px-3 py-2.5 text-[9px] leading-4 text-amber-100">Publishing makes this project discoverable to freelancers. It does not deposit, reserve, or transfer SOL, and it does not create an escrow.</p>
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Link href="/client/dashboard" className="button-secondary inline-flex h-10 items-center justify-center rounded-xl px-4 text-[10px] text-slate-300">Cancel</Link><button type="button" onClick={() => void saveProject("draft")} disabled={saving !== null} className="button-secondary inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-[10px] text-slate-200 disabled:opacity-50">{saving === "draft" && <LoaderCircle size={13} className="animate-spin" />}Save draft</button><button type="button" onClick={() => void saveProject("open")} disabled={saving !== null} className="metro-button-primary inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-[10px] font-semibold text-[#140c20] disabled:cursor-wait disabled:opacity-50">{saving === "open" && <LoaderCircle size={13} className="animate-spin" />}Publish project</button></div>
  </div>;
}
