import { ArrowRight, CircleDollarSign, LockKeyhole, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const highlights = [
  { icon: Sparkles, label: "AI Milestones" },
  { icon: ShieldCheck, label: "Secure Escrow" },
  { icon: CircleDollarSign, label: "On-Chain Payments" },
  { icon: Zap, label: "Solana Powered" },
];

const features = [
  { icon: LockKeyhole, title: "Funds stay protected", copy: "Milestone funds are designed to remain in escrow until the agreed work is approved." },
  { icon: Sparkles, title: "Clarity at every step", copy: "Keep scope, delivery notes, and approvals together so both sides know what comes next." },
  { icon: Zap, title: "Built for Solana", copy: "A fast, low-cost foundation for a future of transparent on-chain payments." },
];
const steps = ["Agree on the scope", "Fund the milestone", "Review and release"];

export default function Home() {
  return <main className="min-h-screen bg-[#07070d] text-white">
    <section className="metro-hero relative flex min-h-[760px] flex-col overflow-hidden sm:min-h-screen">
      <div aria-hidden="true" className="metro-dot-field pointer-events-none absolute inset-0" />
      <svg aria-hidden="true" className="metro-lighting pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="metro-fill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#9b54ff" stopOpacity=".22" /><stop offset=".48" stopColor="#762ce5" stopOpacity=".11" /><stop offset="1" stopColor="#4710a0" stopOpacity=".015" /></linearGradient>
          <linearGradient id="metro-edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#a85cff" stopOpacity=".08" /><stop offset=".58" stopColor="#d9afff" stopOpacity=".95" /><stop offset="1" stopColor="#a15aff" stopOpacity=".68" /></linearGradient>
          <filter id="metro-soft-glow" x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur stdDeviation="12" /></filter>
        </defs>
        <g>
          <path className="metro-light-fill" d="M0 0H76C112 83 159 158 246 244C309 306 344 352 302 405C256 464 212 516 176 613C137 720 96 842 0 900Z" fill="url(#metro-fill)" />
          <path d="M76 0C112 83 159 158 246 244C309 306 344 352 302 405C256 464 212 516 176 613C137 720 96 842 0 900" className="metro-light-blur" fill="none" stroke="url(#metro-edge)" strokeWidth="25" filter="url(#metro-soft-glow)" />
          <path d="M76 0C112 83 159 158 246 244C309 306 344 352 302 405C256 464 212 516 176 613C137 720 96 842 0 900" className="metro-light-edge" fill="none" stroke="url(#metro-edge)" strokeWidth="2.2" />
        </g>
        <g transform="translate(1440 0) scale(-1 1)">
          <path className="metro-light-fill" d="M0 0H76C112 83 159 158 246 244C309 306 344 352 302 405C256 464 212 516 176 613C137 720 96 842 0 900Z" fill="url(#metro-fill)" />
          <path d="M76 0C112 83 159 158 246 244C309 306 344 352 302 405C256 464 212 516 176 613C137 720 96 842 0 900" className="metro-light-blur" fill="none" stroke="url(#metro-edge)" strokeWidth="25" filter="url(#metro-soft-glow)" />
          <path d="M76 0C112 83 159 158 246 244C309 306 344 352 302 405C256 464 212 516 176 613C137 720 96 842 0 900" className="metro-light-edge" fill="none" stroke="url(#metro-edge)" strokeWidth="2.2" />
        </g>
      </svg>
      <SiteHeader />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-12 pt-5 text-center sm:pb-14 sm:pt-2">
        <div className="metro-announcement mb-7 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[11px] font-medium text-violet-100 sm:mb-8 sm:text-xs"><Sparkles aria-hidden="true" size={14} className="text-fuchsia-200" /> AI-Powered Escrow on Solana <Zap aria-hidden="true" size={14} className="text-emerald-300" fill="currentColor" /></div>
        <h1 className="metro-headline text-[48px] font-semibold leading-[.99] tracking-[-.06em] sm:text-6xl md:text-7xl lg:text-[84px]">
          <span className="block">Work with trust.</span>
          <span className="metro-headline-accent mt-1 block">Pay with proof.</span>
        </h1>
        <p className="mt-6 max-w-[620px] text-[14px] leading-6 text-slate-300 sm:mt-7 sm:text-base sm:leading-7">Create projects, set milestones with AI, and make secure payments on Solana. No middlemen. No delays.</p>
        <div className="mt-8 flex w-full max-w-[360px] items-center justify-center gap-3 sm:mt-9">
          <Link href="/dashboard" className="metro-button-primary inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-[12px] font-semibold text-[#140c20] sm:flex-none sm:px-6">Get Started <ArrowRight aria-hidden="true" size={15} /></Link>
          <Link href="/dashboard" className="metro-button-secondary inline-flex h-11 flex-1 items-center justify-center rounded-xl px-4 text-[12px] font-medium text-white sm:flex-none sm:px-6">View Demo</Link>
        </div>
      </div>
      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-2 gap-x-3 gap-y-5 px-6 pb-8 sm:grid-cols-4 sm:gap-5 sm:px-8 sm:pb-10">
        {highlights.map(({ icon: Icon, label }) => <div key={label} className="metro-highlight flex items-center justify-center gap-2 text-[10px] font-medium text-slate-200 sm:gap-2.5 sm:text-xs"><Icon aria-hidden="true" size={17} className="shrink-0 text-violet-300" strokeWidth={2.5} /><span>{label}</span></div>)}
      </div>
    </section>

    <section id="features" className="relative border-y border-white/[.07] bg-[#090911]"><div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">Made for collaboration</p><h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Trust, built into the process.</h2><p className="mt-4 leading-7 text-slate-400">A calmer way to work together, from the first agreement to the final handoff.</p></div><div className="mt-11 grid gap-4 md:grid-cols-3">{features.map(({ icon: Icon, title, copy }, i) => <article key={title} className="card-hover rounded-2xl border border-white/[.08] bg-[#10111a] p-6"><span className="grid size-11 place-items-center rounded-xl bg-violet-400/[.1] text-violet-200"><Icon size={20} /></span><p className="mt-7 text-xs text-slate-600">0{i + 1}</p><h3 className="mt-2 text-lg font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p></article>)}</div></div></section>
    <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24"><div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">Simple by design</p><h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">From agreement to done.</h2><p className="mt-4 max-w-md leading-7 text-slate-400">Keep the expectations clear and each payment connected to the work it represents.</p></div><div className="grid gap-3 sm:grid-cols-3">{steps.map((step, i) => <div key={step} className="rounded-2xl border border-white/[.08] bg-white/[.025] p-5"><span className="text-sm font-medium text-violet-300">0{i + 1}</span><h3 className="mt-7 font-medium">{step}</h3><div className="mt-5 h-px bg-gradient-to-r from-violet-400/40 to-transparent" /></div>)}</div></div></section>
    <section id="pricing" className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-24"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl border border-violet-300/15 bg-gradient-to-br from-violet-500/[.1] via-[#12111d] to-[#0b0d14] p-7 sm:p-10 md:flex-row md:items-center"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-200">Clear terms, milestone by milestone</p><h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Start your next project with confidence.</h2><p className="mt-3 text-sm text-slate-400">Set expectations together, then keep every milestone and payment in view.</p></div><Link href="/dashboard" className="metro-button-primary inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-[#140c20]">Explore ProofFlow <ArrowRight size={16} /></Link></div></section>
    <SiteFooter />
  </main>;
}
