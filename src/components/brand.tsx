import { Zap } from "lucide-react";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" aria-label="ProofFlow home" className="inline-flex items-center gap-2.5 font-semibold tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-600 text-white shadow-lg shadow-violet-950/40"><Zap size={19} fill="currentColor" strokeWidth={2} /></span>{!compact && <span className="text-[17px]">Proof<span className="text-violet-300">Flow</span></span>}</Link>;
}
