import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SessionUser, UserRole } from "@/lib/types";

const COOKIE_NAME = "voltbean_session";
const secret = process.env.AUTH_SECRET || "voltbean-local-demo-secret-change-in-production";

const demoUsers: Record<UserRole, SessionUser> = {
  USER: { id: "user-demo", name: "Maya Chen", email: "maya@example.com", role: "USER" },
  DEVELOPER: { id: "developer-demo", name: "Alex Morgan", email: "alex@launchkit.dev", role: "DEVELOPER" },
  ADMIN: { id: "admin-demo", name: "Sam Rivera", email: "sam@voltbean.tools", role: "ADMIN" }
};

function sign(value: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createSessionToken(identity: UserRole | SessionUser) {
  const user = typeof identity === "string" ? demoUsers[identity] : identity;
  const payload = Buffer.from(JSON.stringify({ user, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string): SessionUser | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      user?: SessionUser;
      role?: UserRole;
      exp: number;
    };
    if (data.exp < Date.now()) return null;
    if (data.role && demoUsers[data.role]) return demoUsers[data.role];

    const user = data.user;
    if (
      !user ||
      typeof user.id !== "string" ||
      typeof user.name !== "string" ||
      typeof user.email !== "string" ||
      !["USER", "DEVELOPER", "ADMIN"].includes(user.role)
    ) return null;
    return user;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export async function requireRole(roles: UserRole[]) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!roles.includes(user.role)) redirect("/dashboard?unauthorized=true");
  return user;
}

export { COOKIE_NAME, demoUsers };
