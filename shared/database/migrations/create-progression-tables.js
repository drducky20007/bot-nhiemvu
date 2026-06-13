const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/bot.db');
const db = new Database(dbPath);

console.log('🔧 Creating user_stats and achievements tables...\n');

try {
  // =====================
  // 1. USER_STATS TABLE
  // =====================
  console.log('📝 Creating user_stats table...');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_stats (
      user_id TEXT PRIMARY KEY,
      
      -- Game stats
      total_games_played INTEGER DEFAULT 0,
      total_games_won INTEGER DEFAULT 0,
      total_bets_placed INTEGER DEFAULT 0,
      biggest_win INTEGER DEFAULT 0,
      biggest_loss INTEGER DEFAULT 0,
      
      -- Daily stats
      daily_streak INTEGER DEFAULT 0,
      last_daily_date TEXT,
      total_daily_claimed INTEGER DEFAULT 0,
      
      -- Mission stats
      total_missions_completed INTEGER DEFAULT 0,
      total_missions_failed INTEGER DEFAULT 0,
      mission_streak_days INTEGER DEFAULT 0,
      last_mission_completed_date TEXT,
      
      -- Marketplace stats
      total_items_bought INTEGER DEFAULT 0,
      total_items_sold INTEGER DEFAULT 0,
      
      -- Social stats
      messages_sent INTEGER DEFAULT 0,
      reactions_given INTEGER DEFAULT 0,
      
      -- Progression
      total_exp INTEGER DEFAULT 0,
      current_level INTEGER DEFAULT 1,
      points INTEGER DEFAULT 0,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);
  
  console.log('  ✅ user_stats table created');

  // =====================
  // 2. ACHIEVEMENTS TABLE
  // =====================
  console.log('\n📝 Creating achievements table...');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      requirement_type TEXT NOT NULL,
      requirement_value INTEGER NOT NULL,
      reward_ely INTEGER DEFAULT 0,
      reward_exp INTEGER DEFAULT 0,
      badge_emoji TEXT,
      rarity TEXT DEFAULT 'common',
      is_secret INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('  ✅ achievements table created');

  // =====================
  // 3. USER_ACHIEVEMENTS TABLE
  // =====================
  console.log('\n📝 Creating user_achievements table...');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      user_id TEXT NOT NULL,
      achievement_id TEXT NOT NULL,
      unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      progress INTEGER DEFAULT 0,
      
      PRIMARY KEY (user_id, achievement_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
    )
  `);
  
  console.log('  ✅ user_achievements table created');

  // =====================
  // 4. RANK_TIERS TABLE
  // =====================
  console.log('\n📝 Creating rank_tiers table...');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS rank_tiers (
      level INTEGER PRIMARY KEY,
      tier_name TEXT NOT NULL,
      tier_emoji TEXT,
      required_exp INTEGER NOT NULL,
      discord_role_id TEXT,
      color TEXT DEFAULT '#ffffff',
      perks TEXT
    )
  `);
  
  console.log('  ✅ rank_tiers table created');

  // =====================
  // 5. SEED DEFAULT DATA
  // =====================
  console.log('\n📝 Seeding default data...');

  // Insert mission achievements
  const achievements = [
    ['achievement_first_mission', '📝 Nhiệm Vụ Đầu Tiên', 'Hoàn thành nhiệm vụ đầu tiên', 'missions', 'total_missions_completed', 1, 500, 100, '📝', 'common', 0, 100],
    ['achievement_10_missions', '📋 Tác Giả', 'Hoàn thành 10 nhiệm vụ', 'missions', 'total_missions_completed', 10, 2000, 500, '📋', 'rare', 0, 101],
    ['achievement_50_missions', '✍️ Đại Văn Hào', 'Hoàn thành 50 nhiệm vụ', 'missions', 'total_missions_completed', 50, 10000, 2000, '✍️', 'epic', 0, 102],
    ['achievement_100_missions', '🏆 Mission Master', 'Hoàn thành 100 nhiệm vụ', 'missions', 'total_missions_completed', 100, 25000, 5000, '🏆', 'legendary', 0, 103],
    ['achievement_streak_7', '🔥 Week Warrior', '7-day mission streak', 'missions', 'mission_streak_days', 7, 5000, 1000, '🔥', 'rare', 0, 104],
    ['achievement_streak_30', '💫 Monthly Master', '30-day mission streak', 'missions', 'mission_streak_days', 30, 20000, 5000, '💫', 'legendary', 0, 105],
    
    // Game achievements
    ['achievement_first_win', '🎉 Chiến Thắng Đầu Tiên', 'Thắng game đầu tiên', 'games', 'total_games_won', 1, 300, 50, '🎉', 'common', 0, 200],
    ['achievement_100_games', '🎮 Game Veteran', 'Chơi 100 games', 'games', 'total_games_played', 100, 5000, 1000, '🎮', 'rare', 0, 201],
    ['achievement_big_win', '💰 Big Winner', 'Thắng 10,000 Ely trong 1 game', 'games', 'biggest_win', 10000, 3000, 500, '💰', 'epic', 0, 202],
    
    // Daily achievements
    ['achievement_daily_7', '📅 Week Collector', '7-day daily streak', 'daily', 'daily_streak', 7, 2000, 500, '📅', 'rare', 0, 300],
    ['achievement_daily_30', '🌟 Monthly Devotee', '30-day daily streak', 'daily', 'daily_streak', 30, 15000, 3000, '🌟', 'legendary', 0, 301]
  ];

  const insertAch = db.prepare(`
    INSERT OR IGNORE INTO achievements 
    (id, name, description, category, requirement_type, requirement_value, reward_ely, reward_exp, badge_emoji, rarity, is_secret, display_order) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  achievements.forEach(ach => {
    insertAch.run(...ach);
    console.log(`  ✅ ${ach[1]}`);
  });

  // Insert rank tiers
  console.log('\n📝 Seeding rank tiers...');
  
  const ranks = [
    [1, 'Newbie', '🌱', 0, null, '#95a5a6'],
    [5, 'Explorer', '🔍', 2000, null, '#3498db'],
    [10, 'Adventurer', '⚔️', 5000, null, '#2ecc71'],
    [15, 'Warrior', '🛡️', 10000, null, '#f39c12'],
    [20, 'Champion', '🏆', 20000, null, '#e74c3c'],
    [30, 'Legend', '⭐', 50000, null, '#9b59b6'],
    [50, 'Master', '👑', 100000, null, '#f1c40f']
  ];

  const insertRank = db.prepare(`
    INSERT OR IGNORE INTO rank_tiers (level, tier_name, tier_emoji, required_exp, discord_role_id, color) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  ranks.forEach(rank => {
    insertRank.run(...rank);
    console.log(`  ✅ Level ${rank[0]}: ${rank[2]} ${rank[1]}`);
  });

  console.log('\n✅ All tables and data created!\n');

  // Verify
  console.log('📊 Verification:\n');
  
  const tables = ['user_stats', 'achievements', 'user_achievements', 'rank_tiers'];
  tables.forEach(table => {
    const exists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table);
    if (exists) {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
      console.log(`  ✅ ${table}: ${count.count} rows`);
    } else {
      console.log(`  ❌ ${table}: NOT FOUND`);
    }
  });

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}

db.close();
console.log('\n🎉 Setup complete!\n');
