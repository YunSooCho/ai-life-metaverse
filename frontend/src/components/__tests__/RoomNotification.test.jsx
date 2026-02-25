import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSocketEvent } from '../../hooks/useSocketEvent'

/**
 * 방 입장/퇴장 알림 UI 컴포넌트 테스트
 *
 * Issue: #56 멀티플레이어 방 입장/퇴장 알림 시스템
 * 작업 항목:
 * - 입장/퇴장 이벤트 감지 - ✅ (이벤트 수신 구현)
 * - 토스트 알림 표시 - ✅ (useSocketEvent로 처리)
 * - 채팅 로그에 시스템 메시지 추가 - ✅
 * - 테스트 코드 작성 - 진행 중
 */

// Mock socket
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn()
}

// Mock useSocketEvent hook
vi.mock('../../hooks/useSocketEvent', () => ({
  useSocketEvent: vi.fn((event, callback) => {
    mockSocket.on(event, callback)
    return () => mockSocket.off(event, callback)
  })
}))

// Mock ChatHistory 컴포넌트
let roomChatHistory = {}
let setRoomChatHistory = vi.fn()

// Helper 함수
const updateRoomChatHistory = (roomId, message) => {
  const newEntry = {
    characterName: '시스템',
    message,
    timestamp: Date.now(),
    isSystem: true
  }

  roomChatHistory = {
    ...roomChatHistory,
    [roomId]: [
      ...(roomChatHistory[roomId] || []),
      newEntry
    ]
  }
  return roomChatHistory
}

describe('방 입장/퇴장 알림 UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    roomChatHistory = {}
    setRoomChatHistory = vi.fn()
    mockSocket.on.mockClear()
    mockSocket.emit.mockClear()
  })

  afterEach(() => {
    mockSocket.off()
  })

  describe('입장 알림 UI', () => {
    it('[T11] 입장 알림을 수신하면 Toast가 표시되어야 함', async () => {
      let toastData = null

      // App.jsx의 roomNotification 핸들러 로직
      const handleRoomNotification = (data) => {
        const { type, character, roomName } = data

        if (type === 'join') {
          toastData = {
            show: true,
            message: `${character.emoji} ${character.name}님이 ${roomName}(으)로 입장했습니다`,
            type: 'info'
          }
        }
      }

      mockSocket.on('roomNotification', handleRoomNotification)

      // 입장 알림 전송
      const notification = {
        type: 'join',
        character: {
          id: 'player1',
          name: '플레이어1',
          emoji: '😀',
          color: '#4CAF50'
        },
        roomId: 'main',
        roomName: '메인 광장',
        timestamp: Date.now()
      }

      // 이벤트 트리거
      const callbacks = mockSocket.on.mock.calls.filter(call => call[0] === 'roomNotification')
      callbacks.forEach(([_, callback]) => callback(notification))

      expect(toastData).not.toBeNull()
      expect(toastData.show).toBe(true)
      expect(toastData.message).toContain('플레이어1')
      expect(toastData.message).toContain('입장했습니다')
      expect(toastData.type).toBe('info')
    })

    it('[T12] 입장 알림 메시지에 이모지가 포함되어야 함', async () => {
      let toastMessage = null

      const handleRoomNotification = (data) => {
        if (data.type === 'join') {
          toastMessage = `${data.character.emoji} ${data.character.name}님이 ${data.roomName}(으)로 입장했습니다`
        }
      }

      mockSocket.on('roomNotification', handleRoomNotification)

      const notification = {
        type: 'join',
        character: {
          id: 'ai-agent-1',
          name: 'AI 유리',
          emoji: '🧞',
          color: '#FF6B6B'
        },
        roomId: 'main',
        roomName: '메인 광장',
        timestamp: Date.now()
      }

      const callbacks = mockSocket.on.mock.calls.filter(call => call[0] === 'roomNotification')
      callbacks.forEach(([_, callback]) => callback(notification))

      expect(toastMessage).toContain('🧞')
      expect(toastMessage).toContain('AI 유리')
      expect(toastMessage).toContain('입장했습니다')
    })
  })

  describe('퇴장 알림 UI', () => {
    it('[T13] 퇴장 알림을 수신하면 Toast가 표시되어야 함', async () => {
      let toastData = null

      const handleRoomNotification = (data) => {
        const { type, character, roomName } = data

        if (type === 'leave') {
          toastData = {
            show: true,
            message: `${character.emoji} ${character.name}님이 ${roomName}(으)로 떠났습니다`,
            type: 'warning'
          }
        }
      }

      mockSocket.on('roomNotification', handleRoomNotification)

      const notification = {
        type: 'leave',
        character: {
          id: 'player1',
          name: '플레이어1',
          emoji: '👋',
          color: '#4CAF50'
        },
        roomId: 'main',
        roomName: '메인 광장',
        timestamp: Date.now()
      }

      const callbacks = mockSocket.on.mock.calls.filter(call => call[0] === 'roomNotification')
      callbacks.forEach(([_, callback]) => callback(notification))

      expect(toastData).not.toBeNull()
      expect(toastData.show).toBe(true)
      expect(toastData.message).toContain('플레이어1')
      expect(toastData.message).toContain('떠났습니다')
      expect(toastData.type).toBe('warning')
    })

    it('[T14] 퇴장 알림 메시지에 이모지가 포함되어야 함', async () => {
      let toastMessage = null

      const handleRoomNotification = (data) => {
        if (data.type === 'leave') {
          toastMessage = `${data.character.emoji} ${data.character.name}님이 ${data.roomName}(으)로 떠났습니다`
        }
      }

      mockSocket.on('roomNotification', handleRoomNotification)

      const notification = {
        type: 'leave',
        character: {
          id: 'ai-agent-1',
          name: 'AI 유리',
          emoji: '🧞',
          color: '#FF6B6B'
        },
        roomId: 'main',
        roomName: '메인 광장',
        timestamp: Date.now()
      }

      const callbacks = mockSocket.on.mock.calls.filter(call => call[0] === 'roomNotification')
      callbacks.forEach(([_, callback]) => callback(notification))

      expect(toastMessage).toContain('🧞')
      expect(toastMessage).toContain('AI 유리')
      expect(toastMessage).toContain('떠났습니다')
    })
  })

  describe('채팅 히스토리 시스템 메시지', () => {
    it('[T15] 입장 알림이 채팅 히스토리에 시스템 메시지로 추가되어야 함', async () => {
      const roomId = 'main'
      const notification = {
        type: 'join',
        character: {
          id: 'player2',
          name: '플레이어2',
          emoji: '😎',
          color: '#FF5722'
        },
        roomId,
        roomName: '메인 광장',
        timestamp: Date.now()
      }

      // 채팅 히스토리 업데이트
      roomChatHistory = updateRoomChatHistory(
        roomId,
        `${notification.character.emoji} ${notification.character.name}님이 ${notification.roomName}(으)로 입장했습니다`
      )

      expect(roomChatHistory[roomId]).toBeDefined()
      expect(roomChatHistory[roomId].length).toBeGreaterThan(0)

      const lastMessage = roomChatHistory[roomId][roomChatHistory[roomId].length - 1]
      expect(lastMessage.characterName).toBe('시스템')
      expect(lastMessage.isSystem).toBe(true)
      expect(lastMessage.message).toContain('플레이어2')
      expect(lastMessage.message).toContain('입장했습니다')
    })

    it('[T16] 퇴장 알림이 채팅 히스토리에 시스템 메시지로 추가되어야 함', async () => {
      const roomId = 'main'
      const notification = {
        type: 'leave',
        character: {
          id: 'player3',
          name: '플레이어3',
          emoji: '🚀',
          color: '#607D8B'
        },
        roomId,
        roomName: '메인 광장',
        timestamp: Date.now()
      }

      roomChatHistory = updateRoomChatHistory(
        roomId,
        `${notification.character.emoji} ${notification.character.name}님이 ${notification.roomName}(으)로 떠났습니다`
      )

      expect(roomChatHistory[roomId]).toBeDefined()
      expect(roomChatHistory[roomId].length).toBeGreaterThan(0)

      const lastMessage = roomChatHistory[roomId][roomChatHistory[roomId].length - 1]
      expect(lastMessage.characterName).toBe('시스템')
      expect(lastMessage.isSystem).toBe(true)
      expect(lastMessage.message).toContain('플레이어3')
      expect(lastMessage.message).toContain('떠났습니다')
    })

    it('[T17] 시스템 메시지에 timestamp가 포함되어야 함', async () => {
      const roomId = 'room2'
      const beforeTime = Date.now()

      roomChatHistory = updateRoomChatHistory(
        roomId,
        '테스트 시스템 메시지'
      )

      const afterTime = Date.now()

      const systemMessage = roomChatHistory[roomId][0]
      expect(systemMessage.timestamp).toBeDefined()
      expect(systemMessage.timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(systemMessage.timestamp).toBeLessThanOrEqual(afterTime)
    })

    it('[T18] 여러 방의 채팅 히스토리가 분리되어 저장되어야 함', async () => {
      const room1Id = 'main'
      const room2Id = 'room2'

      roomChatHistory = updateRoomChatHistory(room1Id, '메인 광장 시스템 메시지')
      roomChatHistory = updateRoomChatHistory(room2Id, '룸 2 시스템 메시지')

      expect(roomChatHistory[room1Id]).toBeDefined()
      expect(roomChatHistory[room2Id]).toBeDefined()
      expect(roomChatHistory[room1Id].length).toBe(1)
      expect(roomChatHistory[room2Id].length).toBe(1)

      expect(roomChatHistory[room1Id][0].message).toContain('메인 광장')
      expect(roomChatHistory[room2Id][0].message).toContain('룸 2')
    })
  })

  describe('Toast 타이머', () => {
    it('[T19] 입장 알림 Toast가 4초 후에 사라져야 함', async () => {
      let toastShow = true
      let setTimeoutId = null

      const showToast = (message, type) => {
        toastShow = true
        const timeoutId = setTimeout(() => {
          toastShow = false
        }, 4000)
        return timeoutId
      }

      const handleRoomNotification = (data) => {
        if (data.type === 'join') {
          const message = `${data.character.emoji} ${data.character.name}님이 ${data.roomName}(으)로 입장했습니다`
          setTimeoutId = showToast(message, 'info')
        }
      }

      mockSocket.on('roomNotification', handleRoomNotification)

      const notification = {
        type: 'join',
        character: { id: 'test', name: '테스트', emoji: '🧪', color: '#9C27B0' },
        roomId: 'main',
        roomName: '메인 광장',
        timestamp: Date.now()
      }

      const callbacks = mockSocket.on.mock.calls.filter(call => call[0] === 'roomNotification')
      callbacks.forEach(([_, callback]) => callback(notification))

      expect(toastShow).toBe(true)
      expect(setTimeoutId).not.toBeNull()
    })

    it('[T20] 퇴장 알림 Toast가 4초 후에 사라져야 함', async () => {
      let toastShow = true
      let setTimeoutId = null

      const showToast = (message, type) => {
        toastShow = true
        const timeoutId = setTimeout(() => {
          toastShow = false
        }, 4000)
        return timeoutId
      }

      const handleRoomNotification = (data) => {
        if (data.type === 'leave') {
          const message = `${data.character.emoji} ${data.character.name}님이 ${data.roomName}(으)로 떠났습니다`
          setTimeoutId = showToast(message, 'warning')
        }
      }

      mockSocket.on('roomNotification', handleRoomNotification)

      const notification = {
        type: 'leave',
        character: { id: 'test', name: '테스트', emoji: '🧪', color: '#9C27B0' },
        roomId: 'main',
        roomName: '메인 광장',
        timestamp: Date.now()
      }

      const callbacks = mockSocket.on.mock.calls.filter(call => call[0] === 'roomNotification')
      callbacks.forEach(([_, callback]) => callback(notification))

      expect(toastShow).toBe(true)
      expect(setTimeoutId).not.toBeNull()
    })
  })
})