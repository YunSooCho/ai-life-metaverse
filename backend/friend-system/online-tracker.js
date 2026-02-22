/**
 * Online Tracker
 * 온라인 상태 추적 시스템
 */

class OnlineTracker {
  constructor(redisClient) {
    this.redisClient = redisClient;
    this.ONLINE_KEY = 'online_users';
    this.LASTSEEN_KEY = 'last_seen';
    this.ONLINE_TTL = 5 * 60; // 5분 (Heartbeat 간격)
  }

  /**
   * 온라인 상태로 설정
   */
  async setOnline(characterId, characterName) {
    try {
      const userData = {
        id: characterId,
        name: characterName,
        lastSeen: new Date().toISOString()
      };

      if (!this.redisClient) {
        // Memory mode
        if (!this._memoryOnlineUsers) {
          this._memoryOnlineUsers = new Map();
        }
        if (!this._memoryLastSeen) {
          this._memoryLastSeen = new Map();
        }
        this._memoryOnlineUsers.set(characterId, userData);
        this._memoryLastSeen.set(characterId, userData.lastSeen);
        return { success: true, online: true };
      }

      // 온라인 상태 저장
      const onlineKey = `${this.ONLINE_KEY}:${characterId}`;
      await this.redisClient.setex(
        onlineKey,
        this.ONLINE_TTL,
        JSON.stringify(userData)
      );

      // 마지막 접속 시간 저장 (오래 유지)
      const lastSeenKey = `${this.LASTSEEN_KEY}:${characterId}`;
      await this.redisClient.set(lastSeenKey, userData.lastSeen);

      return { success: true, online: true };
    } catch (error) {
      console.error('setOnline error:', error);
      return { success: false, online: false };
    }
  }

  /**
   * 오프라인 상태로 설정
   */
  async setOffline(characterId) {
    try {
      if (!this.redisClient) {
        // Memory mode
        if (this._memoryOnlineUsers) {
          this._memoryOnlineUsers.delete(characterId);
        }
        return { success: true, online: false };
      }

      const onlineKey = `${this.ONLINE_KEY}:${characterId}`;
      await this.redisClient.del(onlineKey);

      return { success: true, online: false };
    } catch (error) {
      console.error('setOffline error:', error);
      return { success: false, online: false };
    }
  }

  /**
   * 캐릭터의 온라인 상태 확인
   */
  async isOnline(characterId) {
    try {
      if (!this.redisClient) {
        // Memory mode
        return this._memoryOnlineUsers?.has(characterId) || false;
      }

      const onlineKey = `${this.ONLINE_KEY}:${characterId}`;
      const exists = await this.redisClient.exists(onlineKey);
      return exists === 1;
    } catch (error) {
      console.error('isOnline error:', error);
      return false;
    }
  }

  /**
   * 모든 온라인 사용자 가져오기
   */
  async getOnlineUsers() {
    try {
      if (!this.redisClient) {
        // Memory mode
        const users = [];
        if (this._memoryOnlineUsers) {
          this._memoryOnlineUsers.forEach((data, id) => {
            users.push(data);
          });
        }
        return users;
      }

      // Pattern matching으로 모든 온라인 키 찾기
      const pattern = `${this.ONLINE_KEY}:*`;
      const keys = await this.redisClient.keys(pattern);

      if (keys.length === 0) {
        return [];
      }

      const users = [];
      for (const key of keys) {
        const userData = await this.redisClient.get(key);
        if (userData) {
          users.push(JSON.parse(userData));
        }
      }

      return users;
    } catch (error) {
      console.error('getOnlineUsers error:', error);
      return [];
    }
  }

  /**
   * 마지막 접속 시간 가져오기
   */
  async getLastSeen(characterId) {
    try {
      if (!this.redisClient) {
        // Memory mode
        return this._memoryLastSeen?.get(characterId) || null;
      }

      const lastSeenKey = `${this.LASTSEEN_KEY}:${characterId}`;
      const lastSeen = await this.redisClient.get(lastSeenKey);
      return lastSeen || null;
    } catch (error) {
      console.error('getLastSeen error:', error);
      return null;
    }
  }

  /**
   * 친구들의 온라인 상태 가져오기
   */
  async getFriendsOnlineStatus(friendIds) {
    try {
      const statuses = [];

      for (const friendId of friendIds) {
        const isOnline = await this.isOnline(friendId);
        const lastSeen = await this.getLastSeen(friendId);

        statuses.push({
          id: friendId,
          online: isOnline,
          lastSeen: lastSeen
        });
      }

      return statuses;
    } catch (error) {
      console.error('getFriendsOnlineStatus error:', error);
      return [];
    }
  }

  /**
   * 캐릭터의 모든 데이터 삭제
   */
  async clearUserData(characterId) {
    try {
      if (!this.redisClient) {
        // Memory mode
        if (this._memoryOnlineUsers) {
          this._memoryOnlineUsers.delete(characterId);
        }
        if (this._memoryLastSeen) {
          this._memoryLastSeen.delete(characterId);
        }
        return { success: true };
      }

      const onlineKey = `${this.ONLINE_KEY}:${characterId}`;
      const lastSeenKey = `${this.LASTSEEN_KEY}:${characterId}`;

      await this.redisClient.del(onlineKey);
      await this.redisClient.del(lastSeenKey);

      return { success: true };
    } catch (error) {
      console.error('clearUserData error:', error);
      return { success: false };
    }
  }

  /**
   * 메모리 모드 데이터 접근자 (테스트용)
   */
  _getMemoryData() {
    return {
      onlineUsers: Array.from(this._memoryOnlineUsers?.values() || []),
      lastSeen: Object.fromEntries(this._memoryLastSeen?.entries() || [])
    };
  }
}

export default OnlineTracker;