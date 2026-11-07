"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/dashboard-ui";
import type { ClientApplication, EligibleFreelancer, FreelancerApplication } from "@/lib/workflows";
import { createClient } from "@/lib/supabase/client";

function WorkflowError({ children }: { children: string }) {
  return <p role="alert" className="rounded-lg border border-rose-300/15 bg-rose-300/[.06] px-3 py-2 text-[9px] leading-4 text-rose-100">{children}</p>;
}

function localToday() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export function ApplyProjectForm({ projectId, projectDeadline, existing }: {
  projectId: string; projectDeadline: string; existing?: FreelancerApplication;
}) {
  const router = useRouter();
  const [proposal, setProposal] = useState("");
  const [budget, setBudget] = useState("");
  const [completion, setCompletion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [current, setCurrent] = useState(existing);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const amount = budget.trim() ? Number(budget) : null;
    if (!proposal.trim() || proposal.trim().length > 5000) { setError("Write a proposal of up to 5000 characters."); setBusy(false); return; }
    if (amount !== null && (!Number.isFinite(amount) || amount <= 0 || !/^\d+(\.\d{1,9})?$/.test(budget.trim()))) { setError("Enter a positive proposed budget with up to 9 decimal places."); setBusy(false); return; }
    if (completion && (completion < localToday() || completion > projectDeadline)) { setError("Estimated completion must be today or on or before the project deadline."); setBusy(false); return; }
    try {
      const { data, error: rpcError } = await createClient().rpc("submit_project_application", {
        p_project_id: projectId, p_proposal: proposal.trim(), p_proposed_budget: amount,
        p_estimated_completion_date: completion || null,
      });
      if (rpcError) throw rpcError;
      if (typeof data !== "string") throw new Error("The database did not return an application ID.");
      setSuccess(true); router.refresh();
    } catch (cause) {
      const failure = cause as { code?: string; message?: string };
      setError(`${failure.code ? `Database error ${failure.code}: ` : ""}${failure.message ?? "Application could not be submitted."}`);
    } finally { setBusy(false); }
  }

  async function withdraw() {
    if (!current || current.application_status !== "pending") return;
    setError(""); setBusy(true);
    try {
      const { error: rpcError } = await createClient().rpc("withdraw_project_application", { p_application_id: current.application_id });
      if (rpcError) throw rpcError;
      setCurrent({ ...current, application_status: "withdrawn" }); router.refresh();
    } catch (cause) {
      const failure = cause as { code?: string; message?: string };
      setError(`${failure.code ? `Database error ${failure.code}: ` : ""}${failure.message ?? "Application could not be withdrawn."}`);
    } finally { setBusy(false); }
  }

  if (current || success) return <div className="space-y-3 rounded-xl border border-violet-300/10 bg-violet-300/[.035] p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] font-medium text-slate-200">{success ? "Application submitted" : "Your application"}</p><StatusBadge status={current?.application_status ?? "pending"} /></div>
    {success && <p role="status" className="text-[9px] text-emerald-200">Your application was submitted. The Client will review it.</p>}
    {current?.application_status === "pending" && <button type="button" onClick={() => void withdraw()} disabled={busy} className="rounded-lg border border-white/[.09] px-3 py-2 text-[9px] text-slate-300 transition hover:border-rose-300/20 hover:text-rose-200 disabled:opacity-50">{busy ? "Withdrawing…" : "Withdraw application"}</button>}
    {error && <WorkflowError>{error}</WorkflowError>}
  </div>;

  return <form onSubmit={event => void submit(event)} className="space-y-3 rounded-xl border border-white/[.07] bg-black/10 p-4">
    <div><h3 className="text-[11px] font-semibold text-white">Apply to this project</h3><p className="mt-1 text-[9px] text-slate-500">Send a proposal to the Client. No payment or assignment happens when you apply.</p></div>
    <label className="block text-[9px] text-slate-400">Proposal <span className="text-violet-200">*</span><textarea required maxLength={5000} rows={5} value={proposal} onChange={event => setProposal(event.target.value)} className="auth-input mt-1.5 h-auto min-h-24 resize-y py-3 text-[10px]" placeholder="Explain how you would approach the work and what you will deliver." /></label>
    <div className="grid gap-3 sm:grid-cols-2"><label className="block text-[9px] text-slate-400">Proposed budget (SOL) · optional<input inputMode="decimal" value={budget} onChange={event => setBudget(event.target.value)} className="auth-input mt-1.5 h-9 text-[10px]" placeholder="Leave blank to use project budget" /></label><label className="block text-[9px] text-slate-400">Estimated completion · optional<input type="date" min={localToday()} max={projectDeadline} value={completion} onChange={event => setCompletion(event.target.value)} className="auth-input mt-1.5 h-9 text-[10px]" /></label></div>
    {error && <WorkflowError>{error}</WorkflowError>}
    <button type="submit" disabled={busy} className="metro-button-primary inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[9px] font-medium text-[#140c20] disabled:opacity-50">{busy ? <LoaderCircle size={13} className="animate-spin" /> : <Send size={13} />}Submit application</button>
  </form>;
}

export function ClientApplicationDecision({ application }: { application: ClientApplication }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(application.application_status !== "pending");
  async function decide(decision: "accept" | "reject") {
    setBusy(true); setError("");
    try {
      const { error: rpcError } = await createClient().rpc("decide_project_application", { p_application_id: application.application_id, p_decision: decision });
      if (rpcError) throw rpcError;
      setDone(true); router.refresh();
    } catch (cause) {
      const failure = cause as { code?: string; message?: string };
      setError(`${failure.code ? `Database error ${failure.code}: ` : ""}${failure.message ?? "Application could not be updated."}`);
    } finally { setBusy(false); }
  }
  return <div className="flex flex-wrap justify-end gap-2">
    {error && <div className="w-full"><WorkflowError>{error}</WorkflowError></div>}
    {!done && <><button type="button" disabled={busy} onClick={() => void decide("reject")} className="rounded-lg border border-white/[.09] px-3 py-2 text-[9px] text-slate-300 transition hover:border-rose-300/20 hover:text-rose-200 disabled:opacity-50">Reject</button><button type="button" disabled={busy} onClick={() => void decide("accept")} className="rounded-lg bg-violet-400/[.16] px-3 py-2 text-[9px] font-medium text-violet-100 transition hover:bg-violet-400/25 disabled:opacity-50">{busy ? "Saving…" : "Accept & assign"}</button></>}
    {done && <span className="inline-flex items-center gap-1 text-[9px] text-emerald-200"><CheckCircle2 size={12} /> Decision recorded</span>}
  </div>;
}

export function InviteFreelancerForm({ projectId, freelancers }: { projectId: string; freelancers: EligibleFreelancer[] }) {
  const router = useRouter();
  const [freelancerId, setFreelancerId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const eligible = freelancers.filter(item => !item.assigned_to_project && !item.has_pending_invitation);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const { error: rpcError } = await createClient().rpc("send_project_invitation", { p_project_id: projectId, p_freelancer_id: freelancerId, p_message: message.trim() || null });
      if (rpcError) throw rpcError;
      setSent(true); router.refresh();
    } catch (cause) {
      const failure = cause as { code?: string; message?: string };
      setError(`${failure.code ? `Database error ${failure.code}: ` : ""}${failure.message ?? "Invitation could not be sent."}`);
    } finally { setBusy(false); }
  }
  if (sent) return <p role="status" className="inline-flex items-center gap-1.5 text-[9px] text-emerald-200"><CheckCircle2 size={13} /> Invitation sent. The Freelancer can respond from Invitations.</p>;
  return <form onSubmit={event => void submit(event)} className="space-y-3 rounded-xl border border-white/[.07] bg-black/10 p-4">
    <div><h3 className="text-[11px] font-semibold text-white">Invite a Freelancer</h3><p className="mt-1 text-[9px] text-slate-500">Profile name and avatar only. Email and private profile fields are not exposed.</p></div>
    {eligible.length ? <><label className="block text-[9px] text-slate-400">Freelancer<select required value={freelancerId} onChange={event => setFreelancerId(event.target.value)} className="auth-input mt-1.5 h-9 text-[10px]"><option value="">Choose a Freelancer</option>{eligible.map(item => <option key={item.freelancer_id} value={item.freelancer_id}>{item.full_name}{item.has_pending_application ? " · applied" : ""}</option>)}</select></label><label className="block text-[9px] text-slate-400">Message · optional<textarea maxLength={2000} rows={3} value={message} onChange={event => setMessage(event.target.value)} className="auth-input mt-1.5 h-auto resize-y py-2.5 text-[10px]" placeholder="Add a short note about the project." /></label><button disabled={busy || !freelancerId} className="metro-button-primary inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[9px] font-medium text-[#140c20] disabled:opacity-50">{busy && <LoaderCircle size={12} className="animate-spin" />}Send invitation</button></> : <p className="text-[9px] text-slate-500">No eligible Freelancer profiles are available for invitation. You can still review incoming applications.</p>}
    {error && <WorkflowError>{error}</WorkflowError>}
  </form>;
}

export function RespondInvitationButton({ invitationId, decision }: { invitationId: string; decision: "accept" | "decline" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  async function respond() {
    setBusy(true); setError("");
    try {
      const { error: rpcError } = await createClient().rpc("respond_project_invitation", { p_invitation_id: invitationId, p_decision: decision });
      if (rpcError) throw rpcError;
      setDone(true); router.refresh();
    } catch (cause) {
      const failure = cause as { code?: string; message?: string };
      setError(`${failure.code ? `Database error ${failure.code}: ` : ""}${failure.message ?? "Invitation could not be updated."}`);
    } finally { setBusy(false); }
  }
  return <div className="flex flex-wrap items-center justify-end gap-2">{error && <div className="w-full"><WorkflowError>{error}</WorkflowError></div>}{done ? <span className="text-[9px] text-emerald-200">Response recorded</span> : <button type="button" disabled={busy} onClick={() => void respond()} className={decision === "accept" ? "rounded-lg bg-violet-400/[.16] px-3 py-2 text-[9px] font-medium text-violet-100 transition hover:bg-violet-400/25 disabled:opacity-50" : "rounded-lg border border-white/[.09] px-3 py-2 text-[9px] text-slate-300 transition hover:border-rose-300/20 hover:text-rose-200 disabled:opacity-50"}>{busy ? "Saving…" : decision === "accept" ? "Accept & join" : "Decline"}</button>}</div>;
}

export function CancelInvitationButton({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cancelled, setCancelled] = useState(false);
  async function cancel() {
    setBusy(true); setError("");
    try {
      const { error: rpcError } = await createClient().rpc("cancel_project_invitation", { p_invitation_id: invitationId });
      if (rpcError) throw rpcError;
      setCancelled(true); router.refresh();
    } catch (cause) {
      const failure = cause as { code?: string; message?: string };
      setError(`${failure.code ? `Database error ${failure.code}: ` : ""}${failure.message ?? "Invitation could not be cancelled."}`);
    } finally { setBusy(false); }
  }
  return <div className="text-right">{cancelled ? <span className="text-[9px] text-slate-500">Cancelled</span> : <button type="button" disabled={busy} onClick={() => void cancel()} className="rounded-lg border border-white/[.09] px-3 py-2 text-[9px] text-slate-300 transition hover:border-rose-300/20 hover:text-rose-200 disabled:opacity-50">{busy ? "Cancelling…" : "Cancel"}</button>}{error && <p role="alert" className="mt-2 max-w-xs text-[9px] text-rose-100">{error}</p>}</div>;
}

export function WithdrawApplicationButton({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [withdrawn, setWithdrawn] = useState(false);
  async function withdraw() {
    setBusy(true); setError("");
    try {
      const { error: rpcError } = await createClient().rpc("withdraw_project_application", { p_application_id: applicationId });
      if (rpcError) throw rpcError;
      setWithdrawn(true); router.refresh();
    } catch (cause) {
      const failure = cause as { code?: string; message?: string };
      setError(`${failure.code ? `Database error ${failure.code}: ` : ""}${failure.message ?? "Application could not be withdrawn."}`);
    } finally { setBusy(false); }
  }
  return <div className="text-right">{withdrawn ? <span className="text-[9px] text-slate-500">Withdrawn</span> : <button type="button" disabled={busy} onClick={() => void withdraw()} className="rounded-lg border border-white/[.09] px-3 py-2 text-[9px] text-slate-300 transition hover:border-rose-300/20 hover:text-rose-200 disabled:opacity-50">{busy ? "Withdrawing…" : "Withdraw"}</button>}{error && <p role="alert" className="mt-2 max-w-xs text-[9px] text-rose-100">{error}</p>}</div>;
}
