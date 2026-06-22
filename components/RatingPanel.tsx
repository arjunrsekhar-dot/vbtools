"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";

export function RatingPanel({ rating, count, slug }: { rating: number; count: number; slug: string }) {
  const { user } = useApp();
  const [selected, setSelected] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);
  const [currentCount, setCurrentCount] = useState(count);

  async function rate(score: number) {
    if (!user) {
      window.location.href = `/login?next=/tools/${slug}`;
      return;
    }
    const response = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, score })
    });
    if (!response.ok) return;
    const data = await response.json();
    setSelected(score);
    setCurrentRating(data.rating);
    setCurrentCount(data.count);
  }

  return (
    <div className="rating-panel">
      <div><strong>{selected || currentRating}</strong><span>{[1,2,3,4,5].map((star) => <Star key={star} size={18} fill={star <= Math.round(selected || currentRating) ? "currentColor" : "none"} />)}</span><small>Based on {currentCount} ratings</small></div>
      <div><p>{selected ? "Thanks — your rating is in!" : "Have you used this tool?"}</p><span className="rate-stars">{[1,2,3,4,5].map((star) => <button key={star} onClick={() => rate(star)} aria-label={`Rate ${star} stars`}><Star size={20} fill={star <= selected ? "currentColor" : "none"} /></button>)}</span></div>
    </div>
  );
}
