"use client";

import Link from "next/link";

export function LoginPrompt({
  title,
  message,
  next,
  close
}: {
  title: string;
  message: string;
  next: string;
  close: () => void;
}) {
  const loginHref = `/login?next=${encodeURIComponent(next)}`;
  const registerHref = `/register?next=${encodeURIComponent(next)}`;

  return (
    <div className="report-modal-backdrop">
      <div className="report-modal login-prompt-modal" role="dialog" aria-modal="true" aria-labelledby="login-prompt-title">
        <button type="button" className="modal-close" aria-label="Close login prompt" onClick={close}>×</button>
        <span className="kicker">Sign in required</span>
        <h2 id="login-prompt-title">{title}</h2>
        <p>{message}</p>
        <div className="login-prompt-actions">
          <Link className="button button-dark" href={loginHref}>Log in</Link>
          <Link className="button button-outline" href={registerHref}>Create account</Link>
        </div>
      </div>
    </div>
  );
}
