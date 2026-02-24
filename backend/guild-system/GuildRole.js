/**
 * GuildRole - 길드 역할 권한 관리
 * 길드 내 역할 생성, 수정, 삭제 및 권한 설정
 */

export default class GuildRole {
  constructor(guildManager) {
    this.guildManager = guildManager;
  }

  /**
   * 새 역할 생성 (길드장만 가능)
   * @param {string} guildId - 길드 ID
   * @param {string} masterId - 길드장 ID
   * @param {string} name - 역할 이름
   * @param {Object} permissions - 권한 설정
   * @returns {Promise<Object|null>} 생성된 역할
   */
  async createRole(guildId, masterId, name, permissions = {}) {
    const guild = this.guildManager.getGuild(guildId);
    if (!guild) return null;
    if (guild.masterId !== masterId) return null;

    // 기본 역할은 생성 불가
    const existingRole = guild.roles.find(r => r.roleId === 'master' || r.roleId === 'officer' || r.roleId === 'member' || r.roleId === 'trainee');
    if (existingRole && guild.roles.find(r => r.roleId === name.toLowerCase())) return null;

    const newRole = {
      roleId: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      permissions: {
        canKick: permissions.canKick || false,
        canInvite: permissions.canInvite || false,
        canDisband: permissions.canDisband || false,
        canManageRoles: permissions.canManageRoles || false,
        canManageWars: permissions.canManageWars || false,
        canManageRaids: permissions.canManageRaids || false
      },
      createdAt: Date.now()
    };

    guild.roles.push(newRole);

    // 저장
    this.guildManager.guilds.set(guildId, guild);
    if (this.guildManager.redis) {
      await this.guildManager.redis.hset('guilds', guildId, JSON.stringify(guild));
    }

    return newRole;
  }

  /**
   * 역할 권한 수정
   * @param {string} guildId - 길드 ID
   * @param {string} masterId - 길드장 ID
   * @param {string} roleId - 역할 ID
   * @param {Object} permissions - 새 권한 설정
   * @returns {Promise<Object|null>} 업데이트된 역할
   */
  async updateRolePermissions(guildId, masterId, roleId, permissions) {
    const guild = this.guildManager.getGuild(guildId);
    if (!guild) return null;
    if (guild.masterId !== masterId) return null;

    // 기본 역할은 권한 수정 불가
    if (['master', 'officer', 'member', 'trainee'].includes(roleId)) return null;

    const role = guild.roles.find(r => r.roleId === roleId);
    if (!role) return null;

    // 권한 업데이트
    Object.keys(permissions).forEach(key => {
      if (role.permissions.hasOwnProperty(key)) {
        role.permissions[key] = permissions[key];
      }
    });

    // 길드 해체 권한은 길드장만 가짐
    role.permissions.canDisband = false;

    // 저장
    this.guildManager.guilds.set(guildId, guild);
    if (this.guildManager.redis) {
      await this.guildManager.redis.hset('guilds', guildId, JSON.stringify(guild));
    }

    return role;
  }

  /**
   * 역할 삭제
   * @param {string} guildId - 길드 ID
   * @param {string} masterId - 길드장 ID
   * @param {string} roleId - 역할 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  async deleteRole(guildId, masterId, roleId) {
    const guild = this.guildManager.getGuild(guildId);
    if (!guild) return false;
    if (guild.masterId !== masterId) return false;

    // 기본 역할은 삭제 불가
    if (['master', 'officer', 'member', 'trainee'].includes(roleId)) return false;

    // 해당 역할을 가진 멤버가 있는지 확인
    const hasMembers = guild.members.some(m => m.roleId === roleId);
    if (hasMembers) return false;

    const index = guild.roles.findIndex(r => r.roleId === roleId);
    if (index === -1) return false;

    guild.roles.splice(index, 1);

    // 저장
    this.guildManager.guilds.set(guildId, guild);
    if (this.guildManager.redis) {
      await this.guildManager.redis.hset('guilds', guildId, JSON.stringify(guild));
    }

    return true;
  }

  /**
   * 길드 역할 목록 조회
   * @param {string} guildId - 길드 ID
   * @returns {Array<Object>} 역할 목록
   */
  getGuildRoles(guildId) {
    const guild = this.guildManager.getGuild(guildId);
    if (!guild) return [];

    return guild.roles;
  }
}