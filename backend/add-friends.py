#!/usr/bin/env python3

import sys

friends_events = """
  // ===== Phase 14: 친구 시스템 =====

  // 친구 목록 조회
  socket.on('getFriendList', async (data, callback) => {
    try {
      const { characterId } = data || {};
      if (!characterId) {
        return callback?.({ success: false, error: 'characterId is required' });
      }

      const friendList = await friendManager.getFriendList(characterId);
      callback?.({ success: true, friendList });
    } catch (error) {
      console.error('친구 목록 조회 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 친구 추가
  socket.on('addFriend', async (data, callback) => {
    try {
      const { characterId, friendId, friendName } = data || {};
      if (!characterId || !friendId) {
        return callback?.({ success: false, error: 'characterId and friendId are required' });
      }

      const result = await friendManager.addFriend(characterId, friendId, friendName || 'Unknown');
      callback?.(result);
    } catch (error) {
      console.error('친구 추가 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 친구 삭제
  socket.on('removeFriend', async (data, callback) => {
    try {
      const { characterId, friendId } = data || {};
      if (!characterId || !friendId) {
        return callback?.({ success: false, error: 'characterId and friendId are required' });
      }

      const result = await friendManager.removeFriend(characterId, friendId);
      callback?.(result);
    } catch (error) {
      console.error('친구 삭제 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 친구 검색
  socket.on('searchFriends', async (data, callback) => {
    try {
      const { characterId, query } = data || {};
      if (!characterId || !query) {
        return callback?.({ success: false, error: 'characterId and query are required' });
      }

      const results = await friendManager.searchFriends(characterId, query);
      callback?.({ success: true, results });
    } catch (error) {
      console.error('친구 검색 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 친구 수 조회
  socket.on('getFriendCount', async (data, callback) => {
    try {
      const { characterId } = data || {};
      if (!characterId) {
        return callback?.({ success: false, error: 'characterId is required' });
      }

      const count = await friendManager.getFriendCount(characterId);
      callback?.({ success: true, count });
    } catch (error) {
      console.error('친구 수 조회 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 친구 요청 전송
  socket.on('sendFriendRequest', async (data, callback) => {
    try {
      const { fromId, fromName, toId, toName } = data || {};
      if (!fromId || !toId) {
        return callback?.({ success: false, error: 'fromId and toId are required' });
      }

      const characterName = fromName || 'Unknown';
      const targetName = toName || 'Unknown';

      const result = await friendRequestManager.sendRequest(fromId, characterName, toId, targetName);

      // 수신자에게 알림
      if (result.success) {
        const toRoomId = characterRooms[toId];
        if (toRoomId) {
          io.to(toRoomId).emit('friendRequestReceived', {
            request: result.request,
            pendingCount: await friendRequestManager.getPendingRequestCount(toId)
          });
        }
      }

      callback?.(result);
    } catch (error) {
      console.error('친구 요청 전송 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 수신한 친구 요청 목록
  socket.on('getReceivedRequests', async (data, callback) => {
    try {
      const { characterId } = data || {};
      if (!characterId) {
        return callback?.({ success: false, error: 'characterId is required' });
      }

      const requests = await friendRequestManager.getReceivedRequests(characterId);
      callback?.({ success: true, requests });
    } catch (error) {
      console.error('수신 요청 조회 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 보낸 친구 요청 목록
  socket.on('getSentRequests', async (data, callback) => {
    try {
      const { characterId } = data || {};
      if (!characterId) {
        return callback?.({ success: false, error: 'characterId is required' });
      }

      const requests = await friendRequestManager.getSentRequests(characterId);
      callback?.({ success: true, requests });
    } catch (error) {
      console.error('발신 요청 조회 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 친구 요청 수락
  socket.on('acceptFriendRequest', async (data, callback) => {
    try {
      const { fromId, toId } = data || {};
      if (!fromId || !toId) {
        return callback?.({ success: false, error: 'fromId and toId are required' });
      }

      // 요청 수락
      const result = await friendRequestManager.acceptRequest(fromId, toId);

      // 수락된 경우, 양쪽에 친구 추가
      if (result.success) {
        const request = result.request;
        await friendManager.addFriend(toId, fromId, request.from.name);
        await friendManager.addFriend(fromId, toId, request.to.name);

        // 양쪽에게 알림
        const toRoomId = characterRooms[toId];
        const fromRoomId = characterRooms[fromId];

        if (toRoomId) {
          const toFriendList = await friendManager.getFriendList(toId);
          io.to(toRoomId).emit('friendRequestAccepted', {
            request,
            friendList: toFriendList
          });
        }

        if (fromRoomId) {
          const fromFriendList = await friendManager.getFriendList(fromId);
          io.to(fromRoomId).emit('friendRequestAccepted', {
            request,
            friendList: fromFriendList
          });
        }
      }

      callback?.(result);
    } catch (error) {
      console.error('친구 요청 수락 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 친구 요청 거절
  socket.on('rejectFriendRequest', async (data, callback) => {
    try {
      const { fromId, toId } = data || {};
      if (!fromId || !toId) {
        return callback?.({ success: false, error: 'fromId and toId are required' });
      }

      const result = await friendRequestManager.rejectRequest(fromId, toId);

      // 송신자에게 알림
      if (result.success) {
        const fromRoomId = characterRooms[fromId];
        if (fromRoomId) {
          io.to(fromRoomId).emit('friendRequestRejected', {
            request: result.request
          });
        }
      }

      callback?.(result);
    } catch (error) {
      console.error('친구 요청 거절 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 대기 중인 요청 수
  socket.on('getPendingRequestCount', async (data, callback) => {
    try {
      const { characterId } = data || {};
      if (!characterId) {
        return callback?.({ success: false, error: 'characterId is required' });
      }

      const count = await friendRequestManager.getPendingRequestCount(characterId);
      callback?.({ success: true, count });
    } catch (error) {
      console.error('대기 요청 수 조회 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // ===== Phase 14 종료 =====
"""

with open('server.js', 'r') as f:
    lines = f.readlines()

# 라인 1747 ("// 연결 종료") 앞에 코드 삽입 (0-indexed: 1746)
insert_line = 1746
if len(lines) > insert_line:
    lines.insert(insert_line, friends_events)
    with open('server.js', 'w') as f:
        f.writelines(lines)
    print("✅ 친구 시스템 이벤트 핸들러 추가 완료")
else:
    print(f"❌ 파일의 라인 수가 부족합니다: {len(lines)} lines, insert at line {insert_line + 1}")
    sys.exit(1)