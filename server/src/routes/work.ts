import { Router } from "express";
import { db, portfolioItemsTable, servicesTable, testimonialsTable, contactFormsTable } from "../db/index.js";
import { desc } from "drizzle-orm";
import { z } from "zod";

const router = Router();
const ContactFormBody = z.object({ name: z.string(), email: z.string().email(), requirement: z.string(), phone: z.string().optional() });

router.get("/work/portfolio", async (_req, res): Promise<void> => {
  const items = await db.select().from(portfolioItemsTable).orderBy(desc(portfolioItemsTable.createdAt));
  res.json(items.map(i => ({ id: i.id, title: i.title, description: i.description, category: i.category, thumbnailUrl: i.thumbnailUrl, videoUrl: i.videoUrl ?? null, tags: i.tags ?? [], isFeatured: i.isFeatured })));
});

router.get("/work/services", async (_req, res): Promise<void> => {
  const services = await db.select().from(servicesTable);
  res.json(services.map(s => ({ id: s.id, name: s.name, description: s.description, icon: s.icon, price: s.price, features: s.features ?? [] })));
});

router.get("/work/testimonials", async (_req, res): Promise<void> => {
  const testimonials = await db.select().from(testimonialsTable).orderBy(desc(testimonialsTable.createdAt));
  res.json(testimonials.map(t => ({ id: t.id, name: t.name, role: t.role, content: t.content, rating: t.rating, avatarUrl: t.avatarUrl ?? null })));
});

router.post("/work/contact", async (req, res): Promise<void> => {
  const parsed = ContactFormBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  await db.insert(contactFormsTable).values({ name: parsed.data.name, email: parsed.data.email, requirement: parsed.data.requirement, phone: parsed.data.phone });
  res.status(201).json({ success: true });
});

export default router;
