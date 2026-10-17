import { initDatabase } from '../config/db.js';

async function runMigration() {
  console.log('🔄 [Migration] Starting database migration...');
  try {
    await initDatabase();
    console.log('✅ [Migration] All tables migrated and seeded successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ [Migration Failed]:', error.message);
    process.exit(1);
  }
}

runMigration();
