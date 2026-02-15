import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

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

// 캐릭터 저장소
const characters = {}

// 채팅 히스토리 (최근 30개 메시지)
const chatHistory = []
const MAX_CHAT_HISTORY = 30

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

characters[aiCharacter.id] = aiCharacter

console.log('✅ AI 캐릭터 초기화:', aiCharacter.name)

// Socket.io 연결
io.on('connection', (socket) => {
  console.log('👤 클라이언트 연결:', socket.id)

  // 기존 캐릭터들 전송
  socket.emit('characters', characters)

  // 채팅 히스토리 전송
  socket.emit('chatHistory', chatHistory)

  // 새 캐릭터 등록
  socket.on('join', (character) => {
    console.log('📝 캐릭터 등록:', character.name)
    characters[character.id] = character
    io.emit('characterUpdate', character)
  })

  // 캐릭터 이동
  socket.on('move', (character) => {
    console.log('🚶 캐릭터 이동:', character.name, `(${character.x}, ${character.y})`)
    characters[character.id] = character
    io.emit('characterUpdate', character)
  })

  // 채팅 메시지 수신
  socket.on('chatMessage', (data) => {
    const { message, characterId } = data
    const character = characters[characterId]

    if (!character) {
      console.log('⚠️ 캐릭터를 찾을 수 없음:', characterId)
      return
    }

    const chatData = {
      characterId,
      characterName: character.name,
      message,
      timestamp: Date.now()
    }

    console.log('💬 채팅 메시지:', character.name,(':', message))

    // 채팅 히스토리에 저장
    chatHistory.push(chatData)
    if (chatHistory.length > MAX_CHAT_HISTORY) {
      chatHistory.shift()
    }

    // 모든 클라이언트에 브로드캐스트
    io.emit('chatBroadcast', chatData)
  })

  // 연결 종료
  socket.on('disconnect', () => {
    console.log('❌ 클라이언트 연결 종료:', socket.id)
    // 플레이어 캐릭터 삭제 (AI 캐릭터는 유지)
    if (characters[socket.id] && !characters[socket.id].isAi) {
      delete characters[socket.id]
      io.emit('characterUpdate', {
        id: socket.id,
        _removed: true
      })
    }
  })
})

// AI 캐릭터 자동 이동 (비활성화 - AI 에이전트가 이동 담당)
// setInterval(() => {
//   const CELL_SIZE = 50

//   // 현재 그리드 위치
//   const currentGridX = Math.floor(aiCharacter.x / CELL_SIZE)
//   const currentGridY = Math.floor(aiCharacter.y / CELL_SIZE)

//   // 랜덤 방향 선택 (상하좌우)
//   const directions = [
//     { dx: 0, dy: -1 }, // 위
//     { dx: 0, dy: 1 },  // 아래
//     { dx: -1, dy: 0 }, // 왼쪽
//     { dx: 1, dy: 0 }   // 오른쪽
//   ]

//   const dir = directions[Math.floor(Math.random() * directions.length)]
//   const newGridX = currentGridX + dir.dx
//   const newGridY = currentGridY + dir.dy

//   // 그리드 셀 중심으로 위치 계산
//   const newX = (newGridX * CELL_SIZE) + (CELL_SIZE / 2)
//   const newY = (newGridY * CELL_SIZE) + (CELL_SIZE / 2)

//   // 맵 경계 체크
//   if (newX >= CELL_SIZE / 2 && newX <= MAP_SIZE.width - CELL_SIZE / 2 &&
//       newY >= CELL_SIZE / 2 && newY <= MAP_SIZE.height - CELL_SIZE / 2) {
//     aiCharacter.x = newX
//     aiCharacter.y = newY

//     console.log('🤖 AI 캐릭터 이동:', aiCharacter.name, `(${aiCharacter.x}, ${aiCharacter.y})`)
//     io.emit('characterUpdate', aiCharacter)
//   }
// }, 3000) // 3초마다 이동

const PORT = 4000
httpServer.listen(PORT, () => {
  console.log('🚀 서버 실행 중: http://localhost:' + PORT)
  console.log('✅ AI 캐릭터:', aiCharacter.name)
  console.log('📍 AI 캐릭터 위치:', `(${aiCharacter.x}, ${aiCharacter.y})`)
})