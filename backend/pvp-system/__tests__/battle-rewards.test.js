/**
 * BattleRewards 테스트
 */

import { BattleRewards, RewardResult, RewardConfig } from '../battle-rewards.js';
import { Battle, BattleStatus } from '../battle-manager.js';

describe('BattleRewards', () => {
  let battleRewards;

  beforeEach(() => {
    battleRewards = new BattleRewards();
  });

  describe('calculateRewards', () => {
    let battle;

    beforeEach(() => {
      const player1 = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 30,
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

      battle = new Battle(player1, player2);
      battle.start();

      // p1 승리
      battle.players['p2'].hp = 0;
      battle._endBattle('p1');
      battle.endedAt = new Date();
    });

    it('should calculate rewards for winner and loser', () => {
      const rewards = battleRewards.calculateRewards(battle);

      expect(rewards.winner).toBeDefined();
      expect(rewards.loser).toBeDefined();
      expect(rewards.winner.result).toBe('win');
      expect(rewards.loser.result).toBe('lose');
    });

    it('should give coins and exp to winner', () => {
      const rewards = battleRewards.calculateRewards(battle);

      expect(rewards.winner.totalCoins).toBeGreaterThan(0);
      expect(rewards.winner.totalExp).toBeGreaterThan(0);
    });

    it('should give only exp to loser', () => {
      const rewards = battleRewards.calculateRewards(battle);

      expect(rewards.loser.totalCoins).toBe(0);
      expect(rewards.loser.totalExp).toBeGreaterThan(0);
    });

    it('should apply win streak bonus', () => {
      // 이전 승리 3회 기록 (result만 사용)
      const reward1 = new RewardResult('p1', {
        playerName: 'Player 1',
        result: 'win',
        coins: 50,
        exp: 20,
        winStreak: 0
      });

      const reward2 = new RewardResult('p1', {
        playerName: 'Player 1',
        result: 'win',
        coins: 50,
        exp: 20,
        winStreak: 0
      });

      const reward3 = new RewardResult('p1', {
        playerName: 'Player 1',
        result: 'win',
        coins: 50,
        exp: 20,
        winStreak: 0
      });

      const reward4 = new RewardResult('p1', {
        playerName: 'Player 1',
        result: 'win',
        coins: 50,
        exp: 20,
        winStreak: 0
      });

      battleRewards.recordReward(reward1);
      battleRewards.recordReward(reward2);
      battleRewards.recordReward(reward3);
      battleRewards.recordReward(reward4);

      const currentRewards = battleRewards.calculateRewards(battle);

      expect(currentRewards.winner.winStreakBonus).toBe(true);
      expect(currentRewards.winner.bonusMultiplier).toBeGreaterThan(1.0);
    });
  });

  describe('distributeRewards', () => {
    let battle;

    beforeEach(() => {
      const player1 = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 30,
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

      battle = new Battle(player1, player2);
      battle.start();

      // p1 승리
      battle.players['p2'].hp = 0;
      battle._endBattle('p1');
      battle.endedAt = new Date();
    });

    it('should distribute and record rewards', () => {
      const rewards = battleRewards.distributeRewards(battle);

      expect(rewards.winner).toBeDefined();
      expect(rewards.loser).toBeDefined();

      const winnerHistory = battleRewards.getPlayerRewardHistory('p1', 1);
      const loserHistory = battleRewards.getPlayerRewardHistory('p2', 1);

      expect(winnerHistory.length).toBe(1);
      expect(loserHistory.length).toBe(1);
    });
  });

  describe('getPlayerTotalRewards', () => {
    it('should calculate total rewards for a period', () => {
      const reward1 = new RewardResult('p1', {
        playerName: 'Player 1',
        result: 'win',
        coins: 50,
        exp: 20,
        winStreak: 0,
        winStreakBonus: false
      });

      const reward2 = new RewardResult('p1', {
        playerName: 'Player 1',
        result: 'win',
        coins: 60,
        exp: 24,
        winStreak: 1,
        winStreakBonus: false
      });

      battleRewards.recordReward(reward1);
      battleRewards.recordReward(reward2);

      const totalRewards = battleRewards.getPlayerTotalRewards('p1', 7);

      expect(totalRewards.totalCoins).toBe(110);
      expect(totalRewards.totalExp).toBe(44);
      expect(totalRewards.wins).toBe(2);
      expect(totalRewards.losses).toBe(0);
    });
  });

  describe('getPlayerRewardHistory', () => {
    it('should return reward history', () => {
      const reward = new RewardResult('p1', {
        playerName: 'Player 1',
        result: 'win',
        coins: 50,
        exp: 20,
        winStreak: 0,
        winStreakBonus: false
      });

      battleRewards.recordReward(reward);

      const history = battleRewards.getPlayerRewardHistory('p1', 10);

      expect(history.length).toBe(1);
      expect(history[0].playerId).toBe('p1');
      expect(history[0].result).toBe('win');
    });
  });

  describe('getRewardLeaderboard', () => {
    beforeEach(() => {
      // 여러 플레이어들의 보상 기록
      const rewards = [
        { playerId: 'p1', playerName: 'Player 1', result: 'win', coins: 100, exp: 40 },
        { playerId: 'p1', playerName: 'Player 1', result: 'win', coins: 120, exp: 48 },
        { playerId: 'p2', playerName: 'Player 2', result: 'win', coins: 90, exp: 36 },
        { playerId: 'p3', playerName: 'Player 3', result: 'win', coins: 80, exp: 32 },
        { playerId: 'p2', playerName: 'Player 2', result: 'lose', coins: 0, exp: 5 }
      ];

      rewards.forEach(r => {
        battleRewards.recordReward(new RewardResult(r.playerId, r));
      });
    });

    it('should return leaderboard sorted by total coins', () => {
      const leaderboard = battleRewards.getRewardLeaderboard(7, 10);

      expect(leaderboard.length).toBeGreaterThan(0);
      expect(leaderboard[0].rank).toBe(1);

      // 정렬 확인
      for (let i = 1; i < leaderboard.length; i++) {
        expect(leaderboard[i - 1].totalCoins).toBeGreaterThanOrEqual(leaderboard[i].totalCoins);
      }
    });

    it('should limit leaderboard size', () => {
      const leaderboard = battleRewards.getRewardLeaderboard(7, 2);

      expect(leaderboard.length).toBeLessThanOrEqual(2);
    });
  });

  describe('recordReward', () => {
    it('should record a reward', () => {
      const reward = new RewardResult('p1', {
        playerName: 'Player 1',
        result: 'win',
        coins: 50,
        exp: 20,
        winStreak: 0,
        winStreakBonus: false
      });

      battleRewards.recordReward(reward);

      const history = battleRewards.rewardHistory.get('p1');

      expect(history).toBeDefined();
      expect(history.length).toBe(1);
    });

    it('should limit reward history to 100', () => {
      const limit = 150;

      for (let i = 0; i < limit; i++) {
        const reward = new RewardResult('p1', {
          playerName: 'Player 1',
          result: 'win',
          coins: 50,
          exp: 20,
          winStreak: 0,
          winStreakBonus: false
        });

        battleRewards.recordReward(reward);
      }

      const history = battleRewards.rewardHistory.get('p1');

      expect(history.length).toBe(100);
    });
  });
});

describe('RewardConfig', () => {
  it('should have reward configuration values', () => {
    expect(RewardConfig.BASE_COIN_REWARD).toBeDefined();
    expect(RewardConfig.BASE_EXP_REWARD).toBeDefined();
    expect(RewardConfig.LOSE_EXP_REWARD).toBeDefined();
    expect(RewardConfig.WIN_STREAK_THRESHOLD).toBeDefined();
    expect(RewardConfig.WIN_STREAK_BONUS_MULTIPLIER).toBeDefined();
    expect(RewardConfig.MAX_WIN_STREAK_BONUS).toBeDefined();
  });
});

describe('RewardResult', () => {
  it('should create a reward result', () => {
    const rewards = {
      playerId: 'p1',
      playerName: 'Player 1',
      result: 'win',
      coins: 50,
      exp: 20,
      winStreak: 0,
      winStreakBonus: false
    };

    const result = new RewardResult('p1', rewards);

    expect(result.playerId).toBe('p1');
    expect(result.result).toBe('win');
    expect(result.receivedAt).toBeInstanceOf(Date);
  });

  it('should calculate total coins and exp', () => {
    const rewards = {
      playerId: 'p1',
      playerName: 'Player 1',
      result: 'win',
      coins: 50,
      exp: 20,
      winStreak: 3,
      winStreakBonus: true,
      bonusMultiplier: 1.2
    };

    const result = new RewardResult('p1', rewards);

    expect(result.totalCoins).toBe(60);
    expect(result.totalExp).toBe(24);
  });

  it('should provide summary', () => {
    const rewards = {
      playerId: 'p1',
      playerName: 'Player 1',
      result: 'win',
      coins: 50,
      exp: 20,
      winStreak: 1,
      winStreakBonus: false
    };

    const result = new RewardResult('p1', rewards);
    const summary = result.toSummary();

    expect(summary.playerId).toBe('p1');
    expect(summary.coins).toBe(50);
    expect(summary.exp).toBe(20);
  });
});