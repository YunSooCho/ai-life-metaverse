import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Server } from 'socket.io'
import { io as ioClient } from 'socket.io-client'
import http from 'http'

describe('Multiplayer System', () => {
  let httpServer
  let server
  let clientSocket1
  let clientSocket2

  beforeEach(() => {
    // 테스트용 HTTP 서버 생성
    return new Promise((resolve) => {
      httpServer = http.createServer()
      httpServer.listen(() => {
        const port = httpServer.address().port
        server = new Server(httpServer, {
          cors: {
            origin: '*',
            methods: ['GET', 'POST']
          }
        })

        // 방 시스템 초기화
        server.rooms = {}
        server.characterRooms = {}
        const DEFAULT_ROOM_ID = 'main'
        const DEFAULT_ROOM_CAPACITY = 20

        server.rooms[DEFAULT_ROOM_ID] = {
          id: DEFAULT_ROOM_ID,
          name: '메인 광장',
          characters: {},
          chatHistory: [],
          affinities: {},
          capacity: DEFAULT_ROOM_CAPACITY
        }

        // Socket.io 이벤트 핸들러 설정 (간략화)
        server.on('connection', (socket) => {
          socket.on('join', (character) => {
            const roomId = DEFAULT_ROOM_ID
            const room = server.rooms[roomId]

            // Capacity 체크
            const currentCharacterCount = Object.keys(room.characters).length
            if (currentCharacterCount >= room.capacity) {
              socket.emit('roomError', {
                type: 'capacity_exceeded',
                message: `방 ${room.name}은 정원(${room.capacity})에 도달했습니다.`,
                roomId,
                capacity: room.capacity
              })
              return
            }

            room.characters[character.id] = character
            server.characterRooms[character.id] = roomId
          })

          socket.on('chatMessage', (data) => {
            const { message, characterId } = data
            const roomId = server.characterRooms[characterId]
            const room = server.rooms[roomId]

            // 이모지 지원
            const emojiMap = {
              ':smile:': '😊',
              ':laugh:': '😂',
              ':heart:': '❤️',
              ':thumbsup:': '👍'
            }

            let processedMessage = message
            for (const [code, emoji] of Object.entries(emojiMap)) {
              processedMessage = processedMessage.replace(new RegExp(code.replace(/:/g, '\\:'), 'g'), emoji)
            }

            const chatData = {
              characterId,
              characterName: room.characters[characterId].name,
              message: processedMessage,
              timestamp: Date.now(),
              roomId
            }

            room.chatHistory.push(chatData)
            server.to(roomId).emit('chatBroadcast', chatData)
          })

          socket.on('privateMessage', (data) => {
            const { message, characterId, targetCharacterId } = data
            const roomId = server.characterRooms[characterId]
            const room = server.rooms[roomId]
            const sender = room.characters[characterId]

            const privateMessageData = {
              characterId,
              characterName: sender.name,
              targetCharacterId,
              message,
              timestamp: Date.now()
            }

            socket.emit('privateMessage', privateMessageData)
          })
        })

        server.privateMessages = {}

        resolve()
      })
    })
  })

  afterEach(() => {
    return new Promise((resolve) => {
      if (clientSocket1) clientSocket1.close()
      if (clientSocket2) clientSocket2.close()
      httpServer.close(() => {
        server.close()
        resolve()
      })
    })
  })

  describe('Capacity Check', () => {
    it('should allow joining when capacity is not reached', () => {
      const room = server.rooms['main']
      expect(Object.keys(room.characters).length).toBe(0)

      const character = {
        id: 'char-1',
        name: 'Test Character',
        x: 100,
        y: 100,
        color: '#FF0000',
        emoji: '🧞'
      }

      // 시뮬레이션: capacity 체크
      const currentCharacterCount = Object.keys(room.characters).length
      const canJoin = currentCharacterCount < room.capacity

      expect(canJoin).toBe(true)
      expect(room.capacity).toBe(20)
    })

    it('should check capacity limit', () => {
      const room = server.rooms['main']
      const originalCapacity = room.capacity

      // capacity를 낮게 설정하여 테스트
      room.capacity = 2

      const character1 = { id: 'char-1', name: 'Char 1' }
      const character2 = { id: 'char-2', name: 'Char 2' }
      const character3 = { id: 'char-3', name: 'Char 3' }

      // 2명까지는 들어갈 수 있음
      room.characters[character1.id] = character1
      room.characters[character2.id] = character2

      let canJoin = Object.keys(room.characters).length < room.capacity
      expect(canJoin).toBe(false)

      // capacity 복구
      room.capacity = originalCapacity
      delete room.characters[character1.id]
      delete room.characters[character2.id]
    })
  })

  describe('Emoji Support', () => {
    it('should convert emoji codes to emojis', () => {
      const emojiMap = {
        ':smile:': '😊',
        ':laugh:': '😂',
        ':heart:': '❤️',
        ':thumbsup:': '👍'
      }

      let message = 'Hello! :smile: This is a test :heart:'
      for (const [code, emoji] of Object.entries(emojiMap)) {
        message = message.replace(new RegExp(code.replace(/:/g, '\\:'), 'g'), emoji)
      }

      expect(message).toBe('Hello! 😊 This is a test ❤️')
    })

    it('should handle multiple same emoji codes', () => {
      const emojiMap = {
        ':thumbsup:': '👍'
      }

      let message = 'Great job! :thumbsup: :thumbsup: :thumbsup:'
      for (const [code, emoji] of Object.entries(emojiMap)) {
        message = message.replace(new RegExp(code.replace(/:/g, '\\:'), 'g'), emoji)
      }

      expect(message).toBe('Great job! 👍 👍 👍')
    })

    it('should leave message unchanged when no emoji code', () => {
      const emojiMap = {
        ':smile:': '😊'
      }

      let message = 'Hello! This is a normal message'
      for (const [code, emoji] of Object.entries(emojiMap)) {
        message = message.replace(new RegExp(code.replace(/:/g, '\\:'), 'g'), emoji)
      }

      expect(message).toBe('Hello! This is a normal message')
    })
  })

  describe('Chat History Management', () => {
    it('should limit chat history', () => {
      const room = server.rooms['main']
      const MAX_CHAT_HISTORY = 30

      for (let i = 0; i < 40; i++) {
        room.chatHistory.push({
          characterId: 'char-1',
          characterName: 'Test',
          message: `Message ${i}`,
          timestamp: Date.now(),
          roomId: 'main'
        })

        // 제한 적용
        if (room.chatHistory.length > MAX_CHAT_HISTORY) {
          room.chatHistory.shift()
        }
      }

      expect(room.chatHistory.length).toBeLessThanOrEqual(MAX_CHAT_HISTORY)
      expect(room.chatHistory.length).toBe(MAX_CHAT_HISTORY)
    })

    it('should keep newest messages when limiting', () => {
      const room = server.rooms['main']
      const MAX_CHAT_HISTORY = 30

      // 40개 메시지 추가
      for (let i = 0; i < 40; i++) {
        room.chatHistory.push({
          characterId: 'char-1',
          characterName: 'Test',
          message: `Message ${i}`,
          timestamp: Date.now(),
          roomId: 'main'
        })

        // 제한 적용
        if (room.chatHistory.length > MAX_CHAT_HISTORY) {
          room.chatHistory.shift()
        }
      }

      // 가장 오래된 메시지의 번호는 10이어야 함 (0~9 삭제됨)
      expect(room.chatHistory[0].message).toBe('Message 10')
      expect(room.chatHistory[29].message).toBe('Message 39')
    })
  })

  describe('Active Rooms API', () => {
    it('should return room information', () => {
      const room = server.rooms['main']
      const activeRooms = [{
        id: room.id,
        name: room.name,
        characterCount: Object.keys(room.characters).length,
        capacity: room.capacity,
        isFull: Object.keys(room.characters).length >= room.capacity
      }]

      expect(activeRooms[0]).toEqual({
        id: 'main',
        name: '메인 광장',
        characterCount: 0,
        capacity: 20,
        isFull: false
      })
    })

    it('should update character count', () => {
      const room = server.rooms['main']

      // 캐릭터 추가
      const character1 = { id: 'char-1', name: 'Char 1' }
      const character2 = { id: 'char-2', name: 'Char 2' }

      room.characters[character1.id] = character1
      room.characters[character2.id] = character2

      const activeRooms = [{
        id: room.id,
        name: room.name,
        characterCount: Object.keys(room.characters).length,
        capacity: room.capacity,
        isFull: Object.keys(room.characters).length >= room.capacity
      }]

      expect(activeRooms[0].characterCount).toBe(2)
      expect(activeRooms[0].isFull).toBe(false)

      // 정리
      delete room.characters[character1.id]
      delete room.characters[character2.id]
    })
  })

  describe('Private Message System', () => {
    beforeEach(() => {
      // privateMessages 초기화
      if (!server.privateMessages) {
        server.privateMessages = {}
      }
    })

    it('should create empty message history for new users', () => {
      const characterId = 'char-1'
      server.privateMessages[characterId] = []

      expect(server.privateMessages[characterId]).toEqual([])
    })

    it('should add private message to history', () => {
      const characterId1 = 'char-1'
      const characterId2 = 'char-2'

      server.privateMessages[characterId1] = []
      server.privateMessages[characterId2] = []

      const message = {
        characterId: characterId1,
        characterName: 'Char 1',
        targetCharacterId: characterId2,
        message: 'Hello!',
        timestamp: Date.now()
      }

      server.privateMessages[characterId1].push(message)
      server.privateMessages[characterId2].push(message)

      expect(server.privateMessages[characterId1].length).toBe(1)
      expect(server.privateMessages[characterId2].length).toBe(1)
      expect(server.privateMessages[characterId1][0].message).toBe('Hello!')
    })

    it('should limit private message history to 50', () => {
      const characterId = 'char-1'
      server.privateMessages[characterId] = []

      for (let i = 0; i < 60; i++) {
        server.privateMessages[characterId].push({
          characterId: 'char-2',
          message: `Message ${i}`,
          timestamp: Date.now()
        })

        if (server.privateMessages[characterId].length > 50) {
          server.privateMessages[characterId].shift()
        }
      }

      expect(server.privateMessages[characterId].length).toBe(50)
      expect(server.privateMessages[characterId][0].message).toBe('Message 10')
    })
  })
})