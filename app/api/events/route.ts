import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureDatabaseUser } from "@/lib/db-user";
import { assertSameOrigin, jsonError, rateLimit, requirePublicToolBySlug } from "@/lib/security";

const schema = z.object({
  slug: z.string().min(1),
  type: z.enum(["VIEW", "CLICK"])
}).strict();

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    rateLimit(request, { key: "events", limit: 240, windowMs: 60_000 });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid event" }, { status: 422 });
    const [session, tool] = await Promise.all([
      getSessionUser(),
      requirePublicToolBySlug(parsed.data.slug)
    ]);
    const user = session ? await ensureDatabaseUser(session) : null;

    await db.$transaction([
      db.activityEvent.create({
        data: {
          type: parsed.data.type,
          toolId: tool.id,
          userId: user?.id,
          metadata: JSON.stringify({
            referrer: request.headers.get("referer"),
            userAgent: request.headers.get("user-agent")
          })
        }
      }),
      db.tool.update({
        where: { id: tool.id },
        data: parsed.data.type === "VIEW" ? { views: { increment: 1 } } : { clicks: { increment: 1 } }
      })
    ]);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
