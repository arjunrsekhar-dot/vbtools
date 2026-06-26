import { NextResponse } from "next/server";
import { z } from "zod";
import { COOKIE_NAME, createSessionToken, demoUsers } from "@/lib/auth";
import { assertSameOrigin, jsonError, rateLimit } from "@/lib/security";

const schema = z.object({ role: z.enum(["USER", "DEVELOPER", "ADMIN"]) }).strict();

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEMO_AUTH !== "true") {
      return NextResponse.json({ error: "Demo authentication is disabled." }, { status: 404 });
    }
    assertSameOrigin(request);
    rateLimit(request, { key: "demo-login", limit: 30, windowMs: 60_000 });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    const response = NextResponse.json({ user: demoUsers[parsed.data.role] });
    response.cookies.set(COOKIE_NAME, createSessionToken(parsed.data.role), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
