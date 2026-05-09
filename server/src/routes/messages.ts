import { Router } from "express";
import { db, conversationsTable, messagesTable, usersTable } from "../db/index.js";
import { eq, desc, or } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../lib/auth.js";

const router = Router();
const SendMessageBody = z.object({ content: z.string().min(1) });

function formatUser(user: any) {
  return { id: user.id, username: user.username, name: user.name, bio: user.bio ?? null, avatarUrl: user.avatarUrl ?? null, skills: user.skills ?? [], interests: user.interests ?? [], postCount: 0, followerCount: 0, createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt };
}

router.get("/messages", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const conversations = await db.select().from(conversationsTable).where(or(eq(conversationsTable.user1Id, user.id), eq(conversationsTable.user2Id, user.id))).orderBy(desc(conversationsTable.updatedAt));
  const formatted = await Promise.all(conversations.map(async c => {
    const participantId = c.user1Id === user.id ? c.user2Id : c.user1Id;
    const [participant] = await db.select().from(usersTable).where(eq(usersTable.id, participantId));
    const [lastMsg] = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, c.id)).orderBy(desc(messagesTable.createdAt)).limit(1);
    return { id: c.id, participant: participant ? formatUser(participant) : null, lastMessage: lastMsg?.content ?? null, unreadCount: 0, updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt };
  }));
  res.json(formatted);
});

router.get("/messages/:conversationId", requireAuth, async (req, res): Promise<void> => {
  const conversationId = parseInt(req.params.conversationId, 10);
  const user = (req as any).user;
  const [conversation] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, conversationId));
  if (!conversation) { res.status(404).json({ error: "Not found" }); return; }
  if (conversation.user1Id !== user.id && conversation.user2Id !== user.id) { res.status(403).json({ error: "Forbidden" }); return; }
  const messages = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, conversationId)).orderBy(messagesTable.createdAt);
  const formatted = await Promise.all(messages.map(async m => {
    const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, m.senderId));
    return { id: m.id, conversationId: m.conversationId, content: m.content, senderId: m.senderId, sender: sender ? formatUser(sender) : null, createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt };
  }));
  res.json(formatted);
});

router.post("/messages/:conversationId", requireAuth, async (req, res): Promise<void> => {
  const conversationId = parseInt(req.params.conversationId, 10);
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const user = (req as any).user;
  const [msg] = await db.insert(messagesTable).values({ conversationId, content: parsed.data.content, senderId: user.id }).returning();
  await db.update(conversationsTable).set({ updatedAt: new Date() }).where(eq(conversationsTable.id, conversationId));
  res.status(201).json({ id: msg.id, conversationId: msg.conversationId, content: msg.content, senderId: msg.senderId, sender: formatUser(user), createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt });
});

export default router;
