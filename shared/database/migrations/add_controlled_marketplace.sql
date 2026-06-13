<<<<<<< HEAD
<<<<<<< HEAD
-- ========================================
-- TABLE 1: registered_items (PHẢI TẠO TRƯỚC)
-- ========================================
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

-- ========================================
-- TABLE 2: user_inventory (TẠO SAU registered_items)
-- ========================================
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

-- ========================================
-- TABLE 3: marketplace_listings (TẠO SAU user_inventory)
-- ========================================
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

-- ========================================
-- TABLE 4: marketplace_transactions
-- ========================================
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

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item ON user_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_locked ON user_inventory(is_locked);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_item ON marketplace_listings(item_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_active ON marketplace_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_registered_items_tradeable ON registered_items(is_tradeable);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_buyer ON marketplace_transactions(buyer_id);
=======
-- ========================================
-- TABLE 1: registered_items (PHẢI TẠO TRƯỚC)
-- ========================================
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

-- ========================================
-- TABLE 2: user_inventory (TẠO SAU registered_items)
-- ========================================
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

-- ========================================
-- TABLE 3: marketplace_listings (TẠO SAU user_inventory)
-- ========================================
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

-- ========================================
-- TABLE 4: marketplace_transactions
-- ========================================
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

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item ON user_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_locked ON user_inventory(is_locked);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_item ON marketplace_listings(item_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_active ON marketplace_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_registered_items_tradeable ON registered_items(is_tradeable);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_buyer ON marketplace_transactions(buyer_id);
>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
=======
-- ========================================
-- TABLE 1: registered_items (PHẢI TẠO TRƯỚC)
-- ========================================
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

-- ========================================
-- TABLE 2: user_inventory (TẠO SAU registered_items)
-- ========================================
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

-- ========================================
-- TABLE 3: marketplace_listings (TẠO SAU user_inventory)
-- ========================================
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

-- ========================================
-- TABLE 4: marketplace_transactions
-- ========================================
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

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item ON user_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_locked ON user_inventory(is_locked);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_item ON marketplace_listings(item_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_active ON marketplace_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_registered_items_tradeable ON registered_items(is_tradeable);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_buyer ON marketplace_transactions(buyer_id);
>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_seller ON marketplace_transactions(seller_id);