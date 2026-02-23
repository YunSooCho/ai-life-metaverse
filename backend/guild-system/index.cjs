/**
 * 길드 시스템 통합 모듈
 * 길드 매니저, 길드 퀘스트 시스템 통합
 */

const GuildManager = require('./guild-manager.cjs');
const { GuildQuestManager } = require('./guild-quest.cjs');

class GuildSystem {
  constructor() {
    this.guildManager = new GuildManager();
    this.questManager = null; // 나중에 초기화
    this.initialized = false;
  }

  /**
   * 시스템 초기화
   */
  initialize() {
    if (this.initialized) {
      return this;
    }

    this.questManager = new GuildQuestManager(this.guildManager);
    this.initialized = true;

    return this;
  }

  // ===== 길드 관리 =====

  createGuild(leaderId, leaderName, guildName, emblem = '🏰') {
    return this.guildManager.createGuild(leaderId, leaderName, guildName, emblem);
  }

  disbandGuild(guildId, leaderId) {
    return this.guildManager.disbandGuild(guildId, leaderId);
  }

  requestJoin(guildId, playerId, playerName) {
    return this.guildManager.requestJoin(guildId, playerId, playerName);
  }

  leaveGuild(playerId) {
    const guild = this.guildManager.getPlayerGuild(playerId);
    if (guild) {
      if (guild.chat) {
        // 채팅에 퇴장 메시지 추가
        const msg = {
          id: `msg-${Date.now()}`,
          playerId: 'system',
          playerName: '시스템',
          playerRole: 'system',
          message: `${this.guildManager.getPlayerGuild(playerId).members.find(m => m.id === playerId)?.name}님이 길드를 떠났습니다.`,
          timestamp: Date.now()
        };
        guild.chat?.messages?.push(msg);
      }
    }
    return this.guildManager.leaveGuild(playerId);
  }

  kickMember(guildId, leaderId, targetId) {
    return this.guildManager.kickMember(guildId, leaderId, targetId);
  }

  transferLeadership(guildId, currentLeaderId, newLeaderId) {
    return this.guildManager.transferLeadership(guildId, currentLeaderId, newLeaderId);
  }

  getGuildInfo(guildId) {
    return this.guildManager.getGuildInfo(guildId);
  }

  getPlayerGuild(playerId) {
    return this.guildManager.getPlayerGuild(playerId);
  }

  // ===== 길드 채팅 =====

  sendMessage(guildId, playerId, playerName, message) {
    return this.guildManager.sendMessage(guildId, playerId, playerName, message);
  }

  getChatHistory(guildId, limit = 50) {
    return this.guildManager.getChatHistory(guildId, limit);
  }

  // ===== 길드 퀘스트 =====

  generateGuildQuest(guildId) {
    return this.questManager.generateGuildQuest(guildId);
  }

  getActiveQuests(guildId) {
    return this.questManager.getActiveQuests(guildId);
  }

  updateQuestProgress(guildId, playerId, eventType, data) {
    return this.questManager.updateQuestProgress(guildId, playerId, eventType, data);
  }

  completeQuest(guildId, questId) {
    return this.questManager.completeQuest(guildId, questId);
  }

  cleanupExpiredQuests() {
    return this.questManager.cleanupExpiredQuests();
  }

  // ===== 시스템 정보 =====

  getSystemStats() {
    const guildStats = this.guildManager.getSystemStats();
    const questStats = this.questManager ? this.questManager.getStats() : { totalActiveQuests: 0 };

    return {
      guilds: guildStats,
      quests: questStats
    };
  }

  // ===== 유틸리티 =====

  isPlayerInGuild(playerId) {
    return this.guildManager.playerGuilds.has(playerId);
  }

  getGuildEmblem(guildId) {
    const guild = this.guildManager.guilds.get(guildId);
    return guild ? guild.emblem : null;
  }

  getGuildName(guildId) {
    const guild = this.guildManager.guilds.get(guildId);
    return guild ? guild.name : null;
  }
}

// Singleton 인스턴스
let guildSystemInstance = null;

/**
 * 길드 시스템 초기화
 */
function initializeGuildSystem() {
  if (!guildSystemInstance) {
    guildSystemInstance = new GuildSystem().initialize();
  }
  return guildSystemInstance;
}

/**
 * 길드 시스템 인스턴스 가져오기
 */
function getGuildSystem() {
  if (!guildSystemInstance) {
    throw new Error('길드 시스템이 초기화되지 않았습니다. initializeGuildSystem()를 먼저 호출하세요.');
  }
  return guildSystemInstance;
}

module.exports = {
  GuildSystem,
  initializeGuildSystem,
  getGuildSystem
};