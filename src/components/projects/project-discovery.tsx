"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProjectCards } from "@/components/projects/project-widgets";
import type { ProjectRecord } from "@/lib/projects";

export function ProjectDiscovery({ projects }: { projects: ProjectRecord[] }) {
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("all");
  const skills = useMemo(() => [...new Set(projects.flatMap(project => project.required_skills))].sort(), [projects]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter(project => {
      const matchesQuery = !needle || [project.title, project.description, ...project.required_skills].some(value => value.toLowerCase().includes(needle));
      return matchesQuery && (skill === "all" || project.required_skills.includes(skill));
    });
  }, [projects, query, skill]);

  return <div>
    <div className="grid gap-2 border-b border-white/[.06] p-3 sm:grid-cols-[minmax(0,1fr)_200px] sm:p-4">
      <label className="relative block"><span className="sr-only">Search projects</span><Search aria-hidden="true" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={query} onChange={event => setQuery(event.target.value)} className="auth-input mt-0 h-9 pl-9 text-[10px]" placeholder="Search title, description, or skill" /></label>
      <label className="relative block"><span className="sr-only">Filter by skill</span><SlidersHorizontal aria-hidden="true" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><select value={skill} onChange={event => setSkill(event.target.value)} className="auth-input mt-0 h-9 appearance-none pl-9 text-[10px]"><option value="all">All skills</option>{skills.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
    </div>
    {filtered.length ? <ProjectCards projects={filtered} detailBase="/freelancer/dashboard/projects" emptyTitle="No matching projects" emptyCopy="Try another search or skill filter." /> : <div className="p-5 text-center text-[10px] text-slate-500">No open projects match those filters.</div>}
    <p className="border-t border-white/[.05] px-4 py-2 text-[8px] text-slate-600">Showing up to 200 open projects visible to your account. Client identity is private in this phase.</p>
  </div>;
}
