/**
 * PvPRanking 테스트
 */

import { PvPRanking, BattleRecord, PlayerPvPStats, BattleResult } from '../pvp-ranking.js';

describe('PvPRanking', () => {
  let pvPRanking;

  beforeEach(() => {
    pvPRanking = new PvPRanking();
  });

  describe('getOrCreatePlayerStats', () => {
    it('should create player stats if not exists', () => {
      const player = { id: 'p1', name: 'Player 1' };

      const stats = pvPRanking.getOrCreatePlayerStats(player);

      expect(stats.playerId).toBe('p1');
      expect(stats.playerName).toBe('Player 1');
      expect(stats.totalBattles).toBe(0);
      expect(stats.wins).toBe(0);
      expect(stats.losses).toBe(0);
      expect(stats.rating).toBe(1000);
    });

    it('should return existing player stats', () => {
      const player = { id: 'p1', name: 'Player 1' };

      pvPRanking.getOrCreatePlayerStats(player);
      const stats = pvPRanking.getOrCreatePlayerStats(player);

      expect(stats).toBeDefined();
      expect(stats.playerId).toBe('p1');
    });
  });

  describe('recordBattle', () => {
    it('should record a battle result', () => {
      const battle = {
        id: 'battle_1',
        winner: 'p1',
        loser: 'p2',
        players: {
          p1: { name: 'Player 1', stats: {} },
          p2: { name: 'Player 2', stats: {} }
        },
        endedAt: new Date()
      };

      const result = pvPRanking.recordBattle(battle);

      expect(result.newWinnerRating).toBeGreaterThan(1000);
      expect(result.newLoserRating).toBeLessThan(1000);
    });

    it('should calculate rating changes correctly', () => {
      const battle = {
        id: 'battle_1',
        winner: 'p1',
        loser: 'p2',
        players: {
          p1: { name: 'Player 1', stats: {} },
          p2: { name: 'Player 2', stats: {} }
        },
        endedAt: new Date()
      };

      const result = pvPRanking.recordBattle(battle);

      expect(result.winnerChange).toBeGreaterThan(0);
      expect(result.loserChange).toBeLessThan(0);
    });
  });

  describe('getRanking', () => {
    beforeEach(() => {
      // 테스트 플레이어 추가
      const players = [
        { id: 'p1', name: 'Player 1' },
        { id: 'p2', name: 'Player 2' },
        { id: 'p3', name: 'Player 3' }
      ];

      players.forEach(pvPRanking.getOrCreatePlayerStats.bind(pvPRanking));

      // 전투 결과 기록 (각 플레이어 5전 이상)
      const battles = [
        // p1 승리
        { id: 'battle_1', winner: 'p1', loser: 'p2', players: { p1: { name: 'Player 1', stats: {} }, p2: { name: 'Player 2', stats: {} } }, endedAt: new Date() },
        { id: 'battle_2', winner: 'p1', loser: 'p3', players: { p1: { name: 'Player 1', stats: {} }, p3: { name: 'Player 3', stats: {} } }, endedAt: new Date() },
        { id: 'battle_3', winner: 'p1', loser: 'p2', players: { p1: { name: 'Player 1', stats: {} }, p2: { name: 'Player 2', stats: {} } }, endedAt: new Date() },
        { id: 'battle_4', winner: 'p1', loser: 'p3', players: { p1: { name: 'Player 1', stats: {} }, p3: { name: 'Player 3', stats: {} } }, endedAt: new Date() },
        { id: 'battle_5', winner: 'p1', loser: 'p2', players: { p1: { name: 'Player 1', stats: {} }, p2: { name: 'Player 2', stats: {} } }, endedAt: new Date() },
        // p2 승리
        { id: 'battle_6', winner: 'p2', loser: 'p3', players: { p2: { name: 'Player 2', stats: {} }, p3: { name: 'Player 3', stats: {} } }, endedAt: new Date() },
        { id: 'battle_7', winner: 'p2', loser: 'p3', players: { p2: { name: 'Player 2', stats: {} }, p3: { name: 'Player 3', stats: {} } }, endedAt: new Date() },
        // p3 승리
        { id: 'battle_8', winner: 'p3', loser: 'p1', players: { p3: { name: 'Player 3', stats: {} }, p1: { name: 'Player 1', stats: {} } }, endedAt: new Date() }
      ];

      battles.forEach(battle => pvPRanking.recordBattle(battle));
    });

    it('should return ranking list', () => {
      const ranking = pvPRanking.getRanking();

      expect(ranking.length).toBeGreaterThan(0);
      expect(ranking[0].rank).toBe(1);
    });

    it('should filter players with minimum battles', () => {
      const newPlayer = { id: 'p4', name: 'Player 4' };
      pvPRanking.getOrCreatePlayerStats(newPlayer);

      const ranking = pvPRanking.getRanking();

      // p4는 전투가 없어서 제외되어야 함
      expect(ranking.find(p => p.playerId === 'p4')).toBeUndefined();
    });

    it('should sort by rating descending', () => {
      const ranking = pvPRanking.getRanking();

      for (let i = 1; i < ranking.length; i++) {
        expect(ranking[i - 1].rating).toBeGreaterThanOrEqual(ranking[i].rating);
      }
    });
  });

  describe('getPlayerRanking', () => {
    it('should return player ranking', () => {
      const player = { id: 'p1', name: 'Player 1' };
      pvPRanking.getOrCreatePlayerStats(player);

      const battle = {
        id: 'battle_1', winner: 'p1', loser: 'p2',
        players: { p1: { name: 'Player 1', stats: {} }, p2: { name: 'Player 2', stats: {} } },
        endedAt: new Date()
      };
      pvPRanking.recordBattle(battle);

      const ranking = pvPRanking.getPlayerRanking('p1');

      expect(ranking).toBeDefined();
      expect(ranking.playerId).toBe('p1');
      expect(ranking.rank).toBeDefined();
    });

    it('should return null for non-existent player', () => {
      const ranking = pvPRanking.getPlayerRanking('p999');

      expect(ranking).toBeNull();
    });
  });

  describe('getPlayerRecentBattles', () => {
    it('should return recent battles', () => {
      const player = { id: 'p1', name: 'Player 1' };
      pvPRanking.getOrCreatePlayerStats(player);

      const battle1 = {
        id: 'battle_1', winner: 'p1', loser: 'p2',
        players: { p1: { name: 'Player 1', stats: {} }, p2: { name: 'Player 2', stats: {} } },
        endedAt: new Date()
      };
      const battle2 = {
        id: 'battle_2', winner: 'p2', loser: 'p1',
        players: { p2: { name: 'Player 2', stats: {} }, p1: { name: 'Player 1', stats: {} } },
        endedAt: new Date()
      };

      pvPRanking.recordBattle(battle1);
      pvPRanking.recordBattle(battle2);

      const recentBattles = pvPRanking.getPlayerRecentBattles('p1', 10);

      expect(recentBattles.length).toBe(2);
    });
  });
});

describe('PlayerPvPStats', () => {
  let stats;

  beforeEach(() => {
    stats = new PlayerPvPStats('p1', 'Player 1');
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(stats.playerId).toBe('p1');
      expect(stats.playerName).toBe('Player 1');
      expect(stats.totalBattles).toBe(0);
      expect(stats.wins).toBe(0);
      expect(stats.losses).toBe(0);
      expect(stats.rating).toBe(1000);
      expect(stats.winStreak).toBe(0);
    });
  });

  describe('addWin', () => {
    it('should add a win', () => {
      stats.addWin(20);

      expect(stats.totalBattles).toBe(1);
      expect(stats.wins).toBe(1);
      expect(stats.winStreak).toBe(1);
      expect(stats.rating).toBe(1020);
    });

    it('should update max win streak', () => {
      stats.addWin(10);
      stats.addWin(10);
      stats.addWin(10);

      expect(stats.maxWinStreak).toBe(3);
    });
  });

  describe('addLose', () => {
    it('should add a loss', () => {
      stats.addLose(-15);

      expect(stats.totalBattles).toBe(1);
      expect(stats.losses).toBe(1);
      expect(stats.winStreak).toBe(0);
      expect(stats.rating).toBe(985);
    });

    it('should prevent rating from going below 0', () => {
      stats.rating = 10;
      stats.addLose(-50);

      expect(stats.rating).toBe(0);
    });
  });

  describe('addDraw', () => {
    it('should add a draw', () => {
      stats.addDraw();

      expect(stats.totalBattles).toBe(1);
      expect(stats.draws).toBe(1);
      expect(stats.winStreak).toBe(0);
    });
  });

  describe('getWinRate', () => {
    it('should calculate win rate', () => {
      stats.addWin(10);
      stats.addLose(-5);
      stats.addWin(10);

      const winRate = stats.getWinRate();

      expect(winRate).toBeCloseTo(66.67, 2);
    });

    it('should return 0 for no battles', () => {
      const winRate = stats.getWinRate();

      expect(winRate).toBe(0);
    });
  });

  describe('addBattleRecord', () => {
    it('should add battle record', () => {
      const record = new BattleRecord('battle_1', 'p1', 'p2', new Date());
      stats.addBattleRecord(record);

      expect(stats.battleRecords.length).toBe(1);
    });

    it('should limit battle records to 100', () => {
      for (let i = 0; i < 150; i++) {
        const record = new BattleRecord(`battle_${i}`, 'p1', 'p2', new Date());
        stats.addBattleRecord(record);
      }

      expect(stats.battleRecords.length).toBe(100);
    });
  });
});

describe('BattleRecord', () => {
  it('should create a battle record', () => {
    const record = new BattleRecord('battle_1', 'p1', 'p2', new Date());

    expect(record.id).toBeDefined();
    expect(record.battleId).toBe('battle_1');
    expect(record.winnerId).toBe('p1');
    expect(record.loserId).toBe('p2');
  });
});