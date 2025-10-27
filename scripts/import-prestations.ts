import { readFileSync } from 'fs';
import { read, utils } from 'xlsx';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { prestations } from '../shared/schema';

const initDb = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }
  const sql = neon(databaseUrl);
  return drizzle(sql);
};

const db = initDb();

async function importPrestations() {
  try {
    console.log('📖 Lecture du fichier Excel...');
    
    const buffer = readFileSync('attached_assets/Prestations_Dieu_Veille_Sur_Nos_Enfants_1760647484804.xlsx');
    const workbook = read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = utils.sheet_to_json(worksheet);
    
    console.log(`✅ ${data.length} lignes trouvées dans le fichier`);
    console.log('\n📋 Aperçu des colonnes:');
    if (data.length > 0) {
      const firstRow = data[0] as Record<string, any>;
      console.log(Object.keys(firstRow));
      console.log('\n📋 Première ligne:');
      console.log(firstRow);
    }
    
    console.log('\n💾 Importation dans la base de données...');
    
    let importCount = 0;
    
    for (const row of data as any[]) {
      const nom = row['Prestation'];
      const prixStr = row['Prix client'];
      
      if (!nom || !prixStr) {
        console.log(`⚠️  Ligne ignorée (données manquantes):`, row);
        continue;
      }
      
      const prixClean = String(prixStr).replace(/[^\d]/g, '');
      const prix = parseFloat(prixClean);
      
      if (isNaN(prix)) {
        console.log(`⚠️  Prix invalide pour "${nom}":`, prixStr);
        continue;
      }
      
      const description = `Service de ${nom.toLowerCase()}`;
      
      await db.insert(prestations).values({
        nom,
        prix,
        description,
      });
      
      importCount++;
      console.log(`✅ Importé: ${nom} - ${prix} FCFA`);
    }
    
    console.log(`\n🎉 Import terminé! ${importCount} prestations ajoutées.`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    process.exit(1);
  }
}

importPrestations();
