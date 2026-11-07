"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Users } from "lucide-react";
import { EmptyState, StatusBadge } from "@/components/dashboard/dashboard-ui";
import { ProjectCards, formatProjectDate, formatSol } from "@/components/projects/project-widgets";
import { CancelInvitationButton, ClientApplicationDecision, RespondInvitationButton, WithdrawApplicationButton } from "@/components/projects/workflow-actions";
import type { ClientApplication, ClientInvitation, ClientMembership, FreelancerApplication, FreelancerInvitation, FreelancerMembership } from "@/lib/workflows";

function Tabs({ items, value, onChange }: { items: string[]; value: string; onChange: (value: string) => void }) {
  return <div role="tablist" className="flex gap-1 border-b border-white/[.06] px-3 pt-2">{items.map(item => <button key={item} role="tab" aria-selected={value === item} onClick={() => onChange(item)} className={`rounded-t-lg border-b-2 px-2.5 py-2 text-[9px] transition ${value === item ? "border-violet-300 text-violet-100" : "border-transparent text-slate-500 hover:text-slate-200"}`}>{item}</button>)}</div>;
}

function ClientInvitationRows({ invitations }: { invitations: ClientInvitation[] }) {
  if (!invitations.length) return <EmptyState title="No invitations yet" copy="Invite an eligible Freelancer from an open project." />;
  return <div className="divide-y divide-white/[.055]">{invitations.slice(0, 4).map(item => <article key={item.invitation_id} className="flex items-center gap-3 px-4 py-3.5"><span className="grid size-8 place-items-center rounded-xl bg-violet-300/[.08] text-violet-200"><Users size={14} /></span><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium">{item.freelancer_name}</p><p className="mt-1 truncate text-[9px] text-slate-500">{item.project_title}</p></div><StatusBadge status={item.invitation_status} /></article>)}</div>;
}

function ClientAssignmentRows({ assignments }: { assignments: ClientMembership[] }) {
  const active = assignments.filter(item => item.membership_status === "active");
  if (!active.length) return <EmptyState title="No assigned Freelancers" copy="Accept an application or invitation to assign project work." />;
  return <div className="divide-y divide-white/[.055]">{active.slice(0, 4).map(item => <article key={item.membership_id} className="flex items-center gap-3 px-4 py-3.5"><span className="grid size-8 place-items-center rounded-xl bg-emerald-300/[.08] text-emerald-200"><Users size={14} /></span><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium">{item.freelancer_name}</p><p className="mt-1 truncate text-[9px] text-slate-500">{item.project_title}</p></div><StatusBadge status="Active" /></article>)}</div>;
}

export function ClientDashboardWorkflow({ projects, invitations, assignments, error }: {
  projects: import("@/lib/projects").ProjectRecord[];
  invitations: ClientInvitation[];
  assignments: ClientMembership[];
  error?: string | null;
}) {
  const [tab, setTab] = useState("Projects");
  if (error) return <p role="alert" className="p-4 text-[10px] leading-5 text-amber-100">{error}</p>;
  return <><Tabs items={["Projects", "Invitations", "Assigned"]} value={tab} onChange={setTab} />
    {tab === "Projects" ? <ProjectCards projects={projects.slice(0, 3)} detailBase="/client/dashboard/projects" emptyTitle="No projects yet" emptyCopy="Create a project to define work and milestones." /> : tab === "Invitations" ? <ClientInvitationRows invitations={invitations} /> : <ClientAssignmentRows assignments={assignments} />}
    <div className="border-t border-white/[.05] px-4 py-2 text-right"><Link href={tab === "Invitations" ? "/client/dashboard/invitations" : tab === "Assigned" ? "/client/dashboard/my-projects" : "/client/dashboard/my-projects"} className="inline-flex items-center gap-1 text-[9px] text-violet-200 hover:text-white">{tab === "Invitations" ? "Manage invitations" : tab === "Assigned" ? "View assigned projects" : "View all projects"} <ArrowRight size={11} /></Link></div>
  </>;
}

export function ClientPendingApplications({ applications, error }: { applications: ClientApplication[]; error?: string | null }) {
  const pending = applications.filter(item => item.application_status === "pending");
  if (error) return <p role="alert" className="p-4 text-[10px] leading-5 text-amber-100">{error}</p>;
  if (!pending.length) return <EmptyState title="No pending applications" copy="New Freelancer applications will appear here." />;
  return <div className="divide-y divide-white/[.055]">{pending.slice(0, 3).map(item => <article key={item.application_id} className="flex items-center gap-3 px-4 py-3.5"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-violet-300/[.08] text-[9px] font-semibold text-violet-200">{item.freelancer_name.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium">{item.freelancer_name}</p><p className="mt-1 truncate text-[9px] text-slate-500">{item.project_title}{item.proposed_budget != null ? ` · ${formatSol(item.proposed_budget)} proposed` : ""}</p></div><Link href="/client/dashboard/applications" className="shrink-0 text-[9px] text-violet-200 hover:text-white">Review</Link></article>)}</div>;
}

function FreelancerApplicationRows({ applications }: { applications: FreelancerApplication[] }) {
  if (!applications.length) return <EmptyState title="No applications yet" copy="Explore open projects and send a proposal to a Client." />;
  return <div className="divide-y divide-white/[.055]">{applications.slice(0, 4).map(item => <article key={item.application_id} className="flex flex-wrap items-center gap-3 px-4 py-3.5"><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium">{item.project_title}</p><p className="mt-1 truncate text-[9px] text-slate-500">{item.proposed_budget == null ? "No proposed budget" : `${formatSol(item.proposed_budget)} proposed`} · {formatProjectDate(item.applied_at.slice(0, 10))}</p></div><StatusBadge status={item.application_status} /></article>)}</div>;
}

function FreelancerInvitationRows({ invitations }: { invitations: FreelancerInvitation[] }) {
  if (!invitations.length) return <EmptyState title="No invitations yet" copy="Client invitations will appear here." />;
  return <div className="divide-y divide-white/[.055]">{invitations.slice(0, 3).map(item => <article key={item.invitation_id} className="flex flex-wrap items-center gap-3 px-4 py-3.5"><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium">{item.project_title}</p><p className="mt-1 truncate text-[9px] text-slate-500">{item.client_name} · {formatSol(item.project_budget)}</p></div>{item.invitation_status === "pending" ? <div className="flex items-center gap-1.5"><RespondInvitationButton invitationId={item.invitation_id} decision="decline" /><RespondInvitationButton invitationId={item.invitation_id} decision="accept" /></div> : <StatusBadge status={item.invitation_status} />}</article>)}</div>;
}

export function FreelancerDashboardWorkflow({ applications, invitations, error }: {
  applications: FreelancerApplication[]; invitations: FreelancerInvitation[]; error?: string | null;
}) {
  const [tab, setTab] = useState("Applications");
  if (error) return <p role="alert" className="p-4 text-[10px] leading-5 text-amber-100">{error}</p>;
  return <><Tabs items={["Applications", "Invitations"]} value={tab} onChange={setTab} />
    {tab === "Applications" ? <FreelancerApplicationRows applications={applications} /> : <FreelancerInvitationRows invitations={invitations} />}
    <div className="border-t border-white/[.05] px-4 py-2 text-right"><Link href={tab === "Invitations" ? "/freelancer/dashboard/invitations" : "/freelancer/dashboard/applications"} className="inline-flex items-center gap-1 text-[9px] text-violet-200 hover:text-white">Manage {tab.toLowerCase()} <ArrowRight size={11} /></Link></div>
  </>;
}

export function ClientApplicationsManager({ applications, error }: { applications: ClientApplication[]; error: string | null }) {
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const projects = useMemo(() => [...new Map(applications.map(item => [item.project_id, item.project_title])).entries()], [applications]);
  const filtered = applications.filter(item => (projectFilter === "all" || item.project_id === projectFilter) && (statusFilter === "all" || item.application_status === statusFilter));
  if (error) return <p role="alert" className="p-5 text-[10px] leading-5 text-amber-100">{error}</p>;
  return <div><div className="grid gap-2 border-b border-white/[.06] p-3 sm:grid-cols-2"><label className="text-[9px] text-slate-500">Project<select value={projectFilter} onChange={event => setProjectFilter(event.target.value)} className="auth-input mt-1 h-9 text-[10px]"><option value="all">All projects</option>{projects.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><label className="text-[9px] text-slate-500">Application status<select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="auth-input mt-1 h-9 text-[10px]"><option value="all">All statuses</option>{["pending", "accepted", "rejected", "withdrawn"].map(status => <option key={status}>{status}</option>)}</select></label></div>
    {!filtered.length ? <EmptyState title="No applications found" copy="Applications for your projects will appear here." /> : <div className="divide-y divide-white/[.055]">{filtered.map(item => <article key={item.application_id} className="space-y-3 p-4 sm:p-5"><div className="flex flex-wrap items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-300/[.08] text-[9px] font-semibold text-violet-200">{item.freelancer_name.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase()}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-[11px] font-medium">{item.freelancer_name}</h3><StatusBadge status={item.application_status} />{item.assigned && <StatusBadge status="Assigned" />}</div><p className="mt-1 truncate text-[9px] text-slate-500">{item.project_title} · Applied {formatProjectDate(item.applied_at.slice(0, 10))}</p><p className="mt-2 text-[9px] text-slate-400">{item.proposed_budget == null ? "No proposed budget" : `Proposed budget: ${formatSol(item.proposed_budget)}`}{item.estimated_completion_date ? ` · Estimated completion: ${formatProjectDate(item.estimated_completion_date)}` : ""}</p></div></div><p className="whitespace-pre-wrap rounded-lg border border-white/[.06] bg-black/15 p-3 text-[10px] leading-5 text-slate-300">{item.proposal}</p>{item.application_status === "pending" && item.project_status === "open" && !item.assigned ? <ClientApplicationDecision application={item} /> : null}</article>)}</div>}</div>;
}

export function ClientInvitationsManager({ invitations, error }: { invitations: ClientInvitation[]; error: string | null }) {
  if (error) return <p role="alert" className="p-5 text-[10px] leading-5 text-amber-100">{error}</p>;
  if (!invitations.length) return <EmptyState title="No invitations sent" copy="Invite a Freelancer from one of your open project details." />;
  return <div className="divide-y divide-white/[.055]">{invitations.map(item => <article key={item.invitation_id} className="flex flex-wrap items-center gap-3 p-4 sm:px-5"><div className="min-w-0 flex-1"><h3 className="text-[10px] font-medium">{item.freelancer_name}</h3><p className="mt-1 text-[9px] text-slate-500">{item.project_title} · {formatProjectDate(item.invited_at.slice(0, 10))}</p>{item.message && <p className="mt-2 text-[9px] text-slate-400">{item.message}</p>}</div><StatusBadge status={item.invitation_status} />{item.invitation_status === "pending" && <CancelInvitationButton invitationId={item.invitation_id} />}</article>)}</div>;
}

export function FreelancerApplicationsManager({ applications, error }: { applications: FreelancerApplication[]; error: string | null }) {
  if (error) return <p role="alert" className="p-5 text-[10px] leading-5 text-amber-100">{error}</p>;
  if (!applications.length) return <EmptyState title="No applications yet" copy="Explore open projects and send a proposal to a Client." />;
  return <div className="divide-y divide-white/[.055]">{applications.map(item => <article key={item.application_id} className="flex flex-wrap items-start gap-3 p-4 sm:px-5"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-[10px] font-medium">{item.project_title}</h3><StatusBadge status={item.application_status} /></div><p className="mt-1 text-[9px] text-slate-500">Applied {formatProjectDate(item.applied_at.slice(0, 10))} · {item.proposed_budget == null ? "No proposed budget" : `${formatSol(item.proposed_budget)} proposed`}</p><p className="mt-2 line-clamp-3 text-[9px] leading-4 text-slate-400">{item.proposal}</p></div>{item.application_status === "pending" && <WithdrawApplicationButton applicationId={item.application_id} />}</article>)}</div>;
}

export function FreelancerInvitationsManager({ invitations, error }: { invitations: FreelancerInvitation[]; error: string | null }) {
  if (error) return <p role="alert" className="p-5 text-[10px] leading-5 text-amber-100">{error}</p>;
  if (!invitations.length) return <EmptyState title="No invitations yet" copy="Client invitations will appear here." />;
  return <div className="divide-y divide-white/[.055]">{invitations.map(item => <article key={item.invitation_id} className="space-y-3 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-[11px] font-medium">{item.project_title}</h3><StatusBadge status={item.invitation_status} /></div><p className="mt-1 text-[9px] text-slate-500">Invited by {item.client_name} · {formatProjectDate(item.invited_at.slice(0, 10))}</p></div><p className="text-[10px] font-medium text-slate-200">{formatSol(item.project_budget)}<span className="ml-1 block text-right text-[8px] font-normal text-slate-600">budget · not escrow</span></p></div><p className="text-[9px] leading-4 text-slate-400">{item.project_description}</p><div className="flex flex-wrap gap-1.5">{item.project_skills.map(skill => <span key={skill} className="rounded-md border border-white/[.07] bg-white/[.025] px-2 py-1 text-[8px] text-slate-400">{skill}</span>)}</div>{item.invitation_message && <p className="rounded-lg border border-violet-300/10 bg-violet-300/[.035] p-3 text-[9px] text-violet-100">{item.invitation_message}</p>}{item.invitation_status === "pending" ? <div className="flex justify-end gap-2"><RespondInvitationButton invitationId={item.invitation_id} decision="decline" /><RespondInvitationButton invitationId={item.invitation_id} decision="accept" /></div> : null}</article>)}</div>;
}

export function FreelancerMembershipsList({ memberships, error }: { memberships: FreelancerMembership[]; error: string | null }) {
  if (error) return <p role="alert" className="p-5 text-[10px] leading-5 text-amber-100">{error}</p>;
  if (!memberships.length) return <EmptyState title="No assigned projects yet" copy="Applications and invitations are not assignments. A Client must accept first." />;
  return <ProjectCards projects={memberships.map(item => item.project)} detailBase="/freelancer/dashboard/projects" emptyTitle="No assignments" emptyCopy="Assigned projects will appear here." />;
}
