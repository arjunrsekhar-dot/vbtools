import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { readBranding, writeBranding } from "@/lib/branding-store";
import { assertSameOrigin, auditLog, jsonError, rateLimit, requireAdmin } from "@/lib/security";

const svgBlockedPattern = /<\s*(script|foreignobject|iframe|object|embed|link|style)\b|on[a-z]+\s*=|style\s*=|\b(?:href|xlink:href)\s*=\s*["']?\s*(?:https?:|\/\/|data:|javascript:)|javascript:|data:/i;

async function validatePng(file: File) {
  if (file.size === 0 || file.size > 1024 * 1024) return null;
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return pngSignature.every((byte, index) => header[index] === byte) ? "png" : null;
}

async function validateSvg(file: File) {
  if (file.size === 0 || file.size > 512 * 1024) return null;
  const text = await file.text();
  const trimmed = text.trim();
  if (!trimmed.startsWith("<svg") && !trimmed.startsWith("<?xml")) return null;
  if (!/<svg[\s>]/i.test(trimmed) || svgBlockedPattern.test(trimmed)) return null;
  return trimmed;
}

export async function GET() {
  return NextResponse.json({ branding: await readBranding() });
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    rateLimit(request, { key: "branding-upload", limit: 10, windowMs: 60 * 60 * 1000 });
    const actor = await requireAdmin();
    const form = await request.formData();
    const file = form.get("logo");
    if (!(file instanceof File) || !file.size) {
      return NextResponse.json({ error: "Choose a PNG or SVG logo." }, { status: 422 });
    }

    const directory = path.join(process.cwd(), "public", "uploads", "branding");
    await mkdir(directory, { recursive: true });

    let logoUrl: string | null = null;
    let logoType: "png" | "svg" | null = null;
    const png = await validatePng(file);
    if (png) {
      const filename = `${crypto.randomUUID()}.png`;
      await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
      logoUrl = `/uploads/branding/${filename}`;
      logoType = "png";
    } else {
      const svg = await validateSvg(file);
      if (!svg) {
        return NextResponse.json({ error: "Logo must be a valid PNG or a safe SVG without scripts, event handlers, embedded objects, or external data." }, { status: 422 });
      }
      const filename = `${crypto.randomUUID()}.svg`;
      await writeFile(path.join(directory, filename), svg, { flag: "wx" });
      logoUrl = `/uploads/branding/${filename}`;
      logoType = "svg";
    }

    const branding = { logoUrl, logoType, updatedAt: new Date().toISOString() };
    await writeBranding(branding);
    await auditLog(request, {
      actor,
      action: "BRANDING_LOGO_UPDATE",
      resourceType: "Branding",
      after: branding
    });
    return NextResponse.json({ branding });
  } catch (error) {
    return jsonError(error);
  }
}
