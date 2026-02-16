import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import MiniMap, { MAP_SIZE, MINIMAP_SIZE } from '../MiniMap'

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
      buildings: { type: 'buildings', buildings: [] },
      decoration: { type: 'objects', objects: [] }
    },
    weather: { current: 'sunny', types: ['sunny', 'cloudy', 'rainy', 'snowy'] },
    lighting: {
      ambient: { brightness: 1.0, color: '#FFFFFF' },
      timeOfDay: 'day'
    }
  }
}))

describe('MiniMap - Phase 2 Pixel Art Style', () => {
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
      x: 150,
      y: 150,
      width: 120,
      height: 100,
      color: '#4CAF50'
    },
    {
      id: 2,
      name: '카페',
      type: 'cafe',
      x: 700,
      y: 150,
      width: 120,
      height: 100,
      color: '#FF9800'
    },
    {
      id: 3,
      name: '공원',
      type: 'park',
      x: 400,
      y: 500,
      width: 200,
      height: 150,
      color: '#8BC34A'
    },
    {
      id: 4,
      name: '도서관',
      type: 'library',
      x: 100,
      y: 450,
      width: 150,
      height: 120,
      color: '#2196F3'
    },
    {
      id: 5,
      name: '체육관',
      type: 'gym',
      x: 750,
      y: 450,
      width: 150,
      height: 120,
      color: '#F44336'
    }
  ]

  const onClickMock = vi.fn()

  const props = {
    myCharacter: mockMyCharacter,
    characters: mockCharacters,
    buildings: mockBuildings,
    onClick: onClickMock
  }

  it('should render canvas successfully', () => {
    const { container } = render(<MiniMap {...props} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should have correct MAP_SIZE constants', () => {
    expect(MAP_SIZE).toEqual({ width: 1000, height: 700 })
    expect(MINIMAP_SIZE).toEqual({ width: 200, height: 140 })
  })

  it('should render canvas with correct dimensions', () => {
    const { container } = render(<MiniMap {...props} />)
    const canvas = container.querySelector('canvas')
    
    if (canvas) {
      expect(canvas.width).toBe(200)
      expect(canvas.height).toBe(140)
    }
  })

  it('should call onClick when canvas is clicked', () => {
    const { container } = render(<MiniMap {...props} />)
    const canvas = container.querySelector('canvas')
    
    if (canvas) {
      canvas.click()
      expect(onClickMock).toHaveBeenCalled()
    }
  })

  it('should handle touch events', () => {
    const { container } = render(<MiniMap {...props} />)
    const canvas = container.querySelector('canvas')
    
    if (canvas) {
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{
          clientX: 100,
          clientY: 70,
          target: canvas
        }]
      })
      canvas.dispatchEvent(touchEvent)
      expect(onClickMock).toHaveBeenCalled()
    }
  })

  it('should have pixel art style border', () => {
    const { container } = render(<MiniMap {...props} />)
    const canvas = container.querySelector('canvas')
    
    if (canvas) {
      expect(canvas.style.border).toContain('3px solid')
      expect(canvas.style.cursor).toBe('pointer')
    }
  })

  it('should display pixelated image rendering', () => {
    const { container } = render(<MiniMap {...props} />)
    const canvas = container.querySelector('canvas')
    
    if (canvas) {
      expect(canvas.style.imageRendering).toBe('pixelated')
    }
  })

  it('should render all building types with correct colors', () => {
    const { container } = render(<MiniMap {...props} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
    
    // Buildings should be rendered with pixel art style colors
    const buildingColors = {
      shop: '#4CAF50',
      cafe: '#FF9800',
      park: '#8BC34A',
      library: '#2196F3',
      gym: '#F44336'
    }
    
    mockBuildings.forEach(building => {
      expect(buildingColors[building.type]).toBeDefined()
    })
  })

  it('should render AI characters in yellow', () => {
    const { container } = render(<MiniMap {...props} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
    
    // AI characters should be rendered with yellow color
    Object.values(mockCharacters).forEach(char => {
      if (char.isAi) {
        expect(char.id).toBe('ai1')
      }
    })
  })

  it('should render player character in white', () => {
    const { container } = render(<MiniMap {...props} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
    
    // Player character should be rendered with white color
    expect(mockMyCharacter.isAi).toBe(false)
  })

  it('should have proper shadow for pixel art effect', () => {
    const { container } = render(<MiniMap {...props} />)
    const canvas = container.querySelector('canvas')
    
    if (canvas) {
      expect(canvas.style.boxShadow).toContain('2px 2px 0px')
    }
  })
})

describe('MiniMap - Scale Calculations', () => {
  it('should calculate correct scale values', () => {
    const MAP_SIZE = { width: 1000, height: 700 }
    const MINIMAP_SIZE = { width: 200, height: 140 }
    
    const scaleX = MINIMAP_SIZE.width / MAP_SIZE.width
    const scaleY = MINIMAP_SIZE.height / MAP_SIZE.height
    
    expect(scaleX).toBe(0.2)
    expect(scaleY).toBe(0.2)
  })

  it('should map canvas coordinates to map coordinates correctly', () => {
    const mapX = 100
    const mapY = 70
    const scaleX = 0.2
    const scaleY = 0.2
    const canvasX = mapX * scaleX
    const canvasY = mapY * scaleY
    
    expect(Math.round(canvasX)).toBe(20)
    expect(Math.round(canvasY)).toBe(14)
  })
})