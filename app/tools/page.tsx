import type { Metadata } from "next";
import { DirectoryClient } from "@/components/DirectoryClient";
import { getPublishedTools } from "@/lib/catalog-store";

export const metadata: Metadata = { title: "Browse software tools" };
export const dynamic = "force-dynamic";

export default async function ToolsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const tools = await getPublishedTools();
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  return (
    <DirectoryClient
      initialQuery={value("q")}
      initialCategory={value("category")}
      featuredOnly={value("featured") === "true"}
      initialSort={value("sort") || "popular"}
      tools={tools}
    />
  );
}
