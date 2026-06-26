import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { assertSameOrigin, auditLog, jsonError, rateLimit, requireAdmin } from "@/lib/security";
import { validateImageUpload } from "@/lib/upload-security";

async function save(file: File, maxSize: number, directory: string) {
  const image = await validateImageUpload(file, maxSize);
  if (!image) return null;
  const filename = `${crypto.randomUUID()}.${image.extension}`;
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
  return `/uploads/submissions/${filename}`;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    rateLimit(request, { key: "admin-upload", limit: 30, windowMs: 60_000 });
    const actor = await requireAdmin();
    const form = await request.formData();
    const logo = form.get("logo");
    const screenshots = form.getAll("screenshots").filter((value): value is File => value instanceof File && value.size > 0);
    if (screenshots.length > 5) return NextResponse.json({ error: "Upload no more than 5 screenshots at once." }, { status: 422 });

    const directory = path.join(process.cwd(), "public", "uploads", "submissions");
    await mkdir(directory, { recursive: true });
    const logoUrl = logo instanceof File && logo.size ? await save(logo, 2 * 1024 * 1024, directory) : null;
    if (logo instanceof File && logo.size && !logoUrl) {
      return NextResponse.json({ error: "Logo must be PNG, JPG, or WebP and no larger than 2MB." }, { status: 422 });
    }
    const screenshotUrls = await Promise.all(screenshots.map((file) => save(file, 5 * 1024 * 1024, directory)));
    if (screenshotUrls.some((url) => !url)) {
      return NextResponse.json({ error: "Each screenshot must be PNG, JPG, or WebP and no larger than 5MB." }, { status: 422 });
    }
    await auditLog(request, {
      actor,
      action: "FILE_UPLOAD",
      resourceType: "Upload",
      after: { logo: Boolean(logoUrl), screenshots: screenshotUrls.length }
    });
    return NextResponse.json({ logoUrl, screenshotUrls });
  } catch (error) {
    return jsonError(error);
  }
}
