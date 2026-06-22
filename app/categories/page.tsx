import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categories, tools } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";

export default function CategoriesPage() {
  return (
    <>
      <section className="simple-hero"><div className="container"><span className="kicker">Browse by category</span><h1>Every kind of tool,<br />neatly sorted.</h1><p>Start with the area you want to improve and explore the standouts.</p></div></section>
      <section className="section"><div className="container"><div className="category-grid category-page-grid">{categories.map((category) => <Link href={`/tools?category=${encodeURIComponent(category.name)}`} className="category-card category-card-large" key={category.slug}><span className="category-icon" style={{ background: `${category.color}18`, color: category.color }}><CategoryIcon name={category.icon} size={25} /></span><span className="category-meta"><strong>{category.name}</strong><small>{category.description}</small></span><span className="category-count">{category.count} tools</span><ArrowRight className="category-arrow" size={18} /></Link>)}</div></div></section>
      <section className="section section-tint"><div className="container"><div className="section-heading compact-heading"><div><span className="kicker">Community favorites</span><h2>Top rated across every category.</h2></div><Link className="arrow-link" href="/tools?sort=rating">View top rated</Link></div><div className="tool-grid">{[...tools].sort((a,b) => b.rating-a.rating).slice(0,4).map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div></div></section>
    </>
  );
}
