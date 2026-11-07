import { requireRole } from "@/lib/auth";
import { AuthIdentityProvider } from "@/components/auth/auth-identity";

export const dynamic = "force-dynamic";

export default async function FreelancerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { name } = await requireRole("freelancer");
  return <AuthIdentityProvider name={name}>{children}</AuthIdentityProvider>;
}
