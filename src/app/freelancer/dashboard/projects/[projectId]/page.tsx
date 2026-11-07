import { notFound } from "next/navigation";
import { ActivityPanel } from "@/components/dashboard/dashboard-ui";
import { ProjectDetails } from "@/components/projects/project-details";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { loadProjectById } from "@/lib/projects";
import { ApplyProjectForm } from "@/components/projects/workflow-actions";
import { loadMyApplications } from "@/lib/workflows";

export const dynamic = "force-dynamic";

export default async function FreelancerProjectDetailsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { project, error } = await loadProjectById(projectId);
  if (!project && !error) notFound();
  const applications = project?.status === "open" ? await loadMyApplications() : null;
  const currentApplication = applications?.data?.find(item => item.project_id === projectId);
  return <ProjectWorkspace role="freelancer" title="Project details" description="Open project information. Assigned Freelancers can access their active project details." backHref="/freelancer/dashboard/explore-projects" dataLabel="LIVE PROJECT DATA">
    <ActivityPanel title="Project record">{error ? <p role="alert" className="p-5 text-[10px] leading-5 text-amber-100">{error}</p> : project ? <div className="space-y-3 p-3 sm:p-4"><ProjectDetails project={project} />{project.status === "open" ? <>{applications?.error && <p role="alert" className="text-[9px] text-amber-100">{applications.error}</p>}<ApplyProjectForm projectId={project.id} projectDeadline={project.deadline} existing={currentApplication} /></> : <p className="rounded-lg border border-blue-300/10 bg-blue-300/[.035] px-3 py-2 text-[9px] text-blue-100">This project is in progress. Only assigned participants can access it.</p>}</div> : <p className="p-5 text-[10px] text-slate-500">This project is not visible to your account.</p>}</ActivityPanel>
  </ProjectWorkspace>;
}
