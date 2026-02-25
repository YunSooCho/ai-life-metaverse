/**
 * Raid System Tests
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import RaidManager from '../RaidManager.js';
import RaidBoss from '../RaidBoss.js';
import RaidParty from '../RaidParty.js';
import RaidCombat from '../RaidCombat.js';
import RaidReward from '../RaidReward.js';
import RaidSchedule from '../RaidSchedule.js';

// Mock Redis client
const createMockRedis = () => ({
  hset: vi.fn().mockResolvedValue(true),
  hget: vi.fn(),
  hdel: vi.fn().mockResolvedValue(true),
  sadd: vi.fn().mockResolvedValue(true),
  srem: vi.fn().mockResolvedValue(true),
  del: vi.fn().mockResolvedValue(true),
  get: vi.fn(),
  set: vi.fn().mockResolvedValue(true)
});

// Mock GuildManager
const createMockGuildManager = () => {
  const mockGuild = {
    guildId: 'test-guild-1',
    name: 'Test Guild',
    masterId: 'char-1',
    level: 1,
    exp: 0,
    gold: 0,
    members: [
      { characterId: 'char-1', roleId: 'master', contribution: 0 },
      { characterId: 'char-2', roleId: 'member', contribution: 0 }
    ],
    roles: [
      { roleId: 'master', permissions: { canManageRaids: true } },
      { roleId: 'member', permissions: { canManageRaids: false } }
    ]
  };

  const guilds = new Map();
  guilds.set('test-guild-1', mockGuild);

  return {
    guilds,
    getGuild: vi.fn().mockReturnValue(mockGuild),
    getGuildByCharacter: vi.fn().mockReturnValue(mockGuild),
    addGuildExp: vi.fn().mockResolvedValue(true),
    addGuildGold: vi.fn().mockResolvedValue(true)
  };
};

describe('RaidSystem', () => {
  let raidManager, raidBoss, raidParty, raidCombat, raidReward, raidSchedule;
  let mockRedis;
  let mockGuildManager;

  beforeEach(() => {
    // Mock Redis client
    mockRedis = createMockRedis();

    // Mock GuildManager
    mockGuildManager = createMockGuildManager();

    // Initialize modules
    raidManager = new RaidManager(mockRedis, mockGuildManager);
    raidBoss = new RaidBoss({
      bossId: 'boss-1',
      name: 'Test Boss',
      maxHp: 1000000,
      level: 100,
      type: 'normal'
    });
    raidParty = new RaidParty(raidManager);
    raidCombat = new RaidCombat(raidManager, raidBoss);
    raidReward = new RaidReward(raidManager, mockGuildManager);
    raidSchedule = new RaidSchedule(raidManager);
  });

  describe('RaidManager', () => {
    test('should create a raid', async () => {
      const raid = await raidManager.createRaid({
        guildId: 'test-guild-1',
        name: 'Test Raid',
        bossConfig: raidBoss,
        maxParticipants: 10
      });

      expect(raid).toBeDefined();
      expect(raid.name).toBe('Test Raid');
      expect(raid.status).toBe('waiting');
      expect(raid.guildId).toBe('test-guild-1');
    });

    test('should join a raid', async () => {
      const raid = await raidManager.createRaid({
        guildId: 'test-guild-1',
        name: 'Test Raid',
        bossConfig: raidBoss
      });

      const result = await raidManager.joinRaid(
        raid.raidId,
        'char-1',
        { name: 'Player1', level: 100, class: 'warrior' }
      );

      expect(result.error).toBeUndefined();
      expect(result.participants).toHaveLength(1);
      expect(result.participants[0].characterId).toBe('char-1');
    });

    test('should not exceed max participants', async () => {
      const raid = await raidManager.createRaid({
        guildId: 'test-guild-1',
        name: 'Test Raid',
        bossConfig: raidBoss,
        maxParticipants: 2
      });

      await raidManager.joinRaid(raid.raidId, 'char-1', { name: 'Player1', level: 100 });
      await raidManager.joinRaid(raid.raidId, 'char-2', { name: 'Player2', level: 100 });

      const result = await raidManager.joinRaid(raid.raidId, 'char-3', { name: 'Player3', level: 100 });
      expect(result.error).toBe('full');
    });

    test('should start a raid', async () => {
      const raid = await raidManager.createRaid({
        guildId: 'test-guild-1',
        name: 'Test Raid',
        bossConfig: raidBoss
      });

      await raidManager.joinRaid(raid.raidId, 'char-1', { name: 'Player1', level: 100 });

      const result = await raidManager.startRaid(raid.raidId, 'char-1');
      expect(result.status).toBe('in_progress');
      expect(result.startTime).toBeDefined();
    });

    test('should complete a raid', async () => {
      const raid = await raidManager.createRaid({
        guildId: 'test-guild-1',
        name: 'Test Raid',
        bossConfig: raidBoss
      });

      await raidManager.startRaid(raid.raidId, 'char-1');
      const result = await raidManager.completeRaid(raid.raidId, true);

      expect(result.status).toBe('completed');
      expect(result.endTime).toBeDefined();
    });
  });

  describe('RaidBoss', () => {
    test('should initialize boss', () => {
      expect(raidBoss.name).toBe('Test Boss');
      expect(raidBoss.maxHp).toBe(1000000);
      expect(raidBoss.currentHp).toBe(1000000);
      expect(raidBoss.currentPhase).toBe(1);
    });

    test('should take damage', () => {
      const result = raidBoss.takeDamage(10000);
      expect(result.damage).toBe(10000);
      expect(result.isDead).toBe(false);
      expect(result.hpPercent).toBeLessThan(1);
    });

    test('should die when HP reaches 0', () => {
      raidBoss.takeDamage(1000000);
      const result = raidBoss.takeDamage(1);

      expect(result.isDead).toBe(true);
      expect(result.currentHp).toBe(0);
    });

    test('should transition phases', () => {
      raidBoss.takeDamage(600000); // 40% HP
      const result = raidBoss.checkPhaseTransition();

      expect(result).toBeGreaterThan(1);
    });

    test('should enrage at low HP', () => {
      // 새로운 raidBoss 인스턴스 생성 (상태 확실히 초기화)
      const testBoss = new RaidBoss({
        bossId: 'boss-1',
        name: 'Test Boss',
        maxHp: 1000000,
        level: 100,
        type: 'normal'
      });

      // 900001 데미지로 한 번에 광폭화 트리거 (HP: 99999)
      const result = testBoss.takeDamage(900001);

      expect(result.enrageTriggered).toBe(true);
      expect(testBoss.isEnraged).toBe(true);
    });

    test('should get status', () => {
      const status = raidBoss.getStatus();

      expect(status.bossId).toBe('boss-1');
      expect(status.name).toBe('Test Boss');
      expect(status.currentHp).toBeDefined();
      expect(status.level).toBe(100);
    });
  });

  describe('RaidParty', () => {
    test('should assign roles', () => {
      const participants = [
        { characterId: 'char-1', name: 'Player1', level: 100, class: 'warrior' },
        { characterId: 'char-2', name: 'Player2', level: 100, class: 'priest' },
        { characterId: 'char-3', name: 'Player3', level: 100, class: 'mage' },
        { characterId: 'char-4', name: 'Player4', level: 100, class: 'bard' }
      ];

      const result = raidParty.assignRoles(participants);

      expect(result.roles.tank).toHaveLength(1);
      expect(result.roles.healer).toHaveLength(1);
      expect(result.roles.dps).toHaveLength(1);
      expect(result.roles.support).toHaveLength(1);
    });

    test('should determine role from class', () => {
      const participant = { class: 'warrior' };
      expect(raidParty.determineRole(participant)).toBe('tank');

      participant.class = 'priest';
      expect(raidParty.determineRole(participant)).toBe('healer');

      participant.class = 'mage';
      expect(raidParty.determineRole(participant)).toBe('dps');
    });

    test('should calculate party DPS', async () => {
      const raid = await raidManager.createRaid({
        guildId: 'test-guild-1',
        name: 'Test Raid',
        bossConfig: raidBoss
      });

      await raidManager.joinRaid(raid.raidId, 'char-1', { name: 'Player1', level: 100 });
      raid.participants[0].damage = 100000;

      raid.startTime = Date.now() - 100000; // 100초 전 시작
      raid.endTime = Date.now();

      const dps = raidParty.calculatePartyDPS(raid.raidId);
      expect(dps.totalDamage).toBe(100000);
      expect(dps.dps).toBeCloseTo(1000, 0);
    });

    test('should validate party balance', () => {
      const participants = [
        { characterId: 'char-1', class: 'warrior' },
        { characterId: 'char-2', class: 'warrior' }
      ];

      const roles = raidParty.assignRoles(participants);
      expect(roles.isBalanced).toBe(false);
      expect(roles.missingRoles.length).toBeGreaterThan(0);
    });
  });

  describe('RaidCombat', () => {
    test('should start combat', async () => {
      const raid = await raidManager.createRaid({
        guildId: 'test-guild-1',
        name: 'Test Raid',
        bossConfig: raidBoss
      });

      await raidManager.joinRaid(raid.raidId, 'char-1', { name: 'Player1', level: 100 });

      const result = raidCombat.startCombat(raid.raidId);
      expect(result.combatLog[0].type).toBe('combat_start');
    });

    test('should process player attack', async () => {
      const raid = await raidManager.createRaid({
        guildId: 'test-guild-1',
        name: 'Test Raid',
        bossConfig: raidBoss
      });

      await raidManager.joinRaid(raid.raidId, 'char-1', { name: 'Player1', level: 100 });
      raid.status = 'in_progress';

      const result = raidCombat.processAttack(raid.raidId, 'char-1', 5000, {});
      expect(result.damage).toBe(5000);
      expect(result.combatLog.length).toBe(1);
    });

    test('should end combat with victory', async () => {
      const raid = await raidManager.createRaid({
        guildId: 'test-guild-1',
        name: 'Test Raid',
        bossConfig: raidBoss
      });

      raid.status = 'in_progress';

      const result = raidCombat.endCombat(raid.raidId, true);
      expect(result.victory).toBe(true);
      expect(result.combatLog[0].type).toBe('combat_end');
    });
  });

  describe('RaidReward', () => {
    test('should calculate rewards', async () => {
      const raid = await raidManager.createRaid({
        guildId: 'test-guild-1',
        name: 'Test Raid',
        bossConfig: { level: 100, type: 'normal' }
      });

      await raidManager.joinRaid(raid.raidId, 'char-1', { name: 'Player1', level: 100 });
      raid.participants[0].damage = 50000;
      raid.status = 'completed';

      const rewards = raidReward.calculateRewards(raid.raidId);
      expect(rewards.baseRewards).toBeDefined();
      expect(rewards.individualRewards.length).toBe(1);
      expect(rewards.individualRewards[0].xp).toBeGreaterThan(0);
    });

    test('should distribute rewards', async () => {
      const raid = await raidManager.createRaid({
        guildId: 'test-guild-1',
        name: 'Test Raid',
        bossConfig: { level: 100, type: 'normal' }
      });

      await raidManager.joinRaid(raid.raidId, 'char-1', { name: 'Player1', level: 100 });
      raid.status = 'completed';

      const result = await raidReward.distributeRewards(raid.raidId);
      expect(result.distributed).toBe(true);
      expect(result.rewards).toBeDefined();
    });

    test('should generate boss-level specific items', () => {
      const items = raidReward.generateRewardItems(100, { type: 'elite' });
      expect(items.length).toBeGreaterThan(0);
      expect(items.some(i => i.rarity === 'rare')).toBe(true);
    });
  });

  describe('RaidSchedule', () => {
    test('should create schedule', async () => {
      const schedule = await raidSchedule.createSchedule({
        guildId: 'test-guild-1',
        name: 'Scheduled Raid',
        bossConfig: raidBoss,
        scheduledTime: Date.now() + 3600000 // 1 hour later
      });

      expect(schedule).toBeDefined();
      expect(schedule.name).toBe('Scheduled Raid');
      expect(schedule.status).toBe('upcoming');
    });

    test('should join schedule', async () => {
      const schedule = await raidSchedule.createSchedule({
        guildId: 'test-guild-1',
        name: 'Scheduled Raid',
        bossConfig: raidBoss,
        scheduledTime: Date.now() + 3600000
      });

      const result = await raidSchedule.joinSchedule(
        schedule.scheduleId,
        'char-1',
        { name: 'Player1', level: 100, class: 'warrior' }
      );

      expect(result.error).toBeUndefined();
      expect(result.participants.length).toBe(1);
    });

    test('should get upcoming schedules', async () => {
      await raidSchedule.createSchedule({
        guildId: 'test-guild-1',
        name: 'Future Raid',
        bossConfig: raidBoss,
        scheduledTime: Date.now() + 3600000
      });

      const schedules = raidSchedule.getUpcomingSchedules();
      expect(schedules.length).toBeGreaterThan(0);
    });
  });
});