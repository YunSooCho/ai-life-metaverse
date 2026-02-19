/**
 * Friend System Integration Tests
 */

import { describe, it, test, expect, beforeEach, afterEach } from 'vitest';
import { FriendSystem, initializeFriendSystem, getFriendSystem } from '../index.js';

describe('FriendSystem Integration', () => {
  let friendSystem;

  beforeEach(() => {
    friendSystem = new FriendSystem(null); // Memory mode
  });

  afterEach(() => {
    // Reset singleton
    friendSystem = null;
  });

  describe('initialization', () => {
    it('초기화 함수로 시스템을 초기화할 수 있음', () => {
      const system = initializeFriendSystem(null);

      expect(system).toBeInstanceOf(FriendSystem);
    });

    it('getFriendSystem으로 인스턴스를 가져올 수 있음', () => {
      const system = getFriendSystem();

      expect(system).toBeInstanceOf(FriendSystem);
    });

    it('동일한 인스턴스를 반환해야 함 (Singleton)', () => {
      const system1 = getFriendSystem();
      const system2 = getFriendSystem();

      expect(system1).toBe(system2);
    });
  });

  describe('서브시스템 가져오기', () => {
    it('FriendManager를 가져올 수 있음', () => {
      const manager = friendSystem.getFriendManager();

      expect(manager).toBeDefined();
      expect(manager.constructor.name).toBe('FriendManager');
    });

    it('RequestManager를 가져올 수 있음', () => {
      const manager = friendSystem.getRequestManager();

      expect(manager).toBeDefined();
      expect(manager.constructor.name).toBe('FriendRequestManager');
    });

    it('OnlineTracker를 가져올 수 있음', () => {
      const tracker = friendSystem.getOnlineTracker();

      expect(tracker).toBeDefined();
      expect(tracker.constructor.name).toBe('OnlineTracker');
    });
  });

  describe('sendFriendRequest', () => {
    it('친구 요청을 전송할 수 있음', async () => {
      const result = await friendSystem.sendFriendRequest(
        'char1',
        'User A',
        'char2',
        'User B'
      );

      expect(result.success).toBe(true);
      expect(result.request).toBeDefined();
    });

    it('자기 자신에게 요청할 수 없음', async () => {
      const result = await friendSystem.sendFriendRequest(
        'char1',
        'User A',
        'char1',
        'User A'
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('yourself');
    });

    it('이미 친구인 경우 요청할 수 없음', async () => {
      // 먼저 요청을 보내고 수락하여 친구 관계 설정
      await friendSystem.sendFriendRequest('char1', 'User A', 'char2', 'User B');
      await friendSystem.acceptFriendRequest('char1', 'char2', 'User B');

      // 이미 친구인 경우 요청 불가
      const result = await friendSystem.sendFriendRequest(
        'char1',
        'User A',
        'char2',
        'User B'
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Already friends');
    });

    it('이미 요청이 있는 경우 실패해야 함', async () => {
      await friendSystem.sendFriendRequest('char1', 'User A', 'char2', 'User B');

      const result = await friendSystem.sendFriendRequest(
        'char1',
        'User A',
        'char2',
        'User B'
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('already exists');
    });
  });

  describe('acceptFriendRequest', () => {
    it('요청을 수락하고 친구로 추가해야 함', async () => {
      await friendSystem.sendFriendRequest('char1', 'User A', 'char2', 'User B');
      const result = await friendSystem.acceptFriendRequest('char1', 'char2', 'User B');

      expect(result.success).toBe(true);

      const isFriend = await friendSystem.getFriendManager().isFriend('char1', 'char2');
      expect(isFriend).toBe(true);
    });

    it('양방향 친구 관계가 설정되어야 함', async () => {
      await friendSystem.sendFriendRequest('char1', 'User A', 'char2', 'User B');
      await friendSystem.acceptFriendRequest('char1', 'char2', 'User B');

      const isFriend1 = await friendSystem.getFriendManager().isFriend('char1', 'char2');
      const isFriend2 = await friendSystem.getFriendManager().isFriend('char2', 'char1');

      expect(isFriend1).toBe(true);
      expect(isFriend2).toBe(true);
    });

    it('존재하지 않는 요청의 수락은 실패해야 함', async () => {
      const result = await friendSystem.acceptFriendRequest('char1', 'char2', 'User B');

      expect(result.success).toBe(false);
    });
  });

  describe('rejectFriendRequest', () => {
    it('요청을 거절할 수 있음', async () => {
      await friendSystem.sendFriendRequest('char1', 'User A', 'char2', 'User B');
      const result = await friendSystem.rejectFriendRequest('char1', 'char2');

      expect(result.success).toBe(true);
    });

    it('거절하면 친구 관계가 설정되지 않음', async () => {
      await friendSystem.sendFriendRequest('char1', 'User A', 'char2', 'User B');
      await friendSystem.rejectFriendRequest('char1', 'char2');

      const isFriend = await friendSystem.getFriendManager().isFriend('char1', 'char2');
      expect(isFriend).toBe(false);
    });
  });

  describe('removeFriend', () => {
    it('친구 삭제 (양방향)', async () => {
      await friendSystem.sendFriendRequest('char1', 'User A', 'char2', 'User B');
      await friendSystem.acceptFriendRequest('char1', 'char2', 'User B');

      const result = await friendSystem.removeFriend('char1', 'char2');

      expect(result.success).toBe(true);

      const isFriend1 = await friendSystem.getFriendManager().isFriend('char1', 'char2');
      const isFriend2 = await friendSystem.getFriendManager().isFriend('char2', 'char1');

      expect(isFriend1).toBe(false);
      expect(isFriend2).toBe(false);
    });
  });

  describe('getFriendListWithStatus', () => {
    it('친구 목록과 온라인 상태를 반환해야 함', async () => {
      await friendSystem.sendFriendRequest('char1', 'User A', 'char2', 'User B');
      await friendSystem.acceptFriendRequest('char1', 'char2', 'User B');
      await friendSystem.characterOnline('char1', 'User A');
      await friendSystem.characterOnline('char2', 'User B');

      const list = await friendSystem.getFriendListWithStatus('char1');

      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('char2');
      expect(list[0].online).toBe(true);
      expect(list[0].lastSeen).toBeDefined();
    });

    it('오프라인 친구의 상태를 올바르게 반환해야 함', async () => {
      await friendSystem.sendFriendRequest('char1', 'User A', 'char2', 'User B');
      await friendSystem.acceptFriendRequest('char1', 'char2', 'User B');
      await friendSystem.characterOnline('char2', 'User B');
      await friendSystem.characterOffline('char2');

      const list = await friendSystem.getFriendListWithStatus('char1');

      expect(list[0].online).toBe(false);
      expect(list[0].lastSeen).toBeDefined();
    });

    it('빈 목록을 처리할 수 있음', async () => {
      const list = await friendSystem.getFriendListWithStatus('char1');

      expect(list).toEqual([]);
    });
  });

  describe('characterOnline & characterOffline', () => {
    it('캐릭터를 온라인으로 설정할 수 있음', async () => {
      const result = await friendSystem.characterOnline('char1', 'User A');

      expect(result.success).toBe(true);
      expect(result.online).toBe(true);
    });

    it('캐릭터를 오프라인으로 설정할 수 있음', async () => {
      await friendSystem.characterOnline('char1', 'User A');
      const result = await friendSystem.characterOffline('char1');

      expect(result.success).toBe(true);
      expect(result.online).toBe(false);
    });

    it('온라인 상태를 확인할 수 있음', async () => {
      await friendSystem.characterOnline('char1', 'User A');

      const isOnline = await friendSystem.getOnlineTracker().isOnline('char1');

      expect(isOnline).toBe(true);
    });
  });

  describe('clearCharacterData', () => {
    it('캐릭터의 모든 데이터를 삭제해야 함', async () => {
      await friendSystem.sendFriendRequest('char1', 'User A', 'char2', 'User B');
      await friendSystem.acceptFriendRequest('char1', 'char2', 'User B');
      await friendSystem.characterOnline('char1', 'User A');

      await friendSystem.clearCharacterData('char1');

      const friendList = await friendSystem.getFriendManager().getFriendList('char1');
      const isOnline = await friendSystem.getOnlineTracker().isOnline('char1');

      expect(friendList).toEqual([]);
      expect(isOnline).toBe(false);
    });
  });

  describe('getSystemStats', () => {
    it('시스템 통계를 반환해야 함', async () => {
      await friendSystem.characterOnline('char1', 'User A');
      await friendSystem.characterOnline('char2', 'User B');
      await friendSystem.characterOnline('char3', 'User C');

      const stats = await friendSystem.getSystemStats();

      expect(stats.onlineUsersCount).toBe(3);
      expect(stats.onlineUserIds).toEqual(['char1', 'char2', 'char3']);
    });

    it('온라인 사용자가 없으면 0을 반환해야 함', async () => {
      const stats = await friendSystem.getSystemStats();

      expect(stats.onlineUsersCount).toBe(0);
      expect(stats.onlineUserIds).toEqual([]);
    });
  });

  describe('전체 워크플로우', () => {
    it('친구 추가 전체 워크플로우 테스트', async () => {
      // 1. 요청 전송
      const sendResult = await friendSystem.sendFriendRequest(
        'char1',
        'User A',
        'char2',
        'User B'
      );
      expect(sendResult.success).toBe(true);

      // 2. 요청 확인
      const requests = await friendSystem.getRequestManager().getReceivedRequests('char2');
      expect(requests).toHaveLength(1);

      // 3. 요청 수락
      const acceptResult = await friendSystem.acceptFriendRequest('char1', 'char2', 'User B');
      expect(acceptResult.success).toBe(true);

      // 4. 친구 관계 확인
      const isFriend = await friendSystem.getFriendManager().isFriend('char1', 'char2');
      expect(isFriend).toBe(true);

      // 5. 친구 목록 확인
      const friendList = await friendSystem.getFriendManager().getFriendList('char1');
      expect(friendList).toHaveLength(1);

      // 6. 온라인 상태 확인
      await friendSystem.characterOnline('char2', 'User B');
      const friendListWithStatus = await friendSystem.getFriendListWithStatus('char1');
      expect(friendListWithStatus[0].online).toBe(true);

      // 7. 친구 삭제
      const removeResult = await friendSystem.removeFriend('char1', 'char2');
      expect(removeResult.success).toBe(true);

      // 8. 친구 관계 삭제 확인
      const isFriendAfterRemove = await friendSystem.getFriendManager().isFriend('char1', 'char2');
      expect(isFriendAfterRemove).toBe(false);
    });
  });
});