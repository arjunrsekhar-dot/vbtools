import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, createSessionToken } from "@/lib/auth";
import {
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
  for (const name of [GOOGLE_STATE_COOKIE, GOOGLE_VERIFIER_COOKIE, GOOGLE_NEXT_COOKIE]) {
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

    const user: SessionUser = {
      id: `google:${profile.sub}`,
      name: profile.name?.trim() || profile.email.split("@")[0],
      email: profile.email,
      role: "USER"
    };
    const destination = safeNextPath(request.cookies.get(GOOGLE_NEXT_COOKIE)?.value ?? null);
    const response = NextResponse.redirect(new URL(destination, request.url));
    response.cookies.set(COOKIE_NAME, createSessionToken(user), {
      httpOnly: true,
      sameSite: "lax",
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
