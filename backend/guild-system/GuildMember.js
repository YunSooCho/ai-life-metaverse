/**
 * GuildMember - 길드 멤버 싱글톤 관리
 * 개별 멤버의 기여도, 역할, 활동 로그 관리
 */

export default class GuildMember {
  constructor(guildManager) {
    this.guildManager = guildManager;
  }

  /**
   * 멤버 기여도 추가
   * @param {string} characterId - 캐릭터 ID
   * @param {number} amount - 기여도 양
   * @returns {Promise<Object>} 업데이트된 멤버 정보
   */
  async addContribution(characterId, amount) {
    const guild = await this.guildManager.getGuildByCharacter(characterId);
    if (!guild) return null;

    const member = guild.members.find(m => m.characterId === characterId);
    if (!member) return null;

    member.contribution += amount;

    // 저장
    this.guildManager.guilds.set(guild.guildId, guild);
    if (this.guildManager.redis) {
      await this.guildManager.redis.hset('guilds', guild.guildId, JSON.stringify(guild));
    }

    return member;
  }

  /**
   * 멤버 활동 기록
   * @param {string} characterId - 캐릭터 ID
   * @param {string} type - 활동 유형 ('raid', 'war', 'quest', 'event')
   * @param {Object} details - 활동 상세
   * @returns {Promise<Object>} 업데이트된 멤버 정보
   */
  async logActivity(characterId, type, details = {}) {
    const guild = await this.guildManager.getGuildByCharacter(characterId);
    if (!guild) return null;

    const member = guild.members.find(m => m.characterId === characterId);
    if (!member) return null;

    // 활동 카운트 증가
    if (type === 'raid') {
      member.raidCount++;
    } else if (type === 'war') {
      member.warCount++;
    }

    // 활동 로그 추가
    if (!member.activityLog) {
      member.activityLog = [];
    }
    member.activityLog.push({
      type,
      timestamp: Date.now(),
      ...details
    });

    // 로그 제한 (최대 100개)
    if (member.activityLog.length > 100) {
      member.activityLog = member.activityLog.slice(-100);
    }

    // 저장
    this.guildManager.guilds.set(guild.guildId, guild);
    if (this.guildManager.redis) {
      await this.guildManager.redis.hset('guilds', guild.guildId, JSON.stringify(guild));
    }

    return member;
  }

  /**
   * 멤버 닉네임 변경
   * @param {string} characterId - 캐릭터 ID
   * @param {string} nickname - 닉네임 (null이면 기본 이름 사용)
   * @returns {Promise<Object>} 업데이트된 멤버 정보
   */
  async setNickname(characterId, nickname) {
    const guild = await this.guildManager.getGuildByCharacter(characterId);
    if (!guild) return null;

    const member = guild.members.find(m => m.characterId === characterId);
    if (!member) return null;

    member.nickname = nickname;

    // 저장
    this.guildManager.guilds.set(guild.guildId, guild);
    if (this.guildManager.redis) {
      await this.guildManager.redis.hset('guilds', guild.guildId, JSON.stringify(guild));
    }

    return member;
  }

  /**
   * 길드 멤버 목록 조회
   * @param {string} guildId - 길드 ID
   * @returns {Array<Object>} 멤버 목록
   */
  getGuildMembers(guildId) {
    const guild = this.guildManager.getGuild(guildId);
    if (!guild) return [];

    return guild.members.map(member => {
      const role = guild.roles.find(r => r.roleId === member.roleId);
      return {
        ...member,
        roleName: role ? role.name : '알 수 없음',
        permissions: role ? role.permissions : {}
      };
    });
  }

  /**
   * 멤버 정보 조회
   * @param {string} characterId - 캐릭터 ID
   * @returns {Object|null} 멤버 정보
   */
  async getMemberInfo(characterId) {
    const guild = await this.guildManager.getGuildByCharacter(characterId);
    if (!guild) return null;

    const member = guild.members.find(m => m.characterId === characterId);
    if (!member) return null;

    const role = guild.roles.find(r => r.roleId === member.roleId);
    return {
      ...member,
      guildId: guild.guildId,
      guildName: guild.name,
      guildLevel: guild.level,
      roleName: role ? role.name : '알 수 없음',
      permissions: role ? role.permissions : {}
    };
  }
}