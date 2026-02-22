/**
 * AuctionManager - 경매장 시스템 메니저
 * 아이템 경매 등록, 입찰, 낙찰 관리
 */

class AuctionManager {
  constructor(redisClient, enableTimers = true) {
    this.redis = redisClient;
    this.activeAuctions = new Map(); // 메모리에 활성 경매 저장
    this.feeRate = 0.05; // 수수료율 5%
    this.enableTimers = enableTimers; // 타이머 활성화 여부
  }

  /**
   * 경매 등록
   * @param {string} sellerId - 판매자 ID
   * @param {string} itemId - 아이템 ID
   * @param {string} itemName - 아이템 이름
   * @param {number} quantity - 수량
   * @param {number} startBid - 시작 입찰가
   * @param {number} durationMin - 경매 시간 (분)
   * @returns {Object} 경매 객체
   */
  async createAuction(sellerId, itemId, itemName, quantity, startBid, durationMin = 60) {
    const auctionId = this.generateAuctionId();
    const now = Date.now();
    const endTime = now + (durationMin * 60 * 1000);

    const auction = {
      auctionId,
      sellerId,
      itemId,
      itemName,
      quantity,
      startBid,
      currentBid: startBid,
      currentBidder: null,
      bids: [],
      status: 'active', // active, completed, cancelled
      createdAt: new Date(now).toISOString(),
      endTime: new Date(endTime).toISOString(),
      feeRate: this.feeRate
    };

    this.activeAuctions.set(auctionId, auction);

    try {
      await this.redis.setex(
        `auction:${auctionId}`,
        Math.ceil(durationMin * 60 * 2), // 경매 시간 * 2 (여유)
        JSON.stringify(auction)
      );

      // 경매 ID를 활성 경매 목록에 추가
      await this.redis.sadd('active_auctions', auctionId);
    } catch (err) {
      console.warn('Redis save failed:', err);
    }

    // 경매 종료 타이머 설정
    this.setAuctionExpiration(auctionId, durationMin * 60 * 1000);

    return auction;
  }

  /**
   * 입찰
   * @param {string} auctionId - 경매 ID
   * @param {string} bidderId - 입찰자 ID
   * @param {number} amount - 입찰 금액
   * @param {Object} userManager - 사용자 코인 관리 객체
   * @returns {Object} 경매 객체
   */
  async placeBid(auctionId, bidderId, amount, userManager) {
    const auction = this.activeAuctions.get(auctionId);

    if (!auction) {
      throw new Error('경매를 찾을 수 없습니다');
    }

    if (auction.sellerId === bidderId) {
      throw new Error('자신의 경매에는 입찰할 수 없습니다');
    }

    if (auction.status !== 'active') {
      throw new Error('진행 중인 경매가 아닙니다');
    }

    const now = Date.now();
    if (now > new Date(auction.endTime).getTime()) {
      throw new Error('경매가 종료되었습니다');
    }

    if (amount <= auction.currentBid) {
      throw new Error('현재 입찰가보다 높은 금액을 입찰해야 합니다');
    }

    // 최소 입찰가 확인 (10% 이상 높아야 함)
    const minBid = Math.floor(auction.currentBid * 1.1);
    if (amount < minBid) {
      throw new Error(`최소 입찰가는 ${minBid} 코인입니다`);
    }

    // 코인 확인
    const userCoins = await userManager.getUserCoins(bidderId);
    if (userCoins < amount) {
      throw new Error('코인이 부족합니다');
    }

    // 이전 입찰자 코인 반환
    if (auction.currentBidder) {
      await userManager.addCoins(auction.currentBidder, auction.currentBid);
    }

    // 코인 차감 (보증금)
    await userManager.removeCoins(bidderId, amount);

    auction.currentBid = amount;
    auction.currentBidder = bidderId;

    auction.bids.push({
      bidderId,
      amount,
      timestamp: new Date(now).toISOString()
    });

    auction.updatedAt = new Date(now).toISOString();

    try {
      await this.redis.setex(
        `auction:${auctionId}`,
        3600,
        JSON.stringify(auction)
      );
    } catch (err) {
      console.warn('Redis update failed:', err);
    }

    return auction;
  }

  /**
   * 경매 종료 처리
   * @param {string} auctionId - 경매 ID
   * @returns {Object} 경매 결과
   */
  async completeAuction(auctionId) {
    const auction = this.activeAuctions.get(auctionId);

    if (!auction) {
      throw new Error('경매를 찾을 수 없습니다');
    }

    if (auction.status !== 'active') {
      return auction;
    }

    auction.status = 'completed';
    auction.completedAt = new Date().toISOString();

    try {
      await this.redis.del(`auction:${auctionId}`);
      await this.redis.srem('active_auctions', auctionId);
    } catch (err) {
      console.warn('Redis delete failed:', err);
    }

    // 경매 기록 저장
    await this.recordAuctionHistory(auction);

    // 메모리에서는 completed 상태로 유지 (테스트용)
    if (this.enableTimers) {
      this.activeAuctions.delete(auctionId);
    }

    return auction;
  }

  /**
   * 경매 취소
   * @param {string} auctionId - 경매 ID
   * @param {string} userId - 사용자 ID
   * @param {Object} userManager - 사용자 코인/인벤토리 관리
   * @returns {Object} 경매 객체
   */
  async cancelAuction(auctionId, userId, userManager) {
    const auction = this.activeAuctions.get(auctionId);

    if (!auction) {
      throw new Error('경매를 찾을 수 없습니다');
    }

    if (auction.sellerId !== userId) {
      throw new Error('경매를 취소할 권한이 없습니다');
    }

    if (auction.status !== 'active') {
      throw new Error('이미 종료된 경매입니다');
    }

    auction.status = 'cancelled';
    auction.cancelledAt = new Date().toISOString();

    // 현재 입찰자 코인 반환
    if (auction.currentBidder) {
      await userManager.addCoins(auction.currentBidder, auction.currentBid);
    }

    // 판매자에게 아이템 반환
    await userManager.addToInventory(auction.sellerId, auction.itemId, auction.quantity);

    try {
      await this.redis.del(`auction:${auctionId}`);
      await this.redis.srem('active_auctions', auctionId);
    } catch (err) {
      console.warn('Redis delete failed:', err);
    }

    // 메모리에서는 cancelled 상태로 유지 (테스트용)
    if (this.enableTimers) {
      this.activeAuctions.delete(auctionId);
    }

    return auction;
  }

  /**
   * 활성 경매 목록 조회
   * @returns {Array} 경매 목록
   */
  getActiveAuctions() {
    // 종료된 경매 처리
    const now = Date.now();
    Array.from(this.activeAuctions.values()).forEach(auction => {
      if (auction.status === 'active' && now > new Date(auction.endTime).getTime()) {
        this.completeAuction(auction.auctionId);
      }
    });

    return Array.from(this.activeAuctions.values()).filter(
      auction => auction.status === 'active'
    );
  }

  /**
   * 경매 조회
   * @param {string} auctionId - 경매 ID
   * @returns {Object|null} 경매 객체
   */
  getAuction(auctionId) {
    const auction = this.activeAuctions.get(auctionId);
    if (auction && auction.status === 'active') {
      const now = Date.now();
      if (now > new Date(auction.endTime).getTime()) {
        this.completeAuction(auctionId);
        return this.activeAuctions.get(auctionId);
      }
    }
    return auction || null;
  }

  /**
   * 사용자의 경매 목록 조회
   * @param {string} userId - 사용자 ID
   * @returns {Object} 판매/입찰 경매 목록
   */
  getUserAuctions(userId) {
    const auctions = Array.from(this.activeAuctions.values());

    return {
      selling: auctions.filter(a => a.sellerId === userId && a.status === 'active'),
      bidding: auctions.filter(a => a.currentBidder === userId && a.status === 'active')
    };
  }

  /**
   * 경매 기록 저장
   * @param {Object} auction - 경매 객체
   */
  async recordAuctionHistory(auction) {
    const history = {
      auctionId: auction.auctionId,
      sellerId: auction.sellerId,
      itemId: auction.itemId,
      itemName: auction.itemName,
      quantity: auction.quantity,
      startBid: auction.startBid,
      finalBid: auction.currentBid,
      winnerId: auction.currentBidder,
      completedAt: auction.completedAt,
      timestamp: Date.now()
    };

    try {
      // 판매자 기록
      await this.redis.lpush(`auction_history:sell:${auction.sellerId}`, JSON.stringify(history));
      await this.redis.ltrim(`auction_history:sell:${auction.sellerId}`, 0, 99);

      // 낙찰자 기록
      if (auction.currentBidder) {
        await this.redis.lpush(`auction_history:buy:${auction.currentBidder}`, JSON.stringify(history));
        await this.redis.ltrim(`auction_history:buy:${auction.currentBidder}`, 0, 99);
      }
    } catch (err) {
      console.warn('Auction history save failed:', err);
    }
  }

  /**
   * 경매 기록 조회
   * @param {string} userId - 사용자 ID
   * @param {string} type - 기록 유형 (sell/buy)
   * @param {number} limit - 최대 개수
   * @returns {Array} 경매 기록 목록
   */
  async getAuctionHistory(userId, type = 'sell', limit = 10) {
    try {
      const history = await this.redis.lrange(`auction_history:${type}:${userId}`, 0, limit - 1);
      return history.map(h => JSON.parse(h));
    } catch (err) {
      console.warn('Auction history load failed:', err);
      return [];
    }
  }

  /**
   * 수수료 계산
   * @param {number} amount - 금액
   * @returns {number} 수수료
   */
  calculateFee(amount) {
    return Math.floor(amount * this.feeRate);
  }

  /**
   * 경매 종료 타이머 설정
   * @param {string} auctionId - 경매 ID
   * @param {number} delayMs - 지연 시간 (ms)
   */
  setAuctionExpiration(auctionId, delayMs) {
    if (this.enableTimers) {
      setTimeout(() => {
        this.completeAuction(auctionId);
      }, delayMs);
    }
    // 테스트에서는 타이머를 비활성화하여 자동 완료 방지
  }

  /**
   * 경매 ID 생성
   * @returns {string} 경매 ID
   */
  generateAuctionId() {
    return `auction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 모든 활성 경매 초기화 (테스트용)
   */
  clearAllAuctions() {
    this.activeAuctions.clear();
  }
}

export default AuctionManager;