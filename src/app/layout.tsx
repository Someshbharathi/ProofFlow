import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofFlow — Milestone payments, held with confidence",
  description: "A clearer way to manage milestone payments and escrow on Solana.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
