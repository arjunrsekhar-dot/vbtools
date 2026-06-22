import "server-only";
import { db } from "@/lib/db";
import { Platform, PricingType, Tool } from "@/lib/types";

function parseList(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function toTool(record: Awaited<ReturnType<typeof db.tool.findMany>>[number]): Tool {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    logo: record.logo,
    logoColor: record.logoColor,
    logoUrl: record.logoUrl || undefined,
    screenshots: parseList(record.screenshotsJson),
    category: "",
    subcategory: record.subcategory,
    shortDescription: record.shortDescription,
    fullDescription: record.fullDescription,
    pricingType: record.pricingType as PricingType,
    startingPrice: record.startingPrice,
    freeTrial: record.freeTrial,
    rating: record.rating,
    ratingCount: record.ratingCount,
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

export async function getPublishedTools() {
  const records = await db.tool.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
    orderBy: { createdAt: "asc" }
  });
  return records.map((record) => ({ ...toTool(record), category: record.category.name }));
}

export async function getPublishedTool(slug: string) {
  const record = await db.tool.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true }
  });
  return record ? { ...toTool(record), category: record.category.name } : undefined;
}
