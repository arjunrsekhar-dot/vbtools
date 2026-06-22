"use client";

import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { UserRole } from "@/lib/types";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const params = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<UserRole | "form" | null>(null);
  const isLogin = mode === "login";
  const authError = params.get("authError");
  const googleHref = `/api/auth/google?next=${encodeURIComponent(params.get("next") || "/dashboard")}`;

  async function signIn(role: UserRole) {
    setLoading(role);
    const response = await fetch("/api/auth/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
    if (response.ok) {
      const fallback = role === "ADMIN" ? "/admin" : role === "DEVELOPER" ? "/developer" : "/dashboard";
      window.location.href = params.get("next") || fallback;
    } else setLoading(null);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setLoading("form");
    signIn(mode === "register" ? "USER" : "USER");
  }

  return (
    <div className="auth-card">
      <div className="auth-heading">
        <span className="auth-icon"><LockKeyhole size={20} /></span>
        <h1>{isLogin ? "Welcome back." : "Create your account."}</h1>
        <p>{isLogin ? "Log in to save tools, leave ratings, and keep your shortlist close." : "Join Voltbean to save, compare, and discover better tools."}</p>
      </div>
      <a className="social-auth" href={googleHref}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17">
          <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
          <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.42l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.6-4.12H3.06v2.62A10 10 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.4 13.88A6 6 0 0 1 6.09 12c0-.65.11-1.29.31-1.88V7.5H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.5l3.34-2.62Z" />
          <path fill="#EA4335" d="M12 6c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.34 2.62C7.2 7.76 9.4 6 12 6Z" />
        </svg>
        Continue with Google
      </a>
      {authError && (
        <p className="auth-error" role="alert">
          {authError === "google_not_configured"
            ? "Google sign-in has not been configured yet."
            : "Google sign-in could not be completed. Please try again."}
        </p>
      )}
      <div className="auth-divider"><span>or continue with email</span></div>
      <form className="auth-form" onSubmit={submit}>
        {!isLogin && <label><span>Full name</span><input required placeholder="Your name" /></label>}
        <label><span>Email address</span><div className="input-icon"><Mail size={16} /><input type="email" required placeholder="you@company.com" /></div></label>
        <label><span>Password</span><div className="input-icon"><LockKeyhole size={16} /><input type={showPassword ? "text" : "password"} required minLength={8} placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
        {isLogin ? <div className="form-between"><label className="tiny-check"><input type="checkbox" /> Remember me</label><Link href="#">Forgot password?</Link></div> : <label className="tiny-check"><input type="checkbox" required /> I agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</label>}
        <button className="button button-dark auth-submit" disabled={Boolean(loading)}>{loading === "form" ? "One moment…" : isLogin ? "Log in" : "Create account"} <ArrowRight size={16} /></button>
      </form>
      <p className="auth-switch">{isLogin ? "New to Voltbean?" : "Already have an account?"} <Link href={isLogin ? "/register" : "/login"}>{isLogin ? "Create an account" : "Log in"}</Link></p>
      {isLogin && (
        <div className="demo-access">
          <span>Interactive demo access</span>
          <div>
            {(["USER", "DEVELOPER", "ADMIN"] as UserRole[]).map((role) => <button key={role} onClick={() => signIn(role)} disabled={Boolean(loading)}><Check size={12} /> {role === "USER" ? "User" : role.charAt(0) + role.slice(1).toLowerCase()}</button>)}
          </div>
        </div>
      )}
    </div>
  );
}
