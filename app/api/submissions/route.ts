import { NextResponse } from "next/server";
import { z } from "zod";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { updateAdminState } from "@/lib/admin-store";
import { db } from "@/lib/db";
import { Platform, platformOptions } from "@/lib/types";
import { assertSameOrigin, auditLog, jsonError, rateLimit, requireActiveUser, safeUrl, sanitizeText } from "@/lib/security";
import { validateImageUpload } from "@/lib/upload-security";

const platformSet = new Set<string>(platformOptions);

const submissionSchema = z.object({
  name: z.string().trim().min(2, "Tool name must be at least 2 characters.").max(80, "Tool name cannot exceed 80 characters."),
  websiteUrl: z.string().trim().url("Enter a complete URL, such as https://yourtool.com."),
  shortDescription: z.string().trim().min(20, "Short description must be at least 20 characters.").max(150, "Short description cannot exceed 150 characters."),
  category: z.string().trim().min(2, "Choose a category."),
  fullDescription: z.string().trim().min(40, "Full description must be at least 40 characters.").max(5000, "Full description cannot exceed 5,000 characters."),
  pricingType: z.enum(["Free", "Freemium", "Paid", "Open Source"], { message: "Choose a valid pricing type." }),
  tags: z.string().optional(),
  platforms: z.string().optional(),
  subcategory: z.string().trim().max(80).optional(),
  bestFor: z.string().trim().max(180).optional(),
  startingPrice: z.string().trim().max(80).optional(),
  couponCode: z.string().trim().max(80).optional(),
  discountDetails: z.string().trim().max(180).optional(),
  freeTrial: z.string().optional(),
  captchaToken: z.string().min(1, "Complete the security check.")
}).strict();

const TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";
async function verifyCaptcha(token: string, request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY
    || (process.env.NODE_ENV !== "production" ? TEST_SECRET_KEY : "");
  if (!secret) return false;

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || ""
    }),
    cache: "no-store"
  });
  if (!response.ok) return false;
  const result = await response.json() as { success?: boolean };
  return result.success === true;
}

async function validateImage(file: File, maxSize: number) {
  const image = await validateImageUpload(file, maxSize);
  return image ? { file, extension: image.extension } : null;
}

async function saveImage(file: File, extension: string, directory: string) {
  const filename = `${crypto.randomUUID()}.${extension}`;
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
  return `/uploads/submissions/${filename}`;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    rateLimit(request, { key: "tool-submission", limit: 12, windowMs: 60 * 60 * 1000 });
    const user = await requireActiveUser(["USER", "DEVELOPER", "ADMIN"]);
    const form = await request.formData();
    const parsed = submissionSchema.safeParse(Object.fromEntries(
      Array.from(form.entries()).filter(([, value]) => typeof value === "string")
    ));
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] || "form");
        if (!fields[field]) fields[field] = issue.message;
      }
      return NextResponse.json({ error: "Please correct the highlighted fields.", fields }, { status: 422 });
    }
    if (!await verifyCaptcha(parsed.data.captchaToken, request)) {
      return NextResponse.json({
        error: "The security check expired or could not be verified.",
        fields: { captchaToken: "Complete the security check again." }
      }, { status: 422 });
    }

    const logoFile = form.get("logo");
    const screenshotFiles = form.getAll("screenshots").filter((value): value is File => value instanceof File && value.size > 0);
    if (screenshotFiles.length > 5) {
      return NextResponse.json({ error: "Please correct the screenshot upload.", fields: { screenshots: "You can upload up to 5 screenshots." } }, { status: 422 });
    }

    const logo = logoFile instanceof File && logoFile.size > 0 ? await validateImage(logoFile, 2 * 1024 * 1024) : null;
    if (logoFile instanceof File && logoFile.size > 0 && !logo) {
      return NextResponse.json({ error: "Please correct the logo upload.", fields: { logo: "Logo must be a valid PNG, JPG, or WebP image no larger than 2MB." } }, { status: 422 });
    }
    const screenshots = await Promise.all(screenshotFiles.map((file) => validateImage(file, 5 * 1024 * 1024)));
    if (screenshots.some((file) => !file)) {
      return NextResponse.json({ error: "Please correct the screenshot upload.", fields: { screenshots: "Each screenshot must be a valid PNG, JPG, or WebP image no larger than 5MB." } }, { status: 422 });
    }

    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "submissions");
    await mkdir(uploadDirectory, { recursive: true });
    const logoUrl = logo ? await saveImage(logo.file, logo.extension, uploadDirectory) : null;
    const screenshotUrls = await Promise.all(
      screenshots.map((image) => saveImage(image!.file, image!.extension, uploadDirectory))
    );
    const submission = submissionSchema.omit({ captchaToken: true }).parse(parsed.data);
  let tags: string[] = [];
  try {
    const parsedTags: unknown = JSON.parse(submission.tags || "[]");
    if (Array.isArray(parsedTags)) tags = parsedTags.filter((tag): tag is string => typeof tag === "string").slice(0, 12);
  } catch { /* use an empty tag list */ }
  let platforms: Platform[] = [];
  try {
    const parsedPlatforms: unknown = JSON.parse(submission.platforms || "[]");
    if (Array.isArray(parsedPlatforms)) {
      platforms = parsedPlatforms.filter((platform): platform is Platform => typeof platform === "string" && platformSet.has(platform));
    }
  } catch { /* use an empty platform list */ }
    if (!platforms.length) {
      return NextResponse.json({
        error: "Please correct the highlighted fields.",
        fields: { platforms: "Choose at least one platform." }
      }, { status: 422 });
    }
    const id = `sub_${crypto.randomUUID()}`;
    const sanitized = {
      name: sanitizeText(submission.name, 80),
      category: sanitizeText(submission.category, 80),
      shortDescription: sanitizeText(submission.shortDescription, 150),
      fullDescription: sanitizeText(submission.fullDescription, 5000),
      websiteUrl: safeUrl(submission.websiteUrl),
      startingPrice: sanitizeText(submission.startingPrice || "", 80),
      bestFor: sanitizeText(submission.bestFor || "", 180),
      subcategory: sanitizeText(submission.subcategory || "", 80),
      couponCode: sanitizeText(submission.couponCode || "", 80),
      discountDetails: sanitizeText(submission.discountDetails || "", 180)
    };
    await updateAdminState((state) => ({
      ...state,
      queue: [
        ...state.queue,
        {
          id,
          name: sanitized.name,
          owner: user.name,
          category: sanitized.category,
          submitted: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
          logo: sanitized.name.charAt(0).toUpperCase(),
          color: "#5992C6",
          description: sanitized.shortDescription,
          fullDescription: sanitized.fullDescription,
          website: sanitized.websiteUrl,
          kind: "New listing",
          pricingType: submission.pricingType,
          startingPrice: sanitized.startingPrice || undefined,
          freeTrial: submission.freeTrial === "true",
          bestFor: sanitized.bestFor || undefined,
          subcategory: sanitized.subcategory || undefined,
          tags,
          platforms,
          logoUrl,
          screenshotUrls,
          couponCode: sanitized.couponCode || undefined,
          discountDetails: sanitized.discountDetails || undefined
        }
      ]
    }));
    await db.activityEvent.create({
      data: {
        type: "SUBMISSION",
        userId: user.id,
        metadata: JSON.stringify({ submissionId: id, name: sanitized.name })
      }
    });
    await auditLog(request, {
      actor: user,
      action: "TOOL_SUBMISSION_CREATE",
      resourceType: "Submission",
      resourceId: id,
      after: { status: "PENDING", name: sanitized.name, category: sanitized.category }
    });

    return NextResponse.json({
      submission: {
        id,
        status: "PENDING",
        ...sanitized,
        pricingType: submission.pricingType,
        freeTrial: submission.freeTrial === "true",
        platforms,
        logoUrl,
        screenshotUrls
      }
    }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
