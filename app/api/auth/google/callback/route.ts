import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, createSessionToken, getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureDatabaseUser } from "@/lib/db-user";
import { auditLog } from "@/lib/security";
import {
  GOOGLE_CONNECT_COOKIE,
  GOOGLE_NEXT_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  googleRedirectUri,
  safeNextPath
} from "@/lib/google-auth";
import { SessionUser } from "@/lib/types";

export const runtime = "nodejs";

type GoogleProfile = {
  sub?: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
};

function clearOAuthCookies(response: NextResponse) {
  for (const name of [GOOGLE_STATE_COOKIE, GOOGLE_VERIFIER_COOKIE, GOOGLE_NEXT_COOKIE, GOOGLE_CONNECT_COOKIE]) {
    response.cookies.set(name, "", { httpOnly: true, expires: new Date(0), path: "/" });
  }
}

function authError(request: NextRequest, error: string) {
  const response = NextResponse.redirect(new URL(`/login?authError=${error}`, request.url));
  clearOAuthCookies(response);
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(GOOGLE_STATE_COOKIE)?.value;
  const verifier = request.cookies.get(GOOGLE_VERIFIER_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState || !verifier) {
    return authError(request, "invalid_oauth_state");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return authError(request, "google_not_configured");

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: googleRedirectUri(request.url),
        grant_type: "authorization_code",
        code_verifier: verifier
      }),
      cache: "no-store"
    });
    if (!tokenResponse.ok) return authError(request, "google_token_failed");

    const tokens = await tokenResponse.json() as { access_token?: string };
    if (!tokens.access_token) return authError(request, "google_token_failed");

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: "no-store"
    });
    if (!profileResponse.ok) return authError(request, "google_profile_failed");

    const profile = await profileResponse.json() as GoogleProfile;
    if (!profile.sub || !profile.email || profile.email_verified !== true) {
      return authError(request, "google_email_unverified");
    }

    const destination = safeNextPath(request.cookies.get(GOOGLE_NEXT_COOKIE)?.value ?? null);
    const connect = request.cookies.get(GOOGLE_CONNECT_COOKIE)?.value === "1";
    const currentSession = await getSessionUser();

    if (connect) {
      if (!currentSession) return authError(request, "authentication_required");
      const currentUser = await db.user.findUnique({ where: { email: currentSession.email } });
      if (!currentUser || currentUser.status !== "Active") return authError(request, "authentication_required");
      const existingGoogleUser = await db.user.findFirst({
        where: { googleId: profile.sub, id: { not: currentUser.id } }
      });
      if (existingGoogleUser) return authError(request, "google_already_connected");
      if (profile.email.toLowerCase() !== currentUser.email.toLowerCase()) return authError(request, "google_email_mismatch");

      await db.user.update({
        where: { id: currentUser.id },
        data: { googleId: profile.sub }
      });
      await auditLog(request, {
        actor: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role as SessionUser["role"],
          status: currentUser.status
        },
        action: "SOCIAL_LOGIN_CONNECT",
        resourceType: "User",
        resourceId: currentUser.id
      });
      const response = NextResponse.redirect(new URL(`${destination}?social=google_connected`, request.url));
      clearOAuthCookies(response);
      return response;
    }

    const user: SessionUser = {
      id: `google:${profile.sub}`,
      name: profile.name?.trim() || profile.email.split("@")[0],
      email: profile.email,
      role: "USER"
    };
    const existing = await db.user.findFirst({ where: { OR: [{ googleId: profile.sub }, { email: profile.email }] } });
    if (existing) {
      if (existing.status !== "Active") return authError(request, "account_disabled");
      await db.user.update({ where: { id: existing.id }, data: { googleId: profile.sub, name: existing.name || user.name } });
      user.id = existing.id;
      user.name = existing.name;
      user.role = existing.role as SessionUser["role"];
    } else {
      await ensureDatabaseUser(user);
      await db.user.update({ where: { email: profile.email }, data: { googleId: profile.sub } });
    }
    const response = NextResponse.redirect(new URL(destination, request.url));
    response.cookies.set(COOKIE_NAME, createSessionToken(user), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
    clearOAuthCookies(response);
    return response;
  } catch {
    return authError(request, "google_request_failed");
  }
}
