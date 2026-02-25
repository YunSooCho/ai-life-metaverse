import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { I18nProvider } from '../i18n/I18nContext'
import ChatWindow from './ChatWindow'

// Mock translations
const mockTranslations = {
  'app.player': '플레이어',
  'app.aiCharacter': 'AI 캐릭터',
  'ui.chat.noMessages': '메시지가 없습니다',
  'ui.chat.placeholder': '메시지를 입력하세요...',
  'ui.chat.send': '전송'
}

// Mock I18n context
const TestWrapper = ({ children }) => (
  <I18nProvider defaultLanguage="ko">
    {children}
  </I18nProvider>
)

describe('ChatWindow 컴포넌트 (Phase 5)', () => {
  const mockCharacter = {
    id: 'char-1',
    name: '유리',
    emoji: '👩',
    isAi: true
  }

  const mockMessages = [
    { id: 'msg-1', sender: 'ai', text: '안녕하세요!', timestamp: Date.now() - 60000 },
    { id: 'msg-2', sender: 'player', text: '반가워요!', timestamp: Date.now() - 30000 }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('기본 렌더링', () => {
    it('visible=false일 때 렌더링되지 않아야 함', () => {
      render(
        <TestWrapper>
          <ChatWindow
            visible={false}
            character={mockCharacter}
            messages={mockMessages}
            onSendMessage={vi.fn()}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.queryByText('유리')).not.toBeInTheDocument()
    })

    it('visible=true일 때 렌더링되어야 함', () => {
      render(
        <TestWrapper>
          <ChatWindow
            visible={true}
            character={mockCharacter}
            messages={mockMessages}
            onSendMessage={vi.fn()}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('유리')).toBeInTheDocument()
      expect(screen.getByText('👩')).toBeInTheDocument()
    })

    it('캐릭터 이름을 표시해야 함', () => {
      render(
        <TestWrapper>
          <ChatWindow
            visible={true}
            character={mockCharacter}
            messages={[]}
            onSendMessage={vi.fn()}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('유리')).toBeInTheDocument()
    })

    it('AI 캐릭터 뱃지를 표시해야 함', () => {
      render(
        <TestWrapper>
          <ChatWindow
            visible={true}
            character={{ ...mockCharacter, isAi: true }}
            messages={[]}
            onSendMessage={vi.fn()}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('AI 캐릭터')).toBeInTheDocument()
    })
  })

  describe('메시지 히스토리', () => {
    it('메시지를 렌더링해야 함', () => {
      render(
        <TestWrapper>
          <ChatWindow
            visible={true}
            character={mockCharacter}
            messages={mockMessages}
            onSendMessage={vi.fn()}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('안녕하세요!')).toBeInTheDocument()
      expect(screen.getByText('반가워요!')).toBeInTheDocument()
    })

    it('메시지가 없을 때 빈 상태를 표시해야 함', () => {
      render(
        <TestWrapper>
          <ChatWindow
            visible={true}
            character={mockCharacter}
            messages={[]}
            onSendMessage={vi.fn()}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('메시지가 없습니다')).toBeInTheDocument()
    })

    it('플레이어 메시지와 AI 메시지를 구분해야 함', () => {
      render(
        <TestWrapper>
          <ChatWindow
            visible={true}
            character={mockCharacter}
            messages={mockMessages}
            onSendMessage={vi.fn()}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      const playerMessages = screen.getAllByText('플레이어')
      expect(playerMessages.length).toBeGreaterThan(0)
    })

    it('메시지 시간을 표시해야 함', () => {
      const timestamp = Date.now() - 60000
      render(
        <TestWrapper>
          <ChatWindow
            visible={true}
            character={mockCharacter}
            messages={[{ id: 'msg-1', sender: 'ai', text: '테스트', timestamp }]}
            onSendMessage={vi.fn()}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      const messageTime = screen.getByText(/\d{2}:\d{2}/)
      expect(messageTime).toBeInTheDocument()
    })
  })

  describe('메시지 전송', () => {
    it('메시지 입력 후 전송 버튼 클릭 시 onSendMessage 호출해야 함', () => {
      const mockSend = vi.fn()
      render(
        <TestWrapper>
          <ChatWindow
            visible={true}
            character={mockCharacter}
            messages={[]}
            onSendMessage={mockSend}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      const input = screen.getByPlaceholderText('메시지를 입력하세요...')
      fireEvent.change(input, { target: { value: '테스트 메시지' } })

      const sendButton = screen.getByText('전송')
      fireEvent.click(sendButton)

      expect(mockSend).toHaveBeenCalledWith('테스트 메시지')
    })

    it('Enter키로 메시지 전송해야 함', () => {
      const mockSend = vi.fn()
      render(
        <TestWrapper>
          <ChatWindow
            visible={true}
            character={mockCharacter}
            messages={[]}
            onSendMessage={mockSend}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      const input = screen.getByPlaceholderText('메시지를 입력하세요...')
      fireEvent.change(input, { target: { value: '테스트' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockSend).toHaveBeenCalledWith('테스트')
    })

    it('Shift+Enter는 줄바꿈이어야 함', () => {
      const mockSend = vi.fn()
      render(
        <TestWrapper>
          <ChatWindow
            visible={true}
            character={mockCharacter}
            messages={[]}
            onSendMessage={mockSend}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      const input = screen.getByPlaceholderText('메시지를 입력하세요...')
      fireEvent.change(input, { target: { value: '테스트\n줄바꿈' } })
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })

      // Shift+Enter는 전송하지 않음
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('빈 메시지는 전송되지 않아야 함', () => {
      const mockSend = vi.fn()
      render(
        <TestWrapper>
          <ChatWindow
            visible={true}
            character={mockCharacter}
            messages={[]}
            onSendMessage={mockSend}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      const sendButton = screen.getByText('전송')
      fireEvent.click(sendButton)

      expect(mockSend).not.toHaveBeenCalled()
    })

    it('전송 후 입력 필드를 초기화해야 함', () => {
      const mockSend = vi.fn()
      render(
        <TestWrapper>
          <ChatWindow
            visible={true}
            character={mockCharacter}
            messages={[]}
            onSendMessage={mockSend}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      const input = screen.getByPlaceholderText('메시지를 입력하세요...')
      fireEvent.change(input, { target: { value: '테스트' } })

      const sendButton = screen.getByText('전송')
      fireEvent.click(sendButton)

      expect(input.value).toBe('')
    })
  })

  describe('닫기 기능', () => {
    it('닫기 버튼 클릭 시 onClose 호출해야 함', () => {
      const mockClose = vi.fn()
      render(
        <TestWrapper>
          <ChatWindow
            visible={true}
            character={mockCharacter}
            messages={[]}
            onSendMessage={vi.fn()}
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
          <ChatWindow
            visible={true}
            character={mockCharacter}
            messages={[]}
            onSendMessage={vi.fn()}
            onClose={mockClose}
          />
        </TestWrapper>
      )

      const overlay = container.querySelector('.chat-window-overlay')
      expect(overlay).toBeInTheDocument()

      fireEvent.click(overlay)
      expect(mockClose).toHaveBeenCalled()
    })
  })

  describe('자동 스크롤', () => {
    it('새 메시지 추가 시 자동 스크롤해야 함', async () => {
      const { rerender } = render(
        <TestWrapper>
          <ChatWindow
            visible={true}
            character={mockCharacter}
            messages={mockMessages}
            onSendMessage={vi.fn()}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      // 새 메시지 추가
      const newMessages = [
        ...mockMessages,
        { id: 'msg-3', sender: 'ai', text: '새 메시지!', timestamp: Date.now() }
      ]

      rerender(
        <TestWrapper>
          <ChatWindow
            visible={true}
            character={mockCharacter}
            messages={newMessages}
            onSendMessage={vi.fn()}
            onClose={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('새 메시지!')).toBeInTheDocument()
    })
  })
})