import Link from "next/link";
import { ArrowRight, ChevronRight, Clock3 } from "lucide-react";
import { ActionQueue, ActivityPanel, ProjectList, StatusBadge } from "@/components/dashboard/dashboard-ui";
import { DashboardLayout, type DashboardNavItem } from "@/components/dashboard/dashboard-layout";
import { EarningsChart } from "@/components/dashboard/charts";
import { freelancerDemo } from "@/lib/dashboard-data";

const nav: DashboardNavItem[] = [
  { label: "Overview", href: "/freelancer/dashboard", icon: "LayoutDashboard" },
  { label: "Explore Projects", href: "/freelancer/dashboard/explore-projects", icon: "Compass" },
  { label: "My Projects", href: "/freelancer/dashboard/my-projects", icon: "FolderKanban" },
  { label: "Milestones", href: "/freelancer/dashboard/milestones", icon: "Milestone" },
  { label: "Submissions", href: "/freelancer/dashboard/submissions", icon: "FileCheck2" },
  { label: "Earnings", href: "/freelancer/dashboard/earnings", icon: "Wallet" },
  { label: "Transactions", href: "/freelancer/dashboard/transactions", icon: "ReceiptText" },
  { label: "AI Assistant", href: "/freelancer/dashboard/ai-assistant", icon: "Bot" },
  { label: "Settings", href: "/freelancer/dashboard/settings", icon: "Settings2" },
];

export default function FreelancerDashboard() {
  return <DashboardLayout role="freelancer" title="Welcome back, Somesh! 👋" description="Track your work, submit deliverables, and receive payments." nav={nav} name="Somesh" initials="S" stats={freelancerDemo.stats}
    middleLeft={<EarningsChart />}
    middleRight={<ActivityPanel title="Upcoming deadlines" description="Your next milestone due dates" action={<Link href="/freelancer/dashboard/milestones" className="text-[9px] text-violet-200 hover:text-white">Milestones <ArrowRight aria-hidden="true" className="ml-1 inline" size={12} /></Link>}><div className="divide-y divide-white/[.055]">{freelancerDemo.deadlines.map((item, index) => <article key={item.title} className="flex items-center gap-3 px-4 py-4 sm:px-5"><span className={`grid size-8 shrink-0 place-items-center rounded-xl ${index === 0 ? "bg-amber-300/10 text-amber-200" : "bg-violet-300/[.08] text-violet-200"}`}><Clock3 aria-hidden="true" size={14} /></span><div className="min-w-0 flex-1"><h3 className="truncate text-[10px] font-medium">{item.title}</h3><p className="mt-1 text-[9px] text-slate-500">{item.project}</p></div><div className="text-right"><StatusBadge status={item.urgency} /><p className="mt-1 text-[9px] text-slate-600">{item.due}</p></div></article>)}</div></ActivityPanel>}
    bottomLeft={<ActivityPanel title="My projects" description="Progress and milestone delivery" action={<Link href="/freelancer/dashboard/my-projects" className="text-[9px] text-violet-200 hover:text-white">All projects <ChevronRight aria-hidden="true" className="inline" size={12} /></Link>}><ProjectList projects={freelancerDemo.projects} counterpartyLabel="Client" /></ActivityPanel>}
    bottomRight={<ActivityPanel title="Project invitations" description="New opportunities for your workspace" action={<span className="rounded-md bg-violet-300/10 px-2 py-1 text-[9px] text-violet-200">1 new · demo</span>}><ActionQueue items={freelancerDemo.invitations.map(item => ({ ...item, project: item.client }))} type="invitation" /></ActivityPanel>}
  />;
}
