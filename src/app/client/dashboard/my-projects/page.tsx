import { ActivityPanel } from "@/components/dashboard/dashboard-ui";
import { ProjectCards } from "@/components/projects/project-widgets";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { loadClientProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function ClientProjectsPage() {
  const { projects, error } = await loadClientProjects();
  return <ProjectWorkspace role="client" title="My projects" description="Projects created by your authenticated account. Project budgets are not escrow balances." backHref="/client/dashboard" dataLabel="LIVE PROJECT DATA">
    <ActivityPanel title="Your projects" description="Live project records from Supabase" action={<span className="rounded-md border border-emerald-300/15 bg-emerald-300/[.06] px-2 py-1 text-[8px] text-emerald-200">LIVE PROJECT DATA</span>}>
      {error ? <p role="alert" className="p-5 text-[10px] leading-5 text-amber-100">{error}</p> : <ProjectCards projects={projects ?? []} detailBase="/client/dashboard/projects" emptyTitle="No projects yet" emptyCopy="Create a project to start defining work and milestones." />}
    </ActivityPanel>
  </ProjectWorkspace>;
}
