const { db } = require('../database/db');
const logger = require('./logger');

// Role configuration - 7 RANKS ONLY (F, E, D, C, B, A, S)
const ROLE_CONFIG = {
  // VIP Roles
  lao_lank: {
    id: 1480534220219875379, // Replace with actual Discord role ID
    name: 'Laolank',
    emoji: '🌲',
    bonuses: { elyMultiplier: 1.3, expMultiplier: 1.3, pointsMultiplier: 1.3 }
  },
  vip_bronze: {
    id: 1480533198625702103, // Replace with actual Discord role ID
    name: 'VIP Bronze',
    emoji: '🥉',
    bonuses: { elyMultiplier: 1.1, expMultiplier: 1.1, pointsMultiplier: 1.1 }
  },
  vip_silver: {
    id: 1480533357103153337,
    name: 'VIP Silver',
    emoji: '🥈',
    bonuses: { elyMultiplier: 1.2, expMultiplier: 1.2, pointsMultiplier: 1.2 }
  },
  vip_gold: {
    id: 1480533462673920143,
    name: 'VIP Gold',
    emoji: '🥇',
    bonuses: { elyMultiplier: 1.3, expMultiplier: 1.3, pointsMultiplier: 1.3 }
  },
  vip_diamond: {
    id: 1480533575656013886,
    name: 'VIP Diamond',
    emoji: '💎',
    bonuses: { elyMultiplier: 1.5, expMultiplier: 1.5, pointsMultiplier: 1.5 }
  },

  // MISSION RANK ROLES - 6 ranks (E, D, C, B, A, S)
  rank_e: {
    id: 1395318696582320248,
    name: 'Nhà Lữ Hành Bậc E',
    emoji: '🔰',
    requiredLevel: 1,
    rank: 'E',
    color: '#3498db'
  },
  rank_d: {
    id: 1395319580435546163,
    name: 'Nhà Lữ Hành Bậc D',
    emoji: '📘',
    requiredLevel: 5,
    rank: 'D',
    color: '#1abc9c'
  },
  rank_c: {
    id: 1395320321854148638,
    name: 'Nhà Lữ Hành Bậc C',
    emoji: '📗',
    requiredLevel: 10,
    rank: 'C',
    color: '#2ecc71'
  },
  rank_b: {
    id: 1395320935615299596,
    name: 'Nhà Lữ Hành Bậc B',
    emoji: '📙',
    requiredLevel: 15,
    rank: 'B',
    color: '#f39c12'
  },
  rank_a: {
    id: 1395321590324924556,
    name: 'Nhà Lữ Hành Bậc A',
    emoji: '📕',
    requiredLevel: 30,
    rank: 'A',
    color: '#e74c3c'
  },
  rank_s: {
    id: 1395322432503681076,
    name: 'Nhà Lữ Hành Bậc S',
    emoji: '⭐',
    requiredLevel: 50,
    rank: 'S',
    color: '#f1c40f'
  }
};

/**
 * Get user's Discord roles
 */
function getUserRoles(userId, guild = null) {
  try {
    if (guild) {
      const member = guild.members.cache.get(userId);
      if (!member) return [];

      const userRoleIds = member.roles.cache.map(r => r.id);
      const matchedRoles = [];

      for (const [key, config] of Object.entries(ROLE_CONFIG)) {
        if (config.id && userRoleIds.includes(config.id)) {
          matchedRoles.push({
            key,
            ...config
          });
        }
      }

      return matchedRoles;
    }

    return [];
  } catch (error) {
    logger.error('Error getting user roles', { error: error.message, userId });
    return [];
  }
}

/**
 * Calculate total bonuses from all roles
 */
function calculateBonuses(roles) {
  const bonuses = {
    elyMultiplier: 1,
    expMultiplier: 1,
    pointsMultiplier: 1
  };

  for (const role of roles) {
    if (role.bonuses) {
      bonuses.elyMultiplier = Math.max(bonuses.elyMultiplier, role.bonuses.elyMultiplier || 1);
      bonuses.expMultiplier = Math.max(bonuses.expMultiplier, role.bonuses.expMultiplier || 1);
      bonuses.pointsMultiplier = Math.max(bonuses.pointsMultiplier, role.bonuses.pointsMultiplier || 1);
    }
  }

  return bonuses;
}

/**
 * Get rank for level (6 ranks: E, D, C, B, A, S)
 */
function getRankForLevel(level) {
  if (level >= 50) return { key: 'rank_s', ...ROLE_CONFIG.rank_s };
  if (level >= 30) return { key: 'rank_a', ...ROLE_CONFIG.rank_a };
  if (level >= 15) return { key: 'rank_b', ...ROLE_CONFIG.rank_b };
  if (level >= 10) return { key: 'rank_c', ...ROLE_CONFIG.rank_c };
  if (level >= 5) return { key: 'rank_d', ...ROLE_CONFIG.rank_d };
  return { key: 'rank_e', ...ROLE_CONFIG.rank_e };
}

/**
 * Get rank tier from rank letter (7 ranks only)
 */
function getRankTier(rankLetter) {
  const rankMap = {
    'E': { level: 1, emoji: '🔰', name: 'Nhà Lữ Hành Bậc E', color: '#3498db' },
    'D': { level: 5, emoji: '📘', name: 'Nhà Lữ Hành Bậc D', color: '#1abc9c' },
    'C': { level: 10, emoji: '📗', name: 'Nhà Lữ Hành Bậc C', color: '#2ecc71' },
    'B': { level: 15, emoji: '📙', name: 'Nhà Lữ Hành Bậc B', color: '#f39c12' },
    'A': { level: 30, emoji: '📕', name: 'Nhà Lữ Hành Bậc A', color: '#e74c3c' },
    'S': { level: 50, emoji: '⭐', name: 'Nhà Lữ Hành Bậc S', color: '#f1c40f' }
  };
  
  return rankMap[rankLetter] || rankMap['E'];
}

/**
 * Update user's rank roles based on level
 */
async function updateRankRoles(userId, level, guild) {
  try {
    if (!guild) {
      logger.warn('Cannot update rank roles: guild not provided');
      return { success: false, reason: 'no_guild' };
    }

    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) {
      return { success: false, reason: 'member_not_found' };
    }

    const currentRank = getRankForLevel(level);
    if (!currentRank || !currentRank.id) {
      return { success: false, reason: 'no_rank_role_configured' };
    }

    // Get all rank role IDs (7 ranks)
    const allRankRoleIds = Object.values(ROLE_CONFIG)
      .filter(config => config.rank !== undefined && config.id)
      .map(config => config.id);

    // Remove old rank roles
    const rolesToRemove = member.roles.cache.filter(r => 
      allRankRoleIds.includes(r.id) && r.id !== currentRank.id
    );

    for (const role of rolesToRemove.values()) {
      await member.roles.remove(role).catch(err => 
        logger.error('Failed to remove role', { error: err.message, roleId: role.id, userId })
      );
    }

    // Add new rank role if not already present
    if (!member.roles.cache.has(currentRank.id)) {
      await member.roles.add(currentRank.id).catch(err =>
        logger.error('Failed to add role', { error: err.message, roleId: currentRank.id, userId })
      );

      return {
        success: true,
        roleAdded: currentRank,
        rolesRemoved: rolesToRemove.map(r => r.name)
      };
    }

    return { success: true, noChange: true };

  } catch (error) {
    logger.error('Error updating rank roles', { error: error.message, userId, level });
    return { success: false, reason: 'error', error: error.message };
  }
}

/**
 * Get EXP required for next level
 */
function getExpForNextLevel(currentLevel) {
  const baseExp = 1000;
  return Math.floor(baseExp * Math.pow(currentLevel, 1.5));
}

/**
 * Calculate level from total EXP
 */
function calculateLevel(totalExp) {
  let level = 1;
  let expForNextLevel = getExpForNextLevel(level);
  let remainingExp = totalExp;

  while (remainingExp >= expForNextLevel) {
    remainingExp -= expForNextLevel;
    level++;
    expForNextLevel = getExpForNextLevel(level);
  }

  return {
    level,
    currentExp: remainingExp,
    expForNextLevel,
    totalExp
  };
}

/**
 * Award EXP to user and handle level ups
 */
async function awardExp(userId, expAmount, guild = null) {
  try {
    // Get current stats
    let stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(userId);
    
    if (!stats) {
      const insert = db.prepare('INSERT INTO user_stats (user_id, total_exp, current_level) VALUES (?, ?, ?)');
      insert.run(userId, 0, 1);
      stats = { user_id: userId, total_exp: 0, current_level: 1 };
    }

    const oldLevel = stats.current_level;
    const newTotalExp = (stats.total_exp || 0) + expAmount;

    // Calculate new level
    const levelInfo = calculateLevel(newTotalExp);

    // Update stats
    const update = db.prepare(`
      UPDATE user_stats 
      SET total_exp = ?, current_level = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);
    update.run(levelInfo.totalExp, levelInfo.level, userId);

    const result = {
      success: true,
      expGained: expAmount,
      oldLevel,
      newLevel: levelInfo.level,
      leveledUp: levelInfo.level > oldLevel,
      currentExp: levelInfo.currentExp,
      expForNextLevel: levelInfo.expForNextLevel
    };

    // Update rank roles if leveled up
    if (result.leveledUp && guild) {
      const roleUpdate = await updateRankRoles(userId, levelInfo.level, guild);
      result.roleUpdate = roleUpdate;
    }

    logger.info('EXP awarded', {
      userId,
      expAmount,
      leveledUp: result.leveledUp,
      newLevel: levelInfo.level
    });

    return result;

  } catch (error) {
    logger.error('Error awarding EXP', { error: error.message, userId, expAmount });
    return { success: false, error: error.message };
  }
}

module.exports = {
  ROLE_CONFIG,
  getUserRoles,
  calculateBonuses,
  getRankForLevel,
  getRankTier,
  updateRankRoles,
  getExpForNextLevel,
  calculateLevel,
  awardExp
};
