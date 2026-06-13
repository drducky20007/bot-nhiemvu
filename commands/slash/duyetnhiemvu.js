const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, 'shared', 'database', 'db.js');
const { db, getOrCreateUser } = require(dbPath);
const logger = require('./shared/utils/logger');
const roleManager = require('./shared/utils/roleManager');
const achievements = require('./shared/utils/achievements');

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

async function countWordsInThread(thread) {
  let allMessages = [];
  let lastId;

  while (true) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;

    const messages = await thread.messages.fetch(options);
    allMessages.push(...messages.filter(m => !m.author.bot).map(m => m));
    
    if (messages.size < 100) break;
    lastId = messages.last().id;
  }

  const fullText = allMessages.map(m => m.content).join(' ');
  
  return {
    wordCount: countWords(fullText),
    firstUserId: allMessages[0]?.author?.id || null
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('duyetnhiemvu')
    .setDescription('Duyệt bài viết trong thread hiện tại (thread owner hoặc admin)'),

  async execute(interaction) {
    const userId = interaction.user.id;
    
    try {
      const thread = interaction.channel;

      if (!thread.isThread()) {
        return interaction.reply({ 
          content: '❌ Lệnh này chỉ dùng được trong thread.', 
          flags: 64
        });
      }

      const validForumIds = process.env.ROLE_FORUM_CHANNEL_IDS?.split(',') || [];
      
      if (!validForumIds.includes(thread.parentId)) {
        return interaction.reply({ 
          content: '❌ Thread này không nằm trong kênh nhiệm vụ hợp lệ.', 
          flags: 64
        });
      }

      await interaction.deferReply({ flags: 64 });

      // ✅ GET THREAD OWNER (người tạo thread)
      const threadOwnerId = thread.ownerId;
      const isAdmin = interaction.member.permissions.has('Administrator');
      const isThreadOwner = userId === threadOwnerId;

      if (!isAdmin && !isThreadOwner) {
        return interaction.editReply({
          content: '❌ Chỉ owner thread hoặc admin mới có thể duyệt bài viết này!'
        });
      }

      const { wordCount, firstUserId } = await countWordsInThread(thread);

      if (!firstUserId) {
        logger.command('duyetnhiemvu', userId, false);
        return interaction.editReply({ 
          content: '❌ Không tìm thấy bài viết hợp lệ trong thread.' 
        });
      }

      // ✅ Extract mission ID from thread name
      let missionId = null;
      
      let idMatch = thread.name.match(/NV\s*(\d+)/i);
      if (!idMatch) idMatch = thread.name.match(/Nhiệm vụ\s+(\d+)/i);
      if (!idMatch) idMatch = thread.name.match(/Mission\s*(\d+)/i);
      if (!idMatch) idMatch = thread.name.match(/^(\d+)\s*[-–—]/);
      if (!idMatch) idMatch = thread.name.match(/^(\d+)$/);
      if (!idMatch) idMatch = thread.name.match(/(\d+)/);

      if (!idMatch) {
        logger.command('duyetnhiemvu', userId, false);
        return interaction.editReply({ 
          content: '⚠️ Không tìm thấy ID nhiệm vụ trong tên thread!\n\n' +
                   '**Tên thread phải chứa ID số, ví dụ:**\n' +
                   '• "NV 005"\n' +
                   '• "Nhiệm vụ 005"\n' +
                   '• "005 - Tiêu đề"' 
        });
      }

      missionId = idMatch[1];
      console.log(`✅ Found mission ID: ${missionId} from thread: "${thread.name}"`);

      // ✅ Verify user has this mission
      const userMission = db.prepare(`
        SELECT * FROM user_missions 
        WHERE user_id = ? AND mission_id = ?
      `).get(firstUserId, missionId);

      if (!userMission && !isAdmin) {
        return interaction.editReply({
          content: `⚠️ User <@${firstUserId}> không có nhiệm vụ ID ${missionId}!`
        });
      }

      const mission = db.prepare(`
        SELECT * FROM missions WHERE id = ?
      `).get(missionId);

      if (!mission) {
        logger.command('duyetnhiemvu', userId, false);
        return interaction.editReply({ 
          content: `⚠️ Không tìm thấy nhiệm vụ **${missionId}** trong database!` 
        });
      }

      const minWords = mission.min_words || 500;
      const passed = wordCount >= minWords;

      const missionExp = mission.reward_exp || Math.floor(mission.reward * 0.5);
      const missionPoints = Math.floor(mission.reward * 0.2);

      if (passed) {
        const approvalTransaction = db.transaction(() => {
          // ✅ Ensure user exists
          getOrCreateUser(firstUserId, 'User');

          // Cộng tiền thưởng
          db.prepare(`
            UPDATE users SET balance = balance + ? WHERE user_id = ?
          `).run(mission.reward, firstUserId);

          // Log transaction
          db.prepare(`
            INSERT INTO transactions (user_id, type, amount, description)
            VALUES (?, 'mission-complete', ?, ?)
          `).run(
            firstUserId, 
            mission.reward, 
            `Hoàn thành nhiệm vụ ${missionId} - ${mission.title}`
          );

          db.prepare('INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)').run(firstUserId);

          db.prepare(`
            UPDATE user_stats 
            SET 
              total_missions_completed = total_missions_completed + 1,
              last_mission_completed_date = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `).run(firstUserId);

          const stats = db.prepare(`
            SELECT last_mission_completed_date, mission_streak_days
            FROM user_stats WHERE user_id = ?
          `).get(firstUserId);

          if (stats && stats.last_mission_completed_date) {
            const lastDate = new Date(stats.last_mission_completed_date);
            const today = new Date();
            const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              db.prepare('UPDATE user_stats SET mission_streak_days = mission_streak_days + 1 WHERE user_id = ?').run(firstUserId);
            } else if (diffDays > 1) {
              db.prepare('UPDATE user_stats SET mission_streak_days = 1 WHERE user_id = ?').run(firstUserId);
            }
          }

          db.prepare(`
            DELETE FROM user_missions WHERE user_id = ? AND mission_id = ?
          `).run(firstUserId, missionId);

          // ✅ DELETE OLD TASK LOGS FOR THIS THREAD
          db.prepare('DELETE FROM task_logs WHERE thread_id = ?').run(thread.id);

          // ✅ INSERT NEW TASK LOG
          db.prepare(`
            INSERT INTO task_logs 
            (thread_id, user_id, mission_id, passed, word_count, reward_ely, reward_exp, points_earned, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).run(
            thread.id, 
            firstUserId, 
            missionId, 
            1, 
            wordCount,
            mission.reward,
            missionExp,
            missionPoints
          );
        });

        approvalTransaction();

        const progressMessages = [];

        try {
          const expResult = await roleManager.awardExp(firstUserId, missionExp, interaction.guild);
          
          if (expResult.success) {
            progressMessages.push(`⭐ +${missionExp.toLocaleString()} EXP`);
            
            if (expResult.leveledUp) {
              progressMessages.push(`\n🎊 **LEVEL UP!** ${expResult.oldLevel} → ${expResult.newLevel}`);
              
              if (expResult.roleUpdate && expResult.roleUpdate.roleAdded) {
                const rankEmoji = expResult.roleUpdate.roleAdded.emoji || '🎭';
                const rankName = expResult.roleUpdate.roleAdded.name || expResult.roleUpdate.roleAdded.rank;
                progressMessages.push(`${rankEmoji} New rank: **${rankName}**`);
              }
            }
          }
        } catch (expError) {
          console.error('EXP award error:', expError.message);
        }

        if (missionPoints > 0) {
          progressMessages.push(`🎯 +${missionPoints.toLocaleString()} Points`);
        }

        try {
          const newAchievements = await achievements.checkAndAwardAchievements(firstUserId, 'missions');
          
          if (newAchievements.length > 0) {
            progressMessages.push('\n🏆 **Achievements Unlocked:**');
            for (const ach of newAchievements) {
              const badge = ach.badge_emoji || '🏆';
              progressMessages.push(`${badge} ${ach.name}`);
              
              const rewards = [];
              if (ach.reward_ely > 0) rewards.push(`+${ach.reward_ely.toLocaleString()} Ely`);
              if (ach.reward_exp > 0) rewards.push(`+${ach.reward_exp.toLocaleString()} EXP`);
              if (rewards.length > 0) {
                progressMessages.push(`   💰 ${rewards.join(', ')}`);
              }
            }
          }
        } catch (achError) {
          console.error('Achievement check error:', achError.message);
        }

        let resultMessage = `✅ **NHIỆM VỤ HOÀN THÀNH!**\n\n` +
          `📝 Mission: **${mission.title}** (ID: ${missionId})\n` +
          `📊 Số từ: **${wordCount}**\n` +
          `💰 <@${firstUserId}> nhận được **${mission.reward.toLocaleString()} Ely**!`;

        if (progressMessages.length > 0) {
          resultMessage += '\n\n' + progressMessages.join('\n');
        }

        await thread.send(resultMessage);
        
        logger.command('duyetnhiemvu', userId, true, { missionId, firstUserId, passed: true, wordCount });

      } else {
        db.prepare('INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)').run(firstUserId);
        
        db.prepare(`
          UPDATE user_stats
          SET total_missions_failed = total_missions_failed + 1
          WHERE user_id = ?
        `).run(firstUserId);
        
        db.prepare(`
          INSERT OR REPLACE INTO task_logs (thread_id, user_id, mission_id, passed, word_count, completed_at)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(thread.id, firstUserId, missionId, 0, wordCount);

        const resultMessage = `❌ **Bài viết chưa đạt yêu cầu**\n\n` +
          `📝 Mission: **${mission.title}** (ID: ${missionId})\n` +
          `📊 Số từ: **${wordCount}** / ${minWords} (tính cả comment)\n` +
          `📝 Cần thêm: **${minWords - wordCount} từ**\n\n` +
          `💡 Viết thêm rồi dùng \`/duyetnhiemvu\` lại!`;

        await thread.send(resultMessage);
        
        logger.command('duyetnhiemvu', userId, true, { missionId, firstUserId, passed: false, wordCount });
      }

      if (passed) {
        await thread.setLocked(true);
      }

      const embed = new EmbedBuilder()
        .setColor(passed ? '#4CAF50' : '#FF6B6B')
        .setTitle(passed ? '✅ Đã duyệt - PASS' : '❌ Chưa đạt yêu cầu')
        .addFields(
          { name: 'Nhiệm vụ', value: `${missionId} - ${mission.title}`, inline: false },
          { name: 'User', value: `<@${firstUserId}>`, inline: true },
          { name: 'Số từ', value: `${wordCount} / ${minWords}`, inline: true },
          { name: 'Kết quả', value: passed ? '✅ Pass' : '❌ Fail', inline: true }
        )
        .setFooter({ text: `Duyệt bởi: ${interaction.user.username}` })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });

    } catch (error) {
      logger.command('duyetnhiemvu', userId, false, error);
      console.error('❌ Error in /duyetnhiemvu:', error);
      
      if (interaction.deferred) {
        return interaction.editReply({ 
          content: '❌ Có lỗi xảy ra khi duyệt nhiệm vụ:\n```\n' + error.message + '\n```' 
        });
      } else {
        return interaction.reply({ 
          content: '❌ Có lỗi xảy ra khi duyệt nhiệm vụ.', 
          flags: 64
        });
      }
    }
  }
};
