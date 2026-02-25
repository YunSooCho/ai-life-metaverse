import { describe, it, expect, beforeEach } from 'vitest';
import { AuctionSystem } from '../auction-system.js';

describe('AuctionSystem', () => {
  let auctionSystem;

  beforeEach(() => {
    auctionSystem = new AuctionSystem();
  });

  describe('수수료율 관리', () => {
    it('수수료율 설정', () => {
      const result = auctionSystem.setFeeRate(0.1);

      expect(result.success).toBe(true);
      expect(result.feeRate).toBe(0.1);
    });

    it('수수료율 범위 제한 (0~1)', () => {
      auctionSystem.setFeeRate(2.0); // 초과
      const stats = auctionSystem.getSystemStats();

      expect(stats.feeRate).toBe(1.0); // 최대 1.0

      auctionSystem.setFeeRate(-0.5); // 미달
      const stats2 = auctionSystem.getSystemStats();

      expect(stats2.feeRate).toBe(0.0); // 최소 0.0
    });

    it('기본 수수료율 확인', () => {
      const stats = auctionSystem.getSystemStats();
      expect(stats.feeRate).toBe(0.05); // 기본 5%
    });
  });

  describe('경매 등록', () => {
    it('경매 등록 성공', () => {
      const result = auctionSystem.registerAuction(
        'seller1',
        'P1',
        'sword',
        '검',
        1,
        1000,
        60 // 60분
      );

      expect(result.success).toBe(true);
      expect(result.auctionId).toMatch(/^AUC-\d+-\w+$/);
      expect(result.auction.sellerCharacterId).toBe('seller1');
      expect(result.auction.itemId).toBe('sword');
      expect(result.auction.itemName).toBe('검');
      expect(result.auction.startingPrice).toBe(1000);
      expect(result.auction.currentBid).toBe(1000);
      expect(result.auction.status).toBe('active');
    });

    it('경매 ID 생성 유니크', () => {
      const result1 = auctionSystem.registerAuction('seller1', 'P1', 'sword', '검', 1, 1000, 60);
      const result2 = auctionSystem.registerAuction('seller2', 'P2', 'shield', '방패', 1, 500, 60);

      expect(result1.auctionId).not.toBe(result2.auctionId);
    });

    it('경매 등록 시 플레이어 기록 추가', () => {
      auctionSystem.registerAuction('seller1', 'P1', 'sword', '검', 1, 1000, 60);

      const auctions = auctionSystem.getPlayerAuctions('seller1');
      expect(auctions.length).toBe(1);
      expect(auctions[0].itemName).toBe('검');
    });
  });

  describe('입찰 시스템', () => {
    let auctionId;

    beforeEach(() => {
      const result = auctionSystem.registerAuction('seller1', 'P1', 'sword', '검', 1, 1000, 60);
      auctionId = result.auctionId;
    });

    it('입찰 성공', () => {
      const result = auctionSystem.placeBid(auctionId, 'bidder1', 'P2', 2000);

      expect(result.success).toBe(true);
      expect(result.bid.amount).toBe(2000);
      expect(result.auction.currentBid).toBe(2000);
      expect(result.auction.currentBidderId).toBe('bidder1');
    });

    it('입찰 - 현재 입찰가보다 높아야 함', () => {
      auctionSystem.placeBid(auctionId, 'bidder1', 'P2', 2000);

      const result = auctionSystem.placeBid(auctionId, 'bidder2', 'P3', 1500);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Bid must be higher than current bid');
    });

    it('입찰 - 판매자는 자신 아이템에 입찰 불가', () => {
      const result = auctionSystem.placeBid(auctionId, 'seller1', 'P1', 2000);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Seller cannot bid on their own auction');
    });

    it('입찰 - 존재하지 않는 경매', () => {
      const result = auctionSystem.placeBid('non-existent', 'bidder1', 'P2', 2000);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Auction not found');
    });

    it('입찰 - 완료된 경매 불가', () => {
      auctionSystem.cancelAuction(auctionId, 'seller1');

      const result = auctionSystem.placeBid(auctionId, 'bidder1', 'P2', 2000);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Auction is not active');
    });

    it('입찰 기록 저장', () => {
      auctionSystem.placeBid(auctionId, 'bidder1', 'P2', 2000);
      auctionSystem.placeBid(auctionId, 'bidder2', 'P3', 3000);

      const auction = auctionSystem.getAuction(auctionId);
      expect(auction.bids.length).toBe(2);
      expect(auction.bids[0].amount).toBe(2000);
      expect(auction.bids[1].amount).toBe(3000);
    });
  });

  describe('경매 취소', () => {
    let auctionId;

    beforeEach(() => {
      const result = auctionSystem.registerAuction('seller1', 'P1', 'sword', '검', 1, 1000, 60);
      auctionId = result.auctionId;
    });

    it('경매 취소 성공', () => {
      const result = auctionSystem.cancelAuction(auctionId, 'seller1');

      expect(result.success).toBe(true);
      expect(result.auction.status).toBe('cancelled');
    });

    it('경매 취소 - 판매자만 가능', () => {
      const result = auctionSystem.cancelAuction(auctionId, 'other');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Only seller can cancel the auction');
    });

    it('경매 취소 - 입찰이 있으면 불가', () => {
      auctionSystem.placeBid(auctionId, 'bidder1', 'P2', 2000);

      const result = auctionSystem.cancelAuction(auctionId, 'seller1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot cancel auction with bids');
    });

    it('경매 취소 - 활성 상태만 가능', () => {
      auctionSystem.cancelAuction(auctionId, 'seller1');

      // 이미 취소된 경매 다시 취소 시도
      const result = auctionSystem.cancelAuction(auctionId, 'seller1');
      expect(result.success).toBe(false);
    });
  });

  describe('경매 낙찰', () => {
    let auctionId;

    beforeEach(() => {
      const result = auctionSystem.registerAuction('seller1', 'P1', 'sword', '검', 1, 1000, 60);
      auctionId = result.auctionId;
    });

    it('경매 낙찰 - 낙찰자 없이 종료', () => {
      // 입찰 없이 완료
      const result = auctionSystem.completeAuction(auctionId);

      expect(result.success).toBe(true);
      expect(result.result.hasBidder).toBe(false);
      expect(result.result.finalBid).toBe(1000);
      expect(result.result.sellerReceive).toBe(950); // 1000 * 0.95
      expect(result.result.feeAmount).toBe(50); // 1000 * 0.05
    });

    it('경매 낙찰 - 입찰자 있는 경우', () => {
      auctionSystem.placeBid(auctionId, 'bidder1', 'P2', 2000);

      const result = auctionSystem.completeAuction(auctionId);

      expect(result.success).toBe(true);
      expect(result.result.hasBidder).toBe(true);
      expect(result.result.feeAmount).toBe(100); // 2000 * 0.05
      expect(result.result.sellerReceive).toBe(1900); // 2000 * 0.95
      expect(result.result.bidderCharacterId).toBe('bidder1');
    });

    it('경매 낙찰 - 완료 후 활성 경매에서 제거', () => {
      auctionSystem.completeAuction(auctionId);

      const active = auctionSystem.getActiveAuctions();
      const completed = auctionSystem.getCompletedAuctions();

      expect(active.find(a => a.auctionId === auctionId)).toBeUndefined();
      expect(completed.find(a => a.auctionId === auctionId)).toBeDefined();
    });
  });

  describe('만료된 경매 처리', () => {
    it('만료된 경매 자동 완료', () => {
      const result = auctionSystem.registerAuction('seller1', 'P1', 'sword', '검', 1, 1000, 0); // 0분 = 즉시 만료

      // 만료 시간 조작
      const auction = auctionSystem.getAuction(result.auctionId);
      auction.expiresAt = Date.now() - 1000;

      const completed = auctionSystem.processExpiredAuctions();
      expect(completed.length).toBe(1);
      expect(completed[0].success).toBe(true);
    });

    it('만료되지 않은 경매는 완료되지 않음', () => {
      auctionSystem.registerAuction('seller1', 'P1', 'sword', '검', 1, 1000, 1440);

      const completed = auctionSystem.processExpiredAuctions();
      expect(completed.length).toBe(0);
    });
  });

  describe('경매 조회', () => {
    beforeEach(() => {
      auctionSystem.registerAuction('seller1', 'P1', 'sword', '검', 1, 1000, 60);
      auctionSystem.registerAuction('seller2', 'P2', 'shield', '방패', 1, 500, 60);
    });

    it('활성 경매 목록 조회', () => {
      const active = auctionSystem.getActiveAuctions();
      expect(active.length).toBe(2);
    });

    it('활성 경매 - 종료 시간 오름차순', () => {
      auctionSystem.registerAuction('seller1', 'P1', 'sword', '검', 1, 1000, 30);

      const active = auctionSystem.getActiveAuctions();
      if (active.length >= 2) {
        expect(active[0].expiresAt).toBeLessThanOrEqual(active[1].expiresAt);
      }
    });

    it('완료된 경매 목록 조회', () => {
      const result = auctionSystem.registerAuction('seller1', 'P1', 'sword', '검', 1, 1000, 60);
      auctionSystem.completeAuction(result.auctionId);

      const completed = auctionSystem.getCompletedAuctions();
      expect(completed.length).toBeGreaterThan(0);
    });

    it('특정 경매 조회', () => {
      const result = auctionSystem.registerAuction('seller1', 'P1', 'sword', '검', 1, 1000, 60);
      const auction = auctionSystem.getAuction(result.auctionId);

      expect(auction).toBeDefined();
      expect(auction.itemName).toBe('검');
    });

    it('존재하지 않는 경매 조회', () => {
      const auction = auctionSystem.getAuction('non-existent');
      expect(auction).toBeUndefined();
    });
  });

  describe('시스템 통계', () => {
    it('시스템 통계 조회', () => {
      auctionSystem.registerAuction('seller1', 'P1', 'sword', '검', 1, 1000, 60);

      const stats = auctionSystem.getSystemStats();
      expect(stats.activeAuctions).toBe(1);
      expect(stats.completedAuctions).toBe(0);
      expect(stats.feeRate).toBe(0.05);
    });

    it('시스템 통계 - 완료된 경매 포함', () => {
      const result = auctionSystem.registerAuction('seller1', 'P1', 'sword', '검', 1, 1000, 60);
      auctionSystem.placeBid(result.auctionId, 'bidder1', 'P2', 2000);
      auctionSystem.completeAuction(result.auctionId);

      const stats = auctionSystem.getSystemStats();
      expect(stats.activeAuctions).toBe(0);
      expect(stats.completedAuctions).toBe(1);
      expect(stats.totalTradeValue).toBe(2000);
      expect(stats.totalFeeCollected).toBe(100);
    });
  });
});