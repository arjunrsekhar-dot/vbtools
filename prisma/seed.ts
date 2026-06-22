import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { initialAdminState, AdminState, ManagedTool } from "../lib/admin-data";
import { categories, tools } from "../lib/tools";

const prisma = new PrismaClient();

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function status(value: ManagedTool["status"]) {
  return value === "Published" ? "PUBLISHED" : value === "Rejected" ? "REJECTED" : "DRAFT";
}

async function loadAdminState(): Promise<AdminState> {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "data", "admin-state.json"), "utf8")) as AdminState;
  } catch {
    return initialAdminState;
  }
}

async function main() {
  const state = await loadAdminState();
  const passwordHash = await bcrypt.hash("VoltbeanDemo123!", 12);
  const users = [
    ...state.users,
    { id: "admin-demo", name: "Sam Rivera", email: "sam@voltbean.tools", role: "ADMIN" as const, status: "Active" as const, joined: "Jun 1, 2026", avatar: "S" },
    { id: "user-demo", name: "Maya Chen", email: "maya@example.com", role: "USER" as const, status: "Active" as const, joined: "Jun 18, 2026", avatar: "M" },
    { id: "developer-demo", name: "Alex Morgan", email: "alex@launchkit.dev", role: "DEVELOPER" as const, status: "Active" as const, joined: "Jun 14, 2026", avatar: "A" }
  ];
  const uniqueUsers = [...new Map(users.map((user) => [user.email, user])).values()];

  for (const user of uniqueUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        joinedAt: parseDate(user.joined)
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        joinedAt: parseDate(user.joined)
      }
    });
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        color: category.color
      }
    });
  }

  const developer = await prisma.user.findUniqueOrThrow({ where: { email: "alex@launchkit.dev" } });
  for (const managed of state.tools) {
    const source = tools.find((tool) => tool.id === managed.id || tool.slug === managed.slug);
    const category = await prisma.category.findUniqueOrThrow({ where: { name: managed.category } });
    const updatedAt = parseDate(managed.updatedAt);
    const data = {
      name: managed.name,
      slug: managed.slug,
      logo: managed.logo,
      logoColor: managed.color,
      logoUrl: managed.logoUrl,
      shortDescription: managed.description || source?.shortDescription || `${managed.name} software listing.`,
      fullDescription: managed.fullDescription || source?.fullDescription || managed.description || `${managed.name} software listing.`,
      websiteUrl: managed.website || source?.websiteUrl || "#",
      affiliateUrl: source?.affiliateUrl,
      couponCode: source?.couponCode,
      discountDetails: source?.discount,
      pricingType: managed.pricingType || source?.pricingType || "Freemium",
      startingPrice: managed.startingPrice || source?.startingPrice || "Contact for pricing",
      freeTrial: managed.freeTrial ?? source?.freeTrial ?? false,
      bestFor: managed.bestFor || source?.bestFor || "Teams and individuals",
      subcategory: managed.subcategory || source?.subcategory || "Software",
      featuresJson: JSON.stringify(source?.features || ["Public product listing"]),
      prosJson: JSON.stringify(source?.pros || ["Reviewed by Voltbean"]),
      consJson: JSON.stringify(source?.cons || ["Community feedback is still growing"]),
      useCasesJson: JSON.stringify(source?.useCases || [managed.bestFor || `Use ${managed.name}`]),
      platformsJson: JSON.stringify(source?.platforms || ["Web"]),
      tagsJson: JSON.stringify(managed.tags || source?.tags || [managed.category]),
      alternativesJson: JSON.stringify(source?.alternatives || []),
      screenshotsJson: JSON.stringify(managed.screenshotUrls || []),
      status: status(managed.status),
      featured: managed.featured,
      sponsored: managed.sponsored,
      verified: managed.verified,
      rating: source?.rating || 0,
      ratingCount: source?.ratingCount || 0,
      baseRating: source?.rating || 0,
      baseRatingCount: source?.ratingCount || 0,
      views: managed.views,
      saves: source?.saves || 0,
      clicks: source?.clicks || 0,
      isNew: source?.isNew || false,
      publishedAt: managed.status === "Published" ? updatedAt : null,
      ownerId: developer.id,
      categoryId: category.id,
      updatedAt
    };
    await prisma.tool.upsert({
      where: { slug: managed.slug },
      update: data,
      create: { id: managed.id, ...data }
    });
  }

  for (const item of state.queue) {
    const submitter = await prisma.user.findFirst({ where: { name: item.owner } }) || developer;
    await prisma.submission.upsert({
      where: { id: String(item.id) },
      update: { status: "PENDING", payloadJson: JSON.stringify(item), submitterId: submitter.id },
      create: {
        id: String(item.id),
        kind: item.kind === "Listing update" ? "TOOL_UPDATE" : "NEW_TOOL",
        status: "PENDING",
        payloadJson: JSON.stringify(item),
        submitterId: submitter.id
      }
    });
  }

  for (const deal of state.deals) {
    await prisma.deal.upsert({
      where: { id: deal.id },
      update: {
        toolName: deal.tool,
        discount: deal.discount,
        code: deal.code,
        active: deal.active,
        clicks: deal.clicks,
        expires: deal.expires
      },
      create: {
        id: deal.id,
        toolName: deal.tool,
        discount: deal.discount,
        code: deal.code,
        active: deal.active,
        clicks: deal.clicks,
        expires: deal.expires
      }
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
