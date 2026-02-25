/**
 * 길드 관리 시스템
 * 길드 생성, 관리, 멤버 관리 기능
 */

class GuildManager {
  constructor() {
    this.guilds = new Map(); // guildId -> Guild
    this.playerGuilds = new Map(); // playerId -> guildId
  }

  /**
   * 길드 생성
   * @param {string} leaderId - 길드장 ID
   * @param {string} leaderName - 길드장 이름
   * @param {string} guildName - 길드 이름
   * @param {string} emblem - 길드 문장 (emoji)
   * @returns {Object} 생성된 길드 정보
   */
  createGuild(leaderId, leaderName, guildName, emblem = '🏰') {
    if (!leaderId || !leaderName || !guildName) {
      throw new Error('길드장 ID, 이름, 길드 이름은 필수입니다.');
    }

    if (this.playerGuilds.has(leaderId)) {
      throw new Error('이미 길드에 소속되어 있습니다.');
    }

    // 길드 이름 중복 확인
    for (const guild of this.guilds.values()) {
      if (guild.name === guildName) {
        throw new Error('이미 존재하는 길드 이름입니다.');
      }
    }

    const guildId = `guild-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const guild = {
      id: guildId,
      name: guildName,
      emblem,
      level: 1,
      exp: 0,
      maxExp: 1000,
      leaderId,
      members: [{
        id: leaderId,
        name: leaderName,
        role: 'leader', // leader, officer, member
        joinedAt: Date.now()
      }],
      createdAt: Date.now(),
      messageCount: 0,
      questCompleted: 0
    };

    this.guilds.set(guildId, guild);
    this.playerGuilds.set(leaderId, guildId);

    return guild;
  }

  /**
   * 길드 해체
   * @param {string} guildId - 길드 ID
   * @param {string} leaderId - 길드장 ID
   */
  disbandGuild(guildId, leaderId) {
    const guild = this.guilds.get(guildId);
    if (!guild) {
      throw new Error('길드를 찾을 수 없습니다.');
    }

    if (guild.leaderId !== leaderId) {
      throw new Error('길드장만 길드를 해체할 수 있습니다.');
    }

    // 모든 멤버의 길드 참조 제거
    for (const member of guild.members) {
      this.playerGuilds.delete(member.id);
    }

    this.guilds.delete(guildId);
    return { success: true, message: '길드가 해체되었습니다.' };
  }

  /**
   * 길드 가입 요청
   * @param {string} guildId - 길드 ID
   * @param {string} playerId - 플레이어 ID
   * @param {string} playerName - 플레이어 이름
   */
  requestJoin(guildId, playerId, playerName) {
    if (this.playerGuilds.has(playerId)) {
      throw new Error('이미 길드에 소속되어 있습니다.');
    }

    const guild = this.guilds.get(guildId);
    if (!guild) {
      throw new Error('길드를 찾을 수 없습니다.');
    }

    // 간단한 구현: 즉시 가입 (나중에 승인 시스템 추가 가능)
    guild.members.push({
      id: playerId,
      name: playerName,
      role: 'member',
      joinedAt: Date.now()
    });

    this.playerGuilds.set(playerId, guildId);
    return { success: true, message: `${playerName}님이 길드에 가입했습니다.` };
  }

  /**
   * 길드 탈퇴
   * @param {string} playerId - 플레이어 ID
   */
  leaveGuild(playerId) {
    const guildId = this.playerGuilds.get(playerId);
    if (!guildId) {
      throw new Error('길드에 소속되어 있지 않습니다.');
    }

    const guild = this.guilds.get(guildId);
    if (!guild) {
      throw new Error('길드를 찾을 수 없습니다.');
    }

    // 길드장은 탈퇴 불가 (해체해야 함)
    if (guild.leaderId === playerId) {
      throw new Error('길드장은 탈퇴할 수 없습니다. 길드를 해체해주세요.');
    }

    // 멤버 제거
    guild.members = guild.members.filter(m => m.id !== playerId);
    this.playerGuilds.delete(playerId);

    return { success: true, message: '길드에서 탈퇴했습니다.' };
  }

  /**
   * 멤버 추방
   * @param {string} guildId - 길드 ID
   * @param {string} leaderId - 길드장 ID
   * @param {string} targetId - 추방할 멤버 ID
   */
  kickMember(guildId, leaderId, targetId) {
    const guild = this.guilds.get(guildId);
    if (!guild) {
      throw new Error('길드를 찾을 수 없습니다.');
    }

    if (guild.leaderId !== leaderId) {
      throw new Error('길드장만 멤버를 추방할 수 있습니다.');
    }

    // 길드장 자신은 추방 불가
    if (targetId === leaderId) {
      throw new Error('길드장은 추방할 수 없습니다.');
    }

    const memberIndex = guild.members.findIndex(m => m.id === targetId);
    if (memberIndex === -1) {
      throw new Error('멤버를 찾을 수 없습니다.');
    }

    const kickedMember = guild.members[memberIndex].name;
    guild.members.splice(memberIndex, 1);
    this.playerGuilds.delete(targetId);

    return { success: true, message: `${kickedMember}님이 추방되었습니다.` };
  }

  /**
   * 길드장 위임
   * @param {string} guildId - 길드 ID
   * @param {string} currentLeaderId - 현재 길드장 ID
   * @param {string} newLeaderId - 새 길드장 ID
   */
  transferLeadership(guildId, currentLeaderId, newLeaderId) {
    const guild = this.guilds.get(guildId);
    if (!guild) {
      throw new Error('길드를 찾을 수 없습니다.');
    }

    if (guild.leaderId !== currentLeaderId) {
      throw new Error('현재 길드장만 위임할 수 있습니다.');
    }

    const newLeader = guild.members.find(m => m.id === newLeaderId);
    if (!newLeader) {
      throw new Error('새 길드장을 찾을 수 없습니다.');
    }

    // 기존 길드장을 멤버로 변경
    const oldLeader = guild.members.find(m => m.id === currentLeaderId);
    if (oldLeader) oldLeader.role = 'member';

    // 새 길드장 설정
    newLeader.role = 'leader';
    guild.leaderId = newLeaderId;

    return { success: true, message: `${newLeader.name}님에게 길드장이 위임되었습니다.` };
  }

  /**
   * 길드 정보 조회
   * @param {string} guildId - 길드 ID
   */
  getGuildInfo(guildId) {
    const guild = this.guilds.get(guildId);
    if (!guild) {
      throw new Error('길드를 찾을 수 없습니다.');
    }
    return guild;
  }

  /**
   * 플레이어의 길드 조회
   * @param {string} playerId - 플레이어 ID
   */
  getPlayerGuild(playerId) {
    const guildId = this.playerGuilds.get(playerId);
    if (!guildId) {
      return null;
    }
    return this.getGuildInfo(guildId);
  }

  /**
   * 경험치 추가 (길드 레벨업)
   * @param {string} guildId - 길드 ID
   * @param {number} exp - 경험치
   */
  addExp(guildId, exp) {
    const guild = this.guilds.get(guildId);
    if (!guild) {
      return;
    }

    guild.exp += exp;

    // 레벨업 체크
    while (guild.exp >= guild.maxExp) {
      guild.exp -= guild.maxExp;
      guild.level++;
      guild.maxExp = Math.floor(guild.maxExp * 1.5);
    }
  }

  /**
   * 메시지 카운트 증가
   * @param {string} guildId - 길드 ID
   */
  incrementMessageCount(guildId) {
    const guild = this.guilds.get(guildId);
    if (guild) {
      guild.messageCount++;
    }
  }

  /**
   * 퀘스트 완료 수 증가
   * @param {string} guildId - 길드 ID
   */
  incrementQuestCompleted(guildId) {
    const guild = this.guilds.get(guildId);
    if (guild) {
      guild.questCompleted++;
    }
  }

  /**
   * 채팅 메시지 전송
   * @param {string} guildId - 길드 ID
   * @param {string} playerId - 플레이어 ID
   * @param {string} playerName - 플레이어 이름
   * @param {string} message - 메시지
   * @returns {Object} 메시지 객체
   */
  sendMessage(guildId, playerId, playerName, message) {
    const guild = this.guilds.get(guildId);
    if (!guild) {
      throw new Error('길드를 찾을 수 없습니다.');
    }

    const member = guild.members.find(m => m.id === playerId);
    if (!member) {
      throw new Error('길드 멤버가 아닙니다.');
    }

    const guildChat = this.getGuildChat(guildId);
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      playerId,
      playerName,
      playerRole: member.role,
      message,
      timestamp: Date.now()
    };

    guildChat.messages.push(msg);

    // 최대 100개 메시지 유지
    if (guildChat.messages.length > 100) {
      guildChat.messages.shift();
    }

    this.incrementMessageCount(guildId);
    return msg;
  }

  /**
   * 길드 채팅 조회
   * @param {string} guildId - 길드 ID
   */
  getGuildChat(guildId) {
    const guild = this.guilds.get(guildId);
    if (!guild) {
      throw new Error('길드를 찾을 수 없습니다.');
    }

    if (!guild.chat) {
      guild.chat = {
        messages: [],
        lastMessageId: null
      };
    }

    return guild.chat;
  }

  /**
   * 길드 채팅 히스토리 조회
   * @param {string} guildId - 길드 ID
   * @param {number} limit - 가져올 메시지 수
   */
  getChatHistory(guildId, limit = 50) {
    const guildChat = this.getGuildChat(guildId);
    return guildChat.messages.slice(-limit);
  }

  /**
   * 시스템 정보 조회
   */
  getSystemStats() {
    return {
      totalGuilds: this.guilds.size,
      totalMembers: Array.from(this.guilds.values())
        .reduce((sum, guild) => sum + guild.members.length, 0),
      totalMessages: Array.from(this.guilds.values())
        .reduce((sum, guild) => sum + (guild.messageCount || 0), 0),
      totalQuests: Array.from(this.guilds.values())
        .reduce((sum, guild) => sum + (guild.questCompleted || 0), 0)
    };
  }
}

module.exports = GuildManager;