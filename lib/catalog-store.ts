import "server-only";
import { db } from "@/lib/db";
import { Platform, PricingType, Tool } from "@/lib/types";
import { resolveToolIcon } from "@/lib/tool-icons";

function parseList(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

async function toTool(
  record: Awaited<ReturnType<typeof db.tool.findMany>>[number],
  realRating?: { rating: number; count: number }
): Promise<Tool> {
  const logoUrl = await resolveToolIcon(record.websiteUrl, record.slug, record.logoUrl);
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    logo: record.logo,
    logoColor: record.logoColor,
    logoUrl,
    screenshots: parseList(record.screenshotsJson),
    category: "",
    subcategory: record.subcategory,
    shortDescription: record.shortDescription,
    fullDescription: record.fullDescription,
    pricingType: record.pricingType as PricingType,
    startingPrice: record.startingPrice,
    freeTrial: record.freeTrial,
    rating: realRating?.rating ?? record.rating,
    ratingCount: realRating?.count ?? record.ratingCount,
    platforms: parseList(record.platformsJson) as Platform[],
    tags: parseList(record.tagsJson),
    useCases: parseList(record.useCasesJson),
    bestFor: record.bestFor,
    features: parseList(record.featuresJson),
    pros: parseList(record.prosJson),
    cons: parseList(record.consJson),
    alternatives: parseList(record.alternativesJson),
    websiteUrl: record.websiteUrl,
    affiliateUrl: record.affiliateUrl || undefined,
    couponCode: record.couponCode || undefined,
    discount: record.discountDetails || undefined,
    featured: record.featured,
    sponsored: record.sponsored,
    verified: record.verified,
    isNew: record.isNew,
    views: record.views,
    saves: record.saves,
    clicks: record.clicks,
    updatedAt: record.updatedAt.toISOString().slice(0, 10)
  };
}

function summarizeRating(count: number, average: number | null) {
  return {
    rating: count ? average || 0 : 0,
    count
  };
}

export async function getPublishedTools() {
  const records = await db.tool.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
    orderBy: { createdAt: "asc" }
  });
  const aggregates = await db.rating.groupBy({
    by: ["toolId"],
    where: { toolId: { in: records.map((record) => record.id) } },
    _avg: { score: true },
    _count: { score: true }
  });
  const ratings = new Map(
    aggregates.map((item) => [item.toolId, summarizeRating(item._count.score, item._avg.score)])
  );

  return Promise.all(records.map(async (record) => ({
    ...(await toTool(record, ratings.get(record.id) ?? summarizeRating(0, null))),
    category: record.category.name
  })));
}

export async function getPublishedTool(slug: string) {
  const record = await db.tool.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true }
  });
  if (!record) return undefined;

  const aggregate = await db.rating.aggregate({
    where: { toolId: record.id },
    _avg: { score: true },
    _count: { score: true }
  });
  return { ...(await toTool(record, summarizeRating(aggregate._count.score, aggregate._avg.score))), category: record.category.name };
}
