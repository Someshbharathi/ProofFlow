import Link from "next/link";
import { Zap } from "lucide-react";

const links = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Docs", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export function SiteHeader() {
  return <header className="metro-header relative z-20 mx-auto grid h-[68px] w-full max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-5 sm:h-[76px] sm:px-8 lg:px-12">
    <Link href="/" aria-label="ProofFlow home" className="inline-flex items-center gap-2 justify-self-start font-semibold tracking-tight"><Zap aria-hidden="true" className="text-violet-300" size={22} fill="currentColor" strokeWidth={2} /><span className="text-[16px] text-white">ProofFlow</span></Link>
    <nav aria-label="Main navigation" className="hidden items-center gap-7 text-[12px] font-medium text-slate-300 md:flex lg:gap-9">
      {links.map(link => <a key={link.label} className="metro-nav-link" href={link.href}>{link.label}</a>)}
    </nav>
    <div className="flex items-center justify-self-end gap-3 sm:gap-5">
      <Link href="/login" className="metro-login hidden text-[12px] font-medium text-slate-200 sm:inline-flex">Login</Link>
      <Link href="/signup" className="metro-signup rounded-xl px-4 py-2 text-[11px] font-semibold text-white sm:px-5 sm:py-2.5">Sign Up</Link>
    </div>
  </header>;
}
