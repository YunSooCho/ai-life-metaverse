/**
 * AI 캐릭터 위치 테스트
 * Issue #121: AI 캐릭터가 올바른 위치에 있는가?
 */

const ioClient = require('socket.io-client')

const PORT = 4000
const SERVER_URL = `http://localhost:${PORT}`

const TILE_SIZE = 50

// 그리드 중심 계산 함수
const gridCenter = (col, row) => ({
  x: col * TILE_SIZE + TILE_SIZE / 2,
  y: row * TILE_SIZE + TILE_SIZE / 2
})

describe('AI Character Position Test (Issue #121)', () => {
  let clientSocket
  let testRoomId

  beforeAll(async () => {
    // 서버가 실행 중인지 확인 (socket.io 연결로 ping)
    return new Promise((resolve, reject) => {
      const testSocket = ioClient(SERVER_URL)
      testSocket.on('connect', () => {
        console.log('✅ 서버 실행 중 확인: http://localhost:' + PORT)
        testSocket.disconnect()
        resolve()
      })
      testSocket.on('connect_error', (error) => {
        console.error('❌ 서버가 실행 중이 아닙니다:', error.message)
        reject(error)
      })
      setTimeout(() => {
        reject(new Error('서버 연결 타임아웃'))
      }, 5000)
    })
  }, 10000)

  afterAll(async () => {
    // 소켓 연결 종료
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect()
    }
  })

  test('AI 캐릭터가 올바른 그리드 중심에 위치해야 함', async () => {
    // 테스트용 소켓 클라이언트 생성
    return new Promise((resolve, reject) => {
      clientSocket = ioClient(SERVER_URL)

      clientSocket.on('connect', () => {
        console.log('✅ 소켓 연결 완료')

        // 플레이어 접속
        clientSocket.emit('join', {
          id: 'test-player',
          name: '테스트 플레이어',
          x: 100,
          y: 100,
          color: '#4CAF50',
          emoji: '👤',
          isAi: false
        })

        // AI 캐릭터 위치 수신
        let aiCharactersFound = 0
        const aiPositions = {}

        clientSocket.on('roomUpdate', (data) => {
          console.log('📦 Room Update:', JSON.stringify(data))

          if (data.characters) {
            // AI 캐릭터 위치 확인
            Object.values(data.characters).forEach(char => {
              if (char.isAi) {
                aiCharactersFound++
                aiPositions[char.name] = { x: char.x, y: char.y }
                console.log(`🧞 AI 캐릭터 ${char.name}: (${char.x}, ${char.y})`)
              }
            })

            // 두 AI 캐릭터 정보 수신 완료 시 테스트
            if (aiCharactersFound === 2) {
              clientSocket.disconnect()

              // AI 유리 위치 확인 (그리드 (10, 7) 중심)
              const expectedYuri = gridCenter(10, 7) // 525, 375
              expect(aiPositions['AI 유리']).toEqual({
                x: expectedYuri.x,
                y: expectedYuri.y
              })
              console.log(`✅ AI 유리: 그리드 (10, 7) 중심 (${expectedYuri.x}, ${expectedYuri.y})`)

              // AI 히카리 위치 확인 (그리드 (12, 6) 중심)
              const expectedHikari = gridCenter(12, 6) // 625, 325
              expect(aiPositions['AI 히카리']).toEqual({
                x: expectedHikari.x,
                y: expectedHikari.y
              })
              console.log(`✅ AI 히카리: 그리드 (12, 6) 중심 (${expectedHikari.x}, ${expectedHikari.y})`)

              resolve()
            }
          }
        })

        // 연결 실패 처리
        clientSocket.on('connect_error', (error) => {
          console.error('❌ 소켓 연결 실패:', error)
          reject(error)
        })

        // 타임아웃 처리 (10초)
        setTimeout(() => {
          if (aiCharactersFound < 2) {
            clientSocket.disconnect()
            reject(new Error('AI 캐릭터 위치 정보 수신 타임아웃'))
          }
        }, 10000)
      })
    })
  })

  test('그리드 중심 계산 함수가 올바르게 작동해야 함', () => {
    expect(gridCenter(10, 7)).toEqual({ x: 525, y: 375 })
    expect(gridCenter(12, 6)).toEqual({ x: 625, y: 325 })
    expect(gridCenter(0, 0)).toEqual({ x: 25, y: 25 })
    expect(gridCenter(5, 5)).toEqual({ x: 275, y: 275 })
  })
})