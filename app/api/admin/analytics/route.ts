import { NextResponse } from "next/server";
import { getAdminAnalytics } from "@/lib/admin-analytics";
import { jsonError, requireAdmin } from "@/lib/security";

export async function GET() {
  try {
    await requireAdmin();
    const analytics = await getAdminAnalytics();
    return NextResponse.json({ analytics });
  } catch (error) {
    return jsonError(error);
  }
}
