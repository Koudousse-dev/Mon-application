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
    
    // Try to make prestations.description nullable (may fail due to permissions in production)
    try {
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
    } catch (error: any) {
      // Only handle permission errors gracefully - re-throw everything else
      if (error.code === '42501') {
        console.log("⚠️  Could not modify prestations.description (insufficient permissions)");
        console.log("   This is expected in production - existing prestations already have descriptions");
      } else {
        console.error("❌ Unexpected error while modifying prestations.description:", error);
        throw error;
      }
    }
    
    // Add new columns to parent_requests table
    try {
      console.log("🔄 Checking parent_requests table columns...");
      
      const parentRequestsColumns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'parent_requests';
      `;
      
      const existingColumns = new Set(parentRequestsColumns.map((row: any) => row.column_name));
      
      if (!existingColumns.has('email')) {
        console.log("🔄 Adding email column to parent_requests...");
        await sql`ALTER TABLE parent_requests ADD COLUMN email text;`;
        console.log("✅ Added email column");
      }
      
      if (!existingColumns.has('ville')) {
        console.log("🔄 Adding ville column to parent_requests...");
        await sql`ALTER TABLE parent_requests ADD COLUMN ville text;`;
        console.log("✅ Added ville column");
      }
      
      if (!existingColumns.has('quartier')) {
        console.log("🔄 Adding quartier column to parent_requests...");
        await sql`ALTER TABLE parent_requests ADD COLUMN quartier text;`;
        console.log("✅ Added quartier column");
      }
      
      if (!existingColumns.has('ages_enfants')) {
        console.log("🔄 Adding ages_enfants column to parent_requests...");
        await sql`ALTER TABLE parent_requests ADD COLUMN ages_enfants text;`;
        console.log("✅ Added ages_enfants column");
      }
      
      console.log("✅ parent_requests table updated");
    } catch (error: any) {
      console.error("❌ Error updating parent_requests table:", error);
      throw error;
    }
    
    // Add new columns to clients table
    try {
      console.log("🔄 Checking clients table columns...");
      
      const clientsColumns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'clients';
      `;
      
      const existingColumns = new Set(clientsColumns.map((row: any) => row.column_name));
      
      if (!existingColumns.has('email')) {
        console.log("🔄 Adding email column to clients...");
        await sql`ALTER TABLE clients ADD COLUMN email text;`;
        console.log("✅ Added email column");
      }
      
      if (!existingColumns.has('ville')) {
        console.log("🔄 Adding ville column to clients...");
        await sql`ALTER TABLE clients ADD COLUMN ville text;`;
        console.log("✅ Added ville column");
      }
      
      if (!existingColumns.has('quartier')) {
        console.log("🔄 Adding quartier column to clients...");
        await sql`ALTER TABLE clients ADD COLUMN quartier text;`;
        console.log("✅ Added quartier column");
      }
      
      if (!existingColumns.has('ages_enfants')) {
        console.log("🔄 Adding ages_enfants column to clients...");
        await sql`ALTER TABLE clients ADD COLUMN ages_enfants text;`;
        console.log("✅ Added ages_enfants column");
      }
      
      console.log("✅ clients table updated");
    } catch (error: any) {
      console.error("❌ Error updating clients table:", error);
      throw error;
    }
    
    console.log("✅ Migrations completed successfully");
    console.log("   - banner_images table ready");
    console.log("   - push_subscriptions table ready");
    console.log("   - parent_requests table updated with new columns");
    console.log("   - clients table updated with new columns");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
