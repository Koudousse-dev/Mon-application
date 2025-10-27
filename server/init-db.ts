import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { adminUsers } from "@shared/schema";
import bcrypt from "bcryptjs";

const initDb = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }
  const sql = neon(databaseUrl);
  return drizzle(sql);
};

export async function ensureAdminExists() {
  try {
    const db = initDb();
    
    // Check if admin user exists
    const [existingAdmin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, "admin"))
      .limit(1);
    
    if (existingAdmin) {
      console.log("✓ Admin user already exists");
      return;
    }
    
    // Create default admin user
    const passwordHash = await bcrypt.hash("admin123", 10);
    
    await db.insert(adminUsers).values({
      username: "admin",
      nom: "Administrateur",
      email: "admin@gardedesenfantsgabon.com",
      passwordHash,
      role: "admin",
    });
    
    console.log("✓ Default admin user created successfully (username: admin)");
    console.log("⚠️  IMPORTANT: Change the default admin password immediately via /admin/profile");
  } catch (error) {
    console.error("Error initializing admin user:", error);
    // Don't throw - we don't want to crash the app if admin creation fails
  }
}
