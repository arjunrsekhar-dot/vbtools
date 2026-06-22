import { BadgeCheck, BarChart3, SearchCheck } from "lucide-react";
import { SubmitToolForm } from "@/components/SubmitToolForm";

export default function SubmitPage() {
  return (
    <>
      <section className="submit-hero"><div className="container submit-hero-grid"><div><span className="kicker">For founders and makers</span><h1>Get your tool<br />discovered.</h1><p>Share what you&apos;ve built with people actively searching for a better way to work.</p></div><div className="submit-perks"><div><SearchCheck /><span><strong>High-intent discovery</strong><small>Reach visitors searching by the problem your product solves.</small></span></div><div><BadgeCheck /><span><strong>Verified credibility</strong><small>Complete, accurate listings earn a trusted badge.</small></span></div><div><BarChart3 /><span><strong>Useful performance data</strong><small>Understand views, saves, clicks, and ratings.</small></span></div></div></div></section>
      <section className="submit-section"><div className="container submit-layout"><div><div className="submit-title"><span>Tool submission</span><h2>Give us the good stuff.</h2><p>Fields marked with * are required. You can save a draft after signing in.</p></div><SubmitToolForm /></div><aside className="submit-sidebar"><div><strong>What happens next?</strong><ol><li><span>1</span>We review your listing</li><li><span>2</span>You get an email with feedback</li><li><span>3</span>Your tool goes live</li></ol></div><div><strong>Review guidelines</strong><p>We list working, original products with clear public information. Thin affiliate pages, unsafe products, and duplicate submissions are declined.</p></div><small>Typical review time<br /><strong>2–3 business days</strong></small></aside></div></section>
    </>
  );
}
