/**
 * TradeManager Tests
 * Phase 10: 거래 시스템 - 거래 시스템 테스트
 */

import TradeManager from '../TradeManager.js';

class MockRedis {
  constructor() {
    this.data = new Map();
  }

  async setex(key, seconds, value) {
    this.data.set(key, value);
  }

  async get(key) {
    return this.data.get(key) || null;
  }

  async del(key) {
    this.data.delete(key);
  }

  async lpush(key, value) {
    if (!this.data.has(key)) {
      this.data.set(key, []);
    }
    const list = this.data.get(key);
    list.unshift(value);
  }

  async ltrim(key, start, end) {
    if (this.data.has(key)) {
      const list = this.data.get(key);
      this.data.set(key, list.slice(0, end + 1));
    }
  }

  async lrange(key, start, end) {
    if (!this.data.has(key)) {
      return [];
    }
    const list = this.data.get(key);
    return list.slice(0, end + 1);
  }

  clear() {
    this.data.clear();
  }
}

describe('TradeManager', () => {
  let tradeManager;
  let mockRedis;

  beforeEach(() => {
    mockRedis = new MockRedis();
    tradeManager = new TradeManager(mockRedis);
  });

  afterEach(() => {
    tradeManager.clearAllTrades();
    mockRedis.clear();
  });

  describe('createTradeRequest', () => {
    test('should create trade request', async () => {
      const trade = await tradeManager.createTradeRequest(
        'user1',
        'user2',
        { items: ['item1'], coins: 0 },
        { items: ['item2'], coins: 0 }
      );

      expect(trade.traderId).toBe('user1');
      expect(trade.targetId).toBe('user2');
      expect(trade.status).toBe('pending');
      expect(trade.offer.items).toEqual(['item1']);
      expect(trade.request.items).toEqual(['item2']);
    });

    test('should create trade with empty offer/request', async () => {
      const trade = await tradeManager.createTradeRequest('user1', 'user2');

      expect(trade.offer.items).toEqual([]);
      expect(trade.offer.coins).toBe(0);
      expect(trade.request.items).toEqual([]);
      expect(trade.request.coins).toBe(0);
    });

    test('should create trade with coins', async () => {
      const trade = await tradeManager.createTradeRequest(
        'user1',
        'user2',
        { items: [], coins: 100 },
        { items: [], coins: 50 }
      );

      expect(trade.offer.coins).toBe(100);
      expect(trade.request.coins).toBe(50);
    });

    test('should save to Redis', async () => {
      await tradeManager.createTradeRequest('user1', 'user2');
      expect(tradeManager.activeTrades.size).toBeGreaterThan(0);
    });
  });

  describe('acceptTrade', () => {
    test('should accept trade request', async () => {
      const trade = await tradeManager.createTradeRequest('user1', 'user2');
      const accepted = await tradeManager.acceptTrade(trade.tradeId, 'user2');

      expect(accepted.status).toBe('accepted');
    });

    test('should reject accept from non-target', async () => {
      const trade = await tradeManager.createTradeRequest('user1', 'user2');

      await expect(
        tradeManager.acceptTrade(trade.tradeId, 'user3')
      ).rejects.toThrow('거래를 수락할 권한이 없습니다');
    });

    test('should reject accept of non-existent trade', async () => {
      await expect(
        tradeManager.acceptTrade('nonexistent', 'user2')
      ).rejects.toThrow('거래를 찾을 수 없습니다');
    });

    test('should reject accept of completed trade', async () => {
      const trade = await tradeManager.createTradeRequest('user1', 'user2');
      await tradeManager.acceptTrade(trade.tradeId, 'user2');
      await tradeManager.completeTrade(trade.tradeId, 'user2');

      await expect(
        tradeManager.acceptTrade(trade.tradeId, 'user2')
      ).rejects.toThrow('이미 완료된 거래입니다');
    });
  });

  describe('rejectTrade', () => {
    test('should reject trade request', async () => {
      const trade = await tradeManager.createTradeRequest('user1', 'user2');
      const rejected = await tradeManager.rejectTrade(trade.tradeId, 'user2');

      expect(rejected.status).toBe('rejected');
      expect(tradeManager.getTrade(trade.tradeId)).toBeNull();
    });

    test('should reject reject from non-target', async () => {
      const trade = await tradeManager.createTradeRequest('user1', 'user2');

      await expect(
        tradeManager.rejectTrade(trade.tradeId, 'user3')
      ).rejects.toThrow('거래를 거절할 권한이 없습니다');
    });
  });

  describe('cancelTrade', () => {
    test('should cancel trade as trader', async () => {
      const trade = await tradeManager.createTradeRequest('user1', 'user2');
      const cancelled = await tradeManager.cancelTrade(trade.tradeId, 'user1');

      expect(cancelled.status).toBe('cancelled');
      expect(tradeManager.getTrade(trade.tradeId)).toBeNull();
    });

    test('should cancel trade as target', async () => {
      const trade = await tradeManager.createTradeRequest('user1', 'user2');
      const cancelled = await tradeManager.cancelTrade(trade.tradeId, 'user2');

      expect(cancelled.status).toBe('cancelled');
    });

    test('should reject cancel from non-participant', async () => {
      const trade = await tradeManager.createTradeRequest('user1', 'user2');

      await expect(
        tradeManager.cancelTrade(trade.tradeId, 'user3')
      ).rejects.toThrow('거래를 취소할 권한이 없습니다');
    });

    test('should reject cancel of completed trade', async () => {
      const trade = await tradeManager.createTradeRequest('user1', 'user2');
      await tradeManager.acceptTrade(trade.tradeId, 'user2');
      await tradeManager.completeTrade(trade.tradeId, 'user2');

      await expect(
        tradeManager.cancelTrade(trade.tradeId, 'user2')
      ).rejects.toThrow('완료된 거래는 취소할 수 없습니다');
    });
  });

  describe('completeTrade', () => {
    test('should complete trade', async () => {
      const trade = await tradeManager.createTradeRequest('user1', 'user2');
      await tradeManager.acceptTrade(trade.tradeId, 'user2');
      const completed = await tradeManager.completeTrade(trade.tradeId, 'user2');

      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toBeDefined();
    });

    test('should reject complete from non-participant', async () => {
      const trade = await tradeManager.createTradeRequest('user1', 'user2');
      await tradeManager.acceptTrade(trade.tradeId, 'user2');

      await expect(
        tradeManager.completeTrade(trade.tradeId, 'user3')
      ).rejects.toThrow('거래를 완료할 권한이 없습니다');
    });

    test('should reject complete of pending trade', async () => {
      const trade = await tradeManager.createTradeRequest('user1', 'user2');

      await expect(
        tradeManager.completeTrade(trade.tradeId, 'user2')
      ).rejects.toThrow('수락되지 않은 거래입니다');
    });
  });

  describe('getTradeHistory', () => {
    test('should return empty history for new user', async () => {
      const history = await tradeManager.getTradeHistory('user1');
      expect(history).toEqual([]);
    });

    test('should record completed trades', async () => {
      const trade = await tradeManager.createTradeRequest('user1', 'user2');
      await tradeManager.acceptTrade(trade.tradeId, 'user2');
      await tradeManager.completeTrade(trade.tradeId, 'user2');

      const history1 = await tradeManager.getTradeHistory('user1');
      const history2 = await tradeManager.getTradeHistory('user2');

      expect(history1).toHaveLength(1);
      expect(history2).toHaveLength(1);
      expect(history1[0].tradeId).toBe(trade.tradeId);
    });

    test('should limit history entries', async () => {
      for (let i = 0; i < 50; i++) {
        const trade = await tradeManager.createTradeRequest('user1', 'user2');
        await tradeManager.acceptTrade(trade.tradeId, 'user2');
        await tradeManager.completeTrade(trade.tradeId, 'user2');
      }

      const history = await tradeManager.getTradeHistory('user1', 10);
      expect(history.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getUserTrades', () => {
    test('should return user trades as trader', async () => {
      await tradeManager.createTradeRequest('user1', 'user2');
      await tradeManager.createTradeRequest('user1', 'user3');

      const trades = tradeManager.getUserTrades('user1');
      expect(trades).toHaveLength(2);
    });

    test('should return user trades as target', async () => {
      await tradeManager.createTradeRequest('user2', 'user1');
      await tradeManager.createTradeRequest('user3', 'user1');

      const trades = tradeManager.getUserTrades('user1');
      expect(trades).toHaveLength(2);
    });

    test('should return mixed trades', async () => {
      await tradeManager.createTradeRequest('user1', 'user2');
      await tradeManager.createTradeRequest('user3', 'user1');

      const trades = tradeManager.getUserTrades('user1');
      expect(trades).toHaveLength(2);
    });

    test('should exclude unrelated trades', async () => {
      await tradeManager.createTradeRequest('user1', 'user2');
      await tradeManager.createTradeRequest('user3', 'user4');

      const trades = tradeManager.getUserTrades('user1');
      expect(trades).toHaveLength(1);
    });
  });

  describe('generateTradeId', () => {
    test('should generate unique trade IDs', () => {
      const id1 = tradeManager.generateTradeId();
      const id2 = tradeManager.generateTradeId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^trade_\d+_[a-z0-9]+$/);
    });
  });
});