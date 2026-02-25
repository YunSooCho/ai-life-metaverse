/**
 * TradeManager - 거래 시스템 메니저
 * 플레이어 간 아이템 거래 관리
 */

class TradeManager {
  constructor(redisClient) {
    this.redis = redisClient;
    this.activeTrades = new Map(); // 메모리에 활성 거래 저장
  }

  /**
   * 거래 요청 생성
   * @param {string} traderId - 요청자 ID
   * @param {string} targetId - 대상자 ID
   * @param {Object} offer - 제안 (아이템, 수량)
   * @param {Object} request - 요청 (아이템, 수량)
   * @returns {Object} 거래 객체
   */
  async createTradeRequest(traderId, targetId, offer = {}, request = {}) {
    const tradeId = this.generateTradeId();

    const trade = {
      tradeId,
      traderId,
      targetId,
      offer: {
        items: offer.items || [],
        coins: offer.coins || 0
      },
      request: {
        items: request.items || [],
        coins: request.coins || 0
      },
      status: 'pending', // pending, accepted, rejected, completed, cancelled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.activeTrades.set(tradeId, trade);

    try {
      await this.redis.setex(
        `trade:${tradeId}`,
        3600, // 1시간 만료
        JSON.stringify(trade)
      );
    } catch (err) {
      // Redis 실패 시 메모리로만 유지
      console.warn('Redis save failed:', err);
    }

    return trade;
  }

  /**
   * 거래 요청 수락
   * @param {string} tradeId - 거래 ID
   * @param {string} userId - 수락자 ID
   * @returns {Object} 거래 객체
   */
  async acceptTrade(tradeId, userId) {
    const trade = this.activeTrades.get(tradeId);

    if (!trade) {
      throw new Error('거래를 찾을 수 없습니다');
    }

    if (trade.targetId !== userId) {
      throw new Error('거래를 수락할 권한이 없습니다');
    }

    if (trade.status !== 'pending') {
      throw new Error('이미 완료된 거래입니다');
    }

    trade.status = 'accepted';
    trade.updatedAt = new Date().toISOString();

    try {
      await this.redis.setex(`trade:${tradeId}`, 3600, JSON.stringify(trade));
    } catch (err) {
      console.warn('Redis update failed:', err);
    }

    return trade;
  }

  /**
   * 거래 요청 거절
   * @param {string} tradeId - 거래 ID
   * @param {string} userId - 거절자 ID
   * @returns {Object} 거래 객체
   */
  async rejectTrade(tradeId, userId) {
    const trade = this.activeTrades.get(tradeId);

    if (!trade) {
      throw new Error('거래를 찾을 수 없습니다');
    }

    if (trade.targetId !== userId) {
      throw new Error('거래를 거절할 권한이 없습니다');
    }

    trade.status = 'rejected';
    trade.updatedAt = new Date().toISOString();

    try {
      await this.redis.del(`trade:${tradeId}`);
    } catch (err) {
      console.warn('Redis delete failed:', err);
    }

    this.activeTrades.delete(tradeId);

    return trade;
  }

  /**
   * 거래 취소
   * @param {string} tradeId - 거래 ID
   * @param {string} userId - 취소자 ID
   * @returns {Object} 거래 객체
   */
  async cancelTrade(tradeId, userId) {
    const trade = this.activeTrades.get(tradeId);

    if (!trade) {
      throw new Error('거래를 찾을 수 없습니다');
    }

    if (trade.traderId !== userId && trade.targetId !== userId) {
      throw new Error('거래를 취소할 권한이 없습니다');
    }

    if (trade.status === 'completed' || trade.status === 'rejected') {
      throw new Error('완료된 거래는 취소할 수 없습니다');
    }

    trade.status = 'cancelled';
    trade.updatedAt = new Date().toISOString();

    try {
      await this.redis.del(`trade:${tradeId}`);
    } catch (err) {
      console.warn('Redis delete failed:', err);
    }

    this.activeTrades.delete(tradeId);

    return trade;
  }

  /**
   * 거래 완료 (아이템 교환)
   * @param {string} tradeId - 거래 ID
   * @param {string} userId - 완료 요청자 ID
   * @returns {Object} 거래 객체
   */
  async completeTrade(tradeId, userId) {
    const trade = this.activeTrades.get(tradeId);

    if (!trade) {
      throw new Error('거래를 찾을 수 없습니다');
    }

    if (trade.traderId !== userId && trade.targetId !== userId) {
      throw new Error('거래를 완료할 권한이 없습니다');
    }

    if (trade.status !== 'accepted') {
      throw new Error('수락되지 않은 거래입니다');
    }

    trade.status = 'completed';
    trade.completedAt = new Date().toISOString();
    trade.updatedAt = new Date().toISOString();

    try {
      await this.redis.setex(`trade:${tradeId}`, 86400, JSON.stringify(trade)); // 24시간 기록 유지
    } catch (err) {
      console.warn('Redis update failed:', err);
    }

    // 거래 기록 (long-term storage)
    this.recordTradeHistory(trade);

    return trade;
  }

  /**
   * 거래 기록 저장
   * @param {Object} trade - 거래 객체
   */
  async recordTradeHistory(trade) {
    const history = {
      tradeId: trade.tradeId,
      traderId: trade.traderId,
      targetId: trade.targetId,
      offer: trade.offer,
      request: trade.request,
      completedAt: trade.completedAt,
      timestamp: Date.now()
    };

    try {
      await this.redis.lpush(`trade_history:${trade.traderId}`, JSON.stringify(history));
      await this.redis.lpush(`trade_history:${trade.targetId}`, JSON.stringify(history));

      // 최근 100개만 유지
      await this.redis.ltrim(`trade_history:${trade.traderId}`, 0, 99);
      await this.redis.ltrim(`trade_history:${trade.targetId}`, 0, 99);
    } catch (err) {
      console.warn('Trade history save failed:', err);
    }
  }

  /**
   * 거래 기록 조회
   * @param {string} userId - 사용자 ID
   * @param {number} limit - 최대 개수
   * @returns {Array} 거래 기록 목록
   */
  async getTradeHistory(userId, limit = 10) {
    try {
      const history = await this.redis.lrange(`trade_history:${userId}`, 0, limit - 1);
      return history.map(h => JSON.parse(h));
    } catch (err) {
      console.warn('Trade history load failed:', err);
      return [];
    }
  }

  /**
   * 활성 거래 조회
   * @param {string} tradeId - 거래 ID
   * @returns {Object|null} 거래 객체
   */
  getTrade(tradeId) {
    return this.activeTrades.get(tradeId) || null;
  }

  /**
   * 사용자의 활성 거래 목록 조회
   * @param {string} userId - 사용자 ID
   * @returns {Array} 거래 목록
   */
  getUserTrades(userId) {
    return Array.from(this.activeTrades.values()).filter(
      trade => trade.traderId === userId || trade.targetId === userId
    );
  }

  /**
   * 거래 ID 생성
   * @returns {string} 거래 ID
   */
  generateTradeId() {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 모든 활성 거래 초기화 (테스트용)
   */
  clearAllTrades() {
    this.activeTrades.clear();
  }
}

export default TradeManager;