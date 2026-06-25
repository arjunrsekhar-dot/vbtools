import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { readAdminState, writeAdminState } from "@/lib/admin-store";

const stateSchema = z.object({
  queue: z.array(z.object({
    id: z.union([z.string(), z.number()]), name: z.string(), owner: z.string(), category: z.string(),
    submitted: z.string(), logo: z.string(), color: z.string(), description: z.string(),
    website: z.string(), kind: z.string(), fullDescription: z.string().optional(),
    pricingType: z.enum(["Free", "Freemium", "Paid", "Open Source"]).optional(),
    startingPrice: z.string().optional(), freeTrial: z.boolean().optional(),
    bestFor: z.string().optional(), subcategory: z.string().optional(),
    tags: z.array(z.string()).optional(), logoUrl: z.string().nullable().optional(),
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
    tags: z.array(z.string()).optional(), logoUrl: z.string().nullable().optional(),
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

async function authorize() {
  const user = await getSessionUser();
  return user?.role === "ADMIN";
}

export async function GET() {
  if (!await authorize()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ state: await readAdminState() });
}

export async function PUT(request: Request) {
  if (!await authorize()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = stateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid admin state" }, { status: 422 });
  await writeAdminState(parsed.data);
  return NextResponse.json({ state: parsed.data });
}

export const POST = PUT;
