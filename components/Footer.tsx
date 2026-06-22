import Link from "next/link";
import { ArrowUpRight, Instagram, Linkedin, Twitter } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p>Find better software. Do your best work.</p>
            <div className="social-row">
              <a href="#" aria-label="Twitter"><Twitter size={17} /></a>
              <a href="#" aria-label="LinkedIn"><Linkedin size={17} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={17} /></a>
            </div>
          </div>
          <div className="footer-links">
            <div>
              <strong>Explore</strong>
              <Link href="/tools">All tools</Link>
              <Link href="/categories">Categories</Link>
              <Link href="/deals">Deals</Link>
              <Link href="/tools?sort=newest">New arrivals</Link>
            </div>
            <div>
              <strong>For makers</strong>
              <Link href="/submit">Submit a tool</Link>
              <Link href="/developer">Developer portal</Link>
              <Link href="/about">About us</Link>
              <Link href="/contact">Contact</Link>
            </div>
            <div>
              <strong>Popular</strong>
              <Link href="/tools?category=AI+%26+Writing">AI tools</Link>
              <Link href="/tools?category=Marketing">Marketing</Link>
              <Link href="/tools?category=Developer+Tools">Developer tools</Link>
              <Link href="/tools?category=Productivity">Productivity</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Voltbean Tools. Curated with care.</span>
          <div>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href="mailto:hello@voltbean.tools">hello@voltbean.tools <ArrowUpRight size={13} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
