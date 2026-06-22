import { SavedTools } from "@/components/SavedTools";
import { requireRole } from "@/lib/auth";

export default async function SavedPage() {
  await requireRole(["USER", "DEVELOPER", "ADMIN"]);
  return <SavedTools />;
}
