/**
 * PartyQuests 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PartyQuests } from '../PartyQuests.js';

describe('PartyQuests', () => {
  let partyQuests;
  let bossQuestDef;
  let cooperationQuestDef;

  beforeEach(() => {
    partyQuests = new PartyQuests();
    
    bossQuestDef = {
      id: 'boss_quest_1',
      type: 'boss',
      title: '파티 보스전',
      description: '강력한 보스 몬스터를 협동해서 처치하세요',
      targetKills: 1,
      level: 10,
      reward: {
        exp: 1000,
        coins: 500,
        items: ['boss_reward_1']
      },
      timeLimit: 30 * 60 * 1000
    };
    
    cooperationQuestDef = {
      id: 'coop_quest_1',
      type: 'cooperation',
      title: '협동 임무',
      description: '파티원과 함께 임무를 완수하세요',
      targetTasks: 5,
      level: 10,
      reward: {
        exp: 800,
        coins: 400,
        items: ['coop_reward_1']
      },
      timeLimit: 60 * 60 * 1000
    };

    // 퀘스트 정의 등록
    partyQuests.registerQuestDefinition('boss_quest_1', bossQuestDef);
    partyQuests.registerQuestDefinition('coop_quest_1', cooperationQuestDef);
  });

  describe('startQuest', () => {
    it('파티 퀘스트를 시작해야 함', () => {
      const result = partyQuests.startQuest('party_1', 'boss_quest_1');
      
      expect(result.success).toBe(true);
      expect(result.activeQuest).toBeDefined();
      expect(result.activeQuest.partyId).toBe('party_1');
      expect(result.activeQuest.questId).toBe('boss_quest_1');
    });

    it('퀘스트 정의가 없으면 실패해야 함', () => {
      const result = partyQuests.startQuest('party_1', 'quest_999');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('QUEST_NOT_FOUND');
    });

    it('이미 진행 중인 퀘스트는 다시 시작 불가', () => {
      partyQuests.startQuest('party_1', 'boss_quest_1');
      const result = partyQuests.startQuest('party_1', 'boss_quest_1');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('QUEST_ALREADY_ACTIVE');
    });

    it('활성 퀘스트에 ID가 있어야 함', () => {
      const result1 = partyQuests.startQuest('party_1', 'boss_quest_1');
      const result2 = partyQuests.startQuest('party_1', 'coop_quest_1');
      
      expect(result1.activeQuest.id).toBeDefined();
      expect(result2.activeQuest.id).toBeDefined();
      expect(result1.activeQuest.id).not.toBe(result2.activeQuest.id);
    });

    it('활성 퀘스트에 시작 시간이 있어야 함', () => {
      const before = Date.now();
      const result = partyQuests.startQuest('party_1', 'boss_quest_1');
      const after = Date.now();
      
      expect(result.activeQuest.startedAt).toBeGreaterThanOrEqual(before);
      expect(result.activeQuest.startedAt).toBeLessThanOrEqual(after);
    });
  });

  describe('updateQuestProgress', () => {
    let activeQuestId;

    beforeEach(() => {
      const result = partyQuests.startQuest('party_1', 'boss_quest_1');
      activeQuestId = result.activeQuest.id;
    });

    it('퀘스트 진행을 업데이트해야 함', () => {
      const result = partyQuests.updateQuestProgress('party_1', activeQuestId, 'player1', 'kill', 1);
      
      expect(result.success).toBe(true);
      expect(result.progress.kills).toBe(1);
    });

    it('다른 타입의 업데이트도 처리해야 함', () => {
      partyQuests.startQuest('party_1', 'coop_quest_1');
      const result = partyQuests.startQuest('party_1', 'coop_quest_1');
      
      const progressResult = partyQuests.updateQuestProgress('party_1', result.activeQuest.id, 'player1', 'task', 1);
      
      expect(progressResult.success).toBe(true);
      expect(progressResult.progress.tasksCompleted).toBe(1);
    });

    it('기여 멤버를 기록해야 함', () => {
      partyQuests.updateQuestProgress('party_1', activeQuestId, 'player1', 'kill', 1);
      partyQuests.updateQuestProgress('party_1', activeQuestId, 'player2', 'kill', 1);
      
      const result = partyQuests.updateQuestProgress('party_1', activeQuestId, 'player1', 'kill', 1);
      
      expect(result.progress.membersContributed).toContain('player1');
      expect(result.progress.membersContributed).toContain('player2');
    });

    it('활성 퀘스트가 없으면 실패해야 함', () => {
      const result = partyQuests.updateQuestProgress('party_999', activeQuestId, 'player1', 'kill', 1);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('NO_ACTIVE_QUESTS');
    });

    it('잘못된 타입은 실패해야 함', () => {
      const result = partyQuests.updateQuestProgress('party_1', activeQuestId, 'player1', 'invalid_type', 1);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_TYPE');
    });

    it('보스 퀘스트를 완료해야 함', () => {
      const result = partyQuests.updateQuestProgress('party_1', activeQuestId, 'player1', 'kill', 1);
      
      expect(result.completed).toBe(true);
      expect(result.activeQuest.completed).toBe(true);
    });

    it('완료된 퀘스트는 더 이상 업데이트 불가', () => {
      partyQuests.updateQuestProgress('party_1', activeQuestId, 'player1', 'kill', 1);
      const result = partyQuests.updateQuestProgress('party_1', activeQuestId, 'player1', 'kill', 1);
      
      expect(result.success).toBe(false);
    });
  });

  describe('getActiveQuests', () => {
    beforeEach(() => {
      partyQuests.startQuest('party_1', 'boss_quest_1');
      partyQuests.startQuest('party_1', 'coop_quest_1');
    });

    it('활성 퀘스트 목록을 조회해야 함', () => {
      const result = partyQuests.getActiveQuests('party_1');
      
      expect(result.success).toBe(true);
      expect(result.quests.length).toBe(2);
    });

    it('퀘스트 진행 상황을 포함해야 함', () => {
      const result = partyQuests.getActiveQuests('party_1');
      
      result.quests.forEach(quest => {
        expect(quest.progress).toBeDefined();
        expect(typeof quest.progress.kills).toBe('number');
      });
    });

    it('퀘스트가 없는 파티는 빈 배열을 반환해야 함', () => {
      const result = partyQuests.getActiveQuests('party_999');
      
      expect(result.success).toBe(true);
      expect(result.quests).toEqual([]);
    });
  });

  describe('createBossQuest', () => {
    it('보스 퀘스트를 생성해야 함', () => {
      const quest = partyQuests.createBossQuest(20);
      
      expect(quest.type).toBe('boss');
      expect(quest.targetKills).toBe(1);
      expect(quest.level).toBe(20);
    });

    it('레벨에 따라 보상 증가해야 함', () => {
      const quest1 = partyQuests.createBossQuest(10);
      const quest2 = partyQuests.createBossQuest(20);
      
      expect(quest2.reward.exp).toBeGreaterThan(quest1.reward.exp);
      expect(quest2.reward.coins).toBeGreaterThan(quest1.reward.coins);
    });
  });

  describe('createCooperationQuest', () => {
    it('협동 퀘스트를 생성해야 함', () => {
      const quest = partyQuests.createCooperationQuest(15);
      
      expect(quest.type).toBe('cooperation');
      expect(quest.targetTasks).toBeGreaterThan(5);
      expect(quest.level).toBe(15);
    });

    it('레벨에 따라 기본 타스크 수 증가해야 함', () => {
      const quest1 = partyQuests.createCooperationQuest(10);
      const quest2 = partyQuests.createCooperationQuest(20);
      
      expect(quest2.targetTasks).toBeGreaterThan(quest1.targetTasks);
    });
  });

  describe('generateRandomQuest', () => {
    it('랜덤 퀘스트를 생성해야 함', () => {
      const quest = partyQuests.generateRandomQuest(10);
      
      expect(['boss', 'cooperation']).toContain(quest.type);
    });

    it('모든 퀘스트 속성이 있어야 함', () => {
      const quest = partyQuests.generateRandomQuest(10);
      
      expect(quest.id).toBeDefined();
      expect(quest.type).toBeDefined();
      expect(quest.title).toBeDefined();
      expect(quest.description).toBeDefined();
      expect(quest.level).toBeDefined();
      expect(quest.reward).toBeDefined();
      expect(quest.timeLimit).toBeDefined();
    });
  });

  describe('abortQuest', () => {
    let activeQuestId;

    beforeEach(() => {
      const result = partyQuests.startQuest('party_1', 'boss_quest_1');
      activeQuestId = result.activeQuest.id;
    });

    it('퀘스트를 포기해야 함', () => {
      const result = partyQuests.abortQuest('party_1', activeQuestId);
      
      expect(result.success).toBe(true);
      expect(result.activeQuestId).toBe(activeQuestId);
    });

    it('포기한 퀘스트는 목록에서 제거해야 함', () => {
      partyQuests.abortQuest('party_1', activeQuestId);
      
      const activeQuests = partyQuests.getActiveQuests('party_1');
      
      expect(activeQuests.quests.length).toBe(0);
    });

    it('존재하지 않는 퀘스트는 실패해야 함', () => {
      const result = partyQuests.abortQuest('party_1', 'active_999');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('QUEST_NOT_FOUND');
    });

    it('진행 상황도 삭제해야 함', () => {
      partyQuests.updateQuestProgress('party_1', activeQuestId, 'player1', 'kill', 1);
      
      partyQuests.abortQuest('party_1', activeQuestId);
      
      // 다시 시작하면 진행 상황 초기화됨
      const newResult = partyQuests.startQuest('party_1', 'boss_quest_1');
      const progressResult = partyQuests.updateQuestProgress('party_1', newResult.activeQuest.id, 'player1', 'kill', 1);
      
      expect(progressResult.progress.kills).toBe(1);
    });
  });

  describe('cleanupPartyQuests', () => {
    beforeEach(() => {
      partyQuests.startQuest('party_1', 'boss_quest_1');
      partyQuests.startQuest('party_1', 'coop_quest_1');
    });

    it('파티 퀘스트를 정리해야 함', () => {
      partyQuests.cleanupPartyQuests('party_1');
      
      const result = partyQuests.getActiveQuests('party_1');
      
      expect(result.quests).toEqual([]);
    });

    it('다른 파티의 퀘스트는 보존해야 함', () => {
      partyQuests.startQuest('party_2', 'boss_quest_1');
      
      partyQuests.cleanupPartyQuests('party_1');
      
      const result = partyQuests.getActiveQuests('party_2');
      
      expect(result.quests.length).toBe(1);
    });
  });

  describe('cleanupExpiredQuests', () => {
    it('만료된 퀘스트를 정리해야 함', () => {
      partyQuests.startQuest('party_1', 'boss_quest_1');
      
      const result = partyQuests.cleanupExpiredQuests();
      
      expect(result.success).toBe(true);
      expect(typeof result.expiredCount).toBe('number');
    });
  });

  describe('registerQuestDefinition', () => {
    it('퀘스트 정의를 등록해야 함', () => {
      const questDef = {
        id: 'test_quest',
        type: 'test',
        title: 'Test Quest',
        description: 'Test description'
      };
      
      partyQuests.registerQuestDefinition('test_quest', questDef);
      
      const result = partyQuests.startQuest('party_1', 'test_quest');
      
      expect(result.success).toBe(true);
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      partyQuests.startQuest('party_1', 'boss_quest_1');
      partyQuests.startQuest('party_1', 'coop_quest_1');
    });

    it('통계 정보를 조회해야 함', () => {
      const stats = partyQuests.getStats();
      
      expect(stats.totalQuestDefinitions).toBeGreaterThan(0);
      expect(stats.totalActiveQuests).toBeGreaterThan(0);
      expect(stats.activeParties).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('완전한 퀘스트 라이프사이클을 수행해야 함', () => {
      // 시작
      const startResult = partyQuests.startQuest('party_1', 'boss_quest_1');
      expect(startResult.success).toBe(true);
      
      // 진행
      const progressResult = partyQuests.updateQuestProgress(
        'party_1',
        startResult.activeQuest.id,
        'player1',
        'kill',
        1
      );
      expect(progressResult.success).toBe(true);
      expect(progressResult.completed).toBe(true);
      
      // 완료 확인
      const activeQuests = partyQuests.getActiveQuests('party_1');
      expect(activeQuests.quests[0].completed).toBe(true);
    });

    it('다수 멤버가 퀘스트에 기여해야 함', () => {
      partyQuests.startQuest('party_1', 'coop_quest_1');
      const result = partyQuests.startQuest('party_1', 'coop_quest_1');
      
      // 여러 멤버가 기여
      partyQuests.updateQuestProgress('party_1', result.activeQuest.id, 'player1', 'task', 2);
      partyQuests.updateQuestProgress('party_1', result.activeQuest.id, 'player2', 'task', 2);
      partyQuests.updateQuestProgress('party_1', result.activeQuest.id, 'player3', 'task', 2);
      
      const finalResult = partyQuests.getActiveQuests('party_1');
      const coopQuest = finalResult.quests.find(q => q.questId === 'coop_quest_1');
      
      expect(coopQuest.progress.membersContributed.length).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('타임 리밋 없는 퀘스트도 처리해야 함', () => {
      const questDef = {
        id: 'no_limit_quest',
        type: 'test',
        title: 'Test',
        description: 'Test',
        timeLimit: null
      };
      
      partyQuests.registerQuestDefinition('no_limit_quest', questDef);
      const result = partyQuests.startQuest('party_1', 'no_limit_quest');
      
      expect(result.success).toBe(true);
    });

    it('여러 파티에서 동일 퀘스트를 실행할 수 있어야 함', () => {
      const result1 = partyQuests.startQuest('party_1', 'boss_quest_1');
      const result2 = partyQuests.startQuest('party_2', 'boss_quest_1');
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.activeQuest.id).not.toBe(result2.activeQuest.id);
    });
  });
});