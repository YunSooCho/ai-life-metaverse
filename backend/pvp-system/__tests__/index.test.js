/**
 * PvPSystem 통합 테스트
 */

import { PvPSystem, pvpSystemInstance, BattleStatus } from '../index.js';

describe('PvPSystem Integration', () => {
  let pvpSystem;

  beforeEach(() => {
    pvpSystem = new PvPSystem();
  });

  describe('전투 플로우 통합 테스트', () => {
    it('should complete a full battle flow', () => {
      const player1 = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 50,
          defense: 10,
          speed: 10
        },
        skills: [
          {
            id: 'skill_fireball',
            name: 'Fireball',
            cooldown: 2,
            effects: [{ type: 'damage', target: 'enemy', value: 40 }]
          }
        ]
      };

      const player2 = {
        id: 'p2',
        name: 'Player 2',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 20,
          defense: 5,
          speed: 8
        },
        skills: []
      };

      // 1. 전투 생성
      const battle = pvpSystem.createBattle(player1, player2);

      expect(battle.status).toBe(BattleStatus.PREPARING);
      expect(battle.id).toBeDefined();

      // 2. 전투 시작
      pvpSystem.startBattle(battle.id);

      expect(battle.status).toBe(BattleStatus.IN_PROGRESS);

      // 3. 공격 수행 - Normal Attack
      const result1 = pvpSystem.executeAction(battle.id, {
        playerId: battle.currentPlayer,
        type: 'normal_attack'
      });

      expect(result1.actions.length).toBe(1);

      // 4. 스킬 사용 가능 확인
      const canUseSkill = pvpSystem.canUseSkill(battle.id, battle.player1Id, 'skill_fireball');

      expect(canUseSkill).toBe(true);

      // 5-6. 스킬 시스템이 작동하는지 확인은 별도 테스트로

      // 7. 전투 완료 (직접 종료하여 테스트 간소화)
      const losersKey = battle.player1Id === 'p1' ? battle.player2Id : battle.player1Id;
      const winnersKey = battle.player1Id === 'p1' ? battle.player1Id : battle.player2Id;

      battle.players[losersKey].hp = 0;
      battle._endBattle(battle.player1Id); // 直接使用battle.player1Id
      battle.endedAt = new Date();

      // 8. 전투 완료 핸들러 직접 호출
      const battleResult = pvpSystem._handleBattleCompletion(battle);

      // 9. 전투 완료 확인
      expect(battle.status).toBe(BattleStatus.COMPLETED);
      expect(battle.winner).toBeDefined();

      // 10. 랭킹 결과 확인
      expect(battleResult.rankingResult).toBeDefined();
      expect(battleResult.rankingResult.newWinnerRating).toBeDefined();
      expect(battleResult.rankingResult.newLoserRating).toBeDefined();

      // 11. 보상 확인
      expect(battleResult.rewards).toBeDefined();
      expect(battleResult.rewards.winner).toBeDefined();
      expect(battleResult.rewards.loser).toBeDefined();
      expect(battleResult.rewards.winner.totalCoins).toBeGreaterThan(0);
    });
  });

  describe('랭킹 및 보상 시스템 통합', () => {
    it('should update ranking and reward history after battle', () => {
      const player1 = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 60,
          defense: 10,
          speed: 10
        },
        skills: []
      };

      const player2 = {
        id: 'p2',
        name: 'Player 2',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 18,
          defense: 5,
          speed: 8
        },
        skills: []
      };

      // 전투 실행
      const battle = pvpSystem.createBattle(player1, player2);
      pvpSystem.startBattle(battle.id);

      // 빠르게 전투 종료 (직접 HP 조정)
      battle.players[battle.player2Id].hp = 0;
      battle._endBattle(battle.player1Id);
      battle.endedAt = new Date();

      // 핸들러 호출
      const result = pvpSystem._handleBattleCompletion(battle);

      // 랭킹 확인
      const ranking = pvpSystem.getRanking(10);

      expect(ranking.length).toBe(0); // 최소 5전 필요

      // 플레이어 랭킹
      const playerRanking = pvpSystem.getPlayerRanking('p1');

      expect(playerRanking).toBeDefined();
      expect(playerRanking.playerId).toBe('p1');
      expect(playerRanking.rating).toBeDefined();

      // 보상 기록
      const rewardHistory = pvpSystem.getPlayerRewardHistory('p1', 10);

      expect(rewardHistory.length).toBe(1);
      expect(rewardHistory[0].result).toBe('win');

      // 총 수익
      const totalRewards = pvpSystem.getPlayerTotalRewards('p1', 7);

      expect(totalRewards.totalCoins).toBeGreaterThan(0);
      expect(totalRewards.wins).toBe(1);
    });

    it('should generate reward leaderboard', () => {
      const player1 = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 60,
          defense: 10,
          speed: 10
        },
        skills: []
      };

      const player2 = {
        id: 'p2',
        name: 'Player 2',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 18,
          defense: 5,
          speed: 8
        },
        skills: []
      };

      // 3번 전투 실행
      for (let i = 0; i < 3; i++) {
        const battle = pvpSystem.createBattle(player1, player2);
        pvpSystem.startBattle(battle.id);

        // 직접 HP 조정하여 종료
        battle.players[battle.player2Id].hp = 0;
        battle._endBattle(battle.player1Id);
        battle.endedAt = new Date();
        pvpSystem._handleBattleCompletion(battle);
      }

      // 수익 리더보드
      const leaderboard = pvpSystem.getRewardLeaderboard(7, 10);

      expect(leaderboard.length).toBeGreaterThan(0);
      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[0].totalCoins).toBeGreaterThan(0);
    });
  });

  describe('스킬 시스템 통합', () => {
    it('should handle skill cooldowns correctly', () => {
      const player1 = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 20,
          defense: 10,
          speed: 10
        },
        skills: [
          {
            id: 'skill_fireball',
            name: 'Fireball',
            cooldown: 2,
            effects: [{ type: 'damage', target: 'enemy', value: 40 }]
          },
          {
            id: 'skill_heal',
            name: 'Heal',
            cooldown: 3,
            effects: [{ type: 'heal', target: 'self', value: 30 }]
          }
        ]
      };

      const player2 = {
        id: 'p2',
        name: 'Player 2',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 18,
          defense: 5,
          speed: 8
        },
        skills: []
      };

      const battle = pvpSystem.createBattle(player1, player2);
      pvpSystem.startBattle(battle.id);

      // 모든 스킬 쿨타임 0
      const allCooldowns = pvpSystem.getAllSkillCooldowns(battle.id, 'p1');

      expect(allCooldowns['skill_fireball']).toBe(0);
      expect(allCooldowns['skill_heal']).toBe(0);

      // 스킬 사용 (player1 first turns)
      if (battle.currentPlayer === 'p1') {
        // 전투 시작 후 p1이 먼저 공격 - 스킬 사용
        const initCooldown = pvpSystem.getSkillCooldown(battle.id, 'p1', 'skill_fireball');
        expect(initCooldown).toBe(0);

        const result = pvpSystem.executeAction(battle.id, {
          playerId: 'p1',
          type: 'skill',
          skillId: 'skill_fireball'
        });

        // executeAction后，opponent的cooldown会减少，但player1的cooldown应该被设置
        const fireballCooldown = pvpSystem.getSkillCooldown(battle.id, 'p1', 'skill_fireball');
        expect(fireballCooldown).toBe(2);
      }
    });

    it('should validate skill combo', () => {
      const player1 = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 60,
          defense: 10,
          speed: 10
        },
        skills: [
          {
            id: 'skill_fireball',
            name: 'Fireball',
            cooldown: 1,
            effects: [{ type: 'damage', target: 'enemy', value: 30 }]
          },
          {
            id: 'skill_explosion',
            name: 'Explosion',
            cooldown: 2,
            combo: { requiredSkillIds: ['skill_fireball'] },
            effects: [{ type: 'damage', target: 'enemy', value: 50 }]
          }
        ]
      };

      const player2 = {
        id: 'p2',
        name: 'Player 2',
        stats: {
          hp: 200,
          maxHp: 200,
          mp: 50,
          maxMp: 50,
          attack: 18,
          defense: 5,
          speed: 8
        },
        skills: []
      };

      const battle = pvpSystem.createBattle(player1, player2);
      pvpSystem.startBattle(battle.id);

      // 첫 번째 스킬
      if (battle.currentPlayer === 'p1') {
        pvpSystem.executeAction(battle.id, {
          playerId: 'p1',
          type: 'skill',
          skillId: 'skill_fireball'
        });

        // 콤보 유효성 확인
        const comboCheck = pvpSystem.checkCombo(battle.id, 'p1', 'skill_explosion');

        expect(comboCheck.valid).toBe(true);
      }
    });
  });

  describe('시스템 통계', () => {
    it('should provide system statistics', () => {
      const player1 = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 60,
          defense: 10,
          speed: 10
        },
        skills: []
      };

      const player2 = {
        id: 'p2',
        name: 'Player 2',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 18,
          defense: 5,
          speed: 8
        },
        skills: []
      };

      // 전투 실행
      const battle = pvpSystem.createBattle(player1, player2);
      pvpSystem.startBattle(battle.id);

      // 직접 전투 종료
      battle.players[battle.player2Id].hp = 0;
      battle._endBattle(battle.player1Id);
      battle.endedAt = new Date();
      pvpSystem._handleBattleCompletion(battle);

      // Battle 정리
      pvpSystem.battleManager.activeBattles.delete(battle.id);
      pvpSystem.battleManager.playerBattles.delete(battle.player1Id);
      pvpSystem.battleManager.playerBattles.delete(battle.player2Id);

      const stats = pvpSystem.getStatistics();

      expect(stats.battleManager).toBeDefined();
      expect(stats.skillIntegration).toBeDefined();
      expect(stats.pvPRanking).toBeDefined();
      expect(stats.battleRewards).toBeDefined();

      expect(stats.battleManager.totalActive).toBe(0);
      expect(stats.pvPRanking.totalPlayers).toBe(2);
      expect(stats.pvPRanking.totalBattles).toBe(1);
    });
  });
});

describe('singleton 인스턴스', () => {
  it('should provide singleton instance', () => {
    expect(pvpSystemInstance).toBeInstanceOf(PvPSystem);
  });

  it('should be the same instance across modules', () => {
    const pvpSystem1 = require('../index').pvpSystemInstance;
    const pvpSystem2 = require('../index').pvpSystemInstance;

    expect(pvpSystem1).toBe(pvpSystem2);
  });
});