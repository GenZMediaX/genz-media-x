import { Router } from "express";
import { db, postsTable, usersTable, likesTable, bookmarksTable, commentsTable } from "../db/index.js";
import { eq, desc, and, ilike, count, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, optionalAuth } from "../lib/auth.js";

const router = Router();

const GetPostsQuery = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

const CreatePostBody = z.object({
  content: z.string().min(1),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  category: z.string(),
});

const CreateCommentBody = z.object({ content: z.string().min(1) });

function formatUser(user: any) {
  return {
    id: user.id, username: user.username, name: user.name,
    bio: user.bio ?? null, avatarUrl: user.avatarUrl ?? null,
    skills: user.skills ?? [], interests: user.interests ?? [],
    postCount: 0, followerCount: 0,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  };
}

async function getPostWithDetails(postId: number, currentUserId?: number) {
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post) return null;
  const [author] = await db.select().from(usersTable).where(eq(usersTable.id, post.authorId));
  let isLiked = false, isBookmarked = false;
  if (currentUserId) {
    const [like] = await db.select().from(likesTable).where(and(eq(likesTable.postId, postId), eq(likesTable.userId, currentUserId)));
    isLiked = !!like;
    const [bm] = await db.select().from(bookmarksTable).where(and(eq(bookmarksTable.postId, postId), eq(bookmarksTable.userId, currentUserId)));
    isBookmarked = !!bm;
  }
  return {
    id: post.id, content: post.content, imageUrl: post.imageUrl ?? null,
    videoUrl: post.videoUrl ?? null, category: post.category, authorId: post.authorId,
    author: author ? formatUser(author) : { id: post.authorId, username: "unknown", name: "Unknown", bio: null, avatarUrl: null, skills: [], interests: [], postCount: 0, followerCount: 0, createdAt: new Date().toISOString() },
    likeCount: post.likeCount, commentCount: post.commentCount, shareCount: post.shareCount,
    isLiked, isBookmarked, isFeatured: post.isFeatured,
    createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
  };
}

router.get("/posts", optionalAuth, async (req, res): Promise<void> => {
  const parsed = GetPostsQuery.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: "Invalid query" }); return; }
  const { category, search, page, limit } = parsed.data;
  let query = db.select().from(postsTable) as any;
  const conditions = [];
  if (category) conditions.push(eq(postsTable.category, category));
  if (search) conditions.push(ilike(postsTable.content, `%${search}%`));
  if (conditions.length > 0) query = query.where(and(...conditions));
  const posts = await query.orderBy(desc(postsTable.createdAt)).limit(limit).offset((page - 1) * limit);
  const currentUserId = (req as any).user?.id;
  const postsWithDetails = await Promise.all(posts.map((p: any) => getPostWithDetails(p.id, currentUserId)));
  const [totalResult] = await db.select({ count: count() }).from(postsTable);
  const total = totalResult?.count ?? 0;
  res.json({ posts: postsWithDetails.filter(Boolean), total, page, totalPages: Math.ceil(total / limit) });
});

router.post("/posts", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const user = (req as any).user;
  const [post] = await db.insert(postsTable).values({
    content: parsed.data.content, imageUrl: parsed.data.imageUrl,
    videoUrl: parsed.data.videoUrl, category: parsed.data.category,
    authorId: user.id, isFeatured: false,
  }).returning();
  const details = await getPostWithDetails(post.id, user.id);
  res.status(201).json(details);
});

router.get("/posts/:postId", optionalAuth, async (req, res): Promise<void> => {
  const postId = parseInt(req.params.postId, 10);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid post ID" }); return; }
  const details = await getPostWithDetails(postId, (req as any).user?.id);
  if (!details) { res.status(404).json({ error: "Post not found" }); return; }
  res.json(details);
});

router.delete("/posts/:postId", requireAuth, async (req, res): Promise<void> => {
  const postId = parseInt(req.params.postId, 10);
  const user = (req as any).user;
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }
  if (post.authorId !== user.id && !user.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  await db.delete(postsTable).where(eq(postsTable.id, postId));
  res.sendStatus(204);
});

router.post("/posts/:postId/like", requireAuth, async (req, res): Promise<void> => {
  const postId = parseInt(req.params.postId, 10);
  const user = (req as any).user;
  const [existing] = await db.select().from(likesTable).where(and(eq(likesTable.postId, postId), eq(likesTable.userId, user.id)));
  let liked: boolean;
  if (existing) {
    await db.delete(likesTable).where(and(eq(likesTable.postId, postId), eq(likesTable.userId, user.id)));
    await db.update(postsTable).set({ likeCount: sql`${postsTable.likeCount} - 1` }).where(eq(postsTable.id, postId));
    liked = false;
  } else {
    await db.insert(likesTable).values({ postId, userId: user.id });
    await db.update(postsTable).set({ likeCount: sql`${postsTable.likeCount} + 1` }).where(eq(postsTable.id, postId));
    liked = true;
  }
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  res.json({ liked, likeCount: post?.likeCount ?? 0 });
});

router.post("/posts/:postId/bookmark", requireAuth, async (req, res): Promise<void> => {
  const postId = parseInt(req.params.postId, 10);
  const user = (req as any).user;
  const [existing] = await db.select().from(bookmarksTable).where(and(eq(bookmarksTable.postId, postId), eq(bookmarksTable.userId, user.id)));
  if (existing) {
    await db.delete(bookmarksTable).where(and(eq(bookmarksTable.postId, postId), eq(bookmarksTable.userId, user.id)));
    res.json({ bookmarked: false });
  } else {
    await db.insert(bookmarksTable).values({ postId, userId: user.id });
    res.json({ bookmarked: true });
  }
});

router.get("/posts/:postId/comments", async (req, res): Promise<void> => {
  const postId = parseInt(req.params.postId, 10);
  const comments = await db.select().from(commentsTable).where(eq(commentsTable.postId, postId)).orderBy(commentsTable.createdAt);
  const formatted = await Promise.all(comments.map(async c => {
    const [author] = await db.select().from(usersTable).where(eq(usersTable.id, c.authorId));
    return {
      id: c.id, postId: c.postId, content: c.content, authorId: c.authorId,
      author: author ? formatUser(author) : { id: c.authorId, username: "unknown", name: "Unknown", bio: null, avatarUrl: null, skills: [], interests: [], postCount: 0, followerCount: 0, createdAt: new Date().toISOString() },
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    };
  }));
  res.json(formatted);
});

router.post("/posts/:postId/comments", requireAuth, async (req, res): Promise<void> => {
  const postId = parseInt(req.params.postId, 10);
  const parsed = CreateCommentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const user = (req as any).user;
  const [comment] = await db.insert(commentsTable).values({ postId, content: parsed.data.content, authorId: user.id }).returning();
  await db.update(postsTable).set({ commentCount: sql`${postsTable.commentCount} + 1` }).where(eq(postsTable.id, postId));
  res.status(201).json({
    id: comment.id, postId: comment.postId, content: comment.content, authorId: comment.authorId,
    author: formatUser(user),
    createdAt: comment.createdAt instanceof Date ? comment.createdAt.toISOString() : comment.createdAt,
  });
});

router.get("/bookmarks", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const bookmarks = await db.select().from(bookmarksTable).where(eq(bookmarksTable.userId, user.id));
  const posts = await Promise.all(bookmarks.map(b => getPostWithDetails(b.postId, user.id)));
  res.json(posts.filter(Boolean));
});

export default router;
