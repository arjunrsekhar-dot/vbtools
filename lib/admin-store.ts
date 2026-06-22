import "server-only";
import { db } from "@/lib/db";
import { AdminState, ManagedTool, QueueItem } from "@/lib/admin-data";

function parseList(value?: string | null) {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function formatJoined(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export async function readAdminState(): Promise<AdminState> {
  const [submissions, tools, users, deals] = await Promise.all([
    db.submission.findMany({
      where: { status: "PENDING" },
      include: { submitter: true },
      orderBy: { createdAt: "asc" }
    }),
    db.tool.findMany({ include: { category: true }, orderBy: { createdAt: "asc" } }),
    db.user.findMany({ orderBy: { joinedAt: "desc" } }),
    db.deal.findMany({ orderBy: { createdAt: "asc" } })
  ]);

  return {
    queue: submissions.map((submission) => {
      const payload = JSON.parse(submission.payloadJson) as Partial<QueueItem>;
      return {
        id: submission.id,
        name: payload.name || "Untitled tool",
        owner: submission.submitter.name,
        category: payload.category || "Other",
        submitted: payload.submitted || submission.createdAt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
        logo: payload.logo || (payload.name || "?").charAt(0).toUpperCase(),
        color: payload.color || "#287b5e",
        description: payload.description || "",
        website: payload.website || "#",
        kind: payload.kind || (submission.kind === "TOOL_UPDATE" ? "Listing update" : "New listing"),
        fullDescription: payload.fullDescription,
        pricingType: payload.pricingType,
        startingPrice: payload.startingPrice,
        freeTrial: payload.freeTrial,
        bestFor: payload.bestFor,
        subcategory: payload.subcategory,
        tags: payload.tags,
        logoUrl: payload.logoUrl,
        screenshotUrls: payload.screenshotUrls
      };
    }),
    tools: tools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      category: tool.category.name,
      logo: tool.logo,
      color: tool.logoColor,
      status: tool.status === "PUBLISHED" ? "Published" : tool.status === "REJECTED" ? "Rejected" : "Draft",
      featured: tool.featured,
      verified: tool.verified,
      sponsored: tool.sponsored,
      views: tool.views,
      updatedAt: tool.updatedAt.toISOString().slice(0, 10),
      description: tool.shortDescription,
      fullDescription: tool.fullDescription,
      website: tool.websiteUrl,
      pricingType: tool.pricingType as ManagedTool["pricingType"],
      startingPrice: tool.startingPrice,
      freeTrial: tool.freeTrial,
      bestFor: tool.bestFor,
      subcategory: tool.subcategory,
      tags: parseList(tool.tagsJson),
      logoUrl: tool.logoUrl,
      screenshotUrls: parseList(tool.screenshotsJson),
      couponCode: tool.couponCode || undefined,
      discountDetails: tool.discountDetails || undefined
    })),
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "USER" | "DEVELOPER" | "ADMIN",
      status: user.status as "Active" | "Suspended",
      joined: formatJoined(user.joinedAt),
      avatar: user.avatar || user.name.charAt(0).toUpperCase()
    })),
    deals: deals.map((deal) => ({
      id: deal.id,
      tool: deal.toolName,
      discount: deal.discount,
      code: deal.code,
      active: deal.active,
      clicks: deal.clicks,
      expires: deal.expires
    }))
  };
}

export async function writeAdminState(state: AdminState) {
  await db.$transaction(async (tx) => {
    const categoryIds = new Map<string, string>();
    for (const categoryName of [...new Set(state.tools.map((tool) => tool.category))]) {
      const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const category = await tx.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName, slug }
      });
      categoryIds.set(categoryName, category.id);
    }

    for (const tool of state.tools) {
      const existing = await tx.tool.findUnique({ where: { id: tool.id } });
      const status = tool.status === "Published" ? "PUBLISHED" : tool.status === "Rejected" ? "REJECTED" : "DRAFT";
      const management = {
        name: tool.name,
        slug: tool.slug,
        logo: tool.logo,
        logoColor: tool.color,
        logoUrl: tool.logoUrl,
        status,
        featured: tool.featured,
        verified: tool.verified,
        sponsored: tool.sponsored,
        views: tool.views,
        categoryId: categoryIds.get(tool.category)!,
        publishedAt: status === "PUBLISHED" ? (existing?.publishedAt || new Date()) : null,
        shortDescription: tool.description || existing?.shortDescription || `${tool.name} software listing.`,
        fullDescription: tool.fullDescription || existing?.fullDescription || tool.description || `${tool.name} software listing.`,
        websiteUrl: tool.website || existing?.websiteUrl || "#",
        pricingType: tool.pricingType || existing?.pricingType || "Freemium",
        startingPrice: tool.startingPrice || existing?.startingPrice || "Contact for pricing",
        freeTrial: tool.freeTrial ?? existing?.freeTrial ?? false,
        bestFor: tool.bestFor || existing?.bestFor || "Teams and individuals",
        subcategory: tool.subcategory || existing?.subcategory || "Software",
        tagsJson: JSON.stringify(tool.tags || parseList(existing?.tagsJson)),
        screenshotsJson: JSON.stringify(tool.screenshotUrls || parseList(existing?.screenshotsJson)),
        couponCode: tool.couponCode ?? existing?.couponCode,
        discountDetails: tool.discountDetails ?? existing?.discountDetails
      };
      await tx.tool.upsert({
        where: { id: tool.id },
        update: management,
        create: {
          id: tool.id,
          ...management,
          featuresJson: JSON.stringify(["Public product listing", "Direct website access"]),
          prosJson: JSON.stringify(["Reviewed by Voltbean"]),
          consJson: JSON.stringify(["Community feedback is still growing"]),
          useCasesJson: JSON.stringify([tool.bestFor || `Use ${tool.name}`]),
          platformsJson: JSON.stringify(["Web"]),
          alternativesJson: "[]"
        }
      });
    }

    const toolIds = state.tools.map((tool) => tool.id);
    await tx.tool.deleteMany({ where: { id: { notIn: toolIds } } });

    for (const user of state.users) {
      await tx.user.upsert({
        where: { email: user.email },
        update: { name: user.name, role: user.role, status: user.status, avatar: user.avatar },
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          avatar: user.avatar,
          joinedAt: new Date(user.joined)
        }
      });
    }

    for (const deal of state.deals) {
      await tx.deal.upsert({
        where: { id: deal.id },
        update: { toolName: deal.tool, discount: deal.discount, code: deal.code, active: deal.active, clicks: deal.clicks, expires: deal.expires },
        create: { id: deal.id, toolName: deal.tool, discount: deal.discount, code: deal.code, active: deal.active, clicks: deal.clicks, expires: deal.expires }
      });
    }
    await tx.deal.deleteMany({ where: { id: { notIn: state.deals.map((deal) => deal.id) } } });

    for (const item of state.queue) {
      const submitter = await tx.user.findFirst({ where: { name: item.owner } })
        || await tx.user.findFirst({ where: { role: "DEVELOPER" } })
        || await tx.user.findFirst();
      if (!submitter) throw new Error("At least one user is required before creating submissions.");
      await tx.submission.upsert({
        where: { id: String(item.id) },
        update: {
          status: "PENDING",
          kind: item.kind === "Listing update" ? "TOOL_UPDATE" : "NEW_TOOL",
          payloadJson: JSON.stringify(item),
          submitterId: submitter.id
        },
        create: {
          id: String(item.id),
          status: "PENDING",
          kind: item.kind === "Listing update" ? "TOOL_UPDATE" : "NEW_TOOL",
          payloadJson: JSON.stringify(item),
          submitterId: submitter.id
        }
      });
    }

    const queueIds = state.queue.map((item) => String(item.id));
    const removedPending = await tx.submission.findMany({ where: { status: "PENDING", id: { notIn: queueIds } } });
    for (const submission of removedPending) {
      const payload = JSON.parse(submission.payloadJson) as Partial<QueueItem>;
      const published = state.tools.find((tool) => tool.status === "Published" && tool.name === payload.name);
      await tx.submission.update({
        where: { id: submission.id },
        data: {
          status: published ? "APPROVED" : "REJECTED",
          toolId: published?.id,
          reviewedAt: new Date()
        }
      });
      await tx.activityEvent.create({
        data: {
          type: published ? "APPROVAL" : "REJECTION",
          userId: submission.submitterId,
          toolId: published?.id,
          metadata: JSON.stringify({ submissionId: submission.id, name: payload.name })
        }
      });
      if (published) {
        await tx.tool.update({
          where: { id: published.id },
          data: { ownerId: submission.submitterId }
        });
      }
    }
  });
}

let pendingWrite = Promise.resolve();

export async function updateAdminState(update: (state: AdminState) => AdminState | Promise<AdminState>) {
  let result!: AdminState;
  pendingWrite = pendingWrite.then(async () => {
    result = await update(await readAdminState());
    await writeAdminState(result);
  });
  await pendingWrite;
  return result;
}
