import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight, CircleCheck, ExternalLink, Star, X } from "lucide-react";
import { getPublishedTool, getPublishedTools } from "@/lib/catalog-store";
import { ToolActions } from "@/components/ToolActions";
import { ToolCard } from "@/components/ToolCard";
import { RatingPanel } from "@/components/RatingPanel";
import { ToolViewTracker } from "@/components/ToolViewTracker";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getPublishedTool(slug);
  return { title: tool?.name ?? "Tool", description: tool?.shortDescription };
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getPublishedTool(slug);
  if (!tool) notFound();
  const tools = await getPublishedTools();
  const related = tools.filter((item) => item.category === tool.category && item.id !== tool.id).slice(0, 3);

  return (
    <>
      <ToolViewTracker slug={tool.slug} />
      <section className="detail-header">
        <div className="container">
          <div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight size={13} /><Link href="/tools">Tools</Link><ChevronRight size={13} /><span>{tool.name}</span></div>
          <div className="detail-hero-grid">
            <div className="detail-main">
              <div className="tool-logo detail-logo" style={{ background: tool.logoColor }}>{tool.logoUrl ? <Image src={tool.logoUrl} alt={`${tool.name} logo`} fill sizes="76px" /> : <span style={{ color: tool.logoColor === "#f2ff5e" ? "#111" : "#fff" }}>{tool.logo}</span>}</div>
              <div>
                <div className="detail-title-line"><h1>{tool.name}</h1>{tool.verified && <span className="verified-label"><Check size={12} /> Verified</span>}{tool.featured && <span className="editors-label">Editor&apos;s pick</span>}</div>
                <p>{tool.shortDescription}</p>
                <div className="detail-meta"><span className="rating"><Star size={15} fill="currentColor" /> {tool.rating} <small>({tool.ratingCount} ratings)</small></span><i /><Link href={`/tools?category=${encodeURIComponent(tool.category)}`}>{tool.category}</Link><i /><span>Updated {new Date(tool.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div>
              </div>
            </div>
            <ToolActions slug={tool.slug} websiteUrl={tool.affiliateUrl || tool.websiteUrl} couponCode={tool.couponCode} />
          </div>
        </div>
      </section>

      <section className="detail-body">
        <div className="container detail-layout">
          <article className="detail-content">
            {tool.screenshots?.length ? <div className="tool-screenshot-gallery">
              {tool.screenshots.map((url, index) => <figure className={index === 0 ? "featured-shot" : ""} key={url}><Image src={url} alt={`${tool.name} screenshot ${index + 1}`} fill sizes={index === 0 ? "(max-width: 900px) 100vw, 760px" : "(max-width: 900px) 50vw, 370px"} /></figure>)}
            </div> : <div className="screenshot-placeholder">
              <div className="mock-browser-bar"><span>● ● ●</span><div>{tool.websiteUrl.replace("https://", "")}</div></div>
              <div className="mock-product">
                <aside><div className="mock-brand" style={{ background: tool.logoColor }}>{tool.logo}</div>{[1,2,3,4,5].map((item) => <span key={item} />)}</aside>
                <main><div className="mock-heading" /><div className="mock-subheading" /><div className="mock-cards">{[1,2,3].map((item) => <div key={item}><i /><span /></div>)}</div><div className="mock-table">{[1,2,3,4].map((item) => <span key={item} />)}</div></main>
              </div>
            </div>}

            <section className="content-section"><h2>What is {tool.name}?</h2><p>{tool.fullDescription}</p></section>
            <section className="content-section"><h2>What can you do with it?</h2><div className="use-case-grid">{tool.useCases.map((item) => <div key={item}><CircleCheck size={17} /><span>{item}</span></div>)}</div></section>
            <section className="content-section"><h2>Key features</h2><div className="feature-list">{tool.features.map((feature, index) => <div key={feature}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{feature}</strong><p>{["Work faster with a focused experience designed around the task.", "Keep your team aligned with shared, up-to-date information.", "Connect the tools you already use and reduce repetitive work.", "Scale from your first project to a more advanced workflow."][index % 4]}</p></div></div>)}</div></section>
            <section className="content-section"><h2>Pros and cons</h2><div className="pros-cons"><div><h3>What users like</h3>{tool.pros.map((item) => <p key={item}><Check size={15} />{item}</p>)}</div><div><h3>What to consider</h3>{tool.cons.map((item) => <p key={item}><X size={15} />{item}</p>)}</div></div></section>
            <section className="content-section"><h2>Community rating</h2><RatingPanel rating={tool.rating} count={tool.ratingCount} slug={tool.slug} /></section>
          </article>

          <aside className="detail-sidebar">
            <div className="info-card">
              <h3>At a glance</h3>
              <dl>
                <div><dt>Pricing</dt><dd><span className="price-label">{tool.pricingType}</span></dd></div>
                <div><dt>Starts at</dt><dd>{tool.startingPrice}</dd></div>
                <div><dt>Free trial</dt><dd>{tool.freeTrial ? "Yes" : "No"}</dd></div>
                <div><dt>Best for</dt><dd>{tool.bestFor}</dd></div>
                <div><dt>Platforms</dt><dd className="platform-list">{tool.platforms.map((item) => <span key={item}>{item}</span>)}</dd></div>
              </dl>
            </div>
            {tool.discount && <div className="sidebar-deal"><span>Exclusive deal</span><h3>{tool.discount}</h3>{tool.couponCode && <code>{tool.couponCode}</code>}<a href={tool.affiliateUrl || tool.websiteUrl}>Claim this offer <ExternalLink size={14} /></a></div>}
            <div className="info-card"><h3>Tags</h3><div className="sidebar-tags">{tool.tags.map((tag) => <Link href={`/tools?q=${tag}`} key={tag}>{tag}</Link>)}</div></div>
          </aside>
        </div>
      </section>

      <section className="section related-section">
        <div className="container">
          <div className="section-heading compact-heading"><div><span className="kicker">Similar picks</span><h2>More tools like {tool.name}.</h2></div><Link href={`/tools?category=${encodeURIComponent(tool.category)}`} className="arrow-link">See all in {tool.category}</Link></div>
          <div className="related-grid">{related.map((item) => <ToolCard tool={item} key={item.id} compact />)}</div>
        </div>
      </section>
    </>
  );
}
