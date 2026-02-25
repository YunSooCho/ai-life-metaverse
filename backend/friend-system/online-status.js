/**
 * OnlineStatus - 온라인 상태 관리 시스템
 *
 * 기능:
 * - 온라인/오프라인 상태 표시
 * - 마지막 접속 시간
 * - 온라인 친구 목록
 */

class OnlineStatus {
  constructor(redisClient) {
    this.redisClient = redisClient;
    this.ONLINE_KEY_PREFIX = 'online:';
    this.LAST_SEEN_KEY_PREFIX = 'last_seen:';
    this.ONLINE_FRIENDS_SET_SUFFIX = ':online_friends';
    this.OFFLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5분
  }

  /**
   * 온라인 상태 키 생성
   * @param {string} characterId - 캐릭터 ID
   * @returns {string} Redis 키
   */
  getOnlineKey(characterId) {
    return this.ONLINE_KEY_PREFIX + characterId;
  }

  /**
   * 마지막 접속 시간 키 생성
   * @param {string} characterId - 캐릭터 ID
   * @returns {string} Redis 키
   */
  getLastSeenKey(characterId) {
    return this.LAST_SEEN_KEY_PREFIX + characterId;
  }

  /**
   * 온라인 친구 집합 키 생성
   * @param {string} characterId - 캐릭터 ID
   * @returns {string} Redis 키
   */
  getOnlineFriendsKey(characterId) {
    return characterId + this.ONLINE_FRIENDS_SET_SUFFIX;
  }

  /**
   * 온라인 상태 설정
   * @param {string} characterId - 캐릭터 ID
   * @param {string} statusMessage - 상태 메시지
   * @returns {Promise<void>}
   */
  async setOnline(characterId, statusMessage = '') {
    try {
      const onlineKey = this.getOnlineKey(characterId);
      const lastSeenKey = this.getLastSeenKey(characterId);

      const statusData = {
        characterId,
        isOnline: true,
        statusMessage,
        lastSeen: new Date().toISOString()
      };

      // 온라인 상태 설정 (TTL 10분)
      await this.redisClient.setex(
        onlineKey,
        600, // 10분 TTL
        JSON.stringify(statusData)
      );

      // 마지막 접속 시간 업데이트
      await this.redisClient.set(
        lastSeenKey,
        new Date().toISOString()
      );
    } catch (error) {
      console.error('온라인 상태 설정 실패:', error);
      throw error;
    }
  }

  /**
   * 오프라인 상태 설정
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<void>}
   */
  async setOffline(characterId) {
    try {
      const onlineKey = this.getOnlineKey(characterId);

      // 온라인 상태 삭제
      await this.redisClient.del(onlineKey);

      // 마지막 접속 시간 업데이트 (오프라인으로 설정되기 직전)
      await this.redisClient.set(
        this.getLastSeenKey(characterId),
        new Date().toISOString()
      );
    } catch (error) {
      console.error('오프라인 상태 설정 실패:', error);
      throw error;
    }
  }

  /**
   * 온라인 상태 확인
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<Object>} 온라인 상태 데이터
   */
  async getOnlineStatus(characterId) {
    try {
      const onlineKey = this.getOnlineKey(characterId);
      const lastSeenKey = this.getLastSeenKey(characterId);

      const onlineData = await this.redisClient.get(onlineKey);
      const lastSeenData = await this.redisClient.get(lastSeenKey);

      let status = {
        characterId,
        isOnline: false,
        statusMessage: '',
        lastSeen: null
      };

      if (onlineData) {
        const parsed = JSON.parse(onlineData);
        status.isOnline = true;
        status.statusMessage = parsed.statusMessage || '';
      }

      if (lastSeenData) {
        status.lastSeen = lastSeenData;
      }

      return status;
    } catch (error) {
      console.error('온라인 상태 확인 실패:', error);
      throw error;
    }
  }

  /**
   * 여러 캐릭터 온라인 상태 확인
   * @param {Array<string>} characterIds - 캐릭터 ID 배열
   * @returns {Promise<Array>} 온라인 상태 배열
   */
  async getMultipleStatuses(characterIds) {
    try {
      const statuses = [];

      for (const characterId of characterIds) {
        const status = await this.getOnlineStatus(characterId);
        statuses.push(status);
      }

      return statuses;
    } catch (error) {
      console.error('여러 온라인 상태 확인 실패:', error);
      throw error;
    }
  }

  /**
   * 온라인 친구 목록 조회
   * @param {string} characterId - 캐릭터 ID
   * @param {FriendManager} friendManager - 친구 관리자
   * @returns {Promise<Array>} 온라인 친구 목록
   */
  async getOnlineFriends(characterId, friendManager) {
    try {
      // 모든 친구 조회
      const allFriends = await friendManager.getFriends(characterId);

      if (allFriends.length === 0) {
        return [];
      }

      // 친구 ID 추출
      const friendIds = allFriends.map(friend => friend.characterId);

      // 모든 친구의 온라인 상태 확인
      const statuses = await this.getMultipleStatuses(friendIds);

      // 온라인인 친구만 필터링
      const onlineFriends = statuses
        .filter(status => status.isOnline)
        .map(status => {
          const friendInfo = allFriends.find(friend =>
            friend.characterId === status.characterId
          );
          return {
            ...friendInfo,
            isOnline: true,
            statusMessage: status.statusMessage
          };
        });

      return onlineFriends;
    } catch (error) {
      console.error('온라인 친구 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 오프라인 친구 목록 조회
   * @param {string} characterId - 캐릭터 ID
   * @param {FriendManager} friendManager - 친구 관리자
   * @returns {Promise<Array>} 오프라인 친구 목록
   */
  async getOfflineFriends(characterId, friendManager) {
    try {
      // 모든 친구 조회
      const allFriends = await friendManager.getFriends(characterId);

      if (allFriends.length === 0) {
        return [];
      }

      // 친구 ID 추출
      const friendIds = allFriends.map(friend => friend.characterId);

      // 모든 친구의 온라인 상태 확인
      const statuses = await this.getMultipleStatuses(friendIds);

      // 오프라인인 친구만 필터링
      const offlineFriends = statuses
        .filter(status => !status.isOnline)
        .map(status => {
          const friendInfo = allFriends.find(friend =>
            friend.characterId === status.characterId
          );
          return {
            ...friendInfo,
            isOnline: false,
            lastSeen: status.lastSeen
          };
        });

      return offlineFriends;
    } catch (error) {
      console.error('오프라인 친구 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 마지막 접속 시간 조회
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<string|null>} 마지막 접속 시간
   */
  async getLastSeen(characterId) {
    try {
      const lastSeenKey = this.getLastSeenKey(characterId);
      const lastSeen = await this.redisClient.get(lastSeenKey);

      return lastSeen;
    } catch (error) {
      console.error('마지막 접속 시간 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 상태 메시지 업데이트
   * @param {string} characterId - 캐릭터 ID
   * @param {string} statusMessage - 상태 메시지
   * @returns {Promise<void>}
   */
  async updateStatusMessage(characterId, statusMessage) {
    try {
      const onlineKey = this.getOnlineKey(characterId);
      const onlineData = await this.redisClient.get(onlineKey);

      if (!onlineData) {
        // 오프라인 상태면 온라인으로 변경
        await this.setOnline(characterId, statusMessage);
        return;
      }

      const statusData = JSON.parse(onlineData);
      statusData.statusMessage = statusMessage;
      statusData.lastSeen = new Date().toISOString();

      await this.redisClient.setex(
        onlineKey,
        600,
        JSON.stringify(statusData)
      );
    } catch (error) {
      console.error('상태 메시지 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 온라인 상태 만료 확인
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<boolean>} 만료 여부
   */
  async isExpired(characterId) {
    try {
      const onlineKey = this.getOnlineKey(characterId);
      const exists = await this.redisClient.exists(onlineKey);

      return exists === 0;
    } catch (error) {
      console.error('온라인 상태 만료 확인 실패:', error);
      throw error;
    }
  }

  /**
   * 모든 온라인 데이터 삭제 (테스트용)
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<void>}
   */
  async clearOnlineData(characterId) {
    try {
      const onlineKey = this.getOnlineKey(characterId);
      const lastSeenKey = this.getLastSeenKey(characterId);

      await this.redisClient.del(onlineKey);
      await this.redisClient.del(lastSeenKey);
    } catch (error) {
      console.error('온라인 데이터 전체 삭제 실패:', error);
      throw error;
    }
  }
}

module.exports = OnlineStatus;