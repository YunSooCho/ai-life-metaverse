/**
 * Friend Request Manager Tests
 */

import { describe, it, test, expect, beforeEach, afterEach } from 'vitest';
import FriendRequestManager from '../friend-request.js';

describe('FriendRequestManager', () => {
  let requestManager;

  beforeEach(() => {
    requestManager = new FriendRequestManager(null); // Memory mode
  });

  describe('getReceivedRequests', () => {
    it('메모리 모드: 빈 리스트를 반환해야 함', async () => {
      const list = await requestManager.getReceivedRequests('char1');
      expect(list).toEqual([]);
    });

    it('메모리 모드: 수신한 요청 목록을 반환해야 함', async () => {
      await requestManager.sendRequest('char1', 'User A', 'char2', 'User B');

      const list = await requestManager.getReceivedRequests('char2');

      expect(list).toHaveLength(1);
      expect(list[0].from.id).toBe('char1');
      expect(list[0].to.id).toBe('char2');
    });
  });

  describe('getSentRequests', () => {
    it('메모리 모드: 빈 리스트를 반환해야 함', async () => {
      const list = await requestManager.getSentRequests('char1');
      expect(list).toEqual([]);
    });

    it('메모리 모드: 보낸 요청 목록을 반환해야 함', async () => {
      await requestManager.sendRequest('char1', 'User A', 'char2', 'User B');

      const list = await requestManager.getSentRequests('char1');

      expect(list).toHaveLength(1);
      expect(list[0].from.id).toBe('char1');
      expect(list[0].to.id).toBe('char2');
    });
  });

  describe('sendRequest', () => {
    it('메모리 모드: 요청을 전송해야 함', async () => {
      const result = await requestManager.sendRequest('char1', 'User A', 'char2', 'User B');

      expect(result.success).toBe(true);
      expect(result.request).toBeDefined();
      expect(result.request.from.id).toBe('char1');
      expect(result.request.to.id).toBe('char2');
      expect(result.request.status).toBe('pending');
      expect(result.request.createdAt).toBeDefined();
    });

    it('자기 자신에게 요청할 수 없음', async () => {
      const result = await requestManager.sendRequest('char1', 'User A', 'char1', 'User A');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cannot send request to yourself');
    });

    it('이미 대기 중인 요청이 있는 경우 실패해야 함', async () => {
      await requestManager.sendRequest('char1', 'User A', 'char2', 'User B');
      const result = await requestManager.sendRequest('char1', 'User A', 'char2', 'User B');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Request already sent');
    });

    it('요청이 수신자의 수신 목록에 추가되어야 함', async () => {
      await requestManager.sendRequest('char1', 'User A', 'char2', 'User B');

      const received = await requestManager.getReceivedRequests('char2');

      expect(received).toHaveLength(1);
      expect(received[0].from.id).toBe('char1');
    });

    it('대상 이름이 지정되지 않은 경우 기본값이 사용됨', async () => {
      const result = await requestManager.sendRequest('char1', 'User A', 'char2');

      expect(result.success).toBe(true);
      expect(result.request.to.name).toBe('Unknown');
    });
  });

  describe('acceptRequest', () => {
    it('메모리 모드: 요청을 수락해야 함', async () => {
      await requestManager.sendRequest('char1', 'User A', 'char2', 'User B');
      const result = await requestManager.acceptRequest('char1', 'char2');

      expect(result.success).toBe(true);
      expect(result.request.status).toBe('accepted');
      expect(result.request.respondedAt).toBeDefined();
    });

    it('존재하지 않는 요청의 수락은 실패해야 함', async () => {
      const result = await requestManager.acceptRequest('char1', 'char2');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Request not found');
    });

    it('보낸 요청도 상태가 변경되어야 함', async () => {
      await requestManager.sendRequest('char1', 'User A', 'char2', 'User B');
      await requestManager.acceptRequest('char1', 'char2');

      const sent = await requestManager.getSentRequests('char1');

      expect(sent[0].status).toBe('accepted');
    });
  });

  describe('rejectRequest', () => {
    it('메모리 모드: 요청을 거절해야 함', async () => {
      await requestManager.sendRequest('char1', 'User A', 'char2', 'User B');
      const result = await requestManager.rejectRequest('char1', 'char2');

      expect(result.success).toBe(true);
      expect(result.request.status).toBe('rejected');
      expect(result.request.respondedAt).toBeDefined();
    });

    it('존재하지 않는 요청의 거절은 실패해야 함', async () => {
      const result = await requestManager.rejectRequest('char1', 'char2');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Request not found');
    });

    it('보낸 요청도 상태가 변경되어야 함', async () => {
      await requestManager.sendRequest('char1', 'User A', 'char2', 'User B');
      await requestManager.rejectRequest('char1', 'char2');

      const sent = await requestManager.getSentRequests('char1');

      expect(sent[0].status).toBe('rejected');
    });
  });

  describe('getPendingRequestCount', () => {
    it('메모리 모드: 대기 중인 요청 수를 반환해야 함', async () => {
      await requestManager.sendRequest('char1', 'User A', 'char2', 'User B');
      await requestManager.sendRequest('char3', 'User C', 'char2', 'User D');
      await requestManager.acceptRequest('char1', 'char2');

      const count = await requestManager.getPendingRequestCount('char2');

      expect(count).toBe(1);
    });

    it('대기 중인 요청이 없으면 0을 반환해야 함', async () => {
      const count = await requestManager.getPendingRequestCount('char1');

      expect(count).toBe(0);
    });
  });

  describe('findRequest', () => {
    it('특정 요청을 찾을 수 있음', async () => {
      await requestManager.sendRequest('char1', 'User A', 'char2', 'User B');

      const request = await requestManager.findRequest('char1', 'char2');

      expect(request).toBeDefined();
      expect(request.to.id).toBe('char2');
      expect(request.status).toBe('pending');
    });

    it('대기 중인 요청만 찾아야 함', async () => {
      await requestManager.sendRequest('char1', 'User A', 'char2', 'User B');
      await requestManager.acceptRequest('char1', 'char2');

      const request = await requestManager.findRequest('char1', 'char2');

      expect(request).toBeNull();
    });

    it('존재하지 않는 요청은 null을 반환해야 함', async () => {
      const request = await requestManager.findRequest('char1', 'char2');

      expect(request).toBeNull();
    });
  });

  describe('clearRequestData', () => {
    it('메모리 모드: 캐릭터의 요청 데이터를 삭제해야 함', async () => {
      await requestManager.sendRequest('char1', 'User A', 'char2', 'User B');
      await requestManager.clearRequestData('char1');

      const sent = await requestManager.getSentRequests('char1');
      const received = await requestManager.getReceivedRequests('char1');

      expect(sent).toEqual([]);
      expect(received).toEqual([]);
    });
  });
});