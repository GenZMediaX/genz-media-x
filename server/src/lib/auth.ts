import { type Request, type Response, type NextFunction } from "express";
import { db, usersTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password + "genz_salt_2024").digest("hex");
}

export function generateToken(userId: number): string {
  const payload = `${userId}:${Date.now()}:genz_secret_2024`;
  return Buffer.from(payload).toString("base64");
}

export function parseToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 3) return null;
    const userId = parseInt(parts[0], 10);
    return isNaN(userId) ? null : userId;
  } catch {
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const userId = parseToken(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  (req as any).user = user;
  next();
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const userId = parseToken(token);
    if (userId) {
      try {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
        if (user) (req as any).user = user;
      } catch {}
    }
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = (req as any).user;
  if (!user || !user.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
