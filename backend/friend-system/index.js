/**
 * FriendSystem - 친구 시스템 통합
 *
 * FriendManager, FriendRequest, OnlineStatus를 통합하여
 * 전체 친구 시스템을 관리합니다.
 */

const FriendManager = require('./friend-manager');
const FriendRequest = require('./friend-request');
const OnlineStatus = require('./online-status');

class FriendSystem {
  constructor(redisClient) {
    this.redisClient = redisClient;
    this.friendManager = new FriendManager(redisClient);
    this.friendRequest = new FriendRequest(redisClient);
    this.onlineStatus = new OnlineStatus(redisClient);
  }

  /**
   * 친구 시스템 초기화
   * @returns {Promise<void>}
   */
  async initialize() {
    // 초기화할 로직이 있으면 여기에 추가
  }

  // ==================== FriendManager 위임 ====================

  /**
   * 친구 추가
   */
  async addFriend(characterId, friendId, friendName, metadata = {}) {
    return this.friendManager.addFriend(characterId, friendId, friendName, metadata);
  }

  /**
   * 친구 삭제
   */
  async removeFriend(characterId, friendId) {
    return this.friendManager.removeFriend(characterId, friendId);
  }

  /**
   * 친구 목록 조회
   */
  async getFriends(characterId) {
    return this.friendManager.getFriends(characterId);
  }

  /**
   * 친구 검색
   */
  async searchFriends(characterId, keyword) {
    return this.friendManager.searchFriends(characterId, keyword);
  }

  /**
   * 친구 존재 확인
   */
  async isFriend(characterId, friendId) {
    return this.friendManager.isFriend(characterId, friendId);
  }

  /**
   * 친구 수 조회
   */
  async getFriendCount(characterId) {
    return this.friendManager.getFriendCount(characterId);
  }

  /**
   * 친구 정보 조회
   */
  async getFriend(characterId, friendId) {
    return this.friendManager.getFriend(characterId, friendId);
  }

  // ==================== FriendRequest 위임 ====================

  /**
   * 친구 요청 전송
   */
  async sendFriendRequest(fromCharacterId, fromCharacterName, toCharacterId, message = '') {
    return this.friendRequest.sendRequest(fromCharacterId, fromCharacterName, toCharacterId, message);
  }

  /**
   * 친구 요청 수락
   */
  async acceptFriendRequest(toCharacterId, fromCharacterId, fromCharacterName) {
    return this.friendRequest.acceptRequest(toCharacterId, fromCharacterId, this.friendManager);
  }

  /**
   * 친구 요청 거절
   */
  async rejectFriendRequest(toCharacterId, fromCharacterId) {
    return this.friendRequest.rejectRequest(toCharacterId, fromCharacterId);
  }

  /**
   * 친구 요청 취소
   */
  async cancelFriendRequest(fromCharacterId, toCharacterId) {
    return this.friendRequest.cancelRequest(fromCharacterId, toCharacterId);
  }

  /**
   * 수신 요청 목록 조회
   */
  async getFriendRequests(characterId) {
    return this.friendRequest.getRequests(characterId);
  }

  /**
   * 보낸 요청 목록 조회
   */
  async getPendingFriendRequests(characterId) {
    return this.friendRequest.getPendingRequests(characterId);
  }

  /**
   * 요청 조회
   */
  async getFriendRequest(toCharacterId, fromCharacterId) {
    return this.friendRequest.getRequest(toCharacterId, fromCharacterId);
  }

  /**
   * 대기 중 요청 존재 확인
   */
  async hasPendingFriendRequest(fromCharacterId, toCharacterId) {
    return this.friendRequest.hasPendingRequest(fromCharacterId, toCharacterId);
  }

  /**
   * 대기 중 요청 수 조회
   */
  async getFriendRequestCount(characterId) {
    return this.friendRequest.getRequestCount(characterId);
  }

  // ==================== OnlineStatus 위임 ====================

  /**
   * 온라인 상태 설정
   */
  async setOnlineStatus(characterId, statusMessage = '') {
    return this.onlineStatus.setOnline(characterId, statusMessage);
  }

  /**
   * 오프라인 상태 설정
   */
  async setOfflineStatus(characterId) {
    return this.onlineStatus.setOffline(characterId);
  }

  /**
   * 온라인 상태 확인
   */
  async getOnlineStatus(characterId) {
    return this.onlineStatus.getOnlineStatus(characterId);
  }

  /**
   * 온라인 친구 목록 조회
   */
  async getOnlineFriends(characterId) {
    return this.onlineStatus.getOnlineFriends(characterId, this.friendManager);
  }

  /**
   * 오프라인 친구 목록 조회
   */
  async getOfflineFriends(characterId) {
    return this.onlineStatus.getOfflineFriends(characterId, this.friendManager);
  }

  /**
   * 마지막 접속 시간 조회
   */
  async getLastSeen(characterId) {
    return this.onlineStatus.getLastSeen(characterId);
  }

  /**
   * 상태 메시지 업데이트
   */
  async updateStatusMessage(characterId, statusMessage) {
    return this.onlineStatus.updateStatusMessage(characterId, statusMessage);
  }

  // ==================== 통합 기능 ====================

  /**
   * 캐릭터의 전체 친구 데이터 조회
   * - 친구 목록
   * - 수신 요청
   * - 보낸 요청
   * - 온라인 친구
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<Object>} 전체 친구 데이터
   */
  async getFriendData(characterId) {
    try {
      const friends = await this.getFriends(characterId);
      const requests = await this.getFriendRequests(characterId);
      const pending = await this.getPendingFriendRequests(characterId);
      const onlineFriends = await this.getOnlineFriends(characterId);

      return {
        friends,
        requests,
        pending,
        onlineFriends,
        stats: {
          totalFriends: friends.length,
          pendingRequests: requests.length,
          sentRequests: pending.length,
          onlineFriends: onlineFriends.length
        }
      };
    } catch (error) {
      console.error('친구 데이터 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 다른 캐릭터와의 관계 확인
   * - 서로 친구인지
   * - 요청을 보낸 적이 있는지
   * - 요청을 받았는지
   * @param {string} characterId1 - 캐릭터 1 ID
   * @param {string} characterId2 - 캐릭터 2 ID
   * @returns {Promise<Object>} 관계 데이터
   */
  async getRelationship(characterId1, characterId2) {
    try {
      const isFriend = await this.isFriend(characterId1, characterId2);
      const hasPending = await this.hasPendingFriendRequest(characterId1, characterId2);
      const hasRequest = await this.getFriendRequest(characterId2, characterId1);

      return {
        isFriend,
        hasRequestTo: hasPending,
        hasRequestFrom: hasRequest !== null,
        requestStatus: hasRequest ? hasRequest.status : null
      };
    } catch (error) {
      console.error('관계 확인 실패:', error);
      throw error;
    }
  }

  /**
   * 친구 추천 시스템 (간단 버전)
   * - 현재 친구가 아닌 캐릭터 목록 반환
   * - 실제 구현시 캐릭터 데이터베이스와 연결 필요
   * @param {string} characterId - 캐릭터 ID
   * @param {Array} allCharacters - 모든 캐릭터 목록
   * @returns {Promise<Array>} 추천 친구 목록
   */
  async getFriendRecommendations(characterId, allCharacters = []) {
    try {
      const friends = await this.getFriends(characterId);

      const friendIds = friends.map(friend => friend.characterId);

      // 자신과 이미 친구인 캐릭터 제외
      const recommendations = allCharacters.filter(character =>
        character.characterId !== characterId &&
        !friendIds.includes(character.characterId)
      );

      return recommendations.slice(0, 10); // 최대 10개
    } catch (error) {
      console.error('친구 추천 실패:', error);
      throw error;
    }
  }

  /**
   * 연결 종료 시 데이터 정리
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<void>}
   */
  async cleanup(characterId) {
    await this.setOfflineStatus(characterId);
  }
}

module.exports = FriendSystem;