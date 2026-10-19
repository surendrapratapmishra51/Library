import { syncDatabase } from '../models/index.js';

async function runMigration() {
  console.log('🔄 [Sequelize Migration] Starting database schema synchronization...');
  try {
    await syncDatabase();
    console.log('✅ [Sequelize Migration] All models and tables synchronized and seeded successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ [Sequelize Migration Failed]:', error.message);
    process.exit(1);
  }
}

runMigration();
