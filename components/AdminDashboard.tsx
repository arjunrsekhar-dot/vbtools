"use client";

import Link from "next/link";
import {
  ArrowRight, BadgeCheck, Ban, Boxes, Check, Clock3, Copy, Eye,
  Filter, ImagePlus, MousePointerClick, Pencil, Plus, Search, ShieldCheck,
  Star, TicketPercent, Trash2, TrendingUp, UserRound, UsersRound, X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SessionUser, UserRole } from "@/lib/types";
import { categories, tools } from "@/lib/tools";
import {
  AdminState, initialAdminState, ManagedDeal, ManagedTool, ManagedUser, QueueItem
} from "@/lib/admin-data";
import { FileImagePreviews, StoredImagePreviews } from "@/components/ImagePreviews";

type AdminSection = "overview" | "tools" | "users" | "deals" | "analytics" | "settings";
type Range = "7d" | "30d" | "90d";

const chartData: Record<Range, { labels: string[]; users: number[]; views: number[]; clicks: number[] }> = {
  "7d": { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], users: [260, 310, 285, 390, 430, 360, 470], views: [6200, 7400, 6900, 9100, 10400, 8800, 11600], clicks: [1800, 2100, 1950, 2800, 3200, 2600, 3500] },
  "30d": { labels: ["May 23", "May 28", "Jun 2", "Jun 7", "Jun 12", "Jun 17", "Jun 21"], users: [980, 1210, 1170, 1490, 1660, 1810, 2040], views: [24900, 29100, 27600, 35400, 38200, 44100, 48700], clicks: [7900, 9100, 8700, 11200, 12100, 14300, 15900] },
  "90d": { labels: ["Apr 1", "Apr 15", "May 1", "May 15", "Jun 1", "Jun 10", "Jun 21"], users: [2410, 2980, 3640, 4390, 5100, 5840, 6710], views: [68200, 81300, 95600, 112400, 134800, 151600, 174300], clicks: [20100, 24700, 29300, 34800, 41100, 46900, 53800] }
};

function useAdminState() {
  const [value, setValue] = useState<AdminState>(initialAdminState);
  const [ready, setReady] = useState(false);
  const valueRef = useRef<AdminState>(initialAdminState);
  useEffect(() => {
    const cached = window.localStorage.getItem("voltbean_admin_state");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as AdminState;
        valueRef.current = parsed;
        setValue(parsed);
      } catch { /* fetch the server copy below */ }
    }
    fetch("/api/admin/state")
      .then((response) => response.json())
      .then((data) => {
        if (data.state) {
          valueRef.current = data.state;
          setValue(data.state);
          window.localStorage.setItem("voltbean_admin_state", JSON.stringify(data.state));
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);
  const setRemoteValue = useCallback<React.Dispatch<React.SetStateAction<AdminState>>>((nextValue) => {
    const next = typeof nextValue === "function"
      ? (nextValue as (previous: AdminState) => AdminState)(valueRef.current)
      : nextValue;
    valueRef.current = next;
    setValue(next);
    window.localStorage.setItem("voltbean_admin_state", JSON.stringify(next));
    void fetch("/api/admin/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
      keepalive: true
    });
  }, []);
  return [value, setRemoteValue, ready] as const;
}

function formatNumber(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 1 : 0)}K` : String(value);
}

function InteractiveChart({ range, metric = "views", secondary = "users" }: { range: Range; metric?: "views" | "clicks"; secondary?: "users" | "clicks" }) {
  const data = chartData[range];
  const [active, setActive] = useState(data.labels.length - 1);
  useEffect(() => setActive(data.labels.length - 1), [data.labels.length, range]);
  const primary = data[metric];
  const secondaryData = data[secondary];
  const max = Math.max(...primary) * 1.12;
  const width = 700;
  const height = 220;
  const pad = 22;
  const points = (values: number[]) => values.map((value, index) => {
    const x = pad + index * ((width - pad * 2) / (values.length - 1));
    const y = height - pad - (value / max) * (height - pad * 2);
    return { x, y, value };
  });
  const mainPoints = points(primary);
  const secondaryPoints = points(secondaryData.map((value) => value * (max / Math.max(...secondaryData)) * .72));
  const path = (items: { x: number; y: number }[]) => items.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  return (
    <div className="interactive-chart">
      <div className="chart-legend"><span><i className="legend-primary" />{metric === "views" ? "Tool views" : "Outbound clicks"}</span><span><i className="legend-secondary" />{secondary === "users" ? "New users" : "Outbound clicks"}</span></div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Interactive ${range} analytics chart`}>
        {[0, 1, 2, 3].map((line) => <line key={line} x1={pad} x2={width - pad} y1={pad + line * 55} y2={pad + line * 55} className="chart-grid-line" />)}
        <path d={`${path(mainPoints)} L ${mainPoints.at(-1)?.x} ${height - pad} L ${mainPoints[0].x} ${height - pad} Z`} className="chart-area" />
        <path d={path(mainPoints)} className="chart-line-primary" />
        <path d={path(secondaryPoints)} className="chart-line-secondary" />
        {mainPoints.map((point, index) => (
          <g key={data.labels[index]} className="chart-point" onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} tabIndex={0}>
            <circle cx={point.x} cy={point.y} r={active === index ? 6 : 4} />
            <rect x={point.x - 22} y={0} width={44} height={height} fill="transparent" />
          </g>
        ))}
      </svg>
      <div className="chart-labels">{data.labels.map((label) => <span key={label}>{label}</span>)}</div>
      <div className="chart-tooltip" style={{ left: `${(mainPoints[active].x / width) * 100}%` }}>
        <small>{data.labels[active]}</small>
        <strong>{formatNumber(primary[active])} {metric}</strong>
        <span>{formatNumber(data[secondary][active])} {secondary}</span>
      </div>
    </div>
  );
}

export function AdminDashboard({ user, section = "overview" }: { user: SessionUser; section?: AdminSection }) {
  const [adminState, setAdminState, stateReady] = useAdminState();
  const { queue, tools: managedTools, users: managedUsers, deals } = adminState;
  const setManagedTools = useCallback<React.Dispatch<React.SetStateAction<ManagedTool[]>>>((next) => {
    setAdminState((current) => ({ ...current, tools: typeof next === "function" ? next(current.tools) : next }));
  }, [setAdminState]);
  const setManagedUsers = useCallback<React.Dispatch<React.SetStateAction<ManagedUser[]>>>((next) => {
    setAdminState((current) => ({ ...current, users: typeof next === "function" ? next(current.users) : next }));
  }, [setAdminState]);
  const setDeals = useCallback<React.Dispatch<React.SetStateAction<ManagedDeal[]>>>((next) => {
    setAdminState((current) => ({ ...current, deals: typeof next === "function" ? next(current.deals) : next }));
  }, [setAdminState]);
  const [toast, setToast] = useState("");
  const [reviewing, setReviewing] = useState<QueueItem | null>(null);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1900);
  }
  function queueAction(id: string | number, verb: "approved" | "rejected") {
    setAdminState((current) => {
      const item = current.queue.find((entry) => entry.id === id);
      if (!item) return current;
      const queue = current.queue.filter((entry) => entry.id !== id);
      if (verb === "rejected") return { ...current, queue };

      const baseSlug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tool";
      let slug = baseSlug;
      let suffix = 2;
      while (current.tools.some((tool) => tool.slug === slug)) slug = `${baseSlug}-${suffix++}`;
      const published: ManagedTool = {
        id: `tool_${crypto.randomUUID()}`,
        name: item.name,
        slug,
        category: item.category,
        logo: item.logo,
        color: item.color,
        status: "Published",
        featured: false,
        verified: false,
        sponsored: false,
        views: 0,
        updatedAt: new Date().toISOString().slice(0, 10),
        description: item.description,
        fullDescription: item.fullDescription,
        website: item.website,
        pricingType: item.pricingType,
        startingPrice: item.startingPrice,
        freeTrial: item.freeTrial,
        bestFor: item.bestFor,
        subcategory: item.subcategory,
        tags: item.tags,
        logoUrl: item.logoUrl,
        screenshotUrls: item.screenshotUrls,
        couponCode: item.couponCode,
        discountDetails: item.discountDetails
      };
      return { ...current, queue, tools: [...current.tools, published] };
    });
    setReviewing(null);
    notify(`Listing ${verb}.`);
  }

  if (!stateReady) {
    return <div className="admin-loading"><span /><span /><span /><p>Loading admin workspace…</p></div>;
  }

  return (
    <>
      {toast && <div className="admin-toast"><Check size={15} />{toast}</div>}
      {section === "overview" && <Overview user={user} queue={queue} action={queueAction} setReviewing={setReviewing} />}
      {section === "tools" && <ToolsAdmin items={managedTools} setItems={setManagedTools} notify={notify} />}
      {section === "users" && <UsersAdmin items={managedUsers} setItems={setManagedUsers} notify={notify} />}
      {section === "deals" && <DealsAdmin items={deals} setItems={setDeals} notify={notify} />}
      {section === "analytics" && <AnalyticsAdmin />}
      {section === "settings" && <AdminSettings user={user} notify={notify} />}
      {reviewing && <ReviewModal item={reviewing} close={() => setReviewing(null)} action={queueAction} />}
    </>
  );
}

function Overview({ user, queue, action, setReviewing }: {
  user: SessionUser; queue: QueueItem[]; action: (id: string | number, verb: "approved" | "rejected") => void;
  setReviewing: (item: QueueItem) => void;
}) {
  const [range, setRange] = useState<Range>("30d");
  const data = chartData[range];
  const pulse = [
    [Eye, formatNumber(data.views.reduce((a, b) => a + b, 0)), "Tool views", "+16%"],
    [MousePointerClick, formatNumber(data.clicks.reduce((a, b) => a + b, 0)), "Outbound clicks", "+21%"],
    [Star, range === "7d" ? "1,840" : range === "30d" ? "7,830" : "21.4K", "New ratings", "+9%"]
  ] as const;
  const categoryStats = categories.map((category) => ({
    name: category.name,
    views: tools.filter((tool) => tool.category === category.name).reduce((total, tool) => total + tool.views, 0)
  })).sort((a, b) => b.views - a.views).slice(0, 5);
  const maxViews = categoryStats[0].views;
  return (
    <>
      <div className="dashboard-heading"><div><span>Admin control room</span><h1>Morning, {user.name.split(" ")[0]}.</h1><p>Here&apos;s what needs attention across Voltbean today.</p></div><Link href="/submit" className="button button-dark">Add tool <ArrowRight size={16} /></Link></div>
      <div className="stat-grid admin-stats">
        <Link href="/admin/tools"><span><Boxes /></span><div><strong>{tools.length}</strong><small>Catalog tools</small><em>+4 this month</em></div></Link>
        <Link href="/admin/users"><span><UserRound /></span><div><strong>18,294</strong><small>Users</small><em>+8.2%</em></div></Link>
        <Link href="/admin/users?role=developer"><span><UsersRound /></span><div><strong>1,126</strong><small>Developers</small><em>+42 this month</em></div></Link>
        <div className="attention-stat"><span><Clock3 /></span><div><strong>{queue.length}</strong><small>Pending review</small><em>{queue.length ? "Needs attention" : "All clear"}</em></div></div>
      </div>
      <div className="dashboard-grid-main admin-grid">
        <div className="dashboard-panel">
          <div className="panel-heading"><div><h2>Approval queue</h2><p>New tools and listing updates waiting for review.</p></div><span className="panel-count">{queue.length} pending</span></div>
          <div className="approval-list">
            {queue.map((item) => <div className="approval-item" key={item.id}><i style={{ background: item.color }}>{item.logo}</i><div><strong>{item.name}</strong><small>{item.owner} · {item.category}</small></div><span>{item.submitted}</span><button className="review-button" onClick={() => setReviewing(item)}><Eye size={14} /> Review</button><button aria-label={`Approve ${item.name}`} className="approve-button" onClick={() => action(item.id, "approved")}><Check size={15} /></button><button aria-label={`Reject ${item.name}`} className="reject-button" onClick={() => action(item.id, "rejected")}><X size={15} /></button></div>)}
            {!queue.length && <div className="queue-empty"><BadgeCheck /><strong>Queue cleared</strong><small>Everything submitted today has been reviewed.</small></div>}
          </div>
        </div>
        <aside className="dashboard-panel quick-panel"><div className="panel-heading"><div><h2>Platform pulse</h2><p>{range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "Last 90 days"}</p></div></div><div className="pulse-list">{pulse.map(([Icon, value, label, growth]) => <div key={label}><span><Icon /></span><p><strong>{value}</strong><small>{label}</small></p><em>{growth}</em></div>)}</div></aside>
      </div>
      <div className="dashboard-grid-main admin-lower">
        <div className="dashboard-panel chart-panel"><div className="panel-heading"><div><h2>Growth overview</h2><p>Hover or focus a point to inspect it</p></div><select aria-label="Analytics date range" value={range} onChange={(event) => setRange(event.target.value as Range)}><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option></select></div><InteractiveChart range={range} /></div>
        <div className="dashboard-panel"><div className="panel-heading"><div><h2>Popular categories</h2><p>Ranked by catalog views</p></div></div><div className="category-bars">{categoryStats.map((item, index) => <div key={item.name}><span>{index + 1}</span><strong>{item.name}</strong><i><b style={{ width: `${(item.views / maxViews) * 100}%` }} /></i><small>{formatNumber(item.views)}</small></div>)}</div></div>
      </div>
    </>
  );
}

function ToolsAdmin({ items, setItems, notify }: { items: ManagedTool[]; setItems: React.Dispatch<React.SetStateAction<ManagedTool[]>>; notify: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [editing, setEditing] = useState<ManagedTool | null>(null);
  const [draft, setDraft] = useState<ManagedTool | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [editorError, setEditorError] = useState("");
  const [saving, setSaving] = useState(false);
  const filtered = items.filter((item) => (status === "All" || item.status === status) && `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  function update(id: string, change: Partial<ManagedTool>, message: string) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...change } : item));
    notify(message);
  }
  function openEditor(item: ManagedTool) {
    setEditing(item);
    setDraft({ ...item, tags: item.tags || [], screenshotUrls: item.screenshotUrls || [] });
    setLogoFile(null);
    setScreenshotFiles([]);
    setEditorError("");
  }
  async function saveEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editing || !draft) return;
    const normalizedSlug = draft.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const duplicateSlug = items.some((item) => item.id !== editing.id && item.slug === normalizedSlug);
    if (duplicateSlug) {
      notify("That slug is already used by another tool.");
      return;
    }
    if (!draft.description?.trim() || draft.description.trim().length < 20) {
      setEditorError("Short description must be at least 20 characters.");
      return;
    }
    if (!draft.fullDescription?.trim() || draft.fullDescription.trim().length < 40) {
      setEditorError("Full description must be at least 40 characters.");
      return;
    }
    let logoUrl = draft.logoUrl;
    let screenshotUrls = draft.screenshotUrls || [];
    if (logoFile || screenshotFiles.length) {
      setSaving(true);
      const media = new FormData();
      if (logoFile) media.set("logo", logoFile);
      screenshotFiles.forEach((file) => media.append("screenshots", file));
      const upload = await fetch("/api/admin/uploads", { method: "POST", body: media });
      const data = await upload.json() as { error?: string; logoUrl?: string | null; screenshotUrls?: string[] };
      if (!upload.ok) {
        setEditorError(data.error || "Could not upload the selected images.");
        setSaving(false);
        return;
      }
      logoUrl = data.logoUrl || logoUrl;
      screenshotUrls = [...screenshotUrls, ...(data.screenshotUrls || [])].slice(0, 5);
    }
    const saved = {
      ...draft,
      name: draft.name.trim(),
      slug: normalizedSlug,
      logo: draft.logo.trim() || draft.name.trim().charAt(0).toUpperCase(),
      updatedAt: new Date().toISOString().slice(0, 10),
      logoUrl,
      screenshotUrls
    };
    setItems((current) => current.map((item) => item.id === editing.id ? saved : item));
    setEditing(null);
    setDraft(null);
    setLogoFile(null);
    setScreenshotFiles([]);
    setSaving(false);
    notify(`${saved.name} was updated.`);
  }
  function remove(id: string, name: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    notify(`${name} removed from the catalog.`);
  }
  return (
    <>
      <div className="dashboard-heading"><div><span>Catalog management</span><h1>Tools</h1><p>Publish, verify, feature, and maintain every listing.</p></div><Link href="/submit" className="button button-dark"><Plus size={16} /> Add tool</Link></div>
      <div className="stat-grid admin-section-stats"><div><span><Boxes /></span><div><strong>{items.length}</strong><small>Total listings</small></div></div><div><span><BadgeCheck /></span><div><strong>{items.filter((item) => item.verified).length}</strong><small>Verified</small></div></div><div><span><Star /></span><div><strong>{items.filter((item) => item.featured).length}</strong><small>Featured</small></div></div><div><span><Clock3 /></span><div><strong>{items.filter((item) => item.status !== "Published").length}</strong><small>Unpublished</small></div></div></div>
      <div className="dashboard-panel">
        <div className="admin-toolbar"><label className="admin-search"><Search size={15} /><input aria-label="Search tools" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools or categories" /></label><label className="admin-filter"><Filter size={14} /><select aria-label="Filter tool status" value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Published</option><option>Draft</option><option>Rejected</option></select></label><span>{filtered.length} results</span></div>
        <div className="admin-data-table tool-admin-table">
          <div className="admin-table-row admin-table-head"><span>Tool</span><span>Status</span><span>Views</span><span>Featured</span><span>Verified</span><span>Actions</span></div>
          {filtered.map((item) => <div className="admin-table-row" key={item.id}><span className="admin-tool-cell"><i style={{ background: item.color }}>{item.logo}</i><span><strong>{item.name}</strong><small>{item.category}</small></span></span><span><select aria-label={`${item.name} status`} value={item.status} onChange={(event) => update(item.id, { status: event.target.value as ManagedTool["status"] }, `${item.name} status updated.`)}><option>Published</option><option>Draft</option><option>Rejected</option></select></span><span>{formatNumber(item.views)}</span><span><button aria-label={`Toggle featured for ${item.name}`} className={`admin-switch ${item.featured ? "on" : ""}`} onClick={() => update(item.id, { featured: !item.featured }, `${item.name} ${item.featured ? "removed from" : "added to"} featured tools.`)}><i /></button></span><span><button aria-label={`Toggle verified for ${item.name}`} className={`admin-switch ${item.verified ? "on" : ""}`} onClick={() => update(item.id, { verified: !item.verified }, `${item.name} verification updated.`)}><i /></button></span><span className="table-actions"><Link aria-label={`View ${item.name}`} href={`/tools/${item.slug}`}><Eye /></Link><button aria-label={`Edit ${item.name}`} onClick={() => openEditor(item)}><Pencil /></button><button aria-label={`Delete ${item.name}`} className="danger" onClick={() => remove(item.id, item.name)}><Trash2 /></button></span></div>)}
        </div>
      </div>
      {editing && draft && (
        <div className="admin-modal-backdrop">
          <form className="admin-modal tool-edit-modal" onSubmit={saveEdit}>
            <button type="button" className="modal-close" aria-label="Close tool editor" onClick={() => { setEditing(null); setDraft(null); }}><X /></button>
            <span className="kicker">Catalog editor</span>
            <div className="tool-editor-title">
              <i style={{ background: draft.color }}>{draft.logo || "?"}</i>
              <div><h2>Edit {editing.name}</h2><p>Edit every public listing field, logo, and screenshot gallery.</p></div>
            </div>
            <div className="modal-form-grid">
              <label><span>Tool name</span><input aria-label="Edit tool name" required minLength={2} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
              <label><span>Public slug</span><input aria-label="Edit tool slug" value={draft.slug} readOnly title="Slugs are locked in the MVP to preserve public links." /></label>
              <label><span>Category</span><select aria-label="Edit tool category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{categories.map((category) => <option key={category.slug}>{category.name}</option>)}</select></label>
              <label><span>Subcategory</span><input aria-label="Edit tool subcategory" value={draft.subcategory || ""} onChange={(event) => setDraft({ ...draft, subcategory: event.target.value })} /></label>
              <label><span>Status</span><select aria-label="Edit tool status" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ManagedTool["status"] })}><option>Published</option><option>Draft</option><option>Rejected</option></select></label>
              <label><span>Website URL</span><input aria-label="Edit tool website" type="url" required value={draft.website || ""} onChange={(event) => setDraft({ ...draft, website: event.target.value })} /></label>
              <label className="span-2"><span>Short description</span><textarea aria-label="Edit tool short description" required minLength={20} maxLength={150} rows={3} value={draft.description || ""} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
              <label className="span-2"><span>Full description</span><textarea aria-label="Edit tool full description" required minLength={40} maxLength={5000} rows={6} value={draft.fullDescription || ""} onChange={(event) => setDraft({ ...draft, fullDescription: event.target.value })} /></label>
              <label className="span-2"><span>Best for</span><input aria-label="Edit tool best for" value={draft.bestFor || ""} onChange={(event) => setDraft({ ...draft, bestFor: event.target.value })} /></label>
              <label className="span-2"><span>Tags (comma separated)</span><input aria-label="Edit tool tags" value={(draft.tags || []).join(", ")} onChange={(event) => setDraft({ ...draft, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 12) })} /></label>
              <label><span>Pricing type</span><select aria-label="Edit tool pricing type" value={draft.pricingType || "Freemium"} onChange={(event) => setDraft({ ...draft, pricingType: event.target.value as ManagedTool["pricingType"] })}><option>Free</option><option>Freemium</option><option>Paid</option><option>Open Source</option></select></label>
              <label><span>Starting price</span><input aria-label="Edit tool starting price" value={draft.startingPrice || ""} onChange={(event) => setDraft({ ...draft, startingPrice: event.target.value })} /></label>
              <label><span>Coupon code</span><input aria-label="Edit tool coupon code" value={draft.couponCode || ""} onChange={(event) => setDraft({ ...draft, couponCode: event.target.value })} /></label>
              <label><span>Discount details</span><input aria-label="Edit tool discount details" value={draft.discountDetails || ""} onChange={(event) => setDraft({ ...draft, discountDetails: event.target.value })} /></label>
              <label><span>Logo text</span><input aria-label="Edit tool logo text" required maxLength={3} value={draft.logo} onChange={(event) => setDraft({ ...draft, logo: event.target.value })} /></label>
              <label><span>Logo color</span><div className="color-input"><input aria-label="Edit tool logo color" type="color" value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value })} /><code>{draft.color}</code></div></label>
              <label><span>Views</span><input aria-label="Edit tool views" type="number" min={0} value={draft.views} onChange={(event) => setDraft({ ...draft, views: Number(event.target.value) })} /></label>
              <label><span>Last updated</span><input value={draft.updatedAt} readOnly /></label>
            </div>
            <label className="checkbox-card editor-trial"><input type="checkbox" checked={Boolean(draft.freeTrial)} onChange={(event) => setDraft({ ...draft, freeTrial: event.target.checked })} /><span><strong>Free trial available</strong><small>Show that visitors can try the paid plan.</small></span></label>
            <div className="editor-media-section">
              <div><span>Logo image</span><label className="editor-upload"><ImagePlus /><strong>{logoFile ? logoFile.name : draft.logoUrl ? "Replace logo image" : "Upload logo image"}</strong><small>PNG, JPG, or WebP · 2MB max</small><input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={(event) => setLogoFile(event.target.files?.[0] || null)} /></label></div>
              <div><span>Screenshots</span><label className="editor-upload"><Plus /><strong>Add screenshots</strong><small>Up to 5 total · 5MB each</small><input type="file" multiple accept=".png,.jpg,.jpeg,.webp" onChange={(event) => setScreenshotFiles(Array.from(event.target.files || []).slice(0, Math.max(0, 5 - (draft.screenshotUrls?.length || 0))))} /></label></div>
            </div>
            {draft.logoUrl && !logoFile && <StoredImagePreviews urls={[draft.logoUrl]} remove={() => setDraft({ ...draft, logoUrl: null })} />}
            {logoFile && <FileImagePreviews files={[logoFile]} remove={() => setLogoFile(null)} />}
            <StoredImagePreviews urls={draft.screenshotUrls || []} remove={(index) => setDraft({ ...draft, screenshotUrls: (draft.screenshotUrls || []).filter((_, itemIndex) => itemIndex !== index) })} />
            <FileImagePreviews files={screenshotFiles} remove={(index) => setScreenshotFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} />
            <div className="tool-editor-flags">
              <label className="checkbox-card"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} /><span><strong>Featured</strong><small>Show in editorial placements.</small></span></label>
              <label className="checkbox-card"><input type="checkbox" checked={draft.verified} onChange={(event) => setDraft({ ...draft, verified: event.target.checked })} /><span><strong>Verified</strong><small>Mark listing details as checked.</small></span></label>
              <label className="checkbox-card"><input type="checkbox" checked={draft.sponsored} onChange={(event) => setDraft({ ...draft, sponsored: event.target.checked })} /><span><strong>Sponsored</strong><small>Label this as a paid placement.</small></span></label>
            </div>
            {editorError && <p className="form-error" role="alert">{editorError}</p>}
            <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => { setEditing(null); setDraft(null); }}>Cancel</button><button className="button button-dark" disabled={saving}><Check /> {saving ? "Uploading…" : "Save changes"}</button></div>
          </form>
        </div>
      )}
    </>
  );
}

function UsersAdmin({ items, setItems, notify }: { items: ManagedUser[]; setItems: React.Dispatch<React.SetStateAction<ManagedUser[]>>; notify: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("ALL");
  const filtered = items.filter((item) => (role === "ALL" || item.role === role) && `${item.name} ${item.email}`.toLowerCase().includes(query.toLowerCase()));
  function update(id: string, change: Partial<ManagedUser>, message: string) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...change } : item));
    notify(message);
  }
  return (
    <>
      <div className="dashboard-heading"><div><span>Access management</span><h1>Users & developers</h1><p>Manage account roles, access, and platform status.</p></div></div>
      <div className="stat-grid admin-section-stats"><div><span><UserRound /></span><div><strong>{items.length}</strong><small>Demo accounts</small></div></div><div><span><UsersRound /></span><div><strong>{items.filter((item) => item.role === "DEVELOPER").length}</strong><small>Developers</small></div></div><div><span><ShieldCheck /></span><div><strong>{items.filter((item) => item.role === "ADMIN").length}</strong><small>Admins</small></div></div><div><span><Ban /></span><div><strong>{items.filter((item) => item.status === "Suspended").length}</strong><small>Suspended</small></div></div></div>
      <div className="dashboard-panel">
        <div className="admin-toolbar"><label className="admin-search"><Search size={15} /><input aria-label="Search users" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email" /></label><label className="admin-filter"><Filter size={14} /><select aria-label="Filter users by role" value={role} onChange={(event) => setRole(event.target.value)}><option value="ALL">All roles</option><option value="USER">Users</option><option value="DEVELOPER">Developers</option><option value="ADMIN">Admins</option></select></label><span>{filtered.length} accounts</span></div>
        <div className="admin-data-table user-admin-table">
          <div className="admin-table-row admin-table-head"><span>Account</span><span>Role</span><span>Joined</span><span>Status</span><span>Access</span></div>
          {filtered.map((item) => <div className="admin-table-row" key={item.id}><span className="admin-user-cell"><i>{item.avatar}</i><span><strong>{item.name}</strong><small>{item.email}</small></span></span><span><select aria-label={`${item.name} role`} value={item.role} onChange={(event) => update(item.id, { role: event.target.value as UserRole }, `${item.name}'s role was updated.`)}><option value="USER">User</option><option value="DEVELOPER">Developer</option><option value="ADMIN">Admin</option></select></span><span>{item.joined}</span><span><b className={`account-status ${item.status.toLowerCase()}`}>{item.status}</b></span><span><button className={`access-button ${item.status === "Suspended" ? "restore" : ""}`} onClick={() => update(item.id, { status: item.status === "Active" ? "Suspended" : "Active" }, `${item.name} was ${item.status === "Active" ? "suspended" : "restored"}.`)}>{item.status === "Active" ? <><Ban /> Suspend</> : <><Check /> Restore</>}</button></span></div>)}
        </div>
      </div>
    </>
  );
}

function DealsAdmin({ items, setItems, notify }: { items: ManagedDeal[]; setItems: React.Dispatch<React.SetStateAction<ManagedDeal[]>>; notify: (message: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ tool: "", discount: "", code: "", expires: "" });
  function toggle(id: string, active: boolean, tool: string) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, active } : item));
    notify(`${tool} deal ${active ? "activated" : "paused"}.`);
  }
  function addDeal(event: React.FormEvent) {
    event.preventDefault();
    setItems((current) => [...current, { id: crypto.randomUUID(), ...draft, active: true, clicks: 0 }]);
    setDraft({ tool: "", discount: "", code: "", expires: "" });
    setShowForm(false);
    notify("New deal added.");
  }
  return (
    <>
      <div className="dashboard-heading"><div><span>Revenue operations</span><h1>Deals & coupons</h1><p>Keep offers accurate, active, and easy to claim.</p></div><button className="button button-dark" onClick={() => setShowForm(true)}><Plus size={16} /> Add deal</button></div>
      <div className="stat-grid admin-section-stats"><div><span><TicketPercent /></span><div><strong>{items.length}</strong><small>Total deals</small></div></div><div><span><Check /></span><div><strong>{items.filter((item) => item.active).length}</strong><small>Active</small></div></div><div><span><MousePointerClick /></span><div><strong>{formatNumber(items.reduce((sum, item) => sum + item.clicks, 0))}</strong><small>Deal clicks</small></div></div><div><span><TrendingUp /></span><div><strong>12.8%</strong><small>Conversion rate</small></div></div></div>
      <div className="deals-admin-grid">{items.map((item) => <article className={`admin-deal-card ${!item.active ? "paused" : ""}`} key={item.id}><div><span className={`deal-state ${item.active ? "active" : ""}`}>{item.active ? "Active" : "Paused"}</span><button aria-label={`Toggle ${item.tool} deal`} className={`admin-switch ${item.active ? "on" : ""}`} onClick={() => toggle(item.id, !item.active, item.tool)}><i /></button></div><h2>{item.tool}</h2><p>{item.discount}</p><button className="admin-coupon" onClick={() => { navigator.clipboard.writeText(item.code); notify(`${item.code} copied.`); }}><code>{item.code}</code><Copy /></button><footer><span><MousePointerClick />{formatNumber(item.clicks)} clicks</span><span><Clock3 />{item.expires}</span></footer></article>)}</div>
      {showForm && <div className="admin-modal-backdrop"><form className="admin-modal deal-form-modal" onSubmit={addDeal}><button type="button" className="modal-close" onClick={() => setShowForm(false)}><X /></button><span className="kicker">New promotion</span><h2>Add a software deal</h2><label><span>Tool name</span><input required value={draft.tool} onChange={(event) => setDraft({ ...draft, tool: event.target.value })} placeholder="e.g. Notion" /></label><label><span>Discount details</span><input required value={draft.discount} onChange={(event) => setDraft({ ...draft, discount: event.target.value })} placeholder="e.g. 20% off for 3 months" /></label><div className="modal-form-grid"><label><span>Coupon code</span><input required value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value.toUpperCase() })} /></label><label><span>Expiry</span><input required value={draft.expires} onChange={(event) => setDraft({ ...draft, expires: event.target.value })} placeholder="No expiry" /></label></div><button className="button button-dark">Create deal</button></form></div>}
    </>
  );
}

function AnalyticsAdmin() {
  const [range, setRange] = useState<Range>("30d");
  const [metric, setMetric] = useState<"views" | "clicks">("views");
  const data = chartData[range];
  const total = data[metric].reduce((a, b) => a + b, 0);
  const previous = Math.round(total / 1.16);
  const categoryRows = useMemo(() => categories.map((category) => {
    const categoryTools = tools.filter((tool) => tool.category === category.name);
    return { name: category.name, views: categoryTools.reduce((sum, tool) => sum + tool.views, 0), clicks: categoryTools.reduce((sum, tool) => sum + tool.clicks, 0), tools: categoryTools.length };
  }).sort((a, b) => b[metric] - a[metric]), [metric]);
  return (
    <>
      <div className="dashboard-heading"><div><span>Platform intelligence</span><h1>Analytics</h1><p>Explore discovery, engagement, and outbound performance.</p></div><div className="heading-controls"><select aria-label="Analytics range" value={range} onChange={(event) => setRange(event.target.value as Range)}><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option></select></div></div>
      <div className="stat-grid admin-section-stats"><div><span><Eye /></span><div><strong>{formatNumber(data.views.reduce((a, b) => a + b, 0))}</strong><small>Tool views</small><em>+16%</em></div></div><div><span><MousePointerClick /></span><div><strong>{formatNumber(data.clicks.reduce((a, b) => a + b, 0))}</strong><small>Outbound clicks</small><em>+21%</em></div></div><div><span><UserRound /></span><div><strong>{formatNumber(data.users.reduce((a, b) => a + b, 0))}</strong><small>New users</small><em>+8.2%</em></div></div><div><span><TrendingUp /></span><div><strong>{((data.clicks.reduce((a, b) => a + b, 0) / data.views.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%</strong><small>Click-through rate</small></div></div></div>
      <div className="dashboard-panel analytics-main-chart"><div className="panel-heading"><div><h2>{metric === "views" ? "Tool discovery" : "Outbound engagement"}</h2><p>{formatNumber(total)} total · {formatNumber(total - previous)} more than the previous period</p></div><div className="metric-tabs"><button className={metric === "views" ? "active" : ""} onClick={() => setMetric("views")}>Views</button><button className={metric === "clicks" ? "active" : ""} onClick={() => setMetric("clicks")}>Clicks</button></div></div><InteractiveChart range={range} metric={metric} secondary={metric === "views" ? "clicks" : "users"} /></div>
      <div className="dashboard-panel"><div className="panel-heading"><div><h2>Category performance</h2><p>Compare traffic and conversion by category</p></div></div><div className="analytics-table"><div className="analytics-row analytics-head"><span>Category</span><span>Tools</span><span>Views</span><span>Clicks</span><span>CTR</span></div>{categoryRows.map((row) => <div className="analytics-row" key={row.name}><strong>{row.name}</strong><span>{row.tools}</span><span>{formatNumber(row.views)}</span><span>{formatNumber(row.clicks)}</span><span>{((row.clicks / row.views) * 100).toFixed(1)}%</span></div>)}</div></div>
    </>
  );
}

function AdminSettings({ user, notify }: { user: SessionUser; notify: (message: string) => void }) {
  return <><div className="dashboard-heading"><div><span>Administration</span><h1>Admin settings</h1><p>Manage your profile and moderation preferences.</p></div></div><div className="dashboard-panel settings-panel"><form onSubmit={(event) => { event.preventDefault(); notify("Admin settings saved."); }}><label><span>Name</span><input defaultValue={user.name} /></label><label><span>Email</span><input defaultValue={user.email} /></label><label className="checkbox-card"><input type="checkbox" defaultChecked /><span><strong>Email me about pending reviews</strong><small>Receive a daily digest when the queue is not empty.</small></span></label><label className="checkbox-card"><input type="checkbox" defaultChecked /><span><strong>Require approval for all listing updates</strong><small>Developers cannot publish edits without review.</small></span></label><button className="button button-dark">Save settings</button></form></div></>;
}

function ReviewModal({ item, close, action }: { item: QueueItem; close: () => void; action: (id: string | number, verb: "approved" | "rejected") => void }) {
  return <div className="admin-modal-backdrop"><div className="admin-modal review-modal"><button className="modal-close" onClick={close}><X /></button><div className="review-title"><i style={{ background: item.color }}>{item.logo}</i><div><span>{item.kind}</span><h2>{item.name}</h2><p>Submitted by {item.owner} · {item.submitted}</p></div></div><dl><div><dt>Category</dt><dd>{item.category}</dd></div><div><dt>Website</dt><dd><a href={item.website} target="_blank" rel="noreferrer">{item.website}</a></dd></div><div><dt>Description</dt><dd>{item.description}</dd></div></dl><label className="review-notes"><span>Internal review note</span><textarea placeholder="Optional note for the developer…" rows={3} /></label><div className="modal-actions"><button className="button reject-action" onClick={() => action(item.id, "rejected")}><X /> Reject</button><button className="button button-dark" onClick={() => action(item.id, "approved")}><Check /> Approve listing</button></div></div></div>;
}
