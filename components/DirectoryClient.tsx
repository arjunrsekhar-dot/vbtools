"use client";

import { categories, searchTools } from "@/lib/tools";
import { Tool } from "@/lib/types";
import { ToolCard } from "@/components/ToolCard";
import { SearchBox } from "@/components/SearchBox";
import { ChevronDown, Filter, LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  initialQuery?: string;
  initialCategory?: string;
  featuredOnly?: boolean;
  initialSort?: string;
  tools: Tool[];
};

export function DirectoryClient({ initialQuery = "", initialCategory = "", featuredOnly = false, initialSort = "popular", tools }: Props) {
  const [category, setCategory] = useState(initialCategory);
  const [pricing, setPricing] = useState<string[]>([]);
  const [platform, setPlatform] = useState("");
  const [freeTrial, setFreeTrial] = useState(false);
  const [sort, setSort] = useState(initialSort);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const result = useMemo(() => {
    let filtered = searchTools(initialQuery, tools);
    if (featuredOnly) filtered = filtered.filter((tool) => tool.featured);
    if (category) filtered = filtered.filter((tool) => tool.category === category);
    if (pricing.length) filtered = filtered.filter((tool) => pricing.includes(tool.pricingType));
    if (platform) filtered = filtered.filter((tool) => tool.platforms.includes(platform as never));
    if (freeTrial) filtered = filtered.filter((tool) => tool.freeTrial);
    return [...filtered].sort((a, b) => {
      if (initialQuery && sort === "popular") return 0;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "newest") return b.updatedAt.localeCompare(a.updatedAt);
      if (sort === "name") return a.name.localeCompare(b.name);
      return (b.views + b.saves * 3) - (a.views + a.saves * 3);
    });
  }, [initialQuery, featuredOnly, category, pricing, platform, freeTrial, sort, tools]);

  function togglePricing(value: string) {
    setPricing((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  const activeFilterCount = Number(Boolean(category)) + pricing.length + Number(Boolean(platform)) + Number(freeTrial);

  const filterContent = (
    <>
      <div className="filter-heading">
        <strong><SlidersHorizontal size={16} /> Filters</strong>
        {activeFilterCount > 0 && <button onClick={() => { setCategory(""); setPricing([]); setPlatform(""); setFreeTrial(false); }}>Clear all</button>}
      </div>
      <div className="filter-group">
        <h3>Category</h3>
        <label className="radio-row"><input type="radio" name="category" checked={!category} onChange={() => setCategory("")} /><span>All categories</span><small>{tools.length}</small></label>
        {categories.map((item) => (
          <label className="radio-row" key={item.slug}>
            <input type="radio" name="category" checked={category === item.name} onChange={() => setCategory(item.name)} />
            <span>{item.name}</span><small>{tools.filter((tool) => tool.category === item.name).length}</small>
          </label>
        ))}
      </div>
      <div className="filter-group">
        <h3>Pricing</h3>
        {["Free", "Freemium", "Paid", "Open Source"].map((item) => (
          <label className="check-row" key={item}><input type="checkbox" checked={pricing.includes(item)} onChange={() => togglePricing(item)} /><span>{item}</span></label>
        ))}
      </div>
      <div className="filter-group">
        <h3>Platform</h3>
        <div className="select-wrap"><select value={platform} onChange={(event) => setPlatform(event.target.value)}><option value="">Any platform</option><option>Web</option><option>Windows</option><option>macOS</option><option>Linux</option><option>Android</option><option>iOS</option><option>API</option></select><ChevronDown size={15} /></div>
      </div>
      <label className="toggle-row"><span><strong>Free trial</strong><small>Try before you pay</small></span><input type="checkbox" checked={freeTrial} onChange={(event) => setFreeTrial(event.target.checked)} /><i /></label>
    </>
  );

  return (
    <>
      <section className="directory-hero">
        <div className="container">
          <span className="kicker">Explore the directory</span>
          <h1>{initialQuery ? <>Results for “{initialQuery}”</> : "Find your next favorite tool."}</h1>
          <p>Browse thoughtful software picks, compare the details that matter, and build a stack you&apos;ll enjoy using.</p>
          <SearchBox initial={initialQuery} />
        </div>
      </section>
      <section className="directory-section">
        <div className="container directory-layout">
          <aside className={`filter-sidebar ${mobileFilters ? "mobile-visible" : ""}`}>
            <button className="close-filters" onClick={() => setMobileFilters(false)}><X /></button>
            {filterContent}
          </aside>
          <div className="directory-results">
            <div className="results-toolbar">
              <div><strong>{result.length} tools</strong><span>{activeFilterCount ? ` · ${activeFilterCount} filters applied` : " handpicked for you"}</span></div>
              <div className="toolbar-actions">
                <button className="mobile-filter-trigger" onClick={() => setMobileFilters(true)}><Filter size={16} /> Filters {activeFilterCount > 0 && <b>{activeFilterCount}</b>}</button>
                <div className="select-wrap sort-select"><span>Sort:</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">Most popular</option><option value="rating">Top rated</option><option value="newest">Newest</option><option value="name">Name A–Z</option></select><ChevronDown size={14} /></div>
                <div className="view-buttons" aria-label="Choose results layout">
                  <button
                    type="button"
                    className={viewMode === "grid" ? "active" : ""}
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    type="button"
                    className={viewMode === "list" ? "active" : ""}
                    aria-label="List view"
                    aria-pressed={viewMode === "list"}
                    onClick={() => setViewMode("list")}
                  >
                    <List size={17} />
                  </button>
                </div>
              </div>
            </div>
            {result.length > 0 ? (
              <div className={`directory-grid ${viewMode === "list" ? "list-view" : "grid-view"}`}>{result.map((tool) => <ToolCard tool={tool} key={tool.id} />)}</div>
            ) : (
              <div className="empty-state"><span>◎</span><h2>No exact matches yet</h2><p>Try removing a filter or describing the task in a different way.</p><button className="button button-dark" onClick={() => { setCategory(""); setPricing([]); setPlatform(""); setFreeTrial(false); }}>Reset filters</button></div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
