/**
 * Friend System - Phase 9
 * 친구 시스템 통합 모듈
 */

import FriendManager from './friend-manager.js';
import FriendRequestManager from './friend-request.js';
import OnlineTracker from './online-tracker.js';

/**
 * Friend System Class
 */
class FriendSystem {
  constructor(redisClient = null) {
    this.friendManager = new FriendManager(redisClient);
    this.requestManager = new FriendRequestManager(redisClient);
    this.onlineTracker = new OnlineTracker(redisClient);
  }

  /**
   * 친구 관리 시스템 가져오기
   */
  getFriendManager() {
    return this.friendManager;
  }

  /**
   * 친구 요청 시스템 가져오기
   */
  getRequestManager() {
    return this.requestManager;
  }

  /**
   * 온라인 추적 시스템 가져오기
   */
  getOnlineTracker() {
    return this.onlineTracker;
  }

  /**
   * 친구 요청 전송 & 검증
   */
  async sendFriendRequest(fromId, fromName, toId, toName) {
    try {
      // 자신에게 요청 불가
      if (fromId === toId) {
        return { success: false, message: 'Cannot send request to yourself' };
      }

      // 이미 친구인지 확인
      const isAlreadyFriend = await this.friendManager.isFriend(fromId, toId);
      if (isAlreadyFriend) {
        return { success: false, message: 'Already friends' };
      }

      // 대기 중인 요청 확인
      const existingRequest = await this.requestManager.findRequest(fromId, toId);
      if (existingRequest) {
        return { success: false, message: 'Request already exists' };
      }

      // 요청 전송
      const result = await this.requestManager.sendRequest(fromId, fromName, toId, toName);

      if (!result.success) {
        return result;
      }

      return { success: true, request: result.request };
    } catch (error) {
      console.error('sendFriendRequest error:', error);
      return { success: false, message: 'Failed to send friend request' };
    }
  }

  /**
   * 친구 요청 수락 & 친구 추가
   */
  async acceptFriendRequest(fromId, toId, friendName) {
    try {
      // 요청 수락
      const acceptResult = await this.requestManager.acceptRequest(fromId, toId);

      if (!acceptResult.success) {
        return acceptResult;
      }

      // 서로 친구로 추가
      await this.friendManager.addFriend(fromId, toId, acceptResult.request.to.name);
      await this.friendManager.addFriend(toId, fromId, friendName);

      return { success: true, request: acceptResult.request };
    } catch (error) {
      console.error('acceptFriendRequest error:', error);
      return { success: false, message: 'Failed to accept friend request' };
    }
  }

  /**
   * 친구 요청 거절
   */
  async rejectFriendRequest(fromId, toId) {
    try {
      const result = await this.requestManager.rejectRequest(fromId, toId);
      return result;
    } catch (error) {
      console.error('rejectFriendRequest error:', error);
      return { success: false, message: 'Failed to reject friend request' };
    }
  }

  /**
   * 친구 삭제 (양방향)
   */
  async removeFriend(characterId, friendId) {
    try {
      const result1 = await this.friendManager.removeFriend(characterId, friendId);
      const result2 = await this.friendManager.removeFriend(friendId, characterId);

      return {
        success: result1.success && result2.success,
        message: result1.success ? 'Friend removed' : 'Failed to remove friend'
      };
    } catch (error) {
      console.error('removeFriend error:', error);
      return { success: false, message: 'Failed to remove friend' };
    }
  }

  /**
   * 친구 리스트 & 온라인 상태 가져오기
   */
  async getFriendListWithStatus(characterId) {
    try {
      const friendList = await this.friendManager.getFriendList(characterId);
      const friendIds = friendList.map(f => f.id);

      if (friendIds.length === 0) {
        return friendList;
      }

      const statuses = await this.onlineTracker.getFriendsOnlineStatus(friendIds);

      const friendListWithStatus = friendList.map(friend => {
        const status = statuses.find(s => s.id === friend.id);
        return {
          ...friend,
          online: status?.online || false,
          lastSeen: status?.lastSeen || null
        };
      });

      return friendListWithStatus;
    } catch (error) {
      console.error('getFriendListWithStatus error:', error);
      return [];
    }
  }

  /**
   * 캐릭터 접속 처리
   */
  async characterOnline(characterId, characterName) {
    try {
      return await this.onlineTracker.setOnline(characterId, characterName);
    } catch (error) {
      console.error('characterOnline error:', error);
      return { success: false, online: false };
    }
  }

  /**
   * 캐릭터 접속 종료 처리
   */
  async characterOffline(characterId) {
    try {
      return await this.onlineTracker.setOffline(characterId);
    } catch (error) {
      console.error('characterOffline error:', error);
      return { success: false, online: false };
    }
  }

  /**
   * 캐릭터 데이터 전체 삭제
   */
  async clearCharacterData(characterId) {
    try {
      await this.friendManager.clearFriendData(characterId);
      await this.requestManager.clearRequestData(characterId);
      await this.onlineTracker.clearUserData(characterId);

      return { success: true };
    } catch (error) {
      console.error('clearCharacterData error:', error);
      return { success: false };
    }
  }

  /**
   * 시스템 통계
   */
  async getSystemStats() {
    try {
      const onlineUsers = await this.onlineTracker.getOnlineUsers();
      return {
        onlineUsersCount: onlineUsers.length,
        onlineUserIds: onlineUsers.map(u => u.id)
      };
    } catch (error) {
      console.error('getSystemStats error:', error);
      return {
        onlineUsersCount: 0,
        onlineUserIds: []
      };
    }
  }
}

// Single instance
let friendSystem = null;

/**
 * Friend System 초기화
 */
function initializeFriendSystem(redisClient = null) {
  if (!friendSystem) {
    friendSystem = new FriendSystem(redisClient);
  }
  return friendSystem;
}

/**
 * Friend System 인스턴스 가져오기
 */
function getFriendSystem() {
  if (!friendSystem) {
    friendSystem = new FriendSystem(null);
  }
  return friendSystem;
}

export {
  FriendSystem,
  initializeFriendSystem,
  getFriendSystem
};