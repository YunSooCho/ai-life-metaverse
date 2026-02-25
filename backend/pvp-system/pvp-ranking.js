/**
 * PvPRanking - PvP 랭킹 시스템
 *
 * 기능:
 * - 전투 승패 기록
 * - 승점 계산
 * - 랭킹표
 * 계절별 랭킹
 */

const SEASON_LENGTH_DAYS = 30; // 계절 길이

/**
 * 전투 결과
 */
const BattleResult = {
  WIN: 'win',
  LOSE: 'lose',
  DRAW: 'draw'
};

/**
 * 전투 기록
 */
class BattleRecord {
  constructor(battleId, winnerId, loserId, battleDate) {
    this.id = `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.battleId = battleId;
    this.winnerId = winnerId;
    this.loserId = loserId;
    this.battleDate = battleDate;
    this.season = this._getCurrentSeason();
  }

  _getCurrentSeason() {
    const now = new Date();
    const seasonNumber = Math.floor(now.getTime() / (SEASON_LENGTH_DAYS * 24 * 60 * 60 * 1000));
    return `season_${seasonNumber}`;
  }
}

/**
 * 플레이어 PvP 정보
 */
class PlayerPvPStats {
  constructor(playerId, playerName) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.totalBattles = 0;
    this.wins = 0;
    this.losses = 0;
    this.draws = 0;
    this.rating = 1000; // 초기 레이팅
    this.maxRating = 1000;
    this.winStreak = 0;
    this.maxWinStreak = 0;
    this.battleRecords = [];
    this.seasonRating = 1000;
    this.seasonWins = 0;
    this.seasonLosses = 0;
    this.season = this._getCurrentSeason();
  }

  _getCurrentSeason() {
    const now = new Date();
    const seasonNumber = Math.floor(now.getTime() / (SEASON_LENGTH_DAYS * 24 * 60 * 60 * 1000));
    return `season_${seasonNumber}`;
  }

  /**
   * 현재 계절 확인
   */
  checkSeason() {
    const currentSeason = this._getCurrentSeason();
    if (this.season !== currentSeason) {
      // 계절 리셋
      this.season = currentSeason;
      this.seasonRating = this.rating;
      this.seasonWins = 0;
      this.seasonLosses = 0;
    }
  }

  /**
   * 승리 기록
   */
  addWin(ratingChange) {
    this.totalBattles++;
    this.wins++;
    this.winStreak++;
    this.maxWinStreak = Math.max(this.winStreak, this.maxWinStreak);

    this.rating += ratingChange;
    this.maxRating = Math.max(this.rating, this.maxRating);

    this.seasonWins++;
    this.seasonRating += ratingChange;
  }

  /**
   * 패배 기록
   */
  addLose(ratingChange) {
    this.totalBattles++;
    this.losses++;
    this.winStreak = 0;

    this.rating = Math.max(0, this.rating + ratingChange); // 레이팅 0 미만 방지

    this.seasonLosses++;
    this.seasonRating = Math.max(0, this.seasonRating + ratingChange);
  }

  /**
   * 무승부 기록
   */
  addDraw() {
    this.totalBattles++;
    this.draws++;
    this.winStreak = 0;
  }

  /**
   * 승률 계산
   */
  getWinRate() {
    if (this.totalBattles === 0) {
      return 0;
    }

    return (this.wins / this.totalBattles) * 100;
  }

  /**
   * 전투 기록 추가
   */
  addBattleRecord(battleRecord) {
    this.battleRecords.push(battleRecord);

    // 최근 100개만 보관
    if (this.battleRecords.length > 100) {
      this.battleRecords.shift();
    }
  }

  /**
   * 최근 전역
   */
  getRecentBattles(limit = 10) {
    return this.battleRecords.slice(-limit);
  }
}

/**
 * PvPRanking 클래스
 */
class PvPRanking {
  constructor() {
    this.playerStats = new Map(); // playerId -> PlayerPvPStats
    this.battleRecords = []; // 모든 전투 기록
    this.rankingCache = null;
    this.rankingCacheTime = null;
    this.rankingCacheDuration = 60000; // 1분 캐시
  }

  /**
   * 플레이어 정보 가져오기 또는 생성
   */
  getOrCreatePlayerStats(player) {
    if (!this.playerStats.has(player.id)) {
      this.playerStats.set(player.id, new PlayerPvPStats(player.id, player.name));
    }

    return this.playerStats.get(player.id);
  }

  /**
   * 전투 결과 기록
   */
  recordBattle(battle) {
    const winnerStats = this.getOrCreatePlayerStats({ id: battle.winner, name: battle.players[battle.winner].name });
    const loserStats = this.getOrCreatePlayerStats({ id: battle.loser, name: battle.players[battle.loser].name });

    // 계절 확인
    winnerStats.checkSeason();
    loserStats.checkSeason();

    // 승점 계산 (Elo 시스템)
    const ratingChange = this._calculateRatingChange(winnerStats.rating, loserStats.rating);

    // 승리/패배 기록
    winnerStats.addWin(ratingChange.winner);
    loserStats.addLose(ratingChange.loser);

    // 전투 기록 생성
    const record = new BattleRecord(battle.id, battle.winner, battle.loser, battle.endedAt);

    winnerStats.addBattleRecord(record);
    loserStats.addBattleRecord(record);
    this.battleRecords.push(record);

    // 랭킹 캐시 무효화
    this._invalidateRankingCache();

    return {
      winnerChange: ratingChange.winner,
      loserChange: ratingChange.loser,
      newWinnerRating: winnerStats.rating,
      newLoserRating: loserStats.rating
    };
  }

  /**
   * Elo 승점 계산
   */
  _calculateRatingChange(winnerRating, loserRating) {
    const K = 32; // K-factor

    // 예상 승률
    const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

    // 승점 변화
    const winnerChange = Math.floor(K * (1 - expectedWinner));
    const loserChange = Math.floor(K * (0 - expectedLoser));

    // 최대/최소 제한
    const maxChange = 50;
    const minChange = -50;

    return {
      winner: Math.min(maxChange, Math.max(minChange, winnerChange)),
      loser: Math.min(maxChange, Math.max(minChange, loserChange))
    };
  }

  /**
   * 랭킹 순위표 가져오기
   */
  getRanking(limit = 100, season = false) {
    // 캐시 확인
    if (!season && this._isRankingCacheValid()) {
      return this.rankingCache;
    }

    const players = Array.from(this.playerStats.values())
      .map(stats => ({
        playerId: stats.playerId,
        playerName: stats.playerName,
        rating: season ? stats.seasonRating : stats.rating,
        totalBattles: stats.totalBattles,
        wins: stats.wins,
        losses: stats.losses,
        winRate: stats.getWinRate(),
        winStreak: stats.winStreak,
        maxWinStreak: stats.maxWinStreak
      }))
      .filter(player => player.totalBattles >= 5) // 최소 5전 이상
      .sort((a, b) => {
        // 레이팅 내림차순
        const ratingDiff = b.rating - a.rating;
        if (ratingDiff !== 0) return ratingDiff;

        // 같은 레이팅이면 승률 내림차순
        return b.winRate - a.winRate;
      })
      .slice(0, limit);

    const ranking = players.map((player, index) => ({
      rank: index + 1,
      ...player
    }));

    // 캐시 저장 (계절 랭킹은 캐시하지 않음)
    if (!season) {
      this.rankingCache = ranking;
      this.rankingCacheTime = Date.now();
    }

    return ranking;
  }

  /**
   * 랭킹 캐시 유효성 확인
   */
  _isRankingCacheValid() {
    if (!this.rankingCache || !this.rankingCacheTime) {
      return false;
    }

    return Date.now() - this.rankingCacheTime < this.rankingCacheDuration;
  }

  /**
   * 랭킹 캐시 무효화
   */
  _invalidateRankingCache() {
    this.rankingCache = null;
    this.rankingCacheTime = null;
  }

  /**
   * 플레이어 랭킹 가져오기
   */
  getPlayerRanking(playerId, season = false) {
    const stats = this.playerStats.get(playerId);

    if (!stats) {
      return null;
    }

    const ranking = this.getRanking(1000, season);
    const playerRank = ranking.find(p => p.playerId === playerId);

    return {
      ...stats,
      rank: playerRank ? playerRank.rank : null,
      isSeason: season
    };
  }

  /**
   * 플레이어 최근 전투 가져오기
   */
  getPlayerRecentBattles(playerId, limit = 10) {
    const stats = this.playerStats.get(playerId);

    if (!stats) {
      return [];
    }

    return stats.getRecentBattles(limit);
  }

  /**
   * 계절별 랭킹 표 가져오기 (다른 계절)
   */
  getSeasonRankings(season, limit = 100) {
    const seasonStats = Array.from(this.playerStats.values())
      .filter(stats => stats.battleRecords.some(record => record.season === season))
      .map(stats => {
        const seasonRecords = stats.battleRecords.filter(record => record.season === season);
        const seasonWins = seasonRecords.filter(record => record.winnerId === stats.playerId).length;

        return {
          playerId: stats.playerId,
          playerName: stats.playerName,
          season,
          battles: seasonRecords.length,
          wins: seasonWins,
          losses: seasonRecords.length - seasonWins,
          winRate: seasonRecords.length > 0 ? (seasonWins / seasonRecords.length) * 100 : 0
        };
      })
      .filter(player => player.battles >= 5)
      .sort((a, b) => b.wins - a.wins)
      .slice(0, limit);

    return seasonStats.map((player, index) => ({
      rank: index + 1,
      ...player
    }));
  }

  /**
   * 통계 가져오기
   */
  getStatistics() {
    return {
      totalPlayers: this.playerStats.size,
      totalBattles: this.battleRecords.length,
      currentSeason: this._getCurrentSeason(),
      activePlayers: Array.from(this.playerStats.values())
        .filter(p => p.totalBattles >= 1).length,
      averageRating: this._calculateAverageRating()
    };
  }

  /**
   * 현재 계절
   */
  _getCurrentSeason() {
    const now = new Date();
    const seasonNumber = Math.floor(now.getTime() / (SEASON_LENGTH_DAYS * 24 * 60 * 60 * 1000));
    return `season_${seasonNumber}`;
  }

  /**
   * 평균 레이팅
   */
  _calculateAverageRating() {
    const ratings = Array.from(this.playerStats.values())
      .filter(p => p.totalBattles >= 5)
      .map(p => p.rating);

    if (ratings.length === 0) {
      return 0;
    }

    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }
}

export {
  PvPRanking,
  BattleRecord,
  PlayerPvPStats,
  BattleResult
};