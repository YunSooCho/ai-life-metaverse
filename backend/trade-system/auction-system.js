import { TradeIdGenerator } from './trade-id-generator.js';

/**
 * AuctionSystem - 경매장 시스템
 *
 * 기능:
 * - 아이템 등록
 * - 입찰 시스템
 * - 경매 종료 및 낙찰
 * - 수수료 시스템
 */
export class AuctionSystem {
  constructor() {
    this.idGenerator = new TradeIdGenerator();
    this.activeAuctions = new Map(); // auctionId -> auction data
    this.completedAuctions = new Map(); // auctionId -> auction data
    this.playerAuctions = new Map(); // characterId -> auctions[]
    this.feeRate = 0.05; // 수수료율 5%
  }

  /**
   * 수수료율 설정
   */
  setFeeRate(rate) {
    this.feeRate = Math.max(0, Math.min(1, rate));
    return {
      success: true,
      feeRate: this.feeRate
    };
  }

  /**
   * 아이템 경매 등록
   */
  registerAuction(characterId, characterName, itemId, itemName, quantity, startingPrice, durationMinutes = 1440) {
    const auctionId = this.idGenerator.generateAuctionId();

    const auction = {
      auctionId,
      sellerCharacterId: characterId,
      sellerCharacterName: characterName,
      itemId,
      itemName,
      quantity,
      startingPrice,
      currentBid: startingPrice,
      currentBidderId: null,
      currentBidderName: null,
      bids: [],
      status: 'active', // active, cancelled, completed
      createdAt: Date.now(),
      expiresAt: Date.now() + durationMinutes * 60 * 1000,
      feeRate: this.feeRate
    };

    this.activeAuctions.set(auctionId, auction);

    // 플레이어 경매 기록 추가
    this.addPlayerAuction(characterId, auction);

    return {
      success: true,
      auctionId,
      auction
    };
  }

  /**
   * 입찰
   */
  placeBid(auctionId, characterId, characterName, bidAmount) {
    const auction = this.activeAuctions.get(auctionId);

    if (!auction) {
      return {
        success: false,
        error: 'Auction not found'
      };
    }

    if (auction.status !== 'active') {
      return {
        success: false,
        error: 'Auction is not active'
      };
    }

    if (characterId === auction.sellerCharacterId) {
      return {
        success: false,
        error: 'Seller cannot bid on their own auction'
      };
    }

    if (bidAmount <= auction.currentBid) {
      return {
        success: false,
        error: 'Bid must be higher than current bid'
      };
    }

    const bidId = this.idGenerator.generateBidId();

    const bid = {
      bidId,
      auctionId,
      characterId,
      characterName,
      amount: bidAmount,
      timestamp: Date.now()
    };

    // 입찰 기록
    auction.bids.push(bid);

    // 최고 입찰 업데이트
    auction.currentBid = bidAmount;
    auction.currentBidderId = characterId;
    auction.currentBidderName = characterName;

    return {
      success: true,
      bid,
      auction
    };
  }

  /**
   * 경매 취소 (판매자만 가능)
   */
  cancelAuction(auctionId, characterId) {
    const auction = this.activeAuctions.get(auctionId);

    if (!auction) {
      return {
        success: false,
        error: 'Auction not found'
      };
    }

    if (auction.status !== 'active') {
      return {
        success: false,
        error: 'Auction is not active'
      };
    }

    if (characterId !== auction.sellerCharacterId) {
      return {
        success: false,
        error: 'Only seller can cancel the auction'
      };
    }

    // 입찰이 있는 경우 취소 불가
    if (auction.bids.length > 0) {
      return {
        success: false,
        error: 'Cannot cancel auction with bids'
      };
    }

    auction.status = 'cancelled';
    auction.cancelledAt = Date.now();

    // 활성 경매에서 제거
    this.activeAuctions.delete(auctionId);
    this.completedAuctions.set(auctionId, auction);

    return {
      success: true,
      auction
    };
  }

  /**
   * 경매장 낙찰 (자동 호출)
   */
  completeAuction(auctionId) {
    const auction = this.activeAuctions.get(auctionId);

    if (!auction) {
      return {
        success: false,
        error: 'Auction not found'
      };
    }

    if (auction.status !== 'active') {
      return {
        success: false,
        error: 'Auction is not active'
      };
    }

    // 낙찰 정보 계산
    const result = {
      auctionId,
      sellerCharacterId: auction.sellerCharacterId,
      itemId: auction.itemId,
      itemName: auction.itemName,
      quantity: auction.quantity,
      startingPrice: auction.startingPrice,
      finalBid: auction.currentBid,
      hasBidder: auction.currentBidderId !== null,
      bidderCharacterId: auction.currentBidderId,
      bidderCharacterName: auction.currentBidderName,
      // 수수료 계산
      feeRate: auction.feeRate,
      feeAmount: Math.floor(auction.currentBid * auction.feeRate),
      sellerReceive: Math.floor(auction.currentBid * (1 - auction.feeRate))
    };

    auction.status = 'completed';
    auction.completedAt = Date.now();
    auction.result = result;

    // 활성 경매에서 제거
    this.activeAuctions.delete(auctionId);
    this.completedAuctions.set(auctionId, auction);

    return {
      success: true,
      auction,
      result
    };
  }

  /**
   * 만료된 경매 처리
   */
  processExpiredAuctions() {
    const now = Date.now();
    const completed = [];

    for (const [auctionId, auction] of this.activeAuctions) {
      if (auction.expiresAt < now && auction.status === 'active') {
        const result = this.completeAuction(auctionId);
        if (result.success) {
          completed.push(result);
        }
      }
    }

    return completed;
  }

  /**
   * 플레이어 경매 기록 추가
   */
  addPlayerAuction(characterId, auction) {
    if (!this.playerAuctions.has(characterId)) {
      this.playerAuctions.set(characterId, []);
    }

    const auctions = this.playerAuctions.get(characterId);
    auctions.push(auction);

    // 최대 50개 기록 유지
    if (auctions.length > 50) {
      auctions.shift();
    }
  }

  /**
   * 플레이어 경매 기록 조회
   */
  getPlayerAuctions(characterId, limit = 20) {
    const auctions = this.playerAuctions.get(characterId) || [];

    return auctions
      .sort((a, b) => b.expiresAt - a.expiresAt)
      .slice(0, limit);
  }

  /**
   * 활성 경매 목록 조회
   */
  getActiveAuctions(limit = 50) {
    const auctions = Array.from(this.activeAuctions.values());

    return auctions
      .sort((a, b) => a.expiresAt - b.expiresAt)
      .slice(0, limit);
  }

  /**
   * 완료된 경매 목록 조회
   */
  getCompletedAuctions(limit = 20) {
    const auctions = Array.from(this.completedAuctions.values());

    return auctions
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, limit);
  }

  /**
   * 특정 경매 조회
   */
  getAuction(auctionId) {
    return this.activeAuctions.get(auctionId) || this.completedAuctions.get(auctionId);
  }

  /**
   * 시스템 통계
   */
  getSystemStats() {
    const activeCount = this.activeAuctions.size;
    const completedCount = this.completedAuctions.size;

    let totalTradeValue = 0;
    let totalFeeCollected = 0;

    for (const auction of this.completedAuctions.values()) {
      if (auction.result) {
        totalTradeValue += auction.result.finalBid;
        totalFeeCollected += auction.result.feeAmount;
      }
    }

    return {
      activeAuctions: activeCount,
      completedAuctions: completedCount,
      totalTradeValue,
      totalFeeCollected,
      feeRate: this.feeRate
    };
  }
}

export default AuctionSystem;