"use client";

import { Check, KeyRound, Link2, Mail, ShieldCheck, Unlink } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { SessionUser } from "@/lib/types";

type AccountState = {
  user: {
    name: string;
    email: string;
    role: string;
    hasPassword: boolean;
    googleConnected: boolean;
  };
};

export function AccountSettings({ user }: { user: SessionUser }) {
  const [account, setAccount] = useState<AccountState["user"] | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [requestId, setRequestId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  useEffect(() => {
    fetch("/api/account/settings")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: AccountState) => setAccount(data.user))
      .catch(() => setError("Could not load account settings."));
  }, []);

  async function requestPasswordChange(event: FormEvent) {
    event.preventDefault();
    setLoading("password-request");
    setError("");
    setMessage("");
    const response = await fetch("/api/account/password/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await response.json() as { error?: string; requestId?: string; devCode?: string };
    setLoading("");
    if (!response.ok || !data.requestId) {
      setError(data.error || "Could not start password change.");
      return;
    }
    setRequestId(data.requestId);
    setMessage(data.devCode ? `Confirmation code: ${data.devCode}` : "Check your email for the confirmation code.");
  }

  async function confirmPasswordChange(event: FormEvent) {
    event.preventDefault();
    setLoading("password-confirm");
    setError("");
    const response = await fetch("/api/account/password/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, code })
    });
    const data = await response.json() as { error?: string };
    setLoading("");
    if (!response.ok) {
      setError(data.error || "Could not confirm password change.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setCode("");
    setRequestId("");
    setAccount((current) => current ? { ...current, hasPassword: true } : current);
    setMessage("Password changed.");
  }

  async function disconnectGoogle() {
    setLoading("google-disconnect");
    setError("");
    const response = await fetch("/api/account/social/google", { method: "DELETE" });
    const data = await response.json() as { error?: string; googleConnected?: boolean };
    setLoading("");
    if (!response.ok) {
      setError(data.error || "Could not disconnect Google.");
      return;
    }
    setAccount((current) => current ? { ...current, googleConnected: Boolean(data.googleConnected) } : current);
    setMessage("Google sign-in disconnected.");
  }

  const googleConnectHref = `/api/auth/google?next=${encodeURIComponent("/dashboard/settings")}&connect=google`;

  return (
    <div className="settings-stack">
      <div className="dashboard-panel settings-panel">
        <div className="panel-heading"><div><h2>Profile</h2><p>Your primary account identity.</p></div></div>
        <form>
          <label><span>Name</span><input value={account?.name || user.name} readOnly /></label>
          <label><span>Email</span><input value={account?.email || user.email} type="email" readOnly /></label>
          <label><span>Role</span><input value={(account?.role || user.role).toLowerCase()} readOnly /></label>
        </form>
      </div>

      <div className="dashboard-panel settings-panel">
        <div className="panel-heading"><div><h2>Password</h2><p>Changing your password requires a code sent to your account email.</p></div><span><KeyRound size={17} /></span></div>
        <form onSubmit={requestPasswordChange}>
          {account?.hasPassword && <label><span>Current password</span><input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>}
          <label><span>New password</span><input type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
          <button className="button button-dark" disabled={loading === "password-request"}>{loading === "password-request" ? "Sending code..." : "Send confirmation code"} <Mail size={15} /></button>
        </form>
        {requestId && (
          <form onSubmit={confirmPasswordChange}>
            <label><span>Email confirmation code</span><input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} required /></label>
            <button className="button button-dark" disabled={loading === "password-confirm"}>{loading === "password-confirm" ? "Confirming..." : "Confirm password change"} <Check size={15} /></button>
          </form>
        )}
      </div>

      <div className="dashboard-panel settings-panel">
        <div className="panel-heading"><div><h2>Social login</h2><p>Connect Google sign-in to this account.</p></div><span><ShieldCheck size={17} /></span></div>
        <div className="settings-social-row">
          <div><strong>Google</strong><small>{account?.googleConnected ? "Connected" : "Not connected"}</small></div>
          {account?.googleConnected
            ? <button className="button button-outline" onClick={disconnectGoogle} disabled={loading === "google-disconnect"}><Unlink size={15} /> Disconnect</button>
            : <a className="button button-dark" href={googleConnectHref}><Link2 size={15} /> Connect Google</a>}
        </div>
      </div>

      {message && <p className="settings-message" role="status">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
