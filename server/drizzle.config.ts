import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Check your .env file.");
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
