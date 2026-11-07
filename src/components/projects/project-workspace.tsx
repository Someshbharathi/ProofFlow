import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { DashboardLayout, type DashboardNavItem } from "@/components/dashboard/dashboard-layout";

const clientNav: DashboardNavItem[] = [
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

const freelancerNav: DashboardNavItem[] = [
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

export function ProjectWorkspace({ role, title, description, children, backHref, dataLabel }: {
  role: "client" | "freelancer";
  title: string;
  description: string;
  children: React.ReactNode;
  backHref: string;
  dataLabel: string;
}) {
  return <DashboardLayout role={role} title={title} description={description} nav={role === "client" ? clientNav : freelancerNav} name="Account" initials="A" dataLabel={dataLabel} pageContent={
    <div className="mx-auto max-w-5xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 transition hover:text-white"><ArrowLeft size={13} /> Back</Link>
        {role === "client" && title !== "Create project" && <Link href="/client/dashboard/create-project" className="metro-button-primary inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-[9px] font-medium text-[#140c20]"><Plus size={12} /> Create project</Link>}
      </div>
      {children}
    </div>
  } />;
}
