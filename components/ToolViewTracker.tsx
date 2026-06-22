"use client";

import { useEffect } from "react";

export function ToolViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, type: "VIEW" })
    });
  }, [slug]);
  return null;
}
