import { Router } from "express";
import { db, postsTable } from "../db/index.js";
import { count, eq } from "drizzle-orm";

const router = Router();

const CATEGORIES = [
  { id: "travelling", name: "Travelling", description: "Explore the world and share your adventures", icon: "Plane" },
  { id: "creator", name: "Creator", description: "Content creation tips, tools, and inspiration", icon: "Sparkles" },
  { id: "social-media-management", name: "Social Media Management", description: "Grow and manage your social presence", icon: "Share2" },
  { id: "book-reading", name: "Book Reading", description: "Reviews, recommendations, and reading lists", icon: "BookOpen" },
  { id: "work", name: "Work", description: "Portfolio, services, and career opportunities", icon: "Briefcase" },
  { id: "requirements", name: "Requirements", description: "Post your needs and find solutions", icon: "ClipboardList" },
  { id: "nearby-places", name: "Nearby Places", description: "Discover amazing places near you", icon: "MapPin" },
  { id: "nearby-hotels", name: "Nearby Hotels", description: "Find the best accommodations", icon: "Building" },
  { id: "nearby-temples", name: "Nearby Temples", description: "Explore spiritual and cultural sites", icon: "Landmark" },
  { id: "medical-awareness", name: "Medical Awareness", description: "Health tips, news, and awareness", icon: "HeartPulse" },
  { id: "videography", name: "Videography", description: "Video creation, editing, and production", icon: "Video" },
  { id: "photography", name: "Photography", description: "Capture and share beautiful moments", icon: "Camera" },
];

router.get("/categories", async (_req, res): Promise<void> => {
  const postCounts = await db.select({ category: postsTable.category, count: count() })
    .from(postsTable).groupBy(postsTable.category);
  const countMap = new Map(postCounts.map(r => [r.category, Number(r.count)]));
  res.json(CATEGORIES.map(cat => ({ ...cat, postCount: countMap.get(cat.id) ?? 0, coverImageUrl: null })));
});

export default router;
