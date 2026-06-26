import { NextResponse } from "next/server";
import { z } from "zod";
import { readAdminState, writeAdminState } from "@/lib/admin-store";
import { platformOptions } from "@/lib/types";
import { assertSameOrigin, auditLog, jsonError, rateLimit, requireAdmin } from "@/lib/security";

const platformSchema = z.enum(platformOptions);

const stateSchema = z.object({
  queue: z.array(z.object({
    id: z.union([z.string(), z.number()]), name: z.string(), owner: z.string(), category: z.string(),
    submitted: z.string(), logo: z.string(), color: z.string(), description: z.string(),
    website: z.string(), kind: z.string(), fullDescription: z.string().optional(),
    pricingType: z.enum(["Free", "Freemium", "Paid", "Open Source"]).optional(),
    startingPrice: z.string().optional(), freeTrial: z.boolean().optional(),
    bestFor: z.string().optional(), subcategory: z.string().optional(),
    tags: z.array(z.string()).optional(), platforms: z.array(platformSchema).optional(), logoUrl: z.string().nullable().optional(),
    screenshotUrls: z.array(z.string()).optional(), couponCode: z.string().optional(),
    discountDetails: z.string().optional()
  })),
  tools: z.array(z.object({
    id: z.string(), name: z.string(), slug: z.string(), category: z.string(), logo: z.string(),
    color: z.string(), status: z.enum(["Published", "Draft", "Rejected"]),
    featured: z.boolean(), verified: z.boolean(), sponsored: z.boolean(),
    views: z.number(), updatedAt: z.string(), description: z.string().optional(),
    fullDescription: z.string().optional(), website: z.string().optional(),
    pricingType: z.enum(["Free", "Freemium", "Paid", "Open Source"]).optional(),
    startingPrice: z.string().optional(), freeTrial: z.boolean().optional(),
    bestFor: z.string().optional(), subcategory: z.string().optional(),
    tags: z.array(z.string()).optional(), platforms: z.array(platformSchema).optional(), logoUrl: z.string().nullable().optional(),
    screenshotUrls: z.array(z.string()).optional(), couponCode: z.string().optional(),
    discountDetails: z.string().optional()
  })),
  users: z.array(z.object({
    id: z.string(), name: z.string(), email: z.string().email(),
    role: z.enum(["USER", "DEVELOPER", "ADMIN"]), status: z.enum(["Active", "Suspended"]),
    joined: z.string(), avatar: z.string()
  })),
  deals: z.array(z.object({
    id: z.string(), tool: z.string(), discount: z.string(), code: z.string(),
    active: z.boolean(), clicks: z.number(), expires: z.string()
  })),
  reports: z.array(z.object({
    id: z.string(),
    toolId: z.string(),
    toolName: z.string(),
    toolSlug: z.string(),
    reporter: z.string(),
    reporterEmail: z.string().email().optional(),
    issueType: z.string(),
    details: z.string(),
    status: z.enum(["Open", "Resolved"]),
    submitted: z.string(),
    resolvedAt: z.string().optional()
  }))
});

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ state: await readAdminState() });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    rateLimit(request, { key: "admin-state", limit: 60, windowMs: 60_000 });
    const actor = await requireAdmin();
    const parsed = stateSchema.strict().safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid admin state" }, { status: 422 });
    const before = await readAdminState();
    await writeAdminState(parsed.data);
    await auditLog(request, {
      actor,
      action: "ADMIN_STATE_WRITE",
      resourceType: "AdminState",
      before: {
        queue: before.queue.length,
        tools: before.tools.length,
        users: before.users.length,
        deals: before.deals.length,
        reports: before.reports.length
      },
      after: {
        queue: parsed.data.queue.length,
        tools: parsed.data.tools.length,
        users: parsed.data.users.length,
        deals: parsed.data.deals.length,
        reports: parsed.data.reports.length
      }
    });
    return NextResponse.json({ state: parsed.data });
  } catch (error) {
    return jsonError(error);
  }
}

export const POST = PUT;
