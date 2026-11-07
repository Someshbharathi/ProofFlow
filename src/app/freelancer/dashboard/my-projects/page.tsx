import { ActivityPanel } from "@/components/dashboard/dashboard-ui";
import { FreelancerMembershipsList } from "@/components/projects/workflow-lists";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { loadMyMemberships } from "@/lib/workflows";

export const dynamic = "force-dynamic";

export default async function FreelancerProjectsPage() {
  const { data, error } = await loadMyMemberships();
  return <ProjectWorkspace role="freelancer" title="My projects" description="Only projects with a valid membership assignment appear here." backHref="/freelancer/dashboard" dataLabel="LIVE ASSIGNMENTS">
    <ActivityPanel title="Assigned projects" description="Assignment enforced by project membership and RLS"><FreelancerMembershipsList memberships={data ?? []} error={error} /></ActivityPanel>
  </ProjectWorkspace>;
}
