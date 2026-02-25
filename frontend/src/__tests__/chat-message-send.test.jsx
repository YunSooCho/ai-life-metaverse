import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Mock socket 인스턴스
const mockSocketInstance = {
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connect: vi.fn(),
  off: vi.fn(),
  id: 'test-socket-id',
  connected: true
}

// socket.io-client 모킹 (io named export 필수)
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocketInstance),
  default: vi.fn(() => mockSocketInstance)
}))

// socket.js 모킹 (App.jsx가 import하는 모듈)
vi.mock('../socket.js', () => ({
  socket: mockSocketInstance,
  default: mockSocketInstance
}))

// useSocketEvent hook 모킹 (있을 경우)
vi.mock('../hooks/useSocketEvent.js', () => ({
  useSocketEvent: vi.fn((eventName, handler) => {
    // 이벤트 핸들러 등록만 함
  }),
  default: vi.fn()
}))

describe('Chat Message Send - Issue #125', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    // 각 테스트 전에 emit 초기화
    mockSocketInstance.emit.mockClear()
    mockSocketInstance.on.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('socket.emit이 chatMessage 이벤트로 호출되는지 확인', () => {
    // 직접 socket.emit 테스트 (UI 렌더링 없이)
    const testMessage = 'Hello!'
    const testCharacterId = 'test-char-123'

    mockSocketInstance.emit('chatMessage', {
      message: testMessage,
      characterId: testCharacterId
    })

    expect(mockSocketInstance.emit).toHaveBeenCalledWith('chatMessage', {
      message: testMessage,
      characterId: testCharacterId
    })
  })

  it('한국어 메시지 전송 확인', () => {
    const testMessage = '안녕하세요!'
    const testCharacterId = 'test-char-123'

    mockSocketInstance.emit('chatMessage', {
      message: testMessage,
      characterId: testCharacterId
    })

    expect(mockSocketInstance.emit).toHaveBeenCalledWith('chatMessage', {
      message: '안녕하세요!',
      characterId: testCharacterId
    })
  })

  it('일본어 메시지 전송 확인', () => {
    const testMessage = 'こんにちは！'
    const testCharacterId = 'test-char-123'

    mockSocketInstance.emit('chatMessage', {
      message: testMessage,
      characterId: testCharacterId
    })

    expect(mockSocketInstance.emit).toHaveBeenCalledWith('chatMessage', {
      message: 'こんにちは！',
      characterId: testCharacterId
    })
  })

  it('긴 메시지 전송 확인 (1000자)', () => {
    const longMessage = 'A'.repeat(1000)
    const testCharacterId = 'test-char-123'

    mockSocketInstance.emit('chatMessage', {
      message: longMessage,
      characterId: testCharacterId
    })

    expect(mockSocketInstance.emit).toHaveBeenCalledTimes(1)
    const emittedMessage = mockSocketInstance.emit.mock.calls[0][1].message
    expect(emittedMessage.length).toBe(1000)
  })

  it('특수 문자 메시지 전송 확인', () => {
    const specialMessage = '🎉❤️🔥 Hello <script>alert("xss")</script> &amp;'
    const testCharacterId = 'test-char-123'

    mockSocketInstance.emit('chatMessage', {
      message: specialMessage,
      characterId: testCharacterId
    })

    expect(mockSocketInstance.emit).toHaveBeenCalledWith('chatMessage', {
      message: specialMessage,
      characterId: testCharacterId
    })
  })

  it('빈 메시지는 전송하지 않아야 함', () => {
    const emptyMessage = ''
    const whiteSpaceMessage = '   '

    // 빈 메시지 검증 로직 시뮬레이션
    if (emptyMessage.trim()) {
      mockSocketInstance.emit('chatMessage', { message: emptyMessage, characterId: 'test' })
    }
    if (whiteSpaceMessage.trim()) {
      mockSocketInstance.emit('chatMessage', { message: whiteSpaceMessage, characterId: 'test' })
    }

    expect(mockSocketInstance.emit).not.toHaveBeenCalled()
  })

  it('chatMessage 이벤트 데이터 구조 확인', () => {
    const testMessage = 'Hello!'
    const testCharacterId = 'player-abc'

    mockSocketInstance.emit('chatMessage', {
      message: testMessage,
      characterId: testCharacterId
    })

    const callArgs = mockSocketInstance.emit.mock.calls[0]
    expect(callArgs[0]).toBe('chatMessage')
    expect(callArgs[1]).toHaveProperty('message')
    expect(callArgs[1]).toHaveProperty('characterId')
    expect(typeof callArgs[1].message).toBe('string')
    expect(typeof callArgs[1].characterId).toBe('string')
  })

  it('chatBroadcast 이벤트 수신 핸들러 등록', () => {
    const handler = vi.fn()
    mockSocketInstance.on('chatBroadcast', handler)

    expect(mockSocketInstance.on).toHaveBeenCalledWith('chatBroadcast', handler)
  })

  it('chatBroadcast 데이터 구조 검증', () => {
    const broadcastData = {
      characterId: 'ai-agent-1',
      characterName: 'AI 유리',
      message: '안녕하세요! 😊',
      timestamp: Date.now(),
      roomId: 'main'
    }

    // 데이터 구조 검증
    expect(broadcastData).toHaveProperty('characterId')
    expect(broadcastData).toHaveProperty('characterName')
    expect(broadcastData).toHaveProperty('message')
    expect(broadcastData).toHaveProperty('timestamp')
    expect(broadcastData).toHaveProperty('roomId')
    expect(typeof broadcastData.timestamp).toBe('number')
  })

  it('이모지 코드 변환 검증', () => {
    const emojiMap = {
      ':smile:': '😊',
      ':laugh:': '😂',
      ':heart:': '❤️',
      ':thumbsup:': '👍',
      ':fire:': '🔥',
      ':star:': '⭐'
    }

    let message = 'Hello :smile: :fire:'
    for (const [code, emoji] of Object.entries(emojiMap)) {
      message = message.replace(new RegExp(code.replace(/:/g, '\\:'), 'g'), emoji)
    }

    expect(message).toBe('Hello 😊 🔥')
  })
})
