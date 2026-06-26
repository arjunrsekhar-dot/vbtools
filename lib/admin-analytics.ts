import "server-only";
import { db } from "@/lib/db";
import {
  AdminAnalytics,
  AdminAnalyticsCategory,
  AdminAnalyticsMetricTotals,
  AdminAnalyticsRange,
  AdminAnalyticsSeries
} from "@/lib/admin-analytics-types";

const rangeDays: Record<AdminAnalyticsRange, number> = { "7d": 7, "30d": 30, "90d": 90 };
const bucketDays: Record<AdminAnalyticsRange, number> = { "7d": 1, "30d": 3, "90d": 10 };

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function labelDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function emptyTotals(): AdminAnalyticsMetricTotals {
  return { views: 0, clicks: 0, users: 0, ratings: 0 };
}

function totalsBetween<T extends { createdAt: Date; type?: string }>(
  rows: T[],
  start: Date,
  end: Date,
  userRows: { joinedAt: Date }[],
  ratingRows: { createdAt: Date }[]
) {
  const totals = emptyTotals();
  for (const row of rows) {
    if (row.createdAt < start || row.createdAt >= end) continue;
    if (row.type === "VIEW") totals.views += 1;
    if (row.type === "CLICK") totals.clicks += 1;
  }
  for (const user of userRows) {
    if (user.joinedAt >= start && user.joinedAt < end) totals.users += 1;
  }
  for (const rating of ratingRows) {
    if (rating.createdAt >= start && rating.createdAt < end) totals.ratings += 1;
  }
  return totals;
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const earliest = addDays(today, -179);

  const [tools, users, ratings, events] = await Promise.all([
    db.tool.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "asc" }
    }),
    db.user.findMany({
      select: { role: true, joinedAt: true }
    }),
    db.rating.findMany({
      where: { createdAt: { gte: earliest } },
      select: { createdAt: true }
    }),
    db.activityEvent.findMany({
      where: {
        createdAt: { gte: earliest },
        type: { in: ["VIEW", "CLICK"] }
      },
      select: {
        type: true,
        createdAt: true,
        tool: { select: { category: { select: { name: true } } } }
      }
    })
  ]);

  const ranges = {} as Record<AdminAnalyticsRange, AdminAnalyticsSeries>;
  const rangeTotals = {} as Record<AdminAnalyticsRange, AdminAnalyticsMetricTotals>;
  const previousTotals = {} as Record<AdminAnalyticsRange, AdminAnalyticsMetricTotals>;
  const categories = {} as Record<AdminAnalyticsRange, AdminAnalyticsCategory[]>;
  const categoryNames = Array.from(new Set(tools.map((tool) => tool.category.name))).sort((a, b) => a.localeCompare(b));
  const toolCountsByCategory = new Map<string, number>();

  for (const tool of tools) {
    toolCountsByCategory.set(tool.category.name, (toolCountsByCategory.get(tool.category.name) || 0) + 1);
  }

  for (const range of Object.keys(rangeDays) as AdminAnalyticsRange[]) {
    const days = rangeDays[range];
    const step = bucketDays[range];
    const currentStart = addDays(tomorrow, -days);
    const previousStart = addDays(currentStart, -days);
    const labels: string[] = [];
    const views: number[] = [];
    const clicks: number[] = [];
    const newUsers: number[] = [];
    const newRatings: number[] = [];

    for (let bucketStart = currentStart; bucketStart < tomorrow; bucketStart = addDays(bucketStart, step)) {
      const bucketEnd = addDays(bucketStart, step) > tomorrow ? tomorrow : addDays(bucketStart, step);
      const totals = totalsBetween(events, bucketStart, bucketEnd, users, ratings);
      labels.push(step === 1 ? labelDate(bucketStart) : `${labelDate(bucketStart)}-${labelDate(addDays(bucketEnd, -1))}`);
      views.push(totals.views);
      clicks.push(totals.clicks);
      newUsers.push(totals.users);
      newRatings.push(totals.ratings);
    }

    const categoryRows = new Map<string, AdminAnalyticsCategory>();
    for (const name of categoryNames) {
      categoryRows.set(name, { name, tools: toolCountsByCategory.get(name) || 0, views: 0, clicks: 0 });
    }
    for (const event of events) {
      if (event.createdAt < currentStart || event.createdAt >= tomorrow) continue;
      const name = event.tool?.category.name || "Uncategorized";
      const row = categoryRows.get(name) || { name, tools: toolCountsByCategory.get(name) || 0, views: 0, clicks: 0 };
      if (event.type === "VIEW") row.views += 1;
      if (event.type === "CLICK") row.clicks += 1;
      categoryRows.set(name, row);
    }

    ranges[range] = { labels, views, clicks, users: newUsers, ratings: newRatings };
    rangeTotals[range] = totalsBetween(events, currentStart, tomorrow, users, ratings);
    previousTotals[range] = totalsBetween(events, previousStart, currentStart, users, ratings);
    categories[range] = Array.from(categoryRows.values()).sort((a, b) => b.views - a.views || b.clicks - a.clicks || a.name.localeCompare(b.name));
  }

  return {
    totals: {
      tools: tools.length,
      users: users.length,
      developers: users.filter((user) => user.role === "DEVELOPER").length,
      ratings: await db.rating.count(),
      views: tools.reduce((total, tool) => total + tool.views, 0),
      clicks: tools.reduce((total, tool) => total + tool.clicks, 0)
    },
    ranges,
    rangeTotals,
    previousTotals,
    categories
  };
}
