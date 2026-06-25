"use client";

import { Bookmark, Check, Copy, ExternalLink, Flag, Share2 } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { useState } from "react";
import { LoginPrompt } from "@/components/LoginPrompt";

export function ToolActions({ slug, websiteUrl, couponCode }: { slug: string; websiteUrl: string; couponCode?: string }) {
  const { isSaved, toggleSaved, user } = useApp();
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [reportType, setReportType] = useState("Features");
  const [reportDetails, setReportDetails] = useState("");
  const [reportStatus, setReportStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
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

  async function submitReport(event: React.FormEvent) {
    event.preventDefault();
    if (!user) {
      setReportOpen(false);
      setLoginPromptOpen(true);
      return;
    }
    setReportStatus("sending");
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, issueType: reportType, details: reportDetails })
    });
    if (!response.ok) {
      setReportStatus("error");
      return;
    }
    setReportStatus("sent");
    setReportDetails("");
    window.setTimeout(() => {
      setReportOpen(false);
      setReportStatus("idle");
    }, 1400);
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
      <button
        className="report-link"
        onClick={() => {
          if (!user) {
            setLoginPromptOpen(true);
            return;
          }
          setReportOpen(true);
        }}
      >
        <Flag size={13} /> Report incorrect information
      </button>
      {loginPromptOpen && (
        <LoginPrompt
          title="Log in to report this listing"
          message="Reports are attached to your account so admins can track quality issues and follow up if needed."
          next={`/tools/${slug}`}
          close={() => setLoginPromptOpen(false)}
        />
      )}
      {reportOpen && (
        <div className="report-modal-backdrop">
          <form className="report-modal" onSubmit={submitReport}>
            <button type="button" className="modal-close" aria-label="Close report form" onClick={() => setReportOpen(false)}>×</button>
            <span className="kicker">Listing report</span>
            <h2>Report incorrect information</h2>
            <label>
              <span>What needs review?</span>
              <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
                <option>Pricing</option>
                <option>Features</option>
                <option>Availability</option>
                <option>Broken link</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              <span>Details</span>
              <textarea
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                value={reportDetails}
                onChange={(event) => setReportDetails(event.target.value)}
                placeholder="Tell us what is inaccurate and what the correct information should be."
              />
            </label>
            {reportStatus === "error" && <p className="form-error">Could not send the report. Please try again.</p>}
            {reportStatus === "sent" && <p className="report-success">Report sent to the admin queue.</p>}
            <button className="button button-dark" disabled={reportStatus === "sending" || reportStatus === "sent"}>
              {reportStatus === "sending" ? "Sending..." : "Send report"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
