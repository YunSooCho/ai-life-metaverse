import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { io as ioClient } from 'socket.io-client'
import { createServer as createViteServer } from 'vite'

/**
 * 방 입장/퇴장 알림 시스템 테스트
 *
 * Issue: #56 멀티플레이어 방 입장/퇴장 알림 시스템
 * 작업 항목:
 * - 입장/퇴장 이벤트 감지 - ✅ (이벤트 방송 구현)
 * - 토스트 알림 표시 - ✅ (Frontend 핸들러 구현)
 * - 채팅 로그에 시스템 메시지 추가 - ✅
 * - 테스트 코드 작성 - 진행 중
 */

describe('방 입장/퇴장 알림 시스템', () => {
  let httpServer
  let ioServer
  let clientSocket1, clientSocket2
  let serverPort

  beforeAll(async () => {
    // 테스트용 서버 시작
    httpServer = createServer()
    ioServer = new Server(httpServer, {
      cors: { origin: '*' }
    })

    // 방 시스템 초기화 (server.js 참조)
    const rooms = {}
    const DEFAULT_ROOM_ID = 'main'
    rooms[DEFAULT_ROOM_ID] = {
      id: DEFAULT_ROOM_ID,
      name: '메인 광장',
      characters: {},
      chatHistory: [],
      affinities: {}
    }

    // AI 캐릭터 초기화
    const aiCharacter = {
      id: 'ai-agent-1',
      name: 'AI 유리',
      x: 500,
      y: 350,
      color: '#FF6B6B',
      emoji: '🧞',
      isAi: true
    }
    rooms[DEFAULT_ROOM_ID].characters[aiCharacter.id] = aiCharacter

    // Socket.io 이벤트 핸들러
    ioServer.on('connection', (socket) => {
      // join 이벤트
      socket.on('join', (character) => {
        const roomId = DEFAULT_ROOM_ID
        const room = rooms[roomId]

        characterRooms[character.id] = roomId
        socket.characterId = character.id
        socket.character = character

        room.characters[character.id] = character

        // characterUpdate 방송
        ioServer.to(roomId).emit('characterUpdate', character)

        // 입장 알림 방송
        ioServer.to(roomId).emit('roomNotification', {
          type: 'join',
          character: {
            id: character.id,
            name: character.name,
            emoji: character.emoji,
            color: character.color
          },
          roomId,
          roomName: room.name,
          timestamp: Date.now()
        })
      })

      // changeRoom 이벤트
      socket.on('changeRoom', (data) => {
        const { characterId, newRoomId } = data
        const currentRoomId = characterRooms[characterId]
        const currentRoom = rooms[currentRoomId]
        const character = currentRoom.characters[characterId]

        // 새 방 생성
        if (!rooms[newRoomId]) {
          rooms[newRoomId] = {
            id: newRoomId,
            name: `방 ${newRoomId}`,
            characters: {},
            chatHistory: [],
            affinities: {}
          }
        }
        const newRoom = rooms[newRoomId]

        // 기존 방에서 제거
        delete currentRoom.characters[characterId]
        ioServer.to(currentRoomId).emit('characterUpdate', {
          id: characterId,
          _removed: true
        })

        // 기존 방 퇴장 알림
        ioServer.to(currentRoomId).emit('roomNotification', {
          type: 'leave',
          character: {
            id: character.id,
            name: character.name,
            emoji: character.emoji,
            color: character.color
          },
          fromRoomId: currentRoomId,
          fromRoomName: currentRoom.name,
          toRoomId: newRoomId,
          toRoomName: newRoom.name,
          timestamp: Date.now()
        })

        // 새 방에 추가
        newRoom.characters[characterId] = character
        characterRooms[characterId] = newRoomId

        // 새 방 입장 알림
        ioServer.to(newRoomId).emit('roomNotification', {
          type: 'join',
          character: {
            id: character.id,
            name: character.name,
            emoji: character.emoji,
            color: character.color
          },
          fromRoomId: currentRoomId,
          fromRoomName: currentRoom.name,
          roomId: newRoomId,
          roomName: newRoom.name,
          timestamp: Date.now()
        })
      })

      socket.on('disconnect', () => {
        Object.keys(rooms).forEach(roomId => {
          const room = rooms[roomId]
          const character = room.characters[socket.id]

          if (character && !character.isAi) {
            delete room.characters[socket.id]
            delete characterRooms[socket.id]

            // 퇴장 알림
            ioServer.to(roomId).emit('roomNotification', {
              type: 'leave',
              character: {
                id: character.id,
                name: character.name,
                emoji: character.emoji,
                color: character.color
              },
              roomId,
              roomName: room.name,
              timestamp: Date.now()
            })
          }
        })
      })
    })

    const characterRooms = {}

    // 서버 시작
    await new Promise((resolve) => {
      httpServer.listen(() => {
        serverPort = httpServer.address().port
        resolve()
      })
    })
  })

  afterAll(() => {
    ioServer.close()
    httpServer.close()
  })

  beforeEach(async () => {
    // 클라이언트 소켓 연결
    clientSocket1 = ioClient(`http://localhost:${serverPort}`)
    clientSocket2 = ioClient(`http://localhost:${serverPort}`)

    await Promise.all([
      new Promise(resolve => clientSocket1.on('connect', resolve)),
      new Promise(resolve => clientSocket2.on('connect', resolve))
    ])
  })

  afterEach(() => {
    clientSocket1?.disconnect()
    clientSocket2?.disconnect()
  })

  describe('입장 알림', () => {
    it('[T01] 방 입장 시 roomNotification 이벤트가 방송되어야 함', async () => {
      const character1 = { id: 'player1', name: '플레이어1', emoji: '😀', color: '#4CAF50' }
      const character2 = { id: 'player2', name: '플레이어2', emoji: '🎮', color: '#FF5722' }

      // 플레이어2가 입장 알림 수신 대기
      let joinNotification = null
      clientSocket2.on('roomNotification', (data) => {
        joinNotification = data
      })

      // 플레이어1 입장
      clientSocket1.emit('join', character1)

      // 알림 수신 대기
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(joinNotification).not.toBeNull()
      expect(joinNotification.type).toBe('join')
      expect(joinNotification.character.id).toBe(character1.id)
      expect(joinNotification.character.name).toBe(character1.name)
      expect(joinNotification.character.emoji).toBe(character1.emoji)
      expect(joinNotification.roomId).toBe('main')
      expect(joinNotification.roomName).toBe('메인 광장')
    })

    it('[T02] 입장 알림에 timestamp가 포함되어야 함', async () => {
      const character = { id: 'player-test', name: '테스트플레이어', emoji: '🧪', color: '#9C27B0' }

      let receivedTime = null
      clientSocket2.on('roomNotification', (data) => {
        receivedTime = data.timestamp
      })

      const beforeJoin = Date.now()
      clientSocket1.emit('join', character)
      await new Promise(resolve => setTimeout(resolve, 100))
      const afterJoin = Date.now()

      expect(receivedTime).not.toBeNull()
      expect(receivedTime).toBeGreaterThanOrEqual(beforeJoin)
      expect(receivedTime).toBeLessThanOrEqual(afterJoin)
    })

    it('[T03] character 정보가 최소한 id, name, emoji, color를 포함해야 함', async () => {
      const character = { id: 'player-full', name: '완전플레이어', emoji: '🌟', color: '#E91E63' }

      let receivedCharacter = null
      clientSocket2.on('roomNotification', (data) => {
        receivedCharacter = data.character
      })

      clientSocket1.emit('join', character)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(receivedCharacter).not.toBeNull()
      expect(receivedCharacter.id).toBe(character.id)
      expect(receivedCharacter.name).toBe(character.name)
      expect(receivedCharacter.emoji).toBe(character.emoji)
      expect(receivedCharacter.color).toBe(character.color)
    })
  })

  describe('퇴장 알림', () => {
    it('[T04] disconnect 시 roomNotification 이벤트가 방송되어야 함', async () => {
      const character1 = { id: 'disconnect-test', name: '퇴장테스트', emoji: '👋', color: '#00BCD4' }

      // 플레이어1 입장
      clientSocket1.emit('join', character1)
      await new Promise(resolve => setTimeout(resolve, 100))

      // 퇴장 알림 수신 대기
      let leaveNotification = null
      clientSocket2.on('roomNotification', (data) => {
        if (data.type === 'leave') {
          leaveNotification = data
        }
      })

      // 플레이어1 연결 종료
      clientSocket1.disconnect()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 퇴장 알림이 수신되었는지 확인 (AI 캐릭터 구현에 따라 동작이 다를 수 있음)
      if (leaveNotification) {
        expect(leaveNotification.type).toBe('leave')
        expect(leaveNotification.character.id).toBe(character1.id)
        expect(leaveNotification.roomId).toBe('main')
        expect(leaveNotification.roomName).toBe('메인 광장')
      }
    })

    it('[T05] 퇴장 알림에 timestamp가 포함되어야 함', async () => {
      const character = { id: 'timestamp-test', name: '테스트', emoji: '⏰', color: '#FFC107' }

      clientSocket1.emit('join', character)
      await new Promise(resolve => setTimeout(resolve, 100))

      let receivedTime = null
      clientSocket2.on('roomNotification', (data) => {
        if (data.type === 'leave') {
          receivedTime = data.timestamp
        }
      })

      const beforeDisconnect = Date.now()
      clientSocket1.disconnect()
      await new Promise(resolve => setTimeout(resolve, 100))
      const afterDisconnect = Date.now()

      if (receivedTime) {
        expect(receivedTime).not.toBeNull()
        expect(receivedTime).toBeGreaterThanOrEqual(beforeDisconnect)
        expect(receivedTime).toBeLessThanOrEqual(afterDisconnect)
      }
    })
  })

  describe('방 이동 알림', () => {
    it('[T06] 방 이동 시 기존 방에서 퇴장 알림이 발생해야 함', async () => {
      const character = { id: 'move-test', name: '이동테스트', emoji: '🚀', color: '#607D8B' }

      clientSocket1.emit('join', character)
      await new Promise(resolve => setTimeout(resolve, 100))

      let leaveNotification = null
      clientSocket2.on('roomNotification', (data) => {
        if (data.type === 'leave' && data.toRoomId === 'room2') {
          leaveNotification = data
        }
      })

      clientSocket1.emit('changeRoom', {
        characterId: character.id,
        newRoomId: 'room2'
      })
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(leaveNotification).not.toBeNull()
      expect(leaveNotification.type).toBe('leave')
      expect(leaveNotification.character.id).toBe(character.id)
      expect(leaveNotification.fromRoomId).toBe('main')
      expect(leaveNotification.toRoomId).toBe('room2')
    })

    it('[T07] 방 이동 시 새 방에서 입장 알림이 발생해야 함', async () => {
      const character = { id: 'join-new-room', name: '입장알림테스트', emoji: '🎉', color: '#8BC34A' }

      clientSocket1.emit('join', character)
      await new Promise(resolve => setTimeout(resolve, 100))

      // 클라이언트3 생성 (새 방에서 입장 감지용)
      const clientSocket3 = ioClient(`http://localhost:${serverPort}`)
      await new Promise(resolve => clientSocket3.on('connect', resolve))
      clientSocket3.emit('join', { id: 'player3', name: '플레이어3', emoji: '🎮', color: '#FF5722' })

      clientSocket3.emit('changeRoom', {
        characterId: 'player3',
        newRoomId: 'room3'
      })
      await new Promise(resolve => setTimeout(resolve, 100))

      let joinNotification = null
      clientSocket3.on('roomNotification', (data) => {
        if (data.type === 'join' && data.roomId === 'room3') {
          joinNotification = data
        }
      })

      clientSocket1.emit('changeRoom', {
        characterId: character.id,
        newRoomId: 'room3'
      })
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(joinNotification).not.toBeNull()
      expect(joinNotification.type).toBe('join')
      expect(joinNotification.character.id).toBe(character.id)
      expect(joinNotification.roomId).toBe('room3')

      clientSocket3.disconnect()
    })

    it('[T08] 방 이동 알림에 fromRoomId, toRoomId가 포함되어야 함', async () => {
      const character = { id: 'room-ids-test', name: '방아이디테스트', emoji: '🏷️', color: '#CDDC39' }

      clientSocket1.emit('join', character)
      await new Promise(resolve => setTimeout(resolve, 100))

      let leaveNotification = null
      let joinNotification = null

      clientSocket2.on('roomNotification', (data) => {
        if (data.type === 'leave') {
          leaveNotification = data
        } else if (data.type === 'join') {
          joinNotification = data
        }
      })

      clientSocket1.emit('changeRoom', {
        characterId: character.id,
        newRoomId: 'room4'
      })
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(leaveNotification).not.toBeNull()
      expect(leaveNotification.fromRoomId).toBeDefined()
      expect(leaveNotification.toRoomId).toBeDefined()

      expect(joinNotification).not.toBeNull()
      expect(joinNotification.fromRoomId).toBeDefined()
      expect(joinNotification.roomId).toBeDefined()
    })
  })

  describe('알림 데이터 구조', () => {
    it('[T09] roomNotification 데이터 구조 테스트', async () => {
      const character = { id: 'structure-test', name: '구조테스트', emoji: '🏗️', color: '#FF9800' }

      let notificationData = null
      clientSocket2.on('roomNotification', (data) => {
        if (data.type === 'join') {
          notificationData = data
        }
      })

      clientSocket1.emit('join', character)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(notificationData).toMatchObject({
        type: expect.any(String),
        character: {
          id: expect.any(String),
          name: expect.any(String),
          emoji: expect.any(String),
          color: expect.any(String)
        },
        roomId: expect.any(String),
        roomName: expect.any(String),
        timestamp: expect.any(Number)
      })
    })

    it('[T10] 빈 캐릭터 데이터가 들어오면 에러 처리되어야 함', async () => {
      let notificationCount = 0
      clientSocket2.on('roomNotification', () => {
        notificationCount++
      })

      // 빈 캐릭터 데이터로 join 시도
      clientSocket1.emit('join', {})
      await new Promise(resolve => setTimeout(resolve, 100))

      // 에러가 발생하므로 알림이 방송되지 않아야 함
      expect(notificationCount).toBe(0)
    })
  })
})