/**
 * Online Tracker Tests
 */

import { describe, it, test, expect, beforeEach, afterEach, vi } from 'vitest';
import OnlineTracker from '../online-tracker.js';

describe('OnlineTracker', () => {
  let onlineTracker;

  beforeEach(() => {
    onlineTracker = new OnlineTracker(null); // Memory mode
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('setOnline', () => {
    it('메모리 모드: 온라인 상태로 설정해야 함', async () => {
      const result = await onlineTracker.setOnline('char1', 'User A');

      expect(result.success).toBe(true);
      expect(result.online).toBe(true);
    });

    it('lastSeen 시간이 기록되어야 함', async () => {
      await onlineTracker.setOnline('char1', 'User A');

      const lastSeen = await onlineTracker.getLastSeen('char1');

      expect(lastSeen).toBeDefined();
      expect(lastSeen).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('온라인 상태를 확인할 수 있음', async () => {
      await onlineTracker.setOnline('char1', 'User A');

      const isOnline = await onlineTracker.isOnline('char1');

      expect(isOnline).toBe(true);
    });
  });

  describe('setOffline', () => {
    it('메모리 모드: 오프라인 상태로 설정해야 함', async () => {
      await onlineTracker.setOnline('char1', 'User A');
      const result = await onlineTracker.setOffline('char1');

      expect(result.success).toBe(true);
      expect(result.online).toBe(false);
    });

    it('오프라인 후 온라인 상태가 false여야 함', async () => {
      await onlineTracker.setOnline('char1', 'User A');
      await onlineTracker.setOffline('char1');

      const isOnline = await onlineTracker.isOnline('char1');

      expect(isOnline).toBe(false);
    });

    it('오프라인 후 lastSeen은 유지되어야 함', async () => {
      await onlineTracker.setOnline('char1', 'User A');
      await onlineTracker.setOffline('char1');

      const lastSeen = await onlineTracker.getLastSeen('char1');

      expect(lastSeen).toBeDefined();
    });
  });

  describe('isOnline', () => {
    it('메모리 모드: 온라인 상태를 확인할 수 있음', async () => {
      await onlineTracker.setOnline('char1', 'User A');

      const isOnline = await onlineTracker.isOnline('char1');

      expect(isOnline).toBe(true);
    });

    it('오프라인인 경우 false를 반환해야 함', async () => {
      const isOnline = await onlineTracker.isOnline('char1');

      expect(isOnline).toBe(false);
    });
  });

  describe('getOnlineUsers', () => {
    it('메모리 모드: 모든 온라인 사용자를 반환해야 함', async () => {
      await onlineTracker.setOnline('char1', 'User A');
      await onlineTracker.setOnline('char2', 'User B');
      await onlineTracker.setOnline('char3', 'User C');

      const users = await onlineTracker.getOnlineUsers();

      expect(users).toHaveLength(3);
      expect(users[0].id).toBe('char1');
      expect(users[1].id).toBe('char2');
      expect(users[2].id).toBe('char3');
    });

    it('온라인 사용자가 없으면 빈 리스트를 반환해야 함', async () => {
      const users = await onlineTracker.getOnlineUsers();

      expect(users).toEqual([]);
    });

    it('오프라인 사용자는 목록에 포함되지 않아야 함', async () => {
      await onlineTracker.setOnline('char1', 'User A');
      await onlineTracker.setOnline('char2', 'User B');
      await onlineTracker.setOffline('char2');

      const users = await onlineTracker.getOnlineUsers();

      expect(users).toHaveLength(1);
      expect(users[0].id).toBe('char1');
    });
  });

  describe('getLastSeen', () => {
    it('메모리 모드: lastSeen 시간을 반환해야 함', async () => {
      await onlineTracker.setOnline('char1', 'User A');

      const lastSeen = await onlineTracker.getLastSeen('char1');

      expect(lastSeen).toBeDefined();
      expect(lastSeen).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('기록이 없으면 null을 반환해야 함', async () => {
      const lastSeen = await onlineTracker.getLastSeen('char1');

      expect(lastSeen).toBeNull();
    });
  });

  describe('getFriendsOnlineStatus', () => {
    it('메모리 모드: 친구들의 온라인 상태를 반환해야 함', async () => {
      await onlineTracker.setOnline('friend1', 'Friend A');
      await onlineTracker.setOnline('friend2', 'Friend B');

      const statuses = await onlineTracker.getFriendsOnlineStatus(['friend1', 'friend2']);

      expect(statuses).toHaveLength(2);
      expect(statuses[0].id).toBe('friend1');
      expect(statuses[0].online).toBe(true);
      expect(statuses[1].id).toBe('friend2');
      expect(statuses[1].online).toBe(true);
    });

    it('오프라인 친구의 상태를 올바르게 반환해야 함', async () => {
      await onlineTracker.setOnline('friend1', 'Friend A');
      await onlineTracker.setOnline('friend2', 'Friend B');
      await onlineTracker.setOffline('friend2');

      const statuses = await onlineTracker.getFriendsOnlineStatus(['friend1', 'friend2']);

      expect(statuses[0].online).toBe(true);
      expect(statuses[1].online).toBe(false);
      expect(statuses[1].lastSeen).toBeDefined();
    });

    it('lastSeen을 포함해야 함', async () => {
      await onlineTracker.setOnline('friend1', 'Friend A');

      const statuses = await onlineTracker.getFriendsOnlineStatus(['friend1']);

      expect(statuses[0].lastSeen).toBeDefined();
    });

    it('빈 리스트를 처리할 수 있음', async () => {
      const statuses = await onlineTracker.getFriendsOnlineStatus([]);

      expect(statuses).toEqual([]);
    });
  });

  describe('clearUserData', () => {
    it('메모리 모드: 캐릭터 데이터를 삭제해야 함', async () => {
      await onlineTracker.setOnline('char1', 'User A');
      await onlineTracker.clearUserData('char1');

      const isOnline = await onlineTracker.isOnline('char1');
      const lastSeen = await onlineTracker.getLastSeen('char1');

      expect(isOnline).toBe(false);
      expect(lastSeen).toBeNull();
    });
  });

  describe('_getMemoryData', () => {
    it('테스트용: 메모리 데이터를 반환해야 함', async () => {
      await onlineTracker.setOnline('char1', 'User A');

      const data = onlineTracker._getMemoryData();

      expect(data.onlineUsers).toBeDefined();
      expect(data.onlineUsers).toHaveLength(1);
      expect(data.lastSeen).toBeDefined();
      expect(data.lastSeen['char1']).toBeDefined();
    });
  });
});