"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";

export function RatingPanel({ rating, count, slug }: { rating: number; count: number; slug: string }) {
  const { user, loadingUser } = useApp();
  const [selected, setSelected] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);
  const [currentCount, setCurrentCount] = useState(count);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const displayedRating = selected || currentRating;

  useEffect(() => {
    if (!user) {
      setSelected(0);
      return;
    }

    let active = true;
    fetch(`/api/ratings?slug=${encodeURIComponent(slug)}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        if (active && typeof data.selected === "number") setSelected(data.selected);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [slug, user]);

  async function rate(score: number) {
    if (loadingUser) return;
    if (!user) {
      window.location.href = `/login?next=/tools/${slug}`;
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, score })
      });
      if (!response.ok) return;
      const data = await response.json();
      setSelected(data.selected);
      setCurrentRating(data.rating);
      setCurrentCount(data.count);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rating-panel">
      <div><strong>{displayedRating ? displayedRating.toFixed(1) : "—"}</strong><span>{[1,2,3,4,5].map((star) => <Star key={star} size={18} fill={star <= Math.round(displayedRating) ? "currentColor" : "none"} />)}</span><small>Based on {currentCount} ratings</small></div>
      <div><p>{selected ? "Your rating is saved." : "Have you used this tool?"}</p><span className="rate-stars">{[1,2,3,4,5].map((star) => <button key={star} type="button" onClick={() => rate(star)} disabled={loadingUser || isSubmitting} aria-label={`Rate ${star} stars`}><Star size={20} fill={star <= selected ? "currentColor" : "none"} /></button>)}</span></div>
    </div>
  );
}
