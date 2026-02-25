/**
 * PartyQuests 테스트
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import PartyQuests from '../party-quests';

describe('PartyQuests', () => {
  let partyQuests;

  beforeEach(() => {
    partyQuests = new PartyQuests();
  });

  afterEach(() => {
    // 테스트 후 정리
    partyQuests.activeQuests.clear();
    partyQuests.bossBattles.clear();
  });

  describe('startCooperativeQuest', () => {
    it('협동 퀘스트 시작', () => {
      const quest = partyQuests.startCooperativeQuest('party1', 'cooperation');

      expect(quest).toBeDefined();
      expect(quest.id).toBeDefined();
      expect(quest.partyId).toBe('party1');
      expect(quest.type).toBe('cooperation');
      expect(quest.status).toBe('active');
      expect(quest.objectives).toBeDefined();
      expect(quest.rewards).toBeDefined();
    });

    it('퀘스트 파라미터 커스터마이징', () => {
      const quest = partyQuests.startCooperativeQuest('party1', 'boss', {
        title: 'Custom Boss Quest',
        level: 20,
        timeLimit: 1800000
      });

      expect(quest.title).toBe('Custom Boss Quest');
      expect(quest.level).toBe(20);
      expect(quest.timeLimit).toBe(1800000);
    });

    it('목표 진행 상황 초기화', () => {
      const quest = partyQuests.startCooperativeQuest('party1', 'cooperation');

      expect(quest.objectivesProgress).toBeDefined();
      Object.values(quest.objectivesProgress).forEach(progress => {
        expect(progress.target).toBeGreaterThan(0);
        expect(progress.current).toBe(0);
      });
    });

    it('퀘스트 만료 시간 설정', () => {
      const quest = partyQuests.startCooperativeQuest(
        'party1',
        'cooperation',
        { timeLimit: 600000 } // 10분
      );

      const now = Date.now();
      expect(quest.expiresIn - now).toBeGreaterThan(0);
      expect(quest.expiresIn - now).toBeLessThanOrEqual(600000);
    });

    it('다른 퀘스트 유형 시작', () => {
      const bossQuest = partyQuests.startCooperativeQuest('party2', 'boss');
      const expQuest = partyQuests.startCooperativeQuest('party3', 'exploration');

      expect(bossQuest.type).toBe('boss');
      expect(expQuest.type).toBe('exploration');
    });
  });

  describe('startBossBattle', () => {
    it('보스전 시작', () => {
      const bossBattle = partyQuests.startBossBattle('party1', 'boss1', {
        name: 'Dragon',
        level: 20,
        maxHP: 5000
      });

      expect(bossBattle).toBeDefined();
      expect(bossBattle.type).toBe('boss');
      expect(bossBattle.partyId).toBe('party1');
      expect(bossBattle.boss.name).toBe('Dragon');
      expect(bossBattle.boss.maxHP).toBe(5000);
      expect(bossBattle.boss.hp).toBe(5000);
      expect(bossBattle.phase).toBe('preparation');
      expect(bossBattle.status).toBe('active');
    });

    it('보스 데이터 기본값', () => {
      const bossBattle = partyQuests.startBossBattle('party1', 'boss1');

      expect(bossBattle.boss.level).toBe(1);
      expect(bossBattle.boss.maxHP).toBe(1000);
      expect(bossBattle.boss.hp).toBe(1000);
      expect(bossBattle.boss.attack).toBe(50);
      expect(bossBattle.boss.defense).toBe(30);
    });

    it('보스전 데미지 맵 초기화', () => {
      const bossBattle = partyQuests.startBossBattle('party1', 'boss1');

      expect(bossBattle.partyDamage).toBeDefined();
      expect(bossBattle.partyDamage.size).toBe(0);
    });
  });

  describe('dealBossDamage', () => {
    it('보스에 데미지 입력', () => {
      partyQuests.startBossBattle('party1', 'boss1', {
        name: 'Dragon',
        maxHP: 1000
      });

      // 전투 시작
      const battle = partyQuests.bossBattles.get('party1');
      battle.phase = 'fighting';

      const result = partyQuests.dealBossDamage('party1', 'player1', 100);

      expect(result.success).toBe(true);
      expect(result.bossDefeated).toBe(false);
      expect(battle.boss.hp).toBe(900);
    });

    it('플레이어 데미지 누적', () => {
      partyQuests.startBossBattle('party1', 'boss1', { maxHP: 1000 });
      const battle = partyQuests.bossBattles.get('party1');
      battle.phase = 'fighting';

      partyQuests.dealBossDamage('party1', 'player1', 100);
      partyQuests.dealBossDamage('party1', 'player1', 50);

      expect(battle.partyDamage.get('player1')).toBe(150);
    });

    it('보스 HP가 0 이하로 떨어지지 않음', () => {
      partyQuests.startBossBattle('party1', 'boss1', { maxHP: 100 });
      const battle = partyQuests.bossBattles.get('party1');
      battle.phase = 'fighting';

      partyQuests.dealBossDamage('party1', 'player1', 200);

      expect(battle.boss.hp).toBe(0);
    });

    it('보스 HP가 0이 되면 보스 사망', () => {
      partyQuests.startBossBattle('party1', 'boss1', { maxHP: 100 });
      const battle = partyQuests.bossBattles.get('party1');
      battle.phase = 'fighting';

      const result = partyQuests.dealBossDamage('party1', 'player1', 100);

      expect(result.bossDefeated).toBe(true);
      expect(battle.phase).toBe('completed');
      expect(battle.status).toBe('completed');
      expect(battle.completedAt).toBeDefined();
    });

    it('음수 데미지는 0으로 처리', () => {
      partyQuests.startBossBattle('party1', 'boss1', { maxHP: 1000 });
      const battle = partyQuests.bossBattles.get('party1');
      battle.phase = 'fighting';

      const beforeHP = battle.boss.hp;
      partyQuests.dealBossDamage('party1', 'player1', -50);

      expect(battle.boss.hp).toBe(beforeHP);
    });

    it('전투 중 상태가 아니면 데미지 입력 불가', () => {
      partyQuests.startBossBattle('party1', 'boss1', { maxHP: 1000 });

      expect(() => {
        partyQuests.dealBossDamage('party1', 'player1', 100);
      }).toThrow('Boss battle is not in fighting phase');
    });

    it('없는 보스전에 데미지 입력 불가', () => {
      expect(() => {
        partyQuests.dealBossDamage('nonexist', 'player1', 100);
      }).toThrow('No boss battle in progress');
    });
  });

  describe('progressObjective', () => {
    it('퀘스트 목표 진행', () => {
      partyQuests.startCooperativeQuest('party1', 'cooperation');
      const quest = partyQuests.activeQuests.get('party1');

      const objectiveType = Object.keys(quest.objectivesProgress)[0];

      const progress = partyQuests.progressObjective('party1', objectiveType, 5);

      expect(progress[objectiveType].current).toBe(5);
    });

    it('목표 완료 시 퀘스트 완료 체크', () => {
      partyQuests.startCooperativeQuest('party1', 'cooperation', {
        objectives: [
          { type: 'complete_tasks', count: 1 }
        ]
      });

      partyQuests.progressObjective('party1', 'complete_tasks', 1);

      const quest = partyQuests.activeQuests.get('party1');
      expect(quest.status).toBe('completed');
    });

    it('없는 목표 유형은 무시', () => {
      partyQuests.startCooperativeQuest('party1', 'cooperation');

      const progress = partyQuests.progressObjective('party1', 'nonexist', 5);

      expect(progress).toBeUndefined();
    });

    it('없는 퀘스트는 에러', () => {
      expect(() => {
        partyQuests.progressObjective('nonexist', 'tasks', 5);
      }).toThrow('No active quest for this party');
    });
  });

  describe('abandonQuest', () => {
    it('퀘스트 포기', () => {
      partyQuests.startCooperativeQuest('party1', 'cooperation');

      const result = partyQuests.abandonQuest('party1');

      expect(result.success).toBe(true);
      expect(result.quest.status).toBe('failed');
      expect(partyQuests.activeQuests.has('party1')).toBe(false);
    });

    it('없는 퀘스트는 포기 불가', () => {
      expect(() => {
        partyQuests.abandonQuest('nonexist');
      }).toThrow('No active quest for this party');
    });
  });

  describe('getActiveQuest', () => {
    it('활성 퀘스트 조회', () => {
      partyQuests.startCooperativeQuest('party1', 'cooperation');

      const quest = partyQuests.getActiveQuest('party1');

      expect(quest).toBeDefined();
      expect(quest.status).toBe('active');
    });

    it('없는 파티는 null 반환', () => {
      const quest = partyQuests.getActiveQuest('nonexist');

      expect(quest).toBeNull();
    });
  });

  describe('getBossBattle', () => {
    it('보스전 조회', () => {
      partyQuests.startBossBattle('party1', 'boss1');

      const battle = partyQuests.getBossBattle('party1');

      expect(battle).toBeDefined();
      expect(battle.type).toBe('boss');
    });

    it('없는 보스전은 null 반환', () => {
      const battle = partyQuests.getBossBattle('nonexist');

      expect(battle).toBeNull();
    });
  });

  describe('cleanupExpiredQuests', () => {
    it('만료된 퀘스트 정리', () => {
      // 만료된 퀘스트 생성 (1초 만료)
      partyQuests.startCooperativeQuest('party1', 'cooperation', {
        timeLimit: 1
      });

      // 대기
      return new Promise((resolve) => {
        setTimeout(() => {
          const expired = partyQuests.cleanupExpiredQuests();
          expect(expired.length).toBeGreaterThan(0);
          expect(partyQuests.activeQuests.has('party1')).toBe(false);
          resolve();
        }, 10);
      });
    });

    it('만료된 보스전 정리', () => {
      partyQuests.startBossBattle('party1', 'boss1');

      return new Promise((resolve) => {
        setTimeout(() => {
          const beforeHP = partyQuests.bossBattles.get('party1').boss.hp;
          // 만료 시간이 지나면 정리
          const expired = partyQuests.cleanupExpiredQuests();

          // 보스전은 기본 10분이라 아직 만료 안 됨
          expect(expired.length).toBe(0);
          resolve();
        }, 1000);
      });
    });
  });
});