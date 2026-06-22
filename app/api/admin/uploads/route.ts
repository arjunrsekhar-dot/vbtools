import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

const rules = {
  "image/png": { extension: "png", signature: [0x89, 0x50, 0x4e, 0x47] },
  "image/jpeg": { extension: "jpg", signature: [0xff, 0xd8, 0xff] },
  "image/webp": { extension: "webp", signature: [0x52, 0x49, 0x46, 0x46] }
} as const;

async function save(file: File, maxSize: number, directory: string) {
  const rule = rules[file.type as keyof typeof rules];
  if (!rule || !file.size || file.size > maxSize) return null;
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!rule.signature.every((byte, index) => bytes[index] === byte)) return null;
  if (file.type === "image/webp" && String.fromCharCode(...bytes.slice(8, 12)) !== "WEBP") return null;
  const filename = `${crypto.randomUUID()}.${rule.extension}`;
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
  return `/uploads/submissions/${filename}`;
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
  return NextResponse.json({ logoUrl, screenshotUrls });
}
