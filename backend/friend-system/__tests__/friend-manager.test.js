/**
 * Friend Manager Tests
 */

import { describe, it, test, expect, beforeEach, afterEach, vi } from 'vitest';
import FriendManager from '../friend-manager.js';

describe('FriendManager', () => {
  let friendManager;
  let mockRedis;

  beforeEach(() => {
    mockRedis = {
      get: vi.fn(),
      setex: vi.fn(),
      del: vi.fn()
    };
    friendManager = new FriendManager(null); // Memory mode
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getFriendList', () => {
    it('메모리 모드: 빈 리스트를 반환해야 함', async () => {
      const list = await friendManager.getFriendList('char1');
      expect(list).toEqual([]);
    });

    it('메모리 모드: 친구 목록을 반환해야 함', async () => {
      await friendManager.addFriend('char1', 'friend1', 'Friend 1');
      await friendManager.addFriend('char1', 'friend2', 'Friend 2');

      const list = await friendManager.getFriendList('char1');
      expect(list).toHaveLength(2);
      expect(list[0].name).toBe('Friend 1');
      expect(list[1].name).toBe('Friend 2');
    });
  });

  describe('addFriend', () => {
    it('메모리 모드: 친구를 추가해야 함', async () => {
      const result = await friendManager.addFriend('char1', 'friend1', 'Friend 1');

      expect(result.success).toBe(true);
      expect(result.friend.id).toBe('friend1');
      expect(result.friend.name).toBe('Friend 1');
      expect(result.friend.addedAt).toBeDefined();
    });

    it('자기 자신을 추가할 수 없음', async () => {
      const result = await friendManager.addFriend('char1', 'char1', 'Myself');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cannot add yourself');
    });

    it('이미 친구인 경우 추가할 수 없음', async () => {
      await friendManager.addFriend('char1', 'friend1', 'Friend 1');
      const result = await friendManager.addFriend('char1', 'friend1', 'Friend 1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Already friends');
    });

    it('친구 이름이 지정되지 않은 경우 기본값이 사용됨', async () => {
      const result = await friendManager.addFriend('char1', 'friend1');

      expect(result.success).toBe(true);
      expect(result.friend.name).toBe('Unknown');
    });
  });

  describe('removeFriend', () => {
    it('메모리 모드: 친구를 삭제해야 함', async () => {
      await friendManager.addFriend('char1', 'friend1', 'Friend 1');
      const result = await friendManager.removeFriend('char1', 'friend1');

      expect(result.success).toBe(true);
      expect(result.removedFriendId).toBe('friend1');
    });

    it('존재하지 않는 친구를 삭제하려고 하면 실패해야 함', async () => {
      const result = await friendManager.removeFriend('char1', 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Friend not found');
    });
  });

  describe('isFriend', () => {
    it('친구 관계를 확인할 수 있음', async () => {
      await friendManager.addFriend('char1', 'friend1', 'Friend 1');

      const isFriend = await friendManager.isFriend('char1', 'friend1');
      expect(isFriend).toBe(true);
    });

    it('친구가 아닌 경우 false를 반환해야 함', async () => {
      const isFriend = await friendManager.isFriend('char1', 'friend1');
      expect(isFriend).toBe(false);
    });
  });

  describe('searchFriends', () => {
    it('메모리 모드: 이름으로 친구를 검색할 수 있음', async () => {
      await friendManager.addFriend('char1', 'friend1', 'Alice Smith');
      await friendManager.addFriend('char1', 'friend2', 'Bob Johnson');
      await friendManager.addFriend('char1', 'friend3', 'Alice Brown');

      const results = await friendManager.searchFriends('char1', 'Alice');

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Alice Smith');
      expect(results[1].name).toBe('Alice Brown');
    });

    it('대소문자를 구분하지 않고 검색해야 함', async () => {
      await friendManager.addFriend('char1', 'friend1', 'ALICE');

      const results = await friendManager.searchFriends('char1', 'alice');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('ALICE');
    });

    it('ID로 검색할 수 있음', async () => {
      await friendManager.addFriend('char1', 'friend123', 'Alice');

      const results = await friendManager.searchFriends('char1', 'friend123');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('friend123');
    });
  });

  describe('getFriendCount', () => {
    it('메모리 모드: 친구 수를 반환해야 함', async () => {
      await friendManager.addFriend('char1', 'friend1', 'Friend 1');
      await friendManager.addFriend('char1', 'friend2', 'Friend 2');
      await friendManager.addFriend('char1', 'friend3', 'Friend 3');

      const count = await friendManager.getFriendCount('char1');

      expect(count).toBe(3);
    });

    it('친구가 없으면 0을 반환해야 함', async () => {
      const count = await friendManager.getFriendCount('char1');

      expect(count).toBe(0);
    });
  });

  describe('clearFriendData', () => {
    it('메모리 모드: 캐릭터의 친구 데이터를 삭제해야 함', async () => {
      await friendManager.addFriend('char1', 'friend1', 'Friend 1');
      await friendManager.clearFriendData('char1');

      const list = await friendManager.getFriendList('char1');

      expect(list).toEqual([]);
    });
  });
});