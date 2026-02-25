/**
 * RewardDistribution 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RewardDistribution } from '../RewardDistribution.js';

describe('RewardDistribution', () => {
  let rewardDistribution;
  let testReward;
  let testMembers;

  beforeEach(() => {
    rewardDistribution = new RewardDistribution();
    testReward = {
      exp: 1000,
      coins: 500,
      items: ['item1', 'item2', 'item3']
    };
    testMembers = [
      { id: 'player1', name: 'Alice' },
      { id: 'player2', name: 'Bob' },
      { id: 'player3', name: 'Charlie' }
    ];
  });

  describe('distributeQuestReward', () => {
    it('퀘스트 보상을 균등 분배해야 함', () => {
      rewardDistribution.registerQuestReward('quest1', testReward);
      
      const result = rewardDistribution.distributeQuestReward('quest1', testMembers, 'equal');
      
      expect(result.success).toBe(true);
      expect(result.distributions.length).toBe(3);
      expect(result.distributionType).toBe('equal');
    });

    it('보상이 없으면 실패해야 함', () => {
      const result = rewardDistribution.distributeQuestReward('quest999', testMembers, 'equal');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('REWARD_NOT_FOUND');
    });

    it('잘못된 분배 타입은 실패해야 함', () => {
      rewardDistribution.registerQuestReward('quest1', testReward);
      
      const result = rewardDistribution.distributeQuestReward('quest1', testMembers, 'invalid_type');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_DISTRIBUTION_TYPE');
    });

    it('랜덤 분배도 수행해야 함', () => {
      rewardDistribution.registerQuestReward('quest1', testReward);
      
      const result = rewardDistribution.distributeQuestReward('quest1', testMembers, 'random');
      
      expect(result.success).toBe(true);
      expect(result.distributionType).toBe('random');
    });

    it('기여도 기반 분배도 수행해야 함', () => {
      rewardDistribution.registerQuestReward('quest1', testReward);
      
      const membersWithContribution = [
        { id: 'player1', name: 'Alice', contribution: 50 },
        { id: 'player2', name: 'Bob', contribution: 30 },
        { id: 'player3', name: 'Charlie', contribution: 20 }
      ];
      
      const result = rewardDistribution.distributeQuestReward('quest1', membersWithContribution, 'based_on_contribution');
      
      expect(result.success).toBe(true);
      expect(result.distributionType).toBe('based_on_contribution');
    });
  });

  describe('distributeEqually', () => {
    it('경험치를 균등 분배해야 함', () => {
      const distributions = rewardDistribution.distributeEqually(testReward, testMembers);
      
      const expPerMember = Math.floor(1000 / 3);
      
      expect(distributions.length).toBe(3);
      distributions.forEach(dist => {
        expect(dist.exp).toBe(expPerMember);
      });
    });

    it('코인을 균등 분배해야 함', () => {
      const distributions = rewardDistribution.distributeEqually(testReward, testMembers);
      
      const coinsPerMember = Math.floor(500 / 3);
      
      distributions.forEach(dist => {
        expect(dist.coins).toBe(coinsPerMember);
      });
    });

    it('모든 멤버에게 아이템 복사본을 제공해야 함', () => {
      const distributions = rewardDistribution.distributeEqually(testReward, testMembers);
      
      distributions.forEach(dist => {
        expect(dist.items).toEqual(['item1', 'item2', 'item3']);
      });
    });
  });

  describe('distributeRandomly', () => {
    it('경험치와 코인은 균등 분배해야 함', () => {
      const distributions = rewardDistribution.distributeRandomly(testReward, testMembers);
      
      const expPerMember = Math.floor(1000 / 3);
      const coinsPerMember = Math.floor(500 / 3);
      
      distributions.forEach(dist => {
        expect(dist.exp).toBe(expPerMember);
        expect(dist.coins).toBe(coinsPerMember);
      });
    });

    it('아이템은 랜덤 분배해야 함', () => {
      const distributions = rewardDistribution.distributeRandomly(testReward, testMembers);
      
      const totalItems = distributions.reduce((sum, dist) => sum + dist.items.length, 0);
      
      expect(totalItems).toBeLessThanOrEqual(testMembers.length);
    });

    it('모든 플레이어가 최소 하나의 아이템을 받아야 함 (가능한 경우)', () => {
      const distributions = rewardDistribution.distributeRandomly(testReward, testMembers);
      
      distributions.forEach(dist => {
        dist.items.forEach(item => {
          expect(testReward.items).toContain(item);
        });
      });
    });
  });

  describe('distributeByContribution', () => {
    it('기여도 비율에 따라 경험치를 분배해야 함', () => {
      const membersWithContribution = [
        { id: 'player1', name: 'Alice', contribution: 60 },
        { id: 'player2', name: 'Bob', contribution: 0 },
        { id: 'player3', name: 'Charlie', contribution: 0 }
      ];
      
      const distributions = rewardDistribution.distributeByContribution(testReward, membersWithContribution);
      
      const alice = distributions.find(d => d.playerId === 'player1');
      const bob = distributions.find(d => d.playerId === 'player2');
      const charlie = distributions.find(d => d.playerId === 'player3');
      
      expect(alice.exp).toBeGreaterThan(bob.exp);
      expect(alice.exp).toBeGreaterThan(charlie.exp);
    });

    it('기여도가 0이면 균등 분배로 fallback해야 함', () => {
      const membersWithZeroContribution = [
        { id: 'player1', name: 'Alice', contribution: 0 },
        { id: 'player2', name: 'Bob', contribution: 0 },
        { id: 'player3', name: 'Charlie', contribution: 0 }
      ];
      
      const distributions = rewardDistribution.distributeByContribution(testReward, membersWithZeroContribution);
      
      const expPerMember = Math.floor(1000 / 3);
      
      distributions.forEach(dist => {
        expect(dist.exp).toBe(expPerMember);
      });
    });
  });

  describe('generatePartyQuest', () => {
    it('파티 랜덤 퀘스트를 생성해야 함', () => {
      const result = rewardDistribution.generatePartyQuest('party_1', 10);
      
      expect(result.success).toBe(true);
      expect(result.quest).toBeDefined();
      expect(result.quest.partyId).toBe('party_1');
      expect(result.quest.level).toBe(10);
    });

    it('퀘스트 타입이 있어야 함', () => {
      const result = rewardDistribution.generatePartyQuest('party_1', 10);
      
      expect(['boss', 'dungeon', 'collection', 'cooperation']).toContain(result.quest.type);
    });

    it('퀘스트 보상이 포함되어야 함', () => {
      const result = rewardDistribution.generatePartyQuest('party_1', 10);
      
      expect(result.quest.reward).toBeDefined();
      expect(result.quest.reward.exp).toBeGreaterThan(0);
      expect(result.quest.reward.coins).toBeGreaterThan(0);
    });

    it('퀘스트에 만료 날짜가 있어야 함', () => {
      const result = rewardDistribution.generatePartyQuest('party_1', 10);
      
      expect(result.quest.expiresAt).toBeDefined();
      expect(result.quest.expiresAt).toBeGreaterThan(Date.now());
    });

    it('레벨에 따라 보상이 증가해야 함', () => {
      const result1 = rewardDistribution.generatePartyQuest('party_1', 10);
      const result2 = rewardDistribution.generatePartyQuest('party_1', 20);
      
      expect(result2.quest.reward.exp).toBeGreaterThan(result1.quest.reward.exp);
      expect(result2.quest.reward.coins).toBeGreaterThan(result1.quest.reward.coins);
    });
  });

  describe('completePartyQuest', () => {
    beforeEach(() => {
      rewardDistribution.registerQuestReward('quest_test', testReward);
    });

    it('파티 퀘스트를 완료해야 함', () => {
      const result = rewardDistribution.completePartyQuest('quest_test', testMembers);
      
      expect(result.success).toBe(true);
      expect(result.distributions).toBeDefined();
    });

    it('완료된 퀘스트 보상을 분배해야 함', () => {
      const result = rewardDistribution.completePartyQuest('quest_test', testMembers);
      
      result.distributions.forEach(dist => {
        expect(dist.exp).toBeGreaterThan(0);
        expect(dist.coins).toBeGreaterThan(0);
      });
    });
  });

  describe('createPartyReward', () => {
    it('파티 보너스를 적용한 보상을 생성해야 함', () => {
      const baseReward = { exp: 1000, coins: 500, items: ['item1'] };
      const result = rewardDistribution.createPartyReward('party_1', baseReward, 1.3);
      
      expect(result.partyId).toBe('party_1');
      expect(result.exp).toBe(1300); // 1000 * 1.3
      expect(result.coins).toBe(650); // 500 * 1.3
    });

    it('파티 보너스 보너스 아이템을 추가해야 함', () => {
      const baseReward = { exp: 100, coins: 50, items: [] };
      
      // 1.3 이상 보너스
      const result1 = rewardDistribution.createPartyReward('party_1', baseReward, 1.3);
      // 1.5 이상 보너스
      const result2 = rewardDistribution.createPartyReward('party_1', baseReward, 1.5);
      
      expect(result1.items).toContain('party_bonus_item_rare');
      expect(result2.items).toContain('party_bonus_item_rare');
      expect(result2.items).toContain('party_bonus_item_epic');
    });

    it('기본 아이템 복사해야 함', () => {
      const baseReward = { exp: 100, coins: 50, items: ['sword', 'shield'] };
      const result = rewardDistribution.createPartyReward('party_1', baseReward, 1.0);
      
      expect(result.items).toContain('sword');
      expect(result.items).toContain('shield');
    });
  });

  describe('getPartyQuests', () => {
    it('파티 퀘스트 목록을 조회해야 함', () => {
      rewardDistribution.generatePartyQuest('party_1', 10);
      rewardDistribution.generatePartyQuest('party_1', 10);
      rewardDistribution.generatePartyQuest('party_2', 10);
      
      const result1 = rewardDistribution.getPartyQuests('party_1');
      const result2 = rewardDistribution.getPartyQuests('party_2');
      
      expect(result1.success).toBe(true);
      expect(result1.quests.length).toBe(2);
      expect(result2.success).toBe(true);
      expect(result2.quests.length).toBe(1);
    });

    it('퀘스트가 없는 파티는 빈 배열을 반환해야 함', () => {
      const result = rewardDistribution.getPartyQuests('party_999');
      
      expect(result.success).toBe(true);
      expect(result.quests).toEqual([]);
    });
  });

  describe('registerQuestReward', () => {
    it('퀘스트 보상을 등록해야 함', () => {
      rewardDistribution.registerQuestReward('quest1', testReward);
      
      const result = rewardDistribution.distributeQuestReward('quest1', testMembers, 'equal');
      
      expect(result.success).toBe(true);
    });
  });

  describe('cleanupPartyQuests', () => {
    it('파티 퀘스트를 정리해야 함', () => {
      rewardDistribution.generatePartyQuest('party_1', 10);
      
      rewardDistribution.cleanupPartyQuests('party_1');
      
      const result = rewardDistribution.getPartyQuests('party_1');
      
      expect(result.quests).toEqual([]);
    });
  });

  describe('cleanupExpiredQuests', () => {
    it('만료된 퀘스트를 정리해야 함', () => {
      const result = rewardDistribution.cleanupExpiredQuests();
      
      expect(result.success).toBe(true);
      expect(typeof result.expiredCount).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    it('빈 보상도 처리해야 함', () => {
      const emptyReward = { exp: 0, coins: 0, items: [] };
      
      rewardDistribution.registerQuestReward('empty_quest', emptyReward);
      const result = rewardDistribution.distributeQuestReward('empty_quest', testMembers, 'equal');
      
      expect(result.success).toBe(true);
      result.distributions.forEach(dist => {
        expect(dist.exp).toBe(0);
        expect(dist.coins).toBe(0);
      });
    });

    it('단일 멤버 파티도 처리해야 함', () => {
      const singleMember = [{ id: 'player1', name: 'Alice' }];
      
      rewardDistribution.registerQuestReward('single_quest', testReward);
      const result = rewardDistribution.distributeQuestReward('single_quest', singleMember, 'equal');
      
      expect(result.success).toBe(true);
      expect(result.distributions.length).toBe(1);
    });

    it('많은 수의 아이템도 처리해야 함', () => {
      const manyItems = Array.from({ length: 100 }, (_, i) => `item${i}`);
      const rewardWithManyItems = {
        exp: 1000,
        coins: 500,
        items: manyItems
      };
      
      rewardDistribution.registerQuestReward('many_items_quest', rewardWithManyItems);
      const result = rewardDistribution.distributeQuestReward('many_items_quest', testMembers, 'equal');
      
      expect(result.success).toBe(true);
      result.distributions.forEach(dist => {
        expect(dist.items.length).toBe(manyItems.length);
      });
    });
  });
});