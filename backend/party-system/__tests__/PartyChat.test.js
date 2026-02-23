/**
 * PartyChat 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PartyChat } from '../PartyChat.js';

describe('PartyChat', () => {
  let partyChat;

  beforeEach(() => {
    partyChat = new PartyChat();
  });

  describe('sendMessage', () => {
    it('메시지를 전송해야 함', () => {
      const result = partyChat.sendMessage('party_1', 'player1', 'Alice', 'Hello party!');
      
      expect(result.success).toBe(true);
      expect(result.message.message).toBe('Hello party!');
      expect(result.message.playerId).toBe('player1');
      expect(result.message.type).toBe('text');
    });

    it('메시지에 고유 ID가 있어야 함', () => {
      const result1 = partyChat.sendMessage('party_1', 'player1', 'Alice', 'Message 1');
      const result2 = partyChat.sendMessage('party_1', 'player2', 'Bob', 'Message 2');
      
      expect(result1.message.id).toBeDefined();
      expect(result2.message.id).toBeDefined();
      expect(result1.message.id).not.toBe(result2.message.id);
    });

    it('메시지 타임스탬프가 있어야 함', () => {
      const before = Date.now();
      const result = partyChat.sendMessage('party_1', 'player1', 'Alice', 'Hello');
      const after = Date.now();
      
      expect(result.message.timestamp).toBeGreaterThanOrEqual(before);
      expect(result.message.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('sendSystemMessage', () => {
    it('시스템 메시지를 전송해야 함', () => {
      const result = partyChat.sendSystemMessage('party_1', 'player_joined', { playerId: 'player1' });
      
      expect(result.success).toBe(true);
      expect(result.message.type).toBe('player_joined');
      expect(result.message.data).toEqual({ playerId: 'player1' });
      expect(result.message.isSystem).toBe(true);
    });

    it('시스템 메시지에 고유 ID가 있어야 함', () => {
      const result1 = partyChat.sendSystemMessage('party_1', 'player_joined', { playerId: 'player1' });
      const result2 = partyChat.sendSystemMessage('party_1', 'player_left', { playerId: 'player2' });
      
      expect(result1.message.id).toBeDefined();
      expect(result2.message.id).toBeDefined();
      expect(result1.message.id).not.toBe(result2.message.id);
    });
  });

  describe('getChatHistory', () => {
    beforeEach(() => {
      partyChat.sendMessage('party_1', 'player1', 'Alice', 'Message 1');
      partyChat.sendMessage('party_1', 'player2', 'Bob', 'Message 2');
      partyChat.sendMessage('party_1', 'player1', 'Alice', 'Message 3');
    });

    it('채팅 히스토리를 조회해야 함', () => {
      const result = partyChat.getChatHistory('party_1');
      
      expect(result.success).toBe(true);
      expect(result.partyId).toBe('party_1');
      expect(result.totalMessages).toBe(3);
      expect(result.messages.length).toBe(3);
    });

    it('최근 메시지를 먼저 반환해야 함', () => {
      const result = partyChat.getChatHistory('party_1');
      
      expect(result.messages[0].message).toBe('Message 3');
      expect(result.messages[1].message).toBe('Message 2');
      expect(result.messages[2].message).toBe('Message 1');
    });

    it('limit 파라미터로 조회 개수를 제한해야 함', () => {
      const result = partyChat.getChatHistory('party_1', 2);
      
      expect(result.totalMessages).toBe(3);
      expect(result.messages.length).toBe(2);
    });

    it('메시지가 없는 파티는 빈 배열을 반환해야 함', () => {
      const result = partyChat.getChatHistory('party_999');
      
      expect(result.success).toBe(true);
      expect(result.messages).toEqual([]);
    });
  });

  describe('setMaxHistorySize', () => {
    it('최대 히스토리 크기를 설정해야 함', () => {
      partyChat.setMaxHistorySize(2);
      partyChat.sendMessage('party_1', 'player1', 'Alice', 'Message 1');
      partyChat.sendMessage('party_1', 'player2', 'Bob', 'Message 2');
      partyChat.sendMessage('party_1', 'player1', 'Alice', 'Message 3');
      
      const result = partyChat.getChatHistory('party_1');
      
      expect(result.totalMessages).toBe(2);
      expect(result.messages.length).toBe(2);
    });

    it('최소 크기는 10이어야 함', () => {
      partyChat.setMaxHistorySize(5); // 10 미만 설정
      
      // 10개 추가
      for (let i = 0; i < 15; i++) {
        partyChat.sendMessage('party_1', `player${i}`, `Name${i}`, `Message ${i}`);
      }
      
      const result = partyChat.getChatHistory('party_1');
      
      expect(result.totalMessages).toBe(10);
    });
  });

  describe('getMessagesInRange', () => {
    beforeEach(() => {
      for (let i = 1; i <= 10; i++) {
        partyChat.sendMessage('party_1', 'player1', 'Alice', `Message ${i}`);
      }
    });

    it('특정 범위의 메시지를 조회해야 함', () => {
      const result = partyChat.getMessagesInRange('party_1', 0, 3);
      
      expect(result.success).toBe(true);
      expect(result.totalMessages).toBe(10);
      expect(result.offset).toBe(0);
      expect(result.limit).toBe(3);
      expect(result.messages.length).toBe(3);
    });

    it('offset 으로 시작 위치를 조절해야 함', () => {
      const result = partyChat.getMessagesInRange('party_1', 5, 3);
      
      expect(result.messages.length).toBe(3);
      expect(result.messages[0].message).toBe('Message 6');  // index 5
    });

    it('존재하지 않는 파티는 조회 불가', () => {
      const result = partyChat.getMessagesInRange('party_999', 0, 10);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });
  });

  describe('cleanupChat', () => {
    beforeEach(() => {
      partyChat.sendMessage('party_1', 'player1', 'Alice', 'Message 1');
    });

    it('파티 채팅을 정리해야 함', () => {
      partyChat.cleanupChat('party_1');
      
      const result = partyChat.getChatHistory('party_1');
      
      expect(result.messages).toEqual([]);
    });
  });

  describe('initChat', () => {
    it('파티 채팅을 초기화해야 함', () => {
      partyChat.initChat('party_1');
      partyChat.sendMessage('party_1', 'player1', 'Alice', 'Hello');
      
      const result = partyChat.getChatHistory('party_1');
      
      expect(result.totalMessages).toBe(1);
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      partyChat.sendMessage('party_1', 'player1', 'Alice', 'Message 1');
      partyChat.sendMessage('party_1', 'player2', 'Bob', 'Message 2');
      partyChat.sendMessage('party_2', 'player1', 'Alice', 'Message 3');
    });

    it('통계 정보를 조회해야 함', () => {
      const stats = partyChat.getStats();
      
      expect(stats.activeParties).toBe(2);
      expect(stats.totalMessages).toBe(3);
      expect(stats.histories.party_1).toBe(2);
      expect(stats.histories.party_2).toBe(1);
    });

    it('빈 상태의 통계를 조회해야 함', () => {
      const emptyChat = new PartyChat();
      const stats = emptyChat.getStats();
      
      expect(stats.activeParties).toBe(0);
      expect(stats.totalMessages).toBe(0);
    });
  });

  describe('Multiple Parties', () => {
    it('여러 파티 채팅을 독립적으로 관리해야 함', () => {
      partyChat.sendMessage('party_1', 'player1', 'Alice', 'Party 1 Message');
      partyChat.sendMessage('party_2', 'player2', 'Bob', 'Party 2 Message');
      
      const result1 = partyChat.getChatHistory('party_1');
      const result2 = partyChat.getChatHistory('party_2');
      
      expect(result1.totalMessages).toBe(1);
      expect(result2.totalMessages).toBe(1);
      expect(result1.messages[0].message).toBe('Party 1 Message');
      expect(result2.messages[0].message).toBe('Party 2 Message');
    });
  });

  describe('Edge Cases', () => {
    it('빈 메시지도 처리해야 함', () => {
      const result = partyChat.sendMessage('party_1', 'player1', 'Alice', '');
      
      expect(result.success).toBe(true);
      expect(result.message.message).toBe('');
    });

    it('긴 메시지도 처리해야 함', () => {
      const longMessage = 'A'.repeat(1000);
      const result = partyChat.sendMessage('party_1', 'player1', 'Alice', longMessage);
      
      expect(result.success).toBe(true);
      expect(result.message.message).toBe(longMessage);
    });
  });
});