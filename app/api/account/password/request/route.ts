import { createHash, randomInt } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendPasswordChangeCode } from "@/lib/email";
import { assertSameOrigin, auditLog, jsonError, rateLimit, requireActiveUser } from "@/lib/security";

const schema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string()
    .min(12, "Password must be at least 12 characters.")
    .max(100)
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/[0-9]/, "Password must include a number.")
}).strict();

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    rateLimit(request, { key: "password-request", limit: 5, windowMs: 60 * 60 * 1000 });
    const actor = await requireActiveUser(["USER", "DEVELOPER", "ADMIN"]);

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid password." }, { status: 422 });

    const user = await db.user.findUniqueOrThrow({ where: { id: actor.id } });
    if (user.passwordHash) {
      const validCurrent = parsed.data.currentPassword
        ? await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)
        : false;
      if (!validCurrent) return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });
    }

    const code = String(randomInt(100000, 1000000));
    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    const requestRow = await db.passwordChangeRequest.create({
      data: {
        userId: user.id,
        codeHash: hashCode(code),
        passwordHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15)
      }
    });
    const delivery = await sendPasswordChangeCode(user.email, code);
    await auditLog(request, {
      actor,
      action: "PASSWORD_CHANGE_REQUEST",
      resourceType: "User",
      resourceId: user.id
    });

    return NextResponse.json({
      requestId: requestRow.id,
      message: delivery.delivered ? "Confirmation code sent." : "Confirmation code generated.",
      devCode: delivery.devCode
    });
  } catch (error) {
    return jsonError(error);
  }
}
