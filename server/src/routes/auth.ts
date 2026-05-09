import { Router } from "express";
import { db, usersTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hashPassword, generateToken, requireAuth } from "../lib/auth.js";

const router = Router();

const RegisterBody = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const LoginBody = z.object({
  email: z.string().email(),
  password: z.string(),
});

function formatUser(user: any) {
  return {
    id: user.id, username: user.username, email: user.email,
    name: user.name, bio: user.bio ?? null, avatarUrl: user.avatarUrl ?? null,
    skills: user.skills ?? [], interests: user.interests ?? [],
    isAdmin: user.isAdmin,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  };
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { username, email, password, name } = parsed.data;
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) { res.status(409).json({ error: "Email already in use" }); return; }
  const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (existingUser) { res.status(409).json({ error: "Username already taken" }); return; }
  const [user] = await db.insert(usersTable).values({
    username, email, passwordHash: hashPassword(password), name, skills: [], interests: [], isAdmin: false,
  }).returning();
  res.status(201).json({ token: generateToken(user.id), user: formatUser(user) });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" }); return;
  }
  res.json({ token: generateToken(user.id), user: formatUser(user) });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  res.json(formatUser((req as any).user));
});

router.post("/auth/logout", (_req, res): void => { res.json({ success: true }); });

export default router;
