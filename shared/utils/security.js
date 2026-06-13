<<<<<<< HEAD
<<<<<<< HEAD
const { db } = require('../database/db');
const logger = require('./logger');

class Security {
  constructor() {
    this.recentTransactions = new Map();
    this.userActions = new Map();
    setInterval(() => this.cleanup(), 300000);
  }

  checkDuplicateTransaction(userId, type, amount) {
    const key = `${userId}-${type}-${amount}`;
    const now = Date.now();
    
    if (this.recentTransactions.has(key)) {
      const lastTime = this.recentTransactions.get(key);
      const timeDiff = now - lastTime;
      
      if (timeDiff < 2000) {
        logger.security('duplicate-transaction-detected', userId, 
          `Type: ${type}, Amount: ${amount}, Time: ${timeDiff}ms`
        );
        
        return {
          duplicate: true,
          error: '⚠️ Transaction bị trùng! Vui lòng đợi 2 giây.'
        };
      }
    }
    
    this.recentTransactions.set(key, now);
    return { duplicate: false };
  }

  checkOverflow(currentBalance, amount, operation = 'add') {
    const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
    const MIN_SAFE_INTEGER = 0;

    if (operation === 'add') {
      if (currentBalance + amount > MAX_SAFE_INTEGER) {
        logger.security('overflow-detected', 'system', 
          `Balance: ${currentBalance}, Add: ${amount}`
        );
        
        return {
          overflow: true,
          error: '⚠️ Số tiền vượt quá giới hạn!'
        };
      }
    } else if (operation === 'subtract') {
      if (currentBalance - amount < MIN_SAFE_INTEGER) {
        logger.security('underflow-detected', 'system', 
          `Balance: ${currentBalance}, Subtract: ${amount}`
        );
        
        return {
          underflow: true,
          error: '⚠️ Không đủ số dư!'
        };
      }
    }

    return { overflow: false, underflow: false };
  }

  trackAction(userId, actionType) {
    const now = Date.now();
    
    if (!this.userActions.has(userId)) {
      this.userActions.set(userId, []);
    }
    
    const actions = this.userActions.get(userId);
    actions.push({ type: actionType, timestamp: now });
    
    const oneMinuteAgo = now - 60000;
    const recentActions = actions.filter(a => a.timestamp > oneMinuteAgo);
    this.userActions.set(userId, recentActions);
    
    if (recentActions.length > 50) {
      logger.security('too-many-actions', userId, 
        `${recentActions.length} actions in 1 minute`
      );
      
      return {
        tooMany: true,
        error: '⚠️ Quá nhiều hành động! Vui lòng chậm lại.'
      };
    }
    
    return { tooMany: false };
  }

  checkTransactionLimits(userId, amount, type) {
    const limits = {
      pay: 999999999,      // ✅ REMOVED LIMIT - Allow unlimited
      buy: 500000,
      bet: 50000,
      daily_total: 1000000  // ✅ Keep daily limit
    };

    const limit = limits[type] || limits.pay;
    
    if (amount > limit) {
      logger.security('transaction-limit-exceeded', userId, 
        `Type: ${type}, Amount: ${amount}, Limit: ${limit}`
      );
      
      return {
        exceeded: true,
        error: `⚠️ Giới hạn ${type}: ${limit.toLocaleString()} Ely!`
      };
    }

    // ✅ REMOVED DAILY LIMIT CHECK
    // const today = new Date().toISOString().split('T')[0];
    // const dailyTotal = this.getDailyTotal(userId, today);
    // 
    // if (dailyTotal + amount > limits.daily_total) {
    //   return { exceeded: true, error: '...' };
    // }

    return { exceeded: false };
  }

  getDailyTotal(userId, date) {
    try {
      const result = db.prepare(`
        SELECT SUM(ABS(amount)) as total
        FROM transactions
        WHERE user_id = ? 
        AND DATE(timestamp) = ?
        AND type IN ('pay', 'marketplace-buy', 'game-bet')
      `).get(userId, date);

      return result?.total || 0;
    } catch (error) {
      logger.error('Failed to get daily total', { error: error.message });
      return 0;
    }
  }

  checkUserExists(userId) {
    try {
      const user = db.prepare('SELECT user_id FROM users WHERE user_id = ?').get(userId);
      
      if (!user) {
        return {
          exists: false,
          error: '❌ User không tồn tại trong hệ thống!'
        };
      }
      
      return { exists: true };
    } catch (error) {
      logger.error('Check user exists failed', { error: error.message });
      return {
        exists: false,
        error: '❌ Lỗi khi kiểm tra user!'
      };
    }
  }

  checkItemOwnership(userId, inventoryId) {
    try {
      const item = db.prepare(`
        SELECT id FROM user_inventory 
        WHERE id = ? AND user_id = ?
      `).get(inventoryId, userId);
      
      if (!item) {
        return {
          owned: false,
          error: '❌ Bạn không sở hữu item này!'
        };
      }
      
      return { owned: true };
    } catch (error) {
      logger.error('Check ownership failed', { error: error.message });
      return {
        owned: false,
        error: '❌ Lỗi khi kiểm tra ownership!'
      };
    }
  }

  cleanup() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    for (const [key, timestamp] of this.recentTransactions.entries()) {
      if (timestamp < oneHourAgo) {
        this.recentTransactions.delete(key);
      }
    }

    for (const [userId, actions] of this.userActions.entries()) {
      const recent = actions.filter(a => a.timestamp > oneHourAgo);
      if (recent.length === 0) {
        this.userActions.delete(userId);
      } else {
        this.userActions.set(userId, recent);
      }
    }

    logger.system('security-cleanup', 
      `Transactions: ${this.recentTransactions.size}, Users: ${this.userActions.size}`
    );
  }

  validateTransactionIntegrity(fromUserId, toUserId, amount) {
    if (fromUserId === toUserId) {
      return {
        valid: false,
        error: '❌ Không thể chuyển tiền cho chính mình!'
      };
    }

    if (amount <= 0) {
      return {
        valid: false,
        error: '❌ Số tiền phải lớn hơn 0!'
      };
    }

    const overflow = this.checkOverflow(0, amount, 'add');
    if (overflow.overflow) {
      return overflow;
    }

    return { valid: true };
  }
}

const security = new Security();
=======
const { db } = require('../database/db');
const logger = require('./logger');

class Security {
  constructor() {
    this.recentTransactions = new Map();
    this.userActions = new Map();
    setInterval(() => this.cleanup(), 300000);
  }

  checkDuplicateTransaction(userId, type, amount) {
    const key = `${userId}-${type}-${amount}`;
    const now = Date.now();
    
    if (this.recentTransactions.has(key)) {
      const lastTime = this.recentTransactions.get(key);
      const timeDiff = now - lastTime;
      
      if (timeDiff < 2000) {
        logger.security('duplicate-transaction-detected', userId, 
          `Type: ${type}, Amount: ${amount}, Time: ${timeDiff}ms`
        );
        
        return {
          duplicate: true,
          error: '⚠️ Transaction bị trùng! Vui lòng đợi 2 giây.'
        };
      }
    }
    
    this.recentTransactions.set(key, now);
    return { duplicate: false };
  }

  checkOverflow(currentBalance, amount, operation = 'add') {
    const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
    const MIN_SAFE_INTEGER = 0;

    if (operation === 'add') {
      if (currentBalance + amount > MAX_SAFE_INTEGER) {
        logger.security('overflow-detected', 'system', 
          `Balance: ${currentBalance}, Add: ${amount}`
        );
        
        return {
          overflow: true,
          error: '⚠️ Số tiền vượt quá giới hạn!'
        };
      }
    } else if (operation === 'subtract') {
      if (currentBalance - amount < MIN_SAFE_INTEGER) {
        logger.security('underflow-detected', 'system', 
          `Balance: ${currentBalance}, Subtract: ${amount}`
        );
        
        return {
          underflow: true,
          error: '⚠️ Không đủ số dư!'
        };
      }
    }

    return { overflow: false, underflow: false };
  }

  trackAction(userId, actionType) {
    const now = Date.now();
    
    if (!this.userActions.has(userId)) {
      this.userActions.set(userId, []);
    }
    
    const actions = this.userActions.get(userId);
    actions.push({ type: actionType, timestamp: now });
    
    const oneMinuteAgo = now - 60000;
    const recentActions = actions.filter(a => a.timestamp > oneMinuteAgo);
    this.userActions.set(userId, recentActions);
    
    if (recentActions.length > 50) {
      logger.security('too-many-actions', userId, 
        `${recentActions.length} actions in 1 minute`
      );
      
      return {
        tooMany: true,
        error: '⚠️ Quá nhiều hành động! Vui lòng chậm lại.'
      };
    }
    
    return { tooMany: false };
  }

  checkTransactionLimits(userId, amount, type) {
    const limits = {
      pay: 999999999,      // ✅ REMOVED LIMIT - Allow unlimited
      buy: 500000,
      bet: 50000,
      daily_total: 1000000  // ✅ Keep daily limit
    };

    const limit = limits[type] || limits.pay;
    
    if (amount > limit) {
      logger.security('transaction-limit-exceeded', userId, 
        `Type: ${type}, Amount: ${amount}, Limit: ${limit}`
      );
      
      return {
        exceeded: true,
        error: `⚠️ Giới hạn ${type}: ${limit.toLocaleString()} Ely!`
      };
    }

    // ✅ REMOVED DAILY LIMIT CHECK
    // const today = new Date().toISOString().split('T')[0];
    // const dailyTotal = this.getDailyTotal(userId, today);
    // 
    // if (dailyTotal + amount > limits.daily_total) {
    //   return { exceeded: true, error: '...' };
    // }

    return { exceeded: false };
  }

  getDailyTotal(userId, date) {
    try {
      const result = db.prepare(`
        SELECT SUM(ABS(amount)) as total
        FROM transactions
        WHERE user_id = ? 
        AND DATE(timestamp) = ?
        AND type IN ('pay', 'marketplace-buy', 'game-bet')
      `).get(userId, date);

      return result?.total || 0;
    } catch (error) {
      logger.error('Failed to get daily total', { error: error.message });
      return 0;
    }
  }

  checkUserExists(userId) {
    try {
      const user = db.prepare('SELECT user_id FROM users WHERE user_id = ?').get(userId);
      
      if (!user) {
        return {
          exists: false,
          error: '❌ User không tồn tại trong hệ thống!'
        };
      }
      
      return { exists: true };
    } catch (error) {
      logger.error('Check user exists failed', { error: error.message });
      return {
        exists: false,
        error: '❌ Lỗi khi kiểm tra user!'
      };
    }
  }

  checkItemOwnership(userId, inventoryId) {
    try {
      const item = db.prepare(`
        SELECT id FROM user_inventory 
        WHERE id = ? AND user_id = ?
      `).get(inventoryId, userId);
      
      if (!item) {
        return {
          owned: false,
          error: '❌ Bạn không sở hữu item này!'
        };
      }
      
      return { owned: true };
    } catch (error) {
      logger.error('Check ownership failed', { error: error.message });
      return {
        owned: false,
        error: '❌ Lỗi khi kiểm tra ownership!'
      };
    }
  }

  cleanup() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    for (const [key, timestamp] of this.recentTransactions.entries()) {
      if (timestamp < oneHourAgo) {
        this.recentTransactions.delete(key);
      }
    }

    for (const [userId, actions] of this.userActions.entries()) {
      const recent = actions.filter(a => a.timestamp > oneHourAgo);
      if (recent.length === 0) {
        this.userActions.delete(userId);
      } else {
        this.userActions.set(userId, recent);
      }
    }

    logger.system('security-cleanup', 
      `Transactions: ${this.recentTransactions.size}, Users: ${this.userActions.size}`
    );
  }

  validateTransactionIntegrity(fromUserId, toUserId, amount) {
    if (fromUserId === toUserId) {
      return {
        valid: false,
        error: '❌ Không thể chuyển tiền cho chính mình!'
      };
    }

    if (amount <= 0) {
      return {
        valid: false,
        error: '❌ Số tiền phải lớn hơn 0!'
      };
    }

    const overflow = this.checkOverflow(0, amount, 'add');
    if (overflow.overflow) {
      return overflow;
    }

    return { valid: true };
  }
}

const security = new Security();
>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
=======
const { db } = require('../database/db');
const logger = require('./logger');

class Security {
  constructor() {
    this.recentTransactions = new Map();
    this.userActions = new Map();
    setInterval(() => this.cleanup(), 300000);
  }

  checkDuplicateTransaction(userId, type, amount) {
    const key = `${userId}-${type}-${amount}`;
    const now = Date.now();
    
    if (this.recentTransactions.has(key)) {
      const lastTime = this.recentTransactions.get(key);
      const timeDiff = now - lastTime;
      
      if (timeDiff < 2000) {
        logger.security('duplicate-transaction-detected', userId, 
          `Type: ${type}, Amount: ${amount}, Time: ${timeDiff}ms`
        );
        
        return {
          duplicate: true,
          error: '⚠️ Transaction bị trùng! Vui lòng đợi 2 giây.'
        };
      }
    }
    
    this.recentTransactions.set(key, now);
    return { duplicate: false };
  }

  checkOverflow(currentBalance, amount, operation = 'add') {
    const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
    const MIN_SAFE_INTEGER = 0;

    if (operation === 'add') {
      if (currentBalance + amount > MAX_SAFE_INTEGER) {
        logger.security('overflow-detected', 'system', 
          `Balance: ${currentBalance}, Add: ${amount}`
        );
        
        return {
          overflow: true,
          error: '⚠️ Số tiền vượt quá giới hạn!'
        };
      }
    } else if (operation === 'subtract') {
      if (currentBalance - amount < MIN_SAFE_INTEGER) {
        logger.security('underflow-detected', 'system', 
          `Balance: ${currentBalance}, Subtract: ${amount}`
        );
        
        return {
          underflow: true,
          error: '⚠️ Không đủ số dư!'
        };
      }
    }

    return { overflow: false, underflow: false };
  }

  trackAction(userId, actionType) {
    const now = Date.now();
    
    if (!this.userActions.has(userId)) {
      this.userActions.set(userId, []);
    }
    
    const actions = this.userActions.get(userId);
    actions.push({ type: actionType, timestamp: now });
    
    const oneMinuteAgo = now - 60000;
    const recentActions = actions.filter(a => a.timestamp > oneMinuteAgo);
    this.userActions.set(userId, recentActions);
    
    if (recentActions.length > 50) {
      logger.security('too-many-actions', userId, 
        `${recentActions.length} actions in 1 minute`
      );
      
      return {
        tooMany: true,
        error: '⚠️ Quá nhiều hành động! Vui lòng chậm lại.'
      };
    }
    
    return { tooMany: false };
  }

  checkTransactionLimits(userId, amount, type) {
    const limits = {
      pay: 999999999,      // ✅ REMOVED LIMIT - Allow unlimited
      buy: 500000,
      bet: 50000,
      daily_total: 1000000  // ✅ Keep daily limit
    };

    const limit = limits[type] || limits.pay;
    
    if (amount > limit) {
      logger.security('transaction-limit-exceeded', userId, 
        `Type: ${type}, Amount: ${amount}, Limit: ${limit}`
      );
      
      return {
        exceeded: true,
        error: `⚠️ Giới hạn ${type}: ${limit.toLocaleString()} Ely!`
      };
    }

    // ✅ REMOVED DAILY LIMIT CHECK
    // const today = new Date().toISOString().split('T')[0];
    // const dailyTotal = this.getDailyTotal(userId, today);
    // 
    // if (dailyTotal + amount > limits.daily_total) {
    //   return { exceeded: true, error: '...' };
    // }

    return { exceeded: false };
  }

  getDailyTotal(userId, date) {
    try {
      const result = db.prepare(`
        SELECT SUM(ABS(amount)) as total
        FROM transactions
        WHERE user_id = ? 
        AND DATE(timestamp) = ?
        AND type IN ('pay', 'marketplace-buy', 'game-bet')
      `).get(userId, date);

      return result?.total || 0;
    } catch (error) {
      logger.error('Failed to get daily total', { error: error.message });
      return 0;
    }
  }

  checkUserExists(userId) {
    try {
      const user = db.prepare('SELECT user_id FROM users WHERE user_id = ?').get(userId);
      
      if (!user) {
        return {
          exists: false,
          error: '❌ User không tồn tại trong hệ thống!'
        };
      }
      
      return { exists: true };
    } catch (error) {
      logger.error('Check user exists failed', { error: error.message });
      return {
        exists: false,
        error: '❌ Lỗi khi kiểm tra user!'
      };
    }
  }

  checkItemOwnership(userId, inventoryId) {
    try {
      const item = db.prepare(`
        SELECT id FROM user_inventory 
        WHERE id = ? AND user_id = ?
      `).get(inventoryId, userId);
      
      if (!item) {
        return {
          owned: false,
          error: '❌ Bạn không sở hữu item này!'
        };
      }
      
      return { owned: true };
    } catch (error) {
      logger.error('Check ownership failed', { error: error.message });
      return {
        owned: false,
        error: '❌ Lỗi khi kiểm tra ownership!'
      };
    }
  }

  cleanup() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    for (const [key, timestamp] of this.recentTransactions.entries()) {
      if (timestamp < oneHourAgo) {
        this.recentTransactions.delete(key);
      }
    }

    for (const [userId, actions] of this.userActions.entries()) {
      const recent = actions.filter(a => a.timestamp > oneHourAgo);
      if (recent.length === 0) {
        this.userActions.delete(userId);
      } else {
        this.userActions.set(userId, recent);
      }
    }

    logger.system('security-cleanup', 
      `Transactions: ${this.recentTransactions.size}, Users: ${this.userActions.size}`
    );
  }

  validateTransactionIntegrity(fromUserId, toUserId, amount) {
    if (fromUserId === toUserId) {
      return {
        valid: false,
        error: '❌ Không thể chuyển tiền cho chính mình!'
      };
    }

    if (amount <= 0) {
      return {
        valid: false,
        error: '❌ Số tiền phải lớn hơn 0!'
      };
    }

    const overflow = this.checkOverflow(0, amount, 'add');
    if (overflow.overflow) {
      return overflow;
    }

    return { valid: true };
  }
}

const security = new Security();
>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
module.exports = security;