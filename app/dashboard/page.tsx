import { DashboardShell } from "@/components/DashboardShell";
import { UserDashboard } from "@/components/UserDashboard";
import { requireRole } from "@/lib/auth";
import { getUserDashboardData } from "@/lib/dashboard-data";

export default async function DashboardPage() {
  const user = await requireRole(["USER", "DEVELOPER", "ADMIN"]);
  const data = await getUserDashboardData(user);
  return <DashboardShell user={user}><UserDashboard user={user} data={data} /></DashboardShell>;
}
