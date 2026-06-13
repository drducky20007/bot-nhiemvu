<<<<<<< HEAD
<<<<<<< HEAD
const rateLimiter = require('../utils/rateLimiter');

/**
 * Middleware check rate limit trước khi execute command
 * @param {Interaction} interaction 
 * @returns {boolean} true nếu allowed, false nếu blocked
 */
async function checkRateLimit(interaction) {
  const userId = interaction.user.id;
  const commandName = interaction.commandName;
  
  const result = rateLimiter.checkRateLimit(userId, commandName);
  
  if (!result.allowed) {
    await interaction.reply({
      content: result.message,
      ephemeral: true
    });
    
    return false;
  }
  
  return true;
}

=======
const rateLimiter = require('../utils/rateLimiter');

/**
 * Middleware check rate limit trước khi execute command
 * @param {Interaction} interaction 
 * @returns {boolean} true nếu allowed, false nếu blocked
 */
async function checkRateLimit(interaction) {
  const userId = interaction.user.id;
  const commandName = interaction.commandName;
  
  const result = rateLimiter.checkRateLimit(userId, commandName);
  
  if (!result.allowed) {
    await interaction.reply({
      content: result.message,
      ephemeral: true
    });
    
    return false;
  }
  
  return true;
}

>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
=======
const rateLimiter = require('../utils/rateLimiter');

/**
 * Middleware check rate limit trước khi execute command
 * @param {Interaction} interaction 
 * @returns {boolean} true nếu allowed, false nếu blocked
 */
async function checkRateLimit(interaction) {
  const userId = interaction.user.id;
  const commandName = interaction.commandName;
  
  const result = rateLimiter.checkRateLimit(userId, commandName);
  
  if (!result.allowed) {
    await interaction.reply({
      content: result.message,
      ephemeral: true
    });
    
    return false;
  }
  
  return true;
}

>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
module.exports = checkRateLimit;