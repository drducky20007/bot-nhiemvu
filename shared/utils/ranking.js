const { db } = require('../database/db');
const logger = require('./logger');

/**
 * Update user's game statistics
 * @param {string} userId - Discord user ID
 * @param {string} gameType - Type of game (taixiu, baucua, etc.)
 * @param {boolean} won - Whether user won
 * @param {number} betAmount - Amount bet
 * @param {number} winAmount - Amount won (0 if lost)
 */
function updateGameStats(userId, gameType, won, betAmount, winAmount = 0) {
  try {
    // Ensure user_stats exists
    const ensureStats = db.prepare(`
      INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)
    `);
    ensureStats.run(userId);

    // Update stats
    const update = db.prepare(`
      UPDATE user_stats
      SET 
        total_games_played = total_games_played + 1,
        total_games_won = total_games_won + ?,
        total_bets_placed = total_bets_placed + ?,
        biggest_win = MAX(biggest_win, ?),
        biggest_loss = MAX(biggest_loss, ?),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);

    const wonCount = won ? 1 : 0;
    const winAmountToRecord = won ? winAmount : 0;
    const lossAmountToRecord = won ? 0 : betAmount;

    update.run(wonCount, betAmount, winAmountToRecord, lossAmountToRecord, userId);

    logger.info('Game stats updated', {
      userId,
      gameType,
      won,
      betAmount,
      winAmount
    });

    return true;
  } catch (error) {
    logger.error('Error updating game stats', {
      error: error.message,
      userId,
      gameType
    });
    return false;
  }
}

/**
 * Get user's game statistics
 * @param {string} userId - Discord user ID
 * @returns {Object} - User's game stats
 */
function getUserGameStats(userId) {
  try {
    const stats = db.prepare(`
      SELECT 
        total_games_played,
        total_games_won,
        total_bets_placed,
        biggest_win,
        biggest_loss
      FROM user_stats
      WHERE user_id = ?
    `).get(userId);

    if (!stats) {
      return {
        total_games_played: 0,
        total_games_won: 0,
        total_bets_placed: 0,
        biggest_win: 0,
        biggest_loss: 0,
        win_rate: 0
      };
    }

    const winRate = stats.total_games_played > 0
      ? ((stats.total_games_won / stats.total_games_played) * 100).toFixed(1)
      : 0;

    return {
      ...stats,
      win_rate: parseFloat(winRate)
    };
  } catch (error) {
    logger.error('Error getting game stats', { error: error.message, userId });
    return null;
  }
}

/**
 * Get top players by wins
 * @param {number} limit - Number of top players to return
 * @returns {Array} - Array of top players
 */
function getTopPlayersByWins(limit = 10) {
  try {
    const topPlayers = db.prepare(`
      SELECT 
        us.user_id,
        us.total_games_won,
        us.total_games_played,
        us.biggest_win,
        u.balance,
        ROUND(CAST(us.total_games_won AS FLOAT) / us.total_games_played * 100, 1) as win_rate
      FROM user_stats us
      JOIN users u ON us.user_id = u.user_id
      WHERE us.total_games_played > 0
      ORDER BY us.total_games_won DESC
      LIMIT ?
    `).all(limit);

    return topPlayers;
  } catch (error) {
    logger.error('Error getting top players by wins', { error: error.message });
    return [];
  }
}

/**
 * Get top players by balance
 * @param {number} limit - Number of top players to return
 * @returns {Array} - Array of top players
 */
function getTopPlayersByBalance(limit = 10) {
  try {
    const topPlayers = db.prepare(`
      SELECT 
        u.user_id,
        u.balance,
        us.total_games_played,
        us.total_games_won,
        us.biggest_win
      FROM users u
      LEFT JOIN user_stats us ON u.user_id = us.user_id
      ORDER BY u.balance DESC
      LIMIT ?
    `).all(limit);

    return topPlayers;
  } catch (error) {
    logger.error('Error getting top players by balance', { error: error.message });
    return [];
  }
}

/**
 * Get top players by biggest win
 * @param {number} limit - Number of top players to return
 * @returns {Array} - Array of top players
 */
function getTopPlayersByBiggestWin(limit = 10) {
  try {
    const topPlayers = db.prepare(`
      SELECT 
        us.user_id,
        us.biggest_win,
        us.total_games_won,
        us.total_games_played,
        u.balance
      FROM user_stats us
      JOIN users u ON us.user_id = u.user_id
      WHERE us.biggest_win > 0
      ORDER BY us.biggest_win DESC
      LIMIT ?
    `).all(limit);

    return topPlayers;
  } catch (error) {
    logger.error('Error getting top players by biggest win', { error: error.message });
    return [];
  }
}

/**
 * Get user's rank by category
 * @param {string} userId - Discord user ID
 * @param {string} category - Category (wins, balance, biggest_win)
 * @returns {Object} - User's rank and stats
 */
function getUserRank(userId, category = 'wins') {
  try {
    let query, params;

    switch (category) {
      case 'wins':
        query = `
          SELECT 
            COUNT(*) + 1 as rank
          FROM user_stats
          WHERE total_games_won > (
            SELECT total_games_won FROM user_stats WHERE user_id = ?
          )
        `;
        params = [userId];
        break;

      case 'balance':
        query = `
          SELECT 
            COUNT(*) + 1 as rank
          FROM users
          WHERE balance > (
            SELECT balance FROM users WHERE user_id = ?
          )
        `;
        params = [userId];
        break;

      case 'biggest_win':
        query = `
          SELECT 
            COUNT(*) + 1 as rank
          FROM user_stats
          WHERE biggest_win > (
            SELECT biggest_win FROM user_stats WHERE user_id = ?
          )
        `;
        params = [userId];
        break;

      default:
        return null;
    }

    const result = db.prepare(query).get(...params);
    return result ? result.rank : null;

  } catch (error) {
    logger.error('Error getting user rank', { error: error.message, userId, category });
    return null;
  }
}

/**
 * Get total number of players
 * @returns {number} - Total player count
 */
function getTotalPlayers() {
  try {
    const result = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count FROM users
    `).get();

    return result ? result.count : 0;
  } catch (error) {
    logger.error('Error getting total players', { error: error.message });
    return 0;
  }
}

/**
 * Record game result for leaderboard
 * @param {string} userId - Discord user ID
 * @param {string} gameType - Game type
 * @param {number} betAmount - Bet amount
 * @param {number} resultAmount - Win/loss amount (positive = win, negative = loss)
 */
function recordGameResult(userId, gameType, betAmount, resultAmount) {
  try {
    const won = resultAmount > 0;
    const winAmount = Math.abs(resultAmount);

    updateGameStats(userId, gameType, won, betAmount, winAmount);

    return true;
  } catch (error) {
    logger.error('Error recording game result', {
      error: error.message,
      userId,
      gameType
    });
    return false;
  }
}

module.exports = {
  updateGameStats,
  getUserGameStats,
  getTopPlayersByWins,
  getTopPlayersByBalance,
  getTopPlayersByBiggestWin,
  getUserRank,
  getTotalPlayers,
  recordGameResult
};
