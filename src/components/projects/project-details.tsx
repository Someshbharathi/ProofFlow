import { CalendarDays, Milestone } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/dashboard-ui";
import { formatProjectDate, formatSol } from "@/components/projects/project-widgets";
import type { ProjectRecord } from "@/lib/projects";

export function ProjectDetails({ project }: { project: ProjectRecord }) {
  return <div className="space-y-3">
    <section className="rounded-xl border border-white/[.075] bg-gradient-to-br from-[#12111d] to-[#0e0f17] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-semibold text-white">{project.title}</h2><StatusBadge status={project.status.replaceAll("_", " ")} /></div><p className="mt-3 whitespace-pre-wrap text-[10px] leading-5 text-slate-300">{project.description}</p></div><div className="rounded-lg border border-amber-300/10 bg-amber-300/[.035] px-3 py-2"><p className="text-[8px] uppercase tracking-wide text-amber-200">Project budget · not escrow</p><p className="mt-1 text-sm font-semibold text-white">{formatSol(project.budget_amount)}</p></div></div>
      <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400"><CalendarDays size={13} className="text-violet-200" /> Deadline {formatProjectDate(project.deadline)}</div>
      {project.required_skills.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{project.required_skills.map(skill => <span key={skill} className="rounded-md border border-white/[.07] bg-white/[.025] px-2 py-1 text-[8px] text-slate-400">{skill}</span>)}</div>}
    </section>
    <section className="overflow-hidden rounded-xl border border-white/[.075] bg-gradient-to-br from-[#12111d] to-[#0e0f17]"><header className="flex items-center gap-2 border-b border-white/[.06] px-4 py-3"><Milestone size={13} className="text-violet-200" /><h2 className="text-[11px] font-semibold">Milestones</h2><span className="ml-auto text-[9px] text-slate-500">{project.project_milestones.length} planned</span></header>
      {project.project_milestones.length ? <ol className="divide-y divide-white/[.055]">{project.project_milestones.map((milestone, index) => <li key={milestone.id} className="flex flex-wrap items-start gap-3 p-4"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-violet-300/[.08] text-[9px] text-violet-200">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-[10px] font-medium text-slate-100">{milestone.title}</h3><StatusBadge status={milestone.status.replaceAll("_", " ")} /></div>{milestone.description && <p className="mt-1 text-[9px] leading-4 text-slate-500">{milestone.description}</p>}<p className="mt-2 text-[8px] text-slate-600">Due {formatProjectDate(milestone.due_date)}</p></div><p className="text-[10px] font-medium text-slate-200">{formatSol(milestone.amount)}<span className="ml-1 block text-right text-[8px] font-normal text-slate-600">allocation · not funded</span></p></li>)}</ol> : <p className="p-5 text-center text-[10px] text-slate-500">No milestones have been added.</p>}
    </section>
    <p className="rounded-lg border border-amber-300/10 bg-amber-300/[.035] px-3 py-2.5 text-[9px] leading-4 text-amber-100">This project record is not an escrow. No SOL has been deposited, reserved or transferred.</p>
  </div>;
}
