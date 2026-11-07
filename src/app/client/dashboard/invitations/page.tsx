import { ActivityPanel } from "@/components/dashboard/dashboard-ui";
import { ClientInvitationsManager } from "@/components/projects/workflow-lists";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { loadClientInvitations } from "@/lib/workflows";

export const dynamic = "force-dynamic";

export default async function ClientInvitationsPage() {
  const { data, error } = await loadClientInvitations();
  return <ProjectWorkspace role="client" title="Invitations" description="Track invitations sent to eligible Freelancers and cancel pending invitations." backHref="/client/dashboard" dataLabel="LIVE WORKFLOW DATA">
    <ActivityPanel title="Outgoing invitations"><ClientInvitationsManager invitations={data ?? []} error={error} /></ActivityPanel>
  </ProjectWorkspace>;
}
