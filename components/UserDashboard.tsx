import Link from "next/link";
import { ArrowRight, Bookmark, Compass, Eye, Star } from "lucide-react";
import { ToolCard } from "@/components/ToolCard";
import { SessionUser } from "@/lib/types";
import { UserDashboardData } from "@/lib/dashboard-data";

export function UserDashboard({ user, data }: { user: SessionUser; data: UserDashboardData }) {
  return (
    <>
      <div className="dashboard-heading"><div><span>Personal dashboard</span><h1>Good to see you, {user.name.split(" ")[0]}.</h1><p>Your saved tools and activity are synced to your account.</p></div><Link href="/tools" className="button button-dark">Explore tools <Compass size={16} /></Link></div>
      <div className="stat-grid user-stats"><div><span><Bookmark /></span><div><strong>{data.stats.saved}</strong><small>Saved tools</small></div></div><div><span><Star /></span><div><strong>{data.stats.ratings}</strong><small>Ratings given</small></div></div><div><span><Eye /></span><div><strong>{data.stats.views}</strong><small>Recorded views</small></div></div></div>
      <div className="dashboard-panel"><div className="panel-heading"><div><h2>Your saved tools</h2><p>A shortlist stored in the database.</p></div><Link href="/saved">View all <ArrowRight size={14} /></Link></div>{data.savedTools.length ? <div className="dashboard-tool-grid">{data.savedTools.slice(0,3).map((tool) => <ToolCard tool={tool} compact key={tool.id} />)}</div> : <div className="panel-empty"><Bookmark /><h3>Your shortlist is empty</h3><p>Save interesting tools as you browse and they&apos;ll show up here.</p><Link className="button button-outline" href="/tools">Browse the directory</Link></div>}</div>
      <div className="dashboard-grid-main user-dashboard-lower">
        <div className="dashboard-panel"><div className="panel-heading"><div><h2>Recommended for you</h2><p>Based on saved categories and community ratings.</p></div></div><div className="dashboard-tool-grid">{data.recommended.map((tool) => <ToolCard tool={tool} compact key={tool.id} />)}</div></div>
        <aside className="dashboard-panel activity-panel"><div className="panel-heading"><div><h2>Your activity</h2><p>Recently recorded</p></div></div><div className="activity-list">{data.activity.map((item) => <div key={item.id}><span className="activity-icon green"><Eye /></span><p><strong>{item.label}</strong><small>{item.tool} · {item.time}</small></p></div>)}{!data.activity.length && <div><p><strong>No activity yet</strong><small>Views, saves, and ratings will appear here.</small></p></div>}</div></aside>
      </div>
    </>
  );
}
