import { ActivityPanel } from "@/components/dashboard/dashboard-ui";
import { FreelancerApplicationsManager } from "@/components/projects/workflow-lists";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { loadMyApplications } from "@/lib/workflows";

export const dynamic = "force-dynamic";

export default async function FreelancerApplicationsPage() {
  const { data, error } = await loadMyApplications();
  return <ProjectWorkspace role="freelancer" title="My applications" description="Track the status of proposals submitted by your account." backHref="/freelancer/dashboard" dataLabel="LIVE WORKFLOW DATA">
    <ActivityPanel title="Applications sent"><FreelancerApplicationsManager applications={data ?? []} error={error} /></ActivityPanel>
  </ProjectWorkspace>;
}
