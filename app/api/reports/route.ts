import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureDatabaseUser } from "@/lib/db-user";

const schema = z.object({
  slug: z.string().min(1),
  issueType: z.enum(["Pricing", "Features", "Availability", "Broken link", "Other"]),
  details: z.string().trim().min(10).max(1000)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid report" }, { status: 422 });

  const [session, tool] = await Promise.all([
    getSessionUser(),
    db.tool.findUnique({ where: { slug: parsed.data.slug } })
  ]);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });

  const user = await ensureDatabaseUser(session);
  const report = await db.activityEvent.create({
    data: {
      type: "REPORT_INCORRECT_INFO",
      toolId: tool.id,
      userId: user?.id,
      metadata: JSON.stringify({
        toolId: tool.id,
        toolName: tool.name,
        toolSlug: tool.slug,
        reporter: user.name,
        reporterEmail: user.email,
        issueType: parsed.data.issueType,
        details: parsed.data.details,
        status: "Open",
        referrer: request.headers.get("referer"),
        userAgent: request.headers.get("user-agent")
      })
    }
  });

  return NextResponse.json({ id: report.id, ok: true }, { status: 201 });
}
