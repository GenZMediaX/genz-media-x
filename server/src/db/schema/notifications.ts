import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  userId: integer("user_id").notNull(),
  actorId: integer("actor_id"),
  postId: integer("post_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
