import { Router } from "express";
import { db, usersTable, postsTable, commentsTable, likesTable } from "../db/index.js";
import { eq, count } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../lib/auth.js";

const router = Router();

const UpdateProfileBody = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  age: z.number().optional(),
  gender: z.string().optional(),
});

function formatUser(user: any, extra: { postCount?: number; commentCount?: number; likeCount?: number } = {}) {
  return {
    id: user.id, username: user.username, name: user.name,
    bio: user.bio ?? null, avatarUrl: user.avatarUrl ?? null,
    skills: user.skills ?? [], interests: user.interests ?? [],
    age: user.age ?? null, gender: user.gender ?? null,
    postCount: extra.postCount ?? 0,
    followerCount: 0,
    commentCount: extra.commentCount ?? 0,
    likeCount: extra.likeCount ?? 0,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  };
}

router.get("/users/:userId", async (req, res): Promise<void> => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const [postCount] = await db.select({ count: count() }).from(postsTable).where(eq(postsTable.authorId, userId));
  const [commentCount] = await db.select({ count: count() }).from(commentsTable).where(eq(commentsTable.authorId, userId));
  const [likeCount] = await db.select({ count: count() }).from(likesTable).where(eq(likesTable.userId, userId));
  res.json(formatUser(user, {
    postCount: postCount?.count ?? 0,
    commentCount: commentCount?.count ?? 0,
    likeCount: likeCount?.count ?? 0,
  }));
});

router.put("/users/:userId", requireAuth, async (req, res): Promise<void> => {
  const userId = parseInt(req.params.userId, 10);
  const currentUser = (req as any).user;
  if (currentUser.id !== userId && !currentUser.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const updates: any = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;
  if (parsed.data.avatarUrl !== undefined) updates.avatarUrl = parsed.data.avatarUrl;
  if (parsed.data.skills !== undefined) updates.skills = parsed.data.skills;
  if (parsed.data.interests !== undefined) updates.interests = parsed.data.interests;
  if (parsed.data.age !== undefined) updates.age = parsed.data.age;
  if (parsed.data.gender !== undefined) updates.gender = parsed.data.gender;
  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  const [postCount] = await db.select({ count: count() }).from(postsTable).where(eq(postsTable.authorId, userId));
  const [commentCount] = await db.select({ count: count() }).from(commentsTable).where(eq(commentsTable.authorId, userId));
  const [likeCount] = await db.select({ count: count() }).from(likesTable).where(eq(likesTable.userId, userId));
  res.json(formatUser(updated, {
    postCount: postCount?.count ?? 0,
    commentCount: commentCount?.count ?? 0,
    likeCount: likeCount?.count ?? 0,
  }));
});

export default router;
