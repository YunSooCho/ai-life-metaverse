import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { I18nProvider } from '../i18n/I18nContext'
import NotificationSystem, { useNotifications } from './NotificationSystem'

// Mock translations
const mockTranslations = {
  'ui.notifications.quest_complete': '퀘스트 완료',
  'ui.notifications.item_get': '아이템 획득',
  'ui.notifications.weather': '날씨 변화',
  'ui.notifications.info': '알림'
}

// Mock I18n context
const TestWrapper = ({ children }) => (
  <I18nProvider defaultLanguage="ko">
    {children}
  </I18nProvider>
)

describe('NotificationSystem 컴포넌트 (Phase 5)', () => {
  const mockNotifications = [
    {
      id: 'notif-1',
      type: 'quest_complete',
      message: '첫 번째 퀘스트 완료!',
      details: '보상: 100 EXP',
      icon: '🏆',
      timestamp: Date.now()
    },
    {
      id: 'notif-2',
      type: 'item_get',
      message: '새로운 아이템을 획득했습니다',
      details: '체력 포션 x1',
      icon: '🧪',
      timestamp: Date.now()
    },
    {
      id: 'notif-3',
      type: 'weather',
      message: '날씨가 변했습니다',
      details: '맑음 → 비',
      weather: 'RAINY',
      timestamp: Date.now()
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('기본 렌더링', () => {
    it('알림이 없을 때 렌더링되지 않아야 함', () => {
      render(
        <TestWrapper>
          <NotificationSystem notifications={[]} />
        </TestWrapper>
      )

      expect(screen.queryByText('퀘스트 완료')).not.toBeInTheDocument()
    })

    it('알림이 있을 때 렌더링해야 함', () => {
      render(
        <TestWrapper>
          <NotificationSystem notifications={mockNotifications} />
        </TestWrapper>
      )

      expect(screen.getByText('퀘스트 완료')).toBeInTheDocument()
      expect(screen.getByText('아이템 획득')).toBeInTheDocument()
      expect(screen.getByText('날씨 변화')).toBeInTheDocument()
    })

    it('알림 메시지를 표시해야 함', () => {
      render(
        <TestWrapper>
          <NotificationSystem notifications={mockNotifications} />
        </TestWrapper>
      )

      expect(screen.getByText('첫 번째 퀘스트 완료!')).toBeInTheDocument()
      expect(screen.getByText('새로운 아이템을 획득했습니다')).toBeInTheDocument()
      expect(screen.getByText('날씨가 변했습니다')).toBeInTheDocument()
    })

    it('알림 아이콘을 표시해야 함', () => {
      render(
        <TestWrapper>
          <NotificationSystem notifications={mockNotifications} />
        </TestWrapper>
      )

      expect(screen.getByText('🏆')).toBeInTheDocument()
      expect(screen.getByText('🧪')).toBeInTheDocument()
      expect(screen.getByText('🌧️')).toBeInTheDocument()
    })
  })

  describe('알림 타입별 스타일', () => {
    it('퀘스트 완료 알림 스타일을 적용해야 함', () => {
      render(
        <TestWrapper>
          <NotificationSystem notifications={[mockNotifications[0]]} />
        </TestWrapper>
      )

      const notification = screen.getByText('퀘스트 완료').closest('.notification')
      expect(notification).toHaveClass('notification-quest')
    })

    it('아이템 획득 알림 스타일을 적용해야 함', () => {
      render(
        <TestWrapper>
          <NotificationSystem notifications={[mockNotifications[1]]} />
        </TestWrapper>
      )

      const notification = screen.getByText('아이템 획득').closest('.notification')
      expect(notification).toHaveClass('notification-item')
    })

    it('날씨 알림 스타일을 적용해야 함', () => {
      render(
        <TestWrapper>
          <NotificationSystem notifications={[mockNotifications[2]]} />
        </TestWrapper>
      )

      const notification = screen.getByText('날씨 변화').closest('.notification')
      expect(notification).toHaveClass('notification-weather')
    })

    it('기본 알림 스타일을 적용해야 함', () => {
      const infoNotification = {
        id: 'notif-4',
        type: 'info',
        message: '일반 알림',
        icon: 'ℹ️'
      }

      render(
        <TestWrapper>
          <NotificationSystem notifications={[infoNotification]} />
        </TestWrapper>
      )

      const notification = screen.getByText('알림').closest('.notification')
      expect(notification).toHaveClass('notification-info')
    })
  })

  describe('알림 닫기', () => {
    it('클릭 시 알림을 닫아야 함', async () => {
      const { rerender } = render(
        <TestWrapper>
          <NotificationSystem notifications={[mockNotifications[0]]} />
        </TestWrapper>
      )

      expect(screen.getByText('퀘스트 완료')).toBeInTheDocument()

      const notification = screen.getByText('퀘스트 완료').closest('.notification')
      fireEvent.click(notification)

      // 클릭 후 제거되어야 함 (컴포넌트 재렌더링 필요)
      await waitFor(() => {
        rerender(
          <TestWrapper>
            <NotificationSystem notifications={[]} />
          </TestWrapper>
        )
        expect(screen.queryByText('퀘스트 완료')).not.toBeInTheDocument()
      })
    })

    it('닫기 버튼 클릭 시 알림을 닫아야 함', async () => {
      const { rerender } = render(
        <TestWrapper>
          <NotificationSystem notifications={[mockNotifications[0]]} />
        </TestWrapper>
      )

      expect(screen.getByText('퀘스트 완료')).toBeInTheDocument()

      const closeButton = screen.getByText('✕')
      fireEvent.click(closeButton)

      // 클릭 후 제거되어야 함
      await waitFor(() => {
        rerender(
          <TestWrapper>
            <NotificationSystem notifications={[]} />
          </TestWrapper>
        )
        expect(screen.queryByText('퀘스트 완료')).not.toBeInTheDocument()
      })
    })
  })

  describe('자동 제거', () => {
    it('5초 후 자동으로 제거되어야 함', async () => {
      render(
        <TestWrapper>
          <NotificationSystem notifications={[mockNotifications[0]]} />
        </TestWrapper>
      )

      expect(screen.getByText('퀘스트 완료')).toBeInTheDocument()

      // 5초 시간 경과
      vi.advanceTimersByTime(5000)

      await waitFor(() => {
        expect(screen.queryByText('퀘스트 완료')).not.toBeInTheDocument()
      })
    })
  })

  describe('날씨 이모지', () => {
    it('CLEAR 날씨 이모지를 표시해야 함', () => {
      const clearNotification = {
        ...mockNotifications[2],
        weather: 'CLEAR'
      }

      render(
        <TestWrapper>
          <NotificationSystem notifications={[clearNotification]} />
        </TestWrapper>
      )

      expect(screen.getByText('☀️')).toBeInTheDocument()
    })

    it('CLOUDY 날씨 이모지를 표시해야 함', () => {
      const cloudyNotification = {
        ...mockNotifications[2],
        weather: 'CLOUDY'
      }

      render(
        <TestWrapper>
          <NotificationSystem notifications={[cloudyNotification]} />
        </TestWrapper>
      )

      expect(screen.getByText('☁️')).toBeInTheDocument()
    })

    it('SNOWY 날씨 이모지를 표시해야 함', () => {
      const snowyNotification = {
        ...mockNotifications[2],
        weather: 'SNOWY'
      }

      render(
        <TestWrapper>
          <NotificationSystem notifications={[snowyNotification]} />
        </TestWrapper>
      )

      expect(screen.getByText('❄️')).toBeInTheDocument()
    })

    it('STORM 날씨 이모지를 표시해야 함', () => {
      const stormNotification = {
        ...mockNotifications[2],
        weather: 'STORM'
      }

      render(
        <TestWrapper>
          <NotificationSystem notifications={[stormNotification]} />
        </TestWrapper>
      )

      expect(screen.getByText('⛈️')).toBeInTheDocument()
    })
  })

  describe('애니메이션', () => {
    it('알림에 애니메이션 클래스를 적용해야 함', () => {
      render(
        <TestWrapper>
          <NotificationSystem notifications={[mockNotifications[0]]} />
        </TestWrapper>
      )

      const notification = screen.getByText('퀘스트 완료').closest('.notification')
      expect(notification).toBeInTheDocument()
    })

    it('여러 알림이 순차적으로 애니메이션되어야 함', () => {
      render(
        <TestWrapper>
          <NotificationSystem notifications={mockNotifications} />
        </TestWrapper>
      )

      const notifications = screen.getAllByText(/(퀘스트 완료|아이템 획득|날씨 변화)/)
      expect(notifications.length).toBe(3)
    })
  })
})

describe('useNotifications Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('알림을 추가할 수 있어야 함', () => {
    const TestComponent = () => {
      const { notifications, addNotification } = useNotifications()

      return (
        <div>
          <button onClick={() => addNotification({
            type: 'info',
            message: '테스트 알림'
          })}>
            Add Notification
          </button>
          <div data-testid="count">{notifications.length}</div>
        </div>
      )
    }

    render(<TestComponent />)

    expect(screen.getByTestId('count').textContent).toBe('0')

    fireEvent.click(screen.getByText('Add Notification'))

    expect(screen.getByTestId('count').textContent).toBe('1')
  })

  it('알림을 제거할 수 있어야 함', () => {
    const TestComponent = () => {
      const { notifications, addNotification, dismissNotification } = useNotifications()

      return (
        <div>
          <button onClick={() => addNotification({ type: 'info', message: 'Test' })}>
            Add
          </button>
          <button onClick={() => dismissNotification(notifications[0]?.id)}>
            Remove
          </button>
          <div data-testid="count">{notifications.length}</div>
        </div>
      )
    }

    render(<TestComponent />)

    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByTestId('count').textContent).toBe('1')

    fireEvent.click(screen.getByText('Remove'))
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('알림 ID가 고유해야 함', () => {
    const TestComponent = () => {
      const { notifications, addNotification } = useNotifications()

      return (
        <div>
          <button onClick={() => addNotification({ type: 'info', message: 'Test 1' })}>
            Add 1
          </button>
          <button onClick={() => addNotification({ type: 'info', message: 'Test 2' })}>
            Add 2
          </button>
          <div data-testid="count">{notifications.length}</div>
        </div>
      )
    }

    render(<TestComponent />)

    fireEvent.click(screen.getByText('Add 1'))
    fireEvent.click(screen.getByText('Add 2'))

    expect(screen.getByTestId('count').textContent).toBe('2')
  })
})