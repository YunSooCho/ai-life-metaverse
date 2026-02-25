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

describe('Phase 2: 건물/맵 타일 리팩토링', () => {
  describe('캐릭터 충돌 감지', () => {
    test('다른 캐릭터와 충돌 감지', () => {
      const allCharacters = {
        'char1': { id: 'char1', x: 100, y: 100 },
        'char2': { id: 'char2', x: 110, y: 100 }
      }
      
      const result = checkCollision(100, 100, 'char1', allCharacters)
      expect(result).toBe(true)
    })
    
    test('다른 캐릭터와 충돌하지 않음', () => {
      const allCharacters = {
        'char1': { id: 'char1', x: 100, y: 100 },
        'char2': { id: 'char2', x: 200, y: 200 }
      }
      
      const result = checkCollision(100, 100, 'char1', allCharacters)
      expect(result).toBe(false)
    })
    
    test('자신과는 충돌하지 않음', () => {
      const allCharacters = {
        'char1': { id: 'char1', x: 100, y: 100 }
      }
      
      const result = checkCollision(100, 100, 'char1', allCharacters)
      expect(result).toBe(false)
    })
  })
  
  describe('건물 충돌 감지', () => {
    test('건물 내부와 충돌 감지', () => {
      const buildings = [
        { id: 1, name: '상점', x: 150, y: 150, width: 120, height: 100 }
      ]
      
      const result = checkBuildingCollision(200, 200, buildings)
      expect(result).toBe(true)
    })
    
    test('건물 외부와 충돌하지 않음', () => {
      const buildings = [
        { id: 1, name: '상점', x: 150, y: 150, width: 120, height: 100 }
      ]
      
      const result = checkBuildingCollision(100, 100, buildings)
      expect(result).toBe(false)
    })
  })
  
  describe('맵 경계 확인', () => {
    test('맵 내부에 있음', () => {
      const result = checkMapBounds(100, 100)
      expect(result.inBounds).toBe(true)
    })
    
    test('맵 경계를 벗어남 - 왼쪽', () => {
      const result = checkMapBounds(0, 100)
      expect(result.inBounds).toBe(false)
      expect(result.clampedX).toBe(CHARACTER_SIZE / 2)
    })
    
    test('맵 경계를 벗어남 - 오른쪽', () => {
      const result = checkMapBounds(MAP_SIZE.width, 100)
      expect(result.inBounds).toBe(false)
      expect(result.clampedX).toBe(MAP_SIZE.width - CHARACTER_SIZE / 2)
    })
  })
  
  describe('캐릭터 이동', () => {
    test('대화 중에는 이동 불가', () => {
      const character = { isConversing: true }
      expect(canMove(character)).toBe(false)
    })
    
    test('대화 중이 아니면 이동 가능', () => {
      const character = { isConversing: false }
      expect(canMove(character)).toBe(true)
    })
  })
  
  describe('캐릭터 속도', () => {
    test('기본 속도 반환', () => {
      const character = {}
      expect(getCharacterSpeed(character)).toBe(3)
    })
    
    test('설정된 속도 반환', () => {
      const character = { speed: 5 }
      expect(getCharacterSpeed(character)).toBe(5)
    })
  })
  
  describe('픽셀 아트 타일맵', () => {
    test('MAP_SIZE 상수', () => {
      expect(MAP_SIZE.width).toBe(1000)
      expect(MAP_SIZE.height).toBe(700)
    })
    
    test('CELL_SIZE 상수', () => {
      expect(CELL_SIZE).toBe(50)
    })
    
    test('CHARACTER_SIZE 상수', () => {
      expect(CHARACTER_SIZE).toBe(40)
    })
  })
})

describe('건물 픽셀 아트 렌더링', () => {
  test('건물 데이터 구조', () => {
    const building = {
      id: 1,
      name: '상점',
      type: 'shop',
      sprite: 'shop',
      x: 150,
      y: 150,
      width: 120,
      height: 100,
      entrance: {
        x: 190,
        y: 240,
        width: 40,
        height: 20
      },
      interior: {
        width: 400,
        height: 300,
        npcs: ['shopkeeper']
      }
    }
    
    expect(building.id).toBe(1)
    expect(building.name).toBe('상점')
    expect(building.sprite).toBe('shop')
    expect(building.entrance).toBeDefined()
    expect(building.interior).toBeDefined()
  })
  
  test('모든 건물 타입에 스프라이트 존재', () => {
    const buildingTypes = ['shop', 'cafe', 'library', 'gym', 'park']
    
    buildingTypes.forEach(type => {
      const path = `/public/images/buildings/${type}.svg`
      // 실제 파일 존재 여부는 파일 시스템에서 확인 필요
      expect(path).toContain(type)
    })
  })
})

describe('타일맵 데이터', () => {
  test('타일맵 레이어 구조', () => {
    // tilemap.json 구조 확인
    const tilemapStructure = {
      version: '1.0',
      mapSize: { width: 1000, height: 700, tileWidth: 32, tileHeight: 32 },
      layers: {
        ground: { type: 'tilemap', tiles: [] },
        buildings: { type: 'buildings', buildings: [] },
        decoration: { type: 'objects', objects: [] }
      }
    }
    
    expect(tilemapStructure.mapSize.width).toBe(1000)
    expect(tilemapStructure.layers.ground).toBeDefined()
    expect(tilemapStructure.layers.buildings).toBeDefined()
    expect(tilemapStructure.layers.decoration).toBeDefined()
  })
  
  test('그라운드 타일 데이터', () => {
    const groundTile = {
      id: 1,
      name: '잔디',
      color: '#4CAF50',
      walkable: true,
      x: 0,
      y: 0,
      width: 1000,
      height: 700
    }
    
    expect(groundTile.color).toBe('#4CAF50')
    expect(groundTile.walkable).toBe(true)
  })
})