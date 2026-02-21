import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nProvider } from '../i18n/I18nContext';
import FriendSearch from './FriendSearch';
import '@testing-library/jest-dom';

// Mock socket
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn()
};

describe('FriendSearch', () => {
  const mockCharacterId = 'char123';
  const mockCharacterName = 'TestUser';
  const mockSearchResults = [
    {
      id: 'char456',
      name: 'Alice',
      level: 5
    },
    {
      id: 'char789',
      name: 'Bob',
      level: 3
    }
  ];

  const defaultProps = {
    visible: true,
    socket: mockSocket,
    characterId: mockCharacterId,
    characterName: mockCharacterName,
    onSendRequest: vi.fn(),
    onClose: vi.fn()
  };

  const renderComponent = (props = {}) => {
    return render(
      <I18nProvider>
        <FriendSearch {...defaultProps} {...props} />
      </I18nProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup localStorage
    localStorage.clear();
    localStorage.setItem('app-language', 'ko');
  });

  afterEach(() => {
    localStorage.clear();
    mockSocket.emit.mockClear();
  });

  it('renders friend search window when visible', () => {
    renderComponent();
    expect(screen.getByText('친구 찾기')).toBeInTheDocument();
  });

  it('does not render when visible is false', () => {
    renderComponent({ visible: false });
    expect(screen.queryByText('친구 찾기')).not.toBeInTheDocument();
  });

  it('shows search hint initially', () => {
    renderComponent();
    expect(screen.getByText('친구 이름 또는 ID로 검색하세요')).toBeInTheDocument();
  });

  it('calls handleClose when close button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('✕'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows error message when search query is empty', () => {
    renderComponent();
    const searchButton = screen.getByText('검색');
    fireEvent.click(searchButton);
    expect(screen.getByText('검색어를 입력하세요')).toBeInTheDocument();
  });

  it('performs search and displays results', async () => {
    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'getAllCharacters') {
        callback({ success: true, characters: mockSearchResults });
      }
    });

    renderComponent();

    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('친구 이름 또는 ID 검색...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    // 검색 버튼 클릭
    const searchButton = screen.getByText('검색');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'getAllCharacters',
        {},
        expect.any(Function)
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('sends friend request', async () => {
    const mockSendCallback = vi.fn();

    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'getAllCharacters') {
        callback({ success: true, characters: mockSearchResults });
      } else if (event === 'sendFriendRequest') {
        callback({ success: true });
      }
    });

    renderComponent({ onSendRequest: mockSendCallback });

    // 검색
    const searchInput = screen.getByPlaceholderText('친구 이름 또는 ID 검색...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    const searchButton = screen.getByText('검색');
    fireEvent.click(searchButton);

    // 결과 대기
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // 요청 전송
    const sendButton = screen.getAllByText('추가하기')[0];
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'sendFriendRequest',
        {
          fromId: mockCharacterId,
          fromName: mockCharacterName,
          toId: 'char456',
          message: ''
        },
        expect.any(Function)
      );
      expect(mockSendCallback).toHaveBeenCalledWith(mockSearchResults[0]);
    });
  });

  it('shows error when search fails', async () => {
    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'getAllCharacters') {
        callback({ success: false, message: 'Server error' });
      }
    });

    renderComponent();

    const searchInput = screen.getByPlaceholderText('친구 이름 또는 ID 검색...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    const searchButton = screen.getByText('검색');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('검색 실패')).toBeInTheDocument();
    });
  });

  it('searches on Enter key press', async () => {
    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'getAllCharacters') {
        callback({ success: true, characters: mockSearchResults });
      }
    });

    renderComponent();

    const searchInput = screen.getByPlaceholderText('친구 이름 또는 ID 검색...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });
    fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'getAllCharacters',
        {},
        expect.any(Function)
      );
    });
  });

  it('filters out self from search results', async () => {
    const charactersIncludingSelf = [
      ...mockSearchResults,
      { id: mockCharacterId, name: 'TestUser', level: 10 }
    ];

    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'getAllCharacters') {
        callback({ success: true, characters: charactersIncludingSelf });
      }
    });

    renderComponent();

    const searchInput = screen.getByPlaceholderText('친구 이름 또는 ID 검색...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const searchButton = screen.getByText('검색');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.queryByText('TestUser')).not.toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });
});