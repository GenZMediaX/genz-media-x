import { Router } from "express";
import { db, requirementsTable, usersTable } from "../db/index.js";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, optionalAuth } from "../lib/auth.js";

const router = Router();

const CreateRequirementBody = z.object({ title: z.string().min(1), description: z.string().min(1) });
const UpdateRequirementBody = z.object({ title: z.string().optional(), description: z.string().optional(), status: z.string().optional() });

async function formatRequirement(r: any) {
  const [author] = await db.select().from(usersTable).where(eq(usersTable.id, r.authorId));
  return {
    id: r.id, title: r.title, description: r.description, status: r.status, authorId: r.authorId,
    author: author ? { id: author.id, username: author.username, name: author.name, bio: author.bio ?? null, avatarUrl: author.avatarUrl ?? null, skills: author.skills ?? [], interests: author.interests ?? [], postCount: 0, followerCount: 0, createdAt: author.createdAt instanceof Date ? author.createdAt.toISOString() : author.createdAt } : null,
    responseCount: r.responseCount,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  };
}

router.get("/requirements", optionalAuth, async (req, res): Promise<void> => {
  const status = req.query.status as string | undefined;
  let query = db.select().from(requirementsTable) as any;
  if (status && status !== "all") query = query.where(eq(requirementsTable.status, status));
  const requirements = await query.orderBy(desc(requirementsTable.createdAt));
  res.json(await Promise.all(requirements.map(formatRequirement)));
});

router.post("/requirements", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateRequirementBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const user = (req as any).user;
  const [req_] = await db.insert(requirementsTable).values({ title: parsed.data.title, description: parsed.data.description, status: "open", authorId: user.id }).returning();
  res.status(201).json(await formatRequirement(req_));
});

router.put("/requirements/:requirementId", requireAuth, async (req, res): Promise<void> => {
  const requirementId = parseInt(req.params.requirementId, 10);
  const parsed = UpdateRequirementBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const user = (req as any).user;
  const [existing] = await db.select().from(requirementsTable).where(eq(requirementsTable.id, requirementId));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.authorId !== user.id && !user.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  const updates: any = {};
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  const [updated] = await db.update(requirementsTable).set(updates).where(eq(requirementsTable.id, requirementId)).returning();
  res.json(await formatRequirement(updated));
});

export default router;
