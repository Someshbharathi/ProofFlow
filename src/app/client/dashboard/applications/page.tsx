import { ActivityPanel } from "@/components/dashboard/dashboard-ui";
import { ClientApplicationsManager } from "@/components/projects/workflow-lists";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { loadClientApplications } from "@/lib/workflows";

export const dynamic = "force-dynamic";

export default async function ClientApplicationsPage() {
  const { data, error } = await loadClientApplications();
  return <ProjectWorkspace role="client" title="Applications" description="Review proposals submitted to projects owned by your account." backHref="/client/dashboard" dataLabel="LIVE WORKFLOW DATA">
    <ActivityPanel title="Freelancer applications" description="Proposal and limited public profile information"><ClientApplicationsManager applications={data ?? []} error={error} /></ActivityPanel>
  </ProjectWorkspace>;
}
