const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/bot.db');
const db = new Database(dbPath);

console.log('🔄 Adding last_daily column to users table...\n');

try {
  // Check if column exists
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasColumn = tableInfo.some(col => col.name === 'last_daily');

  if (hasColumn) {
    console.log('✅ Column last_daily already exists!');
  } else {
    // Add column
    db.prepare('ALTER TABLE users ADD COLUMN last_daily TIMESTAMP').run();
    console.log('✅ Added column: last_daily');
  }

  console.log('\n✅ Migration completed!\n');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

db.close();