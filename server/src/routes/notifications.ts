import { Router } from "express";
import { db, notificationsTable, usersTable } from "../db/index.js";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

async function formatNotification(n: any) {
  let actor = null;
  if (n.actorId) {
    const [a] = await db.select().from(usersTable).where(eq(usersTable.id, n.actorId));
    if (a) actor = { id: a.id, username: a.username, name: a.name, bio: a.bio ?? null, avatarUrl: a.avatarUrl ?? null, skills: a.skills ?? [], interests: a.interests ?? [], postCount: 0, followerCount: 0, createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt };
  }
  return { id: n.id, type: n.type, message: n.message, isRead: n.isRead, actorId: n.actorId ?? null, actor, postId: n.postId ?? null, createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt };
}

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const notifications = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, user.id)).orderBy(desc(notificationsTable.createdAt)).limit(50);
  res.json(await Promise.all(notifications.map(formatNotification)));
});

router.put("/notifications/:notificationId/read", requireAuth, async (req, res): Promise<void> => {
  const notificationId = parseInt(req.params.notificationId, 10);
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, notificationId));
  res.json({ success: true });
});

router.put("/notifications/read-all", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, user.id));
  res.json({ success: true });
});

export default router;
