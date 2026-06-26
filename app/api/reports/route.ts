import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertSameOrigin, auditLog, jsonError, rateLimit, requireActiveUser, requirePublicToolBySlug, sanitizeText } from "@/lib/security";

const schema = z.object({
  slug: z.string().min(1),
  issueType: z.enum(["Pricing", "Features", "Availability", "Broken link", "Other"]),
  details: z.string().trim().min(10).max(1000)
}).strict();

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    rateLimit(request, { key: "reports", limit: 10, windowMs: 60 * 60 * 1000 });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid report" }, { status: 422 });

    const [user, tool] = await Promise.all([
      requireActiveUser(["USER", "DEVELOPER", "ADMIN"]),
      requirePublicToolBySlug(parsed.data.slug)
    ]);

    const details = sanitizeText(parsed.data.details, 1000);
    const report = await db.activityEvent.create({
      data: {
        type: "REPORT_INCORRECT_INFO",
        toolId: tool.id,
        userId: user.id,
        metadata: JSON.stringify({
          toolId: tool.id,
          toolName: tool.name,
          toolSlug: tool.slug,
          reporter: user.name,
          reporterEmail: user.email,
          issueType: parsed.data.issueType,
          details,
          status: "Open",
          referrer: request.headers.get("referer"),
          userAgent: request.headers.get("user-agent")
        })
      }
    });
    await auditLog(request, {
      actor: user,
      action: "CORRECTION_REQUEST_CREATE",
      resourceType: "Tool",
      resourceId: tool.id,
      after: { reportId: report.id, issueType: parsed.data.issueType }
    });

    return NextResponse.json({ id: report.id, ok: true }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
