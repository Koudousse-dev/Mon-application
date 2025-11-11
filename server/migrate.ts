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
      if (error.code === '42501') {
        console.log("⚠️  Could not modify parent_requests table (insufficient permissions)");
        console.log("   Please add columns manually via Neon Console");
      } else {
        console.error("❌ Error updating parent_requests table:", error);
        throw error;
      }
    }
    
    // Create clients table if it doesn't exist, or add columns if it does
    try {
      console.log("🔄 Checking clients table...");
      
      // Try to create the table first (will skip if exists)
      await sql`
        CREATE TABLE IF NOT EXISTS "clients" (
          "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "demande_id" varchar NOT NULL UNIQUE,
          "nom" text NOT NULL,
          "email" text,
          "telephone" text NOT NULL,
          "adresse" text NOT NULL,
          "ville" text,
          "quartier" text,
          "nombre_enfants" integer NOT NULL,
          "ages_enfants" text,
          "type_service" text NOT NULL,
          "horaire_debut" text,
          "horaire_fin" text,
          "forfait" text NOT NULL,
          "commentaires" text,
          "actif" boolean DEFAULT true,
          "date_inscription" timestamp DEFAULT now()
        );
      `;
      console.log("✅ clients table ready");
      
      // Then try to add missing columns (if table existed but was incomplete)
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
      
      console.log("✅ clients table fully updated");
    } catch (error: any) {
      if (error.code === '42501') {
        console.log("⚠️  Could not modify clients table (insufficient permissions)");
        console.log("   Please create/modify table manually via Neon Console");
      } else {
        console.error("❌ Error with clients table:", error);
        throw error;
      }
    }
    
    // Add CNI columns to nanny_applications table
    try {
      console.log("🔄 Checking nanny_applications table columns...");
      
      const nannyColumns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'nanny_applications';
      `;
      
      const existingColumns = new Set(nannyColumns.map((row: any) => row.column_name));
      
      if (!existingColumns.has('carte_identite_recto_url')) {
        console.log("🔄 Adding carte_identite_recto_url column to nanny_applications...");
        await sql`ALTER TABLE nanny_applications ADD COLUMN carte_identite_recto_url text;`;
        console.log("✅ Added carte_identite_recto_url column");
      }
      
      if (!existingColumns.has('carte_identite_verso_url')) {
        console.log("🔄 Adding carte_identite_verso_url column to nanny_applications...");
        await sql`ALTER TABLE nanny_applications ADD COLUMN carte_identite_verso_url text;`;
        console.log("✅ Added carte_identite_verso_url column");
      }
      
      console.log("✅ nanny_applications table updated");
    } catch (error: any) {
      if (error.code === '42501') {
        console.log("⚠️  Could not modify nanny_applications table (insufficient permissions)");
        console.log("   Please add CNI columns manually via Neon Console");
      } else {
        console.error("❌ Error updating nanny_applications table:", error);
        throw error;
      }
    }
    
    // Add CNI columns to employees table
    try {
      console.log("🔄 Checking employees table columns...");
      
      const employeeColumns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'employees';
      `;
      
      const existingColumns = new Set(employeeColumns.map((row: any) => row.column_name));
      
      if (!existingColumns.has('carte_identite_recto_url')) {
        console.log("🔄 Adding carte_identite_recto_url column to employees...");
        await sql`ALTER TABLE employees ADD COLUMN carte_identite_recto_url text;`;
        console.log("✅ Added carte_identite_recto_url column");
      }
      
      if (!existingColumns.has('carte_identite_verso_url')) {
        console.log("🔄 Adding carte_identite_verso_url column to employees...");
        await sql`ALTER TABLE employees ADD COLUMN carte_identite_verso_url text;`;
        console.log("✅ Added carte_identite_verso_url column");
      }
      
      console.log("✅ employees table updated");
    } catch (error: any) {
      if (error.code === '42501') {
        console.log("⚠️  Could not modify employees table (insufficient permissions)");
        console.log("   Please add CNI columns manually via Neon Console");
      } else {
        console.error("❌ Error updating employees table:", error);
        throw error;
      }
    }
    
    console.log("✅ Migrations completed successfully");
    console.log("   - banner_images table ready");
    console.log("   - push_subscriptions table ready");
    console.log("   - parent_requests table updated with new columns");
    console.log("   - clients table updated with new columns");
    console.log("   - nanny_applications table updated with CNI columns");
    console.log("   - employees table updated with CNI columns");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
