import { SavedTools } from "@/components/SavedTools";
import { requireRole } from "@/lib/auth";
import { getPublishedTools } from "@/lib/catalog-store";

export default async function SavedPage() {
  await requireRole(["USER", "DEVELOPER", "ADMIN"]);
  const tools = await getPublishedTools();
  return <SavedTools tools={tools} />;
}
