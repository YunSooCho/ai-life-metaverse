import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Redis 클라이언트 모킹 (factory 내에서 객체 생성)
vi.mock('./utils/redis-client.js', () => {
  const mockRedisClient = {
    setEx: vi.fn().mockResolvedValue('OK'),
    set: vi.fn().mockResolvedValue('OK'),
    get: vi.fn().mockResolvedValue(null),
    del: vi.fn().mockResolvedValue(1),
    quit: vi.fn().mockResolvedValue('OK')
  }
  
  return {
    initRedis: vi.fn().mockResolvedValue(mockRedisClient),
    getRedisClient: vi.fn(() => mockRedisClient),
    closeRedis: vi.fn().mockResolvedValue(undefined),
    isRedisEnabled: vi.fn(() => true)
  }
})

// 모듈 import (mock 설정 후)
import {
  saveCharacter,
  loadCharacter,
  saveInventory,
  loadInventory,
  saveAffinities,
  loadAffinities,
  saveQuests,
  loadQuests,
  saveChatHistory,
  loadChatHistory,
  saveRoom,
  loadRoom,
  saveCharacterData,
  loadCharacterData,
  saveRoomData,
  loadRoomData,
  deleteCharacterData,
  deleteRoomData
} from './persistence.js'
import { getRedisClient, isRedisEnabled } from './utils/redis-client.js'

describe('데이터 영속성 시스템', () => {
  const TEST_CHARACTER_ID = 'test-character-1'
  const TEST_ROOM_ID = 'test-room-1'

  const testCharacter = {
    id: TEST_CHARACTER_ID,
    name: ' 테스트 캐릭터',
    x: 100,
    y: 100,
    color: '#FF0000',
    emoji: '🎭'
  }

  const testInventory = {
    healthPotion: 5,
    coin: 100,
    giftBox: 2
  }

  const testAffinities = {
    'ai-agent-1': { 'test-player': 50 },
    'ai-agent-2': { 'test-player': 30 }
  }

  const testQuests = {
    active: [
      { id: 'quest-1', title: '테스트 퀘스트 1', progress: 50, completed: false }
    ],
    available: [
      { id: 'quest-2', title: '테스트 퀘스트 2', progress: 0, completed: false }
    ]
  }

  const testChatHistory = [
    { characterId: 'test-1', characterName: '유저1', message: '안녕하세요', timestamp: Date.now() },
    { characterId: 'test-2', characterName: '유저2', message: '반갑습니다', timestamp: Date.now() }
  ]

  const testRoom = {
    id: TEST_ROOM_ID,
    name: '테스트 방',
    characters: {
      [TEST_CHARACTER_ID]: testCharacter
    },
    chatHistory: testChatHistory,
    affinities: testAffinities
  }

  beforeEach(() => {
    // Mock 초기화
    const client = getRedisClient()
    if (client && client.setEx?.mockClear) client.setEx.mockClear()
    if (client && client.set?.mockClear) client.set.mockClear()
    if (client && client.get?.mockClear) client.get.mockClear()
    if (client && client.del?.mockClear) client.del.mockClear()
    
    // Mock 기본 응답 설정
    isRedisEnabled.mockReturnValue(true)
  })

  afterEach(() => {
    // 테스트 정리
  })

  describe('캐릭터 데이터 영속화', () => {
    it('TC01: 캐릭터 데이터 저장과 조회', async () => {
      const client = getRedisClient()
      
      // 저장
      client.setEx.mockResolvedValueOnce('OK')
      const saved = await saveCharacter(testCharacter)
      expect(saved).toBe(true)
      expect(client.setEx).toHaveBeenCalledWith(
        `character:${TEST_CHARACTER_ID}`,
        86400, // TTL.LONG
        JSON.stringify(testCharacter)
      )

      // 조회
      client.get.mockResolvedValueOnce(JSON.stringify(testCharacter))
      const loaded = await loadCharacter(TEST_CHARACTER_ID)
      expect(loaded).toEqual(testCharacter)
    })

    it('TC02: 캐릭터 데이터 없는 경우 null 반환', async () => {
      const client = getRedisClient()
      client.get.mockResolvedValueOnce(null)
      const loaded = await loadCharacter('non-existent-id')
      expect(loaded).toBe(null)
    })

    it('TC03: 캐릭터 ID 없는 경우 저장 실패', async () => {
      const saved = await saveCharacter({ name: 'ID 없음' })
      expect(saved).toBe(false)
    })
  })

  describe('인벤토리 데이터 영속화', () => {
    it('TC04: 인벤토리 데이터 저장과 조회', async () => {
      const client = getRedisClient()
      
      // 저장
      client.setEx.mockResolvedValueOnce('OK')
      const saved = await saveInventory(TEST_CHARACTER_ID, testInventory)
      expect(saved).toBe(true)

      // 조회
      client.get.mockResolvedValueOnce(JSON.stringify(testInventory))
      const loaded = await loadInventory(TEST_CHARACTER_ID)
      expect(loaded).toEqual(testInventory)
    })
  })

  describe('호감도 데이터 영속화', () => {
    it('TC05: 호감도 데이터 저장과 조회', async () => {
      const client = getRedisClient()
      
      // 저장
      client.setEx.mockResolvedValueOnce('OK')
      const saved = await saveAffinities(TEST_ROOM_ID, testAffinities)
      expect(saved).toBe(true)

      // 조회
      client.get.mockResolvedValueOnce(JSON.stringify(testAffinities))
      const loaded = await loadAffinities(TEST_ROOM_ID)
      expect(loaded).toEqual(testAffinities)
    })
  })

  describe('퀘스트 데이터 영속화', () => {
    it('TC06: 퀘스트 데이터 저장과 조회', async () => {
      const client = getRedisClient()
      
      // 저장
      client.setEx.mockResolvedValueOnce('OK')
      const saved = await saveQuests(TEST_CHARACTER_ID, testQuests)
      expect(saved).toBe(true)

      // 조회
      client.get.mockResolvedValueOnce(JSON.stringify(testQuests))
      const loaded = await loadQuests(TEST_CHARACTER_ID)
      expect(loaded).toEqual(testQuests)
    })
  })

  describe('채팅 히스토리 영속화', () => {
    it('TC07: 채팅 히스토리 저장과 조회', async () => {
      const client = getRedisClient()
      
      // 저장
      client.setEx.mockResolvedValueOnce('OK')
      const saved = await saveChatHistory(TEST_ROOM_ID, testChatHistory)
      expect(saved).toBe(true)

      // 조회
      client.get.mockResolvedValueOnce(JSON.stringify(testChatHistory))
      const loaded = await loadChatHistory(TEST_ROOM_ID)
      expect(loaded).toEqual(testChatHistory)
    })

    it('TC08: 채팅 히스토리 없는 경우 null 반환', async () => {
      const client = getRedisClient()
      client.get.mockResolvedValueOnce(null)
      const loaded = await loadChatHistory('non-existent-room')
      expect(loaded).toBe(null)
    })
  })

  describe('방 데이터 영속화', () => {
    it('TC09: 방 데이터 저장과 조회', async () => {
      const client = getRedisClient()
      
      // 저장
      client.setEx.mockResolvedValueOnce('OK')
      const saved = await saveRoom(testRoom)
      expect(saved).toBe(true)

      // 조회
      client.get.mockResolvedValueOnce(JSON.stringify(testRoom))
      const loaded = await loadRoom(TEST_ROOM_ID)
      expect(loaded).toEqual(testRoom)
    })
  })

  describe('통합 저장/로드', () => {
    it('TC10: 캐릭터 데이터 통합 저장', async () => {
      const client = getRedisClient()
      
      client.setEx.mockResolvedValueOnce('OK') // inventory
      client.setEx.mockResolvedValueOnce('OK') // quests

      const results = await saveCharacterData(TEST_CHARACTER_ID, TEST_ROOM_ID)
      expect(results.inventory).toBe(true)
      expect(results.quests).toBe(true)
      expect(client.setEx).toHaveBeenCalledTimes(2)
    })

    it('TC11: 캐릭터 데이터 통합 로드', async () => {
      const client = getRedisClient()
      
      client.get.mockResolvedValueOnce(JSON.stringify(testCharacter))
      client.get.mockResolvedValueOnce(JSON.stringify(testInventory))
      client.get.mockResolvedValueOnce(JSON.stringify(testQuests))

      const data = await loadCharacterData(TEST_CHARACTER_ID)
      expect(data.character).toEqual(testCharacter)
      expect(data.inventory).toEqual(testInventory)
      expect(data.quests).toEqual(testQuests)
    })

    it('TC12: 방 데이터 통합 저장', async () => {
      const client = getRedisClient()
      
      client.setEx.mockResolvedValueOnce('OK') // room
      client.setEx.mockResolvedValueOnce('OK') // chatHistory
      client.setEx.mockResolvedValueOnce('OK') // affinities

      const results = await saveRoomData(TEST_ROOM_ID, testRoom)
      expect(results.room).toBe(true)
      expect(results.chatHistory).toBe(true)
      expect(results.affinities).toBe(true)
      expect(client.setEx).toHaveBeenCalledTimes(3)
    })

    it('TC13: 방 데이터 통합 로드', async () => {
      const client = getRedisClient()
      
      client.get.mockResolvedValueOnce(JSON.stringify(testRoom))
      client.get.mockResolvedValueOnce(JSON.stringify(testChatHistory))
      client.get.mockResolvedValueOnce(JSON.stringify(testAffinities))

      const data = await loadRoomData(TEST_ROOM_ID)
      expect(data.room).toEqual(testRoom)
      expect(data.chatHistory).toEqual(testChatHistory)
      expect(data.affinities).toEqual(testAffinities)
    })
  })

  describe('데이터 삭제', () => {
    it('TC14: 캐릭터 데이터 삭제', async () => {
      const client = getRedisClient()
      client.del.mockResolvedValueOnce(3) // 3개 키 삭제

      const deleted = await deleteCharacterData(TEST_CHARACTER_ID)
      expect(deleted).toBe(true)
      expect(client.del).toHaveBeenCalledWith(`character:${TEST_CHARACTER_ID}`)
      expect(client.del).toHaveBeenCalledWith(`inventory:${TEST_CHARACTER_ID}`)
      expect(client.del).toHaveBeenCalledWith(`quests:${TEST_CHARACTER_ID}`)
    })

    it('TC15: 방 데이터 삭제', async () => {
      const client = getRedisClient()
      client.del.mockResolvedValueOnce(3) // 3개 키 삭제

      const deleted = await deleteRoomData(TEST_ROOM_ID)
      expect(deleted).toBe(true)
      expect(client.del).toHaveBeenCalledWith(`room:${TEST_ROOM_ID}`)
      expect(client.del).toHaveBeenCalledWith(`chat:${TEST_ROOM_ID}`)
      expect(client.del).toHaveBeenCalledWith(`affinities:${TEST_ROOM_ID}`)
    })
  })

  describe('Redis 비활성화 상태', () => {
    it('TC16: Redis 비활성화 시 저장 실패', async () => {
      isRedisEnabled.mockReturnValue(false)

      const saved = await saveCharacter(testCharacter)
      expect(saved).toBe(false)
    })

    it('TC17: Redis 비활성화 시 조회 null 반환', async () => {
      isRedisEnabled.mockReturnValue(false)

      const loaded = await loadCharacter(TEST_CHARACTER_ID)
      expect(loaded).toBe(null)
    })
  })

  describe('에러 처리', () => {
    it('TC18: Redis 저장 에러 처리', async () => {
      const client = getRedisClient()
      client.setEx.mockRejectedValueOnce(new Error('Redis error'))

      const saved = await saveCharacter(testCharacter)
      expect(saved).toBe(false)
    })

    it('TC19: Redis 조회 에러 처리', async () => {
      const client = getRedisClient()
      client.get.mockRejectedValueOnce(new Error('Redis error'))

      const loaded = await loadCharacter(TEST_CHARACTER_ID)
      expect(loaded).toBe(null)
    })

    it('TC20: JSON 파싱 에러 처리', async () => {
      const client = getRedisClient()
      client.get.mockResolvedValueOnce('invalid-json')

      const loaded = await loadCharacter(TEST_CHARACTER_ID)
      expect(loaded).toBe(null)
    })
  })
})