import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SessionUser, UserRole } from "@/lib/types";
import { safeUrl, sanitizeText } from "@/lib/input-security";

type SecurityUser = SessionUser & { status: string };
type RateLimitOptions = { key: string; limit: number; windowMs: number };

const buckets = new Map<string, { count: number; resetAt: number }>();
const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const publicToolStatus = "PUBLISHED";
export const pendingStatus = "PENDING";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function jsonError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof Error && "status" in error && typeof (error as { status?: unknown }).status === "number") {
    return NextResponse.json({ error: error.message || "Invalid request." }, { status: (error as { status: number }).status });
  }
  return NextResponse.json({ error: "Request could not be completed." }, { status: 500 });
}

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

export function assertSameOrigin(request: Request) {
  if (!mutatingMethods.has(request.method)) return;
  const origin = request.headers.get("origin");
  if (!origin) return;
  const expected = new URL(request.url).origin;
  if (origin !== expected) throw new HttpError(403, "Invalid request origin.");
}

export function rateLimit(request: Request, options: RateLimitOptions) {
  const key = `${options.key}:${clientIp(request)}`;
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return;
  }
  current.count += 1;
  if (current.count > options.limit) throw new HttpError(429, "Too many requests. Try again later.");
}

export async function requireActiveUser(roles?: UserRole[]): Promise<SecurityUser> {
  const session = await getSessionUser();
  if (!session) throw new HttpError(401, "Authentication required");
  const user = await db.user.findUnique({ where: { email: session.email } });
  if (!user) throw new HttpError(401, "Authentication required");
  if (user.status !== "Active") throw new HttpError(403, "Account is not active.");
  if (roles?.length && !roles.includes(user.role as UserRole)) throw new HttpError(403, "Forbidden");
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    status: user.status
  };
}

export async function requireAdmin() {
  return requireActiveUser(["ADMIN"]);
}

export async function requireDeveloperOrAdmin() {
  return requireActiveUser(["DEVELOPER", "ADMIN"]);
}

export async function requireOwnedTool(toolId: string, actor: SecurityUser) {
  const tool = await db.tool.findUnique({ where: { id: toolId } });
  if (!tool) throw new HttpError(404, "Tool not found.");
  if (actor.role !== "ADMIN" && tool.ownerId !== actor.id) throw new HttpError(403, "Forbidden");
  return tool;
}

export async function requirePublicToolBySlug(slug: string) {
  const tool = await db.tool.findFirst({ where: { slug, status: publicToolStatus } });
  if (!tool) throw new HttpError(404, "Tool not found.");
  return tool;
}

export async function auditLog(request: Request, input: {
  actor?: SecurityUser | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
}) {
  await db.auditLog.create({
    data: {
      actorUserId: input.actor?.id,
      actorRole: input.actor?.role,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId || undefined,
      ipAddress: clientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
      beforeJson: input.before === undefined ? undefined : JSON.stringify(input.before),
      afterJson: input.after === undefined ? undefined : JSON.stringify(input.after),
      metadataJson: input.metadata === undefined ? undefined : JSON.stringify(input.metadata)
    }
  });
}

export function strictJson<T extends z.ZodType>(schema: T, value: unknown): z.infer<T> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new HttpError(422, "Invalid request payload.");
  return parsed.data;
}

export { safeUrl, sanitizeText };
