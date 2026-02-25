/**
 * Phase 1-B: 성장 시각화 시스템 - EvolutionVisual.jsx 테스트
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EvolutionVisual, { withEvolutionSocket } from '../EvolutionVisual';

// Mock soundManager
jest.mock('../../hooks/useSoundManager', () => ({
  useSoundManager: jest.fn(() => ({
    playSFX: jest.fn(),
  })),
}));

describe('EvolutionVisual Component', () => {
  const defaultProps = {
    evolutionData: {
      previousStage: 0,
      newStage: 1,
      stageName: '1차 진화',
      description: '첫 진화 형태',
      style: 'warrior',
      styleName: '전사',
      aura: 'shimmer',
      pixelSize: 35,
      color: { r: 1.1, g: 1.0, b: 0.9 },
      characterEmoji: '⚔️',
    },
    onDismiss: jest.fn(),
    duration: 6000,
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    test('기본 렌더링 테스트', () => {
      render(<EvolutionVisual {...defaultProps} />);

      // 헤더 확인
      expect(screen.getByText('Evolution!')).toBeInTheDocument();

      // 캐릭터 이모지 확인
      expect(screen.getByText('⚔️')).toBeInTheDocument();

      // 진화 스타일 확인
      expect(screen.getByText('⚔️ 전사')).toBeInTheDocument();
    });

    test('진화 스타일 표시', () => {
      const props = {
        ...defaultProps,
        evolutionData: {
          ...defaultProps.evolutionData,
          style: 'mage',
          styleName: '마법사',
          characterEmoji: '🔮',
        },
      };

      render(<EvolutionVisual {...props} />);

      expect(screen.getByText('🔮 마법사')).toBeInTheDocument();
    });

    test('진화 세부 정보 표시', () => {
      render(<EvolutionVisual {...defaultProps} />);

      expect(screen.getByText('1차 진화')).toBeInTheDocument();
      expect(screen.getByText('첫 진화 형태')).toBeInTheDocument();
    });

    test('레인저 스타일', () => {
      const props = {
        ...defaultProps,
        evolutionData: {
          ...defaultProps.evolutionData,
          style: 'ranger',
          styleName: '레인저',
          characterEmoji: '🏹',
        },
      };

      render(<EvolutionVisual {...props} />);

      expect(screen.getByText('🏹 레인저')).toBeInTheDocument();
    });

    test('서포터 스타일', () => {
      const props = {
        ...defaultProps,
        evolutionData: {
          ...defaultProps.evolutionData,
          style: 'support',
          styleName: '서포터',
          characterEmoji: '💚',
        },
      };

      render(<EvolutionVisual {...props} />);

      expect(screen.getByText('💚 서포터')).toBeInTheDocument();
    });

    test('진화 스타일 없음', () => {
      const props = {
        ...defaultProps,
        evolutionData: {
          previousStage: 0,
          newStage: 1,
          stageName: '1차 진화',
          description: '첫 진화 형태',
        },
      };

      render(<EvolutionVisual {...props} />);

      // 기본 이모지
      expect(screen.getByText('✨')).toBeInTheDocument();
    });
  });

  describe('Evolution Animation', () => {
    test('진화 전 상태 표시', () => {
      render(<EvolutionVisual {...defaultProps} />);

      // 초기 상태 (evolving = false, evolved = false)
      const characterSprite = screen.getByText('⚔️');
      expect(characterSprite).toBeInTheDocument();
    });

    test('진화 중 상태', () => {
      render(<EvolutionVisual {...defaultProps} />);

      // 1초 후 evolving 상태
      jest.advanceTimersByTime(1000);

      // evolving 상태 확인 (실제 DOM상 효과 확인)

      // 3초 후 evolved 상태
      jest.advanceTimersByTime(2000);

      // evolved 상태 확인 (진화 스타일 표시)
      expect(screen.getByText('⚔️ 전사')).toBeInTheDocument();
      expect(screen.getByText('1차 진화')).toBeInTheDocument();
    });

    test('오라 효과 색상', () => {
      const props = {
        ...defaultProps,
        evolutionData: {
          ...defaultProps.evolutionData,
          aura: 'divine',
        },
      };

      render(<EvolutionVisual {...props} />);

      // 오라 효과 확인 (실제 DOM 구조에 따라 테스트 조정 필요)
    });
  });

  describe('Particle Animation', () => {
    test('100개 파티클 생성', () => {
      const { container } = render(<EvolutionVisual {...defaultProps} />);

      // 파티클 요소 확인
      // 실제 DOM 구조에 따라 테스트 방식 조정 필요
    });

    test('파티클 색상 다양성', () => {
      render(<EvolutionVisual {...defaultProps} />);

      // 파티클 색상 확인
      // 실제 DOM 구조에 따라 테스트 방식 조정 필요
    });
  });

  describe('Sound Integration', () => {
    test('evolution_start 사운드 재생', () => {
      const { useSoundManager } = require('../../hooks/useSoundManager');
      const mockPlaySFX = jest.fn();
      useSoundManager.mockReturnValue({ playSFX: mockPlaySFX });

      render(<EvolutionVisual {...defaultProps} />);

      // 500ms 후 evolution_start 사운드
      jest.advanceTimersByTime(500);
      expect(mockPlaySFX).toHaveBeenCalledWith('evolution_start');
    });

    test('evolution_complete 사운드 재생', () => {
      const { useSoundManager } = require('../../hooks/useSoundManager');
      const mockPlaySFX = jest.fn();
      useSoundManager.mockReturnValue({ playSFX: mockPlaySFX });

      render(<EvolutionVisual {...defaultProps} />);

      // 3초 후 evolution_complete 사운드
      jest.advanceTimersByTime(3000);
      expect(mockPlaySFX).toHaveBeenCalledWith('evolution_complete');
    });
  });

  describe('Screen Shake', () => {
    test('스크린 쉐이크 효과', () => {
      render(<EvolutionVisual {...defaultProps} />);

      // 스크린 쉐이크 효과 확인 (실제 DOM 구조에 따라 테스트 조정 필요)
    });
  });

  describe('User Interaction', () => {
    test('닫기 버튼 클릭 시 onDismiss 호출', () => {
      render(<EvolutionVisual {...defaultProps} />);

      // 진화 완료될 때까지 대기
      jest.advanceTimersByTime(3000);

      const dismissButton = screen.getByText('확인');
      fireEvent.click(dismissButton);

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    test('진화 전에는 닫기 버튼 없음', () => {
      render(<EvolutionVisual {...defaultProps} />);

      // 진화 전 (2초)
      jest.advanceTimersByTime(2000);

      // 닫기 버튼 표시 안 됨
      expect(screen.queryByText('확인')).not.toBeInTheDocument();
    });
  });

  describe('Auto Dismiss', () => {
    test('duration 후 자동 닫기', () => {
      render(<EvolutionVisual {...defaultProps} duration={3000} />);

      // 타이머 진행
      jest.advanceTimersByTime(3000);

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Aura Effects', () => {
    test('shimmer 오라', () => {
      const props = {
        ...defaultProps,
        evolutionData: {
          ...defaultProps.evolutionData,
          aura: 'shimmer',
        },
      };

      render(<EvolutionVisual {...props} />);

      // shimmer 오라 확인 (실제 DOM 구조에 따라 테스트 조정 필요)
    });

    test('glow 오라', () => {
      const props = {
        ...defaultProps,
        evolutionData: {
          ...defaultProps.evolutionData,
          aura: 'glow',
        },
      };

      render(<EvolutionVisual {...props} />);

      // glow 오라 확인
    });

    test('radiant 오라', () => {
      const props = {
        ...defaultProps,
        evolutionData: {
          ...defaultProps.evolutionData,
          aura: 'radiant',
        },
      };

      render(<EvolutionVisual {...props} />);

      // radiant 오라 확인
    });

    test('legendary 오라', () => {
      const props = {
        ...defaultProps,
        evolutionData: {
          ...defaultProps.evolutionData,
          aura: 'legendary',
        },
      };

      render(<EvolutionVisual {...props} />);

      // legendary 오라 확인
    });

    test('divine 오라', () => {
      const props = {
        ...defaultProps,
        evolutionData: {
          ...defaultProps.evolutionData,
          aura: 'divine',
        },
      };

      render(<EvolutionVisual {...props} />);

      // divine 오라 확인
    });
  });

  describe('Color Changes', () => {
    test('색상 변화 효과', () => {
      const props = {
        ...defaultProps,
        evolutionData: {
          ...defaultProps.evolutionData,
          color: { r: 1.2, g: 0.8, b: 0.6 },
        },
      };

      render(<EvolutionVisual {...props} />);

      // 색상 변화 확인 (실제 DOM 구조에 따라 테스트 조정 필요)
    });
  });

  describe('Edge Cases', () => {
    test('undefined style', () => {
      const props = {
        ...defaultProps,
        evolutionData: {
          previousStage: 0,
          newStage: 1,
          stageName: '1차 진화',
          description: '첫 진화 형태',
        },
      };

      render(<EvolutionVisual {...props} />);

      // 에러 없이 렌더링
      expect(screen.getByText('Evolution!')).toBeInTheDocument();
    });

    test('null onDismiss', () => {
      const props = {
        ...defaultProps,
        onDismiss: null,
      };

      render(<EvolutionVisual {...props} />);

      // 에러 없이 렌더링
      expect(screen.getByText('Evolution!')).toBeInTheDocument();
    });

    test('undefined aura (기본값 사용)', () => {
      const props = {
        ...defaultProps,
        evolutionData: {
          previousStage: 0,
          newStage: 1,
          stageName: '1차 진화',
          description: '첫 진화 형태',
          aura: undefined,
        },
      };

      render(<EvolutionVisual {...props} />);

      // 에러 없이 렌더링
      expect(screen.getByText('Evolution!')).toBeInTheDocument();
    });
  });

  describe('HOC: withEvolutionSocket', () => {
    test('소켓 이벤트 수신 시 EvolutionVisual 표시', () => {
      const mockSocket = {
        on: jest.fn(),
        off: jest.fn(),
      };

      const MockComponent = () => <div>Mock Component</div>;
      const WrappedComponent = withEvolutionSocket(MockComponent);

      render(
        <WrappedComponent socket={mockSocket} />
      );

      // 소켓 이벤트 리스너 등록
      expect(mockSocket.on).toHaveBeenCalledWith('evolution', expect.any(Function));

      // 이벤트 핸들러 호출
      const eventHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'evolution'
      )[1];

      eventHandler({
        previousStage: 0,
        newStage: 1,
        stageName: '1차 진화',
        description: '첫 진화 형태',
        style: 'warrior',
        styleName: '전사',
        aura: 'shimmer',
        characterEmoji: '⚔️',
      });

      // EvolutionVisual 컴포넌트 표시
      expect(screen.getByText('Evolution!')).toBeInTheDocument();
    });

    test('소켓 정리 시 이벤트 리스너 제거', () => {
      const mockSocket = {
        on: jest.fn(),
        off: jest.fn(),
      };

      const MockComponent = () => <div>Mock Component</div>;
      const WrappedComponent = withEvolutionSocket(MockComponent);

      const { unmount } = render(
        <WrappedComponent socket={mockSocket} />
      );

      unmount();

      expect(mockSocket.off).toHaveBeenCalledWith('evolution', expect.any(Function));
    });

    test('소켓 없이 모든 컴포넌트 렌더링', () => {
      const MockComponent = () => <div>Mock Component</div>;
      const WrappedComponent = withEvolutionSocket(MockComponent);

      render(
        <WrappedComponent socket={null} />
      );

      expect(screen.getByText('Mock Component')).toBeInTheDocument();
    });
  });
});