import { TradeIdGenerator } from './trade-id-generator.js';

/**
 * TradeManager - 개인 간 거래 시스템
 *
 * 기능:
 * - 거래 요청 전송
 * - 거래 요청 수락/거절/취소
 * - 거래 아이템 설정
 * - 거래 확정 및 이동
 * - 거래 기록 및 조회
 */
export class TradeManager {
  constructor() {
    this.activeTrades = new Map(); // tradeId -> trade data
    this.tradeRequests = new Map(); // tradeRequestId -> request data
    this.tradeHistory = new Map(); // characterId -> history[]
    this.idGenerator = new TradeIdGenerator();
  }

  /**
   * 거래 요청 전송
   */
  sendRequest(fromCharacterId, fromCharacterName, toCharacterId, toCharacterName) {
    const requestId = this.idGenerator.generateRequestId();

    const request = {
      requestId,
      fromCharacterId,
      fromCharacterName,
      toCharacterId,
      toCharacterName,
      status: 'pending', // pending, accepted, rejected, cancelled, expired
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5분 만료
    };

    this.tradeRequests.set(requestId, request);

    return {
      success: true,
      requestId,
      request
    };
  }

  /**
   * 거래 요청 수락
   */
  acceptRequest(requestId) {
    const request = this.tradeRequests.get(requestId);

    if (!request) {
      return {
        success: false,
        error: 'Trade request not found'
      };
    }

    if (request.status !== 'pending') {
      return {
        success: false,
        error: 'Trade request is not pending'
      };
    }

    if (Date.now() > request.expiresAt) {
      request.status = 'expired';
      return {
        success: false,
        error: 'Trade request has expired'
      };
    }

    // 거래 생성
    const tradeId = this.idGenerator.generateTradeId();

    const trade = {
      tradeId,
      requestId,
      participant1: {
        characterId: request.fromCharacterId,
        characterName: request.fromCharacterName,
        items: [],
        coins: 0
      },
      participant2: {
        characterId: request.toCharacterId,
        characterName: request.toCharacterName,
        items: [],
        coins: 0
      },
      status: 'active', // active, confirmed, cancelled
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10분 만료
    };

    this.activeTrades.set(tradeId, trade);

    // 요청 상태 업데이트
    request.status = 'accepted';

    return {
      success: true,
      tradeId,
      trade
    };
  }

  /**
   * 거래 요청 거절
   */
  rejectRequest(requestId) {
    const request = this.tradeRequests.get(requestId);

    if (!request) {
      return {
        success: false,
        error: 'Trade request not found'
      };
    }

    if (request.status !== 'pending') {
      return {
        success: false,
        error: 'Trade request is not pending'
      };
    }

    request.status = 'rejected';

    return {
      success: true,
      requestId,
      request
    };
  }

  /**
   * 거래 요청 취소
   */
  cancelRequest(requestId, characterId) {
    const request = this.tradeRequests.get(requestId);

    if (!request) {
      return {
        success: false,
        error: 'Trade request not found'
      };
    }

    if (request.fromCharacterId !== characterId) {
      return {
        success: false,
        error: 'Only the sender can cancel the request'
      };
    }

    if (request.status !== 'pending') {
      return {
        success: false,
        error: 'Trade request is not pending'
      };
    }

    request.status = 'cancelled';

    return {
      success: true,
      requestId,
      request
    };
  }

  /**
   * 수신 요청 목록 조회
   */
  getReceivedRequests(characterId) {
    const received = [];

    for (const [requestId, request] of this.tradeRequests) {
      if (request.toCharacterId === characterId && request.status === 'pending') {
        received.push({
          requestId,
          fromCharacterName: request.fromCharacterName,
          createdAt: request.createdAt,
          expiresAt: request.expiresAt
        });
      }
    }

    return received;
  }

  /**
   * 발신 요청 목록 조회
   */
  getSentRequests(characterId) {
    const sent = [];

    for (const [requestId, request] of this.tradeRequests) {
      if (request.fromCharacterId === characterId && request.status === 'pending') {
        sent.push({
          requestId,
          toCharacterName: request.toCharacterName,
          createdAt: request.createdAt,
          expiresAt: request.expiresAt
        });
      }
    }

    return sent;
  }

  /**
   * 거래 가져오기
   */
  getTrade(tradeId) {
    return this.activeTrades.get(tradeId);
  }

  /**
   * 거래 아이템 설정
   */
  setTradeItems(tradeId, characterId, items, coins = 0) {
    const trade = this.activeTrades.get(tradeId);

    if (!trade) {
      return {
        success: false,
        error: 'Trade not found'
      };
    }

    if (trade.status !== 'active') {
      return {
        success: false,
        error: 'Trade is not active'
      };
    }

    if (
      trade.participant1.characterId !== characterId &&
      trade.participant2.characterId !== characterId
    ) {
      return {
        success: false,
        error: 'Character is not a participant in this trade'
      };
    }

    // 참가자 정보 업데이트
    if (trade.participant1.characterId === characterId) {
      trade.participant1.items = items;
      trade.participant1.coins = coins;
      trade.participant1.confirmed = false;
    } else {
      trade.participant2.items = items;
      trade.participant2.coins = coins;
      trade.participant2.confirmed = false;
    }

    return {
      success: true,
      trade
    };
  }

  /**
   * 거래 확정 (개별)
   */
  confirmTradeItem(tradeId, characterId) {
    const trade = this.activeTrades.get(tradeId);

    if (!trade) {
      return {
        success: false,
        error: 'Trade not found'
      };
    }

    if (trade.status !== 'active') {
      return {
        success: false,
        error: 'Trade is not active'
      };
    }

    // 참가자 확인 및 확정
    let otherParticipantConfirmed = false;

    if (trade.participant1.characterId === characterId) {
      trade.participant1.confirmed = true;
      otherParticipantConfirmed = trade.participant2.confirmed;
    } else if (trade.participant2.characterId === characterId) {
      trade.participant2.confirmed = true;
      otherParticipantConfirmed = trade.participant1.confirmed;
    } else {
      return {
        success: false,
        error: 'Character is not a participant in this trade'
      };
    }

    // 양쪽 다 확정되면 거래 완료
    if (trade.participant1.confirmed && trade.participant2.confirmed) {
      trade.status = 'confirmed';
      trade.completedAt = Date.now();

      // 거래 기록 추가
      this.addToHistory(trade);

      return {
        success: true,
        trade,
        completed: true
      };
    }

    return {
      success: true,
      trade,
      completed: false,
      message: otherParticipantConfirmed ? 'Waiting for other participant to confirm' : 'Confirmed'
    };
  }

  /**
   * 거래 취소
   */
  cancelTrade(tradeId, characterId) {
    const trade = this.activeTrades.get(tradeId);

    if (!trade) {
      return {
        success: false,
        error: 'Trade not found'
      };
    }

    if (trade.status !== 'active') {
      return {
        success: false,
        error: 'Trade is not active'
      };
    }

    if (
      trade.participant1.characterId !== characterId &&
      trade.participant2.characterId !== characterId
    ) {
      return {
        success: false,
        error: 'Character is not a participant in this trade'
      };
    }

    trade.status = 'cancelled';
    trade.cancelledAt = Date.now();
    trade.cancelledBy = characterId;

    return {
      success: true,
      trade
    };
  }

  /**
   * 거래 기록 추가
   */
  addToHistory(trade) {
    const historyEntry = {
      tradeId: trade.tradeId,
      participant1: {
        characterId: trade.participant1.characterId,
        characterName: trade.participant1.characterName,
        items: trade.participant1.items,
        coins: trade.participant1.coins
      },
      participant2: {
        characterId: trade.participant2.characterId,
        characterName: trade.participant2.characterName,
        items: trade.participant2.items,
        coins: trade.participant2.coins
      },
      status: trade.status,
      createdAt: trade.createdAt,
      completedAt: trade.completedAt
    };

    // 양쪽 참가자에게 기록 추가
    for (const characterId of [trade.participant1.characterId, trade.participant2.characterId]) {
      if (!this.tradeHistory.has(characterId)) {
        this.tradeHistory.set(characterId, []);
      }

      const history = this.tradeHistory.get(characterId);
      history.push(historyEntry);

      // 최대 100개 기록 유지
      if (history.length > 100) {
        history.shift();
      }
    }
  }

  /**
   * 거래 기록 조회
   */
  getTradeHistory(characterId, limit = 20) {
    const history = this.tradeHistory.get(characterId) || [];

    return history
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, limit);
  }

  /**
   * 만료된 거래 정리
   */
  cleanupExpiredTrades() {
    const now = Date.now();

    for (const [tradeId, trade] of this.activeTrades) {
      if (trade.expiresAt < now && trade.status === 'active') {
        trade.status = 'expired';
        trade.expiredAt = now;

        console.log(`🧹 거래 만료 정리: ${tradeId}`);
      }
    }

    for (const [requestId, request] of this.tradeRequests) {
      if (request.expiresAt < now && request.status === 'pending') {
        request.status = 'expired';

        console.log(`🧹 거래 요청 만료 정리: ${requestId}`);
      }
    }
  }

  /**
   * 시스템 통계
   */
  getSystemStats() {
    const activeTrades = [];
    const pendingRequests = [];

    for (const [tradeId, trade] of this.activeTrades) {
      if (trade.status === 'active') {
        activeTrades.push({
          tradeId,
          participant1Name: trade.participant1.characterName,
          participant2Name: trade.participant2.characterName,
          createdAt: trade.createdAt,
          expiresAt: trade.expiresAt
        });
      }
    }

    for (const [requestId, request] of this.tradeRequests) {
      if (request.status === 'pending') {
        pendingRequests.push({
          requestId,
          fromCharacterName: request.fromCharacterName,
          toCharacterName: request.toCharacterName,
          createdAt: request.createdAt,
          expiresAt: request.expiresAt
        });
      }
    }

    return {
      activeTrades: activeTrades.length,
      pendingRequests: pendingRequests.length,
      totalTrades: this.activeTrades.size,
      totalRequests: this.tradeRequests.size,
      historyEntries: Array.from(this.tradeHistory.values()).reduce((sum, h) => sum + h.length, 0)
    };
  }
}

export default TradeManager;