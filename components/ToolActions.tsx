"use client";

import { Bookmark, Check, Copy, ExternalLink, Flag, Share2 } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { useState } from "react";

export function ToolActions({ slug, websiteUrl, couponCode }: { slug: string; websiteUrl: string; couponCode?: string }) {
  const { isSaved, toggleSaved, user } = useApp();
  const [copied, setCopied] = useState(false);
  const saved = isSaved(slug);

  function save() {
    if (!user) { window.location.href = `/login?next=/tools/${slug}`; return; }
    toggleSaved(slug);
  }

  async function copyCoupon() {
    if (!couponCode) return;
    await navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function recordClick() {
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, type: "CLICK" }),
      keepalive: true
    });
  }

  return (
    <>
      <div className="detail-actions">
        <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="button button-dark" onClick={recordClick}>Visit website <ExternalLink size={16} /></a>
        <button className={`button button-outline ${saved ? "saved-active" : ""}`} onClick={save}><Bookmark size={16} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save tool"}</button>
        <button className="icon-button" aria-label="Share" onClick={() => navigator.clipboard.writeText(window.location.href)}><Share2 size={17} /></button>
      </div>
      {couponCode && (
        <button className="detail-coupon" onClick={copyCoupon}>
          <span><small>Exclusive coupon</small><strong>{couponCode}</strong></span>
          <span>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy code"}</span>
        </button>
      )}
      <button className="report-link"><Flag size={13} /> Report incorrect information</button>
    </>
  );
}
