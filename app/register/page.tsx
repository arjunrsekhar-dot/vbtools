import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return <section className="auth-page"><div className="auth-art register-art"><div className="auth-quote"><span>✦</span><blockquote>Your next favorite tool is probably three clicks away.</blockquote><p>Join 18,000+ builders, makers, and curious teams.</p></div></div><Suspense><AuthForm mode="register" /></Suspense></section>;
}
