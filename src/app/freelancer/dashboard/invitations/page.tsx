import { ActivityPanel } from "@/components/dashboard/dashboard-ui";
import { FreelancerInvitationsManager } from "@/components/projects/workflow-lists";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { loadMyInvitations } from "@/lib/workflows";

export const dynamic = "force-dynamic";

export default async function FreelancerInvitationsPage() {
  const { data, error } = await loadMyInvitations();
  return <ProjectWorkspace role="freelancer" title="Invitations" description="Review Client invitations and accept or decline while the project remains open." backHref="/freelancer/dashboard" dataLabel="LIVE WORKFLOW DATA">
    <ActivityPanel title="Incoming invitations"><FreelancerInvitationsManager invitations={data ?? []} error={error} /></ActivityPanel>
  </ProjectWorkspace>;
}
