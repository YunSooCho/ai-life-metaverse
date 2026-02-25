/**
 * PartyChat - 파티 전용 채팅 시스템
 * 파티 멤버만 볼 수 있는 메시지 및 히스토리 관리
 * Redis 기반 영속화 + 메모리 fallback
 */

export default class PartyChat {
  constructor(redisClient = null) {
    this.redis = redisClient;
    this.chatHistories = new Map();
    this.maxHistoryLength = 100;
  }

  /**
   * 파티 채팅 메시지 전송
   * @param {string} partyId - 파티 ID
   * @param {string} playerId - 플레이어 ID
   * @param {string} playerName - 플레이어 이름
   * @param {string} message - 메시지 내용
   * @returns {Promise<Object>} 전송된 메시지 정보
   */
  async sendMessage(partyId, playerId, playerName, message) {
    const chatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      partyId,
      playerId,
      playerName,
      message,
      type: 'text',
      timestamp: Date.now()
    };

    // 채팅 히스토리에 추가
    if (!this.chatHistories.has(partyId)) {
      this.chatHistories.set(partyId, []);
    }

    const history = this.chatHistories.get(partyId);
    history.push(chatMessage);

    // 히스토리 길이 제한
    if (history.length > this.maxHistoryLength) {
      history.shift();
    }

    // Redis에 저장
    if (this.redis) {
      await this.redis.rPush(
        `party_chat:${partyId}`,
        JSON.stringify(chatMessage)
      );

      const length = await this.redis.lLen(`party_chat:${partyId}`);
      if (length > this.maxHistoryLength) {
        await this.redis.lTrim(`party_chat:${partyId}`, -this.maxHistoryLength, -1);
      }

      await this.redis.expire(`party_chat:${partyId}`, 86400);
    }

    return chatMessage;
  }

  /**
   * 시스템 메시지 전송
   * @param {string} partyId - 파티 ID
   * @param {string} message - 시스템 메시지 내용
   * @returns {Promise<Object>} 전송된 메시지 정보
   */
  async sendSystemMessage(partyId, message) {
    const systemMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      partyId,
      playerId: 'system',
      playerName: 'System',
      message,
      type: 'system',
      timestamp: Date.now()
    };

    // 채팅 히스토리에 추가
    if (!this.chatHistories.has(partyId)) {
      this.chatHistories.set(partyId, []);
    }

    const history = this.chatHistories.get(partyId);
    history.push(systemMessage);

    // 히스토리 길이 제한
    if (history.length > this.maxHistoryLength) {
      history.shift();
    }

    // Redis에 저장
    if (this.redis) {
      await this.redis.rPush(
        `party_chat:${partyId}`,
        JSON.stringify(systemMessage)
      );
      await this.redis.expire(`party_chat:${partyId}`, 86400);
    }

    return systemMessage;
  }

  /**
   * 퀘스트 메시지 전송
   * @param {string} partyId - 파티 ID
   * @param {string} message - 퀘스트 메시지 내용
   * @returns {Promise<Object>} 전송된 메시지 정보
   */
  async sendQuestMessage(partyId, message) {
    const questMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      partyId,
      playerId: 'quest',
      playerName: 'Quest',
      message,
      type: 'quest',
      timestamp: Date.now()
    };

    // 채팅 히스토리에 추가
    if (!this.chatHistories.has(partyId)) {
      this.chatHistories.set(partyId, []);
    }

    const history = this.chatHistories.get(partyId);
    history.push(questMessage);

    // 히스토리 길이 제한
    if (history.length > this.maxHistoryLength) {
      history.shift();
    }

    // Redis에 저장
    if (this.redis) {
      await this.redis.rPush(
        `party_chat:${partyId}`,
        JSON.stringify(questMessage)
      );
      await this.redis.expire(`party_chat:${partyId}`, 86400);
    }

    return questMessage;
  }

  /**
   * 파티 채팅 히스토리 조회
   * @param {string} partyId - 파티 ID
   * @param {number} limit - 조회할 메시지 수 (최신 n개)
   * @returns {Promise<Array>} 메시지 목록
   */
  async getChatHistory(partyId, limit = 50) {
    const history = this.chatHistories.get(partyId);

    if (!history) {
      return [];
    }

    // 최신 메시지부터 limit개 반환
    return history.slice(-limit);
  }

  /**
   * 파티 채팅 히스토리 삭제
   * @param {string} partyId - 파티 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async clearChatHistory(partyId) {
    this.chatHistories.delete(partyId);

    if (this.redis) {
      await this.redis.del(`party_chat:${partyId}`);
    }

    return { success: true };
  }
}