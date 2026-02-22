import { describe, it, expect } from 'vitest'
import tilemapData from '../../data/tilemap.json'

describe('Tilemap Data Structure', () => {
  describe('Basic Structure', () => {
    it('should have version property', () => {
      expect(tilemapData).toHaveProperty('version')
      expect(typeof tilemapData.version).toBe('string')
    })

    it('should have mapSize property', () => {
      expect(tilemapData).toHaveProperty('mapSize')
      expect(tilemapData.mapSize).toHaveProperty('width')
      expect(tilemapData.mapSize).toHaveProperty('height')
      expect(tilemapData.mapSize).toHaveProperty('tileWidth')
      expect(tilemapData.mapSize).toHaveProperty('tileHeight')
    })

    it('should have layers property', () => {
      expect(tilemapData).toHaveProperty('layers')
      expect(tilemapData.layers).toHaveProperty('ground')
      expect(tilemapData.layers).toHaveProperty('buildings')
      expect(tilemapData.layers).toHaveProperty('decoration')
    })
  })

  describe('Map Size', () => {
    it('should have valid map dimensions', () => {
      expect(tilemapData.mapSize.width).toBeGreaterThan(0)
      expect(tilemapData.mapSize.height).toBeGreaterThan(0)
    })

    it('should have valid tile size', () => {
      expect(tilemapData.mapSize.tileWidth).toBeGreaterThan(0)
      expect(tilemapData.mapSize.tileHeight).toBeGreaterThan(0)
    })
  })

  describe('Ground Layer', () => {
    it('should be a tilemap layer', () => {
      expect(tilemapData.layers.ground.type).toBe('tilemap')
    })

    it('should have tiles array', () => {
      expect(Array.isArray(tilemapData.layers.ground.tiles)).toBe(true)
    })

    it('should have required tile properties for single rect tiles', () => {
      // 잔디 타일 (id: 1)은 x, y 속성이 있음
      const grassTile = tilemapData.layers.ground.tiles.find(t => t.id === 1)
      expect(grassTile).toBeDefined()
      expect(grassTile).toHaveProperty('id')
      expect(grassTile).toHaveProperty('name')
      expect(grassTile).toHaveProperty('color')
      expect(grassTile).toHaveProperty('walkable')
      expect(grassTile).toHaveProperty('x')
      expect(grassTile).toHaveProperty('y')
      expect(grassTile).toHaveProperty('width')
      expect(grassTile).toHaveProperty('height')
    })

    it('should have path property for path tiles', () => {
      // 흙길 타일 (id: 2)은 path 속성이 있음
      const dirtPathTile = tilemapData.layers.ground.tiles.find(t => t.id === 2)
      expect(dirtPathTile).toBeDefined()
      expect(dirtPathTile).toHaveProperty('id')
      expect(dirtPathTile).toHaveProperty('name')
      expect(dirtPathTile).toHaveProperty('color')
      expect(dirtPathTile).toHaveProperty('walkable')
      expect(dirtPathTile).toHaveProperty('path')
      expect(Array.isArray(dirtPathTile.path)).toBe(true)
    })

    it('should have rects property for rect tiles', () => {
      // 돌바닥 타일 (id: 3)은 rects 속성이 있음
      const stoneTile = tilemapData.layers.ground.tiles.find(t => t.id === 3)
      expect(stoneTile).toBeDefined()
      expect(stoneTile).toHaveProperty('id')
      expect(stoneTile).toHaveProperty('name')
      expect(stoneTile).toHaveProperty('color')
      expect(stoneTile).toHaveProperty('walkable')
      expect(stoneTile).toHaveProperty('rects')
      expect(Array.isArray(stoneTile.rects)).toBe(true)
    })

    it('should have valid hex colors', () => {
      const colorRegex = /^#[0-9A-Fa-f]{6}$/
      tilemapData.layers.ground.tiles.forEach(tile => {
        if (tile.color) {
          expect(tile.color).toMatch(colorRegex)
        }
      })
    })
  })

  describe('Buildings Layer', () => {
    it('should be a buildings layer', () => {
      expect(tilemapData.layers.buildings.type).toBe('buildings')
    })

    it('should have 5 buildings', () => {
      expect(tilemapData.layers.buildings.buildings.length).toBe(5)
    })

    it('should have required building properties', () => {
      const buildings = tilemapData.layers.buildings.buildings
      buildings.forEach(building => {
        expect(building).toHaveProperty('id')
        expect(building).toHaveProperty('name')
        expect(building).toHaveProperty('type')
        expect(building).toHaveProperty('sprite')
        expect(building).toHaveProperty('x')
        expect(building).toHaveProperty('y')
        expect(building).toHaveProperty('width')
        expect(building).toHaveProperty('height')
        expect(building).toHaveProperty('entrance')
      })
    })

    it('should have valid building types', () => {
      const validTypes = ['shop', 'cafe', 'park', 'library', 'gym']
      tilemapData.layers.buildings.buildings.forEach(building => {
        expect(validTypes).toContain(building.type)
      })
    })

    it('should have valid entrance coordinates', () => {
      tilemapData.layers.buildings.buildings.forEach(building => {
        const entrance = building.entrance
        expect(entrance).toHaveProperty('x')
        expect(entrance).toHaveProperty('y')
        expect(entrance).toHaveProperty('width')
        expect(entrance).toHaveProperty('height')

        // 입구가 건물 내부에 있는지 확인
        expect(entrance.x).toBeGreaterThanOrEqual(building.x)
        expect(entrance.y).toBeGreaterThanOrEqual(building.y)
        expect(entrance.x + entrance.width).toBeLessThanOrEqual(building.x + building.width)
        expect(entrance.y + entrance.height).toBeLessThanOrEqual(building.y + building.height)
      })
    })

    it('should have interior property for each building', () => {
      tilemapData.layers.buildings.buildings.forEach(building => {
        expect(building).toHaveProperty('interior')
        expect(building.interior).toHaveProperty('width')
        expect(building.interior).toHaveProperty('height')
        expect(building.interior).toHaveProperty('npcs')
        expect(Array.isArray(building.interior.npcs)).toBe(true)
      })
    })
  })

  describe('Decoration Layer', () => {
    it('should be an objects layer', () => {
      expect(tilemapData.layers.decoration.type).toBe('objects')
    })

    it('should have objects array', () => {
      expect(Array.isArray(tilemapData.layers.decoration.objects)).toBe(true)
    })

    it('should have required object properties', () => {
      const objects = tilemapData.layers.decoration.objects
      objects.forEach(obj => {
        expect(obj).toHaveProperty('id')
        expect(obj).toHaveProperty('name')
        expect(obj).toHaveProperty('sprite')
        expect(obj).toHaveProperty('x')
        expect(obj).toHaveProperty('y')
        expect(obj).toHaveProperty('width')
        expect(obj).toHaveProperty('height')
      })
    })

    it('should have obstacle property', () => {
      tilemapData.layers.decoration.objects.forEach(obj => {
        expect(obj).toHaveProperty('obstacle')
        expect(typeof obj.obstacle).toBe('boolean')
      })
    })
  })

  describe('Weather System', () => {
    it('should have weather property', () => {
      expect(tilemapData).toHaveProperty('weather')
    })

    it('should have current weather', () => {
      expect(tilemapData.weather).toHaveProperty('current')
    })

    it('should have valid weather types', () => {
      expect(tilemapData.weather).toHaveProperty('types')
      expect(Array.isArray(tilemapData.weather.types)).toBe(true)
      expect(tilemapData.weather.types.length).toBeGreaterThan(0)
    })
  })

  describe('Lighting System', () => {
    it('should have lighting property', () => {
      expect(tilemapData).toHaveProperty('lighting')
    })

    it('should have ambient lighting', () => {
      expect(tilemapData.lighting).toHaveProperty('ambient')
      expect(tilemapData.lighting.ambient).toHaveProperty('brightness')
      expect(tilemapData.lighting.ambient).toHaveProperty('color')
    })

    it('should have time of day', () => {
      expect(tilemapData.lighting).toHaveProperty('timeOfDay')
      expect(typeof tilemapData.lighting.timeOfDay).toBe('string')
    })
  })

  describe('Data Integrity', () => {
    it('should have all buildings within map bounds', () => {
      const { width, height } = tilemapData.mapSize
      tilemapData.layers.buildings.buildings.forEach(building => {
        expect(building.x).toBeGreaterThanOrEqual(0)
        expect(building.y).toBeGreaterThanOrEqual(0)
        expect(building.x + building.width).toBeLessThanOrEqual(width)
        expect(building.y + building.height).toBeLessThanOrEqual(height)
      })
    })

    it('should have all decorations within map bounds', () => {
      const { width, height } = tilemapData.mapSize
      tilemapData.layers.decoration.objects.forEach(obj => {
        expect(obj.x).toBeGreaterThanOrEqual(0)
        expect(obj.y).toBeGreaterThanOrEqual(0)
        expect(obj.x + obj.width).toBeLessThanOrEqual(width)
        expect(obj.y + obj.height).toBeLessThanOrEqual(height)
      })
    })

    it('should have unique building IDs', () => {
      const buildingIds = tilemapData.layers.buildings.buildings.map(b => b.id)
      const uniqueIds = new Set(buildingIds)
      expect(buildingIds.length).toBe(uniqueIds.size)
    })

    it('should have unique decoration IDs', () => {
      const decorationIds = tilemapData.layers.decoration.objects.map(o => o.id)
      const uniqueIds = new Set(decorationIds)
      expect(decorationIds.length).toBe(uniqueIds.size)
    })
  })
})