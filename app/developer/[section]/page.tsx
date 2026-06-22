import { DashboardShell } from "@/components/DashboardShell";
import { DeveloperDashboard } from "@/components/DeveloperDashboard";
import { requireRole } from "@/lib/auth";
import { getDeveloperDashboardData } from "@/lib/dashboard-data";

export default async function DeveloperSectionPage() {
  const user = await requireRole(["DEVELOPER", "ADMIN"]);
  const data = await getDeveloperDashboardData(user);
  return <DashboardShell user={user}><DeveloperDashboard user={user} data={data} /></DashboardShell>;
}
