import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, auditLog, jsonError, requireActiveUser } from "@/lib/security";

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActiveUser(["USER", "DEVELOPER", "ADMIN"]);
    const user = await db.user.findUniqueOrThrow({ where: { id: actor.id } });
    if (!user.passwordHash) {
      return NextResponse.json({ error: "Set a password before disconnecting Google sign-in." }, { status: 422 });
    }

    await db.user.update({
      where: { id: user.id },
      data: { googleId: null }
    });
    await auditLog(request, { actor, action: "SOCIAL_LOGIN_DISCONNECT", resourceType: "User", resourceId: user.id });
    return NextResponse.json({ googleConnected: false });
  } catch (error) {
    return jsonError(error);
  }
}
