"use client";

import { useState } from "react";
import { ChartPanel, DemoPill } from "@/components/dashboard/dashboard-ui";
import { earningsHistory, platformActivity } from "@/lib/dashboard-data";
import type { ProjectRecord } from "@/lib/projects";

function SparkChart({ values, labels, yLabels, color = "#b157f3", maxValue = 100 }: { values: number[]; labels: string[]; yLabels: string[]; color?: string; maxValue?: number }) {
  const width = 640;
  const height = 120;
  const top = 8;
  const bottom = height - 8;
  const points = values.map((value, index) => `${width * index / (values.length - 1)},${bottom - (bottom - top) * value / maxValue}`).join(" ");
  const area = `0,${bottom} ${points} ${width},${bottom}`;
  const ticks = [0, 1, 2, 3, 4];
  return <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-2">
    <div aria-hidden="true" className="flex h-28 flex-col justify-between pb-1 pt-0.5 text-[8px] text-slate-500">{yLabels.map(label => <span key={label}>{label}</span>)}</div>
    <div className="min-w-0">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-28 w-full overflow-visible" role="img" aria-label="Illustrative demo chart">
        <defs><linearGradient id={`area-${color.slice(1)}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".32" /><stop offset="100%" stopColor={color} stopOpacity=".015" /></linearGradient></defs>
        {ticks.map(tick => { const y = top + (bottom - top) * tick / 4; return <line key={tick} x1="0" x2={width} y1={y} y2={y} stroke="rgba(255,255,255,.07)" strokeDasharray="4 7" />; })}
        <polygon points={area} fill={`url(#area-${color.slice(1)})`} />
        <polyline className="chart-line" points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {values.map((value, index) => <circle key={index} cx={width * index / (values.length - 1)} cy={bottom - (bottom - top) * value / maxValue} r="3" fill="#15121e" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />)}
      </svg>
      <div className="mt-1 flex justify-between text-[8px] text-slate-500">{labels.map(label => <span key={label}>{label}</span>)}</div>
    </div>
  </div>;
}

export function EarningsChart() {
  const [range, setRange] = useState("Last 30 Days");
  return <ChartPanel title="Earnings Overview" description="Illustrative earnings · Demo SOL" action={<button onClick={() => setRange(range === "Last 30 Days" ? "Last 90 Days" : "Last 30 Days")} aria-label={`Chart range ${range}. Change range`} className="rounded-lg border border-white/[.08] px-2.5 py-1.5 text-[8px] text-slate-300 transition hover:border-violet-300/25 hover:bg-violet-300/[.06]">{range}⌄</button>}>
    <div className="mb-2 flex items-center justify-between"><span className="text-[9px] text-violet-200">Earnings trend <DemoPill /></span><span className="text-[8px] text-slate-500">Demo values</span></div>
    <SparkChart values={earningsHistory} maxValue={8} yLabels={["8 SOL", "6 SOL", "4 SOL", "2 SOL", "0 SOL"]} labels={["Oct 1", "Oct 8", "Oct 15", "Oct 22", "Oct 29"]} />
  </ChartPanel>;
}

export function ActivityChart() {
  const [period, setPeriod] = useState("Last 30 Days");
  return <ChartPanel title="Platform Activity" description="Illustrative platform activity · Demo" action={<button aria-label={`Chart range ${period}. Change range`} onClick={() => setPeriod(period === "Last 30 Days" ? "Last 90 Days" : "Last 30 Days")} className="rounded-lg border border-white/[.08] px-2.5 py-1.5 text-[8px] text-slate-300 transition hover:border-violet-300/25 hover:bg-violet-300/[.06]">{period}⌄</button>}>
    <div className="mb-2 flex items-center gap-2 text-[9px] text-slate-400"><span className="size-2 rounded-full bg-fuchsia-400" /> Projects created <DemoPill /></div>
    <SparkChart values={platformActivity} maxValue={40} yLabels={["40", "30", "20", "10", "0"]} labels={["Oct 1", "Oct 8", "Oct 15", "Oct 22", "Oct 29"]} color="#bb5cff" />
  </ChartPanel>;
}

export function ProjectProgressOverview({ projects, error }: { projects: ProjectRecord[] | null; error?: string | null }) {
  const milestoneRows = (projects ?? []).flatMap(project => project.project_milestones ?? []);
  const total = milestoneRows.length;
  const completed = milestoneRows.filter(milestone => milestone.status === "completed").length;
  const remaining = total - completed;
  const ratio = total > 0 ? completed / total : 0;
  const percent = Math.round(ratio * 100);
  const segments = total > 0
    ? `conic-gradient(#64bd88 0 ${ratio * 100}%, #a855f7 ${ratio * 100}% 100%)`
    : "conic-gradient(#a855f7 0 100%)";
  return <ChartPanel title="Project Progress" description="Live milestone completion across recent projects" action={<span className="rounded-md border border-emerald-300/15 bg-emerald-300/[.06] px-2 py-1 text-[8px] text-emerald-200">LIVE PROJECT DATA</span>}>
    {error ? <div role="alert" className="grid min-h-[116px] place-items-center px-4 text-center text-[10px] leading-5 text-amber-100">{error}</div> : <div className="flex min-h-[116px] items-center justify-center gap-4 sm:gap-6">
      <div role="img" aria-label={`${percent}% of ${total} milestones completed`} className="relative grid size-[88px] shrink-0 place-items-center rounded-full" style={{ background: segments }}>
        <div className="grid size-[66px] place-items-center rounded-full bg-[#12111d] text-center"><div><p className="text-base font-semibold">{percent}%</p><p className="text-[8px] text-slate-400">complete</p></div></div>
      </div>
      <ul className="space-y-3 text-[10px]">
        {[{ label: "Completed", count: completed, color: "bg-emerald-300" }, { label: "Remaining", count: remaining, color: "bg-fuchsia-400" }, { label: "Projects", count: projects?.length ?? 0, color: "bg-blue-300" }].map(item => <li key={item.label} className="flex items-center gap-2"><span className={`size-2 rounded-full ${item.color}`} /><span className="min-w-[64px] text-slate-300">{item.label}</span><span className="font-medium text-white">{item.count}</span></li>)}
      </ul>
    </div>}
  </ChartPanel>;
}

export function EscrowVisualization() {
  return <ChartPanel title="Escrow Status" description="Illustrative escrow distribution · Demo only">
    <div className="flex min-h-[116px] items-center justify-center gap-4 sm:gap-6">
      <div role="img" aria-label="64 demo escrows: 38 active, 20 released, and 6 disputed" className="relative grid size-[88px] shrink-0 place-items-center rounded-full" style={{ background: "conic-gradient(#a855f7 0 59.375%, #64bd88 59.375% 90.625%, #ef657b 90.625% 100%)" }}>
        <div className="grid size-[66px] place-items-center rounded-full bg-[#12111d] text-center"><div><p className="text-base font-semibold">64</p><p className="text-[8px] text-slate-400">Escrows</p></div></div>
      </div>
      <ul className="space-y-3 text-[10px]">
        {[{ label: "Active", count: "38", color: "bg-fuchsia-400" }, { label: "Released", count: "20", color: "bg-emerald-300" }, { label: "Disputed", count: "6", color: "bg-rose-400" }].map(item => <li key={item.label} className="flex items-center gap-2"><span className={`size-2 rounded-full ${item.color}`} /><span className="min-w-[54px] text-slate-300">{item.label}</span><span className="font-medium text-white">{item.count}</span></li>)}
      </ul>
    </div>
  </ChartPanel>;
}
