import Link from "next/link";
import { ArrowUpRight, Bookmark, Eye, MousePointerClick, Plus, Star } from "lucide-react";
import { SessionUser } from "@/lib/types";
import { DeveloperDashboardData } from "@/lib/dashboard-data";

function number(value: number) {
  return new Intl.NumberFormat("en-US", { notation: value >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

export function DeveloperDashboard({ user, data }: { user: SessionUser; data: DeveloperDashboardData }) {
  const max = Math.max(1, ...data.performance.map((day) => Math.max(day.views, day.clicks)));
  return (
    <>
      <div className="dashboard-heading"><div><span>Developer portal</span><h1>Welcome back, {user.name.split(" ")[0]}.</h1><p>Live performance data from your published listings and submissions.</p></div><Link href="/submit" className="button button-dark"><Plus size={16} /> Add a tool</Link></div>
      <div className="stat-grid">
        <div><span><Eye /></span><div><strong>{number(data.stats.views)}</strong><small>Listing views</small><em>Recorded page visits</em></div></div>
        <div><span><Bookmark /></span><div><strong>{number(data.stats.saves)}</strong><small>Total saves</small><em>Current shortlist saves</em></div></div>
        <div><span><MousePointerClick /></span><div><strong>{number(data.stats.clicks)}</strong><small>Website clicks</small><em>Outbound visits</em></div></div>
        <div><span><Star /></span><div><strong>{data.stats.rating ? data.stats.rating.toFixed(1) : "—"}</strong><small>Average rating</small><em>{number(data.stats.ratingCount)} ratings</em></div></div>
      </div>
      <div className="dashboard-grid-main">
        <div className="dashboard-panel">
          <div className="panel-heading"><div><h2>My listings</h2><p>Published tools and review status from the database.</p></div><Link href="/submit">New listing <Plus size={14} /></Link></div>
          <div className="listing-table">
            <div className="listing-row listing-head"><span>Tool</span><span>Status</span><span>Views</span><span>Saves</span><span>Rating</span><span /></div>
            {data.listings.map((item) => <div className="listing-row" key={item.id}><span className="listing-tool"><i style={{ background: item.color }}>{item.logo}</i><span><strong>{item.name}</strong><small>Updated {item.updated}</small></span></span><span><b className={`status-badge status-${item.status.toLowerCase().replaceAll(" ", "-")}`}>{item.status}</b></span><span>{number(item.views)}</span><span>{number(item.saves)}</span><span>{item.rating ? item.rating.toFixed(1) : "—"}</span><span /></div>)}
            {!data.listings.length && <div className="panel-empty"><Plus /><h3>No listings yet</h3><p>Submit your first tool to start collecting performance data.</p></div>}
          </div>
        </div>
        <aside className="dashboard-panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Newest recorded events</p></div></div><div className="activity-list">{data.activity.map((item) => <div key={item.id}><span className={`activity-icon ${item.type === "RATING" ? "yellow" : item.type === "CLICK" ? "blue" : "green"}`}>{item.type === "RATING" ? <Star /> : item.type === "CLICK" ? <ArrowUpRight /> : <Bookmark />}</span><p><strong>{item.label}</strong><small>{item.tool} · {item.time}</small></p></div>)}{!data.activity.length && <div><p><strong>No activity recorded yet</strong><small>Views, clicks, saves, and ratings will appear here.</small></p></div>}</div></aside>
      </div>
      <div className="dashboard-panel chart-panel"><div className="panel-heading"><div><h2>Recent traffic</h2><p>Recorded views and clicks over the last 14 days</p></div></div><div className="recorded-chart"><div className="recorded-chart-bars">{data.performance.map((day) => <div className="recorded-day" key={day.label} title={`${day.label}: ${day.views} views, ${day.clicks} clicks`}><div className="recorded-bars"><i style={{ height: `${Math.max(3, day.views / max * 100)}%` }} /><b style={{ height: `${Math.max(3, day.clicks / max * 100)}%` }} /></div><small>{day.label.split(" ")[1]}</small></div>)}</div><div className="chart-legend"><span><i className="legend-primary" />Views</span><span><i className="legend-secondary" />Clicks</span></div></div></div>
    </>
  );
}
