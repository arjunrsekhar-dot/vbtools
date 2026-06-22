"use client";

import { Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchBox({ initial = "", large = false }: { initial?: string; large?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState(initial);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (query.trim()) router.push(`/tools?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form className={`search-box ${large ? "search-box-large" : ""}`} onSubmit={submit}>
      <Search size={large ? 22 : 19} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="What do you need help with?"
        aria-label="Search tools"
      />
      {large && <span className="intent-pill"><Sparkles size={13} /> Smart search</span>}
      <button type="submit">Search</button>
    </form>
  );
}
