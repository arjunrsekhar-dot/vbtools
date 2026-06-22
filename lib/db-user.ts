import "server-only";
import { db } from "@/lib/db";
import { SessionUser } from "@/lib/types";

export async function ensureDatabaseUser(user: SessionUser) {
  return db.user.upsert({
    where: { email: user.email },
    update: { name: user.name, role: user.role },
    create: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: "Active",
      avatar: user.name.charAt(0).toUpperCase()
    }
  });
}
