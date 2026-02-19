/**
 * FriendManager - 친구 관리 시스템
 *
 * 기능:
 * - 친구 추가/삭제
 * - 친구 목록 조회
 * - 친구 검색
 * - 친구 존재 확인
 */

class FriendManager {
  constructor(redisClient) {
    this.redisClient = redisClient;
    this.FRIENDS_KEY_PREFIX = 'friends:';
  }

  /**
   * 캐릭터 친구 목록 키 생성
   * @param {string} characterId - 캐릭터 ID
   * @returns {string} Redis 키
   */
  getFriendsKey(characterId) {
    return this.FRIENDS_KEY_PREFIX + characterId;
  }

  /**
   * 친구 추가
   * @param {string} characterId - 캐릭터 ID
   * @param {string} friendId - 추가할 친구 ID
   * @param {string} friendName - 친구 이름
   * @param {Object} metadata - 추가 메타데이터
   * @returns {Promise<boolean>} 성공 여부
   */
  async addFriend(characterId, friendId, friendName, metadata = {}) {
    try {
      const friendsKey = this.getFriendsKey(characterId);

      // 이미 친구인지 확인
      const isAlreadyFriend = await this.isFriend(characterId, friendId);
      if (isAlreadyFriend) {
        return false;
      }

      // 자신을 친구로 추가 불가
      if (characterId === friendId) {
        return false;
      }

      const friendData = {
        characterId: friendId,
        name: friendName,
        addedAt: new Date().toISOString(),
        ...metadata
      };

      // Redis Hash에 친구 추가
      await this.redisClient.hset(
        friendsKey,
        friendId,
        JSON.stringify(friendData)
      );

      return true;
    } catch (error) {
      console.error('친구 추가 실패:', error);
      throw error;
    }
  }

  /**
   * 친구 삭제
   * @param {string} characterId - 캐릭터 ID
   * @param {string} friendId - 삭제할 친구 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  async removeFriend(characterId, friendId) {
    try {
      const friendsKey = this.getFriendsKey(characterId);

      // 친구인지 확인
      const isFriend = await this.isFriend(characterId, friendId);
      if (!isFriend) {
        return false;
      }

      // Redis Hash에서 친구 삭제
      await this.redisClient.hdel(friendsKey, friendId);

      return true;
    } catch (error) {
      console.error('친구 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 친구 목록 조회
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<Array>} 친구 목록
   */
  async getFriends(characterId) {
    try {
      const friendsKey = this.getFriendsKey(characterId);
      const friends = await this.redisClient.hgetall(friendsKey);

      if (!friends) {
        return [];
      }

      // 친구 데이터를 파싱하고 배열로 변환
      const friendList = Object.values(friends).map(friend => {
        try {
          return JSON.parse(friend);
        } catch (err) {
          console.error('친구 데이터 파싱 실패:', err);
          return null;
        }
      }).filter(Boolean);

      // 추가 시간순 정렬
      return friendList.sort((a, b) =>
        new Date(b.addedAt) - new Date(a.addedAt)
      );
    } catch (error) {
      console.error('친구 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 친구 검색
   * @param {string} characterId - 캐릭터 ID
   * @param {string} keyword - 검색 키워드 (이름)
   * @returns {Promise<Array>} 검색된 친구 목록
   */
  async searchFriends(characterId, keyword) {
    try {
      const friends = await this.getFriends(characterId);

      if (!keyword || keyword.trim() === '') {
        return friends;
      }

      const lowerKeyword = keyword.toLowerCase().trim();

      // 이름으로 검색
      return friends.filter(friend =>
        friend.name &&
        friend.name.toLowerCase().includes(lowerKeyword)
      );
    } catch (error) {
      console.error('친구 검색 실패:', error);
      throw error;
    }
  }

  /**
   * 친구 존재 확인
   * @param {string} characterId - 캐릭터 ID
   * @param {string} friendId - 확인할 친구 ID
   * @returns {Promise<boolean>} 친구 존재 여부
   */
  async isFriend(characterId, friendId) {
    try {
      const friendsKey = this.getFriendsKey(characterId);
      const friendData = await this.redisClient.hget(friendsKey, friendId);

      return friendData !== null;
    } catch (error) {
      console.error('친구 존재 확인 실패:', error);
      throw error;
    }
  }

  /**
   * 친구 수 조회
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<number>} 친구 수
   */
  async getFriendCount(characterId) {
    try {
      const friendsKey = this.getFriendsKey(characterId);
      const count = await this.redisClient.hlen(friendsKey);

      return count;
    } catch (error) {
      console.error('친구 수 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 친구 정보 조회
   * @param {string} characterId - 캐릭터 ID
   * @param {string} friendId - 조회할 친구 ID
   * @returns {Promise<Object|null>} 친구 정보
   */
  async getFriend(characterId, friendId) {
    try {
      const friendsKey = this.getFriendsKey(characterId);
      const friendData = await this.redisClient.hget(friendsKey, friendId);

      if (!friendData) {
        return null;
      }

      return JSON.parse(friendData);
    } catch (error) {
      console.error('친구 정보 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 모든 친구 삭제 (테스트용)
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<void>}
   */
  async clearFriends(characterId) {
    try {
      const friendsKey = this.getFriendsKey(characterId);
      await this.redisClient.del(friendsKey);
    } catch (error) {
      console.error('친구 전체 삭제 실패:', error);
      throw error;
    }
  }
}

module.exports = FriendManager;