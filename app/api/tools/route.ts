import { NextResponse } from "next/server";
import { searchTools } from "@/lib/tools";
import { getPublishedTools } from "@/lib/catalog-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category");
  const tools = await getPublishedTools();
  let result = searchTools(query, tools);
  if (category) result = result.filter((tool) => tool.category === category);
  return NextResponse.json({ tools: result, total: result.length });
}
