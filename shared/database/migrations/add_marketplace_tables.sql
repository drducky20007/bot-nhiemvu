-- ========================================
-- TABLE: player_shops
-- ========================================
CREATE TABLE IF NOT EXISTS player_shops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id TEXT NOT NULL UNIQUE,         -- Discord user ID
  shop_name TEXT NOT NULL,               -- Tên shop
  description TEXT,                      -- Mô tả shop
  banner_url TEXT,                       -- URL banner (optional)
  commission_rate REAL DEFAULT 0.10,     -- Commission rate (10%)
  total_sales INTEGER DEFAULT 0,         -- Tổng số lần bán
  total_revenue INTEGER DEFAULT 0,       -- Tổng doanh thu
  rating REAL DEFAULT 5.0,               -- Đánh giá (1-5)
  is_active INTEGER DEFAULT 1,           -- 0 = closed, 1 = active
  is_featured INTEGER DEFAULT 0,         -- 0 = normal, 1 = featured
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABLE: marketplace_listings
-- ========================================
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_id INTEGER NOT NULL,              -- Shop ID
  seller_id TEXT NOT NULL,               -- Seller user ID
  item_name TEXT NOT NULL,               -- Tên item
  item_description TEXT,                 -- Mô tả item
  price INTEGER NOT NULL,                -- Giá (Ely)
  stock INTEGER DEFAULT 1,               -- Số lượng còn
  category TEXT,                         -- role, item, service, custom
  rarity TEXT,                           -- common, rare, epic, legendary
  image_url TEXT,                        -- URL hình ảnh (optional)
  metadata TEXT,                         -- JSON data (role_id, etc.)
  total_sold INTEGER DEFAULT 0,          -- Đã bán bao nhiêu
  views INTEGER DEFAULT 0,               -- Số lượt xem
  is_active INTEGER DEFAULT 1,           -- 0 = sold out/removed, 1 = active
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,                  -- Tự động ẩn sau X ngày
  FOREIGN KEY (shop_id) REFERENCES player_shops(id)
);

-- ========================================
-- TABLE: marketplace_transactions
-- ========================================
CREATE TABLE IF NOT EXISTS marketplace_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  buyer_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  price_paid INTEGER NOT NULL,
  commission INTEGER NOT NULL,           -- Commission lấy
  seller_received INTEGER NOT NULL,      -- Seller nhận được
  quantity INTEGER DEFAULT 1,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id)
);

-- ========================================
-- TABLE: shop_reviews
-- ========================================
CREATE TABLE IF NOT EXISTS shop_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_id INTEGER NOT NULL,
  reviewer_id TEXT NOT NULL,
  transaction_id INTEGER,                -- Link đến transaction
  rating INTEGER NOT NULL,               -- 1-5 stars
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES player_shops(id),
  FOREIGN KEY (transaction_id) REFERENCES marketplace_transactions(id),
  UNIQUE(reviewer_id, transaction_id)    -- 1 review per transaction
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_player_shops_owner ON player_shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_active ON marketplace_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_buyer ON marketplace_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_seller ON marketplace_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_shop_reviews_shop ON shop_reviews(shop_id);