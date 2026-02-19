import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TradeManager } from '../trade-manager.js';
import { TradeIdGenerator } from '../trade-id-generator.js';

describe('TradeManager', () => {
  let tradeManager;

  beforeEach(() => {
    tradeManager = new TradeManager();
  });

  describe('거래 요청', () => {
    it('거래 요청 전송 성공', () => {
      const result = tradeManager.sendRequest(
        'char1',
        'Player1',
        'char2',
        'Player2'
      );

      expect(result.success).toBe(true);
      expect(result.requestId).toMatch(/^TRQ-\d+-\d+$/);
      expect(result.request.fromCharacterId).toBe('char1');
      expect(result.request.toCharacterId).toBe('char2');
      expect(result.request.status).toBe('pending');
    });

    it('거래 요청 ID 생성 시간 순서', () => {
      const result1 = tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      const result2 = tradeManager.sendRequest('char3', 'P3', 'char4', 'P4');

      expect(result1.requestId).not.toBe(result2.requestId);
      expect(result1.request.createdAt).toBeLessThanOrEqual(result2.request.createdAt);
    });

    it('수신 요청 목록 조회', () => {
      tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      tradeManager.sendRequest('char3', 'P3', 'char2', 'P4');

      const received = tradeManager.getReceivedRequests('char2');
      expect(received.length).toBe(2);
      expect(received[0].fromCharacterName).toBe('P1');
      expect(received[1].fromCharacterName).toBe('P3');
    });

    it('발신 요청 목록 조회', () => {
      tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      tradeManager.sendRequest('char1', 'P1', 'char3', 'P3');

      const sent = tradeManager.getSentRequests('char1');
      expect(sent.length).toBe(2);
      expect(sent[0].toCharacterName).toBe('P2');
      expect(sent[1].toCharacterName).toBe('P3');
    });
  });

  describe('거래 요청 수락/거절/취소', () => {
    it('거래 요청 수락 성공', () => {
      const request = tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      const result = tradeManager.acceptRequest(request.requestId);

      expect(result.success).toBe(true);
      expect(result.tradeId).toMatch(/^TRD-\d+-\d+$/);
      expect(result.trade.participant1.characterId).toBe('char1');
      expect(result.trade.participant2.characterId).toBe('char2');
      expect(result.trade.status).toBe('active');
    });

    it('거래 요청 거절 성공', () => {
      const request = tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      const result = tradeManager.rejectRequest(request.requestId);

      expect(result.success).toBe(true);
      expect(result.request.status).toBe('rejected');
    });

    it('거래 요청 취소 성공', () => {
      const request = tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      const result = tradeManager.cancelRequest(request.requestId, 'char1');

      expect(result.success).toBe(true);
      expect(result.request.status).toBe('cancelled');
    });

    it('거래 요청 취소 - 보내는 사람만 가능', () => {
      const request = tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      const result = tradeManager.cancelRequest(request.requestId, 'char2');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Only the sender can cancel the request');
    });

    it('거래 요청 수락 - 만료된 요청', () => {
      const request = tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      // 만료 시간 조작 (실제로는 시간이 흘러야 함)
      request.request.expiresAt = Date.now() - 1000;

      const result = tradeManager.acceptRequest(request.requestId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Trade request has expired');
    });

    it('거래 요청 - 존재하지 않는 요청', () => {
      const result = tradeManager.acceptRequest('non-existent');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Trade request not found');
    });
  });

  describe('거래 아이템 설정', () => {
    it('거래 아이템 설정 성공', () => {
      const request = tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      const trade = tradeManager.acceptRequest(request.requestId);

      const result = tradeManager.setTradeItems(
        trade.tradeId,
        'char1',
        [{ id: 'sword', name: '검', quantity: 1 }],
        100
      );

      expect(result.success).toBe(true);
      expect(result.trade.participant1.items).toEqual([{ id: 'sword', name: '검', quantity: 1 }]);
      expect(result.trade.participant1.coins).toBe(100);
    });

    it('거래 아이템 설정 - 참가자가 아닌 경우', () => {
      const request = tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      const trade = tradeManager.acceptRequest(request.requestId);

      const result = tradeManager.setTradeItems(
        trade.tradeId,
        'char3', // 참가자 아님
        [{ id: 'sword', name: '검', quantity: 1 }],
        100
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Character is not a participant in this trade');
    });

    it('거래 아이템 설정 - 존재하지 않는 거래', () => {
      const result = tradeManager.setTradeItems('non-existent', 'char1', [], 0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Trade not found');
    });
  });

  describe('거래 확정', () => {
    it('거래 확정 - 양쪽 다 확정 시 완료', () => {
      const request = tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      const trade = tradeManager.acceptRequest(request.requestId);

      tradeManager.setTradeItems(trade.tradeId, 'char1', [{ id: 'sword', name: '검', quantity: 1 }], 0);
      tradeManager.setTradeItems(trade.tradeId, 'char2', [], 100);

      const result1 = tradeManager.confirmTradeItem(trade.tradeId, 'char1');
      expect(result1.success).toBe(true);
      expect(result1.completed).toBe(false);

      const result2 = tradeManager.confirmTradeItem(trade.tradeId, 'char2');
      expect(result2.success).toBe(true);
      expect(result2.completed).toBe(true);
      expect(trade.status).toBe('confirmed');
    });

    it('거래 확정 - 한쪽만 확정 시 대기', () => {
      const request = tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      const trade = tradeManager.acceptRequest(request.requestId);

      tradeManager.setTradeItems(trade.tradeId, 'char1', [{ id: 'sword', name: '검', quantity: 1 }], 0);

      const result = tradeManager.confirmTradeItem(trade.tradeId, 'char1');
      expect(result.success).toBe(true);
      expect(result.completed).toBe(false);
    });

    it('거래 취소 성공', () => {
      const request = tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      const trade = tradeManager.acceptRequest(request.requestId);

      const result = tradeManager.cancelTrade(trade.tradeId, 'char1');
      expect(result.success).toBe(true);
      expect(trade.status).toBe('cancelled');
    });
  });

  describe('거래 기록', () => {
    it('거래 완료 시 기록 추가', () => {
      const request = tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      const trade = tradeManager.acceptRequest(request.requestId);

      tradeManager.setTradeItems(trade.tradeId, 'char1', [{ id: 'sword', name: '검', quantity: 1 }], 0);
      tradeManager.setTradeItems(trade.tradeId, 'char2', [], 100);

      tradeManager.confirmTradeItem(trade.tradeId, 'char1');
      tradeManager.confirmTradeItem(trade.tradeId, 'char2');

      const history1 = tradeManager.getTradeHistory('char1');
      const history2 = tradeManager.getTradeHistory('char2');

      expect(history1.length).toBeGreaterThan(0);
      expect(history2.length).toBeGreaterThan(0);
      expect(history1[0].tradeId).toBe(trade.tradeId);
      expect(history2[0].tradeId).toBe(trade.tradeId);
    });

    it('거래 기록 조회 - 최신순', () => {
      tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      const request2 = tradeManager.sendRequest('char1', 'P1', 'char3', 'P3');
      const trade2 = tradeManager.acceptRequest(request2.requestId);

      tradeManager.setTradeItems(trade2.tradeId, 'char1', [{ id: 'shield', name: '방패', quantity: 1 }], 0);
      tradeManager.setTradeItems(trade2.tradeId, 'char3', [], 200);

      tradeManager.confirmTradeItem(trade2.tradeId, 'char1');
      tradeManager.confirmTradeItem(trade2.tradeId, 'char3');

      const history = tradeManager.getTradeHistory('char1', 2);
      expect(history.length).toBeGreaterThan(0);
      // 최신 거래가 먼저
      expect(history[0].tradeId).toBe(trade2.tradeId);
    });

    it('거래 기록 - 최대 개수 제한', () => {
      const request = tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      const trade = tradeManager.acceptRequest(request.requestId);

      tradeManager.setTradeItems(trade.tradeId, 'char1', [{ id: 'sword', name: '검', quantity: 1 }], 0);
      tradeManager.setTradeItems(trade.tradeId, 'char2', [], 100);

      tradeManager.confirmTradeItem(trade.tradeId, 'char1');
      tradeManager.confirmTradeItem(trade.tradeId, 'char2');

      const history = tradeManager.getTradeHistory('char1', 1);
      expect(history.length).toBe(1);
    });
  });

  describe('시스템 통계', () => {
    it('시스템 통계 조회', () => {
      tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      tradeManager.sendRequest('char3', 'P3', 'char4', 'P4');

      const stats = tradeManager.getSystemStats();
      expect(stats.pendingRequests).toBe(2);
      expect(stats.totalRequests).toBe(2);
    });

    it('만료된 거래 정리', () => {
      const request = tradeManager.sendRequest('char1', 'P1', 'char2', 'P2');
      // 만료 시간 조작
      request.request.expiresAt = Date.now() - 1000;

      tradeManager.cleanupExpiredTrades();

      expect(request.request.status).toBe('expired');
    });
  });
});