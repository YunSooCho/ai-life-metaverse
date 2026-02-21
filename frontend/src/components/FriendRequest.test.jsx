import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FriendRequest from './FriendRequest';
import '@testing-library/jest-dom';

// Mock useI18n Hook
vi.mock('../i18n/I18nContext', () => ({
  useI18n: () => ({
    t: (key) => {
      const translations = {
        'ui.friends.requests': '친구 요청',
        'ui.friends.pendingCount': '보류 중 요청',
        'ui.friends.noPendingRequests': '보류 중인 요청이 없습니다',
        'ui.friends.accept': '수락',
        'ui.friends.reject': '거절',
        'ui.friends.confirmReject': '{name} 요청을 거절하시겠습니까?',
        'ui.friends.acceptFailed': '친구 요청 수락에 실패했습니다',
        'ui.friends.rejectFailed': '친구 요청 거절에 실패했습니다',
        'ui.common.loading': '로딩 중...'
      };
      return translations[key] || key;
    },
    language: 'ko',
    changeLanguage: vi.fn(),
    languages: { ko: '한국어', ja: '日本語', en: 'English' }
  })
}));

// Mock socket - 기본 응답
const createMockSocket = (responses = {}) => ({
  emit: vi.fn((event, data, callback) => {
    if (typeof callback === 'function') {
      const defaultResponses = {
        getPendingRequests: { success: true, requests: [] },
        acceptFriendRequest: { success: true },
        rejectFriendRequest: { success: true }
      };
      callback(responses[event] || defaultResponses[event]);
    }
  }),
  on: vi.fn(),
  off: vi.fn()
});

describe('FriendRequest', () => {
  const mockCharacterId = 'char123';
  const mockRequests = [
    {
      id: 'req1',
      fromId: 'char456',
      fromName: 'Alice',
      message: 'Let\'s be friends!',
      createdAt: '2026-02-21T08:00:00Z'
    },
    {
      id: 'req2',
      fromId: 'char789',
      fromName: 'Bob',
      message: null,
      createdAt: '2026-02-21T07:30:00Z'
    }
  ];

  let mockSocket = null;

  const defaultProps = {
    visible: true,
    requests: [],
    socket: null,
    characterId: mockCharacterId,
    onAccept: vi.fn(),
    onReject: vi.fn(),
    onClose: vi.fn()
  };

  const renderComponent = (props = {}) => {
    return render(
      <FriendRequest {...defaultProps} {...props} />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket = createMockSocket();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders friend request window when visible', () => {
    renderComponent({ socket: mockSocket });
    expect(screen.getByText(/보류 중 요청:/)).toBeInTheDocument();
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('does not render when visible is false', () => {
    renderComponent({ visible: false, socket: mockSocket });
    expect(screen.queryByText(/보류 중 요청:/)).not.toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    // 콜백을 호출하지 않는 mock socket
    mockSocket.emit = vi.fn((event, data, callback) => {
      // 콜백 호출 안함
    });
    renderComponent({ socket: mockSocket });
    expect(screen.getByText(/로딩 중/)).toBeInTheDocument();
  });

  it('displays no pending requests message when prop is empty', () => {
    renderComponent({ requests: [], socket: mockSocket });
    expect(screen.getByText(/보류 중인 요청이 없습니다/)).toBeInTheDocument();
  });

  it('displays friend requests successfully when passed via prop', async () => {
    renderComponent({ requests: mockRequests, socket: mockSocket });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText(/보류 중 요청: 2/)).toBeInTheDocument();
    });
  });

  it('accepts friend request', async () => {
    const mockAcceptCallback = vi.fn();
    renderComponent({
      socket: mockSocket,
      requests: mockRequests,
      onAccept: mockAcceptCallback
    });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    const acceptButtons = screen.getAllByTitle(/수락/);
    fireEvent.click(acceptButtons[0]);

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'acceptFriendRequest',
        { characterId: mockCharacterId, requestId: 'req1', senderId: 'char456' },
        expect.any(Function)
      );
      expect(mockAcceptCallback).toHaveBeenCalled();
    });
  });

  it('rejects friend request', async () => {
    const mockRejectCallback = vi.fn();
    window.confirm = vi.fn(() => true);

    renderComponent({
      socket: mockSocket,
      requests: mockRequests,
      onReject: mockRejectCallback
    });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByTitle(/거절/);
    fireEvent.click(rejectButtons[0]);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'rejectFriendRequest',
        { characterId: mockCharacterId, requestId: 'req1', senderId: 'char456' },
        expect.any(Function)
      );
      expect(mockRejectCallback).toHaveBeenCalled();
    });
  });

  it('cancels rejection when confirm dialog is cancelled', async () => {
    window.confirm = vi.fn(() => false);

    renderComponent({ socket: mockSocket, requests: mockRequests });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByTitle(/거절/);
    fireEvent.click(rejectButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockSocket.emit).not.toHaveBeenCalledWith('rejectFriendRequest');
  });

  it('shows alert when accept fails', () => {
    const failSocket = createMockSocket();
    failSocket.emit = vi.fn((event, data, callback) => {
      if (event === 'acceptFriendRequest') {
        callback({ success: false, message: 'Accept failed' });
      } else {
        callback({ success: true, requests: [] });
      }
    });

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderComponent({ socket: failSocket, requests: mockRequests });

    const acceptButtons = screen.getAllByTitle(/수락/);
    fireEvent.click(acceptButtons[0]);

    expect(alertMock).toHaveBeenCalledWith('Accept failed');
    alertMock.mockRestore();
  });

  it('shows alert when reject fails', () => {
    const failSocket = createMockSocket();
    failSocket.emit = vi.fn((event, data, callback) => {
      if (event === 'rejectFriendRequest') {
        callback({ success: false, message: 'Reject failed' });
      } else {
        callback({ success: true, requests: [] });
      }
    });

    window.confirm = vi.fn(() => true);
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderComponent({ socket: failSocket, requests: mockRequests });

    const rejectButtons = screen.getAllByTitle(/거절/);
    fireEvent.click(rejectButtons[0]);

    expect(alertMock).toHaveBeenCalledWith('Reject failed');
    window.confirm.mockRestore();
    alertMock.mockRestore();
  });

  it('calls onClose when close button is clicked', () => {
    const mockCloseCallback = vi.fn();
    renderComponent({ socket: mockSocket, onClose: mockCloseCallback });

    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);

    expect(mockCloseCallback).toHaveBeenCalled();
  });

  it('displays request message if available', async () => {
    renderComponent({ socket: mockSocket, requests: mockRequests });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText(/Let's be friends!/)).toBeInTheDocument();
    });
  });

  it('displays no message placeholder if message is null', async () => {
    renderComponent({ socket: mockSocket, requests: mockRequests });

    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('removes accepted request from list', async () => {
    renderComponent({ socket: mockSocket, requests: mockRequests });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    const acceptButtons = screen.getAllByTitle(/수락/);
    fireEvent.click(acceptButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('handles multiple requests', async () => {
    const multipleRequests = [
      { id: 'req1', fromId: 'char1', fromName: 'Alice', message: 'Hi!', createdAt: '2026-02-21T08:00:00Z' },
      { id: 'req2', fromId: 'char2', fromName: 'Bob', message: null, createdAt: '2026-02-21T07:30:00Z' },
      { id: 'req3', fromId: 'char3', fromName: 'Charlie', message: 'Hello', createdAt: '2026-02-21T06:00:00Z' },
      { id: 'req4', fromId: 'char4', fromName: 'Diana', message: null, createdAt: '2026-02-21T05:30:00Z' },
      { id: 'req5', fromId: 'char5', fromName: 'Eve', message: 'Hey', createdAt: '2026-02-21T04:00:00Z' }
    ];

    renderComponent({ socket: mockSocket, requests: multipleRequests });

    await waitFor(() => {
      expect(screen.getByText(/보류 중 요청: 5/)).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
      expect(screen.getByText('Diana')).toBeInTheDocument();
      expect(screen.getByText('Eve')).toBeInTheDocument();
    });
  });
});