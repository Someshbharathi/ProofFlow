import { requireRole } from "@/lib/auth";
import { AuthIdentityProvider } from "@/components/auth/auth-identity";

export const dynamic = "force-dynamic";

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const { name } = await requireRole("client");
  return <AuthIdentityProvider name={name}>{children}</AuthIdentityProvider>;
}
