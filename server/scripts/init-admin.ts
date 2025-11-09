import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { adminUsers } from "@shared/schema";
import bcrypt from "bcryptjs";

const initDb = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }
  const sql = neon(databaseUrl);
  return drizzle({ client: sql });
};

const db = initDb();

async function initAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.select().from(adminUsers).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log("Admin user already exists");
      return;
    }

    // Create default admin user
    const passwordHash = await bcrypt.hash("admin123", 10);
    
    const [admin] = await db.insert(adminUsers).values({
      username: "admin",
      passwordHash,
      nom: "Administrateur",
      email: "admin@gardedesenfantsgabon.com",
      role: "admin"
    }).returning();

    console.log("✅ Admin user created successfully");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("⚠️  Please change the password after first login");
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

initAdmin();
