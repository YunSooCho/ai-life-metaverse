import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nProvider } from '../i18n/I18nContext';
import FriendRequest from './FriendRequest';
import '@testing-library/jest-dom';

// Mock socket
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn()
};

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

  const defaultProps = {
    visible: true,
    requests: [],
    socket: mockSocket,
    characterId: mockCharacterId,
    onAccept: vi.fn(),
    onReject: vi.fn(),
    onClose: vi.fn()
  };

  const renderComponent = (props = {}) => {
    return render(
      <I18nProvider>
        <FriendRequest {...defaultProps} {...props} />
      </I18nProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockSocket.emit.mockClear();
  });

  it('renders friend request window when visible', () => {
    renderComponent();
    const requestCount = screen.getByText(/보류 중 요청:/);
    const closeButton = screen.getByText('✕');
    expect(requestCount).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
  });

  it('does not render when visible is false', () => {
    renderComponent({ visible: false });
    expect(screen.queryByText(/보류 중 요청:/)).not.toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'getPendingRequests') {
        // Don't call callback immediately to keep loading state
      }
    });

    renderComponent();
    const loadingText = screen.getByText(/로딩 중/);
    expect(loadingText).toBeInTheDocument();
  });

  it('displays no pending requests message', () => {
    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'getPendingRequests') {
        callback({ success: true, requests: [] });
      }
    });

    renderComponent();
    const emptyMessage = screen.getByText(/보류 중인 요청이 없습니다/);
    expect(emptyMessage).toBeInTheDocument();
  });

  it('displays friend requests successfully', async () => {
    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'getPendingRequests') {
        callback({ success: true, requests: mockRequests });
      }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('"Let\'s be friends!"')).toBeInTheDocument();
      const requestCount = screen.getByText(/보류 중 요청: 2/);
      expect(requestCount).toBeInTheDocument();
    });
  });

  it('calls handleClose when close button is clicked', () => {
    renderComponent();
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('loads friend requests on mount', async () => {
    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'getPendingRequests') {
        expect(data.characterId).toBe(mockCharacterId);
        callback({ success: true, requests: mockRequests });
      }
    });

    renderComponent();

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'getPendingRequests',
        { characterId: mockCharacterId },
        expect.any(Function)
      );
    });
  });

  it('accepts friend request', async () => {
    const mockAcceptCallback = vi.fn();

    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'getPendingRequests') {
        callback({ success: true, requests: mockRequests });
      } else if (event === 'acceptFriendRequest') {
        callback({ success: true });
      }
    });

    renderComponent({ onAccept: mockAcceptCallback });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    const acceptButtons = screen.getAllByTitle(/수락/);
    fireEvent.click(acceptButtons[0]);

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'acceptFriendRequest',
        {
          characterId: mockCharacterId,
          requestId: 'req1',
          senderId: 'char456'
        },
        expect.any(Function)
      );
      expect(mockAcceptCallback).toHaveBeenCalledWith(mockRequests[0]);
    });
  });

  it('rejects friend request', async () => {
    const mockRejectCallback = vi.fn();
    window.confirm = vi.fn().mockReturnValue(true);

    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'getPendingRequests') {
        callback({ success: true, requests: mockRequests });
      } else if (event === 'rejectFriendRequest') {
        callback({ success: true });
      }
    });

    renderComponent({ onReject: mockRejectCallback });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByTitle(/거절/);
    fireEvent.click(rejectButtons[0]);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Bob 요청을 거절하시겠습니까?');
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'rejectFriendRequest',
        {
          characterId: mockCharacterId,
          requestId: 'req1',
          senderId: 'char456'
        },
        expect.any(Function)
      );
    });
  });

  it('cancels rejection when confirm dialog is cancelled', async () => {
    window.confirm = vi.fn().mockReturnValue(false);

    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'getPendingRequests') {
        callback({ success: true, requests: mockRequests });
      }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByTitle(/거절/);
    fireEvent.click(rejectButtons[0]);

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledTimes(1); // Only getPendingRequests was called
      expect(mockSocket.emit).not.toHaveBeenCalledWith(
        'rejectFriendRequest',
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  it('shows alert when accept fails', async () => {
    window.alert = vi.fn();

    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'getPendingRequests') {
        callback({ success: true, requests: mockRequests });
      } else if (event === 'acceptFriendRequest') {
        callback({ success: false, message: 'Server error' });
      }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    const acceptButtons = screen.getAllByTitle(/수락/);
    fireEvent.click(acceptButtons[0]);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Server error');
    });
  });
});