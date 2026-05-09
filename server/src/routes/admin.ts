import { Router } from "express";
import { db, usersTable, postsTable, commentsTable, requirementsTable } from "../db/index.js";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth.js";

const router = Router();
router.use("/admin", requireAuth, requireAdmin);

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const [userCount] = await db.select({ count: count() }).from(usersTable);
  const [postCount] = await db.select({ count: count() }).from(postsTable);
  const [commentCount] = await db.select({ count: count() }).from(commentsTable);
  const [reqCount] = await db.select({ count: count() }).from(requirementsTable);
  const catCounts = await db.select({ category: postsTable.category, count: count() }).from(postsTable).groupBy(postsTable.category);
  res.json({
    totalUsers: Number(userCount?.count ?? 0), totalPosts: Number(postCount?.count ?? 0),
    totalComments: Number(commentCount?.count ?? 0), totalRequirements: Number(reqCount?.count ?? 0),
    postsToday: 0, newUsersThisWeek: 0,
    postsByCategory: catCounts.map(c => ({ category: c.category, count: Number(c.count) })),
  });
});

router.get("/admin/users", async (req, res): Promise<void> => {
  const page = parseInt(String(req.query.page ?? 1), 10);
  const limit = 20;
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(limit).offset((page - 1) * limit);
  const [total] = await db.select({ count: count() }).from(usersTable);
  res.json({ users: users.map(u => ({ id: u.id, username: u.username, email: u.email, name: u.name, bio: u.bio ?? null, avatarUrl: u.avatarUrl ?? null, skills: u.skills ?? [], interests: u.interests ?? [], isAdmin: u.isAdmin, createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt })), total: Number(total?.count ?? 0), page, totalPages: Math.ceil(Number(total?.count ?? 0) / limit) });
});

router.delete("/admin/users/:userId", async (req, res): Promise<void> => {
  await db.delete(usersTable).where(eq(usersTable.id, parseInt(req.params.userId, 10)));
  res.sendStatus(204);
});

router.get("/admin/posts", async (req, res): Promise<void> => {
  const page = parseInt(String(req.query.page ?? 1), 10);
  const limit = 20;
  const posts = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt)).limit(limit).offset((page - 1) * limit);
  const [total] = await db.select({ count: count() }).from(postsTable);
  const formatted = await Promise.all(posts.map(async p => {
    const [author] = await db.select().from(usersTable).where(eq(usersTable.id, p.authorId));
    return { id: p.id, content: p.content, imageUrl: p.imageUrl ?? null, videoUrl: p.videoUrl ?? null, category: p.category, authorId: p.authorId, author: author ? { id: author.id, username: author.username, name: author.name, bio: author.bio ?? null, avatarUrl: author.avatarUrl ?? null, skills: author.skills ?? [], interests: author.interests ?? [], postCount: 0, followerCount: 0, createdAt: author.createdAt instanceof Date ? author.createdAt.toISOString() : author.createdAt } : null, likeCount: p.likeCount, commentCount: p.commentCount, shareCount: p.shareCount, isLiked: false, isBookmarked: false, isFeatured: p.isFeatured, createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt };
  }));
  res.json({ posts: formatted, total: Number(total?.count ?? 0), page, totalPages: Math.ceil(Number(total?.count ?? 0) / limit) });
});

router.put("/admin/posts/:postId/feature", async (req, res): Promise<void> => {
  const postId = parseInt(req.params.postId, 10);
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post) { res.status(404).json({ error: "Not found" }); return; }
  await db.update(postsTable).set({ isFeatured: !post.isFeatured }).where(eq(postsTable.id, postId));
  res.json({ success: true });
});

export default router;
