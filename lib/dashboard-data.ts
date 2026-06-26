import "server-only";
import { db } from "@/lib/db";
import { ensureDatabaseUser } from "@/lib/db-user";
import { SessionUser } from "@/lib/types";
import { getPublishedTools } from "@/lib/catalog-store";

function statusLabel(status: string) {
  if (status === "PUBLISHED") return "Published";
  if (status === "PENDING_REVIEW" || status === "PENDING") return "Pending review";
  if (status === "REJECTED") return "Rejected";
  return "Draft";
}

function relativeTime(date: Date) {
  const seconds = Math.max(1, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function eventLabel(type: string, metadata: string | null) {
  let detail: Record<string, unknown> = {};
  try { detail = metadata ? JSON.parse(metadata) as Record<string, unknown> : {}; } catch { /* empty */ }
  if (type === "SAVE") return "New save";
  if (type === "UNSAVE") return "Tool unsaved";
  if (type === "RATING") return `${detail.score || ""}-star rating`;
  if (type === "CLICK") return "Website click";
  if (type === "VIEW") return "Listing viewed";
  if (type === "SUBMISSION") return `${detail.name || "Tool"} submitted`;
  if (type === "APPROVAL") return `${detail.name || "Tool"} approved`;
  if (type === "REJECTION") return `${detail.name || "Tool"} rejected`;
  return type.toLowerCase();
}

export async function getDeveloperDashboardData(session: SessionUser) {
  const user = await ensureDatabaseUser(session);
  const [ownedTools, submissions, activities] = await Promise.all([
    db.tool.findMany({ where: { ownerId: user.id }, orderBy: { updatedAt: "desc" } }),
    db.submission.findMany({ where: { submitterId: user.id }, orderBy: { createdAt: "desc" } }),
    db.activityEvent.findMany({
      where: { OR: [{ userId: user.id }, { tool: { ownerId: user.id } }] },
      include: { tool: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20
    })
  ]);
  const ratingAggregates = await db.rating.groupBy({
    by: ["toolId"],
    where: { toolId: { in: ownedTools.map((tool) => tool.id) } },
    _avg: { score: true },
    _count: { score: true }
  });
  const ratings = new Map(
    ratingAggregates.map((item) => [
      item.toolId,
      { rating: item._count.score ? item._avg.score || 0 : 0, count: item._count.score }
    ])
  );
  const ownedIds = new Set(ownedTools.map((tool) => tool.id));
  const toolActivities = activities.filter((event) => !event.toolId || ownedIds.has(event.toolId));
  const totalRatings = ownedTools.reduce((total, tool) => total + (ratings.get(tool.id)?.count || 0), 0);
  const averageRating = totalRatings
    ? ownedTools.reduce((total, tool) => {
        const rating = ratings.get(tool.id);
        return total + (rating ? rating.rating * rating.count : 0);
      }, 0) / totalRatings
    : 0;
  const submissionRows = submissions
    .filter((submission) => !submission.toolId)
    .map((submission) => {
      const payload = JSON.parse(submission.payloadJson) as { name?: string; logo?: string; color?: string };
      return {
        id: submission.id,
        name: payload.name || "Untitled tool",
        logo: payload.logo || (payload.name || "?").charAt(0),
        color: payload.color || "#5992C6",
        status: statusLabel(submission.status),
        views: 0,
        saves: 0,
        rating: 0,
        updated: relativeTime(submission.updatedAt)
      };
    });
  const listings = [
    ...ownedTools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      logo: tool.logo,
      color: tool.logoColor,
      status: statusLabel(tool.status),
      views: tool.views,
      saves: tool.saves,
      rating: ratings.get(tool.id)?.rating || 0,
      updated: relativeTime(tool.updatedAt)
    })),
    ...submissionRows
  ];
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (13 - index));
    return date;
  });
  const performance = days.map((date) => {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const dayEvents = toolActivities.filter((event) => event.createdAt >= date && event.createdAt < next);
    return {
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      views: dayEvents.filter((event) => event.type === "VIEW").length,
      clicks: dayEvents.filter((event) => event.type === "CLICK").length
    };
  });
  return {
    stats: {
      views: ownedTools.reduce((total, tool) => total + tool.views, 0),
      saves: ownedTools.reduce((total, tool) => total + tool.saves, 0),
      clicks: ownedTools.reduce((total, tool) => total + tool.clicks, 0),
      rating: averageRating,
      ratingCount: totalRatings
    },
    listings,
    activity: toolActivities.slice(0, 8).map((event) => ({
      id: event.id,
      label: eventLabel(event.type, event.metadata),
      tool: event.tool?.name || "Account",
      time: relativeTime(event.createdAt),
      type: event.type
    })),
    performance
  };
}

export async function getUserDashboardData(session: SessionUser) {
  const user = await ensureDatabaseUser(session);
  const [savedRows, ratingsCount, viewsCount, activity, publishedTools] = await Promise.all([
    db.savedTool.findMany({ where: { userId: user.id }, include: { tool: true }, orderBy: { createdAt: "desc" } }),
    db.rating.count({ where: { userId: user.id } }),
    db.activityEvent.count({ where: { userId: user.id, type: "VIEW" } }),
    db.activityEvent.findMany({
      where: { userId: user.id },
      include: { tool: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 6
    }),
    getPublishedTools()
  ]);
  const savedSlugs = new Set(savedRows.map((row) => row.tool.slug));
  const savedTools = publishedTools.filter((tool) => savedSlugs.has(tool.slug));
  const categories = new Set(savedTools.map((tool) => tool.category));
  const recommended = publishedTools
    .filter((tool) => !savedSlugs.has(tool.slug))
    .sort((a, b) => Number(categories.has(b.category)) - Number(categories.has(a.category)) || b.rating - a.rating)
    .slice(0, 3);
  return {
    savedTools,
    recommended,
    stats: { saved: savedRows.length, ratings: ratingsCount, views: viewsCount },
    activity: activity.map((event) => ({
      id: event.id,
      label: eventLabel(event.type, event.metadata),
      tool: event.tool?.name || "Account",
      slug: event.tool?.slug,
      time: relativeTime(event.createdAt)
    }))
  };
}

export type DeveloperDashboardData = Awaited<ReturnType<typeof getDeveloperDashboardData>>;
export type UserDashboardData = Awaited<ReturnType<typeof getUserDashboardData>>;
