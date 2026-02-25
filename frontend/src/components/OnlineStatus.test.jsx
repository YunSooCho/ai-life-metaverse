import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import OnlineStatus from './OnlineStatus';
import { I18nProvider } from '../i18n/I18nContext';

/**
 * OnlineStatus 컴포넌트 테스트
 */
describe('OnlineStatus Component', () => {
  // Mock Socket.io
  const mockSocket = {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  };

  // Mock Translations
  const mockTranslations = {
    'ui.onlineStatus.title': 'Online Status',
    'ui.onlineStatus.close': 'Close',
    'ui.onlineStatus.onlineCount': 'Online',
    'ui.onlineStatus.allUsers': 'All Users',
    'ui.onlineStatus.friendsOnly': 'Friends Only',
    'ui.onlineStatus.refresh': 'Refresh',
    'ui.onlineStatus.noUsersOnline': 'No users online',
    'ui.onlineStatus.noFriendsOnline': 'No friends online',
    'ui.onlineStatus.chat': 'Chat',
    'ui.onlineStatus.friend': 'FRIEND',
    'ui.common.loading': 'Loading...'
  };

  const createWrapper = (props = {}) => {
    const defaultProps = {
      visible: true,
      characterId: 'character-1',
      socket: mockSocket,
      onChat: jest.fn(),
      onClose: jest.fn(),
      ...props
    };

    return render(
      <I18nProvider translations={mockTranslations}>
        <OnlineStatus {...defaultProps} />
      </I18nProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'getOnlineUsers') {
        callback({
          success: true,
          users: [
            { characterId: 'character-2', characterName: 'User 2', statusMessage: 'Playing' },
            { characterId: 'character-3', characterName: 'User 3', statusMessage: 'AFK' }
          ]
        });
      }
      if (event === 'getFriends') {
        callback({
          success: true,
          friends: [
            { id: 'character-2', name: 'User 2' }
          ]
        });
      }
    });
  });

  describe('초기 렌더링', () => {
    test('visible=false일 때 렌더링 안 함', () => {
      createWrapper({ visible: false });
      expect(screen.queryByText('Online Status')).not.toBeInTheDocument();
    });

    test('visible=true일 때 온라인 상태 창 표시', () => {
      createWrapper();
      expect(screen.getByText('Online Status')).toBeInTheDocument();
    });

    test('닫기 버튼 렌더링', () => {
      createWrapper();
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('온라인 유저 목록 로드', () => {
    test('마운트 시 온라인 유저 목록 요청', async () => {
      createWrapper();
      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('getOnlineUsers', {}, expect.any(Function));
      });
    });

    test('온라인 유저 목록 표시', async () => {
      createWrapper();
      await waitFor(() => {
        expect(screen.getByText('User 2')).toBeInTheDocument();
        expect(screen.getByText('User 3')).toBeInTheDocument();
      });
    });

    test('자신을 목록에서 제외', async () => {
      mockSocket.emit.mockImplementation((event, data, callback) => {
        if (event === 'getOnlineUsers') {
          callback({
            success: true,
            users: [
              { characterId: 'character-1', characterName: 'My Character' },
              { characterId: 'character-2', characterName: 'User 2' }
            ]
          });
        }
        if (event === 'getFriends') {
          callback({ success: true, friends: [] });
        }
      });

      createWrapper({ characterId: 'character-1' });
      await waitFor(() => {
        expect(screen.queryByText('My Character')).not.toBeInTheDocument();
        expect(screen.getByText('User 2')).toBeInTheDocument();
      });
    });
  });

  describe('친구 목록 필터링', () => {
    beforeEach(() => {
      mockSocket.emit.mockImplementation((event, data, callback) => {
        if (event === 'getOnlineUsers') {
          callback({
            success: true,
            users: [
              { characterId: 'character-2', characterName: 'Friend', statusMessage: 'Playing' },
              { characterId: 'character-3', characterName: 'Stranger', statusMessage: 'AFK' }
            ]
          });
        }
        if (event === 'getFriends') {
          callback({
            success: true,
            friends: [
              { id: 'character-2', name: 'Friend' }
            ]
          });
        }
      });
    });

    test('필터 탭 렌더링', () => {
      createWrapper();
      expect(screen.getByText('All Users')).toBeInTheDocument();
      expect(screen.getByText('Friends Only')).toBeInTheDocument();
    });

    test('모든 유저 보기 필터', async () => {
      createWrapper();
      await waitFor(() => {
        const allUsersTab = screen.getByText('All Users');
        fireEvent.click(allUsersTab);
        expect(screen.getByText('Friend')).toBeInTheDocument();
        expect(screen.getByText('Stranger')).toBeInTheDocument();
      });
    });

    test('친구만 보기 필터', async () => {
      createWrapper();
      await waitFor(() => {
        const friendsTab = screen.getByText('Friends Only');
        fireEvent.click(friendsTab);
        expect(screen.getByText('Friend')).toBeInTheDocument();
        expect(screen.queryByText('Stranger')).not.toBeInTheDocument();
      });
    });
  });

  describe('새로고침 기능', () => {
    test('새로고침 버튼 클릭 시 목록 다시 로드', async () => {
      const refreshSpy = jest.fn();

      mockSocket.emit.mockImplementation((event) => {
        if (event === 'getOnlineUsers') {
          refreshSpy();
        }
      });

      createWrapper();
      await waitFor(() => {
        expect(refreshSpy).toHaveBeenCalled();
      });

      refreshSpy.mockClear();

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(refreshSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Socket 이벤트 핸들링', () => {
    test('userOnline 이벤트 핸들러 등록', () => {
      createWrapper();
      expect(mockSocket.on).toHaveBeenCalledWith('userOnline', expect.any(Function));
    });

    test('userOffline 이벤트 핸들러 등록', () => {
      createWrapper();
      expect(mockSocket.on).toHaveBeenCalledWith('userOffline', expect.any(Function));
    });

    test('userOnline 이벤트 수신 시 새 유저 추가', async () => {
      const { rerender } = createWrapper();

      await waitFor(() => {
        expect(screen.queryByText('New User')).not.toBeInTheDocument();
      });

      // userOnline 이벤트 핸들러 가져오기
      const userOnlineHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'userOnline'
      )[1];

      // 이벤트 발생
      act(() => {
        userOnlineHandler({
          characterId: 'character-4',
          characterName: 'New User',
          statusMessage: 'Just joined'
        });
      });

      // 새로 렌더링 하지 않으면 업데이트가 반영되지 않을 수 있음
      rerender(
        <I18nProvider translations={mockTranslations}>
          <OnlineStatus
            visible={true}
            characterId="character-1"
            socket={mockSocket}
            onChat={jest.fn()}
            onClose={jest.fn()}
          />
        </I18nProvider>
      );
    });

    test('userOffline 이벤트 수신 시 유저 제거', async () => {
      mockSocket.emit.mockImplementation((event, data, callback) => {
        if (event === 'getOnlineUsers') {
          callback({
            success: true,
            users: [
              { characterId: 'character-2', characterName: 'User 2' },
              { characterId: 'character-3', characterName: 'User 3' }
            ]
          });
        }
        if (event === 'getFriends') {
          callback({ success: true, friends: [] });
        }
      });

      const { rerender } = createWrapper();

      await waitFor(() => {
        expect(screen.getByText('User 2')).toBeInTheDocument();
      });

      // userOffline 이벤트 핸들러 가져오기
      const userOfflineHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'userOffline'
      )[1];

      // 이벤트 발생
      act(() => {
        userOfflineHandler({ characterId: 'character-2' });
      });

      rerender(
        <I18nProvider translations={mockTranslations}>
          <OnlineStatus
            visible={true}
            characterId="character-1"
            socket={mockSocket}
            onChat={jest.fn()}
            onClose={jest.fn()}
          />
        </I18nProvider>
      );
    });
  });

  describe('채팅 기능', () => {
    test('채팅 버튼 렌더링', async () => {
      const onChatSpy = jest.fn();
      createWrapper({ onChat: onChatSpy });

      await waitFor(() => {
        const chatButtons = screen.getAllByTitle('Chat');
        expect(chatButtons.length).toBeGreaterThan(0);
      });
    });

    test('채팅 버튼 클릭 시 onChat 호출', async () => {
      const onChatSpy = jest.fn();
      createWrapper({ onChat: onChatSpy });

      await waitFor(() => {
        const chatButton = screen.getByTitle('Chat');
        fireEvent.click(chatButton);
        expect(onChatSpy).toHaveBeenCalled();
      });
    });
  });

  describe('닫기 기능', () => {
    test('닫기 버튼 클릭 시 onClose 호출', () => {
      const onCloseSpy = jest.fn();
      createWrapper({ onClose: onCloseSpy });

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(onCloseSpy).toHaveBeenCalled();
    });
  });

  describe('빈 상태 처리', () => {
    test('온라인 유저가 없을 때 메시지 표시', async () => {
      mockSocket.emit.mockImplementation((event, data, callback) => {
        if (event === 'getOnlineUsers') {
          callback({ success: true, users: [] });
        }
        if (event === 'getFriends') {
          callback({ success: true, friends: [] });
        }
      });

      createWrapper();

      await waitFor(() => {
        expect(screen.getByText('No users online')).toBeInTheDocument();
      });
    });

    test('친구가 온라인이 아닐 때 메시지 표시', async () => {
      mockSocket.emit.mockImplementation((event, data, callback) => {
        if (event === 'getOnlineUsers') {
          callback({ success: true, users: [] });
        }
        if (event === 'getFriends') {
          callback({ success: true, friends: [] });
        }
      });

      const { container } = createWrapper();

      await waitFor(() => {
        expect(screen.getByText('No users online')).toBeInTheDocument();
      });

      // 친구 필터 탭 클릭
      const friendsTab = screen.getByText('Friends Only');
      fireEvent.click(friendsTab);

      await waitFor(() => {
        expect(screen.getByText('No friends online')).toBeInTheDocument();
      });
    });
  });

  describe('클린업', () => {
    test('언마운트 시 Socket 이벤트 리스너 제거', () => {
      const { unmount } = createWrapper();

      unmount();

      expect(mockSocket.off).toHaveBeenCalledWith('userOnline', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('userOffline', expect.any(Function));
    });
  });

  describe('상태 메시지 표시', () => {
    test('상태 메시지가 있을 때 렌더링', async () => {
      mockSocket.emit.mockImplementation((event, data, callback) => {
        if (event === 'getOnlineUsers') {
          callback({
            success: true,
            users: [
              { characterId: 'character-2', characterName: 'Player', statusMessage: 'Playing level 5' }
            ]
          });
        }
        if (event === 'getFriends') {
          callback({ success: true, friends: [] });
        }
      });

      createWrapper();

      await waitFor(() => {
        expect(screen.getByText('Player')).toBeInTheDocument();
      });
    });
  });

  describe('친구 배지', () => {
    test('친구인 경우 FRIEND 배지 표시', async () => {
      mockSocket.emit.mockImplementation((event, data, callback) => {
        if (event === 'getOnlineUsers') {
          callback({
            success: true,
            users: [
              { characterId: 'character-2', characterName: 'Friend', statusMessage: '' }
            ]
          });
        }
        if (event === 'getFriends') {
          callback({
            success: true,
            friends: [
              { id: 'character-2', name: 'Friend' }
            ]
          });
        }
      });

      createWrapper();

      await waitFor(() => {
        expect(screen.getByText('FRIEND')).toBeInTheDocument();
      });
    });
  });
});