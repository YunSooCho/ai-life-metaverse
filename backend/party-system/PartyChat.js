/**
 * PartyChat - 파티 채팅 시스템
 * 
 * 기능:
 * - 파티 전용 채팅 채널
 * - 파티 멤버만 볼 수 있는 메시지
 * - 파티 채팅 히스토리
 */

import EventEmitter from 'events';

export class PartyChat extends EventEmitter {
  constructor() {
    super();
    this.chatHistories = new Map(); // partyId => Array<Message>
    this.maxHistorySize = 100; // 채팅 히스토리 최대 100개
  }

  /**
   * 파티 채팅 초기화
   * @param {string} partyId - 파티 아이디
   */
  initChat(partyId) {
    if (!this.chatHistories.has(partyId)) {
      this.chatHistories.set(partyId, []);
    }
  }

  /**
   * 파티 채팅 정리
   * @param {string} partyId - 파티 아이디
   */
  cleanupChat(partyId) {
    this.chatHistories.delete(partyId);
  }

  /**
   * 메시지 전송
   * @param {string} partyId - 파티 아이디
   * @param {string} playerId - 플레이어 아이디
   * @param {string} playerName - 플레이어 이름
   * @param {string} message - 메시지 내용
   * @returns {Object} 메시지 정보
   */
  sendMessage(partyId, playerId, playerName, message) {
    // 채팅 초기화 확인
    if (!this.chatHistories.has(partyId)) {
      this.initChat(partyId);
    }

    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      partyId,
      playerId,
      playerName,
      message,
      timestamp: Date.now(),
      type: 'text'
    };

    // 히스토리에 추가
    const history = this.chatHistories.get(partyId);
    history.push(msg);

    // 최대 크기 초과 시 오래된 메시지 삭제
    if (history.length > this.maxHistorySize) {
      history.shift(); // 가장 오래된 메시지 삭제
    }

    this.emit('party:message', { partyId, message: msg });

    return {
      success: true,
      message: msg
    };
  }

  /**
   * 시스템 메시지 전송 (입장/퇴장/해체 등)
   * @param {string} partyId - 파티 아이디
   * @param {string} type - 메시지 타입 (joined, left, kicked, leadership, disbanded)
   * @param {Object} data - 추가 데이터
   * @returns {Object} 메시지 정보
   */
  sendSystemMessage(partyId, type, data = {}) {
    if (!this.chatHistories.has(partyId)) {
      this.initChat(partyId);
    }

    const msg = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      partyId,
      type,
      data,
      timestamp: Date.now(),
      isSystem: true
    };

    const history = this.chatHistories.get(partyId);
    history.push(msg);

    if (history.length > this.maxHistorySize) {
      history.shift();
    }

    this.emit('party:systemMessage', { partyId, message: msg });

    return {
      success: true,
      message: msg
    };
  }

  /**
   * 채팅 히스토리 조회
   * @param {string} partyId - 파티 아이디
   * @param {number} limit - 조회할 메시지 수 (기본값: 50)
   * @returns {Object} 채팅 히스토리
   */
  getChatHistory(partyId, limit = 50) {
    const history = this.chatHistories.get(partyId);

    if (!history) {
      return {
        success: true,
        partyId,
        messages: []
      };
    }

    // 최근 메시지부터 반환
    const recentMessages = history.slice(-limit).reverse();

    return {
      success: true,
      partyId,
      totalMessages: history.length,
      messages: recentMessages
    };
  }

  /**
   * 히스토리 최대 크기 설정
   * @param {number} size - 최대 크기
   */
  setMaxHistorySize(size) {
    this.maxHistorySize = Math.max(10, size); // 최소 10개
    
    // 현재 히스토리 정리
    this.chatHistories.forEach((history) => {
      while (history.length > this.maxHistorySize) {
        history.shift();
      }
    });
  }

  /**
   * 특정 범위의 메시지 조회 (페이지네이션)
   * @param {string} partyId - 파티 아이디
   * @param {number} offset - 시작 인덱스
   * @param {number} limit - 조회할 개수
   * @returns {Object} 메시지 목록
   */
  getMessagesInRange(partyId, offset, limit) {
    const history = this.chatHistories.get(partyId);

    if (!history) {
      return {
        success: false,
        error: 'NOT_FOUND',
        messages: []
      };
    }

    const messages = history.slice(offset, offset + limit);

    return {
      success: true,
      partyId,
      totalMessages: history.length,
      offset,
      limit,
      messages
    };
  }

  /**
   * 모든 파티 채팅 히스토리 크기 조회 (디버깅용)
   * @returns {Object} 히스토리 정보
   */
  getStats() {
    const stats = {
      activeParties: this.chatHistories.size,
      totalMessages: 0,
      histories: {}
    };

    this.chatHistories.forEach((history, partyId) => {
      stats.totalMessages += history.length;
      stats.histories[partyId] = history.length;
    });

    return stats;
  }
}