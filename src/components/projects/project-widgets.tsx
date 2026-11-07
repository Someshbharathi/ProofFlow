import Link from "next/link";
import { ArrowUpRight, CalendarDays, Milestone } from "lucide-react";
import { EmptyState, StatusBadge } from "@/components/dashboard/dashboard-ui";
import type { ProjectRecord } from "@/lib/projects";

export function formatSol(value: number | string) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(Number(value))} SOL`;
}

export function formatProjectDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function ProjectCards({ projects, detailBase, emptyTitle, emptyCopy }: {
  projects: ProjectRecord[];
  detailBase: string;
  emptyTitle: string;
  emptyCopy: string;
}) {
  if (projects.length === 0) return <EmptyState title={emptyTitle} copy={emptyCopy} />;

  return <div className="divide-y divide-white/[.055]">
    {projects.map(project => {
      const milestones = project.project_milestones ?? [];
      const completedCount = milestones.filter(item => item.status === "completed").length;
      const progress = milestones.length ? Math.round(completedCount / milestones.length * 100) : null;
      return <article key={project.id} className="p-4 transition hover:bg-white/[.025] sm:px-5">
        <div className="flex flex-wrap items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-violet-300/10 bg-gradient-to-br from-violet-400/[.14] to-blue-400/[.07] text-violet-100"><Milestone aria-hidden="true" size={15} /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[11px] font-medium">{project.title}</h3>
              <StatusBadge status={project.status.replaceAll("_", " ")} />
            </div>
            <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-slate-500">{project.description}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] font-medium">{formatSol(project.budget_amount)}</p>
            <p className="mt-1 text-[8px] text-slate-600">project budget · not escrow</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[9px] text-slate-500">
          <span className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden="true" size={11} /> Deadline {formatProjectDate(project.deadline)}</span>
          <span>{milestones.length} milestone{milestones.length === 1 ? "" : "s"}{progress === null ? " · no milestone progress yet" : ` · ${completedCount} complete`}</span>
          <Link href={`${detailBase}/${project.id}`} className="inline-flex items-center gap-1 text-violet-200 transition hover:text-white">Details <ArrowUpRight aria-hidden="true" size={11} /></Link>
        </div>
        {progress !== null && <div className="mt-3 flex items-center gap-2.5"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-violet-400 to-blue-400 transition-all" style={{ width: `${progress}%` }} /></div><span className="w-8 text-right text-[9px] text-slate-500">{progress}%</span></div>}
        {project.required_skills.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{project.required_skills.map(skill => <span key={skill} className="rounded-md border border-white/[.07] bg-white/[.025] px-2 py-1 text-[8px] text-slate-400">{skill}</span>)}</div>}
      </article>;
    })}
  </div>;
}
