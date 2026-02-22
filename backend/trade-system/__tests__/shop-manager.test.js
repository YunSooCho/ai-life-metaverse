/**
 * ShopManager Tests
 * Phase 10: 거래 시스템 - 상점 시스템 테스트
 */

import ShopManager from '../ShopManager.js';

class MockRedis {
  constructor() {
    this.data = new Map();
  }

  async get(key) {
    return this.data.get(key) || null;
  }

  async setex(key, seconds, value) {
    this.data.set(key, value);
  }

  clear() {
    this.data.clear();
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

  async getInventory(userId) {
    return this.inventories.get(userId) || [];
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

  async removeFromInventory(userId, itemId, quantity) {
    if (!this.inventories.has(userId)) {
      throw new Error('인벤토리에 아이템이 부족합니다');
    }

    const inventory = this.inventories.get(userId);
    const item = inventory.find(i => i.itemId === itemId);

    if (!item || item.quantity < quantity) {
      throw new Error('인벤토리에 아이템이 부족합니다');
    }

    item.quantity -= quantity;

    if (item.quantity <= 0) {
      const index = inventory.findIndex(i => i.itemId === itemId);
      inventory.splice(index, 1);
    }
  }

  clear() {
    this.coins.clear();
    this.inventories.clear();
  }
}

describe('ShopManager', () => {
  let shopManager;
  let mockRedis;
  let mockUserManager;

  beforeEach(async () => {
    mockRedis = new MockRedis();
    mockUserManager = new MockUserManager();
    shopManager = new ShopManager(mockRedis);
    await shopManager.initialize();
  });

  afterEach(() => {
    shopManager.clearAllShops();
    mockRedis.clear();
    mockUserManager.clear();
  });

  describe('initialize', () => {
    test('should load default shops', async () => {
      await shopManager.initialize();

      const shops = shopManager.getAllShops();
      expect(shops.length).toBeGreaterThan(0);
    });

    test('should load general shop', async () => {
      const shop = shopManager.getShop('general');

      expect(shop).toBeTruthy();
      expect(shop.shopId).toBe('general');
      expect(shop.items.length).toBeGreaterThan(0);
    });
  });

  describe('getShop', () => {
    test('should return shop by id', () => {
      const shop = shopManager.getShop('general');
      expect(shop.shopId).toBe('general');
    });

    test('should return null for non-existent shop', () => {
      const shop = shopManager.getShop('nonexistent');
      expect(shop).toBeNull();
    });
  });

  describe('getAllShops', () => {
    test('should return all shops', () => {
      const shops = shopManager.getAllShops();
      expect(Array.isArray(shops)).toBe(true);
      expect(shops.length).toBeGreaterThan(0);
    });

    test('should include shop basic info only', () => {
      const shops = shopManager.getAllShops();
      const generalShop = shops.find(s => s.shopId === 'general');

      expect(generalShop).toHaveProperty('shopId');
      expect(generalShop).toHaveProperty('name');
      expect(generalShop).toHaveProperty('description');
      expect(generalShop).not.toHaveProperty('items');
    });
  });

  describe('getShopItems', () => {
    test('should return shop items', () => {
      const items = shopManager.getShopItems('general');
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    test('should exclude out of stock items', () => {
      const shop = shopManager.getShop('general');
      shop.items[0].stock = 0;

      const items = shopManager.getShopItems('general');
      const soldOutItem = items.find(i => i.itemId === shop.items[0].itemId);
      expect(soldOutItem).toBeUndefined();
    });

    test('should throw error for non-existent shop', () => {
      expect(() => {
        shopManager.getShopItems('nonexistent');
      }).toThrow('상점을 찾을 수 없습니다');
    });
  });

  describe('buyItem', () => {
    beforeEach(async () => {
      await mockUserManager.addCoins('user1', 1000);
    });

    test('should buy item successfully', async () => {
      const result = await shopManager.buyItem(
        'user1',
        'general',
        'food_apple',
        5,
        mockUserManager
      );

      expect(result.success).toBe(true);
      expect(result.item.itemId).toBe('food_apple');
      expect(result.item.quantity).toBe(5);
      expect(result.item.totalPrice).toBe(50); // 10 * 5
    });

    test('should deduct coins', async () => {
      await shopManager.buyItem('user1', 'general', 'food_apple', 5, mockUserManager);

      const coins = await mockUserManager.getUserCoins('user1');
      expect(coins).toBe(950); // 1000 - 50
    });

    test('should add item to inventory', async () => {
      await shopManager.buyItem('user1', 'general', 'food_apple', 5, mockUserManager);

      const inventory = await mockUserManager.getInventory('user1');
      const item = inventory.find(i => i.itemId === 'food_apple');

      expect(item).toBeTruthy();
      expect(item.quantity).toBe(5);
    });

    test('should reduce shop stock', async () => {
      await shopManager.buyItem('user1', 'general', 'food_apple', 5, mockUserManager);

      const shop = shopManager.getShop('general');
      const item = shop.items.find(i => i.itemId === 'food_apple');

      expect(item.stock).toBe(195); // 200 - 5
    });

    test('should reject when out of stock', async () => {
      const shop = shopManager.getShop('general');
      shop.items[0].stock = 0;

      await expect(
        shopManager.buyItem('user1', 'general', shop.items[0].itemId, 1, mockUserManager)
      ).rejects.toThrow('재고가 부족합니다');
    });

    test('should reject when insufficient coins', async () => {
      await mockUserManager.removeCoins('user1', 960); // 남은 40

      await expect(
        shopManager.buyItem('user1', 'general', 'potion_hp', 1, mockUserManager)
      ).rejects.toThrow('코인이 부족합니다');
    });

    test('should throw error for non-existent shop', async () => {
      await expect(
        shopManager.buyItem('user1', 'nonexistent', 'food_apple', 1, mockUserManager)
      ).rejects.toThrow('상점을 찾을 수 없습니다');
    });

    test('should throw error for non-existent item', async () => {
      await expect(
        shopManager.buyItem('user1', 'general', 'nonexistent', 1, mockUserManager)
      ).rejects.toThrow('아이템을 찾을 수 없습니다');
    });
  });

  describe('sellItem', () => {
    beforeEach(async () => {
      await mockUserManager.addCoins('user1', 0);
      await mockUserManager.addToInventory('user1', 'food_apple', 10);
    });

    test('should sell item successfully', async () => {
      const result = await shopManager.sellItem(
        'user1',
        'general',
        'food_apple',
        5,
        mockUserManager
      );

      expect(result.success).toBe(true);
      expect(result.item.itemId).toBe('food_apple');
      expect(result.item.quantity).toBe(5);
      expect(result.item.totalPrice).toBe(25); // 5 * 5
    });

    test('should add coins', async () => {
      await shopManager.sellItem('user1', 'general', 'food_apple', 5, mockUserManager);

      const coins = await mockUserManager.getUserCoins('user1');
      expect(coins).toBe(25);
    });

    test('should remove item from inventory', async () => {
      await shopManager.sellItem('user1', 'general', 'food_apple', 5, mockUserManager);

      const inventory = await mockUserManager.getInventory('user1');
      const item = inventory.find(i => i.itemId === 'food_apple');

      expect(item).toBeTruthy();
      expect(item.quantity).toBe(5); // 10 - 5
    });

    test('should increase shop stock', async () => {
      await shopManager.sellItem('user1', 'general', 'food_apple', 5, mockUserManager);

      const shop = shopManager.getShop('general');
      const item = shop.items.find(i => i.itemId === 'food_apple');

      expect(item.stock).toBe(205); // 200 + 5
    });

    test('should reject when insufficient inventory', async () => {
      await expect(
        shopManager.sellItem('user1', 'general', 'food_apple', 20, mockUserManager)
      ).rejects.toThrow('인벤토리에 아이템이 부족합니다');
    });

    test('should reject for non-sellable item', async () => {
      await expect(
        shopManager.sellItem('user1', 'general', 'custom_item', 1, mockUserManager)
      ).rejects.toThrow('이 상점에서 판매할 수 없는 아이템입니다');
    });
  });

  describe('addShopItem', () => {
    test('should add new item to shop', () => {
      const item = shopManager.addShopItem('general', {
        itemId: 'custom_item',
        name: '커스텀 아이템',
        buyPrice: 100,
        sellPrice: 50,
        stock: 10
      });

      expect(item.itemId).toBe('custom_item');
      expect(item.name).toBe('커스텀 아이템');

      const shop = shopManager.getShop('general');
      const added = shop.items.find(i => i.itemId === 'custom_item');
      expect(added).toBeTruthy();
    });

    test('should update existing item', () => {
      shopManager.addShopItem('general', {
        itemId: 'food_apple',
        name: '사과 업데이트',
        buyPrice: 100,
        sellPrice: 50,
        stock: 10
      });

      const shop = shopManager.getShop('general');
      const item = shop.items.find(i => i.itemId === 'food_apple');

      expect(item.buyPrice).toBe(100);
      expect(item.sellPrice).toBe(50);
    });
  });

  describe('setStock', () => {
    test('should set stock for item', () => {
      shopManager.setStock('general', 'food_apple', 500);

      const shop = shopManager.getShop('general');
      const item = shop.items.find(i => i.itemId === 'food_apple');

      expect(item.stock).toBe(500);
    });
  });
});