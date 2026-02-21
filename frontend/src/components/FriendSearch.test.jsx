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

  const defaultProps = {
    visible: true,
    socket: mockSocket,
    characterId: mockCharacterId,
    onSearch: vi.fn(),
    onSelect: vi.fn(),
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
  });

  afterEach(() => {
    mockSocket.emit.mockClear();
  });

  it('renders search window when visible', () => {
    renderComponent();
    const closeButton = screen.getByText('✕');
    expect(closeButton).toBeInTheDocument();
  });

  it('does not render when visible is false', () => {
    renderComponent({ visible: false });
    expect(screen.queryByText('✕')).not.toBeInTheDocument();
  });

  it('shows loading state during search', async () => {
    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'searchCharacters') {
        // Loading state 유지
      }
    });

    renderComponent();

    // 검색어 입력
    const input = screen.getByPlaceholderText(/친구 검색.../);
    fireEvent.change(input, { target: { value: 'Alice' } });

    // 검색 버튼 클릭
    const searchButton = screen.getByRole('button', { name: /검색/ });
    fireEvent.click(searchButton);

    expect(screen.getByText(/로딩 중/)).toBeInTheDocument();
  });

  it('displays search results successfully', async () => {
    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'searchCharacters') {
        callback({ success: true, characters: mockResults });
      }
    });

    renderComponent();

    // 검색어 입력
    const input = screen.getByPlaceholderText(/친구 검색.../);
    fireEvent.change(input, { target: { value: 'Alice' } });

    // 검색 버튼 클릭
    const searchButton = screen.getAllByRole('button').find(btn =>
      btn.textContent.includes('검색')
    );
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Lv.5')).toBeInTheDocument();
      expect(screen.getByText('Lv.3')).toBeInTheDocument();
    });
  });

  it('shows no results message', async () => {
    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'searchCharacters') {
        callback({ success: true, characters: [] });
      }
    });

    renderComponent();

    // 검색어 입력
    const input = screen.getByPlaceholderText(/친구 검색.../);
    fireEvent.change(input, { target: { value: 'NotFound' } });

    // 검색 버튼 클릭
    const searchButton = screen.getAllByRole('button').find(btn =>
      btn.textContent.includes('검색')
    );
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/검색 결과가 없습니다/)).toBeInTheDocument();
    });
  });

  it('calls handleClose when close button is clicked', () => {
    renderComponent();
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('selects character when clicked', async () => {
    const mockSelectCallback = vi.fn();

    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'searchCharacters') {
        callback({ success: true, characters: mockResults });
      }
    });

    renderComponent({ onSelect: mockSelectCallback });

    // 검색어 입력 후 검색
    const input = screen.getByPlaceholderText(/친구 검색.../);
    fireEvent.change(input, { target: { value: 'Alice' } });

    const searchButton = screen.getAllByRole('button').find(btn =>
      btn.textContent.includes('검색')
    );
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // 캐릭터 클릭
    const characterElement = screen.getByText('Alice').closest('.clickable');
    fireEvent.click(characterElement);

    await waitFor(() => {
      expect(mockSelectCallback).toHaveBeenCalledWith(mockResults[0]);
    });
  });

  it('does not search with empty keyword', async () => {
    renderComponent();

    const searchButton = screen.getAllByRole('button').find(btn =>
      btn.textContent.includes('검색')
    );
    fireEvent.click(searchButton);

    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it('calls onSelect and onClose when add button clicked', async () => {
    const mockSelectCallback = vi.fn();
    const mockCloseCallback = vi.fn();

    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'searchCharacters') {
        callback({ success: true, characters: mockResults });
      }
    });

    renderComponent({
      onSelect: mockSelectCallback,
      onClose: mockCloseCallback
    });

    // 검색어 입력 후 검색
    const input = screen.getByPlaceholderText(/친구 검색.../);
    fireEvent.change(input, { target: { value: 'Alice' } });

    const searchButton = screen.getAllByRole('button').find(btn =>
      btn.textContent.includes('검색')
    );
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // 추가 버튼 (+) 클릭
    const addButtons = screen.getAllByText('+');
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(mockSelectCallback).toHaveBeenCalledWith(mockResults[0]);
      expect(mockCloseCallback).toHaveBeenCalled();
    });
  });
});