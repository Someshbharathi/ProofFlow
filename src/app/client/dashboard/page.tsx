import Link from "next/link";
import { ArrowRight, Bell, ChevronRight } from "lucide-react";
import { ActivityPanel, TransactionList } from "@/components/dashboard/dashboard-ui";
import { DashboardLayout, type DashboardNavItem } from "@/components/dashboard/dashboard-layout";
import { ProjectProgressOverview } from "@/components/dashboard/charts";
import { ClientDashboardWorkflow, ClientPendingApplications } from "@/components/projects/workflow-lists";
import { clientDemo } from "@/lib/dashboard-data";
import { loadClientDashboardProjects } from "@/lib/projects";
import { loadClientApplications, loadClientInvitations, loadClientMemberships } from "@/lib/workflows";

const nav: DashboardNavItem[] = [
  { label: "Overview", href: "/client/dashboard", icon: "LayoutDashboard" },
  { label: "My Projects", href: "/client/dashboard/my-projects", icon: "FolderKanban" },
  { label: "Create Project", href: "/client/dashboard/create-project", icon: "Plus" },
  { label: "Applications", href: "/client/dashboard/applications", icon: "FileCheck2" },
  { label: "Invitations", href: "/client/dashboard/invitations", icon: "Bell" },
  { label: "Milestones", href: "/client/dashboard/milestones", icon: "Milestone" },
  { label: "Escrow Wallet", href: "/client/dashboard/escrow-wallet", icon: "Wallet" },
  { label: "Transactions", href: "/client/dashboard/transactions", icon: "ReceiptText" },
  { label: "AI Assistant", href: "/client/dashboard/ai-assistant", icon: "Bot" },
  { label: "Settings", href: "/client/dashboard/settings", icon: "Settings2" },
];

export const dynamic = "force-dynamic";

export default async function ClientDashboard() {
  const [projectData, applicationData, invitationData, membershipData] = await Promise.all([
    loadClientDashboardProjects(), loadClientApplications(), loadClientInvitations(), loadClientMemberships(),
  ]);
  const stats = clientDemo.stats.map(stat => stat.label === "Active Projects"
    ? { ...stat, value: projectData.activeCount === null ? "—" : String(projectData.activeCount), delta: "Live Supabase project count" }
    : stat);
  const workflowError = applicationData.error || invitationData.error || membershipData.error;
  return <DashboardLayout role="client" title="Welcome back, Somesh! 👋" description="Project counts and workflow panels are live; escrow and transaction figures are demo values." nav={nav} name="Somesh" initials="S" stats={stats} dataLabel="LIVE + DEMO DATA"
    middleLeft={<ProjectProgressOverview projects={projectData.projects} error={projectData.error} />}
    middleRight={<ActivityPanel title="Pending applications" description="Freelancer proposals awaiting your decision" action={<Link href="/client/dashboard/applications" className="text-[9px] text-violet-200 hover:text-white">Review all <ArrowRight aria-hidden="true" className="ml-1 inline" size={12} /></Link>}><ClientPendingApplications applications={applicationData.data ?? []} error={applicationData.error} /></ActivityPanel>}
    bottomLeft={<ActivityPanel title="Recent transactions" description="Illustrative activity · Demo SOL" action={<Link href="/client/dashboard/transactions" className="text-[9px] text-violet-200 hover:text-white">View all <ChevronRight aria-hidden="true" className="inline" size={12} /></Link>}><TransactionList transactions={clientDemo.transactions} /></ActivityPanel>}
    bottomRight={<ActivityPanel title="Projects & relationships" description="Live project, invitation and assignment records" action={<Link href="/client/dashboard/invitations" className="inline-flex items-center gap-1 text-[9px] text-violet-200 hover:text-white">Invitations <Bell aria-hidden="true" size={11} /></Link>}><ClientDashboardWorkflow projects={projectData.projects ?? []} invitations={invitationData.data ?? []} assignments={membershipData.data ?? []} error={workflowError} /></ActivityPanel>}
  />;
}
