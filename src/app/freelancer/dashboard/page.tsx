import Link from "next/link";
import { ArrowRight, Bell, Clock3, FileCheck2 } from "lucide-react";
import { ActivityPanel, StatusBadge } from "@/components/dashboard/dashboard-ui";
import { DashboardLayout, type DashboardNavItem } from "@/components/dashboard/dashboard-layout";
import { EarningsChart } from "@/components/dashboard/charts";
import { FreelancerDashboardWorkflow, FreelancerMembershipsList } from "@/components/projects/workflow-lists";
import { freelancerDemo } from "@/lib/dashboard-data";
import { loadMyApplications, loadMyInvitations, loadMyMemberships } from "@/lib/workflows";

const nav: DashboardNavItem[] = [
  { label: "Overview", href: "/freelancer/dashboard", icon: "LayoutDashboard" },
  { label: "Explore Projects", href: "/freelancer/dashboard/explore-projects", icon: "Compass" },
  { label: "My Projects", href: "/freelancer/dashboard/my-projects", icon: "FolderKanban" },
  { label: "Applications", href: "/freelancer/dashboard/applications", icon: "FileCheck2" },
  { label: "Invitations", href: "/freelancer/dashboard/invitations", icon: "Bell" },
  { label: "Milestones", href: "/freelancer/dashboard/milestones", icon: "Milestone" },
  { label: "Submissions", href: "/freelancer/dashboard/submissions", icon: "FileCheck2" },
  { label: "Earnings", href: "/freelancer/dashboard/earnings", icon: "Wallet" },
  { label: "Transactions", href: "/freelancer/dashboard/transactions", icon: "ReceiptText" },
  { label: "AI Assistant", href: "/freelancer/dashboard/ai-assistant", icon: "Bot" },
  { label: "Settings", href: "/freelancer/dashboard/settings", icon: "Settings2" },
];

export const dynamic = "force-dynamic";

export default async function FreelancerDashboard() {
  const [membershipData, applicationData, invitationData] = await Promise.all([
    loadMyMemberships(), loadMyApplications(), loadMyInvitations(),
  ]);
  const stats = freelancerDemo.stats.map(stat => stat.label === "Active Projects"
    ? { ...stat, value: membershipData.data ? String(membershipData.data.filter(item => item.status === "active").length) : "—", delta: "Live assigned memberships" }
    : stat);
  const workflowError = applicationData.error || invitationData.error;
  return <DashboardLayout role="freelancer" title="Welcome back, Somesh! 👋" description="Assignments and application workflows are live; earnings and deadline examples are demo data." nav={nav} name="Somesh" initials="S" stats={stats} dataLabel="LIVE WORKFLOW · DEMO EARNINGS"
    middleLeft={<EarningsChart />}
    middleRight={<ActivityPanel title="Upcoming deadlines" description="Illustrative milestone due dates" action={<Link href="/freelancer/dashboard/milestones" className="text-[9px] text-violet-200 hover:text-white">Milestones <ArrowRight aria-hidden="true" className="ml-1 inline" size={12} /></Link>}><div className="divide-y divide-white/[.055]">{freelancerDemo.deadlines.map((item, index) => <article key={item.title} className="flex items-center gap-3 px-4 py-4 sm:px-5"><span className={`grid size-8 shrink-0 place-items-center rounded-xl ${index === 0 ? "bg-amber-300/10 text-amber-200" : "bg-violet-300/[.08] text-violet-200"}`}><Clock3 aria-hidden="true" size={14} /></span><div className="min-w-0 flex-1"><h3 className="truncate text-[10px] font-medium">{item.title}</h3><p className="mt-1 text-[9px] text-slate-500">{item.project}</p></div><div className="text-right"><StatusBadge status={item.urgency} /><p className="mt-1 text-[9px] text-slate-600">{item.due}</p></div></article>)}</div></ActivityPanel>}
    bottomLeft={<ActivityPanel title="My projects" description="Only active or completed membership assignments" action={<Link href="/freelancer/dashboard/my-projects" className="text-[9px] text-violet-200 hover:text-white">All projects <ArrowRight aria-hidden="true" className="ml-1 inline" size={11} /></Link>}><FreelancerMembershipsList memberships={membershipData.data ?? []} error={membershipData.error} /></ActivityPanel>}
    bottomRight={<ActivityPanel title="Applications & invitations" description="Live account-specific workflow status" action={<div className="flex gap-2"><Link href="/freelancer/dashboard/applications" aria-label="Applications" className="text-violet-200 hover:text-white"><FileCheck2 size={12} /></Link><Link href="/freelancer/dashboard/invitations" aria-label="Invitations" className="text-violet-200 hover:text-white"><Bell size={12} /></Link></div>}><FreelancerDashboardWorkflow applications={applicationData.data ?? []} invitations={invitationData.data ?? []} error={workflowError} /></ActivityPanel>}
  />;
}
