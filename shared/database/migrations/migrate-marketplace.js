<<<<<<< HEAD
<<<<<<< HEAD
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../../data/bot.db');
const db = new Database(dbPath);

console.log('🔄 Chạy migration: Marketplace System...\n');

const sqlPath = path.join(__dirname, 'add_marketplace_tables.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

try {
  db.exec(sql);
  console.log('✅ Migration thành công!');
  console.log('   - Table: player_shops');
  console.log('   - Table: marketplace_listings');
  console.log('   - Table: marketplace_transactions');
  console.log('   - Table: shop_reviews');
  console.log('   - Indexes created\n');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name IN (
    'player_shops', 
    'marketplace_listings', 
    'marketplace_transactions', 
    'shop_reviews'
  )
`).all();

console.log('📊 Verification:');
tables.forEach(t => console.log(`   ✅ ${t.name}`));

db.close();
=======
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../../data/bot.db');
const db = new Database(dbPath);

console.log('🔄 Chạy migration: Marketplace System...\n');

const sqlPath = path.join(__dirname, 'add_marketplace_tables.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

try {
  db.exec(sql);
  console.log('✅ Migration thành công!');
  console.log('   - Table: player_shops');
  console.log('   - Table: marketplace_listings');
  console.log('   - Table: marketplace_transactions');
  console.log('   - Table: shop_reviews');
  console.log('   - Indexes created\n');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name IN (
    'player_shops', 
    'marketplace_listings', 
    'marketplace_transactions', 
    'shop_reviews'
  )
`).all();

console.log('📊 Verification:');
tables.forEach(t => console.log(`   ✅ ${t.name}`));

db.close();
>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
=======
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../../data/bot.db');
const db = new Database(dbPath);

console.log('🔄 Chạy migration: Marketplace System...\n');

const sqlPath = path.join(__dirname, 'add_marketplace_tables.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

try {
  db.exec(sql);
  console.log('✅ Migration thành công!');
  console.log('   - Table: player_shops');
  console.log('   - Table: marketplace_listings');
  console.log('   - Table: marketplace_transactions');
  console.log('   - Table: shop_reviews');
  console.log('   - Indexes created\n');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name IN (
    'player_shops', 
    'marketplace_listings', 
    'marketplace_transactions', 
    'shop_reviews'
  )
`).all();

console.log('📊 Verification:');
tables.forEach(t => console.log(`   ✅ ${t.name}`));

db.close();
>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
console.log('\n✅ Migration hoàn thành!\n');