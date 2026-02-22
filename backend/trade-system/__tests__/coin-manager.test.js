/**
 * CoinManager Tests
 * Phase 10: 거래 시스템 - 코인 시스템 테스트
 */

import CoinManager from '../CoinManager.js';

class MockRedis {
  constructor() {
    this.data = new Map();
    this.lists = new Map();
  }

  async get(key) {
    return this.data.get(key) || null;
  }

  async set(key, value) {
    this.data.set(key, String(value));
  }

  async setex(key, seconds, value) {
    this.data.set(key, String(value));
  }

  async incrby(key, amount) {
    const current = parseInt(this.data.get(key) || '0', 10);
    const newValue = current + amount;
    this.data.set(key, String(newValue));
    return newValue;
  }

  async lpush(key, value) {
    if (!this.lists.has(key)) {
      this.lists.set(key, []);
    }
    this.lists.get(key).unshift(value);
    return this.lists.get(key).length;
  }

  async ltrim(key, start, end) {
    if (this.lists.has(key)) {
      const list = this.lists.get(key);
      this.lists.set(key, list.slice(0, end + 1));
    }
  }

  async lrange(key, start, end) {
    if (!this.lists.has(key)) {
      return [];
    }
    const list = this.lists.get(key);
    return list.slice(0, end + 1);
  }

  async exists(key) {
    return this.data.has(key) ? 1 : 0;
  }

  async keys(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.data.keys()).filter(key => regex.test(key));
  }

  async del(key) {
    this.data.delete(key);
    this.lists.delete(key);
  }

  async eval(script, numKeys, ...args) {
    // 간단한 Lua script 시뮬레이션
    if (script.includes('INCRBY')) {
      const fromKey = args[0];
      const toKey = args[1];
      const amount = parseInt(args[2], 10);

      const fromBalance = parseInt(this.data.get(fromKey) || '0', 10);

      if (fromBalance < amount) {
        return 0;
      }

      this.data.set(fromKey, String(fromBalance - amount));
      const toBalance = parseInt(this.data.get(toKey) || '0', 10);
      this.data.set(toKey, String(toBalance + amount));

      return 1;
    }

    return 0;
  }

  clear() {
    this.data.clear();
    this.lists.clear();
  }
}

describe('CoinManager', () => {
  let coinManager;
  let mockRedis;

  beforeEach(() => {
    mockRedis = new MockRedis();
    coinManager = new CoinManager(mockRedis);
  });

  afterEach(() => {
    mockRedis.clear();
  });

  describe('getUserCoins', () => {
    test('should return 0 for new user', async () => {
      const coins = await coinManager.getUserCoins('user1');
      expect(coins).toBe(0);
    });

    test('should return balance for existing user', async () => {
      await mockRedis.set('coins:user1', 500);
      const coins = await coinManager.getUserCoins('user1');
      expect(coins).toBe(500);
    });
  });

  describe('addCoins', () => {
    test('should add coins to user', async () => {
      const balance = await coinManager.addCoins('user1', 100, 'test');
      expect(balance).toBe(100);
    });

    test('should accumulate coins', async () => {
      await coinManager.addCoins('user1', 100, 'test');
      const balance = await coinManager.addCoins('user1', 200, 'test');
      expect(balance).toBe(300);
    });

    test('should reject negative amount', async () => {
      await expect(
        coinManager.addCoins('user1', -10, 'test')
      ).rejects.toThrow('0보다 커야 합니다');
    });

    test('should reject zero amount', async () => {
      await expect(
        coinManager.addCoins('user1', 0, 'test')
      ).rejects.toThrow('0보다 커야 합니다');
    });
  });

  describe('removeCoins', () => {
    test('should remove coins from user', async () => {
      await coinManager.addCoins('user1', 500, 'test');
      const balance = await coinManager.removeCoins('user1', 100, 'test');
      expect(balance).toBe(400);
    });

    test('should reject when insufficient coins', async () => {
      await expect(
        coinManager.removeCoins('user1', 100, 'test')
      ).rejects.toThrow('코인이 부족합니다');
    });

    test('should reject negative amount', async () => {
      await expect(
        coinManager.removeCoins('user1', -10, 'test')
      ).rejects.toThrow('0보다 커야 합니다');
    });
  });

  describe('transferCoins', () => {
    beforeEach(async () => {
      await coinManager.addCoins('user1', 500, 'test');
    });

    test('should transfer coins between users', async () => {
      const result = await coinManager.transferCoins('user1', 'user2', 200, 'transfer');
      expect(result.success).toBe(true);
      expect(result.fromBalance).toBe(300);
      expect(result.toBalance).toBe(200);
    });

    test('should reject self transfer', async () => {
      await expect(
        coinManager.transferCoins('user1', 'user1', 100, 'transfer')
      ).rejects.toThrow('자신에게 코인을 전송할 수 없습니다');
    });

    test('should reject insufficient coins', async () => {
      await expect(
        coinManager.transferCoins('user1', 'user2', 600, 'transfer')
      ).rejects.toThrow('코인이 부족합니다');
    });

    test('should reject negative amount', async () => {
      await expect(
        coinManager.transferCoins('user1', 'user2', -100, 'transfer')
      ).rejects.toThrow('0보다 커야 합니다');
    });
  });

  describe('initializeCoins', () => {
    test('should initialize coins for new user', async () => {
      const balance = await coinManager.initializeCoins('user1', 1000);
      expect(balance).toBe(1000);
    });

    test('should not overwrite existing coins', async () => {
      await coinManager.addCoins('user1', 500, 'test');
      const balance = await coinManager.initializeCoins('user1', 1000);
      expect(balance).toBe(500);
    });
  });

  describe('getCoinHistory', () => {
    test('should return empty history for new user', async () => {
      const history = await coinManager.getCoinHistory('user1');
      expect(history).toEqual([]);
    });

    test('should record add transactions', async () => {
      await coinManager.addCoins('user1', 100, 'test');
      const history = await coinManager.getCoinHistory('user1');
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('add');
      expect(history[0].amount).toBe(100);
    });

    test('should record remove transactions', async () => {
      await coinManager.addCoins('user1', 500, 'test');
      await coinManager.removeCoins('user1', 100, 'test');
      const history = await coinManager.getCoinHistory('user1', 2);
      expect(history).toHaveLength(2);
      expect(history[0].type).toBe('remove');
      expect(history[1].type).toBe('add');
    });

    test('should limit history entries', async () => {
      for (let i = 0; i < 200; i++) {
        await coinManager.addCoins('user1', 1, 'test');
      }
      const history = await coinManager.getCoinHistory('user1', 1000);
      expect(history.length).toBeLessThanOrEqual(100);
    });
  });

  describe('getCoinStats', () => {
    test('should return zero stats for new user', async () => {
      const stats = await coinManager.getCoinStats('user1');
      expect(stats.currentBalance).toBe(0);
      expect(stats.totalEarned).toBe(0);
      expect(stats.totalSpent).toBe(0);
      expect(stats.transactionCount).toBe(0);
    });

    test('should calculate correct stats', async () => {
      await coinManager.addCoins('user1', 500, 'earn');
      await coinManager.removeCoins('user1', 100, 'spend');
      await coinManager.addCoins('user1', 200, 'earn');

      const stats = await coinManager.getCoinStats('user1');
      expect(stats.currentBalance).toBe(600);
      expect(stats.totalEarned).toBe(700);
      expect(stats.totalSpent).toBe(100);
      expect(stats.transactionCount).toBe(3);
    });
  });

  describe('getCoinRanking', () => {
    test('should return empty ranking when no users', async () => {
      const ranking = await coinManager.getCoinRanking(10);
      expect(ranking).toEqual([]);
    });

    test('should return correct ranking', async () => {
      await coinManager.addCoins('user1', 100, 'test');
      await coinManager.addCoins('user2', 500, 'test');
      await coinManager.addCoins('user3', 300, 'test');

      const ranking = await coinManager.getCoinRanking(10);
      expect(ranking).toHaveLength(3);
      expect(ranking[0].userId).toBe('user2');
      expect(ranking[0].coins).toBe(500);
      expect(ranking[1].userId).toBe('user3');
      expect(ranking[1].coins).toBe(300);
      expect(ranking[2].userId).toBe('user1');
      expect(ranking[2].coins).toBe(100);
    });

    test('should limit ranking entries', async () => {
      for (let i = 1; i <= 20; i++) {
        await coinManager.addCoins(`user${i}`, i * 100, 'test');
      }

      const ranking = await coinManager.getCoinRanking(5);
      expect(ranking).toHaveLength(5);
    });
  });

  describe('clearUserData', () => {
    test('should clear user coins and history', async () => {
      await coinManager.addCoins('user1', 500, 'test');
      await coinManager.removeCoins('user1', 100, 'test');

      await coinManager.clearUserData('user1');

      const coins = await coinManager.getUserCoins('user1');
      const history = await coinManager.getCoinHistory('user1');

      expect(coins).toBe(0);
      expect(history).toEqual([]);
    });
  });
});