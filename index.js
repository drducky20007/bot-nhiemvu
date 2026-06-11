const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ========================================
// IMPORT LOGGER
// ========================================
const logger = require('../shared/utils/logger.js');

// ========================================
// CREATE CLIENT
// ========================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
  ]
});

// ========================================
// LOAD COMMANDS
// ========================================
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands', 'slash');

if (!fs.existsSync(commandsPath)) {
  logger.error('Commands folder not found', { path: commandsPath });
  process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

if (commandFiles.length === 0) {
  logger.warn('No command files found in commands/slash/');
}

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  
  try {
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      logger.debug(`Loaded command: /${command.data.name}`);
    } else {
      logger.warn(`Command ${file} missing "data" or "execute"`, { file });
    }
  } catch (error) {
    logger.error(`Error loading command ${file}`, { error: error.message, file });
  }
}

logger.info(`Commands loaded: ${client.commands.size}`);

// ========================================
// LOAD EVENTS
// ========================================
const eventsPath = path.join(__dirname, 'events');

if (!fs.existsSync(eventsPath)) {
  logger.error('Events folder not found', { path: eventsPath });
  process.exit(1);
}

const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  
  try {
    const event = require(filePath);
    
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    
    logger.debug(`Loaded event: ${event.name}`);
  } catch (error) {
    logger.error(`Error loading event ${file}`, { error: error.message, file });
  }
}

logger.info(`Events loaded: ${eventFiles.length}`);

// ========================================
// INTERACTION CREATE (with rate limiting)
// ========================================
const rateLimiter = require('../shared/utils/rateLimiter.js');

client.on('interactionCreate', async interaction => {
  // ========================================
  // HANDLE SLASH COMMANDS
  // ========================================
  if (interaction.isChatInputCommand()) {
    const userId = interaction.user.id;
    const commandName = interaction.commandName;
    
    // Rate limit check
    const rateLimit = rateLimiter.checkRateLimit(userId, commandName);
    
    if (!rateLimit.allowed) {
      logger.security('rate-limit-blocked', userId, 
        `Command: ${commandName}, Reason: ${rateLimit.reason}`
      );
      
      return interaction.reply({
        content: rateLimit.message,
        ephemeral: true
      });
    }
    
    // Get command
    const command = interaction.client.commands.get(commandName);
    
    if (!command) {
      logger.error('Command not found', { commandName, userId });
      return interaction.reply({
        content: '❌ Command không tồn tại!',
        ephemeral: true
      });
    }
    
    // Execute command
    try {
      await command.execute(interaction);
    } catch (error) {
      logger.command(commandName, userId, false, error);
      
      const errorMsg = { 
        content: '❌ Có lỗi xảy ra khi thực thi lệnh này!', 
        ephemeral: true 
      };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMsg);
      } else {
        await interaction.reply(errorMsg);
      }
    }
  }
  
  // ========================================
  // HANDLE BUTTON INTERACTIONS
  // ========================================
  else if (interaction.isButton()) {
    const customId = interaction.customId;
    
    // Choose mission button
    if (customId.startsWith('choose_mission_')) {
      const parts = customId.split('_');
      const missionId = parts[2];
      const targetUserId = parts[3];
      
      // Check if button belongs to user
      if (interaction.user.id !== targetUserId) {
        return interaction.reply({ 
          content: '❌ Đây không phải nhiệm vụ của bạn!', 
          ephemeral: true 
        });
      }
      
      try {
        const { db } = require('../shared/database/db');
        
        // Check if user already has mission
        const existingMission = db.prepare(`
          SELECT mission_id FROM user_missions WHERE user_id = ?
        `).get(interaction.user.id);
        
        if (existingMission) {
          return interaction.reply({ 
            content: '⚠️ Bạn đã nhận nhiệm vụ rồi!', 
            ephemeral: true 
          });
        }
        
        // Get mission info
        const mission = db.prepare(`
          SELECT id, title, description, reward, rank, type
          FROM missions WHERE id = ?
        `).get(missionId);
        
        if (!mission) {
          return interaction.reply({ 
            content: '❌ Không tìm thấy nhiệm vụ!', 
            ephemeral: true 
          });
        }
        
        // Save mission
        db.prepare(`
          INSERT INTO user_missions (user_id, mission_id, status, accepted_at)
          VALUES (?, ?, 'active', CURRENT_TIMESTAMP)
        `).run(interaction.user.id, missionId);
        
        logger.info(`User accepted mission`, { 
          userId: interaction.user.id, 
          missionId 
        });
        
        // Delete pending choices
        if (global.pendingMissionChoices && global.pendingMissionChoices[interaction.user.id]) {
          delete global.pendingMissionChoices[interaction.user.id];
        }
        
        // Update message
        await interaction.message.edit({ 
          content: `✅ **Bạn đã nhận nhiệm vụ: ${mission.title}**\n\n` +
                   `📋 **Chi tiết:**\n${mission.description}\n\n` +
                   `🆔 **ID: ${mission.id}**\n\n ` +
                   `🎖️ Rank: ${mission.rank}\n` +
                   `💰 Thưởng: ${mission.reward.toLocaleString()} Ely\n` +
                   `🏷️ Loại: ${mission.type}\n\n` +
                   `📝 Tạo thread trong forum và viết bài (500+ từ) để hoàn thành!`,
          components: []
        });
        
        return interaction.reply({ 
          content: `✅ Đã nhận nhiệm vụ **${mission.title}**!\n\nDùng \`/nhiemvu\` để xem chi tiết.`,
          ephemeral: true 
        });
        
      } catch (error) {
        logger.error('Error handling mission button', { error: error.message });
        return interaction.reply({ 
          content: '❌ Có lỗi xảy ra!', 
          ephemeral: true 
        });
      }
    }
    
    // Cancel mission button
    else if (customId.startsWith('cancel_mission_')) {
      const targetUserId = customId.split('_')[2];
      
      if (interaction.user.id !== targetUserId) {
        return interaction.reply({ 
          content: '❌ Đây không phải nhiệm vụ của bạn!', 
          ephemeral: true 
        });
      }
      
      // Delete pending choices
      if (global.pendingMissionChoices && global.pendingMissionChoices[interaction.user.id]) {
        delete global.pendingMissionChoices[interaction.user.id];
      }
      
      await interaction.message.edit({ 
        content: '❌ **Bạn đã hủy chọn nhiệm vụ.**\n\nReact 🎯 lại để nhận nhiệm vụ mới!',
        components: []
      });
      
      return interaction.reply({ 
        content: '✅ Đã hủy.',
        ephemeral: true 
      });
    }
  }
});

// ========================================
// READY EVENT
// ========================================
client.once('ready', () => {
  logger.system('Bot Ready', `Logged in as ${client.user.tag}`);
  logger.info(`Guilds: ${client.guilds.cache.size}`);
  logger.info(`Commands: ${client.commands.size}`);
  
  console.log('='.repeat(50));
  console.log('✅ BOT NHIỆM VỤ');
  console.log(`👤 ${client.user.tag}`);
  console.log(`🎯 Commands: ${client.commands.size}`);
  console.log(`📊 Guilds: ${client.guilds.cache.size}`);
  console.log('='.repeat(50));
  
  // Initialize pending choices storage
  if (!global.pendingMissionChoices) {
    global.pendingMissionChoices = {};
  }
});

// ========================================
// ERROR HANDLING
// ========================================
client.on('error', (error) => {
  logger.error('Discord client error', { 
    error: error.message, 
    stack: error.stack 
  });
});

client.on('warn', (warning) => {
  logger.warn('Discord client warning', { warning });
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection', { 
    error: error.message, 
    stack: error.stack 
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { 
    error: error.message, 
    stack: error.stack 
  });
  
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================
process.on('SIGINT', () => {
  logger.system('Shutting down', 'SIGINT received');
  console.log('\n🛑 Shutting down gracefully...');
  
  client.destroy();
  
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

process.on('SIGTERM', () => {
  logger.system('Shutting down', 'SIGTERM received');
  console.log('\n🛑 Shutting down gracefully...');
  
  client.destroy();
  
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

// ========================================
// LOGIN
// ========================================
client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    logger.system('Login successful', 'Connected to Discord');
  })
  .catch(error => {
    logger.error('Login failed', { error: error.message });
    process.exit(1);
  });

// ========================================
// EXPORT CLIENT
// ========================================
module.exports = client;