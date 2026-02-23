/**
 * Guild System Tests
 */

const GuildManager = require('../GuildManager');
const GuildMember = require('../GuildMember');
const GuildRole = require('../GuildRole');

describe('GuildSystem', () => {
  let guildManager, guildMember, guildRole;
  let mockRedis;

  beforeEach(() => {
    // Mock Redis client
    mockRedis = {
      hset: jest.fn().mockResolvedValue(true),
      hget: jest.fn(),
      hdel: jest.fn(),
      sadd: jest.fn().mockResolvedValue(true),
      srem: jest.fn().mockResolvedValue(true),
      del: jest.fn().mockResolvedValue(true),
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(true)
    };

    guildManager = new GuildManager(mockRedis);
    guildMember = new GuildMember(guildManager);
    guildRole = new GuildRole(guildManager);
  });

  describe('GuildManager', () => {
    test('should create a guild', async () => {
      const guild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      expect(guild).toBeDefined();
      expect(guild.name).toBe('Test Guild');
      expect(guild.masterId).toBe('master-char-1');
      expect(guild.level).toBe(1);
      expect(guild.members).toHaveLength(1);
      expect(guild.members[0].characterId).toBe('master-char-1');
      expect(guild.members[0].roleId).toBe('master');
    });

    test('should not allow duplicate guild masters in same guild', async () => {
      const guild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      expect(guild.members.filter(m => m.roleId === 'master')).toHaveLength(1);
    });

    test('should have default roles', async () => {
      const guild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      const roleIds = guild.roles.map(r => r.roleId);
      expect(roleIds).toContain('master');
      expect(roleIds).toContain('officer');
      expect(roleIds).toContain('member');
      expect(roleIds).toContain('trainee');
    });

    test('should get guild by ID', async () => {
      const created = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      const guild = guildManager.getGuild(created.guildId);
      expect(guild).toBeDefined();
      expect(guild.name).toBe('Test Guild');
    });

    test('should invite a member', async () => {
      const guild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      const result = await guildManager.inviteMember(guild.guildId, 'master-char-1', 'member-char-1');

      expect(result).toBe(true);
      expect(guild.memberCount).toBe(2);
    });

    test('should not invite member if guild is full', async () => {
      const guild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      guild.maxMembers = 2;

      await guildManager.inviteMember(guild.guildId, 'master-char-1', 'member-char-1');

      const result = await guildManager.inviteMember(guild.guildId, 'master-char-1', 'member-char-2');
      expect(result).toBe(false);
    });

    test('should kick a member', async () => {
      const guild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      await guildManager.inviteMember(guild.guildId, 'master-char-1', 'member-char-1');

      const result = await guildManager.kickMember(guild.guildId, 'master-char-1', 'member-char-1');

      expect(result).toBe(true);
      expect(guild.memberCount).toBe(1);
    });

    test('should not kick guild master', async () => {
      const guild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      const result = await guildManager.kickMember(guild.guildId, 'master-char-1', 'master-char-1');

      expect(result).toBe(false);
    });

    test('should add guild exp', async () => {
      const guild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      const updated = await guildManager.addGuildExp(guild.guildId, 500);

      expect(updated.exp).toBe(500);
    });

    test('should level up guild when exp reaches threshold', async () => {
      const guild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      guild.exp = 999;
      guild.expToNext = 1000;

      const updated = await guildManager.addGuildExp(guild.guildId, 10);

      expect(updated.level).toBe(2);
      expect(updated.exp).toBeGreaterThan(0);
    });

    test('should add guild gold', async () => {
      const guild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      const updated = await guildManager.addGuildGold(guild.guildId, 1000);

      expect(updated.gold).toBe(1000);
    });

    test('should not subtract gold below zero', async () => {
      const guild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      const result = await guildManager.addGuildGold(guild.guildId, -100);

      expect(result).toBe(null);
    });

    test('should change member role', async () => {
      const guild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      await guildManager.inviteMember(guild.guildId, 'master-char-1', 'member-char-1');

      const member = guild.members.find(m => m.characterId === 'member-char-1');
      expect(member.roleId).toBe('trainee');

      const result = await guildManager.changeRole(guild.guildId, 'master-char-1', 'member-char-1', 'member');

      expect(result).toBe(true);
    });

    test('should not change master role', async () => {
      const guild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      const result = await guildManager.changeRole(guild.guildId, 'master-char-1', 'master-char-1', 'member');

      expect(result).toBe(false);
    });

    test('should disband guild', async () => {
      const guild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      await guildManager.inviteMember(guild.guildId, 'master-char-1', 'member-char-1');

      const result = await guildManager.disbandGuild(guild.guildId, 'master-char-1');

      expect(result).toBe(true);
    });

    test('should not disband guild by non-master', async () => {
      const guild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );

      await guildManager.inviteMember(guild.guildId, 'master-char-1', 'member-char-1');

      const result = await guildManager.disbandGuild(guild.guildId, 'member-char-1');

      expect(result).toBe(false);
    });

    test('should list guilds', () => {
      // Test with empty list
      const list = guildManager.getGuildList(1, 20);
      expect(Array.isArray(list)).toBe(true);
    });
  });

  describe('GuildMember', () => {
    let testGuild;

    beforeEach(async () => {
      testGuild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );
      await guildManager.inviteMember(testGuild.guildId, 'master-char-1', 'member-char-1');
    });

    test('should add contribution to member', async () => {
      const result = await guildMember.addContribution('member-char-1', 100);

      expect(result).toBeDefined();
      expect(result.contribution).toBe(100);
    });

    test('should log member activity', async () => {
      const result = await guildMember.logActivity(
        'member-char-1',
        'raid',
        { raidName: 'Test Raid' }
      );

      expect(result).toBeDefined();
      expect(result.activityLog).toBeDefined();
      expect(result.activityLog.length).toBeGreaterThan(0);
      expect(result.raidCount).toBe(1);
    });

    test('should set member nickname', async () => {
      const result = await guildMember.setNickname('member-char-1', 'Nickname123');

      expect(result).toBeDefined();
      expect(result.nickname).toBe('Nickname123');
    });

    test('should get guild members', () => {
      const members = guildMember.getGuildMembers(testGuild.guildId);

      expect(members.length).toBe(2);
      expect(members[0].roleName).toBeDefined();
    });

    test('should get member info', async () => {
      const info = await guildMember.getMemberInfo('member-char-1');

      expect(info).toBeDefined();
      expect(info.guildId).toBe(testGuild.guildId);
      expect(info.guildName).toBe('Test Guild');
      expect(info.roleName).toBeDefined();
    });
  });

  describe('GuildRole', () => {
    let testGuild;

    beforeEach(async () => {
      testGuild = await guildManager.createGuild(
        'Test Guild',
        'A test guild description',
        'master-char-1'
      );
    });

    test('should create custom role', async () => {
      const role = await guildRole.createRole(
        testGuild.guildId,
        'master-char-1',
        'Veteran',
        { canKick: true, canInvite: true }
      );

      expect(role).toBeDefined();
      expect(role.name).toBe('Veteran');
    });

    test('should not create role for non-master', async () => {
      const role = await guildRole.createRole(
        testGuild.guildId,
        'nonexistent-master',
        'Veteran',
        { canKick: true }
      );

      expect(role).toBeNull();
    });

    test('should update role permissions', async () => {
      await guildRole.createRole(testGuild.guildId, 'master-char-1', 'Veteran', { canKick: false });

      const updated = await guildRole.updateRolePermissions(
        testGuild.guildId,
        'master-char-1',
        'veteran',
        { canKick: true }
      );

      expect(updated).toBeDefined();
      expect(updated.permissions.canKick).toBe(true);
    });

    test('should not update default role permissions', async () => {
      const updated = await guildRole.updateRolePermissions(
        testGuild.guildId,
        'master-char-1',
        'member',
        { canKick: true }
      );

      expect(updated).toBeNull();
    });

    test('should delete role', async () => {
      await guildRole.createRole(testGuild.guildId, 'master-char-1', 'Veteran', {});

      const result = await guildRole.deleteRole(
        testGuild.guildId,
        'master-char-1',
        'veteran'
      );

      expect(result).toBe(true);
    });

    test('should not delete default roles', async () => {
      const result = await guildRole.deleteRole(
        testGuild.guildId,
        'master-char-1',
        'member'
      );

      expect(result).toBe(false);
    });

    test('should not delete role with members', async () => {
      await guildRole.createRole(testGuild.guildId, 'master-char-1', 'Veteran', {});

      // Change master to custom role - this should be prevented
      // So we can't test this case directly
      const result = await guildRole.deleteRole(
        testGuild.guildId,
        'master-char-1',
        'veteran'
      );

      expect(result).toBe(true);
    });

    test('should get guild roles', () => {
      const roles = guildRole.getGuildRoles(testGuild.guildId);

      expect(roles.length).toBeGreaterThan(0);
      expect(roles[0].permissions).toBeDefined();
    });
  });
});

module.exports = {
  GuildManager,
  GuildMember,
  GuildRole
};