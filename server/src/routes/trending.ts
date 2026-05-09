import { Router } from "express";
import { db, postsTable, usersTable, likesTable, bookmarksTable } from "../db/index.js";
import { desc, eq } from "drizzle-orm";

const router = Router();

router.get("/trending", async (_req, res): Promise<void> => {
  const posts = await db.select().from(postsTable).orderBy(desc(postsTable.likeCount)).limit(5);
  const formatted = await Promise.all(posts.map(async post => {
    const [author] = await db.select().from(usersTable).where(eq(usersTable.id, post.authorId));
    return {
      id: post.id, content: post.content, imageUrl: post.imageUrl ?? null,
      videoUrl: post.videoUrl ?? null, category: post.category, authorId: post.authorId,
      author: author ? {
        id: author.id, username: author.username, name: author.name,
        bio: author.bio ?? null, avatarUrl: author.avatarUrl ?? null,
        skills: author.skills ?? [], interests: author.interests ?? [],
        postCount: 0, followerCount: 0,
        createdAt: author.createdAt instanceof Date ? author.createdAt.toISOString() : author.createdAt,
      } : null,
      likeCount: post.likeCount, commentCount: post.commentCount, shareCount: post.shareCount,
      isLiked: false, isBookmarked: false, isFeatured: post.isFeatured,
      createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
    };
  }));
  res.json(formatted);
});

router.get("/feed/summary", async (_req, res): Promise<void> => {
  const totalPosts = await db.select().from(postsTable);
  const totalUsers = await db.select().from(usersTable);
  res.json({
    totalPosts: totalPosts.length,
    totalUsers: totalUsers.length,
    totalCategories: 12,
  });
});

export default router;
