import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { assertSameOrigin, auditLog, jsonError, rateLimit, requireActiveUser, requirePublicToolBySlug } from "@/lib/security";

const updateSchema = z.object({ slug: z.string().min(1), saved: z.boolean() });
const importSchema = z.object({ slugs: z.array(z.string().min(1)).max(200) });

async function createSavedTool(userId: string, toolId: string, metadata?: string) {
  try {
    await db.$transaction([
      db.savedTool.create({ data: { userId, toolId } }),
      db.tool.update({ where: { id: toolId }, data: { saves: { increment: 1 } } }),
      db.activityEvent.create({ data: { type: "SAVE", userId, toolId, metadata } })
    ]);
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return false;
    throw error;
  }
}

async function authenticatedUser() {
  return requireActiveUser(["USER", "DEVELOPER", "ADMIN"]);
}

export async function GET() {
  try {
    const user = await authenticatedUser();
    const saved = await db.savedTool.findMany({
      where: { userId: user.id, tool: { status: "PUBLISHED" } },
      include: { tool: { select: { slug: true } } },
      orderBy: { createdAt: "asc" }
    });
    return NextResponse.json({ saved: saved.map((item) => item.tool.slug) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    rateLimit(request, { key: "saved", limit: 120, windowMs: 60_000 });
    const user = await authenticatedUser();
    const parsed = updateSchema.strict().safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid saved tool update" }, { status: 422 });
    const tool = await requirePublicToolBySlug(parsed.data.slug);
    if (parsed.data.saved) {
      const existing = await db.savedTool.findUnique({ where: { userId_toolId: { userId: user.id, toolId: tool.id } } });
      if (!existing) await createSavedTool(user.id, tool.id);
    } else {
      const removed = await db.savedTool.deleteMany({ where: { userId: user.id, toolId: tool.id } });
      if (removed.count) {
        await db.$transaction([
          db.tool.update({ where: { id: tool.id }, data: { saves: { decrement: 1 } } }),
          db.activityEvent.create({ data: { type: "UNSAVE", userId: user.id, toolId: tool.id } })
        ]);
      }
    }
    await auditLog(request, {
      actor: user,
      action: parsed.data.saved ? "TOOL_SAVE" : "TOOL_UNSAVE",
      resourceType: "Tool",
      resourceId: tool.id
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    rateLimit(request, { key: "saved-import", limit: 12, windowMs: 60 * 60 * 1000 });
    const user = await authenticatedUser();
    const parsed = importSchema.strict().safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid saved tools import" }, { status: 422 });
    const tools = await db.tool.findMany({ where: { slug: { in: parsed.data.slugs }, status: "PUBLISHED" }, select: { id: true } });
    for (const tool of tools) {
      const existing = await db.savedTool.findUnique({
        where: { userId_toolId: { userId: user.id, toolId: tool.id } },
      });
      if (!existing) {
        await createSavedTool(user.id, tool.id, "{\"source\":\"localStorage import\"}");
      }
    }
    await auditLog(request, { actor: user, action: "SAVED_TOOLS_IMPORT", resourceType: "SavedTool", after: { imported: tools.length } });
    return NextResponse.json({ imported: tools.length });
  } catch (error) {
    return jsonError(error);
  }
}
