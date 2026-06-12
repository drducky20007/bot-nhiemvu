-- =============================================
-- UPDATE missions TABLE
-- =============================================

ALTER TABLE missions ADD COLUMN IF NOT EXISTS min_words INTEGER DEFAULT 500;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS reward_exp INTEGER DEFAULT 0;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'normal';
ALTER TABLE missions ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '📝';
ALTER TABLE missions ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1;

-- =============================================
-- UPDATE user_missions TABLE
-- =============================================

ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS thread_id TEXT;
ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS thread_url TEXT;
ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP;
ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- =============================================
-- UPDATE task_logs TABLE
-- =============================================

ALTER TABLE task_logs ADD COLUMN IF NOT EXISTS reward_ely INTEGER DEFAULT 0;
ALTER TABLE task_logs ADD COLUMN IF NOT EXISTS reward_exp INTEGER DEFAULT 0;
ALTER TABLE task_logs ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;
ALTER TABLE task_logs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- =============================================
-- UPDATE user_stats FOR MISSIONS
-- =============================================

ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS total_missions_completed INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS total_missions_failed INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS mission_streak_days INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS last_mission_completed_date TEXT;

-- =============================================
-- MISSION ACHIEVEMENTS
-- =============================================

INSERT OR IGNORE INTO achievements (id, name, description, category, requirement_type, requirement_value, reward_ely, badge_emoji, rarity, display_order) VALUES
  ('achievement_first_mission', '📝 Nhiệm Vụ Đầu Tiên', 'Hoàn thành nhiệm vụ đầu tiên', 'missions', 'total_missions_completed', 1, 500, '📝', 'common', 100),
  ('achievement_10_missions', '📋 Tác Giả', 'Hoàn thành 10 nhiệm vụ', 'missions', 'total_missions_completed', 10, 2000, '📋', 'rare', 101),
  ('achievement_50_missions', '✍️ Đại Văn Hào', 'Hoàn thành 50 nhiệm vụ', 'missions', 'total_missions_completed', 50, 10000, '✍️', 'epic', 102),
  ('achievement_100_missions', '🏆 Mission Master', 'Hoàn thành 100 nhiệm vụ', 'missions', 'total_missions_completed', 100, 25000, '🏆', 'legendary', 103),
  ('achievement_streak_7', '🔥 Week Warrior', '7-day mission streak', 'missions', 'mission_streak_days', 7, 5000, '🔥', 'rare', 104),
  ('achievement_streak_30', '💫 Monthly Master', '30-day mission streak', 'missions', 'mission_streak_days', 30, 20000, '💫', 'legendary', 105);