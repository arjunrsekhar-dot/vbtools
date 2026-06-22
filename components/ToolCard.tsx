"use client";

import Link from "next/link";
import { ArrowUpRight, Bookmark, Check, Star } from "lucide-react";
import { Tool } from "@/lib/types";
import { useApp } from "@/components/AppProvider";
import Image from "next/image";

export function ToolCard({ tool, compact = false }: { tool: Tool; compact?: boolean }) {
  const { isSaved, toggleSaved, user } = useApp();
  const saved = isSaved(tool.slug);

  function handleSave(event: React.MouseEvent) {
    event.preventDefault();
    if (!user) {
      window.location.href = "/login?next=/saved";
      return;
    }
    toggleSaved(tool.slug);
  }

  return (
    <Link href={`/tools/${tool.slug}`} className={`tool-card ${compact ? "compact" : ""}`}>
      <div className="tool-card-top">
        <div className="tool-logo" style={{ background: tool.logoColor }}>
          {tool.logoUrl ? <Image src={tool.logoUrl} alt={`${tool.name} logo`} fill sizes="52px" /> : <span style={{ color: tool.logoColor === "#f2ff5e" ? "#151515" : "#fff" }}>{tool.logo}</span>}
        </div>
        <button className={`save-tool ${saved ? "is-saved" : ""}`} onClick={handleSave} aria-label="Save tool">
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="tool-card-title">
        <h3>{tool.name}</h3>
        {tool.verified && <span className="verified" title="Verified"><Check size={11} /></span>}
      </div>
      <p>{tool.shortDescription}</p>
      {!compact && (
        <div className="tag-row">
          {tool.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      )}
      <div className="tool-card-footer">
        <span className="rating"><Star size={15} fill="currentColor" /> {tool.rating ? tool.rating.toFixed(1) : "—"} <small>({tool.ratingCount})</small></span>
        <span className="price-label">{tool.pricingType}</span>
        <ArrowUpRight className="card-arrow" size={18} />
      </div>
      {tool.sponsored && <span className="sponsored-label">Sponsored</span>}
    </Link>
  );
}
