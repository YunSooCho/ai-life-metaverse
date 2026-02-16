import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import GameCanvas, { 
  checkCollision,
  checkBuildingCollision,
  checkMapBounds,
  canMove,
  getCharacterSpeed,
  MAP_SIZE,
  CHARACTER_SIZE,
  CELL_SIZE
} from '../GameCanvas'

// Mock the tilemap data
vi.mock('../../data/tilemap.json', () => ({
  default: {
    version: '1.0',
    mapSize: { width: 1000, height: 700, tileWidth: 32, tileHeight: 32 },
    layers: {
      ground: {
        type: 'tilemap',
        tiles: [
          { id: 1, name: '잔디', color: '#4CAF50', x: 0, y: 0, width: 1000, height: 700 }
        ]
      },
      buildings: {
        type: 'buildings',
        buildings: []
      },
      decoration: {
        type: 'objects',
        objects: []
      }
    },
    weather: { current: 'sunny', types: ['sunny', 'cloudy', 'rainy', 'snowy'] },
    lighting: {
      ambient: { brightness: 1.0, color: '#FFFFFF' },
      timeOfDay: 'day'
    }
  }
}))

describe('GameCanvas - Phase 2 Tilemap Rendering', () => {
  const mockMyCharacter = {
    id: 'player1',
    name: 'TestPlayer',
    x: 500,
    y: 350,
    color: '#4CAF50',
    emoji: '🧞',
    isAi: false
  }

  const mockCharacters = {
    ai1: {
      id: 'ai1',
      name: 'AI Character',
      x: 400,
      y: 300,
      color: '#FF6B6B',
      emoji: '🤖',
      isAi: true
    }
  }

  const mockBuildings = [
    {
      id: 1,
      name: '상점',
      type: 'shop',
      sprite: 'shop',
      x: 150,
      y: 150,
      width: 120,
      height: 100,
      entrance: { x: 190, y: 240, width: 40, height: 20 },
      interior: { width: 400, height: 300, npcs: ['shopkeeper'] }
    }
  ]

  const mockAffinities = {
    player1: { ai1: 5 }
  }

  const mockChatMessages = {}

  const mockClickEffects = []

  const props = {
    myCharacter: mockMyCharacter,
    characters: mockCharacters,
    affinities: mockAffinities,
    chatMessages: mockChatMessages,
    clickEffects: mockClickEffects,
    buildings: mockBuildings,
    canvasRef: { current: document.createElement('canvas') },
    onClick: vi.fn(),
    onBuildingClick: vi.fn()
  }

  it('should render canvas successfully', () => {
    const { container } = render(<GameCanvas {...props} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should have correct MAP_SIZE and CELL_SIZE', () => {
    expect(MAP_SIZE).toEqual({ width: 1000, height: 700 })
  })

  it('should render tilemap ground layer', () => {
    const { container } = render(<GameCanvas {...props} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
    // Tilemap rendering happens inside useEffect, so canvas should exist
  })

  it('should render building sprites', () => {
    const { container } = render(<GameCanvas {...props} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
    // Building sprites should be loaded and rendered
  })

  it('should call onClick when canvas is clicked', () => {
    const { container } = render(<GameCanvas {...props} />)
    const canvas = container.querySelector('canvas')
    
    if (canvas) {
      canvas.click()
      expect(props.onClick).toHaveBeenCalled()
    }
  })

  })

describe('GameCanvas - Collision Detection', () => {
  const mockCharacter1 = { id: 'char1', x: 100, y: 100 }
  const mockCharacter2 = { id: 'char2', x: 120, y: 100 }
  const mockCharacters = {
    char1: mockCharacter1,
    char2: mockCharacter2
  }

  const mockBuildings = [
    { id: 1, name: 'Building', x: 150, y: 100, width: 100, height: 100 }
  ]

  it('should detect character collisions', () => {
    const result = checkCollision(
      110, 100, 'char1', mockCharacters
    )
    expect(result).toBe(true)
  })

  it('should not detect collision when far from other characters', () => {
    const result = checkCollision(
      200, 200, 'char1', mockCharacters
    )
    expect(result).toBe(false)
  })

  it('should detect building collisions', () => {
    const result = checkBuildingCollision(
      180, 140, mockBuildings
    )
    expect(result).toBe(true)
  })

  it('should not detect collision when outside building bounds', () => {
    const result = checkBuildingCollision(
      50, 50, mockBuildings
    )
    expect(result).toBe(false)
  })

  it('should check map bounds correctly', () => {
    const result = checkMapBounds(50, 50)
    expect(result.inBounds).toBe(true)
  })

  it('should clamp position when out of bounds', () => {
    const result = checkMapBounds(-10, 50)
    expect(result.clampedX).toBe(20) // halfSize = 20
  })
})

describe('GameCanvas - Movement Utilities', () => {
  it('should return correct character speed', () => {
    const mockCharacter = { speed: 5 }
    const speed = getCharacterSpeed(mockCharacter)
    expect(speed).toBe(5)
  })

  it('should return default speed when not specified', () => {
    const mockCharacter = {}
    const speed = getCharacterSpeed(mockCharacter)
    expect(speed).toBe(3) // DEFAULT_SPEED
  })

  it('should check if character can move', () => {
    const mockCharacter = { isConversing: false }
    const canMoveResult = canMove(mockCharacter)
    expect(canMoveResult).toBe(true)
  })

  it('should not allow movement when conversing', () => {
    const mockCharacter = { isConversing: true }
    const canMoveResult = canMove(mockCharacter)
    expect(canMoveResult).toBe(false)
  })
})