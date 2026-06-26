import { NextResponse } from "next/server";
import { jsonError, requireActiveUser } from "@/lib/security";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const actor = await requireActiveUser(["USER", "DEVELOPER", "ADMIN"]);
    const user = await db.user.findUniqueOrThrow({ where: { id: actor.id } });

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        hasPassword: Boolean(user.passwordHash),
        googleConnected: Boolean(user.googleId)
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
