import { AdminDashboard } from "@/components/AdminDashboard";
import { DashboardShell } from "@/components/DashboardShell";
import { requireRole } from "@/lib/auth";

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const user = await requireRole(["ADMIN"]);
  const { section } = await params;
  const allowed = ["tools", "users", "deals", "analytics", "settings"] as const;
  const activeSection = allowed.includes(section as typeof allowed[number]) ? section as typeof allowed[number] : "overview";
  return <DashboardShell user={user}><AdminDashboard user={user} section={activeSection} /></DashboardShell>;
}
