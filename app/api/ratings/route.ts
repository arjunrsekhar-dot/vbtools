import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertSameOrigin, auditLog, jsonError, rateLimit, requireActiveUser, requirePublicToolBySlug } from "@/lib/security";

const schema = z.object({ slug: z.string().min(1), score: z.number().int().min(1).max(5) });
const querySchema = z.object({ slug: z.string().min(1) });

function summarizeRating(databaseCount: number, databaseAverage: number) {
  return {
    rating: databaseCount ? databaseAverage : 0,
    count: databaseCount
  };
}

export async function GET(request: Request) {
  try {
    const session = await requireActiveUser(["USER", "DEVELOPER", "ADMIN"]);

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({ slug: searchParams.get("slug") });
    if (!parsed.success) return NextResponse.json({ error: "Invalid tool" }, { status: 422 });
    const tool = await requirePublicToolBySlug(parsed.data.slug);

    const rating = await db.rating.findUnique({
      where: { userId_toolId: { userId: session.id, toolId: tool.id } },
      select: { score: true }
    });

    return NextResponse.json({ selected: rating?.score ?? null });
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status: number }).status === 401) {
      return NextResponse.json({ selected: null });
    }
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    rateLimit(request, { key: "rating", limit: 60, windowMs: 60_000 });
    const user = await requireActiveUser(["USER", "DEVELOPER", "ADMIN"]);
    const parsed = schema.strict().safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid rating" }, { status: 422 });
    const tool = await requirePublicToolBySlug(parsed.data.slug);

    const result = await db.$transaction(async (tx) => {
      const existingRating = await tx.rating.findUnique({
        where: { userId_toolId: { userId: user.id, toolId: tool.id } },
        select: { score: true }
      });

    await tx.rating.upsert({
      where: { userId_toolId: { userId: user.id, toolId: tool.id } },
      update: { score: parsed.data.score },
      create: { userId: user.id, toolId: tool.id, score: parsed.data.score }
    });

    const aggregate = await tx.rating.aggregate({
      where: { toolId: tool.id },
      _avg: { score: true },
      _count: { score: true }
    });
    const summary = summarizeRating(aggregate._count.score, aggregate._avg.score || 0);

    await tx.tool.update({
      where: { id: tool.id },
      data: { rating: summary.rating, ratingCount: summary.count }
    });

    if (!existingRating || existingRating.score !== parsed.data.score) {
      await tx.activityEvent.create({
        data: {
          type: "RATING",
          userId: user.id,
          toolId: tool.id,
          metadata: JSON.stringify({ score: parsed.data.score, previousScore: existingRating?.score ?? null })
        }
      });
    }

      return {
        ...summary,
        selected: parsed.data.score,
        created: !existingRating
      };
    });

    await auditLog(request, {
      actor: user,
      action: result.created ? "RATING_CREATE" : "RATING_UPDATE",
      resourceType: "Tool",
      resourceId: tool.id,
      after: { score: parsed.data.score }
    });
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
