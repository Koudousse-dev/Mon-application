/**
 * Script de migration de base de données pour Render
 * 
 * Ce script utilise Drizzle Kit pour pousser le schéma vers PostgreSQL
 * Exécution: npm run db:migrate (ou directement: tsx scripts/migrate.ts)
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function migrate() {
  console.log('🔄 Démarrage de la migration de la base de données...');
  
  // Vérifier que DATABASE_URL est défini
  if (!process.env.DATABASE_URL) {
    console.error('❌ Erreur: DATABASE_URL n\'est pas défini');
    console.error('   Définissez DATABASE_URL dans vos variables d\'environnement');
    process.exit(1);
  }

  console.log('✓ DATABASE_URL détecté');
  console.log(`  Host: ${new URL(process.env.DATABASE_URL).hostname}`);
  
  try {
    console.log('\n📊 Push du schéma Drizzle vers PostgreSQL...');
    
    // Utiliser drizzle-kit push pour synchroniser le schéma
    // Cela crée automatiquement toutes les tables définies dans shared/schema.ts
    const { stdout, stderr } = await execAsync('npx drizzle-kit push --force');
    
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
    
    console.log('\n✅ Migration terminée avec succès!');
    console.log('   Toutes les tables ont été créées/mises à jour');
    console.log('\n📝 Tables créées:');
    console.log('   - parent_requests');
    console.log('   - nanny_applications');
    console.log('   - contact_messages');
    console.log('   - payments');
    console.log('   - admin_users');
    console.log('   - notifications');
    console.log('   - prestations');
    console.log('   - parametres_site');
    console.log('   - employees');
    console.log('   - paiements_employes');
    console.log('   - payment_configs');
    console.log('   - session (créée automatiquement par connect-pg-simple)');
    
    console.log('\n💡 Prochaine étape:');
    console.log('   Un compte admin sera créé automatiquement au premier démarrage');
    console.log('   Credentials: admin / admin123 (à changer après connexion)');
    
  } catch (error: any) {
    console.error('\n❌ Erreur lors de la migration:');
    console.error(error.message);
    console.error('\n💡 Suggestions:');
    console.error('   1. Vérifiez que DATABASE_URL est correct');
    console.error('   2. Vérifiez que la base de données est accessible');
    console.error('   3. Vérifiez les permissions de l\'utilisateur PostgreSQL');
    process.exit(1);
  }
}

migrate();
