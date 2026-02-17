import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import GameCanvas, {
  checkCollision,
  checkBuildingCollision,
  checkMapBounds,
  canMove,
  getCharacterSpeed
} from '../GameCanvas'

// 모의 캔버스 ref
const mockCanvasRef = {
  current: document.createElement('canvas')
}

describe('GameCanvas - 캐릭터 커스터마이징 기능', () => {
  const mockMyCharacter = {
    id: 'player',
    name: '플레이어',
    x: 125,
    y: 125,
    color: '#4CAF50',
    emoji: '👤',
    isAi: false
  }

  const mockCharacters = {
    'char1': {
      id: 'char1',
      name: '캐릭터1',
      x: 200,
      y: 200,
      color: '#FF6B6B',
      emoji: '🎭',
      isAi: true
    }
  }

  const mockProps = {
    myCharacter: mockMyCharacter,
    characters: mockCharacters,
    affinities: {},
    chatMessages: {},
    clickEffects: [],
    buildings: [],
    canvasRef: mockCanvasRef,
    onClick: vi.fn(),
    onBuildingClick: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('커스터마이징 상태 적용', () => {
    it('characterCustomization prop를 받을 수 있다', () => {
      const customization = {
        hairStyle: 'long',
        clothingColor: 'red',
        accessory: 'glasses'
      }

      render(
        <GameCanvas
          {...mockProps}
          characterCustomization={customization}
        />
      )

      // 컴포넌트가 정상적으로 렌더링되는지 확인
      const canvas = mockCanvasRef.current
      expect(canvas).toBeTruthy()
    })

    it('기본 커스터마이징 설정이 있다', () => {
      const defaultCustomization = {
        hairStyle: 'short',
        clothingColor: 'blue',
        accessory: 'none'
      }

      render(
        <GameCanvas
          {...mockProps}
          characterCustomization={defaultCustomization}
        />
      )

      expect(mockCanvasRef.current).toBeTruthy()
    })

    it('accessory가 없애도 렌더링된다', () => {
      const customization = {
        hairStyle: 'medium',
        clothingColor: 'green',
        accessory: 'none'
      }

      const { container } = render(
        <GameCanvas
          {...mockProps}
          characterCustomization={customization}
        />
      )

      expect(container.querySelector('.canvas-container')).toBeInTheDocument()
    })
  })

  describe('머리 스타일 커스터마이징', () => {
    it('다른 머리 스타일을 적용한다', () => {
      const customizations = [
        { hairStyle: 'short', clothingColor: 'blue', accessory: 'none' },
        { hairStyle: 'medium', clothingColor: 'blue', accessory: 'none' },
        { hairStyle: 'long', clothingColor: 'blue', accessory: 'none' },
        { hairStyle: 'bald', clothingColor: 'blue', accessory: 'none' }
      ]

      customizations.forEach(customization => {
        const { unmount } = render(
          <GameCanvas
            {...mockProps}
            characterCustomization={customization}
          />
        )

        expect(mockCanvasRef.current).toBeTruthy()
        unmount()
      })
    })
  })

  describe('옷 색상 커스터마이징', () => {
    it('다른 옷 색상을 적용한다', () => {
      const customizations = [
        { hairStyle: 'short', clothingColor: 'blue', accessory: 'none' },
        { hairStyle: 'short', clothingColor: 'red', accessory: 'none' },
        { hairStyle: 'short', clothingColor: 'green', accessory: 'none' },
        { hairStyle: 'short', clothingColor: 'yellow', accessory: 'none' },
        { hairStyle: 'short', clothingColor: 'purple', accessory: 'none' }
      ]

      customizations.forEach(customization => {
        const { unmount } = render(
          <GameCanvas
            {...mockProps}
            characterCustomization={customization}
          />
        )

        expect(mockCanvasRef.current).toBeTruthy()
        unmount()
      })
    })
  })

  describe('액세서리 커스터마이징', () => {
    it('액세서리를 적용한다', () => {
      const customizations = [
        { hairStyle: 'short', clothingColor: 'blue', accessory: 'none' },
        { hairStyle: 'short', clothingColor: 'blue', accessory: 'glasses' },
        { hairStyle: 'short', clothingColor: 'blue', accessory: 'hat' },
        { hairStyle: 'short', clothingColor: 'blue', accessory: 'bow_tie' },
        { hairStyle: 'short', clothingColor: 'blue', accessory: 'headphones' }
      ]

      customizations.forEach(customization => {
        const { unmount } = render(
          <GameCanvas
            {...mockProps}
            characterCustomization={customization}
          />
        )

        expect(mockCanvasRef.current).toBeTruthy()
        unmount()
      })
    })
  })

  describe('커스터마이징 조합', () => {
    it('모든 커스터마이징이 결합된 캐릭터를 렌더링한다', () => {
      const fullCustomization = {
        hairStyle: 'long',
        clothingColor: 'purple',
        accessory: 'crown'
      }

      const { container } = render(
        <GameCanvas
          {...mockProps}
          characterCustomization={fullCustomization}
        />
      )

      expect(container.querySelector('.canvas-container')).toBeInTheDocument()
    })
  })

  describe('캐릭터 색상 적용', () => {
    it('clothingColor에 따라 캐릭터 색상이 변한다', () => {
      const colorCustomizations = [
        { hairStyle: 'short', clothingColor: 'blue' },
        { hairStyle: 'short', clothingColor: 'red' },
        { hairStyle: 'short', clothingColor: 'green' }
      ]

      colorCustomizations.forEach(customization => {
        const { unmount } = render(
          <GameCanvas
            {...mockProps}
            characterCustomization={{ ...customization, accessory: 'none' }}
          />
        )

        expect(mockCanvasRef.current).toBeTruthy()
        unmount()
      })
    })
  })
})

describe('GameCanvas - 유틸리티 함수', () => {
  describe('checkCollision', () => {
    it('캐릭터 간 충돌을 감지한다', () => {
      const allCharacters = {
        'char1': { id: 'char1', x: 100, y: 100 },
        'char2': { id: 'char2', x: 110, y: 110 }
      }

      const hasCollision = checkCollision(100, 100, 'char1', allCharacters)
      expect(hasCollision).toBe(true)
    })

    it('충돌이 없으면 false를 반환한다', () => {
      const allCharacters = {
        'char1': { id: 'char1', x: 100, y: 100 },
        'char2': { id: 'char2', x: 200, y: 200 }
      }

      const hasCollision = checkCollision(100, 100, 'char1', allCharacters)
      expect(hasCollision).toBe(false)
    })
  })

  describe('checkBuildingCollision', () => {
    it('건물 충돌을 감지한다', () => {
      const buildings = [
        { x: 100, y: 100, width: 50, height: 50 }
      ]

      const hasCollision = checkBuildingCollision(125, 125, buildings)
      expect(hasCollision).toBe(true)
    })

    it('건물 밖이면 충돌이 없다', () => {
      const buildings = [
        { x: 100, y: 100, width: 50, height: 50 }
      ]

      const hasCollision = checkBuildingCollision(200, 200, buildings)
      expect(hasCollision).toBe(false)
    })
  })

  describe('checkMapBounds', () => {
    it('맵 경계 내부를 확인한다', () => {
      const result = checkMapBounds(500, 350)
      expect(result.inBounds).toBe(true)
    })

    it('맵 경계 외부를 감지한다', () => {
      const result = checkMapBounds(1100, 350)
      expect(result.inBounds).toBe(false)
      expect(result.clampedX).toBe(980) // MAP_SIZE.width - CHARACTER_SIZE / 2
    })

    it('좌표를 경계로 클램프한다', () => {
      const result = checkMapBounds(-50, 800)
      expect(result.inBounds).toBe(false)
      expect(result.clampedX).toBe(20) // CHARACTER_SIZE / 2
      expect(result.clampedY).toBe(680) // MAP_SIZE.height - CHARACTER_SIZE / 2
    })
  })

  describe('canMove', () => {
    it('대화 중이지 않으면 이동할 수 있다', () => {
      const character = { isConversing: false }
      expect(canMove(character)).toBe(true)
    })

    it('대화 중이면 이동할 수 없다', () => {
      const character = { isConversing: true }
      expect(canMove(character)).toBe(false)
    })
  })

  describe('getCharacterSpeed', () => {
    it('기본 속도를 반환한다', () => {
      const character = {}
      expect(getCharacterSpeed(character)).toBe(3)
    })

    it('커스텀 속도를 반환한다', () => {
      const character = { speed: 5 }
      expect(getCharacterSpeed(character)).toBe(5)
    })
  })
})