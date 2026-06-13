const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ========================================
// IMPORT LOGGER & DATABASE
// ========================================
const logger = require('./shared/utils/logger.js');
const { initDb } = require('./shared/database/db.js');

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
// STARTUP - INIT DB FIRST, THEN LOAD COMMANDS/EVENTS
// ========================================
(async () => {
  try {
    // Initialize database
    await initDb();
    logger.system('Database initialized', 'sql.js ready');
    
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
    const rateLimiter = require('./shared/utils/rateLimiter.js');
    
    client.on('interactionCreate', async interaction => {
      // ... rest of interaction code stays same ...
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
    
  } catch (error) {
    logger.error('Startup error', { error: error.message, stack: error.stack });
    process.exit(1);
  }
})();