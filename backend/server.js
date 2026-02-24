import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { addItem, removeItem, getInventory } from './inventory.js'
import {
  initializePlayerQuests,
  getPlayerQuests,
  getQuestProgress,
  updateQuestProgress,
  completeQuest,
  getQuestReward,
  getPlayerAvailableQuests,
  assignQuestToPlayer
} from './quest.js'
import { initializeAgent } from './ai-agent/agent.js'
// import {
//   initializeEventSystem,
//   initializeCharacter,
//   getActiveEvents,
//   getCharacterEvents,
//   handleEvent,
//   getEventSystemStatus
// } from './event-system/index.js'
import {
  initDatabase,
  initCharacterTable,
  updateCharacterPosition,
  getCharacter,
  getAllCharacters
} from './database/index.js'

// Phase 12: 캐릭터 시스템 고급화
import { EvolutionManager } from './character-system/evolution-manager.js'
import { SkillManager } from './character-system/skill-system.js'
import { EquipmentSystem } from './character-system/equipment-system.js'

// Phase 13: 제작 시스템
import RecipeManager from './managers/RecipeManager.js'
import CraftingManager from './managers/CraftingManager.js'
import CraftingTable from './managers/CraftingTable.js'

// 커스터마이징 확장 시스템
import { customizationExtensionSystem } from './character-system/customization-extension-system.js'

// Phase 14: 친구 시스템
import FriendManager from './friend-system/friend-manager.js'
import FriendRequestManager from './friend-system/friend-request.js'

// Phase 17: 길드 시스템
import guildRouter from './routes/guild.ts'
import guildChatRouter from './routes/guildChat.ts'

// Event system stubs (임시)
function handleEvent(characterId, eventType, eventData) {
  // No-op until event system is properly exported
}
function initializeCharacter(characterId) {
  // No-op until event system is properly exported
}
function getActiveEvents() {
  // No-op until event system is properly exported
  return []
}
function getCharacterEvents(characterId) {
  // No-op until event system is properly exported
  return {}
}
function getEventSystemStatus() {
  // No-op until event system is properly exported
  return { enabled: false }
}
function initializeEventSystem() {
  // No-op until event system is properly exported
}

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://10.76.29.91:3000', '*'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transport: ['websocket', 'polling'],  // WebSocket 우선, polling fallback
  // 연결 안정화 설정
  pingTimeout: 60000,      // 60초 타임아웃 (증가)
  pingInterval: 25000,     // 25초마다 핑 (증가)
  upgradeTimeout: 30000,   // 업그레이드 타임아웃
  maxHttpBufferSize: 1e6,  // 1MB 버퍼
  allowUpgrades: true,     // HTTP long-polling → WebSocket 업그레이드 허용
  connectTimeout: 45000,   // 연결 타임아웃
  // 재연결 설정
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000
})

// 맵 크기
const MAP_SIZE = { width: 1000, height: 700 }

// 아이템 데이터 구조
const ITEMS = {
  healthPotion: {
    id: 'healthPotion',
    name: '체력 포션',
    type: 'consumable',
    effect: { hp: 50 },
    icon: '❤️',
    description: 'HP를 50 회복합니다'
  },
  coin: {
    id: 'coin',
    name: '코인',
    type: 'currency',
    effect: { currency: 10 },
    icon: '🪙',
    description: '화폐로 사용됩니다'
  },
  giftBox: {
    id: 'giftBox',
    name: '선물 상자',
    type: 'consumable',
    effect: { affinity: 10 },
    icon: '🎁',
    description: '호감도가 10 증가합니다'
  },
  experiencePotion: {
    id: 'experiencePotion',
    name: '경험치 포션',
    type: 'consumable',
    effect: { experience: 100 },
    icon: '⚡',
    description: '경험치가 100 증가합니다'
  }
}

// 보상 데이터 구조
const REWARDS = {
  firstLogin: {
    id: 'firstLogin',
    name: '첫 로그인 보상',
    points: 100,
    experience: 50,
    items: [
      { id: 'healthPotion', quantity: 3 },
      { id: 'coin', quantity: 50 }
    ]
  },
  dailyBonus: {
    id: 'dailyBonus',
    name: '일일 보너스',
    points: 50,
    experience: 20,
    items: [
      { id: 'giftBox', quantity: 1 },
      { id: 'coin', quantity: 20 }
    ]
  },
  achievement: {
    id: 'achievement',
    name: '업적 달성 보상',
    points: 200,
    experience: 150,
    items: [
      { id: 'experiencePotion', quantity: 2 },
      { id: 'healthPotion', quantity: 5 }
    ]
  }
}

// 건물 데이터 구조
const buildings = [
  { id: 1, name: '상점', x: 150, y: 150, width: 120, height: 100, type: 'shop', color: '#4CAF50' },
  { id: 2, name: '카페', x: 700, y: 150, width: 120, height: 100, type: 'cafe', color: '#FF9800' },
  { id: 3, name: '공원', x: 400, y: 500, width: 200, height: 150, type: 'park', color: '#8BC34A' },
  { id: 4, name: '도서관', x: 100, y: 450, width: 150, height: 120, type: 'library', color: '#2196F3' },
  { id: 5, name: '체육관', x: 750, y: 450, width: 150, height: 120, type: 'gym', color: '#F44336' }
]

// 이벤트 기록 시스템 (건물 입장/퇴장)
const eventLogs = {}
const activeBuildingVisits = {}

// 방(Room) 시스템
const rooms = {}  // { roomId: { id, name, characters: {}, chatHistory: [], affinities: {}, capacity: 20 } }
const DEFAULT_ROOM_ID = 'main'
const DEFAULT_ROOM_CAPACITY = 20
const DEFAULT_CHARACTER_ID = 'player-' // 플레이어 접두사 (장비 시스템 임시용)

// 기본 방 생성
rooms[DEFAULT_ROOM_ID] = {
  id: DEFAULT_ROOM_ID,
  name: '메인 광장',
  characters: {},
  chatHistory: [],
  affinities: {},
  capacity: DEFAULT_ROOM_CAPACITY
}

// 캐릭터-방 매핑: { characterId: roomId }
const characterRooms = {}

// Phase 12: 캐릭터 시스템 고급화 - 인스턴스 초기화
const evolutionManager = new EvolutionManager(console)
const skillManager = new SkillManager(console)
const equipmentSystems = new Map(); // characterId -> EquipmentSystem

// Phase 13: 제작 시스템 - 인스턴스 초기화
// Redis 클라이언트는 없으므로 null 전달 (메모리 fallback 모드)
const recipeManager = new RecipeManager(null)
const craftingManager = new CraftingManager(null)
const craftingTable = new CraftingTable(null)

// Phase 14: 친구 시스템 - 인스턴스 초기화
const friendManager = new FriendManager(null)
const friendRequestManager = new FriendRequestManager(null)

// 캐릭터의 장비 시스템 가져오기
const getCharacterEquipment = (characterId) => {
  if (!equipmentSystems.has(characterId)) {
    const equipment = new EquipmentSystem();
    equipmentSystems.set(characterId, equipment);
  }
  return equipmentSystems.get(characterId);
};

// 프라이빗 메시지 기록 (캐릭터 ID 기준)
const privateMessages = {}  // { characterId: [messages] }

// 채팅 히스토리 최대 개수
const MAX_CHAT_HISTORY = 30

// 상호작션에 따른 호감도 변화
const AFFINITY_CHANGES = {
  greet: 1,
  gift: 10,
  befriend: 5,
  fight: -10
}

// AI 캐릭터 초기화 (기본 방) - 그리드 중심 위치로 수정 (Issue #121)
const TILE_SIZE = 50
const aiCharacter1 = {
  id: 'ai-agent-1',
  name: 'AI 유리',
  // 그리드 (10, 7) 중심: 10*50 + 25 = 525, 7*50 + 25 = 375
  x: 525,
  y: 375,
  color: '#FF6B6B',
  emoji: '🧞',
  isAi: true
}

const aiCharacter2 = {
  id: 'ai-agent-2',
  name: 'AI 히카리',
  // 그리드 (12, 6) 중심: 12*50 + 25 = 625, 6*50 + 25 = 325
  x: 625,
  y: 325,
  color: '#FFB347',
  emoji: '✨',
  isAi: true
}

rooms[DEFAULT_ROOM_ID].characters[aiCharacter1.id] = aiCharacter1
rooms[DEFAULT_ROOM_ID].characters[aiCharacter2.id] = aiCharacter2
characterRooms[aiCharacter1.id] = DEFAULT_ROOM_ID
characterRooms[aiCharacter2.id] = DEFAULT_ROOM_ID

console.log('✅ AI 캐릭터 초기화:', aiCharacter1.name, '→', DEFAULT_ROOM_ID)
console.log('✅ AI 캐릭터 초기화:', aiCharacter2.name, '→', DEFAULT_ROOM_ID)

app.use(express.json())

// CORS 설정 (Frontend 허용)
app.use(cors({
  origin: ['http://localhost:3000', 'http://10.76.29.91:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}))

// 루트 경로 핸들러 (헬스 체크)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Life Metaverse Backend Server',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    rooms: Object.keys(rooms).length,
    characters: Object.values(rooms).reduce((sum, room) => sum + Object.keys(room.characters).length, 0)
  })
})

app.get('/api/events/:characterId', (req, res) => {
  const { characterId } = req.params
  const logs = eventLogs[characterId] || []
  res.json({ logs })
})

app.get('/api/buildings', (req, res) => {
  res.json({ buildings })
})

// 채팅 로그 조회 HTTP 엔드포인트
import {
  getChatLogsByRoom,
  getChatLogsByCharacter,
  getAIChatLogs,
  getChatLogStats
} from './database/index.js'

app.get('/api/chat-logs/room/:roomId', (req, res) => {
  const { roomId } = req.params
  const limit = parseInt(req.query.limit) || 50

  try {
    const logs = getChatLogsByRoom(roomId, limit)
    res.json({ logs, count: logs.length })
  } catch (error) {
    console.error('채팅 로그 조회 에러:', error)
    res.status(500).json({ error: 'Failed to get chat logs' })
  }
})

app.get('/api/chat-logs/character/:characterId', (req, res) => {
  const { characterId } = req.params
  const limit = parseInt(req.query.limit) || 100

  try {
    const logs = getChatLogsByCharacter(characterId, limit)
    res.json({ logs, count: logs.length })
  } catch (error) {
    console.error('캐릭터 채팅 로그 조회 에러:', error)
    res.status(500).json({ error: 'Failed to get character chat logs' })
  }
})

// ✅ CRITICAL FIX #1007: 캐릭터 데이터 조회 API
app.get('/api/characters', (req, res) => {
  try {
    const characters = getAllCharacters()
    res.json({ characters, count: characters.length })
  } catch (error) {
    console.error('캐릭터 데이터 조회 에러:', error)
    res.status(500).json({ error: 'Failed to get characters' })
  }
})

app.get('/api/characters/:id', (req, res) => {
  const { id } = req.params

  try {
    const character = getCharacter(id)
    if (!character) {
      return res.status(404).json({ error: 'Character not found' })
    }
    res.json(character)
  } catch (error) {
    console.error('캐릭터 데이터 조회 에러:', error)
    res.status(500).json({ error: 'Failed to get character' })
  }
})

app.get('/api/chat-logs/ai/:charId1/:charId2', (req, res) => {
  const { charId1, charId2 } = req.params
  const { roomId } = req.query
  const limit = parseInt(req.query.limit) || 50

  if (!roomId) {
    return res.status(400).json({ error: 'roomId is required' })
  }

  try {
    const logs = getAIChatLogs(charId1, charId2, roomId, limit)
    res.json({ logs, count: logs.length })
  } catch (error) {
    console.error('AI 채팅 로그 조회 에러:', error)
    res.status(500).json({ error: 'Failed to get AI chat logs' })
  }
})

app.get('/api/chat-logs/stats', (req, res) => {
  try {
    const stats = getChatLogStats()
    res.json({ stats })
  } catch (error) {
    console.error('채팅 로그 통계 조회 에러:', error)
    res.status(500).json({ error: 'Failed to get chat log stats' })
  }
})

// AI 관계성 조회 HTTP 엔드포인트
import {
  getRelationship,
  getAllRelationships,
  getRelationshipStats
} from './database/index.js'

app.get('/api/ai-relationships/:charId1/:charId2', (req, res) => {
  const { charId1, charId2 } = req.params

  try {
    const relationship = getRelationship(charId1, charId2)
    if (!relationship) {
      return res.status(404).json({ error: 'Relationship not found' })
    }
    res.json({ relationship })
  } catch (error) {
    console.error('AI 관계성 조회 에러:', error)
    res.status(500).json({ error: 'Failed to get relationship' })
  }
})

app.get('/api/ai-relationships', (req, res) => {
  try {
    const relationships = getAllRelationships()
    res.json({ relationships, count: relationships.length })
  } catch (error) {
    console.error('AI 관계성 목록 조회 에러:', error)
    res.status(500).json({ error: 'Failed to get relationships' })
  }
})

app.get('/api/ai-relationships/stats', (req, res) => {
  try {
    const stats = getRelationshipStats()
    res.json({ stats })
  } catch (error) {
    console.error('AI 관계성 통계 조회 에러:', error)
    res.status(500).json({ error: 'Failed to get relationship stats' })
  }
})

// 활성 방 목록 조회 API
app.get('/api/rooms', (req, res) => {
  const activeRooms = Object.values(rooms).map(room => ({
    id: room.id,
    name: room.name,
    characterCount: Object.keys(room.characters).length,
    capacity: room.capacity,
    isFull: Object.keys(room.characters).length >= room.capacity
  }))
  res.json({ rooms: activeRooms })
})

// ===== 장비 시스템 HTTP API =====

// 장착된 장비 목록 조회
app.get('/api/equipment/slots/:characterId?', (req, res) => {
  try {
    const characterId = req.params.characterId || DEFAULT_CHARACTER_ID
    const equipment = getCharacterEquipment(characterId)
    res.json({ success: true, data: { slots: equipment.equippedSlots } })
  } catch (error) {
    console.error('장착된 장비 조회 에러:', error)
    res.status(500).json({ success: false, message: 'Failed to get equipped slots' })
  }
})

// 장비 장착
app.post('/api/equipment/equip', express.json(), (req, res) => {
  try {
    const characterId = DEFAULT_CHARACTER_ID // 임시로 기본 캐릭터 ID 사용
    const { itemId } = req.body

    if (!itemId) {
      return res.status(400).json({ success: false, message: 'itemId is required' })
    }

    const equipment = getCharacterEquipment(characterId)
    const result = equipment.equipItem(itemId)

    res.json({ success: result.success, message: result.message })
  } catch (error) {
    console.error('장비 장착 에러:', error)
    res.status(500).json({ success: false, message: 'Failed to equip item' })
  }
})

// 장비 해제
app.post('/api/equipment/unequip', express.json(), (req, res) => {
  try {
    const characterId = DEFAULT_CHARACTER_ID // 임시로 기본 캐릭터 ID 사용
    const { slotType } = req.body

    if (!slotType) {
      return res.status(400).json({ success: false, message: 'slotType is required' })
    }

    const equipment = getCharacterEquipment(characterId)
    const result = equipment.unequipSlot(slotType)

    res.json({ success: result.success, message: result.message })
  } catch (error) {
    console.error('장비 해제 에러:', error)
    res.status(500).json({ success: false, message: 'Failed to unequip item' })
  }
})

// 장비 강화
app.post('/api/equipment/enhance', express.json(), (req, res) => {
  try {
    const characterId = DEFAULT_CHARACTER_ID // 임시로 기본 캐릭터 ID 사용
    const { itemId } = req.body

    if (!itemId) {
      return res.status(400).json({ success: false, message: 'itemId is required' })
    }

    const equipment = getCharacterEquipment(characterId)
    const result = equipment.enhanceEquipment(itemId)

    res.json({ success: result.success, message: result.message, newLevel: result.newLevel })
  } catch (error) {
    console.error('장비 강화 에러:', error)
    res.status(500).json({ success: false, message: 'Failed to enhance equipment' })
  }
})

// 총 스탯 조회
app.get('/api/equipment/stats/:characterId?', (req, res) => {
  try {
    const characterId = req.params.characterId || DEFAULT_CHARACTER_ID
    const equipment = getCharacterEquipment(characterId)
    const totalStats = equipment.getTotalStats()
    res.json({ success: true, data: totalStats })
  } catch (error) {
    console.error('총 스탯 조회 에러:', error)
    res.status(500).json({ success: false, message: 'Failed to get equipment stats' })
  }
})

// 인벤토리 목록 조회
app.get('/api/equipment/inventory/:characterId?', (req, res) => {
  try {
    const characterId = req.params.characterId || DEFAULT_CHARACTER_ID
    const equipment = getCharacterEquipment(characterId)
    const inventory = equipment.getInventory()
    res.json({ success: true, data: inventory })
  } catch (error) {
    console.error('인벤토리 조회 에러:', error)
    res.status(500).json({ success: false, message: 'Failed to get inventory' })
  }
})

// ===== 장비 시스템 HTTP API 종료 =====

// Phase 17: 길드 시스템 HTTP API
app.use('/api/guilds', guildRouter)
app.use('/api/guild-chat', guildChatRouter)

// 방 유틸리티 함수
function getRoom(roomId) {
  return rooms[roomId] || rooms[DEFAULT_ROOM_ID]
}

function getCharactersInRoom(roomId) {
  return getRoom(roomId).characters
}

// AI 에이전트 초기화
initializeAgent(io, rooms, characterRooms)

// Socket.io 연결
io.on('connection', (socket) => {
  console.log('👤 클라이언트 연결:', socket.id)

  // 기본 데이터 전송
  socket.emit('characters', getCharactersInRoom(DEFAULT_ROOM_ID))
  socket.emit('rooms', Object.values(rooms))
  socket.emit('buildings', buildings)

  // 방 입장
  socket.on('join', (character) => {
    console.log('🔍 [join] Received join request:', { character, socketId: socket.id })
    const roomId = DEFAULT_ROOM_ID  // 기본 방으로 입장
    const room = getRoom(roomId)
    console.log('📝 [join] Joining room:', roomId)

    // Capacity 체크
    const currentCharacterCount = Object.keys(room.characters).length
    if (currentCharacterCount >= room.capacity) {
      console.log('⚠️ 방 정원 초과:', room.name, `(${currentCharacterCount}/${room.capacity})`)
      socket.emit('roomError', {
        type: 'capacity_exceeded',
        message: `방 ${room.name}은 정원(${room.capacity})에 도달했습니다.`,
       roomId,
        capacity: room.capacity
      })
      return
    }

    console.log('📝 캐릭터 등록:', character.name, '→', roomId)

    // 소켓에 캐릭터 정보 저장 (disconnect에서 사용)
    socket.characterId = character.id
    socket.character = character

    // 소켓을 방에 join (채팅 브로드캐스트 수신을 위해 필수)
    console.log('📡 [join] Socket joining room:', roomId, 'socketId:', socket.id)
    socket.join(roomId)
    console.log('✅ [join] Socket joined room:', roomId)

    // 방에 캐릭터 등록
    room.characters[character.id] = character
    characterRooms[character.id] = roomId
    console.log('🗂️ [join] characterRooms updated:', { [character.id]: roomId })

    // 퀘스트 시스템 초기화
    initializePlayerQuests(character.id)
    const playerQuests = getPlayerQuests(character.id)
    socket.emit('quests', playerQuests)

    // 이벤트 시스템 초기화
    try {
      initializeCharacter(character.id)
      const characterEvents = getCharacterEvents(character.id)
      const activeEvents = getActiveEvents()
      socket.emit('characterEvents', {
        characterId: character.id,
        events: characterEvents,
        active: activeEvents
      })
      console.log(`📊 캐릭터 이벤트 시스템 초기화: ${character.name}`)
    } catch (error) {
      console.error(`❌ 캐릭터 이벤트 시스템 초기화 실패: ${character.name}`, error)
    }

    // 방 내에 브로드캐스트
    io.to(roomId).emit('characterUpdate', character)

    // 해당 클라이언트에만 호감도 전송
    socket.emit('affinities', room.affinities)

    // 입장 알림 방송 (방 내 다른 유저들에게)
    io.to(roomId).emit('roomNotification', {
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

    console.log(`📍 방 ${roomId} 캐릭터 수:`, Object.keys(room.characters).length)
  })

  // 캐릭터 이동 (방 내에서만) - 애니메이션 지원
  socket.on('move', (character) => {
    const roomId = characterRooms[character.id]
    if (!roomId) {
      console.log('⚠️ 캐릭터 방을 찾을 수 없음:', character.id)
      return
    }

    const room = getRoom(roomId)
    if (!room.characters[character.id]) {
      console.log('⚠️ 캐릭터를 찾을 수 없음:', character.id)
      return
    }

    const oldCharacter = room.characters[character.id]
    const moveData = {
      characterId: character.id,
      characterName: character.name,
      from: { x: oldCharacter.x, y: oldCharacter.y },
      to: { x: character.x, y: character.y },
      direction: character.direction || determineDirection(oldCharacter, character),
      timestamp: Date.now()
    }

    console.log('🚶 캐릭터 이동:', character.name,
      `(${moveData.from.x}, ${moveData.from.y}) → (${moveData.to.x}, ${moveData.to.y})`,
      '방향:', moveData.direction, '→', roomId)

    // 방 내 캐릭터 업데이트 (메모리)
    room.characters[character.id] = character

    // 💾 DB에 위치 저장 (영구 저장) - CRITICAL FIX #1007
    try {
      updateCharacterPosition(character.id, character.x, character.y, roomId)
      console.log('💾 캐릭터 위치 저장 완료:', character.id, `(${character.x}, ${character.y})`)
    } catch (error) {
      console.error('❌ 캐릭터 위치 저장 실패:', error)
    }

    // 방 내에만 브로드캐스트 (애니메이션 데이터 포함)
    io.to(roomId).emit('characterUpdate', character, moveData)
  })

  // 방향 결정 헬퍼 함수
  function determineDirection(from, to) {
    const dx = to.x - from.x
    const dy = to.y - from.y
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left'
    } else {
      return dy > 0 ? 'down' : 'up'
    }
  }

  // 채팅 메시지 수신 (방 내에서만)
  socket.on('chatMessage', (data) => {
    const { message, characterId } = data
    console.log('🔍 [chatMessage] Received:', { characterId, message, socketId: socket.id })

    const roomId = characterRooms[characterId]

    if (!roomId) {
      console.log('⚠️ 캐릭터 방을 찾을 수 없음:', characterId, 'characterRooms:', Object.keys(characterRooms))
      return
    }

    const room = getRoom(roomId)
    const character = room.characters[characterId]

    if (!character) {
      console.log('⚠️ 캐릭터를 찾을 수 없음:', characterId)
      return
    }

    // 이모지 지원 - 이모지 코드를 변환 (예: :smile: → 😊)
    const emojiMap = {
      ':smile:': '😊',
      ':laugh:': '😂',
      ':heart:': '❤️',
      ':thumbsup:': '👍',
      ':thumbsdown:': '👎',
      ':fire:': '🔥',
      ':star:': '⭐',
      ':celebrate:': '🎉',
      ':sad:': '😢',
      ':angry:': '😠',
      ':love:': '😍',
      ':cool:': '😎',
      ':thinking:': '🤔',
      ':surprised:': '😲',
      ':sleeping:': '😴',
      ':poop:': '💩',
      ':ghost:': '👻',
      ':skull:': '💀',
      ':rocket:': '🚀',
      ':coffee:': '☕',
      ':pizza:': '🍕',
      ':burger:': '🍔',
      ':beer:': '🍺',
      ':wine:': '🍷'
    }

    let processedMessage = message
    for (const [code, emoji] of Object.entries(emojiMap)) {
      processedMessage = processedMessage.replace(new RegExp(code.replace(/:/g, '\\:'), 'g'), emoji)
    }

    const chatData = {
      characterId,
      characterName: character.name,
      message: processedMessage,
      originalMessage: message, // 원본 메시지 저장
      timestamp: Date.now(),
      roomId
    }

    console.log('💬 채팅 메시지:', character.name, ':', processedMessage, '→', roomId)

    // 채팅 히스토리에 저장
    room.chatHistory.push(chatData)
    if (room.chatHistory.length > MAX_CHAT_HISTORY) {
      room.chatHistory.shift()
    }

    // 방 내에만 브로드캐스트
    console.log('📡 [chatBroadcast] Emitting to room:', roomId, 'chatData:', chatData)
    io.to(roomId).emit('chatBroadcast', chatData)
    console.log('✅ [chatBroadcast] Emitted successfully')

    // 이벤트 시스템: 채팅 이벤트 처리
    handleEvent(characterId, 'chat', { roomName: room.name })
  })

  // 프라이빗 메시지 (DM) 수신
  socket.on('privateMessage', (data) => {
    const { message, characterId, targetCharacterId } = data

    if (!characterId || !targetCharacterId) {
      console.log('⚠️ 캐릭터 정보 누락 (privateMessage)')
      return
    }

    // 보내는 캐릭터 정보 확인
    const senderRoomId = characterRooms[characterId]
    const senderRoom = getRoom(senderRoomId)
    const sender = senderRoom.characters[characterId]

    if (!sender) {
      console.log('⚠️ 보내는 캐릭터를 찾을 수 없음:', characterId)
      return
    }

    // 받는 캐릭터 찾기 (모든 방 검색)
    let targetSocket = null
    let targetCharacter = null
    let targetRoomId = null

    for (const [rid, room] of Object.entries(rooms)) {
      const target = room.characters[targetCharacterId]
      if (target) {
        targetCharacter = target
        targetRoomId = rid
        // 해당 캐릭터의 소켓 찾기
        const sockets = io.sockets.adapter.rooms.get(rid)
        if (sockets) {
          for (const socketId of sockets) {
            const clientSocket = io.sockets.sockets.get(socketId)
            if (clientSocket && clientSocket.characterId === targetCharacterId) {
              targetSocket = clientSocket
              break
            }
          }
        }
        break
      }
    }

    if (!targetCharacter || !targetSocket) {
      console.log('⚠️ 받는 캐릭터를 찾을 수 없음:', targetCharacterId)
      socket.emit('privateMessageError', {
        type: 'target_not_found',
        message: '대상을 찾을 수 없습니다.'
      })
      return
    }

    const privateMessageData = {
      characterId,
      characterName: sender.name,
      targetCharacterId,
      targetCharacterName: targetCharacter.name,
      message,
      timestamp: Date.now()
    }

    console.log('📨 프라이빗 메시지:', sender.name, '→', targetCharacter.name, ':', message)

    // 양쪽 소켓에 전송
    socket.emit('privateMessage', privateMessageData)
    targetSocket.emit('privateMessage', privateMessageData)

    // 프라이빗 메시지 기록
    if (!privateMessages[characterId]) {
      privateMessages[characterId] = []
    }
    if (!privateMessages[targetCharacterId]) {
      privateMessages[targetCharacterId] = []
    }
    privateMessages[characterId].push(privateMessageData)
    privateMessages[targetCharacterId].push(privateMessageData)

    // 히스토리 제한 (최대 50개)
    if (privateMessages[characterId].length > 50) {
      privateMessages[characterId].shift()
    }
    if (privateMessages[targetCharacterId].length > 50) {
      privateMessages[targetCharacterId].shift()
    }
  })

  // 캐릭터 클릭 상호작용
  socket.on('interact', (data) => {
    const { targetCharacterId, sourceCharacterId } = data
    const roomId = characterRooms[sourceCharacterId]

    if (!roomId) {
      console.log('⚠️ 캐릭터 방을 찾을 수 없음:', sourceCharacterId)
      return
    }

    const room = getRoom(roomId)

    if (!room.affinities[targetCharacterId]) {
      room.affinities[targetCharacterId] = {}
    }

    room.affinities[targetCharacterId][sourceCharacterId] = (room.affinities[targetCharacterId][sourceCharacterId] || 0) + 5

    console.log(`💗 호감도: ${sourceCharacterId} → ${targetCharacterId} = ${room.affinities[targetCharacterId][sourceCharacterId]}`)

    io.to(roomId).emit('affinities', room.affinities)
  })

  // 캐릭터 상호작션 (방 내에서만)
  socket.on('characterInteraction', (data) => {
    const { fromCharacterId, toCharacterId, interactionType, timestamp } = data
    const roomId = characterRooms[fromCharacterId]

    if (!roomId) {
      console.log('⚠️ 캐릭터 방을 찾을 수 없음:', fromCharacterId)
      return
    }

    const room = getRoom(roomId)
    const fromCharacter = room.characters[fromCharacterId]
    const toCharacter = room.characters[toCharacterId]

    if (!fromCharacter || !toCharacter) {
      console.log('⚠️ 캐릭터를 찾을 수 없음:', fromCharacterId, toCharacterId)
      return
    }

    console.log('🤝 상호작션:',
      fromCharacter.name, '→', toCharacter.name,
      `(${interactionType})`, '→', roomId)

    // 호감도 업데이트
    if (!room.affinities[fromCharacterId]) {
      room.affinities[fromCharacterId] = {}
    }

    const currentAffinity = room.affinities[fromCharacterId][toCharacterId] || 0
    const affinityChange = AFFINITY_CHANGES[interactionType] || 0
    room.affinities[fromCharacterId][toCharacterId] = currentAffinity + affinityChange

    console.log(`💗 호감도: ${fromCharacter.name} → ${toCharacter.name} = ${room.affinities[fromCharacterId][toCharacterId]}`)

    // 퀘스트 진행 업데이트
    const updatedQuests = updateQuestProgress(fromCharacterId, 'interact', {
      targetCharacterId: toCharacterId,
      interactionType
    })

    if (updatedQuests.length > 0) {
      const playerQuests = getPlayerQuests(fromCharacterId)
      socket.emit('quests', playerQuests)
      
      updatedQuests.forEach(quest => {
        const progress = getQuestProgress(quest)
        socket.emit('questProgress', {
          questId: quest.id,
          progress,
          quest
        })
      })
    }

    // 방 내에만 브로드캐스트
    io.to(roomId).emit('characterInteractionBroadcast', {
      fromCharacterId,
      toCharacterId,
      fromCharacterName: fromCharacter.name,
      toCharacterName: toCharacter.name,
      interactionType,
      affinity: room.affinities[fromCharacterId][toCharacterId],
      timestamp: timestamp || Date.now()
    })

    // 이벤트 시스템: 상호작용 이벤트 처리
    handleEvent(fromCharacterId, 'interact', { interactionType, targetCharacterId: toCharacterId })
  })

  // 방 목록 요청
  socket.on('getRooms', () => {
    socket.emit('rooms', Object.values(rooms))
  })

  // 방 이동
  socket.on('changeRoom', (data) => {
    const { characterId, newRoomId } = data

    // 현재 방 찾기
    const currentRoomId = characterRooms[characterId]
    if (!currentRoomId) {
      console.log('⚠️ 캐릭터 방을 찾을 수 없음:', characterId)
      return
    }

    const currentRoom = getRoom(currentRoomId)
    const character = currentRoom.characters[characterId]

    if (!character) {
      console.log('⚠️ 캐릭터를 찾을 수 없음:', characterId)
      return
    }

    // 새 방 찾기 또는 생성
    let newRoom = getRoom(newRoomId)
    if (!newRoom) {
      // 새 방 생성
      newRoom = {
        id: newRoomId,
        name: `방 ${newRoomId}`,
        characters: {},
        chatHistory: [],
        affinities: {},
        capacity: DEFAULT_ROOM_CAPACITY
      }
      rooms[newRoomId] = newRoom
      console.log('🏠 새 방 생성:', newRoom.name)
    }

    // 새 방 capacity 체크
    const newRoomCharacterCount = Object.keys(newRoom.characters).length
    if (newRoomCharacterCount >= newRoom.capacity) {
      console.log('⚠️ 방 정원 초과:', newRoom.name, `(${newRoomCharacterCount}/${newRoom.capacity})`)
      socket.emit('roomError', {
        type: 'capacity_exceeded',
        message: `방 ${newRoom.name}은 정원(${newRoom.capacity})에 도달했습니다.`,
        roomId: newRoomId,
        capacity: newRoom.capacity
      })
      return
    }

    console.log('🚪 방 이동:', character.name, currentRoomId, '→', newRoomId)

    // 기존 방에서 캐릭터 제거
    delete currentRoom.characters[characterId]
    io.to(currentRoomId).emit('characterUpdate', {
      id: characterId,
      _removed: true
    })

    // 기존 방에서 퇴장 알림
    io.to(currentRoomId).emit('roomNotification', {
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

    // 새 방에 캐릭터 추가
    newRoom.characters[characterId] = character
    characterRooms[characterId] = newRoomId

    // 새 방에 입장
    io.to(newRoomId).emit('characterUpdate', character)
    socket.emit('characters', newRoom.characters)
    socket.emit('chatHistory', newRoom.chatHistory)
    socket.emit('affinities', newRoom.affinities)

    // 새 방에서 입장 알림
    io.to(newRoomId).emit('roomNotification', {
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

    // 방 목록 업데이트
    io.emit('rooms', Object.values(rooms))
  })

  // 건물 입장
  socket.on('enterBuilding', (data) => {
    const { buildingId, characterId } = data

    const building = buildings.find(b => b.id === buildingId)
    if (!building) {
      console.log('⚠️ 건물을 찾을 수 없음:', buildingId)
      return
    }

    const roomId = characterRooms[characterId]
    if (!roomId) {
      console.log('⚠️ 캐릭터 방을 찾을 수 없음:', characterId)
      return
    }

    const room = getRoom(roomId)
    const character = room.characters[characterId]

    if (!character) {
      console.log('⚠️ 캐릭터를 찾을 수 없음:', characterId)
      return
    }

    const enterTime = Date.now()

    activeBuildingVisits[characterId] = {
      buildingId: building.id,
      buildingName: building.name,
      characterId: character.id,
      characterName: character.name,
      enterTime: enterTime
    }

    console.log('🏢 건물 입장:', character.name, '→', building.name)

    // 퀘스트 진행 업데이트
    const updatedQuests = updateQuestProgress(characterId, 'enterBuilding', {
      buildingId: building.id,
      characterId
    })

    if (updatedQuests.length > 0) {
      const playerQuests = getPlayerQuests(characterId)
      socket.emit('quests', playerQuests)
      
      updatedQuests.forEach(quest => {
        const progress = getQuestProgress(quest)
        socket.emit('questProgress', {
          questId: quest.id,
          progress,
          quest
        })
      })
    }

    // 건물 입장 이벤트 브로드캐스트
    io.to(roomId).emit('buildingEvent', {
      type: 'enter',
      buildingId: building.id,
      buildingName: building.name,
      characterId: character.id,
      characterName: character.name,
      enterTime
    })

    // 이벤트 시스템: 건물 방문 이벤트 처리
    handleEvent(characterId, 'visit_building', { buildingId, buildingName: building.name })
  })

  // 건물 퇴장
  socket.on('exitBuilding', (data) => {
    const { buildingId, characterId } = data

    const activeVisit = activeBuildingVisits[characterId]
    if (!activeVisit) {
      console.log('⚠️ 활성 건물 방문 기록 없음:', characterId)
      return
    }

    if (activeVisit.buildingId !== buildingId) {
      console.log('⚠️ 건물 ID 불일치:', activeVisit.buildingId, buildingId)
      return
    }

    const exitTime = Date.now()
    const dwellTime = exitTime - activeVisit.enterTime

    // 이벤트 기록
    const event = {
      type: 'exit',
      buildingId: activeVisit.buildingId,
      buildingName: activeVisit.buildingName,
      characterId: activeVisit.characterId,
      characterName: activeVisit.characterName,
      enterTime: activeVisit.enterTime,
      exitTime: exitTime,
      dwellTime: dwellTime
    }

    if (!eventLogs[characterId]) {
      eventLogs[characterId] = []
    }
    eventLogs[characterId].push(event)

    // 퀘스트 진행 업데이트 (duration 타입)
    const updatedQuests = updateQuestProgress(characterId, 'buildingStay', {
      buildingId: activeVisit.buildingId,
      duration: dwellTime
    })

    if (updatedQuests.length > 0) {
      const playerQuests = getPlayerQuests(characterId)
      socket.emit('quests', playerQuests)
      
      updatedQuests.forEach(quest => {
        const progress = getQuestProgress(quest)
        socket.emit('questProgress', {
          questId: quest.id,
          progress,
          quest
        })
      })
    }

    // 활성 방문 기록 삭제
    delete activeBuildingVisits[characterId]

    const roomId = characterRooms[characterId]
    
    console.log('🏢 건물 퇴장:', activeVisit.characterName, '←', activeVisit.buildingName, `(체류시간: ${dwellTime}ms)`)

    // 건물 퇴장 이벤트 브로드캐스트
    if (roomId) {
      io.to(roomId).emit('buildingEvent', event)
    }
  })

  // 건물 목록 요청
  socket.on('getBuildings', () => {
    socket.emit('buildings', buildings)
  })

  // 이벤트 로그 요청
  socket.on('getEventLog', (data) => {
    const { characterId } = data
    const logs = eventLogs[characterId] || []
    socket.emit('eventLog', logs)
  })

  // 보상 청구
  socket.on('claimReward', (data) => {
    const { characterId, rewardId } = data

    if (!REWARDS[rewardId]) {
      console.log('⚠️ 존재하지 않는 보상:', rewardId)
      return
    }

    const reward = REWARDS[rewardId]

    // 인벤토리에 아이템 추가
    reward.items.forEach(itemData => {
      addItem(characterId, itemData.id, itemData.quantity)
    })

    const inventory = getInventory(characterId)

    console.log('🎉 보상 지급:', reward.name, '→', characterId)

    // 보상 지급 브로드캐스트
    socket.emit('rewardClaimed', {
      rewardId,
      rewardName: reward.name,
      points: reward.points,
      experience: reward.experience,
      items: reward.items,
      inventory
    })
  })

  // 아이템 사용
  socket.on('useItem', (data) => {
    const { characterId, itemId } = data

    if (!ITEMS[itemId]) {
      console.log('⚠️ 존재하지 않는 아이템:', itemId)
      return
    }

    const item = ITEMS[itemId]

    if (!removeItem(characterId, itemId, 1)) {
      console.log('⚠️ 아이템 사용 실패:', itemId, '→', characterId)
      socket.emit('itemUseFailed', {
        itemId,
        reason: 'insufficient_quantity'
      })
      return
    }

    const inventory = getInventory(characterId)

    console.log('💊 아이템 사용:', item.name, '→', characterId)

    // 아이템 사용 브로드캐스트
    socket.emit('itemUsed', {
      itemId,
      itemName: item.name,
      effect: item.effect,
      inventory
    })
  })

  // 인벤토리 요청
  socket.on('getInventory', (data) => {
    const { characterId } = data
    const inventory = getInventory(characterId)
    socket.emit('inventory', {
      characterId,
      inventory
    })
  })

  // 퀘스트 목록 요청
  socket.on('getQuests', (data) => {
    const { characterId } = data
    const playerQuests = getPlayerQuests(characterId)
    const availableQuests = getPlayerAvailableQuests(characterId)
    socket.emit('quests', {
      active: playerQuests,
      available: availableQuests
    })
  })

  // 퀘스트 수락
  socket.on('acceptQuest', (data) => {
    const { characterId, questId } = data
    const result = assignQuestToPlayer(characterId, questId)
    
    if (result.success) {
      const playerQuests = getPlayerQuests(characterId)
      socket.emit('quests', playerQuests)
      socket.emit('questAccepted', {
        questId,
        quest: result.quest
      })
      
      console.log(`📋 퀘스트 수락: ${result.quest.title} → ${characterId}`)
    } else {
      socket.emit('questAcceptFailed', {
        questId,
        error: result.error
      })
    }
  })

  // 퀘스트 완료 보상 수령
  socket.on('claimQuestReward', (data) => {
    const { characterId, questId } = data
    const completionResult = completeQuest(characterId, questId)

    if (completionResult.success) {
      const reward = getQuestReward(questId)

      // 아이템 지급
      if (reward && reward.items) {
        reward.items.forEach(itemData => {
          addItem(characterId, itemData.id, itemData.quantity)
        })
      }

      const inventory = getInventory(characterId)
      const playerQuests = getPlayerQuests(characterId)

      socket.emit('quests', playerQuests)
      socket.emit('questRewardClaimed', {
        questId,
        reward,
        inventory
      })

      // 이벤트 시스템: 퀘스트 완료 이벤트 처리
      handleEvent(characterId, 'complete_quest', { questId, difficulty: questId.includes('master') ? 'legendary' : 'normal' })

      console.log(`🎉 퀘스트 완료 보상 지급: ${questId} → ${characterId}`)
    } else {
      socket.emit('questRewardClaimFailed', {
        questId,
        error: completionResult.error
      })
    }
  })

  // 이벤트 시스템: 활성 이벤트 목록 요청
  socket.on('getActiveEvents', (data) => {
    const activeEvents = getActiveEvents()
    const systemStatus = getEventSystemStatus()
    socket.emit('activeEvents', {
      events: activeEvents,
      systemStatus
    })
  })

  // 이벤트 시스템: 캐릭터 이벤트 목록 요청
  socket.on('getCharacterEvents', (data) => {
    const { characterId } = data
    const characterEvents = getCharacterEvents(characterId)
    const activeEvents = getActiveEvents()
    socket.emit('characterEvents', {
      characterId,
      events: characterEvents,
      active: activeEvents
    })
  })

  // 이벤트 시스템: 이벤트 리워드 수령
  socket.on('claimEventReward', (data) => {
    const { characterId, eventType, eventId } = data
    const result = claimReward(characterId, eventType, eventId)

    if (result.success) {
      // 리워드 지급
      if (result.rewards) {
        result.rewards.forEach(reward => {
          if (reward.items) {
            reward.items.forEach(itemData => {
              addItem(characterId, itemData.id, itemData.quantity)
            })
          }
          if (reward.experience) {
            // 경험치 지급 로직 (player 데이터 업데이트 필요)
          }
          if (reward.coins) {
            // 코인 지급 로직 (player 데이터 업데이트 필요)
          }
        })
      }

      const inventory = getInventory(characterId)
      const characterEvents = getCharacterEvents(characterId)

      socket.emit('eventRewardClaimed', {
        eventType,
        eventId,
        reward: result.reward,
        inventory,
        events: characterEvents
      })

      console.log(`🎉 이벤트 리워드 수령: ${eventType}/${eventId} → ${characterId}`)
    } else {
      socket.emit('eventRewardClaimFailed', {
        eventType,
        eventId,
        error: result.message
      })
    }
  })

  // ===== Phase 12: 캐릭터 시스템 고급화 이벤트 핸들러 =====

  // 진화 시스템: 진화 가능 여부 확인
  socket.on('canEvolve', (data) => {
    const { characterId } = data
    const character = characterRooms[characterId] ? rooms[characterRooms[characterId]].characters[characterId] : null
    const result = evolutionManager.canEvolve(character)
    socket.emit('canEvolveResult', result)
  })

  // 진화 시스템: 진화 수행
  socket.on('evolve', (data) => {
    const { characterId, style } = data
    const roomId = characterRooms[characterId]
    if (!roomId) return

    const character = rooms[roomId].characters[characterId]
    const result = evolutionManager.evolve(character, style)
    socket.emit('evolveResult', result)

    if (result.success) {
      io.to(roomId).emit('characterUpdate', character)
      console.log(`🌟 진화 완료: ${character.name} → ${result.stageInfo.name}`)
    }
  })

  // 진화 시스템: 스타일 변경
  socket.on('changeEvolutionStyle', (data) => {
    const { characterId, style } = data
    const roomId = characterRooms[characterId]
    if (!roomId) return

    const character = rooms[roomId].characters[characterId]
    const result = evolutionManager.changeStyle(character, style)
    socket.emit('changeEvolutionStyleResult', result)

    if (result.success) {
      io.to(roomId).emit('characterUpdate', character)
    }
  })

  // 진화 시스템: 렌더링 정보 가져오기
  socket.on('getEvolutionRenderInfo', (data) => {
    const { characterId } = data
    const character = characterRooms[characterId] ? rooms[characterRooms[characterId]].characters[characterId] : null
    const renderInfo = evolutionManager.getRenderInfo(character)
    socket.emit('evolutionRenderInfo', renderInfo)
  })

  // 진화 시스템: 진화 이력 가져오기
  socket.on('getEvolutionHistory', (data) => {
    const { characterId } = data
    const character = characterRooms[characterId] ? rooms[characterRooms[characterId]].characters[characterId] : null
    const history = evolutionManager.getEvolutionHistory(character)
    socket.emit('evolutionHistory', history)
  })

  // 스킬 시스템: 학습 가능한 스킬 목록
  socket.on('getLearnableSkills', (data) => {
    const { characterId } = data
    const character = characterRooms[characterId] ? rooms[characterRooms[characterId]].characters[characterId] : null
    const learnableSkills = skillManager.getLearnableSkills(character)
    socket.emit('learnableSkills', learnableSkills)
  })

  // 스킬 시스템: 장착된 스킬 목록 (🔴 NEW)
  socket.on('getEquippedSkills', (data) => {
    const { characterId } = data
    const character = characterRooms[characterId] ? rooms[characterRooms[characterId]].characters[characterId] : null
    const summary = skillManager.getSkillSummary(character)
    socket.emit('equippedSkills', summary.equippedActive || [])
  })

  // 스킬 시스템: 학습한 스킬 목록 (🔴 NEW)
  socket.on('getLearnedSkills', (data) => {
    const { characterId } = data
    const character = characterRooms[characterId] ? rooms[characterRooms[characterId]].characters[characterId] : null
    const summary = skillManager.getSkillSummary(character)
    const learnedSkillIds = character?.skills?.skills || []
    const learnedSkillsData = learnedSkillIds.map(skillId => skillManager.getSkill(skillId)).filter(Boolean)
    socket.emit('learnedSkills', {
      skills: learnedSkillsData,
      skillLevels: summary.skillLevels || {},
      skillExp: summary.skillExp || {}
    })
  })

  // 스킬 시스템: 스킬 학습
  socket.on('learnSkill', (data) => {
    const { characterId, skillId } = data
    const roomId = characterRooms[characterId]
    if (!roomId) return

    const character = rooms[roomId].characters[characterId]
    const result = skillManager.learnSkill(character, skillId)
    socket.emit('learnSkillResult', result)

    if (result.success) {
      console.log(`📚 스킬 학습: ${character.name} → ${result.skill.name}`)
    }
  })

  // 스킬 시스템: 스킬 장착
  socket.on('equipSkill', (data) => {
    const { characterId, skillId } = data
    const roomId = characterRooms[characterId]
    if (!roomId) return

    const character = rooms[roomId].characters[characterId]
    const result = skillManager.equipSkill(character, skillId)
    socket.emit('equipSkillResult', result)
  })

  // 스킬 시스템: 스킬 해제
  socket.on('unequipSkill', (data) => {
    const { characterId, skillId } = data
    const roomId = characterRooms[characterId]
    if (!roomId) return

    const character = rooms[roomId].characters[characterId]
    const result = skillManager.unequipSkill(character, skillId)
    socket.emit('unequipSkillResult', result)
  })

  // 스킬 시스템: 스킬 사용
  socket.on('useSkill', (data) => {
    const { characterId, skillId, target } = data
    const roomId = characterRooms[characterId]
    if (!roomId) return

    const character = rooms[roomId].characters[characterId]
    const result = skillManager.useSkill(character, skillId, target)
    socket.emit('useSkillResult', result)

    if (result.success) {
      // 방 전체에 스킬 사용 효과 브로드캐스트
      io.to(roomId).emit('skillEffect', {
        characterId,
        skillId,
        effects: result.effects
      })
    }
  })

  // 스킬 시스템: 스킬 요약 정보
  socket.on('getSkillSummary', (data) => {
    const { characterId } = data
    const character = characterRooms[characterId] ? rooms[characterRooms[characterId]].characters[characterId] : null
    const summary = skillManager.getSkillSummary(character)
    socket.emit('skillSummary', summary)
  })

  // 장비 시스템: 장비 장착
  socket.on('equipItem', (data) => {
    const { characterId, itemId } = data
    const equipment = getCharacterEquipment(characterId)
    const result = equipment.equipItem(itemId)
    socket.emit('equipItemResult', result)

    if (result.success) {
      console.log(`🔧 장비 장착: ${result.message}`)
    }
  })

  // 장비 시스템: 장비 해제
  socket.on('unequipItem', (data) => {
    const { characterId, slotType } = data
    const equipment = getCharacterEquipment(characterId)
    const result = equipment.unequipSlot(slotType)
    socket.emit('unequipItemResult', result)
  })

  // 장비 시스템: 장비 강화
  socket.on('enhanceEquipment', (data) => {
    const { characterId, itemId } = data
    const equipment = getCharacterEquipment(characterId)
    const result = equipment.enhanceEquipment(itemId)
    socket.emit('enhanceEquipmentResult', result)

    if (result.success) {
      console.log(`⬆️ 장비 강화: ${result.message}`)
    }
  })

  // 장비 시스템: 장착된 장비 확인
  socket.on('getEquippedItems', (data) => {
    const { characterId } = data
    const equipment = getCharacterEquipment(characterId)
    socket.emit('equippedItems', equipment.equippedSlots)
  })

  // 장비 시스템: 총 스탯 계산
  socket.on('getEquipmentStats', (data) => {
    const { characterId } = data
    const equipment = getCharacterEquipment(characterId)
    const totalStats = equipment.getTotalStats()
    socket.emit('equipmentStats', totalStats)
  })

  // 장비 시스템: 인벤토리에 장비 추가
  socket.on('addToEquipmentInventory', (data) => {
    const { characterId, equipment } = data
    const equipSystem = getCharacterEquipment(characterId)
    const result = equipSystem.addToInventory(equipment)
    socket.emit('addToEquipmentInventoryResult', result)
  })

  // 장비 시스템: 인벤토리 목록
  socket.on('getEquipmentInventory', (data) => {
    const { characterId } = data
    const equipment = getCharacterEquipment(characterId)
    socket.emit('equipmentInventory', equipment.getInventory())
  })

  // 장비 시스템: 인벤토리에서 장비 제거
  socket.on('removeFromEquipmentInventory', (data) => {
    const { characterId, itemId } = data
    const equipment = getCharacterEquipment(characterId)
    const result = equipment.removeFromInventory(itemId)
    socket.emit('removeFromEquipmentInventoryResult', result)
  })

  // ===== Phase 12 종료 =====

  // ===== Phase 13: 제작 시스템 이벤트 핸들러 =====

  // 레시피 목록 조회 (레벨 필터링)
  socket.on('getRecipes', async (data, callback) => {
    try {
      const { level, category } = data || {};
      let recipes;

      if (category) {
        recipes = await recipeManager.getRecipesByCategory(category);
      } else {
        recipes = await recipeManager.getRecipesByLevel(level || 1);
      }

      callback?.({ success: true, recipes });
    } catch (error) {
      console.error('레시피 목록 조회 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 제작 레벨 조회
  socket.on('getCraftingLevel', async (data, callback) => {
    try {
      const { characterId } = data || {};
      if (!characterId) {
        return callback?.({ success: false, error: 'characterId is required' });
      }

      const levelData = await craftingManager.getCraftingLevel(characterId);
      callback?.({ success: true, levelData });
    } catch (error) {
      console.error('제작 레벨 조회 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 제작 수행
  socket.on('craft', async (data, callback) => {
    try {
      const { characterId, recipeId, inventory } = data || {};

      if (!characterId || !recipeId) {
        return callback?.({ success: false, error: 'characterId and recipeId are required' });
      }

      // 인벤토리를 Map으로 변환
      const inventoryMap = new Map(
        inventory?.map(item => [item.itemId, item.quantity]) || []
      );

      // 제작 수행
      const result = await craftingManager.craft(recipeId, characterId, inventoryMap);

      // 인벤토리 상태 업데이트 (socket에 알림)
      if (result.success) {
        // 성공 시 결과 아이템 추가
        socket.emit('inventoryUpdate', {
          characterId,
          added: [result.result],
          removed: result.consumedMaterials
        });
      }

      callback?.({ success: true, result });
    } catch (error) {
      console.error('제작 수행 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 제작 기록 조회
  socket.on('getCraftingHistory', async (data, callback) => {
    try {
      const { characterId, limit } = data || {};
      if (!characterId) {
        return callback?.({ success: false, error: 'characterId is required' });
      }

      const history = await craftingManager.getCraftingHistory(characterId, limit || 10);
      callback?.({ success: true, history });
    } catch (error) {
      console.error('제작 기록 조회 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 제작대 목록 조회
  socket.on('getCraftingTables', async (data, callback) => {
    try {
      const { location, level } = data || {};
      let tables;

      if (location) {
        tables = await craftingTable.getTablesByLocation(location);
      } else if (level) {
        tables = await craftingTable.getTablesByLevel(level);
      } else {
        tables = await craftingTable.getAllTables();
      }

      callback?.({ success: true, tables });
    } catch (error) {
      console.error('제작대 목록 조회 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // ===== Phase 13 종료 =====

  // ===== 커스터마이징 확장 시스템 =====

  // 사용 가능한 옵션 조회 (레벨 기반 필터링)
  socket.on('getCustomizationOptions', (data, callback) => {
    const { characterId, category } = data || {};
    const character = characterRooms[characterId]
      ? rooms[characterRooms[characterId]].characters[characterId]
      : null;

    if (!character) {
      return callback?.({ success: false, error: 'Character not found' });
    }

    const level = character.level || 1;
    const availableOptions = customizationExtensionSystem.getAvailableOptions(level, category);
    callback?.({ success: true, options: availableOptions });
  });

  // 프리셋 목록 조회
  socket.on('getCustomizationPresets', (data, callback) => {
    const { characterId } = data || {};
    if (!characterId) {
      return callback?.({ success: false, error: 'characterId is required' });
    }

    const presets = customizationExtensionSystem.getPresets(characterId);
    callback?.({ success: true, presets });
  });

  // 프리셋 저장
  socket.on('saveCustomizationPreset', (data, callback) => {
    const { characterId, presetName, customization } = data || {};
    if (!characterId || !presetName || !customization) {
      return callback?.({ success: false, error: 'Missing required parameters' });
    }

    const result = customizationExtensionSystem.savePreset(characterId, presetName, customization);
    callback?.(result);
  });

  // 프리셋 삭제
  socket.on('deleteCustomizationPreset', (data, callback) => {
    const { presetId } = data || {};
    if (!presetId) {
      return callback?.({ success: false, error: 'presetId is required' });
    }

    const result = customizationExtensionSystem.deletePreset(presetId);
    callback?.(result);
  });

  // 커스터마이징 히스토리 조회
  socket.on('getCustomizationHistory', (data, callback) => {
    const { characterId, limit } = data || {};
    if (!characterId) {
      return callback?.({ success: false, error: 'characterId is required' });
    }

    const history = customizationExtensionSystem.getHistory(characterId, limit || 10);
    callback?.({ success: true, history });
  });

  // ===== 커스터마이징 확장 시스템 종료 =====

  // ===== Phase 14: 친구 시스템 =====

  // 친구 목록 조회
  socket.on('getFriendList', async (data, callback) => {
    try {
      const { characterId } = data || {};
      if (!characterId) {
        return callback?.({ success: false, error: 'characterId is required' });
      }

      const friendList = await friendManager.getFriendList(characterId);
      callback?.({ success: true, friendList });
    } catch (error) {
      console.error('친구 목록 조회 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 친구 추가
  socket.on('addFriend', async (data, callback) => {
    try {
      const { characterId, friendId, friendName } = data || {};
      if (!characterId || !friendId) {
        return callback?.({ success: false, error: 'characterId and friendId are required' });
      }

      const result = await friendManager.addFriend(characterId, friendId, friendName || 'Unknown');
      callback?.(result);
    } catch (error) {
      console.error('친구 추가 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 친구 삭제
  socket.on('removeFriend', async (data, callback) => {
    try {
      const { characterId, friendId } = data || {};
      if (!characterId || !friendId) {
        return callback?.({ success: false, error: 'characterId and friendId are required' });
      }

      const result = await friendManager.removeFriend(characterId, friendId);
      callback?.(result);
    } catch (error) {
      console.error('친구 삭제 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 친구 검색
  socket.on('searchFriends', async (data, callback) => {
    try {
      const { characterId, query } = data || {};
      if (!characterId || !query) {
        return callback?.({ success: false, error: 'characterId and query are required' });
      }

      const results = await friendManager.searchFriends(characterId, query);
      callback?.({ success: true, results });
    } catch (error) {
      console.error('친구 검색 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 친구 수 조회
  socket.on('getFriendCount', async (data, callback) => {
    try {
      const { characterId } = data || {};
      if (!characterId) {
        return callback?.({ success: false, error: 'characterId is required' });
      }

      const count = await friendManager.getFriendCount(characterId);
      callback?.({ success: true, count });
    } catch (error) {
      console.error('친구 수 조회 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 친구 요청 전송
  socket.on('sendFriendRequest', async (data, callback) => {
    try {
      const { fromId, fromName, toId, toName } = data || {};
      if (!fromId || !toId) {
        return callback?.({ success: false, error: 'fromId and toId are required' });
      }

      const characterName = fromName || 'Unknown';
      const targetName = toName || 'Unknown';

      const result = await friendRequestManager.sendRequest(fromId, characterName, toId, targetName);

      // 수신자에게 알림
      if (result.success) {
        const toRoomId = characterRooms[toId];
        if (toRoomId) {
          io.to(toRoomId).emit('friendRequestReceived', {
            request: result.request,
            pendingCount: await friendRequestManager.getPendingRequestCount(toId)
          });
        }
      }

      callback?.(result);
    } catch (error) {
      console.error('친구 요청 전송 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 수신한 친구 요청 목록
  socket.on('getReceivedRequests', async (data, callback) => {
    try {
      const { characterId } = data || {};
      if (!characterId) {
        return callback?.({ success: false, error: 'characterId is required' });
      }

      const requests = await friendRequestManager.getReceivedRequests(characterId);
      callback?.({ success: true, requests });
    } catch (error) {
      console.error('수신 요청 조회 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 보낸 친구 요청 목록
  socket.on('getSentRequests', async (data, callback) => {
    try {
      const { characterId } = data || {};
      if (!characterId) {
        return callback?.({ success: false, error: 'characterId is required' });
      }

      const requests = await friendRequestManager.getSentRequests(characterId);
      callback?.({ success: true, requests });
    } catch (error) {
      console.error('발신 요청 조회 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 친구 요청 수락
  socket.on('acceptFriendRequest', async (data, callback) => {
    try {
      const { fromId, toId } = data || {};
      if (!fromId || !toId) {
        return callback?.({ success: false, error: 'fromId and toId are required' });
      }

      // 요청 수락
      const result = await friendRequestManager.acceptRequest(fromId, toId);

      // 수락된 경우, 양쪽에 친구 추가
      if (result.success) {
        const request = result.request;
        await friendManager.addFriend(toId, fromId, request.from.name);
        await friendManager.addFriend(fromId, toId, request.to.name);

        // 양쪽에게 알림
        const toRoomId = characterRooms[toId];
        const fromRoomId = characterRooms[fromId];

        if (toRoomId) {
          const toFriendList = await friendManager.getFriendList(toId);
          io.to(toRoomId).emit('friendRequestAccepted', {
            request,
            friendList: toFriendList
          });
        }

        if (fromRoomId) {
          const fromFriendList = await friendManager.getFriendList(fromId);
          io.to(fromRoomId).emit('friendRequestAccepted', {
            request,
            friendList: fromFriendList
          });
        }
      }

      callback?.(result);
    } catch (error) {
      console.error('친구 요청 수락 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 친구 요청 거절
  socket.on('rejectFriendRequest', async (data, callback) => {
    try {
      const { fromId, toId } = data || {};
      if (!fromId || !toId) {
        return callback?.({ success: false, error: 'fromId and toId are required' });
      }

      const result = await friendRequestManager.rejectRequest(fromId, toId);

      // 송신자에게 알림
      if (result.success) {
        const fromRoomId = characterRooms[fromId];
        if (fromRoomId) {
          io.to(fromRoomId).emit('friendRequestRejected', {
            request: result.request
          });
        }
      }

      callback?.(result);
    } catch (error) {
      console.error('친구 요청 거절 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // 대기 중인 요청 수
  socket.on('getPendingRequestCount', async (data, callback) => {
    try {
      const { characterId } = data || {};
      if (!characterId) {
        return callback?.({ success: false, error: 'characterId is required' });
      }

      const count = await friendRequestManager.getPendingRequestCount(characterId);
      callback?.({ success: true, count });
    } catch (error) {
      console.error('대기 요청 수 조회 에러:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // ===== Phase 14 종료 =====
  // 연결 종료
  socket.on('disconnect', () => {
    console.log('❌ 클라이언트 연결 종료:', socket.id)

    // 플레이어 캐릭터 삭제 (AI 캐릭터는 유지)
    Object.keys(rooms).forEach(roomId => {
      const room = rooms[roomId]
      const character = room.characters[socket.id]

      if (character && !character.isAi) {
        delete room.characters[socket.id]
        delete characterRooms[socket.id]

        // 퇴장 알림 방송
        io.to(roomId).emit('roomNotification', {
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

        io.to(roomId).emit('characterUpdate', {
          id: socket.id,
          _removed: true
        })

        console.log(`📍 방 ${roomId}에서 플레이어 제거:`, character.name)
      }
    })
  })
})

const PORT = 4000
httpServer.listen(PORT, '0.0.0.0', () => {  // 0.0.0.0으로 외부 접속 허용
  console.log('🚀 서버 실행 중: http://0.0.0.0:' + PORT)
  console.log('🌐 외부 접속: http://10.76.29.91:' + PORT)
  console.log('🏠 기본 방:', rooms[DEFAULT_ROOM_ID].name, `(${DEFAULT_ROOM_ID})`)
  console.log('✅ AI 캐릭터 1:', aiCharacter1.name, `→ ${DEFAULT_ROOM_ID} (${aiCharacter1.x}, ${aiCharacter1.y})`)
  console.log('✅ AI 캐릭터 2:', aiCharacter2.name, `→ ${DEFAULT_ROOM_ID} (${aiCharacter2.x}, ${aiCharacter2.y})`)

  // 데이터베이스 초기화
  try {
    initDatabase()
    initCharacterTable()
    console.log('🗄️  데이터베이스 초기화 완료')
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error)
  }

  // 이벤트 시스템 초기화 (임시 비활성화)
  // try {
  //   const eventSystemInitialized = initializeEventSystem()
  //   console.log('🎪 이벤트 시스템 ' + (eventSystemInitialized ? '초기화 완료' : '초기화 실패'))
  //   // AI 캐릭터 이벤트 시스템 초기화
  //   initializeCharacter(aiCharacter1.id)
  //   initializeCharacter(aiCharacter2.id)
  //   console.log('📊 AI 캐릭터 이벤트 시스템 초기화 완료')
  // } catch (error) {
  //   console.error('❌ 이벤트 시스템 초기화 실패:', error)
  // }
})

export { ITEMS, REWARDS }