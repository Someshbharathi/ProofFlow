import { ActivityPanel } from "@/components/dashboard/dashboard-ui";
import { ProjectDiscovery } from "@/components/projects/project-discovery";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { loadOpenProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function ExploreProjectsPage() {
  const { projects, error } = await loadOpenProjects();
  return <ProjectWorkspace role="freelancer" title="Explore projects" description="Browse projects published by Clients. Applying and accepting work are not available in this phase." backHref="/freelancer/dashboard" dataLabel="LIVE PROJECT DATA">
    <ActivityPanel title="Open projects" description="Projects visible under your Freelancer access" action={<span className="rounded-md border border-emerald-300/15 bg-emerald-300/[.06] px-2 py-1 text-[8px] text-emerald-200">LIVE PROJECT DATA</span>}>
      {error ? <p role="alert" className="p-5 text-[10px] leading-5 text-amber-100">{error}</p> : <ProjectDiscovery projects={projects ?? []} />}
    </ActivityPanel>
  </ProjectWorkspace>;
}
