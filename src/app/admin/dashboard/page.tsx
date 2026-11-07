import Link from "next/link";
import { AlertTriangle, ChevronRight, ExternalLink } from "lucide-react";
import { ActivityPanel, StatusBadge, TransactionList } from "@/components/dashboard/dashboard-ui";
import { DashboardLayout, type DashboardNavItem } from "@/components/dashboard/dashboard-layout";
import { ActivityChart, EscrowVisualization } from "@/components/dashboard/charts";
import { adminDemo } from "@/lib/dashboard-data";

const nav: DashboardNavItem[] = [
  { label: "Overview", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { label: "Users", href: "/admin/dashboard/users", icon: "Users" },
  { label: "Projects", href: "/admin/dashboard/projects", icon: "FolderKanban" },
  { label: "Escrow Monitoring", href: "/admin/dashboard/escrow-monitoring", icon: "Shield" },
  { label: "Transactions", href: "/admin/dashboard/transactions", icon: "ReceiptText" },
  { label: "Disputes", href: "/admin/dashboard/disputes", icon: "Scale" },
  { label: "Analytics", href: "/admin/dashboard/analytics", icon: "ChartNoAxesCombined" },
  { label: "Settings", href: "/admin/dashboard/settings", icon: "Settings2" },
];

export default function AdminDashboard() {
  return <DashboardLayout role="admin" title="Platform Overview" description="Monitor platform activity, users, and escrow operations." nav={nav} name="Somesh" initials="S" stats={adminDemo.stats}
    middleLeft={<ActivityChart />}
    middleRight={<EscrowVisualization />}
    bottomLeft={<ActivityPanel title="Recent transactions" description="Illustrative platform events · Demo SOL" action={<Link href="/admin/dashboard/transactions" className="text-[9px] text-violet-200 hover:text-white">All transactions <ChevronRight aria-hidden="true" className="inline" size={12} /></Link>}><TransactionList transactions={adminDemo.transactions} /></ActivityPanel>}
    bottomRight={<ActivityPanel title="Open disputes" description="Requires administrator review" action={<span className="rounded-md bg-rose-300/[.08] px-2 py-1 text-[9px] text-rose-200">2 open · demo</span>}><div className="divide-y divide-white/[.055]">{adminDemo.disputes.map(dispute => <article key={dispute.id} className="p-4 sm:px-5"><div className="flex items-center justify-between gap-2"><span className="font-mono text-[9px] text-slate-500">{dispute.id}</span><StatusBadge status={dispute.priority} /></div><div className="mt-2 flex items-start gap-2"><AlertTriangle aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-amber-200" /><div className="min-w-0"><h3 className="text-[10px] font-medium">{dispute.title}</h3><p className="mt-1 truncate text-[9px] text-slate-500">{dispute.project}</p></div></div><div className="mt-3 flex items-center justify-between text-[9px] text-slate-600"><span>{dispute.age}</span><Link href="/admin/dashboard/disputes" className="text-violet-200 transition hover:text-white">Review <ExternalLink aria-hidden="true" className="ml-1 inline" size={10} /></Link></div></article>)}</div></ActivityPanel>}
  />;
}
