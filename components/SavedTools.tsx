"use client";

import Link from "next/link";
import { Bookmark, Search } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { tools } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";

export function SavedTools() {
  const { saved } = useApp();
  const savedTools = tools.filter((tool) => saved.includes(tool.slug));
  return <section className="saved-page"><div className="container"><div className="page-heading-row"><div><span className="kicker">Your collection</span><h1>Saved tools.</h1><p>{savedTools.length ? `${savedTools.length} tools waiting in your shortlist.` : "Interesting tools you save will live here."}</p></div><Link className="button button-dark" href="/tools"><Search size={16} /> Find more tools</Link></div>{savedTools.length ? <div className="tool-grid">{savedTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div> : <div className="empty-state saved-empty"><Bookmark /><h2>Nothing saved yet</h2><p>Tap the bookmark on any tool to build your personal shortlist.</p><Link className="button button-dark" href="/tools">Explore tools</Link></div>}</div></section>;
}
