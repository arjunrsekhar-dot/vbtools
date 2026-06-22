import Link from "next/link";
import { ArrowRight, Copy, ShieldCheck, Sparkles, TicketPercent } from "lucide-react";
import { tools } from "@/lib/tools";

export default function DealsPage() {
  const deals = tools.filter((tool) => tool.discount);
  return (
    <>
      <section className="deals-hero"><div className="container"><span className="deal-hero-icon"><TicketPercent /></span><span className="kicker kicker-light">Hand-verified software deals</span><h1>Do more. Spend less.</h1><p>Actually useful offers on tools we&apos;d recommend without the discount.</p><div className="deals-trust"><span><ShieldCheck /> Checked by our team</span><span><Sparkles /> Updated weekly</span></div></div></section>
      <section className="section"><div className="container"><div className="section-heading compact-heading"><div><span className="kicker">Live offers</span><h2>{deals.length} deals worth grabbing.</h2></div></div><div className="deals-page-grid">{deals.map((tool) => <article className="deal-page-card" key={tool.id}><div className="deal-page-top"><div className="tool-logo" style={{ background: tool.logoColor }}><span>{tool.logo}</span></div><span>{tool.category}</span></div><h2>{tool.name}</h2><p>{tool.shortDescription}</p><div className="deal-highlight">{tool.discount}</div>{tool.couponCode && <div className="coupon-box"><code>{tool.couponCode}</code><Copy size={15} /></div>}<Link href={`/tools/${tool.slug}`}>View deal details <ArrowRight size={15} /></Link></article>)}</div></div></section>
    </>
  );
}
