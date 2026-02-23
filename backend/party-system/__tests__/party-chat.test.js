/**
 * PartyChat 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import PartyChat from '../party-chat';

describe('PartyChat', () => {
  let partyChat;

  beforeEach(() => {
    partyChat = new PartyChat(null); // Redis 없이 테스트
  });

  describe('sendMessage', () => {
    it('메시지 전송 수 있어야 함', async () => {
      const message = await partyChat.sendMessage(
        'party1',
        'player1',
        'Alice',
        'Hello party!'
      );

      expect(message).toBeDefined();
      expect(message.id).toBeDefined();
      expect(message.partyId).toBe('party1');
      expect(message.playerId).toBe('player1');
      expect(message.playerName).toBe('Alice');
      expect(message.message).toBe('Hello party!');
      expect(message.type).toBe('text');
      expect(message.timestamp).toBeDefined();
    });

    it('메시지 히스토리에 추가되어야 함', async () => {
      await partyChat.sendMessage('party1', 'player1', 'Alice', 'Hello');

      const history = partyChat.chatHistories.get('party1');

      expect(history).toBeDefined();
      expect(history).toHaveLength(1);
      expect(history[0].message).toBe('Hello');
    });

    it('동일 파티의 여러 메시지 저장되어야 함', async () => {
      await partyChat.sendMessage('party1', 'player1', 'Alice', 'Hello');
      await partyChat.sendMessage('party1', 'player2', 'Bob', 'Hi there');

      const history = partyChat.chatHistories.get('party1');

      expect(history).toHaveLength(2);
    });

    it('다른 파티의 메시지 분리되어야 함', async () => {
      await partyChat.sendMessage('party1', 'player1', 'Alice', 'Hello party 1');
      await partyChat.sendMessage('party2', 'player2', 'Bob', 'Hello party 2');

      const history1 = partyChat.chatHistories.get('party1');
      const history2 = partyChat.chatHistories.get('party2');

      expect(history1).toHaveLength(1);
      expect(history2).toHaveLength(1);
      expect(history1[0].partyId).toBe('party1');
      expect(history2[0].partyId).toBe('party2');
    });

    it('최대 히스토리 길이 제한', async () => {
      const limit = partyChat.maxHistoryLength;

      // 120개 메시지 전송
      for (let i = 0; i < 120; i++) {
        await partyChat.sendMessage('party1', 'player1', 'Alice', `Message ${i}`);
      }

      const history = partyChat.chatHistories.get('party1');

      expect(history.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('sendSystemMessage', () => {
    it('시스템 메시지 전송 수 있어야 함', async () => {
      const message = await partyChat.sendSystemMessage('party1', 'Party created!');

      expect(message).toBeDefined();
      expect(message.type).toBe('system');
      expect(message.playerId).toBe('system');
      expect(message.playerName).toBe('System');
      expect(message.message).toBe('Party created!');
    });

    it('시스템 메시지 히스토리에 추가되어야 함', async () => {
      await partyChat.sendSystemMessage('party1', 'System message');

      const history = partyChat.chatHistories.get('party1');

      expect(history).toBeDefined();
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('system');
    });
  });

  describe('sendQuestMessage', () => {
    it('퀘스트 메시지 전송 수 있어야 함', async () => {
      const message = await partyChat.sendQuestMessage('party1', 'Quest completed!');

      expect(message).toBeDefined();
      expect(message.type).toBe('quest');
      expect(message.playerId).toBe('quest');
      expect(message.playerName).toBe('Quest');
      expect(message.message).toBe('Quest completed!');
    });
  });

  describe('getChatHistory', () => {
    it('채팅 히스토리 조회 수 있어야 함', async () => {
      await partyChat.sendMessage('party1', 'player1', 'Alice', 'Hello');
      await partyChat.sendMessage('party1', 'player2', 'Bob', 'Hi');

      const history = await partyChat.getChatHistory('party1');

      expect(history).toHaveLength(2);
      expect(history[0].message).toBe('Hello');
      expect(history[1].message).toBe('Hi');
    });

    it('limit 파라미터로 크기 제한', async () => {
      for (let i = 0; i < 10; i++) {
        await partyChat.sendMessage('party1', 'player1', 'Alice', `Message ${i}`);
      }

      const history = await partyChat.getChatHistory('party1', 5);

      expect(history.length).toBeLessThanOrEqual(5);
    });

    it('없는 파티의 히스토리는 빈 배열 반환', async () => {
      const history = await partyChat.getChatHistory('nonexist');

      expect(history).toEqual([]);
    });
  });

  describe('clearChatHistory', () => {
    it('채팅 히스토리 초기화 수 있어야 함', async () => {
      await partyChat.sendMessage('party1', 'player1', 'Alice', 'Hello');

      const result = await partyChat.clearChatHistory('party1');

      expect(result.success).toBe(true);
      expect(partyChat.chatHistories.get('party1')).toBeUndefined();
    });
  });

  describe('message types', () => {
    it('텍스트, 시스템, 퀘스트 메시지 구분', async () => {
      const textMsg = await partyChat.sendMessage('party1', 'player1', 'Alice', 'Text');
      const systemMsg = await partyChat.sendSystemMessage('party1', 'System');
      const questMsg = await partyChat.sendQuestMessage('party1', 'Quest');

      expect(textMsg.type).toBe('text');
      expect(systemMsg.type).toBe('system');
      expect(questMsg.type).toBe('quest');
    });
  });
});