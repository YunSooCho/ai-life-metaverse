/**
 * 길드 시스템 통합 테스트
 * 길드 매니저, 길드 퀘스트 시스템 통합 테스트
 */

const { GuildSystem } = require('../index.cjs');

describe('GuildSystem', () => {
  let guildSystem;

  beforeEach(() => {
    guildSystem = new GuildSystem().initialize();
  });

  describe('길드 생성 및 관리', () => {
    test('길드 시스템을 초기화할 수 있다', () => {
      expect(guildSystem).toBeDefined();
      expect(guildSystem.initialized).toBe(true);
    });

    test('길드를 생성할 수 있다', () => {
      const guild = guildSystem.createGuild('leader-1', '길드장', '테스트 길드', '🏰');

      expect(guild).toBeDefined();
      expect(guild.name).toBe('테스트 길드');
    });

    test('길드 목록을 조회할 수 있다', () => {
      const guild1 = guildSystem.createGuild(`guild-${Date.now()}-1`, '길드장1', '테스트 길드1');
      const guild2 = guildSystem.createGuild(`guild-${Date.now()}-2`, '길드장2', '테스트 길드2');

      const stats = guildSystem.getSystemStats();

      expect(stats.guilds.totalGuilds).toBeGreaterThanOrEqual(2);
    });
  });

  describe('길드 멤버 관리', () => {
    test('플레이어가 길드에 가입할 수 있다', () => {
      const guild = guildSystem.createGuild('leader-1', '길드장', '테스트 길드');

      guildSystem.requestJoin(guild.id, 'player-1', '플레이어1');
      guildSystem.requestJoin(guild.id, 'player-2', '플레이어2');

      const guildInfo = guildSystem.getGuildInfo(guild.id);

      expect(guildInfo.members.length).toBe(3);
    });

    test('플레이어가 길드에서 탈퇴할 수 있다', () => {
      const guild = guildSystem.createGuild('leader-1', '길드장', '테스트 길드');
      guildSystem.requestJoin(guild.id, 'player-1', '플레이어1');

      guildSystem.leaveGuild('player-1');

      const guildInfo = guildSystem.getGuildInfo(guild.id);

      expect(guildInfo.members.length).toBe(1);
    });

    test('길드장이 멤버를 추방할 수 있다', () => {
      const guild = guildSystem.createGuild('leader-1', '길드장', '테스트 길드');
      guildSystem.requestJoin(guild.id, 'player-1', '플레이어1');

      guildSystem.kickMember(guild.id, 'leader-1', 'player-1');

      const guildInfo = guildSystem.getGuildInfo(guild.id);

      expect(guildInfo.members.length).toBe(1);
    });

    test('길드장을 위임할 수 있다', () => {
      const guild = guildSystem.createGuild('leader-1', '길드장', '테스트 길드');
      guildSystem.requestJoin(guild.id, 'player-1', '플레이어1');

      guildSystem.transferLeadership(guild.id, 'leader-1', 'player-1');

      const guildInfo = guildSystem.getGuildInfo(guild.id);

      expect(guildInfo.leaderId).toBe('player-1');
    });
  });

  describe('길드 채팅', () => {
    test('길드 채팅을 할 수 있다', () => {
      const guild = guildSystem.createGuild('leader-1', '길드장', '테스트 길드');
      guildSystem.requestJoin(guild.id, 'player-1', '플레이어1');

      const msg1 = guildSystem.sendMessage(guild.id, 'leader-1', '길드장', '안녕하세요!');
      const msg2 = guildSystem.sendMessage(guild.id, 'player-1', '플레이어1', '반갑습니다!');

      expect(msg1).toBeDefined();
      expect(msg2).toBeDefined();

      const history = guildSystem.getChatHistory(guild.id);

      expect(history.length).toBe(2);
      expect(history[0].message).toBe('안녕하세요!');
    });
  });

  describe('길드 퀘스트', () => {
    test('길드 퀘스트를 생성할 수 있다', () => {
      const guild = guildSystem.createGuild('leader-1', '길드장', '테스트 길드');

      const quest = guildSystem.generateGuildQuest(guild.id);

      expect(quest).toBeDefined();
      expect(quest.status).toBe('active');
    });

    test('활성 퀘스트 목록을 조회할 수 있다', () => {
      const guild = guildSystem.createGuild('leader-1', '길드장', '테스트 길드');

      guildSystem.generateGuildQuest(guild.id);
      guildSystem.generateGuildQuest(guild.id);

      const quests = guildSystem.getActiveQuests(guild.id);

      expect(quests.length).toBe(2);
    });

    test('퀘스트 진행 상황을 업데이트할 수 있다', () => {
      const guild = guildSystem.createGuild('leader-1', '길드장', '테스트 길드');
      guildSystem.generateGuildQuest(guild.id);

      const updates = guildSystem.updateQuestProgress(
        guild.id,
        'player-1',
        'chat'
      );

      expect(updates).toBeDefined();
    });
  });

  describe('길드 레벨업', () => {
    test('길드 경험치를 추가할 수 있다', () => {
      const guild = guildSystem.createGuild('leader-1', '길드장', '테스트 길드');
      guildSystem.generateGuildQuest(guild.id);
      const quest = guildSystem.getActiveQuests(guild.id)[0];
      quest.status = 'completed';

      guildSystem.completeQuest(guild.id, quest.id);

      const guildInfo = guildSystem.getGuildInfo(guild.id);

      expect(guildInfo.exp).toBeGreaterThan(0);
    });

    test('경험치가 충분하면 레벨업한다', () => {
      const guild = guildSystem.createGuild('leader-1', '길드장', '테스트 길드');
      guildSystem.generateGuildQuest(guild.id);
      const quest = guildSystem.getActiveQuests(guild.id)[0];
      quest.status = 'completed';

      // 경험치 충분히 추가 (퀘스트 보상으로 부족하므로 직접 추가)
      guildSystem.guildManager.addExp(guild.id, 2000);

      const guildInfo = guildSystem.getGuildInfo(guild.id);

      expect(guildInfo.level).toBeGreaterThan(1);
    });
  });

  describe('길드 해체', () => {
    test('길드를 해체할 수 있다', () => {
      const guild = guildSystem.createGuild('leader-1', '길드장', '테스트 길드');
      guildSystem.requestJoin(guild.id, 'player-1', '플레이어1');

      guildSystem.disbandGuild(guild.id, 'leader-1');

      expect(() => {
        guildSystem.getGuildInfo(guild.id);
      }).toThrow('길드를 찾을 수 없습니다.');
    });
  });

  describe('시스템 통계', () => {
    test('시스템 통계를 조회할 수 있다', () => {
      guildSystem.createGuild('leader-1', '길드장1', '테스트 길드1');
      const guild1 = guildSystem.getPlayerGuild('leader-1');
      guildSystem.generateGuildQuest(guild1.id);

      guildSystem.createGuild('leader-2', '길드장2', '테스트 길드2');
      const guild2 = guildSystem.getPlayerGuild('leader-2');
      guildSystem.generateGuildQuest(guild2.id);

      const stats = guildSystem.getSystemStats();

      expect(stats.guilds.totalGuilds).toBeGreaterThanOrEqual(1);
      expect(stats.guilds.totalMembers).toBeGreaterThanOrEqual(1);
      expect(stats.quests.totalActiveQuests).toBeGreaterThanOrEqual(1);
    });
  });

  describe('유틸리티', () => {
    test('플레이어가 길드에 있는지 확인할 수 있다', () => {
      guildSystem.createGuild('leader-1', '길드장', '테스트 길드');

      expect(guildSystem.isPlayerInGuild('leader-1')).toBe(true);
      expect(guildSystem.isPlayerInGuild('unknown-player')).toBe(false);
    });

    test('길드 문장을 조회할 수 있다', () => {
      const guild = guildSystem.createGuild('leader-1', '길드장', '테스트 길드', '⚔️');

      const emblem = guildSystem.getGuildEmblem(guild.id);

      expect(emblem).toBe('⚔️');
    });

    test('길드 이름을 조회할 수 있다', () => {
      const guild = guildSystem.createGuild('leader-1', '길드장', '테스트 길드');

      const name = guildSystem.getGuildName(guild.id);

      expect(name).toBe('테스트 길드');
    });
  });
});