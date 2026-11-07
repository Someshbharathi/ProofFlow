import { Brand } from "@/components/brand";

export function SiteFooter() {
  return <footer className="border-t border-white/[.08]"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"><Brand /><p>Thoughtful payments, one milestone at a time.</p><p>© {new Date().getFullYear()} ProofFlow. Concept preview.</p></div></footer>;
}
