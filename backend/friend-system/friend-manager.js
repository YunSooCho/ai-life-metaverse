/**
 * Friend Manager
 * 친구 관리 시스템
 */

class FriendManager {
  constructor(redisClient) {
    this.redisClient = redisClient;
    this.FRIENDLIST_KEY = 'friendlist';
    this.FRIENDLIST_TTL = 7 * 24 * 60 * 60; // 7일
  }

  /**
   * 캐릭터의 친구 목록 가져오기
   */
  async getFriendList(characterId) {
    try {
      if (!this.redisClient) {
        // Memory mode
        if (!this._memoryFriendLists) {
          this._memoryFriendLists = {};
        }
        return this._memoryFriendLists[characterId] || [];
      }

      const key = `${this.FRIENDLIST_KEY}:${characterId}`;
      const friends = await this.redisClient.get(key);
      return friends ? JSON.parse(friends) : [];
    } catch (error) {
      console.error('getFriendList error:', error);
      return [];
    }
  }

  /**
   * 친구 추가
   */
  async addFriend(characterId, friendId, friendName = 'Unknown') {
    try {
      const friendList = await this.getFriendList(characterId);

      // 이미 친구인지 확인
      if (friendList.some(f => f.id === friendId)) {
        return { success: false, message: 'Already friends' };
      }

      // 자기 자신인지 확인
      if (characterId === friendId) {
        return { success: false, message: 'Cannot add yourself' };
      }

      const friend = {
        id: friendId,
        name: friendName,
        addedAt: new Date().toISOString()
      };

      friendList.push(friend);

      if (!this.redisClient) {
        // Memory mode
        if (!this._memoryFriendLists) {
          this._memoryFriendLists = {};
        }
        this._memoryFriendLists[characterId] = friendList;
        return { success: true, friend };
      }

      const key = `${this.FRIENDLIST_KEY}:${characterId}`;
      await this.redisClient.setex(
        key,
        this.FRIENDLIST_TTL,
        JSON.stringify(friendList)
      );

      return { success: true, friend };
    } catch (error) {
      console.error('addFriend error:', error);
      return { success: false, message: 'Failed to add friend' };
    }
  }

  /**
   * 친구 삭제
   */
  async removeFriend(characterId, friendId) {
    try {
      const friendList = await this.getFriendList(characterId);

      const newFriendList = friendList.filter(f => f.id !== friendId);

      if (newFriendList.length === friendList.length) {
        return { success: false, message: 'Friend not found' };
      }

      if (!this.redisClient) {
        // Memory mode
        if (!this._memoryFriendLists) {
          this._memoryFriendLists = {};
        }
        this._memoryFriendLists[characterId] = newFriendList;
        return { success: true, removedFriendId: friendId };
      }

      const key = `${this.FRIENDLIST_KEY}:${characterId}`;
      if (newFriendList.length === 0) {
        await this.redisClient.del(key);
      } else {
        await this.redisClient.setex(
          key,
          this.FRIENDLIST_TTL,
          JSON.stringify(newFriendList)
        );
      }

      return { success: true, removedFriendId: friendId };
    } catch (error) {
      console.error('removeFriend error:', error);
      return { success: false, message: 'Failed to remove friend' };
    }
  }

  /**
   * 친구인지 확인
   */
  async isFriend(characterId, targetId) {
    try {
      const friendList = await this.getFriendList(characterId);
      return friendList.some(f => f.id === targetId);
    } catch (error) {
      console.error('isFriend error:', error);
      return false;
    }
  }

  /**
   * 친구 검색
   */
  async searchFriends(characterId, query) {
    try {
      const friendList = await this.getFriendList(characterId);
      const lowerQuery = query.toLowerCase();

      return friendList.filter(f =>
        f.name.toLowerCase().includes(lowerQuery) ||
        f.id.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('searchFriends error:', error);
      return [];
    }
  }

  /**
   * 친구 수 가져오기
   */
  async getFriendCount(characterId) {
    try {
      const friendList = await this.getFriendList(characterId);
      return friendList.length;
    } catch (error) {
      console.error('getFriendCount error:', error);
      return 0;
    }
  }

  /**
   * 캐릭터의 모든 친구 데이터 삭제
   */
  async clearFriendData(characterId) {
    try {
      if (!this.redisClient) {
        // Memory mode
        if (this._memoryFriendLists) {
          delete this._memoryFriendLists[characterId];
        }
        return { success: true };
      }

      const key = `${this.FRIENDLIST_KEY}:${characterId}`;
      await this.redisClient.del(key);
      return { success: true };
    } catch (error) {
      console.error('clearFriendData error:', error);
      return { success: false };
    }
  }

  /**
   * 메모리 모드 데이터 접근자 (테스트용)
   */
  _getMemoryData() {
    return this._memoryFriendLists || {};
  }
}

export default FriendManager;