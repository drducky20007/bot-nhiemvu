const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../../data/bot.db');
const db = new Database(dbPath);

console.log('🔄 Chạy migration: Controlled Marketplace System...\n');

// ========================================
// OPTION 1: Đọc từ file SQL
// ========================================
const sqlPath = path.join(__dirname, 'add_controlled_marketplace.sql');

if (fs.existsSync(sqlPath)) {
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  try {
    db.exec(sql);
    console.log('✅ Migration từ file SQL thành công!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
} else {
  // ========================================
  // OPTION 2: Inline SQL (nếu không có file)
  // ========================================
  console.log('⚠️  File SQL không tồn tại, dùng inline SQL...\n');
  
  try {
    // TABLE 1: registered_items
    db.exec(`
      CREATE TABLE IF NOT EXISTS registered_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        rarity TEXT DEFAULT 'common',
        is_tradeable INTEGER DEFAULT 1,
        base_price INTEGER DEFAULT 0,
        metadata TEXT,
        image_url TEXT,
        created_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table: registered_items');

    // TABLE 2: user_inventory
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        obtained_from TEXT DEFAULT 'unknown',
        obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_equipped INTEGER DEFAULT 0,
        is_locked INTEGER DEFAULT 0,
        metadata TEXT,
        FOREIGN KEY (item_id) REFERENCES registered_items(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Table: user_inventory');

    // TABLE 3: marketplace_listings
    db.exec(`
      CREATE TABLE IF NOT EXISTS marketplace_listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id TEXT NOT NULL,
        inventory_id INTEGER NOT NULL,
        item_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        item_rarity TEXT DEFAULT 'common',
        price INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        views INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (inventory_id) REFERENCES user_inventory(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES registered_items(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Table: marketplace_listings');

    // TABLE 4: marketplace_transactions
    db.exec(`
      CREATE TABLE IF NOT EXISTS marketplace_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id INTEGER NOT NULL,
        buyer_id TEXT NOT NULL,
        seller_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        price_paid INTEGER NOT NULL,
        commission INTEGER NOT NULL,
        seller_received INTEGER NOT NULL,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id) ON DELETE SET NULL
      );
    `);
    console.log('✅ Table: marketplace_transactions');

    // INDEXES
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON user_inventory(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_inventory_item ON user_inventory(item_id);
      CREATE INDEX IF NOT EXISTS idx_user_inventory_locked ON user_inventory(is_locked);
      CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_id);
      CREATE INDEX IF NOT EXISTS idx_marketplace_listings_item ON marketplace_listings(item_id);
      CREATE INDEX IF NOT EXISTS idx_marketplace_listings_active ON marketplace_listings(is_active);
      CREATE INDEX IF NOT EXISTS idx_registered_items_tradeable ON registered_items(is_tradeable);
      CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_buyer ON marketplace_transactions(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_seller ON marketplace_transactions(seller_id);
    `);
    console.log('✅ Indexes created');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// ========================================
// VERIFY
// ========================================
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name IN (
    'registered_items',
    'user_inventory', 
    'marketplace_listings',
    'marketplace_transactions'
  )
`).all();

console.log('\n📊 Verification:');
tables.forEach(t => console.log(`   ✅ ${t.name}`));

// Check columns
console.log('\n🔍 Checking columns:');

const checkTable = (tableName) => {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  console.log(`\n   ${tableName}:`);
  columns.forEach(col => {
    console.log(`      - ${col.name} (${col.type})`);
  });
};

tables.forEach(t => checkTable(t.name));

db.close();
console.log('\n✅ Migration hoàn thành!\n');