import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureDatabaseUser } from "@/lib/db-user";

const schema = z.object({
  slug: z.string().min(1),
  type: z.enum(["VIEW", "CLICK"])
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid event" }, { status: 422 });
  const [session, tool] = await Promise.all([
    getSessionUser(),
    db.tool.findUnique({ where: { slug: parsed.data.slug } })
  ]);
  if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
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
}
