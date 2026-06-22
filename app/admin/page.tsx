import { AdminDashboard } from "@/components/AdminDashboard";
import { DashboardShell } from "@/components/DashboardShell";
import { requireRole } from "@/lib/auth";

export default async function AdminPage() {
  const user = await requireRole(["ADMIN"]);
  return <DashboardShell user={user}><AdminDashboard user={user} /></DashboardShell>;
}
