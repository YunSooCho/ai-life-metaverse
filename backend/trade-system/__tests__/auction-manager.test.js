/**
 * AuctionManager Tests
 * Phase 10: 거래 시스템 - 경매장 시스템 테스트
 */

import AuctionManager from '../AuctionManager.js';

class MockRedis {
  constructor() {
    this.data = new Map();
    this.sets = new Map();
  }

  async setex(key, seconds, value) {
    this.data.set(key, value);
  }

  async get(key) {
    return this.data.get(key) || null;
  }

  async del(key) {
    this.data.delete(key);
    this.sets.delete(key);
  }

  async sadd(key, value) {
    if (!this.sets.has(key)) {
      this.sets.set(key, new Set());
    }
    this.sets.get(key).add(value);
  }

  async srem(key, value) {
    if (this.sets.has(key)) {
      this.sets.get(key).delete(value);
    }
  }

  async lpush(key, value) {
    if (!this.data.has(key)) {
      this.data.set(key, []);
    }
    const list = this.data.get(key);
    list.unshift(value);
  }

  async ltrim(key, start, end) {
    if (this.data.has(key) && Array.isArray(this.data.get(key))) {
      const list = this.data.get(key);
      this.data.set(key, list.slice(0, end + 1));
    }
  }

  async lrange(key, start, end) {
    if (!this.data.has(key) || !Array.isArray(this.data.get(key))) {
      return [];
    }
    const list = this.data.get(key);
    return list.slice(0, end + 1);
  }

  clear() {
    this.data.clear();
    this.sets.clear();
  }
}

class MockUserManager {
  constructor() {
    this.coins = new Map();
    this.inventories = new Map();
  }

  async getUserCoins(userId) {
    return this.coins.get(userId) || 0;
  }

  async addCoins(userId, amount) {
    const current = this.coins.get(userId) || 0;
    this.coins.set(userId, current + amount);
  }

  async removeCoins(userId, amount) {
    const current = this.coins.get(userId) || 0;
    if (current < amount) {
      throw new Error('코인이 부족합니다');
    }
    this.coins.set(userId, current - amount);
  }

  async addToInventory(userId, itemId, quantity) {
    if (!this.inventories.has(userId)) {
      this.inventories.set(userId, []);
    }

    const inventory = this.inventories.get(userId);
    const existing = inventory.find(i => i.itemId === itemId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      inventory.push({ itemId, quantity });
    }
  }

  getInventory(userId) {
    return this.inventories.get(userId) || [];
  }

  clear() {
    this.coins.clear();
    this.inventories.clear();
  }
}

describe('AuctionManager', () => {
  let auctionManager;
  let mockRedis;
  let mockUserManager;

  beforeEach(() => {
    mockRedis = new MockRedis();
    mockUserManager = new MockUserManager();
    auctionManager = new AuctionManager(mockRedis, false); // 타이머 비활성화
  });

  afterEach(() => {
    auctionManager.clearAllAuctions();
    mockRedis.clear();
    mockUserManager.clear();
  });

  describe('createAuction', () => {
    test('should create auction', async () => {
      const auction = await auctionManager.createAuction(
        'seller1',
        'item1',
        '아이템 1',
        1,
        100,
        60
      );

      expect(auction.sellerId).toBe('seller1');
      expect(auction.itemId).toBe('item1');
      expect(auction.itemName).toBe('아이템 1');
      expect(auction.startBid).toBe(100);
      expect(auction.currentBid).toBe(100);
      expect(auction.status).toBe('active');
    });

    test('should set expiration time', async () => {
      const auction = await auctionManager.createAuction(
        'seller1',
        'item1',
        '아이템 1',
        1,
        100,
        30
      );

      const endTime = new Date(auction.endTime).getTime();
      const now = Date.now();
      const diff = Math.floor((endTime - now) / 1000 / 60); // 분 단위

      expect(diff).toBe(30);
    });

    test('should generate unique auction ID', async () => {
      const auction1 = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);
      const auction2 = await auctionManager.createAuction('seller2', 'item2', '아이템 2', 1, 200, 60);

      expect(auction1.auctionId).not.toBe(auction2.auctionId);
    });
  });

  describe('placeBid', () => {
    beforeEach(async () => {
      await mockUserManager.addCoins('bidder1', 500);
      await mockUserManager.addCoins('bidder2', 1000);
    });

    afterEach(() => {
      mockUserManager.clear();
    });

    test('should place bid successfully', async () => {
      const auction = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);
      const result = await auctionManager.placeBid(auction.auctionId, 'bidder1', 150, mockUserManager);

      expect(result.currentBid).toBe(150);
      expect(result.currentBidder).toBe('bidder1');
      expect(result.bids).toHaveLength(1);
    });

    test('should replace previous bid winner and return coins', async () => {
      const auction = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);
      await auctionManager.placeBid(auction.auctionId, 'bidder1', 150, mockUserManager);

      const bidder1Coins = await mockUserManager.getUserCoins('bidder1'); // 500 - 150 = 350

      await auctionManager.placeBid(auction.auctionId, 'bidder2', 200, mockUserManager);

      const newBidder1Coins = await mockUserManager.getUserCoins('bidder1'); // 350 + 150 = 500
      expect(newBidder1Coins).toBe(500);
    });

    test('should reject bid from seller', async () => {
      const auction = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);

      await expect(
        auctionManager.placeBid(auction.auctionId, 'seller1', 150, mockUserManager)
      ).rejects.toThrow('자신의 경매에는 입찰할 수 없습니다');
    });

    test('should reject bid lower than current', async () => {
      const auction = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);
      await auctionManager.placeBid(auction.auctionId, 'bidder1', 150, mockUserManager);

      await expect(
        auctionManager.placeBid(auction.auctionId, 'bidder2', 140, mockUserManager)
      ).rejects.toThrow('현재 입찰가보다 높은 금액을 입찰해야 합니다');
    });

    test('should reject bid equal to current', async () => {
      const auction = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);

      await expect(
        auctionManager.placeBid(auction.auctionId, 'bidder1', 100, mockUserManager)
      ).rejects.toThrow('현재 입찰가보다 높은 금액을 입찰해야 합니다');
    });

    test('should reject bid when insufficient coins', async () => {
      const auction = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 400, 60);

      await expect(
        auctionManager.placeBid(auction.auctionId, 'bidder1', 800, mockUserManager)
      ).rejects.toThrow('코인이 부족합니다'); // 최소 입찰가(440) 충족하지만 코인(500) 부족
    });
  });

  describe('completeAuction', () => {
    test('should complete active auction', async () => {
      const auction = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 0.01); // 즉시 완료
      await new Promise(resolve => setTimeout(resolve, 100)); // 타이머 대기

      const result = await auctionManager.completeAuction(auction.auctionId);

      expect(result.status).toBe('completed');
      expect(result.completedAt).toBeDefined();
    });

    test('should return completed auction', async () => {
      const auction = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 0.01);
      await new Promise(resolve => setTimeout(resolve, 100));

      await auctionManager.completeAuction(auction.auctionId);
      const result = await auctionManager.completeAuction(auction.auctionId);

      expect(result.status).toBe('completed');
    });
  });

  describe('cancelAuction', () => {
    afterEach(() => {
      mockUserManager.clear();
    });

    test('should cancel auction as seller', async () => {
      await mockUserManager.addCoins('bidder1', 500);

      const auction = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);
      await auctionManager.placeBid(auction.auctionId, 'bidder1', 150, mockUserManager);

      const result = await auctionManager.cancelAuction(auction.auctionId, 'seller1', mockUserManager);

      expect(result.status).toBe('cancelled');
    });

    test('should return coins to bidder on cancel', async () => {
      await mockUserManager.addCoins('bidder1', 500);
      await mockUserManager.addToInventory('seller1', 'item1', 1);

      const auction = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);
      await auctionManager.placeBid(auction.auctionId, 'bidder1', 150, mockUserManager);

      const bidderCoins = await mockUserManager.getUserCoins('bidder1'); // 500 - 150 = 350

      await auctionManager.cancelAuction(auction.auctionId, 'seller1', mockUserManager);

      const newBidderCoins = await mockUserManager.getUserCoins('bidder1'); // 350 + 150 = 500
      expect(newBidderCoins).toBe(500);

      const sellerInventory = await mockUserManager.getInventory('seller1');
      const sellerItem = sellerInventory.find(i => i.itemId === 'item1');
      expect(sellerItem).toBeTruthy();
    });

    test('should reject cancel from non-seller', async () => {
      const auction = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);

      await expect(
        auctionManager.cancelAuction(auction.auctionId, 'bidder1', mockUserManager)
      ).rejects.toThrow('경매를 취소할 권한이 없습니다');
    });

    test('should reject cancel of completed auction', async () => {
      const auction = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);
      await auctionManager.completeAuction(auction.auctionId);

      await expect(
        auctionManager.cancelAuction(auction.auctionId, 'seller1', mockUserManager)
      ).rejects.toThrow('이미 종료된 경매입니다');
    });
  });

  describe('getActiveAuctions', () => {
    test('should return active auctions', async () => {
      await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);
      await auctionManager.createAuction('seller2', 'item2', '아이템 2', 1, 200, 60);

      const auctions = auctionManager.getActiveAuctions();
      expect(auctions).toHaveLength(2);
    });

    test('should exclude completed auctions', async () => {
      const auction = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);
      await auctionManager.completeAuction(auction.auctionId);

      const auctions = auctionManager.getActiveAuctions();
      const completed = auctions.find(a => a.auctionId === auction.auctionId);
      expect(completed).toBeUndefined();
    });

    test('should exclude cancelled auctions', async () => {
      await mockUserManager.addToInventory('seller1', 'item1', 1);
      const auction = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);
      await auctionManager.cancelAuction(auction.auctionId, 'seller1', mockUserManager);

      const auctions = auctionManager.getActiveAuctions();
      const cancelled = auctions.find(a => a.auctionId === auction.auctionId);
      expect(cancelled).toBeUndefined();
    });
  });

  describe('getUserAuctions', () => {
    test('should return user selling auctions', async () => {
      await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);
      await auctionManager.createAuction('seller1', 'item2', '아이템 2', 1, 200, 60);
      await auctionManager.createAuction('seller2', 'item3', '아이템 3', 1, 300, 60);

      const userAuctions = auctionManager.getUserAuctions('seller1');
      expect(userAuctions.selling).toHaveLength(2);
    });

    test('should return user bidding auctions', async () => {
      await mockUserManager.addCoins('bidder1', 500);
      const auction1 = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);
      const auction2 = await auctionManager.createAuction('seller2', 'item2', '아이템 2', 1, 200, 60);
      const auction3 = await auctionManager.createAuction('seller3', 'item3', '아이템 3', 1, 300, 60);

      await auctionManager.placeBid(auction1.auctionId, 'bidder1', 150, mockUserManager);
      await auctionManager.placeBid(auction2.auctionId, 'bidder1', 250, mockUserManager);

      const userAuctions = auctionManager.getUserAuctions('bidder1');
      expect(userAuctions.bidding).toHaveLength(2);
    });
  });

  describe('calculateFee', () => {
    test('should calculate 5% fee', () => {
      const fee = auctionManager.calculateFee(1000);
      expect(fee).toBe(50);
    });

    test('should calculate correct fee for various amounts', () => {
      expect(auctionManager.calculateFee(100)).toBe(5);
      expect(auctionManager.calculateFee(500)).toBe(25);
      expect(auctionManager.calculateFee(1234)).toBe(61); // Math.floor(1234 * 0.05) = 61.7 -> 61
    });
  });

  describe('getAuctionHistory', () => {
    test('should return empty history for new user', async () => {
      const history = await auctionManager.getAuctionHistory('seller1', 'sell');
      expect(history).toEqual([]);
    });

    test('should record completed auctions', async () => {
      const auction = await auctionManager.createAuction('seller1', 'item1', '아이템 1', 1, 100, 60);
      await auctionManager.completeAuction(auction.auctionId);

      const history = await auctionManager.getAuctionHistory('seller1', 'sell');
      expect(history).toHaveLength(1);
    });

    test('should limit history entries', async () => {
      for (let i = 0; i < 150; i++) {
        const auction = await auctionManager.createAuction('seller1', `item${i}`, `아이템 ${i}`, 1, 100, 60);
        await auctionManager.completeAuction(auction.auctionId);
      }

      const history = await auctionManager.getAuctionHistory('seller1', 'sell', 1000);
      expect(history.length).toBeLessThanOrEqual(100);
    });
  });
});