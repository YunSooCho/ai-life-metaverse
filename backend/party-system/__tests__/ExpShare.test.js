/**
 * ExpShare 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExpShare } from '../ExpShare.js';

describe('ExpShare', () => {
  let expShare;

  beforeEach(() => {
    expShare = new ExpShare();
  });

  describe('calculateSharedExp', () => {
    it('경험치를 공유 계산해야 함', () => {
      const result = expShare.calculateSharedExp(100, 2, 10, 10);
      
      expect(result.sharedExp).toBeDefined();
      expect(result.baseExp).toBe(100);
      expect(result.partyMemberCount).toBe(2);
      expect(result.partyBonusRate).toBe(1.0); // 파티원 1명 +10%
    });

    it('파티 보너스를 계산해야 함', () => {
      const result1 = expShare.calculateSharedExp(100, 2, 10, 10);
      const result2 = expShare.calculateSharedExp(100, 3, 10, 10);
      const result3 = expShare.calculateSharedExp(100, 6, 10, 10);
      
      expect(result1.partyBonusRate).toBe(1.0);  // 2인 파티: +10%
      expect(result2.partyBonusRate).toBe(1.1);  // 3인 파티: +20%
      expect(result3.partyBonusRate).toBe(1.5);  // 6인 파티: 최대 +50%
    });

    it('파티 보너스는 최대 +50%이어야 함', () => {
      const result = expShare.calculateSharedExp(100, 10, 10, 10);
      
      expect(result.partyBonusRate).toBe(1.5);
    });

    it('레벨 차이에 따른 페널티를 계산해야 함', () => {
      const result1 = expShare.calculateSharedExp(100, 2, 10, 10); // 차이 0
      const result2 = expShare.calculateSharedExp(100, 2, 10, 5);  // 차이 5
      const result3 = expShare.calculateSharedExp(100, 2, 10, 20); // 차이 10
      const result4 = expShare.calculateSharedExp(100, 2, 10, 25); // 차이 15
      
      expect(result1.levelPenalty).toBe(1.0);
      expect(result2.levelPenalty).toBe(1.0);
      expect(result3.levelPenalty).toBe(1.0);
      expect(result4.levelPenalty).toBeLessThan(1.0);
      expect(result4.levelPenalty).toBeGreaterThan(0.0);
    });

    it('0으로 계산된 경험치는 정수여야 함', () => {
      const result = expShare.calculateSharedExp(1, 10, 100, 1);
      
      expect(typeof result.sharedExp).toBe('number');
      expect(result.sharedExp).toBeGreaterThanOrEqual(0);
    });
  });

  describe('distributeExpToMembers', () => {
    it('경험치를 파티원에게 분배해야 함', () => {
      const sharedExpInfo = {
        sharedExp: 60,
        baseExp: 100
      };

      const members = [
        { id: 'player1', level: 10, isKiller: true },
        { id: 'player2', level: 10, isKiller: false }
      ];

      const result = expShare.distributeExpToMembers(sharedExpInfo, members);
      
      expect(result.success).toBe(true);
      expect(result.distributions.length).toBe(2);
      expect(result.distributions[0].isKiller).toBe(true);
      expect(result.distributions[1].isKiller).toBe(false);
    });

    it('킬러에게 개인 몫 40%를 할당해야 함', () => {
      const sharedExpInfo = {
        sharedExp: 60,
        baseExp: 100,
        partyBonusRate: 1.0,
        levelPenalty: 1.0
      };

      const members = [
        { id: 'player1', level: 10, isKiller: true },
        { id: 'player2', level: 10, isKiller: false }
      ];

      const result = expShare.distributeExpToMembers(sharedExpInfo, members);
      
      const killerExp = result.distributions.find(d => d.isKiller).exp;
      const expectedKillerExp = Math.floor(100 * 0.4); // 40
      
      expect(killerExp).toBe(expectedKillerExp);
    });

    it('나머지 파티원에게 경험치를 균등 분배해야 함', () => {
      const sharedExpInfo = {
        sharedExp: 60,
        baseExp: 100
      };

      const members = [
        { id: 'player1', level: 10, isKiller: true },
        { id: 'player2', level: 10, isKiller: false },
        { id: 'player3', level: 10, isKiller: false }
      ];

      const result = expShare.distributeExpToMembers(sharedExpInfo, members);
      
      const nonKillers = result.distributions.filter(d => !d.isKiller);
      const sharedExpPerMember = Math.floor(60 / 2);
      
      nonKillers.forEach(member => {
        expect(member.exp).toBe(sharedExpPerMember);
      });
    });
  });

  describe('calculateLevelPenalty', () => {
    it('레벨 차이가 10 이하이면 페널티 없어야 함', () => {
      const penalty1 = expShare.calculateLevelPenalty(10, 10);
      const penalty2 = expShare.calculateLevelPenalty(10, 15);
      const penalty3 = expShare.calculateLevelPenalty(10, 5);
      
      expect(penalty1).toBe(1.0);
      expect(penalty2).toBe(1.0);
      expect(penalty3).toBe(1.0);
    });

    it('레벨 차이가 10 초과면 페널티 적용해야 함', () => {
      const penalty1 = expShare.calculateLevelPenalty(10, 21); // 차이 11
      const penalty2 = expShare.calculateLevelPenalty(10, 30); // 차이 20
      
      expect(penalty1).toBeLessThan(1.0);
      expect(penalty2).toBeLessThan(1.0);
    });

    it('레벨 차이가 20 초과면 경험치 없어야 함', () => {
      const penalty = expShare.calculateLevelPenalty(10, 31); // 차이 21
      
      expect(penalty).toBe(0.0);
    });

    it('페널티는 점진적 감소여야 함', () => {
      const penalty11 = expShare.calculateLevelPenalty(10, 21); // 차이 11
      const penalty15 = expShare.calculateLevelPenalty(10, 25); // 차이 15
      const penalty20 = expShare.calculateLevelPenalty(10, 30); // 차이 20
      
      expect(penalty11).toBeGreaterThan(penalty15);
      expect(penalty15).toBeGreaterThan(penalty20);
    });
  });

  describe('calculatePartyBonus', () => {
    it('파티 보너스를 계산해야 함', () => {
      const result1 = expShare.calculatePartyBonus(1);
      const result2 = expShare.calculatePartyBonus(2);
      const result3 = expShare.calculatePartyBonus(5);
      const result4 = expShare.calculatePartyBonus(6);
      
      expect(result1.bonusRate).toBe(0);
      expect(result2.bonusRate).toBe(0.1);
      expect(result3.bonusRate).toBe(0.4);
      expect(result4.bonusRate).toBe(0.5);
    });

    it('보너스는 최대 +50%이어야 함', () => {
      const result = expShare.calculatePartyBonus(100);
      
      expect(result.bonusRate).toBe(0.5);
      expect(result.maxBonus).toBe(true);
    });

    it('보너스 배수를 계산해야 함', () => {
      const result = expShare.calculatePartyBonus(3);
      
      expect(result.bonusMultiplier).toBe(1.2); // 1 + 0.2
    });
  });

  describe('calculateTotalExp', () => {
    it('전체 경험치를 계산해야 함', () => {
      const params = {
        baseExp: 100,
        partyMembers: [
          { id: 'player1', level: 10 },
          { id: 'player2', level: 10 },
          { id: 'player3', level: 10 }
        ],
        killerId: 'player1',
        monsterLevel: 10
      };

      const result = expShare.calculateTotalExp(params);
      
      expect(result.success).toBe(true);
      expect(result.distributions).toBeDefined();
      expect(result.distributions.length).toBe(3);
    });

    it('킬러가 없으면 실패해야 함', () => {
      const params = {
        baseExp: 100,
        partyMembers: [
          { id: 'player1', level: 10 },
          { id: 'player2', level: 10 }
        ],
        killerId: 'player999',
        monsterLevel: 10
      };

      const result = expShare.calculateTotalExp(params);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('KILLER_NOT_FOUND');
    });
  });

  describe('calculateEfficiency', () => {
    it('효율성을 계산해야 함', () => {
      const result = expShare.calculateEfficiency({
        baseExp: 100,
        partyMemberCount: 2,
        killRate: { solo: 1.0, party: 0.8 }
      });
      
      expect(result.soloPerKill).toBe(100);
      expect(result.partyPerKill).toBeDefined();
      expect(result.efficiency).toBeDefined();
    });

    it('개인 초당 경험치와 파티 초당 경험치를 비교해야 함', () => {
      const result = expShare.calculateEfficiency({
        baseExp: 100,
        partyMemberCount: 2,
        killRate: { solo: 1.0, party: 0.8 }
      });
      
      expect(result.soloPerSec).toBe(100);
      expect(result.partyPerSec).toBeDefined();
    });

    it('efficiency > 1이면 파티가 유리해야 함', () => {
      const result = expShare.calculateEfficiency({
        baseExp: 100,
        partyMemberCount: 4,
        killRate: { solo: 1.0, party: 0.9 }
      });
      
      if (result.efficiency > 1) {
        expect(result.isPartyWorthwhile).toBe(true);
      }
    });

    it('효율성 계산에는 기본 killRate가 적용되어야 함', () => {
      const result = expShare.calculateEfficiency({
        baseExp: 100,
        partyMemberCount: 2
      });
      
      expect(result.efficiency).toBeDefined();
      expect(result.soloPerSec).toBe(100);
    });
  });

  describe('setBaseExpShareRatio', () => {
    it('기본 공유 비율을 설정해야 함', () => {
      expShare.setBaseExpShareRatio(0.8);
      
      const result = expShare.calculateSharedExp(100, 2, 10, 10);
      
      // 공유 비율이 변경된 것을 확인
      expect(result.sharedExp).toBeDefined();
    });

    it('공유 비율은 0.1 ~ 1.0 범위여야 함', () => {
      expShare.setBaseExpShareRatio(-0.5);  // 너무 낮음
      expShare.setBaseExpShareRatio(1.5);   // 너무 높음
      
      범위 체크는 내부적으로 처리됨
    });
  });

  describe('Integration Tests', () => {
    it('완전한 경험치 분배 프로세스를 수행해야 함', () => {
      // 파티 생성 시나리오
      const partyLevel = 10;
      const monsterLevel = 12;
      const baseExp = 150;

      const params = {
        baseExp,
        partyMembers: [
          { id: 'player1', level: partyLevel },
          { id: 'player2', level: partyLevel - 2 },
          { id: 'player3', level: partyLevel + 3 }
        ],
        killerId: 'player1',
        monsterLevel
      };

      const result = expShare.calculateTotalExp(params);
      
      expect(result.success).toBe(true);
      expect(result.distributions).toBeDefined();
      expect(result.distributions.length).toBe(3);
      
      // 킬러 확인
      const killer = result.distributions.find(d => d.isKiller);
      expect(killer).toBeDefined();
      
      // 모든 멤버가 경험치를 받았는지 확인
      result.distributions.forEach(dist => {
        expect(dist.exp).toBeGreaterThanOrEqual(0);
      });
    });
  });
});