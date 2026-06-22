import { NextResponse } from "next/server";
import { z } from "zod";
import { COOKIE_NAME, createSessionToken, demoUsers } from "@/lib/auth";

const schema = z.object({ role: z.enum(["USER", "DEVELOPER", "ADMIN"]) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  const response = NextResponse.json({ user: demoUsers[parsed.data.role] });
  response.cookies.set(COOKIE_NAME, createSessionToken(parsed.data.role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
