const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class BackupManager {
  constructor() {
    this.dbPath = path.join(__dirname, '../../data/bot.db');
    this.backupDir = path.join(__dirname, '../../backups');
    this.maxBackups = 7; // Keep 7 backups (1 week)
    
    // Tạo backup directory nếu chưa có
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      logger.system('Backup directory created', this.backupDir);
    }
  }

  /**
   * Tạo backup
   * @param {string} reason - Lý do backup (manual, auto, pre-update)
   * @returns {Object} { success: boolean, filename: string, size: number }
   */
  createBackup(reason = 'manual') {
    try {
      // Kiểm tra database tồn tại
      if (!fs.existsSync(this.dbPath)) {
        logger.error('Database file not found', { path: this.dbPath });
        return { success: false, error: 'Database file not found' };
      }

      // Tạo filename với timestamp
      const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .split('.')[0]; // Format: 2025-02-27_15-30-00
      
      const filename = `backup_${timestamp}_${reason}.db`;
      const backupPath = path.join(this.backupDir, filename);

      // Copy database file
      fs.copyFileSync(this.dbPath, backupPath);

      // Get file size
      const stats = fs.statSync(backupPath);
      const sizeKB = Math.round(stats.size / 1024);

      logger.system('Backup created', { 
        filename, 
        reason, 
        size: `${sizeKB}KB` 
      });

      // Cleanup old backups
      this.cleanupOldBackups();

      return { 
        success: true, 
        filename, 
        size: sizeKB,
        path: backupPath
      };

    } catch (error) {
      logger.error('Backup failed', { 
        error: error.message, 
        stack: error.stack 
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Xóa backup cũ, chỉ giữ lại N backups gần nhất
   */
  cleanupOldBackups() {
    try {
      // Lấy tất cả backup files
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('backup_') && file.endsWith('.db'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          time: fs.statSync(path.join(this.backupDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time); // Mới nhất trước

      // Xóa các backups cũ (giữ lại maxBackups)
      if (files.length > this.maxBackups) {
        const toDelete = files.slice(this.maxBackups);
        
        toDelete.forEach(file => {
          fs.unlinkSync(file.path);
          logger.system('Old backup deleted', { filename: file.name });
        });

        logger.system('Backup cleanup', { 
          kept: this.maxBackups, 
          deleted: toDelete.length 
        });
      }

    } catch (error) {
      logger.error('Cleanup failed', { error: error.message });
    }
  }

  /**
   * Lấy danh sách backups
   * @returns {Array} List of backups
   */
  listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('backup_') && file.endsWith('.db'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            filename: file,
            path: filePath,
            size: Math.round(stats.size / 1024), // KB
            created: stats.mtime,
            age: this.getAge(stats.mtime)
          };
        })
        .sort((a, b) => b.created - a.created); // Mới nhất trước

      return files;

    } catch (error) {
      logger.error('Failed to list backups', { error: error.message });
      return [];
    }
  }

  /**
   * Restore từ backup
   * @param {string} filename - Backup filename
   * @returns {Object} { success: boolean }
   */
  restoreBackup(filename) {
    try {
      const backupPath = path.join(this.backupDir, filename);

      // Kiểm tra backup tồn tại
      if (!fs.existsSync(backupPath)) {
        logger.error('Backup file not found', { filename });
        return { success: false, error: 'Backup file not found' };
      }

      // Backup database hiện tại trước khi restore
      const preRestoreBackup = this.createBackup('pre-restore');
      
      if (!preRestoreBackup.success) {
        return { 
          success: false, 
          error: 'Failed to backup current database before restore' 
        };
      }

      // Restore
      fs.copyFileSync(backupPath, this.dbPath);

      logger.system('Database restored', { 
        from: filename,
        preRestoreBackup: preRestoreBackup.filename
      });

      return { 
        success: true, 
        restoredFrom: filename,
        preRestoreBackup: preRestoreBackup.filename
      };

    } catch (error) {
      logger.error('Restore failed', { 
        error: error.message, 
        filename 
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get human-readable age
   */
  getAge(date) {
    const now = Date.now();
    const diff = now - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return 'Vừa xong';
  }

  /**
   * Get backup stats
   */
  getStats() {
    const backups = this.listBackups();
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);

    return {
      count: backups.length,
      totalSize: totalSize, // KB
      oldest: backups.length > 0 ? backups[backups.length - 1].created : null,
      newest: backups.length > 0 ? backups[0].created : null
    };
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================
const backupManager = new BackupManager();

// ========================================
// AUTO BACKUP SCHEDULE (24h)
// ========================================
const AUTO_BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// Backup ngay khi start bot (sau 5 phút)
setTimeout(() => {
  logger.system('Auto backup', 'Creating startup backup...');
  backupManager.createBackup('startup');
}, 5 * 60 * 1000);

// Backup định kỳ mỗi 24h
setInterval(() => {
  logger.system('Auto backup', 'Creating scheduled backup...');
  backupManager.createBackup('auto');
}, AUTO_BACKUP_INTERVAL);

// Export
module.exports = backupManager;