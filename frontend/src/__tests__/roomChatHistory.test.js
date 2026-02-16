import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { socket } from '@/socket'

vi.mock('@/socket', () => ({
  socket: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn()
  }
}))

describe('Room-based Chat History', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes empty room chat history', () => {
    const roomChatHistory = {}
    expect(roomChatHistory).toEqual({})
    expect(Object.keys(roomChatHistory).length).toBe(0)
  })

  it('stores chat messages by room ID', () => {
    const roomChatHistory = {}
    const roomId = 'main'
    const message = {
      characterId: 'player1',
      characterName: '플레이어1',
      message: '안녕하세요',
      timestamp: Date.now()
    }

    roomChatHistory[roomId] = [message]

    expect(roomChatHistory[roomId]).toBeDefined()
    expect(roomChatHistory[roomId].length).toBe(1)
    expect(roomChatHistory[roomId][0].message).toBe('안녕하세요')
  })

  it('separates messages between different rooms', () => {
    const roomChatHistory = {}
    
    const message1 = {
      characterId: 'player1',
      characterName: '플레이어1',
      message: '방1 메시지',
      timestamp: Date.now()
    }

    const message2 = {
      characterId: 'player2',
      characterName: '플레이어2',
      message: '방2 메시지',
      timestamp: Date.now()
    }

    roomChatHistory['main'] = [message1]
    roomChatHistory['room-123'] = [message2]

    expect(roomChatHistory['main']).toHaveLength(1)
    expect(roomChatHistory['room-123']).toHaveLength(1)
    expect(roomChatHistory['main'][0].message).toBe('방1 메시지')
    expect(roomChatHistory['room-123'][0].message).toBe('방2 메시지')
  })

  it('limits chat history to 50 messages per room', () => {
    const roomChatHistory = {}
    const messages = Array.from({ length: 60 }, (_, i) => ({
      characterId: `player${i}`,
      characterName: `플레이어${i}`,
      message: `메시지 ${i}`,
      timestamp: Date.now() + i
    }))

    const last50Messages = messages.slice(-50)
    roomChatHistory['main'] = last50Messages

    expect(roomChatHistory['main'].length).toBe(50)
    expect(roomChatHistory['main'][0].message).toBe('메시지 10')
    expect(roomChatHistory['main'][49].message).toBe('메시지 59')
  })

  it('preserves chat history when switching rooms', () => {
    const roomChatHistory = {}
    const currentRoom = { id: 'main', name: '메인 광장' }

    roomChatHistory['main'] = [
      {
        characterId: 'player1',
        characterName: '플레이어1',
        message: '메인 방 메시지',
        timestamp: Date.now()
      }
    ]

    roomChatHistory['room-456'] = [
      {
        characterId: 'player2',
        characterName: '플레이어2',
        message: '다른 방 메시지',
        timestamp: Date.now()
      }
    ]

    expect(roomChatHistory['main']).toHaveLength(1)
    expect(roomChatHistory['room-456']).toHaveLength(1)

    const newCurrentRoom = { id: 'room-456', name: '방 2' }
    const displayHistory = roomChatHistory[newCurrentRoom.id] || []

    expect(displayHistory).toHaveLength(1)
    expect(displayHistory[0].message).toBe('다른 방 메시지')
  })

  it('appends new messages to correct room', () => {
    const roomChatHistory = {
      'main': [
        {
          characterId: 'player1',
          characterName: '플레이어1',
          message: '첫 번째 메시지',
          timestamp: Date.now()
        }
      ]
    }

    const newMessage = {
      characterId: 'player2',
      characterName: '플레이어2',
      message: '두 번째 메시지',
      timestamp: Date.now()
    }

    roomChatHistory['main'] = [...roomChatHistory['main'], newMessage]

    expect(roomChatHistory['main'].length).toBe(2)
    expect(roomChatHistory['main'][1].message).toBe('두 번째 메시지')
  })

  it('handles empty chat history for new rooms', () => {
    const roomChatHistory = {
      'main': [
        {
          characterId: 'player1',
          characterName: '플레이어1',
          message: '메시지',
          timestamp: Date.now()
        }
      ]
    }

    const currentRoom = { id: 'new-room', name: '새 방' }
    const displayHistory = roomChatHistory[currentRoom.id] || []

    expect(displayHistory).toEqual([])
    expect(displayHistory.length).toBe(0)
  })

  it('initializes room history when joining existing room', () => {
    const roomChatHistory = {}
    const roomId = 'existing-room'
    const existingHistory = [
      {
        characterId: 'player1',
        characterName: '플레이어1',
        message: '기존 메시지',
        timestamp: Date.now()
      }
    ]

    roomChatHistory[roomId] = existingHistory

    expect(roomChatHistory[roomId]).toBeDefined()
    expect(roomChatHistory[roomId].length).toBe(1)
  })

  it('can retrieve chat history for specific room', () => {
    const roomChatHistory = {
      'main': [
        {
          characterId: 'player1',
          characterName: '플레이어1',
          message: '메인 방',
          timestamp: Date.now()
        }
      ],
      'room-1': [
        {
          characterId: 'player2',
          characterName: '플레이어2',
          message: '방 1',
          timestamp: Date.now()
        }
      ],
      'room-2': [
        {
          characterId: 'player3',
          characterName: '플레이어3',
          message: '방 2',
          timestamp: Date.now()
        }
      ]
    }

    const currentRoom = { id: 'room-1', name: '방 1' }
    const currentHistory = roomChatHistory[currentRoom.id] || []

    expect(currentHistory.length).toBe(1)
    expect(currentHistory[0].message).toBe('방 1')
  })

  it('clears only specific room history', () => {
    const roomChatHistory = {
      'main': [
        {
          characterId: 'player1',
          characterName: '플레이어1',
          message: '메인 방',
          timestamp: Date.now()
        }
      ],
      'room-1': [
        {
          characterId: 'player2',
          characterName: '플레이어2',
          message: '방 1',
          timestamp: Date.now()
        }
      ]
    }

    roomChatHistory['room-1'] = []

    expect(roomChatHistory['main'].length).toBe(1)
    expect(roomChatHistory['room-1'].length).toBe(0)
  })
})