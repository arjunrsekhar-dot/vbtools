import { NextResponse } from "next/server";
import {
  createCodeChallenge,
  GOOGLE_NEXT_COOKIE,
  GOOGLE_CONNECT_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  googleRedirectUri,
  oauthCookieOptions,
  randomUrlSafeValue,
  safeNextPath
} from "@/lib/google-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/login?authError=google_not_configured", request.url));
  }

  const state = randomUrlSafeValue();
  const verifier = randomUrlSafeValue(64);
  const requestUrl = new URL(request.url);
  const connect = requestUrl.searchParams.get("connect") === "google";
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", googleRedirectUri(request.url));
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid email profile");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("code_challenge", createCodeChallenge(verifier));
  authorizationUrl.searchParams.set("code_challenge_method", "S256");
  authorizationUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(GOOGLE_STATE_COOKIE, state, oauthCookieOptions);
  response.cookies.set(GOOGLE_VERIFIER_COOKIE, verifier, oauthCookieOptions);
  response.cookies.set(GOOGLE_NEXT_COOKIE, safeNextPath(requestUrl.searchParams.get("next")), oauthCookieOptions);
  response.cookies.set(GOOGLE_CONNECT_COOKIE, connect ? "1" : "", oauthCookieOptions);
  return response;
}
