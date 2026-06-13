const winston = require('winston');
const path = require('path');
const fs = require('fs');

// ========================================
// SETUP LOGS DIRECTORY
// ========================================
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ Created logs directory');
}

// ========================================
// DEFINE LOG LEVELS
// ========================================
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// ========================================
// DEFINE COLORS
// ========================================
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// ========================================
// FILE FORMAT (JSON)
// ========================================
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// ========================================
// CONSOLE FORMAT (Pretty)
// ========================================
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, ...meta } = info;
      let metaStr = '';
      
      if (Object.keys(meta).length > 0) {
        metaStr = ' ' + JSON.stringify(meta);
      }
      
      return `${timestamp} [${level}]: ${message}${metaStr}`;
    }
  )
);

// ========================================
// TRANSPORTS
// ========================================
const transports = [
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.LOG_LEVEL || 'info',
  }),
  
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: 5242880,
    maxFiles: 5,
    format: fileFormat,
  }),
  
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 5242880,
    maxFiles: 5,
    format: fileFormat,
  }),
  
  new winston.transports.File({
    filename: path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`),
    maxsize: 10485760,
    format: fileFormat,
  }),
];

// ========================================
// CREATE LOGGER
// ========================================
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: fileFormat,
  transports,
  exitOnError: false,
});

// ========================================
// HELPER FUNCTIONS
// ========================================

logger.command = (commandName, userId, success, error = null) => {
  if (success) {
    logger.info(`Command: ${commandName}`, { userId, command: commandName });
  } else {
    logger.error(`Command failed: ${commandName}`, { 
      userId, 
      command: commandName,
      error: error ? error.message : 'Unknown',
      stack: error ? error.stack : null 
    });
  }
};

logger.game = (gameName, userId, bet, won, profit) => {
  logger.info(`Game: ${gameName}`, { userId, game: gameName, bet, won, profit });
};

logger.transaction = (type, userId, amount, details = '') => {
  logger.info(`Transaction: ${type}`, { userId, type, amount, details });
};

logger.system = (event, details = '') => {
  logger.info(`System: ${event}`, { event, details });
};

logger.security = (event, userId, details = '') => {
  logger.warn(`Security: ${event}`, { userId, event, details });
};

module.exports = logger;