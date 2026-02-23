/**
 * BattleRewards - 전투 보상 시스템
 *
 * 기능:
 * - 승리 보상 (코인, 경험치)
 * - 패배 보상 (경험치만)
 * - 연승 보너스
 */

/**
 * 보상 설정
 */
const RewardConfig = {
  BASE_COIN_REWARD: 50, // 기본 코인 보상
  BASE_EXP_REWARD: 20, // 기본 경험치 보상
  LOSE_EXP_REWARD: 5, // 패배 시 경험치 보상
  WIN_STREAK_THRESHOLD: 3, // 연승 보너스 적용 기준
  WIN_STREAK_BONUS_MULTIPLIER: 1.2, // 연승 보너스 배율
  MAX_WIN_STREAK_BONUS: 3.0 // 최대 연승 보너스 (3배)
};

/**
 * 보상 결과
 */
class RewardResult {
  constructor(playerId, rewards) {
    this.playerId = playerId;
    this.playerName = rewards.playerName;
    this.result = rewards.result; // 'win', 'lose', 'draw'
    this.coins = rewards.coins || 0;
    this.exp = rewards.exp || 0;
    this.winStreak = rewards.winStreak || 0;
    this.winStreakBonus = rewards.winStreakBonus || false;
    this.bonusMultiplier = rewards.bonusMultiplier || 1.0;
    // 자동 계산: rewards에 totalCoins/totalExp가 있으면 사용, 없으면 기본값에 bonusMultiplier 적용
    this.totalCoins = rewards.totalCoins !== undefined ? rewards.totalCoins : Math.floor(this.coins * this.bonusMultiplier);
    this.totalExp = rewards.totalExp !== undefined ? rewards.totalExp : Math.floor(this.exp * this.bonusMultiplier);
    this.receivedAt = new Date();
  }

  /**
   * 보상 요약
   */
  toSummary() {
    return {
      playerId: this.playerId,
      playerName: this.playerName,
      result: this.result,
      coins: this.totalCoins,
      exp: this.totalExp,
      winStreak: this.winStreak,
      winStreakBonus: this.winStreakBonus
    };
  }
}

/**
 * BattleRewards 클래스
 */
class BattleRewards {
  constructor() {
    this.rewardHistory = new Map(); // playerId -> RewardResult[]
  }

  /**
   * 전투 보상 계산
   */
  calculateRewards(battle) {
    const winnerId = battle.winner;
    const loserId = winnerId === battle.player1Id ? battle.player2Id : battle.player1Id;

    const winner = battle.players[winnerId];
    const loser = battle.players[loserId];

    if (!winner || !loser) {
      console.log('Battle debug info:');
      console.log('Battle.winner:', battle.winner);
      console.log('Battle.player1Id:', battle.player1Id);
      console.log('Battle.player2Id:', battle.player2Id);
      console.log('Battle.players keys:', Object.keys(battle.players));
      console.log('Winner ID:', winnerId);
      console.log('Loser ID:', loserId);
      console.log('Winner found:', !!winner);
      console.log('Loser found:', !!loser);
      throw new Error(`Player not found in battle data. Winner: ${winnerId}, Loser: ${loserId}, Available players: ${Object.keys(battle.players).join(', ')}`);
    }

    const winnerRewards = this._calculateWinRewards(winner, winnerId, battle);
    const loserRewards = this._calculateLoseRewards(loser, loserId, battle);

    return {
      winner: winnerRewards,
      loser: loserRewards
    };
  }

  /**
   * 승리 보상 계산
   */
  _calculateWinRewards(player, playerId, battle) {
    const winStreak = this._getPlayerWinStreak(playerId);
    const bonusMultiplier = this._calculateWinStreakMultiplier(winStreak);

    const baseCoins = RewardConfig.BASE_COIN_REWARD;
    const baseExp = RewardConfig.BASE_EXP_REWARD;

    const totalCoins = Math.floor(baseCoins * bonusMultiplier);
    const totalExp = Math.floor(baseExp * bonusMultiplier);

    const reward = {
      playerId,
      playerName: player.name,
      result: 'win',
      coins: baseCoins,
      exp: baseExp,
      winStreak,
      winStreakBonus: winStreak >= RewardConfig.WIN_STREAK_THRESHOLD,
      bonusMultiplier,
      totalCoins,
      totalExp
    };

    return new RewardResult(playerId, reward);
  }

  /**
   * 패배 보상 계산
   */
  _calculateLoseRewards(player, playerId, battle) {
    // 패배 시 코인 보상 없음, 경험치만 지급
    const exp = RewardConfig.LOSE_EXP_REWARD;

    const reward = {
      playerId,
      playerName: player.name,
      result: 'lose',
      coins: 0,
      exp,
      winStreak: 0, // 패배 시 연승 리셋
      winStreakBonus: false,
      bonusMultiplier: 1.0,
      totalExp: exp
    };

    return new RewardResult(playerId, reward);
  }

  /**
   * 플레이어 연승 가져오기
   */
  _getPlayerWinStreak(playerId) {
    // 외부 랭킹 시스템에서 가져와야 함
    // 일단은 로컬에서 추적
    const history = this.rewardHistory.get(playerId) || [];

    // 최근 10전 내의 연승 계산
    let winStreak = 0;

    // 최근부터 역순으로 확인
    for (let i = history.length - 1; i >= Math.max(0, history.length - 10); i--) {
      const reward = history[i];

      if (reward.result === 'win') {
        winStreak++;
      } else {
        break;
      }
    }

    return winStreak;
  }

  /**
   * 연승 배율 계산
   */
  _calculateWinStreakMultiplier(winStreak) {
    if (winStreak < RewardConfig.WIN_STREAK_THRESHOLD) {
      return 1.0;
    }

    const exponentialBonus = 1.0 + (winStreak - RewardConfig.WIN_STREAK_THRESHOLD) * 0.2;
    return Math.min(exponentialBonus, RewardConfig.MAX_WIN_STREAK_BONUS);
  }

  /**
   * 보상 지급 기록
   */
  recordReward(rewardResult) {
    const history = this.rewardHistory.get(rewardResult.playerId) || [];
    history.push(rewardResult);

    // 최근 100개만 보관
    if (history.length > 100) {
      history.shift();
    }

    this.rewardHistory.set(rewardResult.playerId, history);
  }

  /**
   * 전투 완료 후 보상 지급
   */
  distributeRewards(battle) {
    const rewards = this.calculateRewards(battle);

    // 보상 기록
    this.recordReward(rewards.winner);
    this.recordReward(rewards.loser);

    return rewards;
  }

  /**
   * 플레이어 총 수익 가져오기
   */
  getPlayerTotalRewards(playerId, days = 7) {
    const history = this.rewardHistory.get(playerId) || [];
    const now = Date.now();
    const cutoff = now - (days * 24 * 60 * 60 * 1000);

    const recentRewards = history.filter(r => {
      return r.receivedAt.getTime() >= cutoff;
    });

    const totalCoins = recentRewards.reduce((sum, r) => sum + r.totalCoins, 0);
    const totalExp = recentRewards.reduce((sum, r) => sum + r.totalExp, 0);
    const wins = recentRewards.filter(r => r.result === 'win').length;
    const losses = recentRewards.filter(r => r.result === 'lose').length;

    return {
      playerId,
      period: `${days} days`,
      totalCoins,
      totalExp,
      wins,
      losses,
      winRate: wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0,
      battleCount: recentRewards.length
    };
  }

  /**
   * 보상 기록 가져오기
   */
  getPlayerRewardHistory(playerId, limit = 10) {
    const history = this.rewardHistory.get(playerId) || [];

    return history
      .slice(-limit)
      .map(r => r.toSummary());
  }

  /**
   * 리더보드 (수익 기반)
   */
  getRewardLeaderboard(days = 7, limit = 50) {
    const now = Date.now();
    const cutoff = now - (days * 24 * 60 * 60 * 1000);

    const playerStats = [];

    this.rewardHistory.forEach((history, playerId) => {
      const recentRewards = history.filter(r => r.receivedAt.getTime() >= cutoff);

      if (recentRewards.length === 0) {
        return;
      }

      const totalCoins = recentRewards.reduce((sum, r) => sum + r.totalCoins, 0);
      const totalExp = recentRewards.reduce((sum, r) => sum + r.totalExp, 0);
      const wins = recentRewards.filter(r => r.result === 'win').length;

      const playerName = recentRewards[recentRewards.length - 1].playerName;

      playerStats.push({
        playerId,
        playerName,
        totalCoins,
        totalExp,
        wins,
        battleCount: recentRewards.length,
        winRate: recentRewards.length > 0 ? (wins / recentRewards.length) * 100 : 0
      });
    });

    // 코인 내림차순 정렬
    const leaderboard = playerStats
      .sort((a, b) => b.totalCoins - a.totalCoins)
      .slice(0, limit);

    return leaderboard.map((player, index) => ({
      rank: index + 1,
      ...player
    }));
  }

  /**
   * 통계 가져오기
   */
  getStatistics() {
    const allRewards = Array.from(this.rewardHistory.values()).flat();

    const totalRewards = {
      coins: allRewards.reduce((sum, r) => sum + r.totalCoins, 0),
      exp: allRewards.reduce((sum, r) => sum + r.totalExp, 0)
    };

    const totalWins = allRewards.filter(r => r.result === 'win').length;
    const totalLoses = allRewards.filter(r => r.result === 'lose').length;
    const winStreakBonuses = allRewards.filter(r => r.winStreakBonus).length;

    return {
      totalRewards,
      totalDistributions: allRewards.length,
      totalWins,
      totalLoses,
      totalPlayersWithHistory: this.rewardHistory.size,
      winStreakBonusesAwarded: winStreakBonuses
    };
  }

  /**
   * 플레이어 기록 삭제
   */
  clearPlayerHistory(playerId) {
    this.rewardHistory.delete(playerId);
  }

  /**
   * 모든 기록 삭제
   */
  clearAllHistory() {
    this.rewardHistory.clear();
  }
}

export {
  BattleRewards,
  RewardResult,
  RewardConfig
};