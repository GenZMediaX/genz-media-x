import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const requirementsTable = pgTable("requirements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  authorId: integer("author_id").notNull(),
  responseCount: integer("response_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
