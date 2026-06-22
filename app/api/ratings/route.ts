import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureDatabaseUser } from "@/lib/db-user";

const schema = z.object({ slug: z.string().min(1), score: z.number().int().min(1).max(5) });

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid rating" }, { status: 422 });
  const [user, tool] = await Promise.all([
    ensureDatabaseUser(session),
    db.tool.findUnique({ where: { slug: parsed.data.slug } })
  ]);
  if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });

  const existingRating = await db.rating.findUnique({
    where: { userId_toolId: { userId: user.id, toolId: tool.id } }
  });
  await db.rating.upsert({
    where: { userId_toolId: { userId: user.id, toolId: tool.id } },
    update: { score: parsed.data.score },
    create: { userId: user.id, toolId: tool.id, score: parsed.data.score }
  });
  const aggregate = await db.rating.aggregate({
    where: { toolId: tool.id },
    _avg: { score: true },
    _count: { score: true }
  });
  const importedCount = Math.max(0, tool.baseRatingCount);
  const databaseCount = aggregate._count.score;
  const databaseAverage = aggregate._avg.score || 0;
  const rating = importedCount
    ? ((tool.baseRating * importedCount) + (databaseAverage * databaseCount)) / (importedCount + databaseCount)
    : databaseAverage;
  await db.tool.update({
    where: { id: tool.id },
    data: { rating, ratingCount: importedCount + databaseCount }
  });
  await db.activityEvent.create({
    data: {
      type: "RATING",
      userId: user.id,
      toolId: tool.id,
      metadata: JSON.stringify({ score: parsed.data.score, previousScore: existingRating?.score })
    }
  });
  return NextResponse.json({ rating, count: importedCount + databaseCount, selected: parsed.data.score });
}
