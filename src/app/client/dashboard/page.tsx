import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { ActionQueue, ActivityPanel, ProjectList, TransactionList } from "@/components/dashboard/dashboard-ui";
import { DashboardLayout, type DashboardNavItem } from "@/components/dashboard/dashboard-layout";
import { ProjectProgressOverview } from "@/components/dashboard/charts";
import { clientDemo } from "@/lib/dashboard-data";

const nav: DashboardNavItem[] = [
  { label: "Overview", href: "/client/dashboard", icon: "LayoutDashboard" },
  { label: "My Projects", href: "/client/dashboard/my-projects", icon: "FolderKanban" },
  { label: "Create Project", href: "/client/dashboard/create-project", icon: "Plus" },
  { label: "Milestones", href: "/client/dashboard/milestones", icon: "Milestone" },
  { label: "Escrow Wallet", href: "/client/dashboard/escrow-wallet", icon: "Wallet" },
  { label: "Transactions", href: "/client/dashboard/transactions", icon: "ReceiptText" },
  { label: "AI Assistant", href: "/client/dashboard/ai-assistant", icon: "Bot" },
  { label: "Settings", href: "/client/dashboard/settings", icon: "Settings2" },
];

export default function ClientDashboard() {
  return <DashboardLayout role="client" title="Welcome back, Somesh! 👋" description="Manage your projects, escrow, and milestone payments." nav={nav} name="Somesh" initials="S" stats={clientDemo.stats}
    middleLeft={<ProjectProgressOverview />}
    middleRight={<ActivityPanel title="Pending approvals" description="Submitted work awaiting your review" action={<span className="rounded-md bg-amber-300/10 px-2 py-1 text-[9px] text-amber-200">1 awaiting</span>}><ActionQueue items={clientDemo.approvals} type="approval" /></ActivityPanel>}
    bottomLeft={<ActivityPanel title="Recent transactions" description="Illustrative activity · Demo SOL" action={<Link href="/client/dashboard/transactions" className="text-[9px] text-violet-200 hover:text-white">View all <ChevronRight aria-hidden="true" className="inline" size={12} /></Link>}><TransactionList transactions={clientDemo.transactions} /></ActivityPanel>}
    bottomRight={<ActivityPanel title="Your projects" description="Milestone progress across active work" action={<Link href="/client/dashboard/my-projects" className="inline-flex items-center gap-1 text-[9px] text-violet-200 hover:text-white">View projects <ArrowRight aria-hidden="true" size={12} /></Link>}><ProjectList projects={clientDemo.projects} counterpartyLabel="Freelancer" /></ActivityPanel>}
  />;
}
