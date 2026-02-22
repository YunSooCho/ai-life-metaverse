import { describe, it, expect, beforeEach } from 'vitest';
import { ShopSystem } from '../shop-system.js';

describe('ShopSystem', () => {
  let shopSystem;

  beforeEach(() => {
    shopSystem = new ShopSystem();
  });

  describe('상점 아이템 관리', () => {
    it('상점 아이템 추가 성공', () => {
      const result = shopSystem.addShopItem(
        'healthPotion',
        '체력 포션',
        'consumable',
        100,
        50,
        100,
        'HP를 50 회복합니다'
      );

      expect(result.success).toBe(true);
      expect(result.item.itemId).toBe('healthPotion');
      expect(result.item.name).toBe('체력 포션');
      expect(result.item.buyPrice).toBe(100);
      expect(result.item.sellPrice).toBe(50);
      expect(result.item.stock).toBe(100);
    });

    it('상점 아이템 제거 성공', () => {
      shopSystem.addShopItem('healthPotion', '체력 포션', 'consumable', 100, 50, 100);
      const result = shopSystem.removeShopItem('healthPotion');

      expect(result.success).toBe(true);
      expect(shopSystem.getShopItem('healthPotion')).toBeUndefined();
    });

    it('상점 아이템 제거 - 존재하지 않는 아이템', () => {
      const result = shopSystem.removeShopItem('non-existent');
      expect(result.success).toBe(false);
    });

    it('상점 재고 업데이트', () => {
      shopSystem.addShopItem('healthPotion', '체력 포션', 'consumable', 100, 50, 100);
      const result = shopSystem.updateStock('healthPotion', 50);

      expect(result.success).toBe(true);
      expect(result.item.stock).toBe(50);
    });

    it('상점 재고 감소', () => {
      shopSystem.addShopItem('healthPotion', '체력 포션', 'consumable', 100, 50, 100);
      const result = shopSystem.decreaseStock('healthPotion', 10);

      expect(result.success).toBe(true);
      expect(result.item.stock).toBe(90);
    });

    it('상점 재고 감소 - 재고 부족', () => {
      shopSystem.addShopItem('healthPotion', '체력 포션', 'consumable', 100, 50, 5);
      const result = shopSystem.decreaseStock('healthPotion', 10);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient stock');
    });

    it('상점 재고 증가', () => {
      shopSystem.addShopItem('healthPotion', '체력 포션', 'consumable', 100, 50, 100);
      const result = shopSystem.increaseStock('healthPotion', 20);

      expect(result.success).toBe(true);
      expect(result.item.stock).toBe(120);
    });

    it('상점 아이템 조회', () => {
      shopSystem.addShopItem('healthPotion', '체력 포션', 'consumable', 100, 50, 100);
      const item = shopSystem.getShopItem('healthPotion');

      expect(item).toBeDefined();
      expect(item.name).toBe('체력 포션');
    });

    it('상점 전체 목록 조회', () => {
      shopSystem.addShopItem('healthPotion', '체력 포션', 'consumable', 100, 50, 100);
      shopSystem.addShopItem('sword', '검', 'equipment', 1000, 500, 10);

      const list = shopSystem.getShopList();
      expect(list.length).toBe(2);
      expect(list[0].name).toBe('체력 포션');
      expect(list[1].name).toBe('검');
    });
  });

  describe('아이템 구매', () => {
    beforeEach(() => {
      shopSystem.addShopItem('healthPotion', '체력 포션', 'consumable', 100, 50, 100);
      shopSystem.addShopItem('coin', '코인', 'currency', 1, 1, Infinity);
    });

    it('아이템 구매 성공', () => {
      const inventory = [{ id: 'coin', name: '코인', quantity: 100 }];
      const result = shopSystem.buyItem('char1', 'healthPotion', 1, inventory);

      expect(result.success).toBe(true);
      expect(result.totalPrice).toBe(100);
      expect(result.quantity).toBe(1);
      expect(result.itemName).toBe('체력 포션');
    });

    it('아이템 구매 - 존재하지 않는 아이템', () => {
      const inventory = [{ id: 'coin', name: '코인', quantity: 100 }];
      const result = shopSystem.buyItem('char1', 'non-existent', 1, inventory);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Item not found in shop');
    });

    it('아이템 구매 - 재고 부족', () => {
      shopSystem.updateStock('healthPotion', 2);
      const inventory = [{ id: 'coin', name: '코인', quantity: 100 }];
      const result = shopSystem.buyItem('char1', 'healthPotion', 5, inventory);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient stock');
    });

    it('아이템 구매 - 코인 부족', () => {
      const inventory = [{ id: 'coin', name: '코인', quantity: 50 }];
      const result = shopSystem.buyItem('char1', 'healthPotion', 1, inventory);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient coins');
    });

    it('아이템 구매 - 여러 개', () => {
      const inventory = [{ id: 'coin', name: '코인', quantity: 300 }];
      const result = shopSystem.buyItem('char1', 'healthPotion', 3, inventory);

      expect(result.success).toBe(true);
      expect(result.totalPrice).toBe(300);
      expect(result.quantity).toBe(3);
    });

    it('아이템 구매 시 거래 기록 추가', () => {
      const inventory = [{ id: 'coin', name: '코인', quantity: 100 }];
      shopSystem.buyItem('char1', 'healthPotion', 1, inventory);

      const transactions = shopSystem.getPlayerTransactions('char1');
      expect(transactions.length).toBe(1);
      expect(transactions[0].type).toBe('buy');
      expect(transactions[0].itemId).toBe('healthPotion');
    });

    it('아이템 구매 시 재고 감소', () => {
      const inventory = [{ id: 'coin', name: '코인', quantity: 100 }];
      shopSystem.buyItem('char1', 'healthPotion', 3, inventory);

      const item = shopSystem.getShopItem('healthPotion');
      expect(item.stock).toBe(97);
    });
  });

  describe('아이템 판매', () => {
    beforeEach(() => {
      shopSystem.addShopItem('healthPotion', '체력 포션', 'consumable', 100, 50, 100);
      shopSystem.addShopItem('coin', '코인', 'currency', 1, 1, Infinity);
    });

    it('아이템 판매 성공', () => {
      const inventory = [
        { id: 'coin', name: '코인', quantity: 0 },
        { id: 'healthPotion', name: '체력 포션', quantity: 5 }
      ];
      const result = shopSystem.sellItem('char1', 'healthPotion', 2, inventory);

      expect(result.success).toBe(true);
      expect(result.totalPrice).toBe(100);
      expect(result.quantity).toBe(2);
      expect(result.itemName).toBe('체력 포션');
    });

    it('아이템 판매 - 존재하지 않는 아이템', () => {
      const inventory = [
        { id: 'coin', name: '코인', quantity: 0 },
        { id: 'healthPotion', name: '체력 포션', quantity: 5 }
      ];
      const result = shopSystem.sellItem('char1', 'non-existent', 1, inventory);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Item not found in shop');
    });

    it('아이템 판매 - 인벤토리에 아이템 없음', () => {
      const inventory = [
        { id: 'coin', name: '코인', quantity: 0 }
      ];
      const result = shopSystem.sellItem('char1', 'healthPotion', 1, inventory);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient items in inventory');
    });

    it('아이템 판매 - 인벤토리 수량 부족', () => {
      const inventory = [
        { id: 'coin', name: '코인', quantity: 0 },
        { id: 'healthPotion', name: '체력 포션', quantity: 2 }
      ];
      const result = shopSystem.sellItem('char1', 'healthPotion', 5, inventory);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient items in inventory');
    });

    it('아이템 판매 시 거래 기록 추가', () => {
      const inventory = [
        { id: 'coin', name: '코인', quantity: 0 },
        { id: 'healthPotion', name: '체력 포션', quantity: 5 }
      ];
      shopSystem.sellItem('char1', 'healthPotion', 2, inventory);

      const transactions = shopSystem.getPlayerTransactions('char1');
      expect(transactions.length).toBe(1);
      expect(transactions[0].type).toBe('sell');
      expect(transactions[0].itemId).toBe('healthPotion');
    });

    it('아이템 판매 시 재고 증가', () => {
      const inventory = [
        { id: 'coin', name: '코인', quantity: 0 },
        { id: 'healthPotion', name: '체력 포션', quantity: 5 }
      ];
      shopSystem.sellItem('char1', 'healthPotion', 3, inventory);

      const item = shopSystem.getShopItem('healthPotion');
      expect(item.stock).toBe(103);
    });
  });

  describe('거래 기록', () => {
    it('플레이어 거래 기록 조회', () => {
      const inventoryBuy = [{ id: 'coin', name: '코인', quantity: 100 }];
      const inventorySell = [
        { id: 'coin', name: '코인', quantity: 0 },
        { id: 'healthPotion', name: '체력 포션', quantity: 5 }
      ];

      shopSystem.buyItem('char1', 'healthPotion', 1, inventoryBuy);
      shopSystem.sellItem('char1', 'healthPotion', 1, inventorySell);

      const transactions = shopSystem.getPlayerTransactions('char1');
      expect(transactions.length).toBe(2);
    });

    it('플레이어 거래 기록 - 최신순', () => {
      const inventoryBuy = [{ id: 'coin', name: '코인', quantity: 100 }];
      shopSystem.buyItem('char1', 'healthPotion', 1, inventoryBuy);

      // 1초 대기
      const now = Date.now();
      while (Date.now() < now + 10) {} // 최소한의 지연

      shopSystem.buyItem('char1', 'sword', 1, inventoryBuy);

      const transactions = shopSystem.getPlayerTransactions('char1');
      expect(transactions.length).toBe(2);
      // 최신 거래가 먼저 (sword)
      expect(transactions[0].itemId).toBe('sword');
    });

    it('거래 기록 - 최대 개수 제한', () => {
      const inventoryBuy = [{ id: 'coin', name: '코인', quantity: 1000 }];

      for (let i = 0; i < 105; i++) {
        shopSystem.buyItem('char1', 'healthPotion', 1, inventoryBuy);
      }

      const transactions = shopSystem.getPlayerTransactions('char1', 10);
      expect(transactions.length).toBe(10);
    });
  });

  describe('시스템 통계', () => {
    it('시스템 통계 조회', () => {
      shopSystem.addShopItem('healthPotion', '체력 포션', 'consumable', 100, 50, 100);
      shopSystem.addShopItem('sword', '검', 'equipment', 1000, 500, 10);

      const inventoryBuy = [{ id: 'coin', name: '코인', quantity: 1500 }];
      shopSystem.buyItem('char1', 'healthPotion', 1, inventoryBuy);

      const inventorySell = [
        { id: 'coin', name: '코인', quantity: 0 },
        { id: 'healthPotion', name: '체력 포션', quantity: 5 }
      ];
      shopSystem.sellItem('char1', 'healthPotion', 1, inventorySell);

      const stats = shopSystem.getSystemStats();
      expect(stats.shopItems).toBe(2);
      expect(stats.totalTransactions).toBe(2);
      expect(stats.totalBuyValue).toBe(100);
      expect(stats.totalSellValue).toBe(50);
      expect(stats.profit).toBe(50);
    });
  });
});