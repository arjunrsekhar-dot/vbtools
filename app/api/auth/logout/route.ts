import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";
import { assertSameOrigin, jsonError } from "@/lib/security";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, "", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", expires: new Date(0), path: "/" });
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
