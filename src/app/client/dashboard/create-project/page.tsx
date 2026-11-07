import { DashboardSection } from "@/components/dashboard/dashboard-ui";
import { ProjectCreateForm } from "@/components/projects/project-create-form";
import { ProjectWorkspace } from "@/components/projects/project-workspace";

export default function CreateProjectPage() {
  return <ProjectWorkspace role="client" title="Create project" description="Define the work and milestone plan. Publishing does not fund escrow." backHref="/client/dashboard" dataLabel="PROJECT SETUP">
    <DashboardSection title="New project" description="Demo UI backed by your authenticated Supabase account."><div className="p-3 sm:p-4"><ProjectCreateForm /></div></DashboardSection>
  </ProjectWorkspace>;
}
