import express from 'express'
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

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  // 연결 안정화 설정
  pingTimeout: 30000,      // 30초 타임아웃
  pingInterval: 10000,     // 10초마다 핑
  upgradeTimeout: 30000,   // 업그레이드 타임아웃
  maxHttpBufferSize: 1e6   // 1MB 버퍼
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
const rooms = {}  // { roomId: { id, name, characters: {}, chatHistory: [], affinities: {} } }
const DEFAULT_ROOM_ID = 'main'

// 기본 방 생성
rooms[DEFAULT_ROOM_ID] = {
  id: DEFAULT_ROOM_ID,
  name: '메인 광장',
  characters: {},
  chatHistory: [],
  affinities: {}
}

// 캐릭터-방 매핑: { characterId: roomId }
const characterRooms = {}

// 채팅 히스토리 최대 개수
const MAX_CHAT_HISTORY = 30

// 상호작션에 따른 호감도 변화
const AFFINITY_CHANGES = {
  greet: 1,
  gift: 10,
  befriend: 5,
  fight: -10
}

// AI 캐릭터 초기화 (기본 방)
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
characterRooms[aiCharacter.id] = DEFAULT_ROOM_ID

console.log('✅ AI 캐릭터 초기화:', aiCharacter.name, '→', DEFAULT_ROOM_ID)

app.use(express.json())

app.get('/api/events/:characterId', (req, res) => {
  const { characterId } = req.params
  const logs = eventLogs[characterId] || []
  res.json({ logs })
})

app.get('/api/buildings', (req, res) => {
  res.json({ buildings })
})

// 방 유틸리티 함수
function getRoom(roomId) {
  return rooms[roomId] || rooms[DEFAULT_ROOM_ID]
}

function getCharactersInRoom(roomId) {
  return getRoom(roomId).characters
}

// Socket.io 연결
io.on('connection', (socket) => {
  console.log('👤 클라이언트 연결:', socket.id)

  // 기본 데이터 전송
  socket.emit('characters', getCharactersInRoom(DEFAULT_ROOM_ID))
  socket.emit('rooms', Object.values(rooms))
  socket.emit('buildings', buildings)

  // 방 입장
  socket.on('join', (character) => {
    const roomId = DEFAULT_ROOM_ID  // 기본 방으로 입장
    const room = getRoom(roomId)

    console.log('📝 캐릭터 등록:', character.name, '→', roomId)

    // 소켓에 캐릭터 정보 저장 (disconnect에서 사용)
    socket.characterId = character.id
    socket.character = character

    // 방에 캐릭터 등록
    room.characters[character.id] = character
    characterRooms[character.id] = roomId

    // 퀘스트 시스템 초기화
    initializePlayerQuests(character.id)
    const playerQuests = getPlayerQuests(character.id)
    socket.emit('quests', playerQuests)

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

  // 캐릭터 이동 (방 내에서만)
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

    console.log('🚶 캐릭터 이동:', character.name, `(${character.x}, ${character.y})`, '→', roomId)

    // 방 내 캐릭터 업데이트
    room.characters[character.id] = character

    // 방 내에만 브로드캐스트
    io.to(roomId).emit('characterUpdate', character)
  })

  // 채팅 메시지 수신 (방 내에서만)
  socket.on('chatMessage', (data) => {
    const { message, characterId } = data
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

    const chatData = {
      characterId,
      characterName: character.name,
      message,
      timestamp: Date.now(),
      roomId
    }

    console.log('💬 채팅 메시지:', character.name, ':', message, '→', roomId)

    // 채팅 히스토리에 저장
    room.chatHistory.push(chatData)
    if (room.chatHistory.length > MAX_CHAT_HISTORY) {
      room.chatHistory.shift()
    }

    // 방 내에만 브로드캐스트
    io.to(roomId).emit('chatBroadcast', chatData)
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
        affinities: {}
      }
      rooms[newRoomId] = newRoom
      console.log('🏠 새 방 생성:', newRoom.name)
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
      
      console.log(`🎉 퀘스트 완료 보상 지급: ${questId} → ${characterId}`)
    } else {
      socket.emit('questRewardClaimFailed', {
        questId,
        error: completionResult.error
      })
    }
  })

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
  console.log('✅ AI 캐릭터:', aiCharacter.name, `→ ${DEFAULT_ROOM_ID}`)
  console.log('📍 AI 캐릭터 위치:', `(${aiCharacter.x}, ${aiCharacter.y})`)
})

export { ITEMS, REWARDS }