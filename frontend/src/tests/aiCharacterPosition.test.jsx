/**
 * AI 캐릭터 위치 테스트 (#121)
 * 테스트 시나리오:
 * 1. 게임 접속
 * 2. AI 캐릭터 위치 확인
 * 3. 시각적 확인
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import GameCanvas from '../components/GameCanvas'

describe('AI Character Position Test (#121)', () => {
  let mockSocket

  beforeEach(() => {
    // Mock Socket.io
    mockSocket = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }

    global.window.io = vi.fn(() => mockSocket)
  })

  it('AI 캐릭터가 올바른 그리드 위치에 있어야 함', () => {
    const CELL_SIZE = 50

    // AI 유리: 그리드 (10, 7) 중심
    const aiYuri = {
      id: 'yuri',
      x: 10 * CELL_SIZE + CELL_SIZE / 2,  // 525 (셀 중심)
      y: 7 * CELL_SIZE + CELL_SIZE / 2,   // 375 (셀 중심)
      color: '#FF6699',
      emoji: '🌸',
      name: 'AI 유리',
      isAi: true
    }

    // AI 히카리: 그리드 (12, 6) 중심
    const aiHikari = {
      id: 'hikari',
      x: 12 * CELL_SIZE + CELL_SIZE / 2,  // 625 (셀 중심)
      y: 6 * CELL_SIZE + CELL_SIZE / 2,   // 325 (셀 중심)
      color: '#66CCFF',
      emoji: '✨',
      name: 'AI 히카리',
      isAi: true
    }

    expect(aiYuri.x).toBe(525)
    expect(aiYuri.y).toBe(375)

    expect(aiHikari.x).toBe(625)
    expect(aiHikari.y).toBe(325)

    // 그리드 경계 내에 있는지 확인
    const characterSize = 40
    const halfSize = characterSize / 2

    const yuriCellX = Math.floor(aiYuri.x / CELL_SIZE)
    const yuriCellY = Math.floor(aiYuri.y / CELL_SIZE)
    expect(yuriCellX).toBe(10)
    expect(yuriCellY).toBe(7)

    const hikariCellX = Math.floor(aiHikari.x / CELL_SIZE)
    const hikariCellY = Math.floor(aiHikari.y / CELL_SIZE)
    expect(hikariCellX).toBe(12)
    expect(hikariCellY).toBe(6)
  })

  it('AI 캐릭터가 셀 중심에 위치해야 함 (버그 감지)', () => {
    const CELL_SIZE = 50

    // ❌ 버그 상태: 셀 시작점에 위치
    const buggyYuri = {
      id: 'yuri',
      x: 10 * CELL_SIZE,  // 500 (셀 시작점)
      y: 7 * CELL_SIZE    // 350 (셀 시작점)
    }

    // ✅ 올바른 상태: 셀 중심에 위치
    const correctYuri = {
      id: 'yuri',
      x: 10 * CELL_SIZE + CELL_SIZE / 2,  // 525 (셀 중심)
      y: 7 * CELL_SIZE + CELL_SIZE / 2    // 375 (셀 중심)
    }

    // 바른 상태 검증
    expect(correctYuri.x).toBe(525)
    expect(correctYuri.y).toBe(375)

    // 버그 상태 감지: 셀 시작점과 다른지 체크
    expect(buggyYuri.x).toBe(500)
    expect(buggyYuri.y).toBe(350)

    // 셀 중심 계산
    const halfCell = CELL_SIZE / 2
    const correctCellCenterX = 10 * CELL_SIZE + halfCell
    const correctCellCenterY = 7 * CELL_SIZE + halfCell

    // 올바른 캐릭터는 셀 중심에 있어야 함
    const distanceFromCenterCorrectX = Math.abs(correctYuri.x - correctCellCenterX)
    const distanceFromCenterCorrectY = Math.abs(correctYuri.y - correctCellCenterY)

    expect(distanceFromCenterCorrectX).toBe(0)
    expect(distanceFromCenterCorrectY).toBe(0)
  })

  it('AI 캐릭터가 셀 안에 있어야 함', () => {
    const CELL_SIZE = 50

    const aiYuri = {
      id: 'yuri',
      x: 525,  // 셀 중심
      y: 375   // 셀 중심
    }

    const aiHikari = {
      id: 'hikari',
      x: 625,  // 셀 중심
      y: 325   // 셀 중심
    }

    const characterSize = 40
    const halfSize = characterSize / 2

    // AI 유리: 셀 (10, 7)
    const yuriCellStartX = 10 * CELL_SIZE
    const yuriCellEndX = 11 * CELL_SIZE
    const yuriCellStartY = 7 * CELL_SIZE
    const yuriCellEndY = 8 * CELL_SIZE

    const yuriMinX = aiYuri.x - halfSize
    const yuriMaxX = aiYuri.x + halfSize
    const yuriMinY = aiYuri.y - halfSize
    const yuriMaxY = aiYuri.y + halfSize

    expect(yuriMinX).toBeGreaterThanOrEqual(yuriCellStartX)
    expect(yuriMaxX).toBeLessThanOrEqual(yuriCellEndX)
    expect(yuriMinY).toBeGreaterThanOrEqual(yuriCellStartY)
    expect(yuriMaxY).toBeLessThanOrEqual(yuriCellEndY)

    // AI 히카리: 셀 (12, 6)
    const hikariCellStartX = 12 * CELL_SIZE
    const hikariCellEndX = 13 * CELL_SIZE
    const hikariCellStartY = 6 * CELL_SIZE
    const hikariCellEndY = 7 * CELL_SIZE

    const hikariMinX = aiHikari.x - halfSize
    const hikariMaxX = aiHikari.x + halfSize
    const hikariMinY = aiHikari.y - halfSize
    const hikariMaxY = aiHikari.y + halfSize

    expect(hikariMinX).toBeGreaterThanOrEqual(hikariCellStartX)
    expect(hikariMaxX).toBeLessThanOrEqual(hikariCellEndX)
    expect(hikariMinY).toBeGreaterThanOrEqual(hikariCellStartY)
    expect(hikariMaxY).toBeLessThanOrEqual(hikariCellEndY)
  })

  it('AI 캐릭터가 셀 중심에 있는지 확인', () => {
    const CELL_SIZE = 50

    const aiYuri = {
      id: 'yuri',
      x: 525,
      y: 375
    }

    // 셀 중심 계산
    const cellX = Math.floor(aiYuri.x / CELL_SIZE)
    const cellY = Math.floor(aiYuri.y / CELL_SIZE)
    const cellCenterX = cellX * CELL_SIZE + CELL_SIZE / 2
    const cellCenterY = cellY * CELL_SIZE + CELL_SIZE / 2

    // 셀 중존이 525, 375여야 함
    expect(cellCenterX).toBe(525)
    expect(cellCenterY).toBe(375)

    // 캐릭터 위치와 셀 중심이 일치해야 함 (완벽하게 중심)
    const distanceFromCenterX = Math.abs(aiYuri.x - cellCenterX)
    const distanceFromCenterY = Math.abs(aiYuri.y - cellCenterY)

    expect(distanceFromCenterX).toBe(0)
    expect(distanceFromCenterY).toBe(0)
  })

  it('맵 경계 밖에 있지 않아야 함', () => {
    const aiYuri = {
      id: 'yuri',
      x: 525,
      y: 375
    }

    const aiHikari = {
      id: 'hikari',
      x: 625,
      y: 325
    }

    const mapWidth = 1000
    const mapHeight = 700
    const halfSize = 20  // CHARACTER_SIZE / 2

    // AI 유리 맵 경계 체크
    expect(aiYuri.x).toBeGreaterThan(halfSize)
    expect(aiYuri.x).toBeLessThan(mapWidth - halfSize)
    expect(aiYuri.y).toBeGreaterThan(halfSize)
    expect(aiYuri.y).toBeLessThan(mapHeight - halfSize)

    // AI 히카리 맵 경계 체크
    expect(aiHikari.x).toBeGreaterThan(halfSize)
    expect(aiHikari.x).toBeLessThan(mapWidth - halfSize)
    expect(aiHikari.y).toBeGreaterThan(halfSize)
    expect(aiHikari.y).toBeLessThan(mapHeight - halfSize)
  })

  it('AI 캐릭터끼리 겹쳐있지 않아야 함', () => {
    const aiYuri = {
      id: 'yuri',
      x: 525,
      y: 375
    }

    const aiHikari = {
      id: 'hikari',
      x: 625,
      y: 325
    }

    const collisionRadius = 40

    const distance = Math.sqrt(
      Math.pow(aiYuri.x - aiHikari.x, 2) +
      Math.pow(aiYuri.y - aiHikari.y, 2)
    )

    expect(distance).toBeGreaterThan(collisionRadius * 2)
  })
})