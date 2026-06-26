import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/security";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(50),
  action: z.string().trim().max(80).optional(),
  resourceType: z.string().trim().max(80).optional()
}).strict();

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsed.success) return NextResponse.json({ error: "Invalid audit query" }, { status: 422 });
    const { page, pageSize, action, resourceType } = parsed.data;
    const where = {
      ...(action ? { action } : {}),
      ...(resourceType ? { resourceType } : {})
    };
    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      db.auditLog.count({ where })
    ]);
    return NextResponse.json({
      logs,
      total,
      page,
      pageSize
    });
  } catch (error) {
    return jsonError(error);
  }
}
