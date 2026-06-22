import { createHash, randomBytes } from "crypto";

export const GOOGLE_STATE_COOKIE = "voltbean_google_state";
export const GOOGLE_VERIFIER_COOKIE = "voltbean_google_verifier";
export const GOOGLE_NEXT_COOKIE = "voltbean_google_next";

export function randomUrlSafeValue(size = 32) {
  return randomBytes(size).toString("base64url");
}

export function createCodeChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export function googleRedirectUri(requestUrl: string) {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  return `${new URL(requestUrl).origin}/api/auth/google/callback`;
}

export const oauthCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 10
};
