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

module.exports = checkRateLimit;