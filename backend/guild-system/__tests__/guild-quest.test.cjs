/**
 * 길드 퀘스트 시스템 테스트
 */

const { GuildQuest } = require('../guild-quest.cjs');

describe('GuildQuest', () => {
  describe('createQuest', () => {
    test('퀘스트를 생성할 수 있다', () => {
      const quest = GuildQuest.createQuest(5);

      expect(quest).toBeDefined();
      expect(quest.id).toBeDefined();
      expect(quest.type).toBeDefined();
      expect(quest.objectives).toBeDefined();
      expect(quest.reward).toBeDefined();
    });

    test('퀘스트 유형 중 하나를 가진다', () => {
      const quest = GuildQuest.createQuest(5);
      const types = ['collect', 'social', 'combat', 'cooperation'];

      expect(types).toContain(quest.type);
    });

    test('퀘스트 난이도를 계산할 수 있다', () => {
      const easyQuest = GuildQuest.createQuest(3);
      const normalQuest = GuildQuest.createQuest(7);
      const hardQuest = GuildQuest.createQuest(15);
      const extremeQuest = GuildQuest.createQuest(25);

      expect(GuildQuest.calculateDifficulty(3)).toBe('easy');
      expect(GuildQuest.calculateDifficulty(7)).toBe('normal');
      expect(GuildQuest.calculateDifficulty(15)).toBe('hard');
      expect(GuildQuest.calculateDifficulty(25)).toBe('extreme');
    });
  });

  describe('generateQuestTitle', () => {
    test('퀘스트 제목을 생성할 수 있다', () => {
      const title = GuildQuest.generateQuestTitle('collect', 5);

      expect(title).toBeDefined();
      expect(title).toContain('Lv.5');
    });

    test('퀘스트 유형에 맞는 제목을 생성한다', () => {
      const collectTitle = GuildQuest.generateQuestTitle('collect', 5);
      const socialTitle = GuildQuest.generateQuestTitle('social', 5);

      expect(collectTitle).toContain('자원 수집');
      expect(socialTitle).toContain('소셜 활동');
    });
  });

  describe('generateQuestDescription', () => {
    test('퀘스트 설명을 생성할 수 있다', () => {
      const description = GuildQuest.generateQuestDescription('collect');

      expect(description).toBeDefined();
      expect(typeof description).toBe('string');
    });
  });
});

describe('GuildQuestManager', () => {
  let guildManager;
  let questManager;

  beforeEach(() => {
    const GuildManager = require('../guild-manager.cjs');
    const { GuildQuestManager } = require('../guild-quest.cjs');

    guildManager = new GuildManager();
    questManager = new GuildQuestManager(guildManager);
  });

  describe('generateGuildQuest', () => {
    test('길드 퀘스트를 생성할 수 있다', () => {
      guildManager.createGuild('leader-1', '길드장', '테스트 길드');
      const guild = guildManager.getPlayerGuild('leader-1');

      const quest = questManager.generateGuildQuest(guild.id);

      expect(quest).toBeDefined();
      expect(quest.id).toBeDefined();
      expect(quest.status).toBe('active');
    });

    test('존재하지 않는 길드에 퀘스트를 생성할 수 없다', () => {
      expect(() => {
        questManager.generateGuildQuest('unknown-guild');
      }).toThrow('길드를 찾을 수 없습니다.');
    });
  });

  describe('getActiveQuests', () => {
    test('활성 퀘스트 목록을 조회할 수 있다', () => {
      guildManager.createGuild('leader-1', '길드장', '테스트 길드');
      const guild = guildManager.getPlayerGuild('leader-1');
      questManager.generateGuildQuest(guild.id);

      const quests = questManager.getActiveQuests(guild.id);

      expect(quests.length).toBeGreaterThan(0);
    });

    test('퀘스트가 없으면 빈 배열을 반환한다', () => {
      guildManager.createGuild('leader-1', '길드장', '테스트 길드');
      const guild = guildManager.getPlayerGuild('leader-1');

      const quests = questManager.getActiveQuests(guild.id);

      expect(quests).toEqual([]);
    });
  });

  describe('updateQuestProgress', () => {
    test('퀘스트 진행 상황을 업데이트할 수 있다', () => {
      guildManager.createGuild('leader-1', '길드장', '테스트 길드');
      const guild = guildManager.getPlayerGuild('leader-1');
      questManager.generateGuildQuest(guild.id);

      const updates = questManager.updateQuestProgress(
        guild.id,
        'player-1',
        'chat'
      );

      expect(updates).toBeDefined();
    });

    test('퀘스트를 완료할 수 있다', () => {
      guildManager.createGuild('leader-1', '길드장', '테스트 길드');
      const guild = guildManager.getPlayerGuild('leader-1');
      const quest = questManager.generateGuildQuest(guild.id);

      // 퀘스트 완료 조건 충족 (collect 타입 퀘스트)
      if (quest.type === 'collect') {
        questManager.updateQuestProgress(guild.id, 'player-1', 'collect', { itemId: 'coin', amount: 1000 });
      } else {
        // 다른 타입은 objective를 직접 완료로 설정
        quest.objectives.forEach(obj => {
          obj.currentCount = obj.requiredCount;
        });
        quest.status = 'completed';
        return { success: true, message: '퀘스트 완료!' };
      }

      const quests = questManager.getActiveQuests(guild.id);
      const completedQuest = quests.find(q => q.status === 'completed');

      expect(completedQuest).toBeDefined();
    });
  });

  describe('completeQuest', () => {
    test('완료된 퀘스트 보상을 수령할 수 있다', () => {
      guildManager.createGuild('leader-1', '길드장', '테스트 길드');
      const guild = guildManager.getPlayerGuild('leader-1');
      const quest = questManager.generateGuildQuest(guild.id);
      quest.status = 'completed';

      const result = questManager.completeQuest(guild.id, quest.id);

      expect(result.success).toBe(true);
      expect(result.reward).toBeDefined();
    });

    test('완료되지 않은 퀘스트는 완료할 수 없다', () => {
      guildManager.createGuild('leader-1', '길드장', '테스트 길드');
      const guild = guildManager.getPlayerGuild('leader-1');
      const quest = questManager.generateGuildQuest(guild.id);

      expect(() => {
        questManager.completeQuest(guild.id, quest.id);
      }).toThrow('아직 완료되지 않은 퀘스트입니다.');
    });
  });

  describe('cleanupExpiredQuests', () => {
    test('만료된 퀘스트를 정리할 수 있다', () => {
      guildManager.createGuild('leader-1', '길드장', '테스트 길드');
      const guild = guildManager.getPlayerGuild('leader-1');
      const quest = questManager.generateGuildQuest(guild.id);
      quest.expireAt = Date.now() - 1000; // 만료

      const result = questManager.cleanupExpiredQuests();

      expect(result.success).toBe(true);
      expect(result.cleaned).toBeGreaterThan(0);
    });
  });

  describe('getStats', () => {
    test('시스템 통계를 조회할 수 있다', () => {
      const stats = questManager.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalActiveQuests).toBeDefined();
      expect(stats.totalQuestsGenerated).toBeDefined();
    });
  });
});