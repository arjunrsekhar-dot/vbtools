import Link from "next/link";
import {
  ArrowRight, BadgeCheck, CheckCircle2, ChevronRight, MousePointerClick,
  SearchCheck, Send, Sparkles, Star, UsersRound
} from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { SearchBox } from "@/components/SearchBox";
import { ToolCard } from "@/components/ToolCard";
import { ToolLogo } from "@/components/ToolLogo";
import { categories } from "@/lib/tools";
import { getPublishedTools } from "@/lib/catalog-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tools = await getPublishedTools();
  const featured = tools.filter((tool) => tool.featured).slice(0, 4);
  const latest = [...tools].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const deals = tools.filter((tool) => tool.discount).slice(0, 3);
  const categoryCounts = new Map(categories.map((category) => [
    category.name,
    tools.filter((tool) => tool.category === category.name).length
  ]));

  return (
    <>
      <section className="hero">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="container hero-inner">
          <div className="eyebrow-pill"><Sparkles size={14} /> Discover 500+ handpicked tools</div>
          <h1>Find the right tool<br />for <span>any problem.</span></h1>
          <p className="hero-copy">Tell us what you need to do. We&apos;ll cut through the noise and surface the software that actually fits.</p>
          <SearchBox large />
          <div className="search-suggestions">
            <span>Try:</span>
            <Link href="/tools?q=send+bulk+emails">send bulk emails</Link>
            <Link href="/tools?q=manage+customers">manage customers</Link>
            <Link href="/tools?q=build+website">build a website</Link>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack">
              {["M", "J", "A", "S"].map((letter, index) => <span key={letter} className={`proof-avatar proof-${index}`}>{letter}</span>)}
            </div>
            <div><strong>Trusted by 18,000+ curious builders</strong><span><Star size={13} fill="currentColor" /> 4.9 average community rating</span></div>
          </div>
        </div>
        <div className="floating-card floating-card-left">
          <div className="mini-logo purple">N</div>
          <div><strong>Notion</strong><span>Team workspace</span></div>
          <CheckCircle2 size={18} />
        </div>
        <div className="floating-card floating-card-right">
          <SearchCheck size={21} />
          <div><strong>Perfect match</strong><span>12 tools found</span></div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-strip-inner">
          <span>Built for modern teams at</span>
          <div className="trust-logo">◇ Loom</div>
          <div className="trust-logo">▲ vercel</div>
          <div className="trust-logo">◈ linear</div>
          <div className="trust-logo">✦ raycast</div>
          <div className="trust-logo">⌁ webflow</div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div><span className="kicker">Explore by category</span><h2>Whatever you&apos;re solving,<br />start here.</h2></div>
            <Link href="/categories" className="arrow-link">View all categories <ArrowRight size={18} /></Link>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link href={`/tools?category=${encodeURIComponent(category.name)}`} className="category-card" key={category.slug}>
                <span className="category-icon" style={{ background: `${category.color}18`, color: category.color }}>
                  <CategoryIcon name={category.icon} />
                </span>
                <span className="category-meta">
                  <strong>{category.name}</strong>
                  <small>{category.description}</small>
                </span>
                <span className="category-count">{categoryCounts.get(category.name) || 0}</span>
                <ChevronRight size={18} className="category-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="section-heading">
            <div><span className="kicker">Editor&apos;s shortlist</span><h2>Tools worth knowing.</h2><p>Standout products chosen for quality, usefulness, and a genuinely good experience.</p></div>
            <Link href="/tools?featured=true" className="arrow-link">See all featured <ArrowRight size={18} /></Link>
          </div>
          <div className="tool-grid">
            {featured.map((tool) => <ToolCard tool={tool} key={tool.id} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading compact-heading">
            <div><span className="kicker">Fresh finds</span><h2>New to Voltbean.</h2></div>
            <Link href="/tools?sort=newest" className="arrow-link">Browse new arrivals <ArrowRight size={18} /></Link>
          </div>
          <div className="tool-grid">
            {latest.map((tool) => <ToolCard tool={tool} key={tool.id} />)}
          </div>
        </div>
      </section>

      <section className="section deals-section">
        <div className="container deals-shell">
          <div className="deal-intro">
            <span className="kicker kicker-light">Member-only savings</span>
            <h2>Great tools.<br /><em>Better prices.</em></h2>
            <p>Hand-verified deals on software we&apos;d recommend anyway. No dusty coupon codes.</p>
            <Link href="/deals" className="button button-lime">Browse all deals <ArrowRight size={17} /></Link>
          </div>
          <div className="deal-list">
            {deals.map((tool) => (
              <Link href={`/tools/${tool.slug}`} className="deal-card" key={tool.id}>
                <ToolLogo name={tool.name} logo={tool.logo} logoColor={tool.logoColor} logoUrl={tool.logoUrl} className="small" />
                <div className="deal-copy">
                  <div><strong>{tool.name}</strong><span>{tool.category}</span></div>
                  <p>{tool.discount}</p>
                </div>
                {tool.couponCode && <span className="coupon-chip">{tool.couponCode}</span>}
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section how-section">
        <div className="container">
          <div className="section-heading centered-heading">
            <div><span className="kicker">Less searching, more doing</span><h2>From problem to perfect fit.</h2><p>We make software discovery feel surprisingly simple.</p></div>
          </div>
          <div className="steps-grid">
            <div className="step-card"><span>01</span><SearchCheck /><h3>Describe your problem</h3><p>Search naturally, like “I need to organize customer feedback.”</p></div>
            <div className="step-line" />
            <div className="step-card"><span>02</span><BadgeCheck /><h3>Compare real options</h3><p>Filter by pricing, platform, use case, ratings, and more.</p></div>
            <div className="step-line" />
            <div className="step-card"><span>03</span><MousePointerClick /><h3>Pick with confidence</h3><p>Read the useful bits, save your shortlist, and get moving.</p></div>
          </div>
        </div>
      </section>

      <section className="section maker-section">
        <div className="container maker-card">
          <div className="maker-art" aria-hidden="true">
            <div className="maker-ring ring-one" />
            <div className="maker-ring ring-two" />
            <div className="maker-window">
              <span className="window-dots">● ● ●</span>
              <div className="window-line long" /><div className="window-line" />
              <div className="window-stats"><span /><span /><span /></div>
            </div>
          </div>
          <div className="maker-copy">
            <span className="kicker kicker-light">Built something brilliant?</span>
            <h2>Put your tool in front of people looking for it.</h2>
            <p>Join independent makers and established teams getting discovered by thousands of motivated buyers every month.</p>
            <div className="maker-benefits"><span><UsersRound /> Reach the right audience</span><span><BadgeCheck /> Earn a verified badge</span></div>
            <Link href="/submit" className="button button-lime">Submit your tool <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="newsletter">
        <div className="container newsletter-inner">
          <div><span className="newsletter-icon"><Send size={21} /></span><div><h2>Good tools, delivered.</h2><p>A short weekly note with the best new finds. No noise, ever.</p></div></div>
          <form className="newsletter-form"><input type="email" placeholder="you@company.com" aria-label="Email address" /><button>Join 12,000+ readers <ArrowRight size={16} /></button></form>
        </div>
      </section>
    </>
  );
}
