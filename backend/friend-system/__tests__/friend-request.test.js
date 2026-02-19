/**
 * FriendRequest 테스트
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from 'redis';
import FriendRequest from '../friend-request';
import FriendManager from '../friend-manager';

describe('FriendRequest', () => {
  let redisClient;
  let friendRequest;
  let friendManager;
  const TEST_CHARACTER_1 = 'test-char-1';
  const TEST_CHARACTER_2 = 'test-char-2';
  const TEST_NAME_1 = 'Test User 1';
  const TEST_NAME_2 = 'Test User 2';

  beforeEach(async () => {
    redisClient = createClient({
      url: 'redis://localhost:6379'
    });

    await redisClient.connect();
    friendRequest = new FriendRequest(redisClient);
    friendManager = new FriendManager(redisClient);

    // 테스트 데이터 정리
    await friendRequest.clearRequests(TEST_CHARACTER_1);
    await friendRequest.clearRequests(TEST_CHARACTER_2);
    await friendManager.clearFriends(TEST_CHARACTER_1);
    await friendManager.clearFriends(TEST_CHARACTER_2);
  });

  afterEach(async () => {
    await friendRequest.clearRequests(TEST_CHARACTER_1);
    await friendRequest.clearRequests(TEST_CHARACTER_2);
    await friendManager.clearFriends(TEST_CHARACTER_1);
    await friendManager.clearFriends(TEST_CHARACTER_2);
    await redisClient.quit();
  });

  describe('sendRequest', () => {
    it('친구 요청을 전송할 수 있어야 함', async () => {
      const result = await friendRequest.sendRequest(
        TEST_CHARACTER_1,
        TEST_NAME_1,
        TEST_CHARACTER_2,
        '친구가 될까요?'
      );

      expect(result).toBe(true);
    });

    it('자신에게 요청을 보낼 수 없어야 함', async () => {
      const result = await friendRequest.sendRequest(
        TEST_CHARACTER_1,
        TEST_NAME_1,
        TEST_CHARACTER_1,
        '테스트'
      );

      expect(result).toBe(false);
    });

    it('이미 요청을 보낸 경우 다시 보낼 수 없어야 함', async () => {
      await friendRequest.sendRequest(TEST_CHARACTER_1, TEST_NAME_1, TEST_CHARACTER_2);

      const result = await friendRequest.sendRequest(
        TEST_CHARACTER_1,
        TEST_NAME_1,
        TEST_CHARACTER_2
      );

      expect(result).toBe(false);
    });

    it('요청 메시지를 포함할 수 있어야 함', async () => {
      const message = '안녕, 친구가 될까요?';

      await friendRequest.sendRequest(
        TEST_CHARACTER_1,
        TEST_NAME_1,
        TEST_CHARACTER_2,
        message
      );

      const request = await friendRequest.getRequest(TEST_CHARACTER_2, TEST_CHARACTER_1);
      expect(request.message).toBe(message);
    });
  });

  describe('acceptRequest', () => {
    beforeEach(async () => {
      await friendRequest.sendRequest(
        TEST_CHARACTER_1,
        TEST_NAME_1,
        TEST_CHARACTER_2,
        '친구 요청'
      );
    });

    it('친구 요청을 수락할 수 있어야 함', async () => {
      const result = await friendRequest.acceptRequest(
        TEST_CHARACTER_2,
        TEST_CHARACTER_1,
        friendManager
      );

      expect(result).toBe(true);

      // 서로 친구인지 확인
      const isFriend1 = await friendManager.isFriend(TEST_CHARACTER_1, TEST_CHARACTER_2);
      const isFriend2 = await friendManager.isFriend(TEST_CHARACTER_2, TEST_CHARACTER_1);

      expect(isFriend1).toBe(true);
      expect(isFriend2).toBe(true);
    });

    it('수락 후 요청이 삭제되어야 함', async () => {
      await friendRequest.acceptRequest(
        TEST_CHARACTER_2,
        TEST_CHARACTER_1,
        friendManager
      );

      const request = await friendRequest.getRequest(TEST_CHARACTER_2, TEST_CHARACTER_1);
      expect(request).toBeNull();
    });

    it('존재하지 않는 요청은 수락할 수 없어야 함', async () => {
      const result = await friendRequest.acceptRequest(
        TEST_CHARACTER_2,
        'non-existent',
        friendManager
      );

      expect(result).toBe(false);
    });
  });

  describe('rejectRequest', () => {
    beforeEach(async () => {
      await friendRequest.sendRequest(
        TEST_CHARACTER_1,
        TEST_NAME_1,
        TEST_CHARACTER_2,
        '친구 요청'
      );
    });

    it('친구 요청을 거절할 수 있어야 함', async () => {
      const result = await friendRequest.rejectRequest(
        TEST_CHARACTER_2,
        TEST_CHARACTER_1
      );

      expect(result).toBe(true);
    });

    it('거절 후 요청이 삭제되어야 함', async () => {
      await friendRequest.rejectRequest(TEST_CHARACTER_2, TEST_CHARACTER_1);

      const request = await friendRequest.getRequest(TEST_CHARACTER_2, TEST_CHARACTER_1);
      expect(request).toBeNull();
    });

    it('거절해도 친구는 추가되지 않아야 함', async () => {
      await friendRequest.rejectRequest(TEST_CHARACTER_2, TEST_CHARACTER_1);

      const isFriend1 = await friendManager.isFriend(TEST_CHARACTER_1, TEST_CHARACTER_2);
      const isFriend2 = await friendManager.isFriend(TEST_CHARACTER_2, TEST_CHARACTER_1);

      expect(isFriend1).toBe(false);
      expect(isFriend2).toBe(false);
    });
  });

  describe('cancelRequest', () => {
    beforeEach(async () => {
      await friendRequest.sendRequest(
        TEST_CHARACTER_1,
        TEST_NAME_1,
        TEST_CHARACTER_2,
        '친구 요청'
      );
    });

    it('보낸 요청을 취소할 수 있어야 함', async () => {
      const result = await friendRequest.cancelRequest(
        TEST_CHARACTER_1,
        TEST_CHARACTER_2
      );

      expect(result).toBe(true);
    });

    it('취소 후 요청이 삭제되어야 함', async () => {
      await friendRequest.cancelRequest(TEST_CHARACTER_1, TEST_CHARACTER_2);

      const request = await friendRequest.getRequest(TEST_CHARACTER_2, TEST_CHARACTER_1);
      expect(request).toBeNull();
    });

    it('존재하지 않는 요청은 취소할 수 없어야 함', async () => {
      const result = await friendRequest.cancelRequest(
        TEST_CHARACTER_1,
        'non-existent'
      );

      expect(result).toBe(false);
    });
  });

  describe('getRequests', () => {
    it('빈 수신 요청 목록을 반환해야 함', async () => {
      const requests = await friendRequest.getRequests(TEST_CHARACTER_2);

      expect(requests).toEqual([]);
    });

    it('수신 요청 목록을 반환해야 함', async () => {
      await friendRequest.sendRequest(TEST_CHARACTER_1, TEST_NAME_1, TEST_CHARACTER_2, '요청 1');
      await friendRequest.sendRequest(TEST_CHARACTER_2, TEST_NAME_2, TEST_CHARACTER_1, '요청 2');

      const requests = await friendRequest.getRequests(TEST_CHARACTER_1);

      expect(requests).toHaveLength(1);
      expect(requests[0].fromCharacterId).toBe(TEST_CHARACTER_2);
    });

    it('수신 요청 목록이 오래된 순서로 정렬되어야 함', async () => {
      await friendRequest.sendRequest(TEST_CHARACTER_1, TEST_NAME_1, TEST_CHARACTER_2);

      await new Promise(resolve => setTimeout(resolve, 10));

      await friendRequest.sendRequest('char-3', 'Char 3', TEST_CHARACTER_2);

      const requests = await friendRequest.getRequests(TEST_CHARACTER_2);

      expect(new Date(requests[0].sentAt).getTime()).toBeLessThan(
        new Date(requests[1].sentAt).getTime()
      );
    });
  });

  describe('getPendingRequests', () => {
    it('빈 보낸 요청 목록을 반환해야 함', async () => {
      const pending = await friendRequest.getPendingRequests(TEST_CHARACTER_1);

      expect(pending).toEqual([]);
    });

    it('보낸 요청 목록을 반환해야 함', async () => {
      await friendRequest.sendRequest(TEST_CHARACTER_1, TEST_NAME_1, TEST_CHARACTER_2, '요청');

      const pending = await friendRequest.getPendingRequests(TEST_CHARACTER_1);

      expect(pending).toHaveLength(1);
      expect(pending[0].toCharacterId).toBe(TEST_CHARACTER_2);
    });
  });

  describe('getRequest', () => {
    it('요청을 조회할 수 있어야 함', async () => {
      await friendRequest.sendRequest(
        TEST_CHARACTER_1,
        TEST_NAME_1,
        TEST_CHARACTER_2,
        '테스트 요청'
      );

      const request = await friendRequest.getRequest(TEST_CHARACTER_2, TEST_CHARACTER_1);

      expect(request).not.toBeNull();
      expect(request.fromCharacterId).toBe(TEST_CHARACTER_1);
      expect(request.fromCharacterName).toBe(TEST_NAME_1);
      expect(request.toCharacterId).toBe(TEST_CHARACTER_2);
      expect(request.message).toBe('테스트 요청');
      expect(request.status).toBe('pending');
    });

    it('존재하지 않는 요청은 null을 반환해야 함', async () => {
      const request = await friendRequest.getRequest(TEST_CHARACTER_2, 'non-existent');

      expect(request).toBeNull();
    });
  });

  describe('hasPendingRequest', () => {
    it('보낸 요청 존재 여부를 확인할 수 있어야 함', async () => {
      await friendRequest.sendRequest(TEST_CHARACTER_1, TEST_NAME_1, TEST_CHARACTER_2);

      const hasPending = await friendRequest.hasPendingRequest(
        TEST_CHARACTER_1,
        TEST_CHARACTER_2
      );

      expect(hasPending).toBe(true);
    });

    it('요청이 없으면 false를 반환해야 함', async () => {
      const hasPending = await friendRequest.hasPendingRequest(
        TEST_CHARACTER_1,
        TEST_CHARACTER_2
      );

      expect(hasPending).toBe(false);
    });
  });

  describe('getRequestCount', () => {
    it('수신 요청 수를 반환해야 함', async () => {
      const count0 = await friendRequest.getRequestCount(TEST_CHARACTER_2);
      expect(count0).toBe(0);

      await friendRequest.sendRequest(TEST_CHARACTER_1, TEST_NAME_1, TEST_CHARACTER_2);
      await friendRequest.sendRequest('char-3', 'Char 3', TEST_CHARACTER_2);

      const count2 = await friendRequest.getRequestCount(TEST_CHARACTER_2);
      expect(count2).toBe(2);
    });
  });
});