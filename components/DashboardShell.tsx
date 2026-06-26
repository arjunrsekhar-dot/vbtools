"use client";

import Link from "next/link";
import { BarChart3, Bookmark, Boxes, ChevronRight, FilePlus2, Flag, LayoutDashboard, LogOut, Settings, ShieldCheck, TicketPercent, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { SessionUser } from "@/lib/types";
import { useApp } from "@/components/AppProvider";
import { Logo } from "@/components/Logo";

export function DashboardShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useApp();
  const isAdmin = user.role === "ADMIN";
  const isDeveloper = user.role === "DEVELOPER";
  const base = isAdmin ? "/admin" : isDeveloper ? "/developer" : "/dashboard";
  const links = isAdmin ? [
    ["/admin", "Overview", LayoutDashboard], ["/admin/tools", "Tools", Boxes], ["/admin/reports", "Reports", Flag], ["/admin/users", "Users", Users], ["/admin/deals", "Deals & coupons", TicketPercent], ["/admin/analytics", "Analytics", BarChart3]
  ] : isDeveloper ? [
    ["/developer", "Overview", LayoutDashboard], ["/developer/listings", "My listings", Boxes], ["/submit", "Add new tool", FilePlus2], ["/developer/analytics", "Analytics", BarChart3]
  ] : [
    ["/dashboard", "Overview", LayoutDashboard], ["/saved", "Saved tools", Bookmark]
  ];
  return (
    <section className="dashboard-shell">
      <aside className="dashboard-nav">
        <div className="dashboard-brand"><Logo /></div>
        <div className="dashboard-profile"><span>{user.name.charAt(0)}</span><div><strong>{user.name}</strong><small>{user.email}</small></div></div>
        <nav>{links.map(([href, label, Icon]) => <Link key={href as string} href={href as string} className={pathname === href ? "active" : ""}><Icon size={17} /><span>{label as string}</span><ChevronRight size={13} /></Link>)}</nav>
        <div className="dashboard-nav-bottom"><Link href={`${base}/settings`}><Settings size={17} />Settings</Link>{isAdmin && <span><ShieldCheck size={15} /> Admin access</span>}<button onClick={logout}><LogOut size={17} />Log out</button></div>
      </aside>
      <div className="dashboard-content">{children}</div>
    </section>
  );
}
