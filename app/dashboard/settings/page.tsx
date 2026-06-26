import { DashboardShell } from "@/components/DashboardShell";
import { AccountSettings } from "@/components/AccountSettings";
import { requireRole } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireRole(["USER", "DEVELOPER", "ADMIN"]);
  return (
    <DashboardShell user={user}>
      <div className="dashboard-heading"><div><span>Account</span><h1>Settings</h1><p>Manage your profile and account preferences.</p></div></div>
      <AccountSettings user={user} />
    </DashboardShell>
  );
}
