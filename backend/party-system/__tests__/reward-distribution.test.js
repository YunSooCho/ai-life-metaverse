/**
 * RewardDistribution 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import RewardDistribution from '../reward-distribution';

describe('RewardDistribution', () => {
  let rewardDistribution;

  beforeEach(() => {
    rewardDistribution = new RewardDistribution();
  });

  describe('distributeExpReward', () => {
    it('경험치 보상 분배 수행', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 }
      ];

      const distribution = rewardDistribution.distributeExpReward(
        'party1',
        partyMembers,
        500,
        'quest1'
      );

      expect(distribution).toBeDefined();
      expect(distribution.player1).toBeDefined();
      expect(distribution.player2).toBeDefined();
      expect(distribution.player1.exp).toBe(500);
      expect(distribution.player2.exp).toBe(500);
    });

    it('모든 파티원에게 동일한 경험치 분배', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 },
        { id: 'player3', level: 10 }
      ];

      const distribution = rewardDistribution.distributeExpReward(
        'party1',
        partyMembers,
        600,
        'quest1'
      );

      expect(distribution.player1.exp).toBe(600);
      expect(distribution.player2.exp).toBe(600);
      expect(distribution.player3.exp).toBe(600);
    });
  });

  describe('distributeItemReward', () => {
    it('아이템 랜덤 분배 수행', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 }
      ];

      const items = [
        { id: 'item1', name: 'Sword' },
        { id: 'item2', name: 'Potion' }
      ];

      const distribution = rewardDistribution.distributeItemReward(
        'party1',
        partyMembers,
        items,
        'random'
      );

      expect(distribution).toBeDefined();
      expect(distribution.player1).toBeDefined();
      expect(distribution.player2).toBeDefined();

      // 최소한 하나의 플레이어가 아이템을 받아야 함
      const totalItems = distribution.player1.length + distribution.player2.length;
      expect(totalItems).toBe(2);
    });

    it('파티장에게 모든 아이템 분배', () => {
      const partyMembers = [
        { id: 'player1', level: 10, isLeader: true },
        { id: 'player2', level: 10, isLeader: false }
      ];

      const items = [
        { id: 'item1', name: 'Sword' },
        { id: 'item2', name: 'Potion' }
      ];

      const distribution = rewardDistribution.distributeItemReward(
        'party1',
        partyMembers,
        items,
        'leader'
      );

      expect(distribution.player1.length).toBe(2);
      expect(distribution.player2.length).toBe(0);
    });

    it('특정 플레이어에게 아이템 분배', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 }
      ];

      const items = [
        { id: 'item1', name: 'Sword' }
      ];

      const distribution = rewardDistribution.distributeItemReward(
        'party1',
        partyMembers,
        items,
        'specific',
        'player1'
      );

      expect(distribution.player1.length).toBe(1);
      expect(distribution.player2.length).toBe(0);
    });

    it('대상이 없는 specific 분배는 아이템 사라짐', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 }
      ];

      const items = [
        { id: 'item1', name: 'Sword' }
      ];

      const distribution = rewardDistribution.distributeItemReward(
        'party1',
        partyMembers,
        items,
        'specific',
        'player99'
      );

      expect(distribution.player1.length).toBe(0);
      expect(distribution.player2.length).toBe(0);
    });
  });

  describe('distributeCoinReward', () => {
    it('코인 균등 분배', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 }
      ];

      const totalCoins = 100;
      const distribution = rewardDistribution.distributeCoinReward(
        'party1',
        partyMembers,
        totalCoins
      );

      expect(distribution).toBeDefined();
      expect(distribution.player1).toBe(50);
      expect(distribution.player2).toBe(50);
    });

    it('나누어 떨어지지 않을 때 나머지는 버림', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 }
      ];

      const totalCoins = 101;
      const distribution = rewardDistribution.distributeCoinReward(
        'party1',
        partyMembers,
        totalCoins
      );

      expect(distribution.player1).toBe(50);
      expect(distribution.player2).toBe(50);
    });
  });

  describe('distributeAllRewards', () => {
    it('모든 보상 종합 분배', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 }
      ];

      const rewards = {
        exp: 500,
        items: [{ id: 'item1', name: 'Sword' }],
        coins: 200,
        itemMethod: 'random'
      };

      const distribution = rewardDistribution.distributeAllRewards(
        'party1',
        partyMembers,
        rewards
      );

      expect(distribution).toBeDefined();
      expect(distribution.player1).toBeDefined();
      expect(distribution.player2).toBeDefined();

      expect(distribution.player1.exp).toBe(500);
      expect(distribution.player2.exp).toBe(500);
      expect(distribution.player1.coins).toBe(100);
      expect(distribution.player2.coins).toBe(100);

      // 아이템은 랜덤으로 분배
      const totalItems = distribution.player1.items.length + distribution.player2.items.length;
      expect(totalItems).toBe(1);
    });

    it('부분 보상만 있는 경우', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 }
      ];

      const rewards = {
        exp: 500
      };

      const distribution = rewardDistribution.distributeAllRewards(
        'party1',
        partyMembers,
        rewards
      );

      expect(distribution.player1.exp).toBe(500);
      expect(distribution.player2.exp).toBe(500);
      expect(distribution.player1.items).toEqual([]);
      expect(distribution.player2.items).toEqual([]);
      expect(distribution.player1.coins).toBe(0);
      expect(distribution.player2.coins).toBe(0);
    });
  });

  describe('createPartyQuest', () => {
    it('파티 퀘스트 생성', () => {
      const quest = rewardDistribution.createPartyQuest('party1', 10);

      expect(quest).toBeDefined();
      expect(quest.id).toBeDefined();
      expect(quest.partyId).toBe('party1');
      expect(quest.level).toBe(10);
      expect(quest.status).toBe('active');
      expect(quest.objectives).toBeDefined();
      expect(quest.rewards).toBeDefined();
    });

    it('퀘스트 난이도 계산', () => {
      const easyQuest = rewardDistribution.createPartyQuest('party1', 5);
      const hardQuest = rewardDistribution.createPartyQuest('party2', 40);

      expect(easyQuest.difficulty).toBe('easy');
      expect(hardQuest.difficulty).toBe('hard');
    });

    it('퀘스트에 저장', () => {
      const quest = rewardDistribution.createPartyQuest('party1', 10);

      const quests = rewardDistribution.getPartyQuests('party1');
      expect(quests).toHaveLength(1);
      expect(quests[0].id).toBe(quest.id);
    });
  });

  describe('completePartyQuest', () => {
    it('퀘스트 완료', () => {
      const quest = rewardDistribution.createPartyQuest('party1', 10);

      const completedQuest = rewardDistribution.completePartyQuest('party1', quest.id);

      expect(completedQuest).toBeDefined();
      expect(completedQuest.status).toBe('completed');
      expect(completedQuest.completedAt).toBeDefined();
    });

    it('없는 퀘스트는 완료 불가', () => {
      expect(() => {
        rewardDistribution.completePartyQuest('party1', 'nonexist');
      }).toThrow('Quest not found');
    });

    it('이미 완료된 퀘스트는 재완료 불가', () => {
      const quest = rewardDistribution.createPartyQuest('party1', 10);
      rewardDistribution.completePartyQuest('party1', quest.id);

      expect(() => {
        rewardDistribution.completePartyQuest('party1', quest.id);
      }).toThrow('Quest is not active');
    });
  });

  describe('getPartyQuests', () => {
    it('파티 퀘스트 목록 조회', () => {
      rewardDistribution.createPartyQuest('party1', 10);
      rewardDistribution.createPartyQuest('party1', 10);

      const quests = rewardDistribution.getPartyQuests('party1');

      expect(quests).toHaveLength(2);
    });

    it('퀘스트가 없는 파티는 빈 배열 반환', () => {
      const quests = rewardDistribution.getPartyQuests('nonexist');

      expect(quests).toEqual([]);
    });
  });
});