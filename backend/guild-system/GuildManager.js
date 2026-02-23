/**
 * GuildManager - 길드 인스턴스 관리
 * 길드 생성/해체, 길드 정보 관리, 멤버 관리
 */

const { v4: uuidv4 } = require('uuid');

class GuildManager {
  constructor(redisClient) {
    this.redis = redisClient;
    this.guilds = new Map(); // In-memory cache
    this.ROLE_PERMISSIONS = {
      MASTER: {
        name: '길드장',
        canKick: true,
        canInvite: true,
        canDisband: true,
        canManageRoles: true,
        canManageWars: true,
        canManageRaids: true
      },
      OFFICER: {
        name: '부길드장',
        canKick: true,
        canInvite: true,
        canDisband: false,
        canManageRoles: false,
        canManageWars: true,
        canManageRaids: true
      },
      MEMBER: {
        name: '길드원',
        canKick: false,
        canInvite: true,
        canDisband: false,
        canManageRoles: false,
        canManageWars: false,
        canManageRaids: false
      },
      TRAINEE: {
        name: '수습생',
        canKick: false,
        canInvite: false,
        canDisband: false,
        canManageRoles: false,
        canManageWars: false,
        canManageRaids: false
      }
    };
  }

  /**
   * 길드 생성
   * @param {string} name - 길드 이름
   * @param {string} description - 길드 설명
   * @param {string} masterId - 길드장 캐릭터 ID
   * @returns {Promise<Object>} 생성된 길드 정보
   */
  async createGuild(name, description, masterId) {
    const guildId = uuidv4();
    const guild = {
      guildId,
      name,
      description: description || '',
      masterId,
      createdAt: Date.now(),
      level: 1,
      exp: 0,
      expToNext: 1000,
      maxMembers: 30,
      memberCount: 1,
      gold: 0,
      members: [],
      roles: [],
      wars: [],
      raids: []
    };

    // 기본 역할 생성
    guild.roles = [
      { roleId: 'master', name: '길드장', permissions: this.ROLE_PERMISSIONS.MASTER },
      { roleId: 'officer', name: '부길드장', permissions: this.ROLE_PERMISSIONS.OFFICER },
      { roleId: 'member', name: '길드원', permissions: this.ROLE_PERMISSIONS.MEMBER },
      { roleId: 'trainee', name: '수습생', permissions: this.ROLE_PERMISSIONS.TRAINEE }
    ];

    // 길드장 추가
    guild.members.push({
      characterId: masterId,
      roleId: 'master',
      nickname: null,
      joinedAt: Date.now(),
      contribution: 0,
      raidCount: 0,
      warCount: 0
    });

    // 메모리 캐시에 저장
    this.guilds.set(guildId, guild);

    // Redis에 저장
    if (this.redis) {
      await this.redis.hset('guilds', guildId, JSON.stringify(guild));
      await this.redis.sadd('guild:members:' + guildId, masterId);
      await this.redis.set('character:guild:' + masterId, guildId);
    }

    return guild;
  }

  /**
   * 길드 해체
   * @param {string} guildId - 길드 ID
   * @param {string} characterId - 요청 캐릭터 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  async disbandGuild(guildId, characterId) {
    const guild = this.getGuild(guildId);
    if (!guild) return false;
    if (guild.masterId !== characterId) return false;

    // 모든 멤버의 길드 ID 제거
    for (const member of guild.members) {
      if (this.redis) {
        await this.redis.del('character:guild:' + member.characterId);
      }
    }

    // 길드 삭제
    this.guilds.delete(guildId);
    if (this.redis) {
      await this.redis.hdel('guilds', guildId);
      await this.redis.del('guild:members:' + guildId);
    }

    return true;
  }

  /**
   * 길드 정보 조회
   * @param {string} guildId - 길드 ID
   * @returns {Object|null} 길드 정보
   */
  getGuild(guildId) {
    let guild = this.guilds.get(guildId);
    if (!guild && this.redis) {
      const data = this.redis.hget('guilds', guildId);
      if (data) {
        guild = JSON.parse(data);
        this.guilds.set(guildId, guild);
      }
    }
    return guild || null;
  }

  /**
   * 캐릭터의 길드 조회
   * @param {string} characterId - 캐릭터 ID
   * @returns {Object|null} 길드 정보
   */
  async getGuildByCharacter(characterId) {
    if (this.redis) {
      const guildId = await this.redis.get('character:guild:' + characterId);
      if (guildId) {
        return this.getGuild(guildId);
      }
    }

    // In-memory fallback
    for (const [guildId, guild] of this.guilds) {
      const member = guild.members.find(m => m.characterId === characterId);
      if (member) return guild;
    }
    return null;
  }

  /**
   * 길드에 멤버 초대
   * @param {string} guildId - 길드 ID
   * @param {string} inviterId - 초대자 ID
   * @param {string} inviteeId - 초대받는 사람 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  async inviteMember(guildId, inviterId, inviteeId) {
    const guild = this.getGuild(guildId);
    if (!guild) return false;

    // 권한 확인
    const inviter = guild.members.find(m => m.characterId === inviterId);
    if (!inviter) return false;

    const role = guild.roles.find(r => r.roleId === inviter.roleId);
    if (!role || !role.permissions.canInvite) return false;

    // 이미 길드에 있는지 확인
    if (guild.members.find(m => m.characterId === inviteeId)) return false;
    if (guild.memberCount >= guild.maxMembers) return false;

    // 이미 다른 길드에 있는지 확인
    if (await this.getGuildByCharacter(inviteeId)) return false;

    // 멤버 추가 (기본 역할: 수습생)
    guild.members.push({
      characterId: inviteeId,
      roleId: 'trainee',
      nickname: null,
      joinedAt: Date.now(),
      contribution: 0,
      raidCount: 0,
      warCount: 0
    });

    guild.memberCount++;

    // 저장
    this.guilds.set(guildId, guild);
    if (this.redis) {
      await this.redis.hset('guilds', guildId, JSON.stringify(guild));
      await this.redis.sadd('guild:members:' + guildId, inviteeId);
      await this.redis.set('character:guild:' + inviteeId, guildId);
    }

    return true;
  }

  /**
   * 길드에서 멤버 추방
   * @param {string} guildId - 길드 ID
   * @param {string} kickerId - 추방자 ID
   * @param {string} targetId - 추방 대상 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  async kickMember(guildId, kickerId, targetId) {
    const guild = this.getGuild(guildId);
    if (!guild) return false;

    // 길드장은 추방 불가
    if (targetId === guild.masterId) return false;

    // 권한 확인
    const kicker = guild.members.find(m => m.characterId === kickerId);
    if (!kicker) return false;

    const role = guild.roles.find(r => r.roleId === kicker.roleId);
    if (!role || !role.permissions.canKick) return false;

    // 멤버 제거
    const index = guild.members.findIndex(m => m.characterId === targetId);
    if (index === -1) return false;

    guild.members.splice(index, 1);
    guild.memberCount--;

    // 저장
    this.guilds.set(guildId, guild);
    if (this.redis) {
      await this.redis.hset('guilds', guildId, JSON.stringify(guild));
      await this.redis.srem('guild:members:' + guildId, targetId);
      await this.redis.del('character:guild:' + targetId);
    }

    return true;
  }

  /**
   * 길드 경험치 추가
   * @param {string} guildId - 길드 ID
   * @param {number} exp - 추가할 경험치
   * @returns {Promise<Object>} 업데이트된 길드 정보
   */
  async addGuildExp(guildId, exp) {
    const guild = this.getGuild(guildId);
    if (!guild) return null;

    guild.exp += exp;

    // 레벨업 체크
    while (guild.exp >= guild.expToNext && guild.level < 50) {
      guild.exp -= guild.expToNext;
      guild.level++;
      guild.expToNext = Math.floor(guild.expToNext * 1.5);
      guild.maxMembers = Math.min(guild.maxMembers + 5, 100); // 최대 100명
    }

    // 저장
    this.guilds.set(guildId, guild);
    if (this.redis) {
      await this.redis.hset('guilds', guildId, JSON.stringify(guild));
    }

    return guild;
  }

  /**
   * 길드 골드 추가/감소
   * @param {string} guildId - 길드 ID
   * @param {number} amount - 금액 (양수면 추가, 음수면 감소)
   * @returns {Promise<Object>} 업데이트된 길드 정보
   */
  async addGuildGold(guildId, amount) {
    const guild = this.getGuild(guildId);
    if (!guild) return null;

    const newGold = guild.gold + amount;
    if (newGold < 0) return null;

    guild.gold = newGold;

    // 저장
    this.guilds.set(guildId, guild);
    if (this.redis) {
      await this.redis.hset('guilds', guildId, JSON.stringify(guild));
    }

    return guild;
  }

  /**
   * 역할 변경
   * @param {string} guildId - 길드 ID
   * @param {string} operatorId - 운영자 ID
   * @param {string} targetId - 타겟 ID
   * @param {string} newRoleId - 새 역할 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  async changeRole(guildId, operatorId, targetId, newRoleId) {
    const guild = this.getGuild(guildId);
    if (!guild) return false;

    // 권한 확인 (길드장만 가능)
    if (operatorId !== guild.masterId) return false;

    // 길드장 역할은 변경 불가
    if (targetId === guild.masterId) return false;

    // 멤버 찾기
    const member = guild.members.find(m => m.characterId === targetId);
    if (!member) return false;

    // 역할 변경
    member.roleId = newRoleId;

    // 저장
    this.guilds.set(guildId, guild);
    if (this.redis) {
      await this.redis.hset('guilds', guildId, JSON.stringify(guild));
    }

    return true;
  }

  /**
   * 길드 목록 조회
   * @param {number} page - 페이지 (1부터)
   * @param {number} limit - 한 페이지 당 수
   * @returns {Array<Object>} 길드 목록
   */
  getGuildList(page = 1, limit = 20) {
    const guilds = Array.from(this.guilds.values());
    const start = (page - 1) * limit;
    const end = start + limit;

    return guilds
      .sort((a, b) => b.level - a.level || b.exp - a.exp)
      .slice(start, end);
  }
}

module.exports = GuildManager;