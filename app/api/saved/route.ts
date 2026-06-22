import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureDatabaseUser } from "@/lib/db-user";

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
  const session = await getSessionUser();
  if (!session) return null;
  return ensureDatabaseUser(session);
}

export async function GET() {
  const user = await authenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const saved = await db.savedTool.findMany({
    where: { userId: user.id },
    include: { tool: { select: { slug: true } } },
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json({ saved: saved.map((item) => item.tool.slug) });
}

export async function PUT(request: Request) {
  const user = await authenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid saved tool update" }, { status: 422 });
  const tool = await db.tool.findUnique({ where: { slug: parsed.data.slug } });
  if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
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
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const user = await authenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = importSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid saved tools import" }, { status: 422 });
  const tools = await db.tool.findMany({ where: { slug: { in: parsed.data.slugs } }, select: { id: true } });
  for (const tool of tools) {
    const existing = await db.savedTool.findUnique({
      where: { userId_toolId: { userId: user.id, toolId: tool.id } },
    });
    if (!existing) {
      await createSavedTool(user.id, tool.id, "{\"source\":\"localStorage import\"}");
    }
  }
  return NextResponse.json({ imported: tools.length });
}
