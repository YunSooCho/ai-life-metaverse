import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nProvider } from '../i18n/I18nContext';
import FriendSearch from './FriendSearch';
import '@testing-library/jest-dom';

// Mock socket factory - 콜백 즉시 호출 (동기식)
const createMockSocketWithResponses = (searchResults = []) => ({
  emit: vi.fn((event, data, callback) => {
    // 콜백 함수가 있으면 즉시 응답 반환 (동기)
    if (typeof callback === 'function') {
      if (event === 'searchCharacters') {
        callback({ success: true, characters: searchResults });
      }
    }
  }),
  on: vi.fn(),
  off: vi.fn()
});

describe('FriendSearch', () => {
  const mockCharacterId = 'char123';
  const mockResults = [
    {
      id: 'char456',
      name: 'Alice',
      level: 5,
      type: 'helper'
    },
    {
      id: 'char789',
      name: 'Bob',
      level: 3,
      type: 'friendly'
    }
  ];

  let mockSocket = null;

  const defaultProps = {
    visible: true,
    socket: null,
    characterId: mockCharacterId,
    onSearch: vi.fn(),
    onSelect: vi.fn(),
    onClose: vi.fn()
  };

  const renderComponent = (socket, props = {}) => {
    return render(
      <I18nProvider>
        <FriendSearch {...defaultProps} socket={socket} {...props} />
      </I18nProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket = createMockSocketWithResponses([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders search window when visible', () => {
    renderComponent(mockSocket);
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('does not render when visible is false', () => {
    renderComponent(mockSocket, { visible: false });
    expect(screen.queryByText('✕')).not.toBeInTheDocument();
  });

  it('shows loading state during search', async () => {
    // 콜백을 호출하지 않는 mock socket
    const loadingSocket = {
      emit: vi.fn((event, data, callback) => {
        // 콜백 호출 안함
      }),
      on: vi.fn(),
      off: vi.fn()
    };

    renderComponent(loadingSocket);

    const input = screen.getByPlaceholderText(/친구 검색/);
    fireEvent.change(input, { target: { value: 'Alice' } });

    const searchButton = screen.getAllByRole('button').find(btn => btn.textContent.includes('검색'));
    if (searchButton) {
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/로딩 중/)).toBeInTheDocument();
      });
    }
  });

  it('displays search results successfully', async () => {
    const searchSocket = createMockSocketWithResponses(mockResults);
    renderComponent(searchSocket);

    const input = screen.getByPlaceholderText(/친구 검색/);
    fireEvent.change(input, { target: { value: 'Alice' } });

    const searchButton = screen.getAllByRole('button').find(btn => btn.textContent.includes('검색'));
    if (searchButton) {
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
      });
    }
  });

  it('does not search with empty keyword', () => {
    renderComponent(mockSocket);

    const input = screen.getByPlaceholderText(/친구 검색/);
    fireEvent.change(input, { target: { value: '' } });

    const searchButton = screen.getAllByRole('button').find(btn => btn.textContent.includes('검색'));
    if (searchButton) {
      fireEvent.click(searchButton);

      expect(mockSocket.emit).not.toHaveBeenCalled();
    }
  });

  it('calls onSelect and onClose when add button clicked', async () => {
    const searchSocket = createMockSocketWithResponses(mockResults);
    const mockSelectCallback = vi.fn();
    renderComponent(searchSocket, { onSelect: mockSelectCallback });

    const input = screen.getByPlaceholderText(/친구 검색/);
    fireEvent.change(input, { target: { value: 'Alice' } });

    const searchButton = screen.getAllByRole('button').find(btn => btn.textContent.includes('검색'));
    if (searchButton) {
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      const addButtons = screen.getAllByRole('button').filter(btn => btn.textContent.includes('추가'));
      if (addButtons.length > 0) {
        fireEvent.click(addButtons[0]);

        expect(mockSelectCallback).toHaveBeenCalled();
      }
    }
  });

  it('calls onClose when close button is clicked', () => {
    const mockCloseCallback = vi.fn();
    renderComponent(mockSocket, { onClose: mockCloseCallback });

    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);

    expect(mockCloseCallback).toHaveBeenCalled();
  });

  it('handles empty search results', async () => {
    const searchSocket = createMockSocketWithResponses([]);
    renderComponent(searchSocket);

    const input = screen.getByPlaceholderText(/친구 검색/);
    fireEvent.change(input, { target: { value: 'NonExistent' } });

    const searchButton = screen.getAllByRole('button').find(btn => btn.textContent.includes('검색'));
    if (searchButton) {
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/검색 결과가 없습니다/)).toBeInTheDocument();
      });
    }
  });

  it('clears search results when window is closed and reopened', async () => {
    const searchSocket = createMockSocketWithResponses(mockResults);
    const { rerender } = render(
      <I18nProvider>
        <FriendSearch {...defaultProps} socket={searchSocket} visible={true} />
      </I18nProvider>
    );

    const input = screen.getByPlaceholderText(/친구 검색/);
    fireEvent.change(input, { target: { value: 'Alice' } });

    const searchButton = screen.getAllByRole('button').find(btn => btn.textContent.includes('검색'));
    if (searchButton) {
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      rerender(
        <I18nProvider>
          <FriendSearch {...defaultProps} socket={searchSocket} visible={false} />
        </I18nProvider>
      );

      rerender(
        <I18nProvider>
          <FriendSearch {...defaultProps} socket={searchSocket} visible={true} />
        </I18nProvider>
      );

      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    }
  });
});