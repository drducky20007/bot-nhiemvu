class RateLimiter {
  constructor() {
    this.cooldowns = new Map();
    
    this.cooldownTimes = {
      balance: 3000,
      daily: 1000,
      pay: 5000,
      taixiu: 2000,
      baucua: 2000,
      nhiemvu: 5000,
      huynhiemvu: 5000,
      duyetnhiemvu: 3000,
      default: 3000,
    };
  }

  checkRateLimit(userId, commandName) {
    const now = Date.now();
    const cooldownTime = this.cooldownTimes[commandName] || this.cooldownTimes.default;
    
    if (!this.cooldowns.has(userId)) {
      this.cooldowns.set(userId, new Map());
    }
    
    const userCooldowns = this.cooldowns.get(userId);
    
    if (userCooldowns.has(commandName)) {
      const lastUsed = userCooldowns.get(commandName);
      const timePassed = now - lastUsed;
      
      if (timePassed < cooldownTime) {
        const timeLeft = Math.ceil((cooldownTime - timePassed) / 1000);
        
        return {
          allowed: false,
          message: `⏱️ Chờ **${timeLeft} giây** nữa!`
        };
      }
    }
    
    userCooldowns.set(commandName, now);
    
    return { allowed: true };
  }
  
  reset(userId) {
    this.cooldowns.delete(userId);
  }
  
  cleanup() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    for (const [userId, userCooldowns] of this.cooldowns.entries()) {
      for (const [cmd, timestamp] of userCooldowns.entries()) {
        if (timestamp < oneHourAgo) {
          userCooldowns.delete(cmd);
        }
      }
      
      if (userCooldowns.size === 0) {
        this.cooldowns.delete(userId);
      }
    }
  }
}

const rateLimiter = new RateLimiter();

setInterval(() => {
  rateLimiter.cleanup();
}, 1800000);

module.exports = rateLimiter;