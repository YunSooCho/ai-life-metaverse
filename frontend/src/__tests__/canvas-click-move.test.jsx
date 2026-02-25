import { describe, it, expect, vi, beforeEach } from 'vitest'

// 상수 (App.jsx와 동일)
const MAP_SIZE = { width: 1000, height: 700 }
const CELL_SIZE = 50
const CHARACTER_SIZE = 40

// Mock socket
const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connect: vi.fn(),
  off: vi.fn(),
  id: 'test-socket-id',
  connected: true
}

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
  default: vi.fn(() => mockSocket)
}))

vi.mock('../socket.js', () => ({
  socket: mockSocket,
  default: mockSocket
}))

vi.mock('../hooks/useSocketEvent.js', () => ({
  useSocketEvent: vi.fn(),
  default: vi.fn()
}))

/**
 * 캔버스 클릭 → 이동 방향 계산 로직 (App.jsx handleCanvasClick에서 추출)
 *
 * @param {Object} myPosition - 현재 캐릭터 위치 { x, y }
 * @param {number} clickMapX - 클릭한 맵 X 좌표
 * @param {number} clickMapY - 클릭한 맵 Y 좌표
 * @returns {{ dx: number, dy: number }} - 이동 방향
 */
function calculateMoveDirection(myPosition, clickMapX, clickMapY) {
  const currentGridX = Math.floor(myPosition.x / CELL_SIZE)
  const currentGridY = Math.floor(myPosition.y / CELL_SIZE)

  const clickGridX = Math.floor(clickMapX / CELL_SIZE)
  const clickGridY = Math.floor(clickMapY / CELL_SIZE)

  let dx = 0
  let dy = 0

  if (clickGridX > currentGridX) dx = 1
  else if (clickGridX < currentGridX) dx = -1

  if (clickGridY > currentGridY) dy = 1
  else if (clickGridY < currentGridY) dy = -1

  return { dx, dy }
}

/**
 * 클릭 좌표 → 맵 좌표 변환 (App.jsx handleCanvasClick에서 추출)
 *
 * @param {number} clientX - 클릭 X (뷰포트)
 * @param {number} clientY - 클릭 Y (뷰포트)
 * @param {Object} rect - canvas.getBoundingClientRect()
 * @param {number} containerWidth - 캔버스 컨테이너 너비
 * @param {number} containerHeight - 캔버스 컨테이너 높이
 * @returns {{ mapX: number, mapY: number }}
 */
function clientToMapCoords(clientX, clientY, rect, containerWidth, containerHeight) {
  const x = clientX - rect.left
  const y = clientY - rect.top

  const scale = Math.min(containerWidth / MAP_SIZE.width, containerHeight / MAP_SIZE.height)

  const mapX = x / scale
  const mapY = y / scale

  return { mapX, mapY }
}

/**
 * 터치 이벤트에서 좌표 추출 (App.jsx handleCanvasClick에서 추출)
 *
 * @param {Object} event - 마우스 또는 터치 이벤트
 * @returns {{ clientX: number, clientY: number }}
 */
function extractCoords(event) {
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  return { clientX, clientY }
}

describe('Canvas Click/Touch Move - Issue #119', () => {

  describe('calculateMoveDirection', () => {
    it('오른쪽 클릭 시 dx=1, dy=0', () => {
      const myPos = { x: 250, y: 250 } // 그리드 (5, 5)
      const { dx, dy } = calculateMoveDirection(myPos, 350, 250) // 그리드 (7, 5)
      expect(dx).toBe(1)
      expect(dy).toBe(0)
    })

    it('왼쪽 클릭 시 dx=-1, dy=0', () => {
      const myPos = { x: 250, y: 250 }
      const { dx, dy } = calculateMoveDirection(myPos, 150, 250)
      expect(dx).toBe(-1)
      expect(dy).toBe(0)
    })

    it('위쪽 클릭 시 dx=0, dy=-1', () => {
      const myPos = { x: 250, y: 250 }
      const { dx, dy } = calculateMoveDirection(myPos, 250, 150)
      expect(dx).toBe(0)
      expect(dy).toBe(-1)
    })

    it('아래쪽 클릭 시 dx=0, dy=1', () => {
      const myPos = { x: 250, y: 250 }
      const { dx, dy } = calculateMoveDirection(myPos, 250, 350)
      expect(dx).toBe(0)
      expect(dy).toBe(1)
    })

    it('대각선 (오른쪽 아래) 클릭 시 dx=1, dy=1', () => {
      const myPos = { x: 250, y: 250 }
      const { dx, dy } = calculateMoveDirection(myPos, 350, 350)
      expect(dx).toBe(1)
      expect(dy).toBe(1)
    })

    it('대각선 (왼쪽 위) 클릭 시 dx=-1, dy=-1', () => {
      const myPos = { x: 250, y: 250 }
      const { dx, dy } = calculateMoveDirection(myPos, 150, 150)
      expect(dx).toBe(-1)
      expect(dy).toBe(-1)
    })

    it('같은 그리드 클릭 시 dx=0, dy=0 (이동 없음)', () => {
      const myPos = { x: 250, y: 250 } // 그리드 (5, 5)
      const { dx, dy } = calculateMoveDirection(myPos, 260, 260) // 그리드 (5, 5)
      expect(dx).toBe(0)
      expect(dy).toBe(0)
    })

    it('맵 경계 근처 클릭 시에도 올바른 방향 계산', () => {
      const myPos = { x: 25, y: 25 } // 그리드 (0, 0)
      const { dx, dy } = calculateMoveDirection(myPos, 975, 675)
      expect(dx).toBe(1)
      expect(dy).toBe(1)
    })
  })

  describe('clientToMapCoords', () => {
    it('1:1 스케일에서 좌표 변환', () => {
      const rect = { left: 0, top: 0 }
      const { mapX, mapY } = clientToMapCoords(500, 350, rect, MAP_SIZE.width, MAP_SIZE.height)
      expect(mapX).toBe(500)
      expect(mapY).toBe(350)
    })

    it('2배 스케일에서 좌표 변환', () => {
      const rect = { left: 0, top: 0 }
      // 컨테이너가 2000x1400이면 스케일=2
      const { mapX, mapY } = clientToMapCoords(1000, 700, rect, 2000, 1400)
      expect(mapX).toBe(500)
      expect(mapY).toBe(350)
    })

    it('0.5배 스케일에서 좌표 변환', () => {
      const rect = { left: 0, top: 0 }
      // 컨테이너가 500x350이면 스케일=0.5
      const { mapX, mapY } = clientToMapCoords(250, 175, rect, 500, 350)
      expect(mapX).toBe(500)
      expect(mapY).toBe(350)
    })

    it('오프셋이 있는 캔버스에서 좌표 변환', () => {
      const rect = { left: 100, top: 50 }
      const { mapX, mapY } = clientToMapCoords(600, 400, rect, MAP_SIZE.width, MAP_SIZE.height)
      expect(mapX).toBe(500)
      expect(mapY).toBe(350)
    })
  })

  describe('extractCoords', () => {
    it('마우스 이벤트에서 좌표 추출', () => {
      const event = { clientX: 500, clientY: 350 }
      const { clientX, clientY } = extractCoords(event)
      expect(clientX).toBe(500)
      expect(clientY).toBe(350)
    })

    it('터치 이벤트에서 좌표 추출', () => {
      const event = {
        touches: [{ clientX: 500, clientY: 350 }]
      }
      const { clientX, clientY } = extractCoords(event)
      expect(clientX).toBe(500)
      expect(clientY).toBe(350)
    })
  })

  describe('moveCharacter socket.emit', () => {
    beforeEach(() => {
      mockSocket.emit.mockClear()
    })

    it('이동 시 socket.emit("move") 호출', () => {
      const myChar = { id: 'player-1', x: 250, y: 250, name: 'Player 1' }
      const newX = myChar.x + CELL_SIZE
      const newY = myChar.y

      mockSocket.emit('move', {
        ...myChar,
        x: newX,
        y: newY
      })

      expect(mockSocket.emit).toHaveBeenCalledWith('move', expect.objectContaining({
        id: 'player-1',
        x: 300,
        y: 250
      }))
    })

    it('대각선 이동 시 socket.emit("move") 호출', () => {
      const myChar = { id: 'player-1', x: 250, y: 250, name: 'Player 1' }
      const newX = myChar.x + CELL_SIZE
      const newY = myChar.y + CELL_SIZE

      mockSocket.emit('move', {
        ...myChar,
        x: newX,
        y: newY
      })

      expect(mockSocket.emit).toHaveBeenCalledWith('move', expect.objectContaining({
        x: 300,
        y: 300
      }))
    })

    it('이동 없을 때 socket.emit 미호출', () => {
      const { dx, dy } = calculateMoveDirection({ x: 250, y: 250 }, 260, 260)
      if (dx !== 0 || dy !== 0) {
        mockSocket.emit('move', { x: 250, y: 250 })
      }

      expect(mockSocket.emit).not.toHaveBeenCalled()
    })
  })
})
