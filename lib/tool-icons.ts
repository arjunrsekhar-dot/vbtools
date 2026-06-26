import "server-only";

import { createHash } from "crypto";
import { mkdir, access, writeFile } from "fs/promises";
import path from "path";

const ICON_DIR = path.join(process.cwd(), "public", "uploads", "tool-icons");

function extensionFromContentType(contentType: string | null, fallback: string) {
  const type = contentType?.split(";")[0].trim().toLowerCase();
  if (type === "image/svg+xml") return "svg";
  if (type === "image/png") return "png";
  if (type === "image/jpeg") return "jpg";
  if (type === "image/jpg") return "jpg";
  if (type === "image/webp") return "webp";
  if (type === "image/x-icon" || type === "image/vnd.microsoft.icon") return "ico";
  return fallback;
}

function iconCandidates(websiteUrl: string) {
  try {
    const origin = new URL(websiteUrl).origin;
    return [
      `${origin}/favicon.ico`,
      `${origin}/favicon.svg`,
      `${origin}/favicon.png`,
      `${origin}/apple-touch-icon.png`,
      `${origin}/logo.svg`,
      `${origin}/logo.png`,
      `${origin}/icon.svg`,
      `${origin}/icon.png`
    ];
  } catch {
    return [];
  }
}

async function saveRemoteIcon(url: string, slug: string) {
  try {
    const fingerprint = createHash("sha1").update(url).digest("hex").slice(0, 12);
    const source = new URL(url);
    const extension = path.extname(source.pathname).replace(/^\./, "") || "png";
    const filename = `${slug}-${fingerprint}.${extension}`;
    const outputPath = path.join(ICON_DIR, filename);

    try {
      await access(outputPath);
      return `/uploads/tool-icons/${filename}`;
    } catch {
      const response = await fetch(url, { cache: "force-cache" });
      if (!response.ok) return null;

      const contentType = response.headers.get("content-type");
      if (!contentType?.toLowerCase().startsWith("image/")) return null;

      const finalExtension = extensionFromContentType(contentType, extension);
      const finalFilename = `${slug}-${fingerprint}.${finalExtension}`;
      const finalOutputPath = path.join(ICON_DIR, finalFilename);
      try {
        await access(finalOutputPath);
        return `/uploads/tool-icons/${finalFilename}`;
      } catch {
        await mkdir(ICON_DIR, { recursive: true });
        await writeFile(finalOutputPath, Buffer.from(await response.arrayBuffer()), { flag: "wx" });
        return `/uploads/tool-icons/${finalFilename}`;
      }
    }
  } catch {
    return null;
  }
}

export async function resolveToolIcon(websiteUrl: string, slug: string, logoUrl?: string | null) {
  if (logoUrl && logoUrl.startsWith("/")) return logoUrl;

  const candidates = logoUrl ? [logoUrl, ...iconCandidates(websiteUrl)] : iconCandidates(websiteUrl);
  for (const candidate of candidates) {
    const saved = await saveRemoteIcon(candidate, slug);
    if (saved) return saved;
  }

  return logoUrl || undefined;
}
