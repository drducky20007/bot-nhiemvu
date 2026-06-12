-- Role rewards configuration
CREATE TABLE IF NOT EXISTS role_rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reward_type TEXT NOT NULL,           -- 'level', 'achievement', 'wealth', 'special'
  requirement_type TEXT NOT NULL,       -- 'level', 'balance', 'achievement_id'
  requirement_value TEXT NOT NULL,      -- '10', '100000', 'achievement_millionaire'
  role_id TEXT NOT NULL,               -- Discord role ID
  role_name TEXT NOT NULL,             -- Tên role (để dễ quản lý)
  role_color TEXT,                     -- Hex color (optional)
  auto_remove_previous INTEGER DEFAULT 0, -- Có tự động xóa role rank trước không
  priority INTEGER DEFAULT 0,          -- Thứ tự ưu tiên (cao hơn = hiển thị cao hơn)
  is_active INTEGER DEFAULT 1
);

-- Index
CREATE INDEX IF NOT EXISTS idx_role_rewards_type ON role_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_role_rewards_active ON role_rewards(is_active);

-- User role tracking
CREATE TABLE IF NOT EXISTS user_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  role_reward_id INTEGER,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_reward_id) REFERENCES role_rewards(id),
  UNIQUE(user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);