import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return <section className="auth-page"><div className="auth-art"><div className="auth-quote"><span>“</span><blockquote>Voltbean has become my favorite way to find tools I didn&apos;t know I needed.</blockquote><p>— Lena Ortiz, product designer</p></div></div><Suspense><AuthForm mode="login" /></Suspense></section>;
}
