import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

async function runMigrations() {
  console.log("🔄 Starting database migrations...");
  
  try {
    const sql = neon(databaseUrl!);
    
    // Create banner_images table
    await sql`
      CREATE TABLE IF NOT EXISTS "banner_images" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "page_key" text NOT NULL,
        "image_url" text NOT NULL,
        "version" integer DEFAULT 0 NOT NULL,
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "banner_images_page_key_unique" UNIQUE("page_key")
      );
    `;
    
    // Create push_subscriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS "push_subscriptions" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" varchar NOT NULL,
        "endpoint" text NOT NULL,
        "p256dh" text NOT NULL,
        "auth" text NOT NULL,
        "created_at" timestamp DEFAULT now(),
        CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
      );
    `;
    
    // Check if prestations.description is still NOT NULL and drop constraint if needed
    const descriptionConstraint = await sql`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'prestations' 
      AND column_name = 'description';
    `;
    
    if (descriptionConstraint.length > 0 && descriptionConstraint[0].is_nullable === 'NO') {
      console.log("🔄 Making prestations.description nullable...");
      await sql`
        ALTER TABLE prestations 
        ALTER COLUMN description DROP NOT NULL;
      `;
      console.log("✅ prestations.description is now nullable");
    } else {
      console.log("✅ prestations.description already nullable (skipped)");
    }
    
    console.log("✅ Migrations completed successfully");
    console.log("   - banner_images table ready");
    console.log("   - push_subscriptions table ready");
    console.log("   - prestations schema updated");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
