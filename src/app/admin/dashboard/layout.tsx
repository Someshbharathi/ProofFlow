import { requireRole } from "@/lib/auth";
import { AuthIdentityProvider } from "@/components/auth/auth-identity";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { name } = await requireRole("admin");
  return <AuthIdentityProvider name={name}>{children}</AuthIdentityProvider>;
}
