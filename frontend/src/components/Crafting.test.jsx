import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Crafting from './Crafting';
import '@testing-library/jest-dom';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    emitWithAck: jest.fn()
  };
  
  return jest.fn(() => mockSocket);
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

describe('Crafting Component', () => {
  const mockCharacterId = 'char123';
  const mockOnClose = jest.fn();
  const mockSocket = require('socket.io-client')();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket.emit.mockClear();
    mockSocket.on.mockClear();
  });

  test('제작 패널이 렌더링되면 레시피 목록을 불러온다', () => {
    render(
      <Crafting
        craftingLevel={1}
        craftingExp={0}
        characterId={mockCharacterId}
        onClose={mockOnClose}
      />
    );

    expect(mockSocket.emit).toHaveBeenCalledWith('getRecipes', expect.any(Object), expect.any(Function));
    expect(mockSocket.emit).toHaveBeenCalledWith('getCraftingLevel', expect.any(Object), expect.any(Function));
    expect(mockSocket.emit).toHaveBeenCalledWith('getCraftingTables', expect.any(Object), expect.any(Function));
  });

  test('제작 패널에 레벨과 경험치가 표시된다', () => {
    render(
      <Crafting
        craftingLevel={5}
        craftingExp={50}
        characterId={mockCharacterId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/level:/i)).toBeInTheDocument();
  });

  test('닫기 버튼 클릭 시 onClose가 호출된다', () => {
    render(
      <Crafting
        craftingLevel={1}
        craftingExp={0}
        characterId={mockCharacterId}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('소켓 이벤트 리스너가 컴포넌트 마운트 시 등록되고 언마운트 시 제거된다', () => {
    const { unmount } = render(
      <Crafting
        craftingLevel={1}
        craftingExp={0}
        characterId={mockCharacterId}
        onClose={mockOnClose}
      />
    );

    expect(mockSocket.on).toHaveBeenCalledWith('craftingResult', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('craftingError', expect.any(Function));

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith('craftingResult', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('craftingError', expect.any(Function));
  });

  test('제작 성공 시 결과가 표시된다', async () => {
    const mockCraftingResultCallback = mockSocket.on.mock.calls.find(
      ([eventName]) => eventName === 'craftingResult'
    )[1];

    const mockResult = {
      success: true,
      recipeId: 'recipe123',
      resultItems: [{ itemId: 'wooden_sword', quantity: 1 }],
      levelStats: { level: 2, exp: 75, expToNext: 150 }
    };

    render(
      <Crafting
        craftingLevel={1}
        craftingExp={0}
        characterId={mockCharacterId}
        onClose={mockOnClose}
      />
    );

    // 제작 성공 이벤트 발생
    mockCraftingResultCallback(mockResult);

    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  test('제작 실패 시 에러가 표시된다', async () => {
    const mockCraftingErrorCallback = mockSocket.on.mock.calls.find(
      ([eventName]) => eventName === 'craftingError'
    )[1];

    const mockError = {
      message: '재료가 부족합니다'
    };

    // alert mock
    window.alert = jest.fn();

    render(
      <Crafting
        craftingLevel={1}
        craftingExp={0}
        characterId={mockCharacterId}
        onClose={mockOnClose}
      />
    );

    // 제작 실패 이벤트 발생
    mockCraftingErrorCallback(mockError);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error: 재료가 부족합니다');
    });
  });

  test('레벨업 시 경험치 바가 올바르게 표시된다', () => {
    render(
      <Crafting
        craftingLevel={3}
        craftingExp={125}
        characterId={mockCharacterId}
        onClose={mockOnClose}
      />
    );

    const expToNext = Math.floor(100 * Math.pow(1.5, 2)); // 100 * 1.5^2 = 225
    const progressPercent = (125 / expToNext) * 100;

    // Progress bar가 있는지 확인
    const progressBar = document.querySelector('.exp-bar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar.style.width).toBe(`${progressPercent}%`);
  });
});