import "server-only";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type Branding = {
  logoUrl: string | null;
  logoType: "png" | "svg" | null;
  updatedAt: string | null;
};

const brandingPath = path.join(process.cwd(), "data", "branding.json");

export const defaultBranding: Branding = {
  logoUrl: null,
  logoType: null,
  updatedAt: null
};

export async function readBranding(): Promise<Branding> {
  try {
    const raw = await readFile(brandingPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<Branding>;
    return {
      logoUrl: typeof parsed.logoUrl === "string" ? parsed.logoUrl : null,
      logoType: parsed.logoType === "png" || parsed.logoType === "svg" ? parsed.logoType : null,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
    };
  } catch {
    return defaultBranding;
  }
}

export async function writeBranding(branding: Branding) {
  await mkdir(path.dirname(brandingPath), { recursive: true });
  await writeFile(brandingPath, JSON.stringify(branding, null, 2), "utf8");
}
