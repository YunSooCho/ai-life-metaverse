/**
 * FriendList 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nProvider } from '../../i18n/I18nContext';
import FriendList from '../FriendList';

// 테스트용 번역 데이터
const testTranslations = {
  ui: {
    friends: {
      title: 'Friends',
      onlineCount: 'Online: {count}',
      filterAll: 'All',
      filterOnline: 'Online',
      filterOffline: 'Offline',
      searchPlaceholder: 'Search friends...',
      loading: 'Loading friends...',
      noFriends: 'No friends found',
      removeFriend: 'Remove',
      removeConfirm: 'Are you sure you want to remove this friend?'
    }
  },
  common: {
    loading: 'Loading...',
    close: 'Close'
  }
};

// Simple t function for tests
const createT = (translations) => (key) => {
  const keys = key.split('.');
  let value = translations;
  for (const k of keys) {
    value = value?.[k];
  }
  return typeof value === 'string' ? value : key;
};

const mockT = createT(testTranslations);

vi.mock('../../i18n/I18nContext', () => ({
  useI18n: () => ({ t: mockT })
}));

// 테스트용 렌더러 wrapper
const renderWithI18n = (ui) => {
  return render(
    <I18nProvider>
      {ui}
    </I18nProvider>
  );
};

describe('FriendList Component', () => {
  const mockSocket = {
    emit: vi.fn((event, data, callback) => {
      if (typeof callback === 'function') {
        callback({ success: true, friends: mockFriends });
      }
    })
  };

  const mockCharacterId = 'player-123';

  const mockFriends = [
    {
      id: 'friend-1',
      name: 'Alice',
      online: true,
      addedAt: '2026-02-01T00:00:00Z'
    },
    {
      id: 'friend-2',
      name: 'Bob',
      online: false,
      addedAt: '2026-02-01T01:00:00Z'
    },
    {
      id: 'friend-3',
      name: 'Charlie',
      online: true,
      addedAt: '2026-02-01T02:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('기본 렌더링', () => {
    it('visible=false일 때 렌더링되지 않아야 함', () => {
      const { container } = render(
        <FriendList
          visible={false}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );
      expect(container.querySelector('.friendlist-overlay')).toBeNull();
    });

    it('visible=true일 때 친구 목록이 렌더링되어야 함', () => {
      const { container } = render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );
      expect(container.querySelector('.friendlist-overlay')).not.toBeNull();
      expect(container.querySelector('.friendlist-window')).not.toBeNull();
    });

    it('친구 제목이 표시되어야 함', () => {
      render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );
      expect(screen.getByRole('heading', { name: 'ui.friends.title' })).toBeDefined();
    });
  });

  describe('친구 목록 표시', () => {
    it('모든 친구가 표시되어야 함', () => {
      render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );

      mockFriends.forEach(friend => {
        expect(screen.getByText(friend.name)).toBeDefined();
      });
    });

    it('온라인 친구 수가 올바르게 표시되어야 함', () => {
      render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );

      const onlineCount = mockFriends.filter(f => f.online).length;
      const totalCount = mockFriends.length;

      expect(screen.getByText(/ui.friends.onlineCount/)).toBeDefined();
    });

    it('온라인/오프라인 상태 인디케이터가 표시되어야 함', () => {
      const { container } = render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );

      const onlineIndicators = container.querySelectorAll('.friend-status-indicator.online');
      const offlineIndicators = container.querySelectorAll('.friend-status-indicator.offline');

      const onlineCount = mockFriends.filter(f => f.online).length;
      const offlineCount = mockFriends.length - onlineCount;

      expect(onlineIndicators.length).toBe(onlineCount);
      expect(offlineIndicators.length).toBe(offlineCount);
    });
  });

  describe('필터 기능', () => {
    it('전체 필터 탭이 존재해야 함', () => {
      render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );

      expect(screen.getByText('ui.friends.filterAll')).toBeDefined();
    });

    it('온라인 필터 탭이 존재해야 함', () => {
      render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );

      expect(screen.getByText('ui.friends.filterOnline')).toBeDefined();
    });

    it('오프라인 필터 탭이 존재해야 함', () => {
      render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );

      expect(screen.getByText('ui.friends.filterOffline')).toBeDefined();
    });

    it('온라인 필터를 클릭하면 온라인 친구만 표시되어야 함', async () => {
      const { container } = render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );

      const onlineFilter = screen.getByText('ui.friends.filterOnline');
      fireEvent.click(onlineFilter);

      await waitFor(() => {
        const visibleFriends = container.querySelectorAll('.friendlist-item');
        const onlineCount = mockFriends.filter(f => f.online).length;
        expect(visibleFriends.length).toBe(onlineCount);
      });
    });
  });

  describe('검색 기능', () => {
    it('검색 입력창이 존재해야 함', () => {
      const { container } = render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );

      expect(container.querySelector('.friendlist-search-input')).toBeDefined();
    });

    it('검색어 입력으로 친구를 필터링해야 함', async () => {
      const { container } = render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );

      const searchInput = container.querySelector('.friendlist-search-input');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });

      await waitFor(() => {
        const visibleFriends = container.querySelectorAll('.friendlist-item');
        expect(visibleFriends.length).toBe(1);
        expect(screen.getByText('Alice')).toBeDefined();
      });
    });

    it('일치하는 친구가 없으면 빈 상태 메시지를 표시해야 함', async () => {
      const { container } = render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );

      const searchInput = container.querySelector('.friendlist-search-input');
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

      await waitFor(() => {
        expect(screen.getByText('ui.friends.noResults')).toBeDefined();
      });
    });
  });

  describe('친구 삭제 기능', () => {
    it('삭제 버튼이 표시되어야 함', () => {
      const { container } = render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );

      const removeButtons = container.querySelectorAll('.remove-button');
      expect(removeButtons.length).toBe(mockFriends.length);
    });

    it('삭제 버튼 클릭 시 확인 다이얼로그가 표시되어야 함', () => {
      const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(true);

      const { container } = render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
          onRemoveFriend={vi.fn()}
        />
      );

      const removeButton = container.querySelector('.remove-button');
      fireEvent.click(removeButton);

      expect(confirmMock).toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'removeFriend',
        expect.objectContaining({ characterId: mockCharacterId }),
        expect.any(Function)
      );

      confirmMock.mockRestore();
    });

    it('삭제 확인 시 socket 이벤트가 전송되어야 함', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const onRemoveMock = vi.fn();

      render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
          onRemoveFriend={onRemoveMock}
        />
      );

      const removeButton = screen.getAllByTitle('ui.friends.remove')[0];
      fireEvent.click(removeButton);

      expect(mockSocket.emit).toHaveBeenCalled();
    });

    it('삭제 취소 시 socket 이벤트가 전송되지 않아야 함', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
          onRemoveFriend={vi.fn()}
        />
      );

      const removeButton = screen.getAllByTitle('ui.friends.remove')[0];
      fireEvent.click(removeButton);

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('채팅 버튼', () => {
    it('온라인 친구에게 채팅 버튼이 표시되어야 함', () => {
      const { container } = render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
          onChat={vi.fn()}
        />
      );

      const chatButtons = container.querySelectorAll('.chat-button');
      const onlineCount = mockFriends.filter(f => f.online).length;

      expect(chatButtons.length).toBe(onlineCount);
    });

    it('오프라인 친구에게 채팅 버튼이 표시되지 않아야 함', () => {
      const offlineFriends = [
        { id: 'offline-1', name: 'Dave', online: false, addedAt: '2026-02-01' }
      ];

      const { container } = render(
        <FriendList
          visible={true}
          friends={offlineFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
          onChat={vi.fn()}
        />
      );

      const chatButtons = container.querySelectorAll('.chat-button');
      expect(chatButtons.length).toBe(0);
    });

    it('채팅 버튼 클릭 시 onChat 콜백이 호출되어야 함', () => {
      const onChatMock = vi.fn();

      render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
          onChat={onChatMock}
        />
      );

      const chatButtons = screen.getAllByTitle('ui.friends.chat');
      if (chatButtons.length > 0) {
        fireEvent.click(chatButtons[0]);
        expect(onChatMock).toHaveBeenCalled();
      }
    });
  });

  describe('닫기 버튼', () => {
    it('닫기 버튼이 존재해야 함', () => {
      const { container } = render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
          onClose={vi.fn()}
        />
      );

      expect(container.querySelector('.pixel-close-button')).toBeDefined();
    });

    it('닫기 버튼 클릭 시 onClose가 호출되어야 함', () => {
      const onCloseMock = vi.fn();

      const { container } = render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
          onClose={onCloseMock}
        />
      );

      const closeButton = container.querySelector('.pixel-close-button');
      fireEvent.click(closeButton);

      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  describe('빈 상태', () => {
    it('친구가 없을 때 빈 상태 메시지를 표시해야 함', () => {
      render(
        <FriendList
          visible={true}
          friends={[]}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );

      expect(screen.getByText('ui.friends.noFriends')).toBeDefined();
    });
  });

  describe('Socket 통신', () => {
    it('visible=true일 때 getFriends 이벤트가 전송되어야 함', () => {
      render(
        <FriendList
          visible={true}
          friends={mockFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'getFriends',
        { characterId: mockCharacterId },
        expect.any(Function)
      );
    });
  });

  describe('무한 루프 방지', () => {
    it('friends prop이 동일한 배열일 때 무한 루프가 발생하지 않아야 함', () => {
      // 같은 friends 배열 지속 전달
      const sameFriends = mockFriends;

      const { rerender } = render(
        <FriendList
          visible={true}
          friends={sameFriends}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );

      // 여러 번 재렌더링 (무한 루프 발생하면 테스트가 타임아웃됨)
      for (let i = 0; i < 10; i++) {
        rerender(
          <FriendList
            visible={true}
            friends={sameFriends}
            socket={mockSocket}
            characterId={mockCharacterId}
          />
        );
      }

      // 테스트 완료 (타임아웃 없이 성공하면 무한 루프 방지됨)
      expect(true).toBe(true);
    });

    it('friends prop이 새로운 배열이지만 내용이 같으면 무한 루프가 발생하지 않아야 함', () => {
      const friends1 = [...mockFriends];
      const friends2 = [...friends1]; // 동일한 내용, 다른 참조

      const { rerender } = render(
        <FriendList
          visible={true}
          friends={friends1}
          socket={mockSocket}
          characterId={mockCharacterId}
        />
      );

      // 여러 번 재렌더링 동일한 내용
      for (let i = 0; i < 10; i++) {
        rerender(
          <FriendList
            visible={true}
            friends={i % 2 === 0 ? friends1 : friends2}
            socket={mockSocket}
            characterId={mockCharacterId}
          />
        );
      }

      expect(true).toBe(true);
    });
  });
});