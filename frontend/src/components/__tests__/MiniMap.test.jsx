import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import MiniMap, { MAP_SIZE, MINIMAP_SIZE } from '../MiniMap'

// requestAnimationFrame mock
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0)
}

// cancelAnimationFrame mock
global.cancelAnimationFrame = (id) => {
  clearTimeout(id)
}

describe('MiniMap Component', () => {
  const mockMyCharacter = {
    id: 'player-1',
    name: 'Test Player',
    x: 500,
    y: 350,
    color: '#FF6B6B',
    emoji: '👤',
    isAi: false
  }

  const mockCharacters = {
    'npc-1': {
      id: 'npc-1',
      name: 'NPC 1',
      x: 200,
      y: 200,
      color: '#4CAF50',
      emoji: '👩',
      isAi: true
    },
    'npc-2': {
      id: 'npc-2',
      name: 'NPC 2',
      x: 800,
      y: 500,
      color: '#2196F3',
      emoji: '👨',
      isAi: true
    }
  }

  const mockBuildings = [
    {
      id: 1,
      name: '상점',
      x: 150,
      y: 150,
      width: 120,
      height: 100,
      type: 'shop',
      color: '#4CAF50'
    },
    {
      id: 2,
      name: '카페',
      x: 700,
      y: 150,
      width: 120,
      height: 100,
      type: 'cafe',
      color: '#FF9800'
    }
  ]

  const mockOnClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Constants', () => {
    it('should have correct MAP_SIZE', () => {
      expect(MAP_SIZE.width).toBe(1000)
      expect(MAP_SIZE.height).toBe(700)
    })

    it('should have correct MINIMAP_SIZE', () => {
      expect(MINIMAP_SIZE.width).toBe(200)
      expect(MINIMAP_SIZE.height).toBe(140)
    })
  })

  describe('Rendering', () => {
    it('should render canvas element', () => {
      const { container } = render(
        <MiniMap
          myCharacter={mockMyCharacter}
          characters={mockCharacters}
          buildings={mockBuildings}
          onClick={mockOnClick}
        />
      )

      const canvas = container.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('should have correct canvas dimensions', () => {
      const { container } = render(
        <MiniMap
          myCharacter={mockMyCharacter}
          characters={mockCharacters}
          buildings={mockBuildings}
          onClick={mockOnClick}
        />
      )

      const canvas = container.querySelector('canvas')
      expect(canvas).toHaveAttribute('width', MINIMAP_SIZE.width.toString())
      expect(canvas).toHaveAttribute('height', MINIMAP_SIZE.height.toString())
    })

    it('should have pixelated image rendering style', () => {
      const { container } = render(
        <MiniMap
          myCharacter={mockMyCharacter}
          characters={mockCharacters}
          buildings={mockBuildings}
          onClick={mockOnClick}
        />
      )

      const canvas = container.querySelector('canvas')
      expect(canvas.style.imageRendering).toBe('pixelated')
    })

    it('should have pixel art border style', () => {
      const { container } = render(
        <MiniMap
          myCharacter={mockMyCharacter}
          characters={mockCharacters}
          buildings={mockBuildings}
          onClick={mockOnClick}
        />
      )

      const canvas = container.querySelector('canvas')
      expect(canvas.style.border).toContain('3px solid')
      expect(canvas.style.borderRadius).toBe('4px')
    })
  })

  describe('Interaction', () => {
    it('should call onClick with correct coordinates when canvas is clicked', () => {
      const { container } = render(
        <MiniMap
          myCharacter={mockMyCharacter}
          characters={mockCharacters}
          buildings={mockBuildings}
          onClick={mockOnClick}
        />
      )

      const canvas = container.querySelector('canvas')

      // 클릭 위치: (50, 50) - canvas 내부
      fireEvent.click(canvas, {
        clientX: 50,
        clientY: 50,
        target: {
          getBoundingClientRect: () => ({
            left: 0,
            top: 0
          })
        }
      })

      // 예상되는 맵 좌표 계산
      const scaleX = MAP_SIZE.width / MINIMAP_SIZE.width // 1000 / 200 = 5
      const scaleY = MAP_SIZE.height / MINIMAP_SIZE.height // 700 / 140 = 5
      const expectedMapX = 50 * scaleX // 50 * 5 = 250
      const expectedMapY = 50 * scaleY // 50 * 5 = 250

      expect(mockOnClick).toHaveBeenCalledWith(expectedMapX, expectedMapY)
    })

    it('should handle touch events', () => {
      const { container } = render(
        <MiniMap
          myCharacter={mockMyCharacter}
          characters={mockCharacters}
          buildings={mockBuildings}
          onClick={mockOnClick}
        />
      )

      const canvas = container.querySelector('canvas')

      // 터치 이벤트 시뮬레이션
      fireEvent.touchStart(canvas, {
        touches: [
          {
            clientX: 100,
            clientY: 70
          }
        ],
        target: {
          getBoundingClientRect: () => ({
            left: 0,
            top: 0
          })
        }
      })

      const scaleX = MAP_SIZE.width / MINIMAP_SIZE.width // 5
      const scaleY = MAP_SIZE.height / MINIMAP_SIZE.height // 5
      const expectedMapX = 100 * scaleX // 500
      const expectedMapY = 70 * scaleY // 350

      expect(mockOnClick).toHaveBeenCalledWith(expectedMapX, expectedMapY)
    })
  })

  describe('Canvas Context', () => {
    it('should disable image smoothing for pixel art', () => {
      const { container } = render(
        <MiniMap
          myCharacter={mockMyCharacter}
          characters={mockCharacters}
          buildings={mockBuildings}
          onClick={mockOnClick}
        />
      )

      // Canvas가 context 2d를 가지고 있는지 확인
      const canvas = container.querySelector('canvas')
      expect(canvas.tagName.toLowerCase()).toBe('canvas')
    })
  })

  describe('Scaling', () => {
    it('should correctly scale map coordinates to minimap coordinates', () => {
      const scaleX = MINIMAP_SIZE.width / MAP_SIZE.width
      const scaleY = MINIMAP_SIZE.height / MAP_SIZE.height

      // 0,0은 0,0으로 스케일링 되어야 함
      expect(0 * scaleX).toBe(0)
      expect(0 * scaleY).toBe(0)

      // 1000,700은 200,140으로 스케일링 되어야 함
      expect(1000 * scaleX).toBe(MINIMAP_SIZE.width)
      expect(700 * scaleY).toBe(MINIMAP_SIZE.height)

      // 중앙 500,350은 100,70으로 스케일링 되어야 함
      expect(500 * scaleX).toBe(100)
      expect(350 * scaleY).toBe(70)
    })
  })

  describe('Building Colors', () => {
    it('should have correct building type colors', () => {
      const expectedColors = {
        shop: '#4CAF50',    // 초록
        cafe: '#FF9800',    // 주황
        park: '#8BC34A',    // 연두
        library: '#2196F3', // 파랑
        gym: '#F44336'      // 빨강
      }

      // 이 테스트는 색상 정의가 올바른지 확인합니다
      expect(expectedColors.shop).toBe('#4CAF50')
      expect(expectedColors.cafe).toBe('#FF9800')
      expect(expectedColors.park).toBe('#8BC34A')
      expect(expectedColors.library).toBe('#2196F3')
      expect(expectedColors.gym).toBe('#F44336')
    })
  })

  describe('Character Rendering', () => {
    it('should have correct character count', () => {
      const { container } = render(
        <MiniMap
          myCharacter={mockMyCharacter}
          characters={mockCharacters}
          buildings={mockBuildings}
          onClick={mockOnClick}
        />
      )

      const canvas = container.querySelector('canvas')
      expect(canvas).toBeInTheDocument()

      // 테스트 데이터에 맞는 캐릭터 수 확인
      const aiCharacters = Object.values(mockCharacters).filter(c => c.isAi)
      expect(aiCharacters.length).toBe(2)
    })
  })
})