export type Transaction = { title: string; project: string; date: string; amount: string; direction: "in" | "out"; status: "Released" | "In escrow" | "Pending" | "Completed" };
export type Project = { name: string; counterparty: string; amount: string; progress: number; milestones: string; due: string; status: string; initials: string };

/** All figures and events in this file are fabricated for interface previews. */
export const clientDemo = {
  stats: [
    { label: "Total Deposited", value: "24.50", unit: "SOL", delta: "Demo value · all time", icon: "WalletCards" },
    { label: "Locked in Escrow", value: "18.00", unit: "SOL", delta: "Across demo projects", icon: "LockKeyhole" },
    { label: "Released Payments", value: "6.50", unit: "SOL", delta: "Demo releases", icon: "Check", tone: "green" },
    { label: "Active Projects", value: "4", unit: "projects", delta: "Illustrative workspace", icon: "Layers" },
  ],
  projects: [
    { name: "CampusFix Web App", counterparty: "Alex Morgan", amount: "10.00 SOL", progress: 50, milestones: "2 of 4 milestones", due: "Due in 3 days", status: "In progress", initials: "CF" },
    { name: "SpendScope Integration", counterparty: "Studio North", amount: "8.00 SOL", progress: 66, milestones: "2 of 3 milestones", due: "Due in 6 days", status: "Review", initials: "SI" },
    { name: "Brand identity refresh", counterparty: "Maya Chen", amount: "6.50 SOL", progress: 100, milestones: "4 of 4 milestones", due: "Completed", status: "Completed", initials: "BI" },
  ] satisfies Project[],
  approvals: [
    { title: "Milestone 2 · UI implementation", project: "CampusFix Web App", person: "Alex Morgan", amount: "3.00 SOL", date: "Submitted 2 hours ago" },
  ],
  transactions: [
    { title: "Deposit to Escrow", project: "CampusFix Web App", date: "2 hours ago", amount: "+10.00 SOL", direction: "in", status: "In escrow" },
    { title: "Milestone Release", project: "SpendScope Integration", date: "1 day ago", amount: "-2.50 SOL", direction: "out", status: "Released" },
  ] satisfies Transaction[],
};

export const freelancerDemo = {
  stats: [
    { label: "Total Earnings", value: "12.75", unit: "SOL", delta: "Demo value · all time", icon: "Coins" },
    { label: "Pending Payments", value: "5.00", unit: "SOL", delta: "Across demo milestones", icon: "Clock" },
    { label: "Active Projects", value: "3", unit: "projects", delta: "Illustrative workspace", icon: "Layers" },
    { label: "Completed Milestones", value: "5", unit: "milestones", delta: "Demo completions", icon: "Check", tone: "green" },
  ],
  projects: [
    { name: "CampusFix Web App", counterparty: "Jordan Davis", amount: "8.00 SOL", progress: 75, milestones: "3 of 4 milestones", due: "Due in 2 days", status: "In progress", initials: "CF" },
    { name: "SpendScope Dashboard", counterparty: "Aster Protocol", amount: "6.50 SOL", progress: 50, milestones: "2 of 4 milestones", due: "Due in 4 days", status: "In progress", initials: "SD" },
  ] satisfies Project[],
  deadlines: [
    { title: "Milestone 3 · Integration", project: "CampusFix Web App", due: "In 2 days", urgency: "Due in 2 days" },
    { title: "Milestone 2 · Analytics", project: "SpendScope Dashboard", due: "In 4 days", urgency: "Due in 4 days" },
  ],
  invitations: [
    { title: "Next Constructions Site", client: "Next Constructions", budget: "8.00 SOL", received: "2 hours ago", initials: "NC" },
  ],
};

export const adminDemo = {
  stats: [
    { label: "Total Users", value: "426", unit: "users", delta: "Demo platform count", icon: "Users" },
    { label: "Total Projects", value: "128", unit: "projects", delta: "Demo platform count", icon: "Layers" },
    { label: "Total Deposited", value: "392.50", unit: "SOL", delta: "Illustrative total", icon: "WalletCards" },
    { label: "Total Released", value: "276.00", unit: "SOL", delta: "Illustrative total", icon: "Check", tone: "green" },
  ],
  transactions: [
    { title: "Escrow Deposit", project: "Project #PF-4821", date: "1 hour ago", amount: "+15.00 SOL", direction: "in", status: "In escrow" },
    { title: "Milestone Release", project: "Project #PF-4779", date: "3 hours ago", amount: "-3.00 SOL", direction: "out", status: "Released" },
  ] satisfies Transaction[],
  disputes: [
    { id: "PF-4710", title: "Milestone delay", project: "Project #PF-4710", parties: "Client and freelancer", age: "Opened 3 hours ago", priority: "High" },
  ],
};

export const platformActivity = [9, 10, 11, 16, 22, 21, 26, 25, 30, 30, 34, 40];
export const earningsHistory = [2.0, 2.1, 2.2, 3.0, 4.0, 3.8, 4.7, 4.6, 5.4, 6.1, 6.2, 7.5];
