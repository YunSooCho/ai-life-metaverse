import { describe, it, expect, beforeEach } from 'vitest';
import { TradeSystem } from '../index.js';

describe('TradeSystem (통합 테스트)', () => {
  let tradeSystem;

  beforeEach(() => {
    tradeSystem = new TradeSystem();
    tradeSystem.initialize();
  });

  describe('시스템 초기화', () => {
    it('시스템 초기화 성공', () => {
      const stats = tradeSystem.getSystemStats();

      expect(stats.initialized).toBe(true);
      expect(tradeSystem.tradeManager).toBeDefined();
      expect(tradeSystem.shopSystem).toBeDefined();
      expect(tradeSystem.auctionSystem).toBeDefined();
    });

    it('상점 기본 아이템 등록', () => {
      const shopItems = tradeSystem.shopSystem.getShopList();
      expect(shopItems.length).toBeGreaterThan(0);
      expect(shopItems[0].name).toBeDefined();
    });
  });

  describe('거래 관리 통합', () => {
    it('거래 요청 → 수락 → 아이템 설정 → 완료', () => {
      // 1. 거래 요청
      const request = tradeSystem.tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      expect(request.success).toBe(true);

      // 2. 거래 수락
      const trade = tradeSystem.tradeManager.acceptRequest(request.requestId);
      expect(trade.success).toBe(true);
      expect(trade.tradeId).toBeDefined();

      // 3. 아이템 설정
      tradeSystem.tradeManager.setTradeItems(
        trade.tradeId,
        'char1',
        [{ id: 'sword', name: '검', quantity: 1 }],
        0
      );
      tradeSystem.tradeManager.setTradeItems(
        trade.tradeId,
        'char2',
        [],
        500
      );

      // 4. 거래 확정
      const result1 = tradeSystem.tradeManager.confirmTradeItem(trade.tradeId, 'char1');
      expect(result1.success).toBe(true);
      expect(result1.completed).toBe(false);

      const result2 = tradeSystem.tradeManager.confirmTradeItem(trade.tradeId, 'char2');
      expect(result2.success).toBe(true);
      expect(result2.completed).toBe(true);

      // 5. 거래 기록 확인
      const history = tradeSystem.tradeManager.getTradeHistory('char1');
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].tradeId).toBe(trade.tradeId);
    });
  });

  describe('상점 시스템 통합', () => {
    it('아이템 구매 → 판매 → 기록 확인', () => {
      // 1. 아이템 구매
      const inventoryBuy = [{ id: 'coin', name: '코인', quantity: 100 }];
      const buyResult = tradeSystem.shopSystem.buyItem('char1', 'healthPotion', 1, inventoryBuy);
      expect(buyResult.success).toBe(true);

      // 2. 아이템 판매
      const inventorySell = [
        { id: 'coin', name: '코인', quantity: 0 },
        { id: 'healthPotion', name: '체력 포션', quantity: 2 }
      ];
      const sellResult = tradeSystem.shopSystem.sellItem('char1', 'healthPotion', 1, inventorySell);
      expect(sellResult.success).toBe(true);

      // 3. 거래 기록 확인
      const transactions = tradeSystem.shopSystem.getPlayerTransactions('char1');
      expect(transactions.length).toBe(2);
      expect(transactions[0].type).toBe('sell');
      expect(transactions[1].type).toBe('buy');
    });

    it('상점 재고 변화 확인', () => {
      const item = tradeSystem.shopSystem.getShopItem('healthPotion');
      const initialStock = item.stock;

      // 아이템 구매
      const inventory = [{ id: 'coin', name: '코인', quantity: 100 }];
      tradeSystem.shopSystem.buyItem('char1', 'healthPotion', 5, inventory);

      const itemAfterBuy = tradeSystem.shopSystem.getShopItem('healthPotion');
      expect(itemAfterBuy.stock).toBe(initialStock - 5);

      // 아이템 판매
      const inventorySell = [
        { id: 'coin', name: '코인', quantity: 0 },
        { id: 'healthPotion', name: '체력 포션', quantity: 3 }
      ];
      tradeSystem.shopSystem.sellItem('char1', 'healthPotion', 3, inventorySell);

      const itemAfterSell = tradeSystem.shopSystem.getShopItem('healthPotion');
      expect(itemAfterSell.stock).toBe(initialStock - 5 + 3);
    });
  });

  describe('경매장 시스템 통합', () => {
    it('경매 등록 → 입찰 → 낙찰', () => {
      // 1. 경매 등록
      const auction = tradeSystem.auctionSystem.registerAuction(
        'seller1',
        'P1',
        'sword',
        '검',
        1,
        1000,
        60
      );
      expect(auction.success).toBe(true);

      // 2. 입찰
      const bid = tradeSystem.auctionSystem.placeBid(auction.auctionId, 'bidder1', 'P2', 1500);
      expect(bid.success).toBe(true);
      expect(bid.auction.currentBid).toBe(1500);

      // 3. 낙찰
      const complete = tradeSystem.auctionSystem.completeAuction(auction.auctionId);
      expect(complete.success).toBe(true);
      expect(complete.result.hasBidder).toBe(true);
      expect(complete.result.feeAmount).toBe(75); // 1500 * 0.05
      expect(complete.result.sellerReceive).toBe(1425); // 1500 * 0.95
    });

    it('경매 입찰 경쟁', () => {
      // 1. 경매 등록
      const auction = tradeSystem.auctionSystem.registerAuction(
        'seller1',
        'P1',
        'sword',
        '검',
        1,
        1000,
        60
      );

      // 2. 첫 번째 입찰
      tradeSystem.auctionSystem.placeBid(auction.auctionId, 'bidder1', 'P2', 1500);
      const auction1 = tradeSystem.auctionSystem.getAuction(auction.auctionId);
      expect(auction1.currentBid).toBe(1500);
      expect(auction1.currentBidderId).toBe('bidder1');

      // 3. 두 번째 입찰
      tradeSystem.auctionSystem.placeBid(auction.auctionId, 'bidder2', 'P3', 2000);
      const auction2 = tradeSystem.auctionSystem.getAuction(auction.auctionId);
      expect(auction2.currentBid).toBe(2000);
      expect(auction2.currentBidderId).toBe('bidder2');

      // 4. 입찰 기록 확인
      expect(auction2.bids.length).toBe(2);
    });

    it('경매 취소 (입찰 없이)', () => {
      // 1. 경매 등록
      const auction = tradeSystem.auctionSystem.registerAuction(
        'seller1',
        'P1',
        'sword',
        '검',
        1,
        1000,
        60
      );

      // 2. 경매 취소
      const cancel = tradeSystem.auctionSystem.cancelAuction(auction.auctionId, 'seller1');
      expect(cancel.success).toBe(true);
      expect(cancel.auction.status).toBe('cancelled');

      // 3. 활성 경매에서 제거됨
      const active = tradeSystem.auctionSystem.getActiveAuctions();
      expect(active.find(a => a.auctionId === auction.auctionId)).toBeUndefined();
    });
  });

  describe('시스템 전체 통계', () => {
    it('전체 시스템 통계 조회', () => {
      // 거래 생성
      const request = tradeSystem.tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      const trade = tradeSystem.tradeManager.acceptRequest(request.requestId);
      tradeSystem.tradeManager.setTradeItems(trade.tradeId, 'char1', [], 200);
      tradeSystem.tradeManager.setTradeItems(trade.tradeId, 'char2', [], 0);
      tradeSystem.tradeManager.confirmTradeItem(trade.tradeId, 'char1');
      tradeSystem.tradeManager.confirmTradeItem(trade.tradeId, 'char2');

      // 상점 거래
      const inventoryBuy = [{ id: 'coin', name: '코인', quantity: 100 }];
      tradeSystem.shopSystem.buyItem('char1', 'healthPotion', 1, inventoryBuy);

      // 경매 등록
      tradeSystem.auctionSystem.registerAuction('seller1', 'P1', 'sword', '검', 1, 1000, 60);

      // 통계 조회
      const stats = tradeSystem.getSystemStats();
      expect(stats.initialized).toBe(true);

      expect(stats.tradeManager.totalTrades).toBeGreaterThan(0);
      expect(stats.shopSystem.totalTransactions).toBeGreaterThan(0);
      expect(stats.auctionSystem.activeAuctions).toBe(1);
    });
  });

  describe('만료된 거래 처리', () => {
    it('만료된 거래 정리', () => {
      // 거래 생성 및 만료
      const request = tradeSystem.tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      request.request.expiresAt = Date.now() - 1000;

      tradeSystem.tradeManager.cleanupExpiredTrades();
      expect(request.request.status).toBe('expired');
    });

    it('만료된 경매 정리', () => {
      // 경매 생성 및 만료
      const auction = tradeSystem.auctionSystem.registerAuction(
        'seller1',
        'P1',
        'sword',
        '검',
        1,
        1000,
        0
      );
      const auctionData = tradeSystem.auctionSystem.getAuction(auction.auctionId);
      auctionData.expiresAt = Date.now() - 1000;

      const completed = tradeSystem.auctionSystem.processExpiredAuctions();
      expect(completed.length).toBeGreaterThan(0);
      expect(completed[0].success).toBe(true);
    });
  });

  describe('시나리오: 완전한 거래 플로우', () => {
    it('상점에서 아이템 구매 → 개인 간 거래 → 경매 등록', () => {
      // 1. 상점에서 아이템 구매
      const inventoryBuy = [{ id: 'coin', name: '코인', quantity: 5000 }];
      tradeSystem.shopSystem.buyItem('char1', 'sword', 1, inventoryBuy);

      // 2. 개인 간 거래
      const request = tradeSystem.tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      const trade = tradeSystem.tradeManager.acceptRequest(request.requestId);
      tradeSystem.tradeManager.setTradeItems(
        trade.tradeId,
        'char1',
        [{ id: 'healthPotion', name: '체력 포션', quantity: 2 }],
        100
      );
      tradeSystem.tradeManager.setTradeItems(
        trade.tradeId,
        'char2',
        [],
        200
      );
      tradeSystem.tradeManager.confirmTradeItem(trade.tradeId, 'char1');
      tradeSystem.tradeManager.confirmTradeItem(trade.tradeId, 'char2');

      // 3. 경매 등록
      const auction = tradeSystem.auctionSystem.registerAuction(
        'char1',
        'P1',
        'sword',
        '검',
        1,
        2000,
        60
      );

      // 4. 입찰
      tradeSystem.auctionSystem.placeBid(auction.auctionId, 'bidder1', 'P3', 2500);

      // 5. 낙찰
      const complete = tradeSystem.auctionSystem.completeAuction(auction.auctionId);
      expect(complete.result.hasBidder).toBe(true);
      expect(complete.result.feeAmount).toBe(125); // 2500 * 0.05

      // 6. 전체 거래 기록 확인
      const tradeHistory = tradeSystem.tradeManager.getTradeHistory('char1');
      const shopTransactions = tradeSystem.shopSystem.getPlayerTransactions('char1');
      const playerAuctions = tradeSystem.auctionSystem.getPlayerAuctions('char1');

      expect(tradeHistory.length).toBeGreaterThan(0);
      expect(shopTransactions.length).toBeGreaterThan(0);
      expect(playerAuctions.length).toBeGreaterThan(0);
    });
  });
});