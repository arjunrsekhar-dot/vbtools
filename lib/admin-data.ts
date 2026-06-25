import { tools } from "@/lib/tools";
import { UserRole } from "@/lib/types";

export type QueueItem = {
  id: string | number; name: string; owner: string; category: string; submitted: string;
  logo: string; color: string; description: string; website: string; kind: string;
  fullDescription?: string; pricingType?: "Free" | "Freemium" | "Paid" | "Open Source";
  startingPrice?: string; freeTrial?: boolean; bestFor?: string; subcategory?: string;
  tags?: string[]; logoUrl?: string | null; screenshotUrls?: string[];
  couponCode?: string; discountDetails?: string;
};

export type ManagedTool = {
  id: string; name: string; slug: string; category: string; logo: string; color: string;
  status: "Published" | "Draft" | "Rejected"; featured: boolean; verified: boolean;
  sponsored: boolean; views: number; updatedAt: string;
  description?: string; fullDescription?: string; website?: string;
  pricingType?: "Free" | "Freemium" | "Paid" | "Open Source";
  startingPrice?: string; freeTrial?: boolean; bestFor?: string; subcategory?: string;
  tags?: string[]; logoUrl?: string | null; screenshotUrls?: string[];
  couponCode?: string; discountDetails?: string;
};

export type ManagedUser = {
  id: string; name: string; email: string; role: UserRole; status: "Active" | "Suspended";
  joined: string; avatar: string;
};

export type ManagedDeal = {
  id: string; tool: string; discount: string; code: string; active: boolean; clicks: number; expires: string;
};

export type ReportItem = {
  id: string;
  toolId: string;
  toolName: string;
  toolSlug: string;
  reporter: string;
  reporterEmail?: string;
  issueType: string;
  details: string;
  status: "Open" | "Resolved";
  submitted: string;
  resolvedAt?: string;
};

export type AdminState = {
  queue: QueueItem[];
  tools: ManagedTool[];
  users: ManagedUser[];
  deals: ManagedDeal[];
  reports: ReportItem[];
};

export const initialAdminState: AdminState = {
  queue: [
    { id: 1, name: "Briefly AI", owner: "Alex Morgan", category: "AI & Writing", submitted: "12 min ago", logo: "B", color: "#e06a45", description: "AI meeting briefs and follow-up notes for product teams.", website: "https://briefly.example", kind: "New listing" },
    { id: 2, name: "MetricFlow", owner: "Nora Singh", category: "Analytics & SEO", submitted: "1 hour ago", logo: "M", color: "#236bc5", description: "A privacy-first metrics layer for growing SaaS companies.", website: "https://metricflow.example", kind: "Listing update" },
    { id: 3, name: "PixelJar", owner: "Jamie Lee", category: "Design", submitted: "3 hours ago", logo: "P", color: "#9c54cb", description: "Shared inspiration boards and visual asset libraries.", website: "https://pixeljar.example", kind: "New listing" }
  ],
  tools: tools.map((tool, index) => ({
    id: tool.id, name: tool.name, slug: tool.slug, category: tool.category, logo: tool.logo,
    color: tool.logoColor, status: index === 17 ? "Draft" : "Published",
    featured: Boolean(tool.featured), verified: Boolean(tool.verified),
    sponsored: Boolean(tool.sponsored), views: tool.views, updatedAt: tool.updatedAt
  })),
  users: [
    { id: "u1", name: "Maya Chen", email: "maya@example.com", role: "USER", status: "Active", joined: "Jun 18, 2026", avatar: "M" },
    { id: "u2", name: "Alex Morgan", email: "alex@launchkit.dev", role: "DEVELOPER", status: "Active", joined: "Jun 14, 2026", avatar: "A" },
    { id: "u3", name: "Nora Singh", email: "nora@metricflow.io", role: "DEVELOPER", status: "Active", joined: "Jun 12, 2026", avatar: "N" },
    { id: "u4", name: "Jamie Lee", email: "jamie@pixeljar.co", role: "DEVELOPER", status: "Active", joined: "Jun 8, 2026", avatar: "J" },
    { id: "u5", name: "Theo Brooks", email: "theo@example.com", role: "USER", status: "Suspended", joined: "May 29, 2026", avatar: "T" },
    { id: "u6", name: "Priya Shah", email: "priya@example.com", role: "USER", status: "Active", joined: "May 24, 2026", avatar: "P" },
    { id: "u7", name: "Ibrahim Ali", email: "ibrahim@stackly.dev", role: "DEVELOPER", status: "Active", joined: "May 18, 2026", avatar: "I" }
  ],
  deals: tools.filter((tool) => tool.discount).map((tool, index) => ({
    id: tool.id, tool: tool.name, discount: tool.discount || "", code: tool.couponCode || "AUTO",
    active: true, clicks: tool.clicks, expires: index === 0 ? "Jul 31, 2026" : "No expiry"
  })),
  reports: []
};
