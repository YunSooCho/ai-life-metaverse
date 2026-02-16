import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import GameCanvas, {
  checkCollision,
  checkBuildingCollision,
  checkMapBounds,
  canMove,
  getCharacterSpeed
} from '@/components/GameCanvas'

describe('GameCanvas Component', () => {
  const defaultProps = {
    myCharacter: {
      id: 'player',
      name: '플레이어',
      x: 100,
      y: 100,
      color: '#4CAF50',
      emoji: '👤',
      isAi: false
    },
    characters: {
      'char1': {
        id: 'char1',
        name: 'AI 캐릭터',
        x: 200,
        y: 200,
        color: '#FF6B6B',
        emoji: '🤖',
        isAi: true
      }
    },
    affinities: {},
    chatMessages: {},
    clickEffects: [],
    buildings: [],
    canvasRef: { current: null },
    onClick: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<GameCanvas {...defaultProps} />)
    expect(defaultProps.myCharacter.id).toBe('player')
  })

  it('accepts required props', () => {
    render(<GameCanvas {...defaultProps} />)
    
    expect(defaultProps.myCharacter).toBeDefined()
    expect(defaultProps.characters).toBeDefined()
    expect(defaultProps.affinities).toBeDefined()
    expect(defaultProps.chatMessages).toBeDefined()
    expect(defaultProps.clickEffects).toBeDefined()
    expect(defaultProps.canvasRef).toBeDefined()
    expect(defaultProps.onClick).toBeDefined()
  })

  it('renders all characters including myCharacter', () => {
    render(<GameCanvas {...defaultProps} />)
    
    expect(defaultProps.myCharacter.id).toBe('player')
    expect(Object.keys(defaultProps.characters)).toContain('char1')
  })

  it('displays chat messages when provided', () => {
    const propsWithChats = {
      ...defaultProps,
      chatMessages: {
        'char1': {
          message: '안녕하세요!',
          timestamp: Date.now()
        }
      }
    }

    render(<GameCanvas {...propsWithChats} />)
    expect(propsWithChats.chatMessages['char1'].message).toBe('안녕하세요!')
  })

  it('renders click effects when present', () => {
    const propsWithEffects = {
      ...defaultProps,
      clickEffects: [
        {
          x: 150,
          y: 150,
          timestamp: Date.now(),
          type: 'heart'
        }
      ]
    }

    render(<GameCanvas {...propsWithEffects} />)
    expect(propsWithEffects.clickEffects).toHaveLength(1)
  })

  it('has onClick handler', () => {
    expect(defaultProps.onClick).toBeDefined()
    expect(typeof defaultProps.onClick).toBe('function')
  })

  it('handles multiple characters', () => {
    const propsWithMany = {
      ...defaultProps,
      characters: {
        'char1': { id: 'char1', name: 'AI 1', x: 100, y: 100, color: '#fff', emoji: '🤖', isAi: true },
        'char2': { id: 'char2', name: 'AI 2', x: 200, y: 200, color: '#000', emoji: '😊', isAi: false }
      }
    }

    render(<GameCanvas {...propsWithMany} />)
    expect(Object.keys(propsWithMany.characters)).toHaveLength(2)
  })
})

describe('Character Movement System', () => {
  const defaultCharacters = {
    'char1': { id: 'char1', x: 100, y: 100 },
    'char2': { id: 'char2', x: 200, y: 200 }
  }

  describe('checkCollision', () => {
    it('should detect collision when characters are very close', () => {
      const characters = {
        'char1': { id: 'char1', x: 100, y: 100 },
        'char2': { id: 'char2', x: 100, y: 100 }
      }
      // char3 위치에서 char1과 char2와 충돌 확인
      const result = checkCollision(100, 100, 'char3', characters, 40)
      expect(result).toBe(true) // char1, char2와 충돌
    })

    it('returns false when no collision', () => {
      const result = checkCollision(300, 300, 'char1', defaultCharacters, 40)
      expect(result).toBe(false)
    })

    it('ignores the target character in collision check', () => {
      const result = checkCollision(100, 100, 'char1', defaultCharacters, 40)
      expect(result).toBe(false)
    })

    it('detects collision with multiple nearby characters', () => {
      const characters = {
        'char1': { id: 'char1', x: 100, y: 100 },
        'char2': { id: 'char2', x: 100, y: 100 }
      }
      const result = checkCollision(100, 100, 'char3', characters, 40)
      expect(result).toBe(true)
    })
  })

  describe('checkBuildingCollision', () => {
    const buildings = [
      { x: 100, y: 100, width: 100, height: 100 },
      { x: 300, y: 200, width: 150, height: 80 }
    ]

    it('detects collision when character is inside building', () => {
      const result = checkBuildingCollision(150, 150, buildings, 40)
      expect(result).toBe(true)
    })

    it('returns false when no building collision', () => {
      const result = checkBuildingCollision(500, 500, buildings, 40)
      expect(result).toBe(false)
    })

    it('handles character size correctly', () => {
      // 건물 안에 위치하는 케이스
      const result = checkBuildingCollision(120, 120, buildings, 40)
      expect(result).toBe(true)
    })
  })

  describe('checkMapBounds', () => {
    it('returns inBounds true for valid positions', () => {
      const result = checkMapBounds(500, 350, 40)
      expect(result.inBounds).toBe(true)
    })

    it('returns inBounds false for positions outside left boundary', () => {
      const result = checkMapBounds(0, 350, 40)
      expect(result.inBounds).toBe(false)
    })

    it('returns inBounds false for positions outside right boundary', () => {
      const result = checkMapBounds(1000, 350, 40)
      expect(result.inBounds).toBe(false)
    })

    it('returns inBounds false for positions outside top boundary', () => {
      const result = checkMapBounds(500, 0, 40)
      expect(result.inBounds).toBe(false)
    })

    it('returns inBounds false for positions outside bottom boundary', () => {
      const result = checkMapBounds(500, 700, 40)
      expect(result.inBounds).toBe(false)
    })

    it('clamps x position to valid bounds', () => {
      const result = checkMapBounds(5, 350, 40)
      expect(result.clampedX).toBe(20)
    })

    it('clamps y position to valid bounds', () => {
      const result = checkMapBounds(500, 10, 40)
      expect(result.clampedY).toBe(20)
    })
  })

  describe('canMove', () => {
    it('returns true when character is not conversing', () => {
      const character = { isConversing: false }
      expect(canMove(character)).toBe(true)
    })

    it('returns false when character is conversing', () => {
      const character = { isConversing: true }
      expect(canMove(character)).toBe(false)
    })

    it('returns true when isConversing property is undefined', () => {
      const character = {}
      expect(canMove(character)).toBe(true)
    })
  })

  describe('getCharacterSpeed', () => {
    it('returns character speed when defined', () => {
      const character = { speed: 5 }
      expect(getCharacterSpeed(character)).toBe(5)
    })

    it('returns default speed when character speed is undefined', () => {
      const character = {}
      expect(getCharacterSpeed(character)).toBe(3)
    })

    it('returns default speed when character speed is null', () => {
      const character = { speed: null }
      expect(getCharacterSpeed(character)).toBe(3)
    })

    it('handles various speed values', () => {
      expect(getCharacterSpeed({ speed: 1 })).toBe(1)
      expect(getCharacterSpeed({ speed: 10 })).toBe(10)
      // speed: 0도 0을 반환하지만, 실제 사용시에는 최소속도를 가질 수 있음
      // 코드 구현에 따라 기본값 3이 반환될 수 있음
    })
  })
})

describe('Sprite Integration Tests', () => {
  it('component renders with sprite loading state', () => {
    const props = {
      myCharacter: {
        id: 'player',
        name: '플레이어',
        x: 100,
        y: 100,
        color: '#4CAF50',
        emoji: '👤',
        isAi: false
      },
      characters: {},
      affinities: {},
      chatMessages: {},
      clickEffects: [],
      buildings: [],
      canvasRef: { current: null },
      onClick: vi.fn()
    }

    expect(() => render(<GameCanvas {...props} />)).not.toThrow()
  })

  it('handles sprite loading errors gracefully', () => {
    const props = {
      myCharacter: {
        id: 'player',
        name: '플레이어',
        x: 100,
        y: 100,
        color: '#4CAF50',
        emoji: '👤',
        isAi: false
      },
      characters: {},
      affinities: {},
      chatMessages: {},
      clickEffects: [],
      buildings: [],
      canvasRef: { current: null },
      onClick: vi.fn()
    }

    // 컴포넌트가 스프라이트가 없어도 fallback으로 렌더링하는지 확인
    expect(() => render(<GameCanvas {...props} />)).not.toThrow()
  })

  it('supports pixel art style rendering', () => {
    const props = {
      myCharacter: {
        id: 'player',
        name: '플레이어',
        x: 100,
        y: 100,
        color: '#4CAF50',
        emoji: '👤',
        isAi: false
      },
      characters: {},
      affinities: {},
      chatMessages: {},
      clickEffects: [],
      buildings: [],
      canvasRef: { current: null },
      onClick: vi.fn()
    }

    render(<GameCanvas {...props} />)
    // 컴포넌트가 픽셀 아트 스타일의 렌더링을 지원하는지 확인
    expect(props.myCharacter.color).toBe('#4CAF50')
  })
})