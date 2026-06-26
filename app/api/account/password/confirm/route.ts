import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertSameOrigin, auditLog, jsonError, rateLimit, requireActiveUser } from "@/lib/security";

const schema = z.object({
  requestId: z.string().min(1),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit confirmation code.")
}).strict();

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    rateLimit(request, { key: "password-confirm", limit: 10, windowMs: 60 * 60 * 1000 });
    const user = await requireActiveUser(["USER", "DEVELOPER", "ADMIN"]);

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid code." }, { status: 422 });

    const result = await db.$transaction(async (tx) => {
      const requestRow = await tx.passwordChangeRequest.findFirst({
        where: {
          id: parsed.data.requestId,
          userId: user.id,
          usedAt: null,
          expiresAt: { gt: new Date() }
        }
      });
      if (!requestRow || requestRow.codeHash !== hashCode(parsed.data.code)) return null;

      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash: requestRow.passwordHash }
      });
      await tx.passwordChangeRequest.update({
        where: { id: requestRow.id },
        data: { usedAt: new Date() }
      });
      return true;
    });

    if (!result) return NextResponse.json({ error: "Confirmation code is invalid or expired." }, { status: 422 });
    await auditLog(request, { actor: user, action: "PASSWORD_CHANGE_CONFIRM", resourceType: "User", resourceId: user.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
