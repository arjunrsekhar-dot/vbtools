import { NextResponse } from "next/server";
import { searchTools } from "@/lib/tools";
import { getPublishedTools } from "@/lib/catalog-store";
import { toolQuerySchema } from "@/lib/tool-query";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = toolQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!parsed.success) return NextResponse.json({ error: "Invalid search parameters" }, { status: 422 });
  const { q: query, category, page, pageSize, sort } = parsed.data;
  const tools = await getPublishedTools();
  let result = searchTools(query, tools);
  if (category) result = result.filter((tool) => tool.category === category);
  if (sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
  if (sort === "views") result = [...result].sort((a, b) => b.views - a.views);
  if (sort === "newest") result = [...result].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const total = result.length;
  const start = (page - 1) * pageSize;
  return NextResponse.json({ tools: result.slice(start, start + pageSize), total, page, pageSize });
}
