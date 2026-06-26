export type AdminAnalyticsRange = "7d" | "30d" | "90d";

export type AdminAnalyticsSeries = {
  labels: string[];
  views: number[];
  clicks: number[];
  users: number[];
  ratings: number[];
};

export type AdminAnalyticsMetricTotals = {
  views: number;
  clicks: number;
  users: number;
  ratings: number;
};

export type AdminAnalyticsCategory = {
  name: string;
  tools: number;
  views: number;
  clicks: number;
};

export type AdminAnalytics = {
  totals: {
    tools: number;
    users: number;
    developers: number;
    ratings: number;
    views: number;
    clicks: number;
  };
  ranges: Record<AdminAnalyticsRange, AdminAnalyticsSeries>;
  rangeTotals: Record<AdminAnalyticsRange, AdminAnalyticsMetricTotals>;
  previousTotals: Record<AdminAnalyticsRange, AdminAnalyticsMetricTotals>;
  categories: Record<AdminAnalyticsRange, AdminAnalyticsCategory[]>;
};
