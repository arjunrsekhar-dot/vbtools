import { DashboardShell } from "@/components/DashboardShell";
import { requireRole } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireRole(["USER", "DEVELOPER", "ADMIN"]);
  return (
    <DashboardShell user={user}>
      <div className="dashboard-heading"><div><span>Account</span><h1>Settings</h1><p>Manage your profile and account preferences.</p></div></div>
      <div className="dashboard-panel"><form className="contact-form settings-form"><label><span>Name</span><input defaultValue={user.name} /></label><label><span>Email</span><input defaultValue={user.email} type="email" /></label><label><span>Role</span><input value={user.role.toLowerCase()} readOnly /></label><button className="button button-dark" type="button">Save changes</button></form></div>
    </DashboardShell>
  );
}
