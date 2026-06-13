const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/bot.db');
const db = new Database(dbPath);

console.log('🗑️  Dropping old marketplace tables...\n');

try {
  db.exec(`
    DROP TABLE IF EXISTS marketplace_transactions;
    DROP TABLE IF EXISTS marketplace_listings;
    DROP TABLE IF EXISTS user_inventory;
    DROP TABLE IF EXISTS registered_items;
  `);
  
  console.log('✅ Tables dropped successfully!\n');
} catch (error) {
  console.error('❌ Error:', error.message);
}

db.close();