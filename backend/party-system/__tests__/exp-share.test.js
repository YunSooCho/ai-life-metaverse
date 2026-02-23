/**
 * ExpShare 테스트
 */

import { describe, it, expect } from 'vitest';
import ExpShare from '../exp-share';

describe('ExpShare', () => {
  let expShare;

  beforeEach(() => {
    expShare = new ExpShare();
  });

  describe('calculateExpDistribution', () => {
    it('경험치 분배 계산 수행', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 }
      ];

      const distribution = expShare.calculateExpDistribution(partyMembers, 1000, 'player1');

      expect(distribution).toBeDefined();
      expect(distribution.player1).toBeDefined();
      expect(distribution.player2).toBeDefined();
      expect(distribution.player1.totalExp).toBeGreaterThan(0);
      expect(distribution.player2.totalExp).toBeGreaterThan(0);
    });

    it('동일 레벨 파티원은 동일한 경험치 분배', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 }
      ];

      const distribution = expShare.calculateExpDistribution(partyMembers, 1000, 'player1');

      expect(distribution.player1.totalExp).toBe(distribution.player2.totalExp);
    });

    it('파티 보너스 올바르게 적용', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 }
      ];

      const baseExp = 1000;
      const distribution = expShare.calculateExpDistribution(partyMembers, baseExp, 'player1');

      // 파티 보너스: 2인 * 10% = +20%
      const expectedBonus = baseExp * 0.2;
      const totalWithBonus = baseExp + expectedBonus;

      expect(distribution.player1.bonus).toBe(0.2);
      expect(distribution.player1.totalExp).toBeGreaterThan(baseExp);
    });

    it('최대 파티 보너스 50% 적용', () => {
      const partyMembers = Array.from({ length: 10 }, (_, i) => ({
        id: `player${i + 1}`,
        level: 10
      }));

      const baseExp = 1000;
      const distribution = expShare.calculateExpDistribution(partyMembers, baseExp, 'player1');

      // 최대 보너스 50%
      expect(distribution.player1.bonus).toBe(0.5);
    });

    it('레벨 차이에 따른 페널티 적용', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 20 }
      ];

      const distribution = expShare.calculateExpDistribution(partyMembers, 1000, 'player1');

      // 레벨 10과 20 차이 = 10, 페널티 = 10 * 5% = 50%
      // player1 (level 10)은 더 낮을 수 있음
      expect(distribution.player1.penalty).toBeLessThan(1);
      expect(distribution.player2.penalty).toBeLessThan(1);
    });
  });

  describe('calculateQuestExp', () => {
    it('퀘스트 경험치 분배 수행', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 }
      ];

      const distribution = expShare.calculateQuestExp(partyMembers, 500);

      expect(distribution).toBeDefined();
      expect(distribution.player1).toBeDefined();
      expect(distribution.player2).toBeDefined();
    });
  });

  describe('calculateKillExp', () => {
    it('몬스터 처치 경험치 분배 수행', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 }
      ];

      const baseExp = 500;
      const distribution = expShare.calculateKillExp(partyMembers, baseExp, 'player1');

      expect(distribution).toBeDefined();
      expect(distribution.player1).toBeDefined();
      expect(distribution.player2).toBeDefined();
    });

    it('킬러에게 추가 보너스 +20%', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 }
      ];

      const baseExp = 500;
      const distribution = expShare.calculateKillExp(partyMembers, baseExp, 'player1');

      // 킬러가 player1, 킬 보너스 있어야 함
      expect(distribution.player1.killBonus).toBe(0.2);
    });

    it('킬러가 포함되지 않으면 보너스 없음', () => {
      const partyMembers = [
        { id: 'player1', level: 10 },
        { id: 'player2', level: 10 }
      ];

      const distribution = expShare.calculateKillExp(partyMembers, 500, 'player99');

      expect(distribution.player99).toBeUndefined();
    });
  });

  describe('calculateCoopBonus', () => {
    it('협동 보너스 계산', () => {
      const bonus = expShare.calculateCoopBonus(3, 5);

      expect(bonus).toBeGreaterThan(0);
      expect(bonus).toBeLessThanOrEqual(0.3);
    });

    it('모든 파티원이 근처에 있으면 최대 보너스', () => {
      const bonus = expShare.calculateCoopBonus(5, 5);

      expect(bonus).toBe(0.3);
    });

    it('아무도 근처에 없으면 보너스 없음', () => {
      const bonus = expShare.calculateCoopBonus(0, 5);

      expect(bonus).toBe(0);
    });

    it('파티원 전체가 0명이면 보너스 없음', () => {
      const bonus = expShare.calculateCoopBonus(3, 0);

      expect(bonus).toBe(0);
    });
  });

  describe('getPartyBonusInfo', () => {
    it('파티 보너스 정보 반환', () => {
      const bonusInfo = expShare.getPartyBonusInfo(3);

      expect(bonusInfo).toBeDefined();
      expect(bonusInfo.partySize).toBe(3);
      expect(bonusInfo.rawBonus).toBeCloseTo(0.3);
      expect(bonusInfo.actualBonus).toBeCloseTo(0.3);
      expect(bonusInfo.capped).toBe(false);
    });

    it('보너스 캡 확인 (5인 이상)', () => {
      const bonusInfo = expShare.getPartyBonusInfo(10);

      expect(bonusInfo.capped).toBe(true);
      expect(bonusInfo.actualBonus).toBe(0.5);
    });
  });

  describe('level penalty', () => {
    it('평균 레벨과의 차이로 페널티 계산', () => {
      const partyMembers = [
        { id: 'player1', level: 5 },
        { id: 'player2', level: 15 },
        { id: 'player3', level: 25 }
      ];

      const distribution = expShare.calculateExpDistribution(partyMembers, 1000, 'player1');

      // 평균 레벨: (5+15+25)/3 = 15
      // player1 (5): 차이 10, 페널티 50%
      // player2 (15): 차이 0, 페널티 없음
      // player3 (25): 차이 10, 페널티 50%
      expect(distribution.player1.penalty).toBeLessThan(1);
      expect(distribution.player2.penalty).toBe(1);
      expect(distribution.player3.penalty).toBeLessThan(1);
    });

    it('최소 페널티 10% 적용', () => {
      const partyMembers = [
        { id: 'player1', level: 1 },
        { id: 'player2', level: 100 }
      ];

      const distribution = expShare.calculateExpDistribution(partyMembers, 1000, 'player1');

      // 레벨 차이가 매우 커도 페널티는 최소 10%
      expect(distribution.player1.penalty).toBeGreaterThanOrEqual(0.1);
    });
  });
});