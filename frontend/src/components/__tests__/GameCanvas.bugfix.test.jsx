/**
 * GameCanvas CRITICAL BUG Fix Test
 * Issue #62: GameCanvas 렌더링 안됨 - 캔버스가 완전히 비어 있음
 *
 * Bug 원인:
 * - useEffect의 render 함수 내에서 renderLoopId 선언
 * - Closure 문제로 cleanup에서 renderLoopId 접근 불가
 * - 렌더 루프가 취소되지 않아 중복 실행/중단
 *
 * Fix:
 * - renderLoopId를 useEffect scope에 선언 (closure 문제 해결)
 * - cleanup에서 renderLoopId null 체크 후 취소
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import GameCanvas from '../GameCanvas'

// Mock dependencies
jest.mock('../../utils/spriteLoader', () => ({
  loadSpriteSheet: jest.fn(() => Promise.resolve({
    complete: true,
    width: 512,
    height: 512
  }))
}))

jest.mock('../../utils/spriteRenderer', () => ({
  setAnimationState: jest.fn()
}))

jest.mock('../../utils/TileRenderer', () => ({
  renderGroundLayer: jest.fn(),
  renderDecorationLayer: jest.fn(),
  renderEntranceHighlight: jest.fn()
}))

jest.mock('../../utils/emojiSprite', () => ({
  renderEmotionEmoji: jest.fn()
}))

jest.mock('../../utils/effects', () => ({
  createFxParticle: jest.fn(),
  renderFx: jest.fn()
}))

jest.mock('../../utils/emotionSystem', () => ({
  EMOTION_TYPES: {
    HAPPY: 'happy',
    SAD: 'sad',
    ANGRY: 'angry',
    SURPRISED: 'surprised'
  },
  EMOTION_EMOJIS: {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    surprised: '😲'
  },
  getAutoEmotionAffinity: jest.fn(() => 'happy'),
  EmotionSystem: jest.fn().mockImplementation(() => ({
    getEmotion: jest.fn(() => 'happy'),
    setEmotion: jest.fn(),
    getBounceOffset: jest.fn(() => ({ x: 0, y: 0 })),
    getAnimationProgress: jest.fn(() => 1)
  })),
  FXSystem: jest.fn().mockImplementation(() => ({
    addAffinityUp: jest.fn(),
    addAffinityDown: jest.fn(),
    addClickRipple: jest.fn(),
    update: jest.fn(),
    getRenderEffects: jest.fn(() => [])
  }))
}))

jest.mock('../../utils/characterCustomization', () => ({
  getOptionEmoji: jest.fn(() => '🎀'),
  getColorHex: jest.fn(() => '#3498db')
}))

jest.mock('../../utils/weatherTimeSystem', () => ({
  getGameHour: jest.fn(() => 10),
  getGameMinute: jest.fn(() => 30),
  generateRandomWeather: jest.fn(() => 'clear'),
  createWeatherParticles: jest.fn(() => []),
  updateWeatherParticles: jest.fn(() => []),
  renderWeatherParticles: jest.fn(),
  renderTimeOverlay: jest.fn(),
  renderWeatherTimeHUD: jest.fn(),
  WEATHER_TYPES: {
    CLEAR: 'clear',
    RAIN: 'rain',
    SNOW: 'snow',
    CLOUDY: 'cloudy'
  }
}))

jest.mock('../../data/customizationOptions', () => ({
  CUSTOMIZATION_CATEGORIES: {
    ACCESSORIES: 'accessories',
    HAIR_STYLES: 'hair_styles'
  }
}))

jest.mock('../../data/tilemap.json', () => ({
  mapSize: { width: 1000, height: 700 },
  layers: {
    ground: [],
    decoration: []
  }
}))

describe('GameCanvas Bug #62 Fix Test', () => {
  let container
  let canvasRef

  const mockMyCharacter = {
    id: 'player1',
    name: '플레이어',
    x: 500,
    y: 350,
    color: '#3498db',
    emoji: '😊',
    isAi: false,
    speed: 3
  }

  const mockCharacters = {
    npc1: {
      id: 'npc1',
      name: 'NPC 1',
      x: 600,
      y: 400,
      color: '#e74c3c',
      emoji: '🤖',
      isAi: true,
      speed: 2
    }
  }

  const mockBuildings = [
    {
      id: 1,
      name: 'Shop',
      x: 100,
      y: 100,
      width: 150,
      height: 150,
      type: 'shop',
      color: '#95a5a6',
      sprite: 'shop',
      entrance: { x: 175, y: 250 }
    }
  ]

  const defaultProps = {
    myCharacter: mockMyCharacter,
    characters: mockCharacters,
    affinities: { player1: { npc1: 5 } },
    chatMessages: {},
    clickEffects: [],
    buildings: mockBuildings,
    canvasRef: React.createRef(),
    onClick: jest.fn(),
    characterCustomization: {
      hairStyle: 'short',
      clothingColor: 'blue',
      accessory: 'none'
    }
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    canvasRef = React.createRef()
  })

  afterEach(() => {
    document.body.removeChild(container)
    jest.clearAllMocks()
  })

  /**
   * Test 1: Canvas가 올바르게 생성되는지 확인
   */
  test('should create canvas element', () => {
    render(<GameCanvas {...defaultProps} canvasRef={canvasRef} />)

    waitFor(() => {
      const canvas = canvasRef.current
      expect(canvas).toBeDefined()
      expect(canvas.tagName).toBe('CANVAS')
    })
  })

  /**
   * Test 2: Canvas 크기가 올바르게 설정되는지 확인
   */
  test('should set correct canvas dimensions', async () => {
    render(<GameCanvas {...defaultProps} canvasRef={canvasRef} />)

    await waitFor(() => {
      const canvas = canvasRef.current
      expect(canvas.width).toBeGreaterThan(0)
      expect(canvas.height).toBeGreaterThan(0)
      expect(canvas.style.width).toMatch(/\d+px/)
      expect(canvas.style.height).toMatch(/\d+px/)
    }, { timeout: 3000 })
  })

  /**
   * Test 3: Canvas 픽셀이 비어있지 않은지 확인 (렌더링 작동 확인)
   */
  test('should render content (canvas pixels not empty)', async () => {
    render(<GameCanvas {...defaultProps} canvasRef={canvasRef} />)

    await waitFor(() => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      // 중앙 픽셀 확인 (비어 있지 않아야 함)
      const centerX = Math.floor(canvas.width / 2)
      const centerY = Math.floor(canvas.height / 2)
      const pixel = ctx.getImageData(centerX, centerY, 1, 1).data

      // 픽셀 값 확인 [r, g, b, alpha]
      // alpha가 0이면 완전 투명 (버그!)
      expect(pixel[3]).toBeGreaterThan(0) // alpha > 0
    }, { timeout: 3000 })
  })

  /**
   * Test 4: 렌더 루프 ID가 올바르게 관리되는지 확인
   */
  test('should properly manage render loop ID', () => {
    const { unmount } = render(<GameCanvas {...defaultProps} canvasRef={canvasRef} />)

    waitFor(() => {
      // 컴포넌트 언마운트 시 cleanup 실행 확인
      // 에러 없이 정상적으로 종료되어야 함
      expect(() => unmount()).not.toThrow()
    }, { timeout: 1000 })
  })

  /**
   * Test 5: 캔버스 배경색이 올바르게 렌더링되는지 확인
   */
  test('should render background color', async () => {
    render(<GameCanvas {...defaultProps} canvasRef={canvasRef} />)

    await waitFor(() => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      // 좌상단 픽셀 확인 (배경색)
      const pixel = ctx.getImageData(0, 0, 1, 1).data
      const bgColor = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`

      // 배경색이 투명이 아니어야 함
      expect(pixel[3]).toBeGreaterThan(0)

      // 배경색은 어두운 색조여야 함 (#1a1a2e)
      expect(pixel[0]).toBeLessThan(50) // dark
      expect(pixel[1]).toBeLessThan(50) // dark
      expect(pixel[2]).toBeLessThan(60) // dark
    }, { timeout: 3000 })
  })

  /**
   * Test 6: 캐릭터가 렌더링되는지 확인
   */
  test('should render characters', async () => {
    render(<GameCanvas {...defaultProps} canvasRef={canvasRef} />)

    await waitFor(() => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      // 캐릭터 위치 주변에 픽셀 확인
      const scaleX = canvas.width / 1000
      const scaleY = canvas.height / 700
      const charX = Math.floor(mockMyCharacter.x * scaleX)
      const charY = Math.floor(mockMyCharacter.y * scaleY)

      // 캐릭터가 있는 위치는 전체적으로 비어있지 않아야 함
      // 32x32 영역 스캔
      let hasNonEmptyPixel = false
      for (let dy = -16; dy <= 16; dy++) {
        for (let dx = -16; dx <= 16; dx++) {
          const px = charX + dx
          const py = charY + dy
          if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
            const pixel = ctx.getImageData(px, py, 1, 1).data
            if (pixel[3] > 0) { // alpha > 0
              hasNonEmptyPixel = true
              break
            }
          }
        }
        if (hasNonEmptyPixel) break
      }

      expect(hasNonEmptyPixel).toBe(true)
    }, { timeout: 3000 })
  })

  /**
   * Test 7: Canvas가 리렌더링 시 새로운 루프가 생성되는지 확인
   */
  test('should handle re-rendering', async () => {
    const { rerender } = render(<GameCanvas {...defaultProps} canvasRef={canvasRef} />)

    await waitFor(() => {
      const canvas = canvasRef.current
      expect(canvas).toBeDefined()
    }, { timeout: 2000 })

    // 캐릭터 변경 후 리렌더링
    const newCharacters = {
      ...mockCharacters,
      npc2: {
        id: 'npc2',
        name: 'NPC 2',
        x: 700,
        y: 500,
        color: '#27ae60',
        emoji: '🎮',
        isAi: true,
        speed: 2
      }
    }

    rerender(<GameCanvas {...defaultProps} characters={newCharacters} canvasRef={canvasRef} />)

    await waitFor(() => {
      const canvas = canvasRef.current
      const pixel = canvas.getContext('2d').getImageData(
        Math.floor(canvas.width / 2),
        Math.floor(canvas.height / 2),
        1, 1
      ).data

      expect(pixel[3]).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })
})

/**
 * Test Summary:
 *
 * ✅ Test 1: Canvas element 생성 확인
 * ✅ Test 2: Canvas 크기 설정 확인
 * ✅ Test 3: Canvas 픽셀 비어있지 않음 확인 (렌더링 작동)
 * ✅ Test 4: Render loop ID 관리 확인 (cleanup)
 * ✅ Test 5: 배경색 렌더링 확인
 * ✅ Test 6: 캐릭터 렌더링 확인
 * ✅ Test 7: 리렌더링 처리 확인
 *
 * 이 테스트가 모두 통과하면 Bug #62가 수정됨!
 */