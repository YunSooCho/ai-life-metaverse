/**
 * CoinManager - 코인 시스템 메니저
 * 코인 획득, 소비, 전송, 기록 관리
 */

class CoinManager {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  /**
   * 사용자 코인 조회
   * @param {string} userId - 사용자 ID
   * @returns {number} 코인 잔액
   */
  async getUserCoins(userId) {
    try {
      const coins = await this.redis.get(`coins:${userId}`);
      return parseInt(coins || '0', 10);
    } catch (err) {
      console.warn('Failed to get user coins:', err);
      return 0;
    }
  }

  /**
   * 코인 추가
   * @param {string} userId - 사용자 ID
   * @param {number} amount - 금액
   * @param {string} reason - 사유
   * @returns {number} 새 코인 잔액
   */
  async addCoins(userId, amount, reason = 'unknown') {
    if (amount <= 0) {
      throw new Error('추가할 코인은 0보다 커야 합니다');
    }

    try {
      const newBalance = await this.redis.incrby(`coins:${userId}`, amount);

      // 코인 기록
      await this.recordCoinTransaction(userId, 'add', amount, reason);

      return newBalance;
    } catch (err) {
      console.warn('Failed to add coins:', err);
      throw new Error('코인 추가에 실패했습니다');
    }
  }

  /**
   * 코인 차감
   * @param {string} userId - 사용자 ID
   * @param {number} amount - 금액
   * @param {string} reason - 사유
   * @returns {number} 새 코인 잔액
   */
  async removeCoins(userId, amount, reason = 'unknown') {
    if (amount <= 0) {
      throw new Error('차감할 코인은 0보다 커야 합니다');
    }

    const currentCoins = await this.getUserCoins(userId);

    if (currentCoins < amount) {
      throw new Error('코인이 부족합니다');
    }

    try {
      const newBalance = await this.redis.incrby(`coins:${userId}`, -amount);

      // 코인 기록
      await this.recordCoinTransaction(userId, 'remove', amount, reason);

      return newBalance;
    } catch (err) {
      console.warn('Failed to remove coins:', err);
      throw new Error('코인 차감에 실패했습니다');
    }
  }

  /**
   * 코인 전송
   * @param {string} fromUserId - 송신자 ID
   * @param {string} toUserId - 수신자 ID
   * @param {number} amount - 금액
   * @param {string} reason - 사유
   * @returns {Object} 전송 결과
   */
  async transferCoins(fromUserId, toUserId, amount, reason = 'transfer') {
    if (amount <= 0) {
      throw new Error('전송할 코인은 0보다 커야 합니다');
    }

    if (fromUserId === toUserId) {
      throw new Error('자신에게 코인을 전송할 수 없습니다');
    }

    const currentCoins = await this.getUserCoins(fromUserId);

    if (currentCoins < amount) {
      throw new Error('코인이 부족합니다');
    }

    try {
      // 코인 전송 (Lua script로 atomic 하게 처리)
      const script = `
        local fromKey = KEYS[1]
        local toKey = KEYS[2]
        local amount = tonumber(ARGV[1])
        local fromBalance = tonumber(redis.call('GET', fromKey) or '0')
        
        if fromBalance < amount then
          return 0
        end
        
        redis.call('INCRBY', fromKey, -amount)
        redis.call('INCRBY', toKey, amount)
        
        return 1
      `;

      const success = await this.redis.eval(
        script,
        2,
        `coins:${fromUserId}`,
        `coins:${toUserId}`,
        amount
      );

      if (!success) {
        throw new Error('코인 전송에 실패했습니다');
      }

      // 코인 기록 (양쪽 모두)
      await this.recordCoinTransaction(fromUserId, 'remove', amount, reason);
      await this.recordCoinTransaction(toUserId, 'add', amount, reason);

      return {
        success: true,
        fromBalance: await this.getUserCoins(fromUserId),
        toBalance: await this.getUserCoins(toUserId)
      };
    } catch (err) {
      console.warn('Failed to transfer coins:', err);
      throw new Error('코인 전송에 실패했습니다');
    }
  }

  /**
   * 초기 코인 지급
   * @param {string} userId - 사용자 ID
   * @param {number} amount - 금액
   * @returns {number} 코인 잔액
   */
  async initializeCoins(userId, amount = 1000) {
    try {
      const existing = await this.redis.exists(`coins:${userId}`);

      if (existing) {
        return await this.getUserCoins(userId);
      }

      await this.redis.set(`coins:${userId}`, amount);

      // 초기 코인 기록
      await this.recordCoinTransaction(userId, 'add', amount, 'initial');

      return amount;
    } catch (err) {
      console.warn('Failed to initialize coins:', err);
      throw new Error('코인 초기화에 실패했습니다');
    }
  }

  /**
   * 코인 기록 저장
   * @param {string} userId - 사용자 ID
   * @param {string} type - 유형 (add/remove/transfer)
   * @param {number} amount - 금액
   * @param {string} reason - 사유
   */
  async recordCoinTransaction(userId, type, amount, reason) {
    const transaction = {
      type,
      amount,
      reason,
      timestamp: Date.now(),
      date: new Date().toISOString()
    };

    try {
      await this.redis.lpush(`coin_history:${userId}`, JSON.stringify(transaction));

      // 최근 100개만 유지
      await this.redis.ltrim(`coin_history:${userId}`, 0, 99);
    } catch (err) {
      console.warn('Failed to record coin transaction:', err);
    }
  }

  /**
   * 코인 기록 조회
   * @param {string} userId - 사용자 ID
   * @param {number} limit - 최대 개수
   * @returns {Array} 코인 기록 목록
   */
  async getCoinHistory(userId, limit = 20) {
    try {
      const history = await this.redis.lrange(`coin_history:${userId}`, 0, limit - 1);
      return history.map(h => JSON.parse(h));
    } catch (err) {
      console.warn('Failed to get coin history:', err);
      return [];
    }
  }

  /**
   * 사용자 코인 통계
   * @param {string} userId - 사용자 ID
   * @returns {Object} 통계 정보
   */
  async getCoinStats(userId) {
    try {
      const history = await this.getCoinHistory(userId, 1000);

      let totalEarned = 0;
      let totalSpent = 0;
      let transactionCount = history.length;

      history.forEach(t => {
        if (t.type === 'add') {
          totalEarned += t.amount;
        } else if (t.type === 'remove') {
          totalSpent += t.amount;
        }
      });

      return {
        currentBalance: await this.getUserCoins(userId),
        totalEarned,
        totalSpent,
        transactionCount
      };
    } catch (err) {
      console.warn('Failed to get coin stats:', err);
      return {
        currentBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        transactionCount: 0
      };
    }
  }

  /**
   * 전체 코인 랭킹 (top N)
   * @param {number} limit - 최대 개수
   * @returns {Array} 랭킹 목록
   */
  async getCoinRanking(limit = 10) {
    try {
      // 모든 coin 키 스캔
      const keys = await this.redis.keys('coins:*');

      const users = await Promise.all(
        keys.map(async (key) => {
          const userId = key.replace('coins:', '');
          const coins = await this.getUserCoins(userId);
          return { userId, coins };
        })
      );

      // 정렬
      return users
        .sort((a, b) => b.coins - a.coins)
        .slice(0, limit)
        .map((user, index) => ({
          rank: index + 1,
          userId: user.userId,
          coins: user.coins
        }));
    } catch (err) {
      console.warn('Failed to get coin ranking:', err);
      return [];
    }
  }

  /**
   * 사용자 데이터 삭제 (테스트용)
   * @param {string} userId - 사용자 ID
   */
  async clearUserData(userId) {
    try {
      await this.redis.del(`coins:${userId}`);
      await this.redis.del(`coin_history:${userId}`);
    } catch (err) {
      console.warn('Failed to clear user data:', err);
    }
  }
}

export default CoinManager;