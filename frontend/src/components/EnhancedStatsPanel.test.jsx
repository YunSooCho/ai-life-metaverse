import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nProvider } from '../i18n/I18nContext'
import EnhancedStatsPanel from './EnhancedStatsPanel'

// Mock translations
const mockTranslations = {
  'ui.profile.title': '프로필',
  'ui.statusExtended.characterStatus': '캐릭터 상태',
  'ui.status.hp': 'HP',
  'ui.profile.exp': 'EXP',
  'ui.status.affinity': '호감도',
  'ui.status.charisma': '카리스마',
  'ui.status.intelligence': '지능',
  'ui.weather.title': '날씨',
  'ui.weather.clear': '맑음',
  'ui.weather.rainy': '비',
  'ui.weather.time.title': '시간',
  'ui.time.day': 'Day',
  'ui.quest.title': '퀘스트',
  'ui.quest.active': '진행 중',
  'ui.quest.completed': '완료'
}

// Mock I18n context
const TestWrapper = ({ children }) => (
  <I18nProvider defaultLanguage="ko">
    {children}
  </I18nProvider>
)

describe('EnhancedStatsPanel 컴포넌트 (Phase 5)', () => {
  const mockCharacter = {
    id: 'player',
    name: '플레이어',
    emoji: '👤',
    level: 5,
    exp: 250,
    maxExp: 500,
    stats: {
      hp: 80,
      maxHp: 100,
      affinity: 50,
      charisma: 30,
      intelligence: 40
    }
  }

  const mockWeather = {
    type: 'CLEAR',
    temperature: 25,
    humidity: 60
  }

  const mockQuest = {
    active: ['quest-1', 'quest-2', 'quest-3'],
    completed: ['quest-4', 'quest-5']
  }

  const mockGameTime = {
    hours: 14,
    minutes: 30,
    day: 3
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('기본 렌더링', () => {
    it('show=false일 때 렌더링되지 않아야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={false}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.queryByText('프로필')).not.toBeInTheDocument()
    })

    it('show=true일 때 렌더링되어야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('프로필')).toBeInTheDocument()
    })

    it('캐릭터 정보를 표시해야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('👤')).toBeInTheDocument()
      expect(screen.getByText('Lv. 5')).toBeInTheDocument()
      expect(screen.getByText('80 / 100')).toBeInTheDocument()
    })
  })

  describe('캐릭터 상태', () => {
    it('HP를 올바르게 표시해야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('HP')).toBeInTheDocument()
      expect(screen.getByText('80 / 100')).toBeInTheDocument()
    })

    it('EXP를 올바르게 표시해야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('EXP')).toBeInTheDocument()
      expect(screen.getByText('250 / 500')).toBeInTheDocument()
    })

    it('능력치를 표시해야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('호감도')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
      expect(screen.getByText('카리스마')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
      expect(screen.getByText('지능')).toBeInTheDocument()
      expect(screen.getByText('40')).toBeInTheDocument()
    })
  })

  describe('날씨 정보', () => {
    it('날씨 이모지를 표시해야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('☀️')).toBeInTheDocument()
    })

    it('온도를 표시해야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('25°C')).toBeInTheDocument()
    })

    it('습도를 표시해야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('💧')).toBeInTheDocument()
      expect(screen.getByText('60%')).toBeInTheDocument()
    })

    it('비오는 날씨 이모지를 표시해야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={{ ...mockWeather, type: 'RAINY' }}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('🌧️')).toBeInTheDocument()
      expect(screen.getByText('비')).toBeInTheDocument()
    })
  })

  describe('게임 시간', () => {
    it('시간을 표시해야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('14:30')).toBeInTheDocument()
    })

    it('날짜를 표시해야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('Day 3')).toBeInTheDocument()
    })

    it('시간대 이모지를 표시해야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      // 14:30은 오후이므로 ☀️ (정오 12~16)
      expect(screen.getByText('☀️')).toBeInTheDocument()
    })
  })

  describe('퀘스트 정보', () => {
    it('퀘스트 개수를 표시해야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.queryAllByText('진행 중')).toHaveLength(1)
    })

    it('퀘스트 진행률 바를 표시해야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      // 퀘스트 진행률 계산: completed(2) / active(3) = 66%
      const progressText = screen.getByText('66%')
      expect(progressText).toBeInTheDocument()
    })
  })

  describe('닫기 기능', () => {
    it('닫기 버튼 클릭 시 onClose 호출해야 함', () => {
      const mockClose = vi.fn()
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={mockClose}
          />
        </TestWrapper>
      )

      const closeButton = screen.getByText('✕')
      fireEvent.click(closeButton)

      expect(mockClose).toHaveBeenCalled()
    })

    it('오버레이 클릭 시 onClose 호출해야 함', () => {
      const mockClose = vi.fn()
      const { container } = render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={mockClose}
          />
        </TestWrapper>
      )

      const overlay = container.querySelector('.enhanced-stats-overlay')
      expect(overlay).toBeInTheDocument()

      fireEvent.click(overlay)
      expect(mockClose).toHaveBeenCalled()
    })
  })

  describe('퍼센트 계산', () => {
    it('HP 퍼센트를 정확히 계산해야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      // HP: 80/100 = 80%
      const hpBars = screen.queryAllByText('80%')
      expect(hpBars.length).toBeGreaterThan(0)
    })

    it('EXP 퍼센트를 정확히 계산해야 함', () => {
      render(
        <TestWrapper>
          <EnhancedStatsPanel
            show={true}
            character={mockCharacter}
            weather={mockWeather}
            quest={mockQuest}
            gameTime={mockGameTime}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      // EXP: 250/500 = 50%
      const expBars = screen.queryAllByText('50%')
      expect(expBars.length).toBeGreaterThan(0)
    })
  })
})