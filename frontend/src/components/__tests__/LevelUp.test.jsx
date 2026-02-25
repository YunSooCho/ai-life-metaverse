/**
 * Phase 1-B: 성장 시각화 시스템 - LevelUp.jsx 테스트
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import LevelUp, { withLevelUpSocket } from '../LevelUp';

// Mock soundManager
vi.mock('../../hooks/useSoundManager', () => ({
  useSoundManager: vi.fn(() => ({
    playSFX: vi.fn(),
  })),
}));

const mockUseSoundManager = require('../../hooks/useSoundManager').useSoundManager;

describe('LevelUp Component', () => {
  const defaultProps = {
    levelUpData: {
      previousLevel: 9,
      newLevel: 10,
      statIncreases: {
        hp: 10,
        affinity: 5,
      },
    },
    onDismiss: vi.fn(),
    duration: 5000,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    test('기본 렌더링 테스트', () => {
      render(<LevelUp {...defaultProps} />);

      // 헤더 확인
      expect(screen.getByText('Level Up!')).toBeInTheDocument();

      // 레벨 표시 확인
      expect(screen.getByText('9')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();

      // 축하 메시지 확인
      expect(screen.getByText('축하합니다! 레벨 10 달성!')).toBeInTheDocument();

      // 닫기 버튼 확인
      expect(screen.getByText('확인')).toBeInTheDocument();
    });

    test('레벨이 같으면 이전 레벨 표시 안 함', () => {
      const props = {
        ...defaultProps,
        levelUpData: {
          previousLevel: 10,
          newLevel: 10,
          statIncreases: {},
        },
      };

      render(<LevelUp {...props} />);

      // 이전 레벨은 표시되지 않아야 함
      expect(screen.queryByText('9')).not.toBeInTheDocument();
    });

    test('statIncreases가 없으면 스테이터스 컨테이너 표시 안 함', () => {
      const props = {
        ...defaultProps,
        levelUpData: {
          previousLevel: 9,
          newLevel: 10,
          statIncreases: {},
        },
      };

      render(<LevelUp {...props} />);

      // 스테이터스 증가 섹션 표시 안 함
      expect(screen.queryByText('스테이터스 증가')).not.toBeInTheDocument();
    });

    test('모든 스테이터스 증가 표시', () => {
      const props = {
        ...defaultProps,
        levelUpData: {
          previousLevel: 9,
          newLevel: 10,
          statIncreases: {
            hp: 10,
            affinity: 5,
            charisma: 3,
            intelligence: 2,
          },
        },
      };

      render(<LevelUp {...props} />);

      // 모든 스테이터스 확인
      expect(screen.getByText('HP')).toBeInTheDocument();
      expect(screen.getByText('+10')).toBeInTheDocument();
      expect(screen.getByText('친화력')).toBeInTheDocument();
      expect(screen.getByText('+5')).toBeInTheDocument();
      expect(screen.getByText('카리스마')).toBeInTheDocument();
      expect(screen.getByText('+3')).toBeInTheDocument();
      expect(screen.getByText('지능')).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    test('닫기 버튼 클릭 시 onDismiss 호출', () => {
      render(<LevelUp {...defaultProps} />);

      const dismissButton = screen.getByText('확인');
      fireEvent.click(dismissButton);

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    test('dismissButton 호버 효과', () => {
      render(<LevelUp {...defaultProps} />);

      const dismissButton = screen.getByText('확인');

      // 마우스 진입
      fireEvent.mouseEnter(dismissButton);
      expect(dismissButton.style.backgroundColor).toBe('rgb(255, 165, 0)');

      // 마우스 나감
      fireEvent.mouseLeave(dismissButton);
      expect(dismissButton.style.backgroundColor).toBe('rgb(255, 215, 0)');
    });
  });

  describe('Auto Dismiss', () => {
    test('duration 후 자동 닫기', () => {
      render(<LevelUp {...defaultProps} duration={3000} />);

      // 타이머 진행
      vi.advanceTimersByTime(3000);

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    test('수동 닫기 후 자동 닫기 방지', () => {
      render(<LevelUp {...defaultProps} duration={3000} />);

      // 수동 닫기
      const dismissButton = screen.getByText('확인');
      fireEvent.click(dismissButton);

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);

      // 타이머 진행
      vi.advanceTimersByTime(3000);

      // 추가 호출 없음
      expect(defaultProps.onDismiss).not.toHaveBeenCalledTimes(2);
    });
  });

  describe('Counting Animation', () => {
    test('레벨 카운트다운 애니메이션', () => {
      const props = {
        ...defaultProps,
        levelUpData: {
          previousLevel: 9,
          newLevel: 10,
          statIncreases: {},
        },
      };

      render(<LevelUp {...props} />);

      // 초기 상태
      expect(screen.getByText('9')).toBeInTheDocument();

      // 카운트다운 (50ms × 1 = 1 증가)
      vi.advanceTimersByTime(500);

      // 레벨 10에 도달
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    test('대규모 레벨업 카운트다운', () => {
      const props = {
        ...defaultProps,
        levelUpData: {
          previousLevel: 5,
          newLevel: 10,
          statIncreases: {},
        },
      };

      render(<LevelUp {...props} />);

      // 카운트다운 진행 (500ms × 5 = 5 증가)
      vi.advanceTimersByTime(2500);

      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  describe('Sound Integration', () => {
    test('level_up 사운드 재생', () => {
      const mockPlaySFX = vi.fn();
      mockUseSoundManager.mockReturnValue({ playSFX: mockPlaySFX });

      render(<LevelUp {...defaultProps} />);

      // 사운드 재생 확인
      expect(mockPlaySFX).toHaveBeenCalledWith('level_up');
    });
  });

  describe('Edge Cases', () => {
    test('undefined statIncreases', () => {
      const props = {
        ...defaultProps,
        levelUpData: {
          previousLevel: 9,
          newLevel: 10,
          statIncreases: undefined,
        },
      };

      render(<LevelUp {...props} />);

      // 에러 없이 렌더링
      expect(screen.getByText('Level Up!')).toBeInTheDocument();
    });

    test('null onDismiss', () => {
      const props = {
        ...defaultProps,
        onDismiss: null,
      };

      render(<LevelUp {...props} />);

      const dismissButton = screen.getByText('확인');
      fireEvent.click(dismissButton);

      // 에러 없이 동작 (컴포넌트는 닫혀야 함)
    });

    test('짧은 duration', () => {
      render(<LevelUp {...defaultProps} duration={100} />);

      vi.advanceTimersByTime(100);

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    test('긴 duration', () => {
      render(<LevelUp {...defaultProps} duration={10000} />);

      vi.advanceTimersByTime(5000);

      // 아직 닫히지 않음
      expect(defaultProps.onDismiss).not.toHaveBeenCalled();

      vi.advanceTimersByTime(5000);

      // 이제 닫힘
      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('HOC: withLevelUpSocket', () => {
    test('소켓 이벤트 수신 시 LevelUp 표시', () => {
      const mockSocket = {
        on: vi.fn(),
        off: vi.fn(),
      };

      const MockComponent = () => <div>Mock Component</div>;
      const WrappedComponent = withLevelUpSocket(MockComponent);

      const { container } = render(
        <WrappedComponent socket={mockSocket} />
      );

      // Mock Component 렌더링 확인
      expect(screen.getByText('Mock Component')).toBeInTheDocument();

      // 소켓 이벤트 리스너 등록
      expect(mockSocket.on).toHaveBeenCalledWith('levelUp', expect.any(Function));

      // 이벤트 핸들러 호출
      const eventHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'levelUp'
      )[1];

      eventHandler({
        previousLevel: 9,
        newLevel: 10,
        statIncreases: { hp: 10 },
      });

      // LevelUp 컴포넌트 표시
      expect(screen.getByText('Level Up!')).toBeInTheDocument();
    });

    test('소켓 정리 시 이벤트 리스너 제거', () => {
      const mockSocket = {
        on: vi.fn(),
        off: vi.fn(),
      };

      const MockComponent = () => <div>Mock Component</div>;
      const WrappedComponent = withLevelUpSocket(MockComponent);

      const { unmount } = render(
        <WrappedComponent socket={mockSocket} />
      );

      unmount();

      expect(mockSocket.off).toHaveBeenCalledWith('levelUp', expect.any(Function));
    });

    test('소켓 없이 모든 컴포넌트 렌더링', () => {
      const MockComponent = () => <div>Mock Component</div>;
      const WrappedComponent = withLevelUpSocket(MockComponent);

      render(
        <WrappedComponent socket={null} />
      );

      expect(screen.getByText('Mock Component')).toBeInTheDocument();
    });
  });
});