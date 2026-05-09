import "dotenv/config";
import { db, usersTable, postsTable, portfolioItemsTable, servicesTable, testimonialsTable } from "./index.js";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "genz_salt_2024").digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  const [existing] = await db.select().from(usersTable).limit(1);
  if (existing) {
    console.log("Database already seeded, skipping.");
    return;
  }

  const [admin] = await db.insert(usersTable).values({
    username: "genzadmin",
    email: "admin@genzmediax.com",
    passwordHash: hashPassword("admin123"),
    name: "GenZ Media X",
    bio: "Official GenZ Media X account",
    skills: ["Content Creation", "Social Media", "Video Production"],
    interests: ["Photography", "Travel", "Technology"],
    isAdmin: true,
  }).returning();

  const categories = ["travelling", "creator", "photography", "videography", "work", "book-reading"];
  const samplePosts = [
    { content: "Exploring the world one destination at a time! Travel is the best education.", category: "travelling" },
    { content: "Content creation tips: Consistency is key. Post daily and engage with your community!", category: "creator" },
    { content: "Golden hour photography — the magic happens in those 30 minutes after sunrise.", category: "photography" },
    { content: "Just wrapped up a new short film. Video storytelling is an art form.", category: "videography" },
    { content: "Looking for freelance opportunities in social media management. Check my portfolio!", category: "work" },
    { content: "Currently reading 'Atomic Habits' by James Clear. Life-changing book!", category: "book-reading" },
  ];

  for (const p of samplePosts) {
    await db.insert(postsTable).values({ ...p, authorId: admin.id, isFeatured: false });
  }

  await db.insert(servicesTable).values([
    { name: "Content Creation", description: "Professional content for your brand", icon: "Sparkles", price: "₹5,000/month", features: ["10 posts/month", "Caption writing", "Hashtag research", "Analytics report"] },
    { name: "Social Media Management", description: "Full management of your social accounts", icon: "Share2", price: "₹10,000/month", features: ["All platforms", "Daily posting", "Community management", "Monthly report"] },
    { name: "Video Production", description: "High-quality video content creation", icon: "Video", price: "₹15,000/video", features: ["Script writing", "Filming", "Editing", "Color grading"] },
  ]);

  await db.insert(testimonialsTable).values([
    { name: "Rahul Sharma", role: "Small Business Owner", content: "GenZ Media X transformed our social media presence completely!", rating: 5 },
    { name: "Priya Patel", role: "Influencer", content: "The content quality is outstanding. Highly recommend!", rating: 5 },
  ]);

  console.log("Database seeded successfully!");
  console.log("Admin credentials: admin@genzmediax.com / admin123");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
