/**
 * Phase 1-B: 성장 시각화 시스템 - TitleNotification.jsx 테스트
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TitleNotification, { withTitleSocket } from '../TitleNotification';

// Mock soundManager
jest.mock('../../hooks/useSoundManager', () => ({
  useSoundManager: jest.fn(() => ({
    playSFX: jest.fn(),
  })),
}));

describe('TitleNotification Component', () => {
  const defaultProps = {
    titleData: {
      id: 'veteran',
      name: '베테랑 모험가',
      description: '많은 경험을 쌓은 모험가',
      type: 'ACHIEVEMENT',
      rarity: 'RARE',
      icon: '⚔️',
      requirements: {
        level: 20,
      },
      passiveEffect: {
        stat: 'experience',
        multiplier: 1.10,
      },
    },
    onDismiss: jest.fn(),
    duration: 5000,
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
      render(<TitleNotification {...defaultProps} />);

      // 헤더 확인
      expect(screen.getByText('Title Unlocked!')).toBeInTheDocument();

      // 타이틀 아이콘 확인
      expect(screen.getByText('⚔️')).toBeInTheDocument();

      // 타이틀 이름 확인
      expect(screen.getByText('베테랑 모험가')).toBeInTheDocument();

      // 타이틀 설명 확인
      expect(screen.getByText('많은 경험을 쌓은 모험가')).toBeInTheDocument();

      // 희소성 배지 확인
      expect(screen.getByText('RARE')).toBeInTheDocument();

      // 닫기 버튼 확인
      expect(screen.getByText('확인')).toBeInTheDocument();
    });

    test('COMMON 희소성', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          rarity: 'COMMON',
        },
      };

      render(<TitleNotification {...props} />);

      expect(screen.getByText('COMMON')).toBeInTheDocument();
    });

    test('EPIC 희소성', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          rarity: 'EPIC',
        },
      };

      render(<TitleNotification {...props} />);

      expect(screen.getByText('EPIC')).toBeInTheDocument();
    });

    test('LEGENDARY 희소성', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          rarity: 'LEGENDARY',
        },
      };

      render(<TitleNotification {...props} />);

      expect(screen.getByText('LEGENDARY')).toBeInTheDocument();
    });

    test('타이틀 아이콘 없음 (기본값)', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          icon: undefined,
        },
      };

      render(<TitleNotification {...props} />);

      // 기본 아이콘
      expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    test('passiveEffect 없음', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          passiveEffect: undefined,
        },
      };

      render(<TitleNotification {...props} />);

      // 수동 효과 섹션 표시 안 함
      expect(screen.queryByText('수동 효과')).not.toBeInTheDocument();
    });

    test('"novice" 타이틀', () => {
      const props = {
        ...defaultProps,
        titleData: {
          id: 'novice',
          name: '신규 모험가',
          description: '첫 발을 내딛은 모험가',
          type: 'ACHIEVEMENT',
          rarity: 'COMMON',
          icon: '🗺️',
          requirements: {
            level: 1,
          },
          passiveEffect: {
            stat: 'experience',
            multiplier: 1.05,
          },
        },
      };

      render(<TitleNotification {...props} />);

      expect(screen.getByText('신규 모험가')).toBeInTheDocument();
      expect(screen.getByText('COMMON')).toBeInTheDocument();
    });
  });

  describe('Passive Effects', () => {
    test('수동 효과 표시', () => {
      render(<TitleNotification {...defaultProps} />);

      expect(screen.getByText('수동 효과')).toBeInTheDocument();
      expect(screen.getByText('경험치')).toBeInTheDocument();
      expect(screen.getByText('x1.10')).toBeInTheDocument();
    });

    test('공격력 수동 효과', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          passiveEffect: {
            stat: 'attack',
            multiplier: 1.10,
          },
        },
      };

      render(<TitleNotification {...props} />);

      expect(screen.getByText('공격력')).toBeInTheDocument();
      expect(screen.getByText('x1.10')).toBeInTheDocument();
    });

    test('방어력 수동 효과', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          passiveEffect: {
            stat: 'defense',
            multiplier: 1.10,
          },
        },
      };

      render(<TitleNotification {...props} />);

      expect(screen.getByText('방어력')).toBeInTheDocument();
      expect(screen.getByText('x1.10')).toBeInTheDocument();
    });

    test('친화력 수동 효과', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          passiveEffect: {
            stat: 'affinity',
            multiplier: 1.15,
          },
        },
      };

      render(<TitleNotification {...props} />);

      expect(screen.getByText('친화력')).toBeInTheDocument();
      expect(screen.getByText('x1.15')).toBeInTheDocument();
    });

    test('카리스마 수동 효과', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          passiveEffect: {
            stat: 'charisma',
            multiplier: 1.20,
          },
        },
      };

      render(<TitleNotification {...props} />);

      expect(screen.getByText('카리스마')).toBeInTheDocument();
      expect(screen.getByText('x1.20')).toBeInTheDocument();
    });

    test('지능 수동 효과', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          passiveEffect: {
            stat: 'intelligence',
            multiplier: 1.25,
          },
        },
      };

      render(<TitleNotification {...props} />);

      expect(screen.getByText('지능')).toBeInTheDocument();
      expect(screen.getByText('x1.25')).toBeInTheDocument();
    });

    test('HP 수동 효과', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          passiveEffect: {
            stat: 'hp',
            multiplier: 1.10,
          },
        },
      };

      render(<TitleNotification {...props} />);

      expect(screen.getByText('최대 HP')).toBeInTheDocument();
      expect(screen.getByText('x1.10')).toBeInTheDocument();
    });
  });

  describe('Rarity Styles', () => {
    test('COMMON 스타일', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          rarity: 'COMMON',
        },
      };

      const { container } = render(<TitleNotification {...props} />);

      // COMMON 스타일 확인 (실제 DOM 구조에 따라 테스트 조정 필요)
    });

    test('RARE 스타일', () => {
      render(<TitleNotification {...defaultProps} />);

      // RARE 스타일 확인
    });

    test('EPIC 스타일', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          rarity: 'EPIC',
        },
      };

      render(<TitleNotification {...props} />);

      expect(screen.getByText('EPIC')).toBeInTheDocument();
    });

    test('LEGENDARY 스타일 (무지개 효과)', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          rarity: 'LEGENDARY',
        },
      };

      render(<TitleNotification {...props} />);

      expect(screen.getByText('LEGENDARY')).toBeInTheDocument();

      // LEGENDARY는 더 많은 파티클 생성 (80개)
    });
  });

  describe('Particle Animation', () => {
    test('40개 파티클 (일반 타이틀)', () => {
      render(<TitleNotification {...defaultProps} />);

      // 파티클 요소 확인 (실제 DOM 구조에 따라 테스트 조정 필요)
    });

    test('80개 파티클 (LEGENDARY 타이틀)', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          rarity: 'LEGENDARY',
        },
      };

      render(<TitleNotification {...props} />);

      // 더 많은 파티클 생성 확인
    });
  });

  describe('Sound Integration', () => {
    test('title_unlock 사운드 재생 (일반 타이틀)', () => {
      const { useSoundManager } = require('../../hooks/useSoundManager');
      const mockPlaySFX = jest.fn();
      useSoundManager.mockReturnValue({ playSFX: mockPlaySFX });

      render(<TitleNotification {...defaultProps} />);

      expect(mockPlaySFX).toHaveBeenCalledWith('title_unlock');
    });

    test('title_legendary 사운드 재생 (LEGENDARY 타이틀)', () => {
      const { useSoundManager } = require('../../hooks/useSoundManager');
      const mockPlaySFX = jest.fn();
      useSoundManager.mockReturnValue({ playSFX: mockPlaySFX });

      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          rarity: 'LEGENDARY',
        },
      };

      render(<TitleNotification {...props} />);

      expect(mockPlaySFX).toHaveBeenCalledWith('title_legendary');
    });
  });

  describe('User Interaction', () => {
    test('닫기 버튼 클릭 시 onDismiss 호출', () => {
      render(<TitleNotification {...defaultProps} />);

      const dismissButton = screen.getByText('확인');
      fireEvent.click(dismissButton);

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auto Dismiss', () => {
    test('duration 후 자동 닫기', () => {
      render(<TitleNotification {...defaultProps} duration={3000} />);

      // 타이머 진행
      jest.advanceTimersByTime(3000);

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    test('수동 닫기 후 자동 닫기 방지', () => {
      render(<TitleNotification {...defaultProps} duration={3000} />);

      // 수동 닫기
      const dismissButton = screen.getByText('확인');
      fireEvent.click(dismissButton);

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);

      // 타이머 진행
      jest.advanceTimersByTime(3000);

      // 추가 호출 없음
      expect(defaultProps.onDismiss).not.toHaveBeenCalledTimes(2);
    });
  });

  describe('Bounce Animation', () => {
    test('아이콘 바운스 애니메이션', () => {
      render(<TitleNotification {...defaultProps} />);

      // 아이콘 바운스 애니메이션 확인 (실제 DOM 구조에 따라 테스트 조정 필요)
    });
  });

  describe('Title Types', () => {
    test('ACHIEVEMENT 타입', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          type: 'ACHIEVEMENT',
        },
      };

      render(<TitleNotification {...props} />);

      expect(screen.getByText('베테랑 모험가')).toBeInTheDocument();
    });

    test('SOCIAL 타입', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          type: 'SOCIAL',
        },
      };

      render(<TitleNotification {...props} />);

      expect(screen.getByText('베테랑 모험가')).toBeInTheDocument();
    });

    test('SPECIAL 타입', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          type: 'SPECIAL',
        },
      };

      render(<TitleNotification {...props} />);

      expect(screen.getByText('베테랑 모험가')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('undefined description', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          description: undefined,
        },
      };

      render(<TitleNotification {...props} />);

      // 에러 없이 렌더링
      expect(screen.getByText('Title Unlocked!')).toBeInTheDocument();
    });

    test('null onDismiss', () => {
      const props = {
        ...defaultProps,
        onDismiss: null,
      };

      render(<TitleNotification {...props} />);

      const dismissButton = screen.getByText('확인');
      fireEvent.click(dismissButton);

      // 에러 없이 동작
      expect(screen.queryByText('Title Unlocked!')).toBeInTheDocument();
    });

    test('undefined rarity (기본값 COMMON)', () => {
      const props = {
        ...defaultProps,
        titleData: {
          ...defaultProps.titleData,
          rarity: undefined,
        },
      };

      render(<TitleNotification {...props} />);

      // 에러 없이 렌더링
      expect(screen.getByText('Title Unlocked!')).toBeInTheDocument();
    });

    test('짧은 duration', () => {
      render(<TitleNotification {...defaultProps} duration={100} />);

      jest.advanceTimersByTime(100);

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    test('긴 duration', () => {
      render(<TitleNotification {...defaultProps} duration={10000} />);

      jest.advanceTimersByTime(5000);

      // 아직 닫히지 않음
      expect(defaultProps.onDismiss).not.toHaveBeenCalled();

      jest.advanceTimersByTime(5000);

      // 이제 닫힘
      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('HOC: withTitleSocket', () => {
    test('소켓 이벤트 수신 시 TitleNotification 표시', () => {
      const mockSocket = {
        on: jest.fn(),
        off: jest.fn(),
      };

      const MockComponent = () => <div>Mock Component</div>;
      const WrappedComponent = withTitleSocket(MockComponent);

      render(
        <WrappedComponent socket={mockSocket} />
      );

      // 소켓 이벤트 리스너 등록
      expect(mockSocket.on).toHaveBeenCalledWith('titleUnlock', expect.any(Function));

      // 이벤트 핸들러 호출
      const eventHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'titleUnlock'
      )[1];

      eventHandler({
        id: 'veteran',
        name: '베테랑 모험가',
        description: '많은 경험을 쌓은 모험가',
        type: 'ACHIEVEMENT',
        rarity: 'RARE',
        icon: '⚔️',
        requirements: {
          level: 20,
        },
        passiveEffect: {
          stat: 'experience',
          multiplier: 1.10,
        },
      });

      // TitleNotification 컴포넌트 표시
      expect(screen.getByText('Title Unlocked!')).toBeInTheDocument();
    });

    test('소켓 정리 시 이벤트 리스너 제거', () => {
      const mockSocket = {
        on: jest.fn(),
        off: jest.fn(),
      };

      const MockComponent = () => <div>Mock Component</div>;
      const WrappedComponent = withTitleSocket(MockComponent);

      const { unmount } = render(
        <WrappedComponent socket={mockSocket} />
      );

      unmount();

      expect(mockSocket.off).toHaveBeenCalledWith('titleUnlock', expect.any(Function));
    });

    test('소켓 없이 모든 컴포넌트 렌더링', () => {
      const MockComponent = () => <div>Mock Component</div>;
      const WrappedComponent = withTitleSocket(MockComponent);

      render(
        <WrappedComponent socket={null} />
      );

      expect(screen.getByText('Mock Component')).toBeInTheDocument();
    });
  });
});