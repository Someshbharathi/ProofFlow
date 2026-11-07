import { notFound } from "next/navigation";
import { ActivityPanel } from "@/components/dashboard/dashboard-ui";
import { ProjectDetails } from "@/components/projects/project-details";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { loadProjectById } from "@/lib/projects";
import { InviteFreelancerForm } from "@/components/projects/workflow-actions";
import { loadEligibleFreelancers } from "@/lib/workflows";

export const dynamic = "force-dynamic";

export default async function ClientProjectDetailsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { project, error } = await loadProjectById(projectId);
  if (!project && !error) notFound();
  const freelancers = project?.status === "open" ? await loadEligibleFreelancers(projectId) : null;
  return <ProjectWorkspace role="client" title="Project details" description="Project information and planned milestone allocations." backHref="/client/dashboard/my-projects" dataLabel="LIVE PROJECT DATA">
    <ActivityPanel title="Project record">{error ? <p role="alert" className="p-5 text-[10px] leading-5 text-amber-100">{error}</p> : project && <div className="space-y-3 p-3 sm:p-4"><ProjectDetails project={project} />{project.status === "open" && <InviteFreelancerForm projectId={project.id} freelancers={freelancers?.data ?? []} />}{freelancers?.error && <p role="alert" className="text-[9px] text-amber-100">{freelancers.error}</p>}</div>}</ActivityPanel>
  </ProjectWorkspace>;
}
