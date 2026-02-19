/**
 * FriendManager 테스트
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from 'redis';
import FriendManager from '../friend-manager';

describe('FriendManager', () => {
  let redisClient;
  let friendManager;
  const TEST_CHARACTER_ID = 'test-char-1';
  const TEST_FRIEND_ID = 'test-char-2';
  const TEST_FRIEND_NAME = 'Test Friend';
  const TEST_FRIEND_ID_2 = 'test-char-3';
  const TEST_FRIEND_NAME_2 = 'Test Friend 2';

  beforeEach(async () => {
    // Redis 클라이언트 생성 (테스트용)
    redisClient = createClient({
      url: 'redis://localhost:6379'
    });

    await redisClient.connect();
    friendManager = new FriendManager(redisClient);

    // 테스트 데이터 정리
    await friendManager.clearFriends(TEST_CHARACTER_ID);
  });

  afterEach(async () => {
    // 테스트 데이터 정리
    await friendManager.clearFriends(TEST_CHARACTER_ID);
    await redisClient.quit();
  });

  describe('addFriend', () => {
    it('친구를 추가할 수 있어야 함', async () => {
      const result = await friendManager.addFriend(
        TEST_CHARACTER_ID,
        TEST_FRIEND_ID,
        TEST_FRIEND_NAME
      );

      expect(result).toBe(true);
    });

    it('이미 친구인 경우 추가할 수 없어야 함', async () => {
      await friendManager.addFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID, TEST_FRIEND_NAME);

      const result = await friendManager.addFriend(
        TEST_CHARACTER_ID,
        TEST_FRIEND_ID,
        TEST_FRIEND_NAME
      );

      expect(result).toBe(false);
    });

    it('자신을 친구로 추가할 수 없어야 함', async () => {
      const result = await friendManager.addFriend(
        TEST_CHARACTER_ID,
        TEST_CHARACTER_ID,
        'Myself'
      );

      expect(result).toBe(false);
    });

    it('친구 추가 시 메타데이터를 저장할 수 있어야 함', async () => {
      const metadata = { level: 10, rank: 'gold' };

      const result = await friendManager.addFriend(
        TEST_CHARACTER_ID,
        TEST_FRIEND_ID,
        TEST_FRIEND_NAME,
        metadata
      );

      expect(result).toBe(true);

      const friend = await friendManager.getFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID);
      expect(friend.level).toBe(10);
      expect(friend.rank).toBe('gold');
    });
  });

  describe('removeFriend', () => {
    it('친구를 삭제할 수 있어야 함', async () => {
      await friendManager.addFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID, TEST_FRIEND_NAME);

      const result = await friendManager.removeFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID);

      expect(result).toBe(true);
    });

    it('친구가 아닌 경우 삭제할 수 없어야 함', async () => {
      const result = await friendManager.removeFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID);

      expect(result).toBe(false);
    });
  });

  describe('getFriends', () => {
    it('빈 친구 목록을 반환해야 함', async () => {
      const friends = await friendManager.getFriends(TEST_CHARACTER_ID);

      expect(friends).toEqual([]);
    });

    it('친구 목록을 반환해야 함', async () => {
      await friendManager.addFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID, TEST_FRIEND_NAME);
      await friendManager.addFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID_2, TEST_FRIEND_NAME_2);

      const friends = await friendManager.getFriends(TEST_CHARACTER_ID);

      expect(friends).toHaveLength(2);
      expect(friends[0].characterId).toBe(TEST_FRIEND_ID_2); // 최신 순
      expect(friends[1].characterId).toBe(TEST_FRIEND_ID);
    });

    it('친구 목록이 추가 시간순으로 정렬되어야 함', async () => {
      await friendManager.addFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID, TEST_FRIEND_NAME);
      await new Promise(resolve => setTimeout(resolve, 10));
      await friendManager.addFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID_2, TEST_FRIEND_NAME_2);

      const friends = await friendManager.getFriends(TEST_CHARACTER_ID);

      expect(new Date(friends[0].addedAt).getTime()).toBeGreaterThan(
        new Date(friends[1].addedAt).getTime()
      );
    });
  });

  describe('searchFriends', () => {
    beforeEach(async () => {
      await friendManager.addFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID, 'John');
      await friendManager.addFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID_2, 'Jane');
    });

    it('모든 친구를 검색할 수 있어야 함', async () => {
      const results = await friendManager.searchFriends(TEST_CHARACTER_ID, '');

      expect(results).toHaveLength(2);
    });

    it('이름으로 친구를 검색할 수 있어야 함', async () => {
      const results = await friendManager.searchFriends(TEST_CHARACTER_ID, 'John');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('John');
    });

    it('대소문자 구분 없이 검색해야 함', async () => {
      const results = await friendManager.searchFriends(TEST_CHARACTER_ID, 'john');

      expect(results).toHaveLength(1);
    });

    it('부분 일치로 검색할 수 있어야 함', async () => {
      const results = await friendManager.searchFriends(TEST_CHARACTER_ID, 'Jo');

      expect(results).toHaveLength(1);
    });
  });

  describe('isFriend', () => {
    it('친구 존재 여부를 확인할 수 있어야 함', async () => {
      await friendManager.addFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID, TEST_FRIEND_NAME);

      const isFriend = await friendManager.isFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID);

      expect(isFriend).toBe(true);
    });

    it('친구가 아닌 경우 false를 반환해야 함', async () => {
      const isFriend = await friendManager.isFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID);

      expect(isFriend).toBe(false);
    });
  });

  describe('getFriendCount', () => {
    it('친구 수를 반환해야 함', async () => {
      const count0 = await friendManager.getFriendCount(TEST_CHARACTER_ID);
      expect(count0).toBe(0);

      await friendManager.addFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID, TEST_FRIEND_NAME);
      await friendManager.addFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID_2, TEST_FRIEND_NAME_2);

      const count2 = await friendManager.getFriendCount(TEST_CHARACTER_ID);
      expect(count2).toBe(2);
    });
  });

  describe('getFriend', () => {
    it('친구 정보를 조회할 수 있어야 함', async () => {
      await friendManager.addFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID, TEST_FRIEND_NAME);

      const friend = await friendManager.getFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID);

      expect(friend).not.toBeNull();
      expect(friend.characterId).toBe(TEST_FRIEND_ID);
      expect(friend.name).toBe(TEST_FRIEND_NAME);
      expect(friend.addedAt).toBeDefined();
    });

    it('친구가 아닌 경우 null을 반환해야 함', async () => {
      const friend = await friendManager.getFriend(TEST_CHARACTER_ID, TEST_FRIEND_ID);

      expect(friend).toBeNull();
    });
  });
});