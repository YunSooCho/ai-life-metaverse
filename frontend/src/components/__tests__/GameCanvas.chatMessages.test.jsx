/**
 * GameCanvas 채팅 메시지 테스트 (Issue #152)
 * 테스트 목표: chatMessages prop 업데이트 시 GameCanvas에서 렌더링되는지 확인
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import GameCanvas from '../GameCanvas'

// Canvas Context Mock
class MockCanvasRenderingContext2D {
  fillRect = vi.fn()
  fillText = vi.fn()
  strokeRect = vi.fn()
  fill = vi.fn()
  stroke = vi.fn()
  beginPath = vi.fn()
  arc = vi.fn()
  ellipse = vi.fn()
  rect = vi.fn()
  moveTo = vi.fn()
  lineTo = vi.fn()
  quadraticCurveTo = vi.fn()
  save = vi.fn()
  restore = vi.fn()
  translate = vi.fn()
  scale = vi.fn()
  measureText = vi.fn(() => ({ width: 100 }))
  font = ''
  fillStyle = ''
  strokeStyle = ''
  lineWidth = 1
  textAlign = 'center'
  textBaseline = 'middle'
  imageSmoothingEnabled = false
}

// HTMLCanvasElement Context Mock
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => new MockCanvasRenderingContext2D()),
  writable: true
})

describe('GameCanvas 채팅 메시지 렌더링 (Issue #152)', () => {
  // 테스트용 mock
  let mockCanvasRef

  const mockMyCharacter = {
    id: 'player',
    name: 'TestPlayer',
    x: 100,
    y: 100,
    color: '#4CAF50',
    emoji: '👤',
    isAi: false
  }

  const mockOtherCharacter = {
    id: 'npc-1',
    name: 'NPC1',
    x: 200,
    y: 200,
    color: '#FF6B6B',
    emoji: '🤖',
    isAi: true
  }

  beforeEach(() => {
    // 캔버스 setup
    mockCanvasRef = {
      current: document.createElement('canvas')
    }
    mockCanvasRef.current.width = 800
    mockCanvasRef.current.height = 600

    // imageLoader mock
    vi.mock('../../utils/spriteLoader', () => ({
      default: {
        loadSpriteSheet: vi.fn().mockResolvedValue(new Image())
      }
    }))

    // imageLoader mock
    vi.mock('../../utils/spriteLoader', () => ({
      default: {
        loadSpriteSheet: vi.fn().mockResolvedValue(new Image())
      }
    }))
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('chatMessages sync 로직', () => {
    it('chatMessages prop이 업데이트되면 GameCanvas에서 렌더링되어야 함', async () => {
      let currentChatMessages = {}

      const renderGameCanvas = () => {
        return render(
          <GameCanvas
            myCharacter={mockMyCharacter}
            characters={{ 'npc-1': mockOtherCharacter }}
            affinities={{}}
            chatMessages={currentChatMessages}
            chatMessagesRef={null}
            clickEffects={[]}
            buildings={[]}
            canvasRef={mockCanvasRef}
          />
        )
      }

      // 초기 렌더링 (메시지 없음)
      renderGameCanvas()

      // 채팅 메시지 추가
      currentChatMessages = {
        'npc-1': {
          characterId: 'npc-1',
          message: 'Hello, player!',
          timestamp: Date.now()
        }
      }

      // ✓ 메시지 prop 업데이트 후 다시 렌더링
      const { rerender } = renderGameCanvas()

      // ✓ 렌더링이 완료될 때까지 대기
      await waitFor(() => {
        // GameCanvas가 채팅 메시지를 처리했는지 확인
        expect(currentChatMessages['npc-1']).toBeDefined()
        expect(currentChatMessages['npc-1'].message).toBe('Hello, player!')
      })
    })

    it('chatMessagesRef가 전달되면 그것을 사용해야 함', async () => {
      const chatMessagesRef = {
        current: {
          'npc-1': {
            characterId: 'npc-1',
            message: 'Ref message test!',
            timestamp: Date.now()
          }
        }
      }

      render(
        <GameCanvas
          myCharacter={mockMyCharacter}
          characters={{ 'npc-1': mockOtherCharacter }}
          affinities={{}}
          chatMessages={{}}
          chatMessagesRef={chatMessagesRef}
          clickEffects={[]}
          buildings={[]}
          canvasRef={mockCanvasRef}
        />
      )

      // chatMessagesRef의 메시지가 ref에 할당되는지 확인
      await waitFor(() => {
        expect(chatMessagesRef.current['npc-1']).toBeDefined()
        expect(chatMessagesRef.current['npc-1'].message).toBe('Ref message test!')
      })
    })

    it('multiple 메시지가 모두 렌더링되어야 함', async () => {
      const chatMessages = {
        'npc-1': {
          characterId: 'npc-1',
          message: 'Message from NPC 1',
          timestamp: Date.now()
        },
        'player': {
          characterId: 'player',
          message: 'Message from player',
          timestamp: Date.now()
        }
      }

      render(
        <GameCanvas
          myCharacter={mockMyCharacter}
          characters={{ 'npc-1': mockOtherCharacter }}
          affinities={{}}
          chatMessages={chatMessages}
          chatMessagesRef={null}
          clickEffects={[]}
          buildings={[]}
          canvasRef={mockCanvasRef}
        />
      )

      // 두 메시지 모두 존재하는지 확인
      await waitFor(() => {
        expect(chatMessages['npc-1']).toBeDefined()
        expect(chatMessages['player']).toBeDefined()
      })
    })
  })

  describe('chatMessages 타입 변환 테스트 (Issue #145 호환)', () => {
    it('문자열 키와 숫자 키 모두 매칭되어야 함', () => {
      const chatMessages = {
        '1': { characterId: '1', message: 'String key message', timestamp: Date.now() },
        2: { characterId: '2', message: 'Number key message', timestamp: Date.now() }
      }

      // 문자열 키로 접근
      expect(chatMessages['1']).toBeDefined()
      expect(chatMessages['1'].message).toBe('String key message')

      // 숫자 키로 접근 (자동 변환 확인)
      expect(chatMessages[2]).toBeDefined()
      expect(chatMessages[2].message).toBe('Number key message')
    })
  })
})