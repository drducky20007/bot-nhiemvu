<<<<<<< HEAD
<<<<<<< HEAD
const { db } = require('../database/db');
const logger = require('./logger');

/**
 * Check and award achievements for a user
 * @param {string} userId - Discord user ID
 * @param {string} category - Achievement category (games, missions, daily, etc.)
 * @returns {Array} - Array of newly unlocked achievements
 */
async function checkAndAwardAchievements(userId, category = null) {
  try {
    // Get user stats
    const userStats = db.prepare(`
      SELECT * FROM user_stats WHERE user_id = ?
    `).get(userId);

    if (!userStats) {
      return [];
    }

    // Get achievements to check
    let query = `
      SELECT a.* FROM achievements a
      WHERE a.id NOT IN (
        SELECT achievement_id FROM user_achievements WHERE user_id = ?
      )
    `;
    const params = [userId];

    if (category) {
      query += ` AND a.category = ?`;
      params.push(category);
    }

    const achievements = db.prepare(query).all(...params);
    const unlockedAchievements = [];

    for (const achievement of achievements) {
      const statValue = userStats[achievement.requirement_type] || 0;

      if (statValue >= achievement.requirement_value) {
        // Award achievement
        const unlockAchievement = db.prepare(`
          INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, progress)
          VALUES (?, ?, ?)
        `);

        unlockAchievement.run(userId, achievement.id, achievement.requirement_value);

        // Award rewards
        if (achievement.reward_ely > 0) {
          const updateBalance = db.prepare(`
            UPDATE users SET balance = balance + ? WHERE user_id = ?
          `);
          updateBalance.run(achievement.reward_ely, userId);
        }

        if (achievement.reward_exp > 0) {
          const updateExp = db.prepare(`
            UPDATE user_stats SET total_exp = total_exp + ? WHERE user_id = ?
          `);
          updateExp.run(achievement.reward_exp, userId);
        }

        // Log transaction
        const logTransaction = db.prepare(`
          INSERT INTO transactions (user_id, type, amount, description)
          VALUES (?, ?, ?, ?)
        `);
        logTransaction.run(
          userId,
          'achievement_reward',
          achievement.reward_ely,
          `Achievement: ${achievement.name}`
        );

        unlockedAchievements.push(achievement);

        logger.info('Achievement unlocked', {
          userId,
          achievement: achievement.id,
          rewards: {
            ely: achievement.reward_ely,
            exp: achievement.reward_exp
          }
        });
      }
    }

    return unlockedAchievements;
  } catch (error) {
    logger.error('Error checking achievements', { error: error.message, userId });
    return [];
  }
}

/**
 * Get user's unlocked achievements
 * @param {string} userId - Discord user ID
 * @returns {Array} - Array of unlocked achievements with details
 */
function getUserAchievements(userId) {
  try {
    const achievements = db.prepare(`
      SELECT 
        a.*,
        ua.unlocked_at,
        ua.progress
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
      ORDER BY ua.unlocked_at DESC
    `).all(userId);

    return achievements;
  } catch (error) {
    logger.error('Error getting user achievements', { error: error.message, userId });
    return [];
  }
}

/**
 * Get achievement progress for a user
 * @param {string} userId - Discord user ID
 * @param {string} achievementId - Achievement ID
 * @returns {Object} - Progress information
 */
function getAchievementProgress(userId, achievementId) {
  try {
    const achievement = db.prepare(`
      SELECT * FROM achievements WHERE id = ?
    `).get(achievementId);

    if (!achievement) {
      return null;
    }

    // Check if already unlocked
    const unlocked = db.prepare(`
      SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?
    `).get(userId, achievementId);

    if (unlocked) {
      return {
        unlocked: true,
        progress: achievement.requirement_value,
        required: achievement.requirement_value,
        percentage: 100
      };
    }

    // Get current progress
    const userStats = db.prepare(`
      SELECT * FROM user_stats WHERE user_id = ?
    `).get(userId);

    if (!userStats) {
      return {
        unlocked: false,
        progress: 0,
        required: achievement.requirement_value,
        percentage: 0
      };
    }

    const progress = userStats[achievement.requirement_type] || 0;
    const percentage = Math.min(100, Math.round((progress / achievement.requirement_value) * 100));

    return {
      unlocked: false,
      progress,
      required: achievement.requirement_value,
      percentage
    };
  } catch (error) {
    logger.error('Error getting achievement progress', { error: error.message, userId, achievementId });
    return null;
  }
}

/**
 * Format achievement for display
 * @param {Object} achievement - Achievement object
 * @param {Object} progress - Progress object (optional)
 * @returns {string} - Formatted achievement text
 */
function formatAchievement(achievement, progress = null) {
  let text = `${achievement.badge_emoji || '🏆'} **${achievement.name}**\n`;
  text += `*${achievement.description}*\n`;

  if (progress && !progress.unlocked) {
    text += `Progress: ${progress.progress}/${progress.required} (${progress.percentage}%)\n`;
  }

  const rewards = [];
  if (achievement.reward_ely > 0) {
    rewards.push(`${achievement.reward_ely.toLocaleString()} Ely`);
  }
  if (achievement.reward_exp > 0) {
    rewards.push(`${achievement.reward_exp.toLocaleString()} EXP`);
  }

  if (rewards.length > 0) {
    text += `Reward: ${rewards.join(', ')}`;
  }

  return text;
}

/**
 * Get all achievements by category
 * @param {string} category - Category name (optional)
 * @returns {Array} - Array of achievements
 */
function getAchievementsByCategory(category = null) {
  try {
    let query = `SELECT * FROM achievements`;
    const params = [];

    if (category) {
      query += ` WHERE category = ?`;
      params.push(category);
    }

    query += ` ORDER BY display_order, requirement_value`;

    return db.prepare(query).all(...params);
  } catch (error) {
    logger.error('Error getting achievements by category', { error: error.message, category });
    return [];
  }
}

module.exports = {
  checkAndAwardAchievements,
  getUserAchievements,
  getAchievementProgress,
  formatAchievement,
  getAchievementsByCategory
};
=======
const { db } = require('../database/db');
const logger = require('./logger');

/**
 * Check and award achievements for a user
 * @param {string} userId - Discord user ID
 * @param {string} category - Achievement category (games, missions, daily, etc.)
 * @returns {Array} - Array of newly unlocked achievements
 */
async function checkAndAwardAchievements(userId, category = null) {
  try {
    // Get user stats
    const userStats = db.prepare(`
      SELECT * FROM user_stats WHERE user_id = ?
    `).get(userId);

    if (!userStats) {
      return [];
    }

    // Get achievements to check
    let query = `
      SELECT a.* FROM achievements a
      WHERE a.id NOT IN (
        SELECT achievement_id FROM user_achievements WHERE user_id = ?
      )
    `;
    const params = [userId];

    if (category) {
      query += ` AND a.category = ?`;
      params.push(category);
    }

    const achievements = db.prepare(query).all(...params);
    const unlockedAchievements = [];

    for (const achievement of achievements) {
      const statValue = userStats[achievement.requirement_type] || 0;

      if (statValue >= achievement.requirement_value) {
        // Award achievement
        const unlockAchievement = db.prepare(`
          INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, progress)
          VALUES (?, ?, ?)
        `);

        unlockAchievement.run(userId, achievement.id, achievement.requirement_value);

        // Award rewards
        if (achievement.reward_ely > 0) {
          const updateBalance = db.prepare(`
            UPDATE users SET balance = balance + ? WHERE user_id = ?
          `);
          updateBalance.run(achievement.reward_ely, userId);
        }

        if (achievement.reward_exp > 0) {
          const updateExp = db.prepare(`
            UPDATE user_stats SET total_exp = total_exp + ? WHERE user_id = ?
          `);
          updateExp.run(achievement.reward_exp, userId);
        }

        // Log transaction
        const logTransaction = db.prepare(`
          INSERT INTO transactions (user_id, type, amount, description)
          VALUES (?, ?, ?, ?)
        `);
        logTransaction.run(
          userId,
          'achievement_reward',
          achievement.reward_ely,
          `Achievement: ${achievement.name}`
        );

        unlockedAchievements.push(achievement);

        logger.info('Achievement unlocked', {
          userId,
          achievement: achievement.id,
          rewards: {
            ely: achievement.reward_ely,
            exp: achievement.reward_exp
          }
        });
      }
    }

    return unlockedAchievements;
  } catch (error) {
    logger.error('Error checking achievements', { error: error.message, userId });
    return [];
  }
}

/**
 * Get user's unlocked achievements
 * @param {string} userId - Discord user ID
 * @returns {Array} - Array of unlocked achievements with details
 */
function getUserAchievements(userId) {
  try {
    const achievements = db.prepare(`
      SELECT 
        a.*,
        ua.unlocked_at,
        ua.progress
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
      ORDER BY ua.unlocked_at DESC
    `).all(userId);

    return achievements;
  } catch (error) {
    logger.error('Error getting user achievements', { error: error.message, userId });
    return [];
  }
}

/**
 * Get achievement progress for a user
 * @param {string} userId - Discord user ID
 * @param {string} achievementId - Achievement ID
 * @returns {Object} - Progress information
 */
function getAchievementProgress(userId, achievementId) {
  try {
    const achievement = db.prepare(`
      SELECT * FROM achievements WHERE id = ?
    `).get(achievementId);

    if (!achievement) {
      return null;
    }

    // Check if already unlocked
    const unlocked = db.prepare(`
      SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?
    `).get(userId, achievementId);

    if (unlocked) {
      return {
        unlocked: true,
        progress: achievement.requirement_value,
        required: achievement.requirement_value,
        percentage: 100
      };
    }

    // Get current progress
    const userStats = db.prepare(`
      SELECT * FROM user_stats WHERE user_id = ?
    `).get(userId);

    if (!userStats) {
      return {
        unlocked: false,
        progress: 0,
        required: achievement.requirement_value,
        percentage: 0
      };
    }

    const progress = userStats[achievement.requirement_type] || 0;
    const percentage = Math.min(100, Math.round((progress / achievement.requirement_value) * 100));

    return {
      unlocked: false,
      progress,
      required: achievement.requirement_value,
      percentage
    };
  } catch (error) {
    logger.error('Error getting achievement progress', { error: error.message, userId, achievementId });
    return null;
  }
}

/**
 * Format achievement for display
 * @param {Object} achievement - Achievement object
 * @param {Object} progress - Progress object (optional)
 * @returns {string} - Formatted achievement text
 */
function formatAchievement(achievement, progress = null) {
  let text = `${achievement.badge_emoji || '🏆'} **${achievement.name}**\n`;
  text += `*${achievement.description}*\n`;

  if (progress && !progress.unlocked) {
    text += `Progress: ${progress.progress}/${progress.required} (${progress.percentage}%)\n`;
  }

  const rewards = [];
  if (achievement.reward_ely > 0) {
    rewards.push(`${achievement.reward_ely.toLocaleString()} Ely`);
  }
  if (achievement.reward_exp > 0) {
    rewards.push(`${achievement.reward_exp.toLocaleString()} EXP`);
  }

  if (rewards.length > 0) {
    text += `Reward: ${rewards.join(', ')}`;
  }

  return text;
}

/**
 * Get all achievements by category
 * @param {string} category - Category name (optional)
 * @returns {Array} - Array of achievements
 */
function getAchievementsByCategory(category = null) {
  try {
    let query = `SELECT * FROM achievements`;
    const params = [];

    if (category) {
      query += ` WHERE category = ?`;
      params.push(category);
    }

    query += ` ORDER BY display_order, requirement_value`;

    return db.prepare(query).all(...params);
  } catch (error) {
    logger.error('Error getting achievements by category', { error: error.message, category });
    return [];
  }
}

module.exports = {
  checkAndAwardAchievements,
  getUserAchievements,
  getAchievementProgress,
  formatAchievement,
  getAchievementsByCategory
};
>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
=======
const { db } = require('../database/db');
const logger = require('./logger');

/**
 * Check and award achievements for a user
 * @param {string} userId - Discord user ID
 * @param {string} category - Achievement category (games, missions, daily, etc.)
 * @returns {Array} - Array of newly unlocked achievements
 */
async function checkAndAwardAchievements(userId, category = null) {
  try {
    // Get user stats
    const userStats = db.prepare(`
      SELECT * FROM user_stats WHERE user_id = ?
    `).get(userId);

    if (!userStats) {
      return [];
    }

    // Get achievements to check
    let query = `
      SELECT a.* FROM achievements a
      WHERE a.id NOT IN (
        SELECT achievement_id FROM user_achievements WHERE user_id = ?
      )
    `;
    const params = [userId];

    if (category) {
      query += ` AND a.category = ?`;
      params.push(category);
    }

    const achievements = db.prepare(query).all(...params);
    const unlockedAchievements = [];

    for (const achievement of achievements) {
      const statValue = userStats[achievement.requirement_type] || 0;

      if (statValue >= achievement.requirement_value) {
        // Award achievement
        const unlockAchievement = db.prepare(`
          INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, progress)
          VALUES (?, ?, ?)
        `);

        unlockAchievement.run(userId, achievement.id, achievement.requirement_value);

        // Award rewards
        if (achievement.reward_ely > 0) {
          const updateBalance = db.prepare(`
            UPDATE users SET balance = balance + ? WHERE user_id = ?
          `);
          updateBalance.run(achievement.reward_ely, userId);
        }

        if (achievement.reward_exp > 0) {
          const updateExp = db.prepare(`
            UPDATE user_stats SET total_exp = total_exp + ? WHERE user_id = ?
          `);
          updateExp.run(achievement.reward_exp, userId);
        }

        // Log transaction
        const logTransaction = db.prepare(`
          INSERT INTO transactions (user_id, type, amount, description)
          VALUES (?, ?, ?, ?)
        `);
        logTransaction.run(
          userId,
          'achievement_reward',
          achievement.reward_ely,
          `Achievement: ${achievement.name}`
        );

        unlockedAchievements.push(achievement);

        logger.info('Achievement unlocked', {
          userId,
          achievement: achievement.id,
          rewards: {
            ely: achievement.reward_ely,
            exp: achievement.reward_exp
          }
        });
      }
    }

    return unlockedAchievements;
  } catch (error) {
    logger.error('Error checking achievements', { error: error.message, userId });
    return [];
  }
}

/**
 * Get user's unlocked achievements
 * @param {string} userId - Discord user ID
 * @returns {Array} - Array of unlocked achievements with details
 */
function getUserAchievements(userId) {
  try {
    const achievements = db.prepare(`
      SELECT 
        a.*,
        ua.unlocked_at,
        ua.progress
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
      ORDER BY ua.unlocked_at DESC
    `).all(userId);

    return achievements;
  } catch (error) {
    logger.error('Error getting user achievements', { error: error.message, userId });
    return [];
  }
}

/**
 * Get achievement progress for a user
 * @param {string} userId - Discord user ID
 * @param {string} achievementId - Achievement ID
 * @returns {Object} - Progress information
 */
function getAchievementProgress(userId, achievementId) {
  try {
    const achievement = db.prepare(`
      SELECT * FROM achievements WHERE id = ?
    `).get(achievementId);

    if (!achievement) {
      return null;
    }

    // Check if already unlocked
    const unlocked = db.prepare(`
      SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?
    `).get(userId, achievementId);

    if (unlocked) {
      return {
        unlocked: true,
        progress: achievement.requirement_value,
        required: achievement.requirement_value,
        percentage: 100
      };
    }

    // Get current progress
    const userStats = db.prepare(`
      SELECT * FROM user_stats WHERE user_id = ?
    `).get(userId);

    if (!userStats) {
      return {
        unlocked: false,
        progress: 0,
        required: achievement.requirement_value,
        percentage: 0
      };
    }

    const progress = userStats[achievement.requirement_type] || 0;
    const percentage = Math.min(100, Math.round((progress / achievement.requirement_value) * 100));

    return {
      unlocked: false,
      progress,
      required: achievement.requirement_value,
      percentage
    };
  } catch (error) {
    logger.error('Error getting achievement progress', { error: error.message, userId, achievementId });
    return null;
  }
}

/**
 * Format achievement for display
 * @param {Object} achievement - Achievement object
 * @param {Object} progress - Progress object (optional)
 * @returns {string} - Formatted achievement text
 */
function formatAchievement(achievement, progress = null) {
  let text = `${achievement.badge_emoji || '🏆'} **${achievement.name}**\n`;
  text += `*${achievement.description}*\n`;

  if (progress && !progress.unlocked) {
    text += `Progress: ${progress.progress}/${progress.required} (${progress.percentage}%)\n`;
  }

  const rewards = [];
  if (achievement.reward_ely > 0) {
    rewards.push(`${achievement.reward_ely.toLocaleString()} Ely`);
  }
  if (achievement.reward_exp > 0) {
    rewards.push(`${achievement.reward_exp.toLocaleString()} EXP`);
  }

  if (rewards.length > 0) {
    text += `Reward: ${rewards.join(', ')}`;
  }

  return text;
}

/**
 * Get all achievements by category
 * @param {string} category - Category name (optional)
 * @returns {Array} - Array of achievements
 */
function getAchievementsByCategory(category = null) {
  try {
    let query = `SELECT * FROM achievements`;
    const params = [];

    if (category) {
      query += ` WHERE category = ?`;
      params.push(category);
    }

    query += ` ORDER BY display_order, requirement_value`;

    return db.prepare(query).all(...params);
  } catch (error) {
    logger.error('Error getting achievements by category', { error: error.message, category });
    return [];
  }
}

module.exports = {
  checkAndAwardAchievements,
  getUserAchievements,
  getAchievementProgress,
  formatAchievement,
  getAchievementsByCategory
};
>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
