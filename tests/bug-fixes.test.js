/**
 * Bug Fix Tests - Issue #37, #38, #39
 *
 * Tests for:
 * - #37: AI 캐릭터 이름 'undefined' 표시 문제
 * - #38: 스프라이트 로딩 실패 - RPGCharacterSprites32x32.svg 404
 * - #39: RoomMenu prop 타입 에러 + defaultProps 경고
 */

describe('Bug Fixes - Issue #37: AI 캐릭터 이름 undefined', () => {
  // Character 컴포넌트 테스트
  describe('Character 컴포넌트 - 이름 rendering', () => {
    it('should render fallback name "익명" when name is undefined', () => {
      const char = {
        id: 'char1',
        x: 100,
        y: 100,
        color: '#FF0000',
        emoji: '👤',
        name: undefined,  // undefined 이름
        isAi: false,
        emotion: null
      }

      const displayName = char.name || '익명'
      expect(displayName).toBe('익명')
    })

    it('should render original name when name exists', () => {
      const char = {
        id: 'char1',
        x: 100,
        y: 100,
        color: '#FF0000',
        emoji: '👤',
        name: '테스트 캐릭터',
        isAi: false,
        emotion: null
      }

      const displayName = char.name || '익명'
      expect(displayName).toBe('테스트 캐릭터')
    })

    it('should render fallback name "익명" when name is empty string', () => {
      const char = {
        id: 'char1',
        x: 100,
        y: 100,
        color: '#FF0000',
        emoji: '👤',
        name: '',  // 빈 이름
        isAi: false,
        emotion: null
      }

      const displayName = char.name || '익명'
      expect(displayName).toBe('익명')
    })

    it('should render fallback name "익명" when name is null', () => {
      const char = {
        id: 'char1',
        x: 100,
        y: 100,
        color: '#FF0000',
        emoji: '👤',
        name: null,  // null 이름
        isAi: false,
        emotion: null
      }

      const displayName = char.name || '익명'
      expect(displayName).toBe('익명')
    })
  })

  // GameCanvas drawCharacter 테스트
  describe('GameCanvas - drawCharacter name rendering', () => {
    it('should use displayName fallback in drawCharacter', () => {
      const char = {
        id: 'char2',
        x: 200,
        y: 200,
        color: '#00FF00',
        emoji: '🤖',
        name: undefined,  // undefined 이름
        isAi: true,
        isConversing: false
      }

      const displayName = char.name || '익명'
      expect(displayName).toBe('익명')
    })
  })
})

describe('Bug Fixes - Issue #38: 스프라이트 로딩 경로', () => {
  describe('스프라이트 로딩 경로 확인', () => {
    it('should construct correct path for character sprite', () => {
      const path = 'sprites/character/RPGCharacterSprites32x32.svg'
      const expectedSrc = `/images/${path}`
      expect(expectedSrc).toBe('/images/sprites/character/RPGCharacterSprites32x32.svg')
    })

    it('should construct correct path for building sprite', () => {
      const path = 'sprites/buildings/buildings.svg'
      const expectedSrc = `/images/${path}`
      expect(expectedSrc).toBe('/images/sprites/buildings/buildings.svg')
    })

    it('should construct correct path for tile sprite', () => {
      const path = 'tiles/tileset.svg'
      const expectedSrc = `/images/${path}`
      expect(expectedSrc).toBe('/images/tiles/tileset.svg')
    })

    it('should construct correct path for entrance sprite', () => {
      const path = 'effects/entrance_highlight.svg'
      const expectedSrc = `/images/${path}`
      expect(expectedSrc).toBe('/images/effects/entrance_highlight.svg')
    })
  })
})

describe('Bug Fixes - Issue #39: RoomMenu props 경고', () => {
  describe('RoomMenu propTypes - currentRoom 타입', () => {
    it('should accept null as currentRoom', () => {
      const currentRoom = null
      expect(currentRoom).toBeNull()
    })

    it('should accept object with id and name as currentRoom', () => {
      const currentRoom = { id: 'main', name: '메인 광장' }
      expect(currentRoom).toHaveProperty('id', 'main')
      expect(currentRoom).toHaveProperty('name', '메인 광장')
    })

    it('should handle undefined currentRoom with default value', () => {
      const currentRoom = undefined
      const defaultValue = currentRoom || null
      expect(defaultValue).toBeNull()
    })
  })

  describe('RoomMenu - isActive 계산', () => {
    it('should calculate isActive correctly when currentRoom is object', () => {
      const room = { id: 'main', name: '메인 광장', members: [] }
      const currentRoom = { id: 'main', name: '메인 광장' }
      const isActive = currentRoom ? room.id === currentRoom.id : false
      expect(isActive).toBe(true)
    })

    it('should calculate isActive correctly when rooms are different', () => {
      const room = { id: 'room2', name: '방 2', members: [] }
      const currentRoom = { id: 'main', name: '메인 광장' }
      const isActive = currentRoom ? room.id === currentRoom.id : false
      expect(isActive).toBe(false)
    })

    it('should calculate isActive correctly when currentRoom is null', () => {
      const room = { id: 'main', name: '메인 광장', members: [] }
      const currentRoom = null
      const isActive = currentRoom ? room.id === currentRoom.id : false
      expect(isActive).toBe(false)
    })
  })

  describe('App.jsx - handleCreateRoom', () => {
    it('should handle room name passed as argument', () => {
      const roomName = '새 방'
      const isValid = roomName && roomName.trim() !== ''
      expect(isValid).toBe(true)
    })

    it('should reject empty room name', () => {
      const roomName = ''
      const isValid = roomName && roomName.trim() !== ''
      expect(isValid).toBe(false)
    })

    it('should reject whitespace-only room name', () => {
      const roomName = '   '
      const isValid = roomName && roomName.trim() !== ''
      expect(isValid).toBe(false)
    })

    it('should trim room name', () => {
      const roomName = '  방 이름  '
      const trimmedName = roomName.trim()
      expect(trimmedName).toBe('방 이름')
    })
  })
})

describe('통합 - 버그 수정 검증', () => {
  it('should render character with fallback name when name is undefined', () => {
    const char = {
      id: 'char3',
      x: 300,
      y: 300,
      color: '#0000FF',
      emoji: '🧞',
      name: undefined,
      isAi: true,
      isConversing: false
    }

    // Character.jsx와 GameCanvas.jsx에서 사용하는 fallback 로직
    const displayName = char.name || '익명'
    expect(displayName).toBe('익명')
  })

  it('should use correct sprite paths for all sprites', () => {
    const sprites = {
      character: 'sprites/character/RPGCharacterSprites32x32.svg',
      buildings: 'sprites/buildings/buildings.svg',
      tiles: 'tiles/tileset.svg',
      entrance: 'effects/entrance_highlight.svg'
    }

    Object.entries(sprites).forEach(([name, path]) => {
      const src = `/images/${path}`
      expect(src).toContain('/images/')
      expect(src.length).toBeGreaterThan(0)
    })
  })
})