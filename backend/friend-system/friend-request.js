/**
 * FriendRequest - 친구 요청 시스템
 *
 * 기능:
 * - 친구 요청 전송
 * - 요청 수락/거절
 * - 요청 목록 조회
 * - 요청 취소
 */

class FriendRequest {
  constructor(redisClient) {
    this.redisClient = redisClient;
    this.REQUESTS_KEY_PREFIX = 'friend_requests:';
    this.PENDING_KEY_PREFIX = 'pending_requests:';
  }

  /**
   * 수신 요청 키 생성
   * @param {string} characterId - 캐릭터 ID
   * @returns {string} Redis 키
   */
  getRequestsKey(characterId) {
    return this.REQUESTS_KEY_PREFIX + characterId;
  }

  /**
   * 보낸 요청 키 생성
   * @param {string} characterId - 캐릭터 ID
   * @returns {string} Redis 키
   */
  getPendingKey(characterId) {
    return this.PENDING_KEY_PREFIX + characterId;
  }

  /**
   * 친구 요청 전송
   * @param {string} fromCharacterId - 보낸 캐릭터 ID
   * @param {string} fromCharacterName - 보낸 캐릭터 이름
   * @param {string} toCharacterId - 받을 캐릭터 ID
   * @param {string} message - 요청 메시지
   * @returns {Promise<boolean>} 성공 여부
   */
  async sendRequest(fromCharacterId, fromCharacterName, toCharacterId, message = '') {
    try {
      // 자신에게 요청 불가
      if (fromCharacterId === toCharacterId) {
        return false;
      }

      const requestsKey = this.getRequestsKey(toCharacterId);
      const pendingKey = this.getPendingKey(fromCharacterId);

      // 이미 요청을 보냈는지 확인
      const alreadySent = await this.hasPendingRequest(fromCharacterId, toCharacterId);
      if (alreadySent) {
        return false;
      }

      const requestData = {
        fromCharacterId,
        fromCharacterName,
        toCharacterId,
        message,
        sentAt: new Date().toISOString(),
        status: 'pending'
      };

      // 수신자에게 요청 추가
      await this.redisClient.hset(
        requestsKey,
        fromCharacterId,
        JSON.stringify(requestData)
      );

      // 보낸 사람의 보낸 요청 목록에 추가
      await this.redisClient.hset(
        pendingKey,
        toCharacterId,
        JSON.stringify(requestData)
      );

      return true;
    } catch (error) {
      console.error('친구 요청 전송 실패:', error);
      throw error;
    }
  }

  /**
   * 친구 요청 수락
   * @param {string} toCharacterId - 받은 캐릭터 ID
   * @param {string} fromCharacterId - 보낸 캐릭터 ID
   * @param {FriendManager} friendManager - 친구 관리자
   * @returns {Promise<boolean>} 성공 여부
   */
  async acceptRequest(toCharacterId, fromCharacterId, friendManager) {
    try {
      const requestsKey = this.getRequestsKey(toCharacterId);
      const pendingKey = this.getPendingKey(fromCharacterId);

      // 요청 존재 확인
      const requestData = await this.getRequest(toCharacterId, fromCharacterId);
      if (!requestData || requestData.status !== 'pending') {
        return false;
      }

      // 친구 추가 (서로)
      const added1 = await friendManager.addFriend(
        toCharacterId,
        fromCharacterId,
        requestData.fromCharacterName
      );
      const added2 = await friendManager.addFriend(
        fromCharacterId,
        toCharacterId,
        requestData.toCharacterName || 'Unknown'
      );

      if (!added1 || !added2) {
        return false;
      }

      // 요청 삭제
      await this.redisClient.hdel(requestsKey, fromCharacterId);
      await this.redisClient.hdel(pendingKey, toCharacterId);

      return true;
    } catch (error) {
      console.error('친구 요청 수락 실패:', error);
      throw error;
    }
  }

  /**
   * 친구 요청 거절
   * @param {string} toCharacterId - 받은 캐릭터 ID
   * @param {string} fromCharacterId - 보낸 캐릭터 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  async rejectRequest(toCharacterId, fromCharacterId) {
    try {
      const requestsKey = this.getRequestsKey(toCharacterId);
      const pendingKey = this.getPendingKey(fromCharacterId);

      // 요청 존재 확인
      const requestData = await this.getRequest(toCharacterId, fromCharacterId);
      if (!requestData) {
        return false;
      }

      // 요청 삭제
      await this.redisClient.hdel(requestsKey, fromCharacterId);
      await this.redisClient.hdel(pendingKey, toCharacterId);

      return true;
    } catch (error) {
      console.error('친구 요청 거절 실패:', error);
      throw error;
    }
  }

  /**
   * 친구 요청 취소
   * @param {string} fromCharacterId - 보낸 캐릭터 ID
   * @param {string} toCharacterId - 받을 캐릭터 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  async cancelRequest(fromCharacterId, toCharacterId) {
    try {
      const requestsKey = this.getRequestsKey(toCharacterId);
      const pendingKey = this.getPendingKey(fromCharacterId);

      // 보낸 요청 존재 확인
      const hasPending = await this.hasPendingRequest(fromCharacterId, toCharacterId);
      if (!hasPending) {
        return false;
      }

      // 요청 삭제
      await this.redisClient.hdel(requestsKey, fromCharacterId);
      await this.redisClient.hdel(pendingKey, toCharacterId);

      return true;
    } catch (error) {
      console.error('친구 요청 취소 실패:', error);
      throw error;
    }
  }

  /**
   * 수신 요청 목록 조회
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<Array>} 요청 목록
   */
  async getRequests(characterId) {
    try {
      const requestsKey = this.getRequestsKey(characterId);
      const requests = await this.redisClient.hgetall(requestsKey);

      if (!requests) {
        return [];
      }

      const requestList = Object.values(requests).map(request => {
        try {
          return JSON.parse(request);
        } catch (err) {
          console.error('요청 데이터 파싱 실패:', err);
          return null;
        }
      }).filter(Boolean);

      // 오래된 순서 정렬 (먼저 온 요청이 우선)
      return requestList.sort((a, b) =>
        new Date(a.sentAt) - new Date(b.sentAt)
      );
    } catch (error) {
      console.error('수신 요청 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 보낸 요청 목록 조회
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<Array>} 요청 목록
   */
  async getPendingRequests(characterId) {
    try {
      const pendingKey = this.getPendingKey(characterId);
      const pending = await this.redisClient.hgetall(pendingKey);

      if (!pending) {
        return [];
      }

      const pendingList = Object.values(pending).map(request => {
        try {
          return JSON.parse(request);
        } catch (err) {
          console.error('요청 데이터 파싱 실패:', err);
          return null;
        }
      }).filter(Boolean);

      return pendingList.sort((a, b) =>
        new Date(a.sentAt) - new Date(b.sentAt)
      );
    } catch (error) {
      console.error('보낸 요청 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 요청 조회
   * @param {string} toCharacterId - 받은 캐릭터 ID
   * @param {string} fromCharacterId - 보낸 캐릭터 ID
   * @returns {Promise<Object|null>} 요청 데이터
   */
  async getRequest(toCharacterId, fromCharacterId) {
    try {
      const requestsKey = this.getRequestsKey(toCharacterId);
      const requestData = await this.redisClient.hget(requestsKey, fromCharacterId);

      if (!requestData) {
        return null;
      }

      return JSON.parse(requestData);
    } catch (error) {
      console.error('요청 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 보낸 요청 존재 확인
   * @param {string} fromCharacterId - 보낸 캐릭터 ID
   * @param {string} toCharacterId - 받을 캐릭터 ID
   * @returns {Promise<boolean>} 요청 존재 여부
   */
  async hasPendingRequest(fromCharacterId, toCharacterId) {
    try {
      const pendingKey = this.getPendingKey(fromCharacterId);
      const requestData = await this.redisClient.hget(pendingKey, toCharacterId);

      return requestData !== null;
    } catch (error) {
      console.error('보낸 요청 존재 확인 실패:', error);
      throw error;
    }
  }

  /**
   * 대기 중 요청 수 조회
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<number>} 요청 수
   */
  async getRequestCount(characterId) {
    try {
      const requestsKey = this.getRequestsKey(characterId);
      const count = await this.redisClient.hlen(requestsKey);

      return count;
    } catch (error) {
      console.error('요청 수 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 모든 요청 삭제 (테스트용)
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<void>}
   */
  async clearRequests(characterId) {
    try {
      const requestsKey = this.getRequestsKey(characterId);
      const pendingKey = this.getPendingKey(characterId);

      await this.redisClient.del(requestsKey);
      await this.redisClient.del(pendingKey);
    } catch (error) {
      console.error('요청 전체 삭제 실패:', error);
      throw error;
    }
  }
}

module.exports = FriendRequest;