/**
 * 타일맵 렌더링 시스템 테스트 (Phase 2: 건물/맵 타일 렌더링 최적화)
 * Issue #45 테스트 코드
 */

import { describe, it, expect } from 'vitest'
import tilemapData from '../frontend/src/data/tilemap.json'

describe('타일맵 데이터 구조 검증', () => {
  it('tilemap.json의 기본 구조를 갖추어야 함', () => {
    expect(tilemapData).toBeDefined()
    expect(tilemapData.version).toEqual('1.0')
    expect(tilemapData.mapSize).toBeDefined()
    expect(tilemapData.layers).toBeDefined()
  })

  it('mapSize 객체가 올바른 속성을 가져야 함', () => {
    const { mapSize } = tilemapData
    expect(mapSize.width).toEqual(1000)
    expect(mapSize.height).toEqual(700)
    expect(mapSize.tileWidth).toEqual(32)
    expect(mapSize.tileHeight).toEqual(32)
  })

  it('layers에 ground, buildings, decoration 레이어가 존재해야 함', () => {
    const { layers } = tilemapData
    expect(layers.ground).toBeDefined()
    expect(layers.buildings).toBeDefined()
    expect(layers.decoration).toBeDefined()
  })
})

describe('Ground 레이어 타일 패턴 검증', () => {
  it('ground 레이어에 tiles 배열이 존재해야 함', () => {
    const { layers } = tilemapData
    expect(layers.ground.tiles).toBeDefined()
    expect(Array.isArray(layers.ground.tiles)).toBe(true)
  })

  it('잔디 타일이 올바른 위치에 있어야 함', () => {
    const { layers } = tilemapData
    const grassTile = layers.ground.tiles[0]
    expect(grassTile.id).toEqual(1)
    expect(grassTile.name).toEqual('잔디')
    expect(grassTile.x).toEqual(0)
    expect(grassTile.y).toEqual(0)
    expect(grassTile.width).toEqual(1000)
    expect(grassTile.height).toEqual(700)
    expect(grassTile.walkable).toBe(true)
    expect(grassTile.color).toBeDefined()
  })

  it('흙길 타일에 경로(path) 배열이 있어야 함', () => {
    const { layers } = tilemapData
    const dirtTile = layers.ground.tiles.find(tile => tile.name === '흙길')
    expect(dirtTile).toBeDefined()
    expect(dirtTile.path).toBeDefined()
    expect(Array.isArray(dirtTile.path)).toBe(true)
    expect(dirtTile.path.length).toBeGreaterThan(0)
  })

  it('돌바닥 타일에 rects 배열이 있어야 함', () => {
    const { layers } = tilemapData
    const stoneTile = layers.ground.tiles.find(tile => tile.name === '돌바닥')
    expect(stoneTile).toBeDefined()
    expect(stoneTile.rects).toBeDefined()
    expect(Array.isArray(stoneTile.rects)).toBe(true)
    expect(stoneTile.rects.length).toBeGreaterThan(0)
  })
})

describe('Buildings 레이어 검증', () => {
  it('buildings 레이어에 buildings 배열이 존재해야 함', () => {
    const { layers } = tilemapData
    expect(layers.buildings.buildings).toBeDefined()
    expect(Array.isArray(layers.buildings.buildings)).toBe(true)
    expect(layers.buildings.buildings.length).toEqual(5)
  })

  it('각 건물이 필수 속성을 가져야 함', () => {
    const { layers } = tilemapData
    const requiredProps = ['id', 'name', 'type', 'sprite', 'x', 'y', 'width', 'height', 'entrance', 'interior']

    layers.buildings.buildings.forEach(building => {
      requiredProps.forEach(prop => {
        expect(building[prop]).toBeDefined()
      })
    })
  })

  it('각 건물의 entrance가 올바른 구조를 가져야 함', () => {
    const { layers } = tilemapData
    const entranceProps = ['x', 'y', 'width', 'height']

    layers.buildings.buildings.forEach(building => {
      expect(building.entrance).toBeDefined()
      entranceProps.forEach(prop => {
        expect(building.entrance[prop]).toBeDefined()
        expect(typeof building.entrance[prop]).toBe('number')
      })
    })
  })

  it('각 건물의 interior가 올바른 구조를 가져야 함', () => {
    const { layers } = tilemapData
    const interiorProps = ['width', 'height', 'npcs']

    layers.buildings.buildings.forEach(building => {
      expect(building.interior).toBeDefined()
      interiorProps.forEach(prop => {
        expect(building.interior[prop]).toBeDefined()
      })
      expect(Array.isArray(building.interior.npcs)).toBe(true)
    })
  })

  it('5개 건물 타입이 모두 존재해야 함 (shop, cafe, park, library, gym)', () => {
    const { layers } = tilemapData
    const buildingTypes = layers.buildings.buildings.map(b => b.type)
    const expectedTypes = ['shop', 'cafe', 'park', 'library', 'gym']

    expectedTypes.forEach(type => {
      expect(buildingTypes).toContain(type)
    })
  })
})

describe('Decoration 레이어 검증', () => {
  it('decoration 레이어에 objects 배열이 존재해야 함', () => {
    const { layers } = tilemapData
    expect(layers.decoration.objects).toBeDefined()
    expect(Array.isArray(layers.decoration.objects)).toBe(true)
    expect(layers.decoration.objects.length).toBeGreaterThan(0)
  })

  it('각 장식 요소가 필수 속성을 가져야 함', () => {
    const { layers } = tilemapData
    const requiredProps = ['id', 'name', 'sprite', 'x', 'y', 'width', 'height', 'obstacle']

    layers.decoration.objects.forEach(obj => {
      requiredProps.forEach(prop => {
        expect(obj[prop]).toBeDefined()
      })
    })
  })

  it('벤치는 interactable이 true여야 함', () => {
    const { layers } = tilemapData
    const bench = layers.decoration.objects.find(obj => obj.name === '벤치')
    expect(bench).toBeDefined()
    expect(bench.interactable).toBe(true)
    expect(bench.action).toEqual('sit')
  })
})

describe('건물 스프라이트 소스 좌표 시스템 테스트', () => {
  /**
   * GameCanvas.jsx의 buildingSources 객체와 일치하는지 검증
   */
  const buildingSources = {
    shop: { x: 0, y: 0, width: 128, height: 128 },
    cafe: { x: 128, y: 0, width: 128, height: 128 },
    park: { x: 256, y: 0, width: 200, height: 160 },
    library: { x: 464, y: 0, width: 150, height: 140 },
    gym: { x: 620, y: 0, width: 160, height: 140 }
  }

  it('buildingSources 객체의 각 소스는 x, y, width, height 속성을 가져야 함', () => {
    Object.values(buildingSources).forEach(source => {
      expect(source.x).toBeDefined()
      expect(source.y).toBeDefined()
      expect(source.width).toBeDefined()
      expect(source.height).toBeDefined()
      expect(typeof source.x).toBe('number')
      expect(typeof source.y).toBe('number')
      expect(typeof source.width).toBe('number')
      expect(typeof source.height).toBe('number')
    })
  })

  it('buildingSources의 소스 좌표는 음수가 아니어야 함', () => {
    Object.values(buildingSources).forEach(source => {
      expect(source.x).toBeGreaterThanOrEqual(0)
      expect(source.y).toBeGreaterThanOrEqual(0)
      expect(source.width).toBeGreaterThan(0)
      expect(source.height).toBeGreaterThan(0)
    })
  })

  it('buildingSources의 소스는 서로 겹치지 않아야 함', () => {
    const sources = Object.values(buildingSources)
    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const a = sources[i]
        const b = sources[j]

        const aRight = a.x + a.width
        const aBottom = a.y + a.height
        const bRight = b.x + b.width
        const bBottom = b.y + b.height

        // 가로 방향 겹침 확인
        const overlapX = a.x < bRight && aRight > b.x
        // 세로 방향 겹침 확인
        const overlapY = a.y < bBottom && aBottom > b.y

        expect(overlapX && overlapY).toBe(false)
      }
    }
  })

  it('모든 건물 스프라이트 타입이 buildingSources에 정의되어 있어야 함', () => {
    const { layers } = tilemapData
    const buildingTypes = layers.buildings.buildings.map(b => b.type)

    buildingTypes.forEach(type => {
      expect(buildingSources[type]).toBeDefined()
    })
  })

  it('SVG viewBox (0 0 800 200) 내에 소스 좌표가 모두 들어가야 함', () => {
    const svgViewBox = { width: 800, height: 200 }

    Object.values(buildingSources).forEach(source => {
      const rightEdge = source.x + source.width
      const bottomEdge = source.y + source.height

      expect(rightEdge).toBeLessThanOrEqual(svgViewBox.width)
      expect(bottomEdge).toBeLessThanOrEqual(svgViewBox.height)
    })
  })
})

describe('날씨 및 조명 시스템 검증', () => {
  it('weather 객체가 존재해야 함', () => {
    expect(tilemapData.weather).toBeDefined()
    expect(tilemapData.weather.current).toBeDefined()
    expect(tilemapData.weather.types).toBeDefined()
  })

  it('weather types에 4개 날씨 타입이 존재해야 함', () => {
    const { weather } = tilemapData
    expect(weather.types).toEqual(['sunny', 'cloudy', 'rainy', 'snowy'])
  })

  it('lighting 객체가 존재해야 함', () => {
    expect(tilemapData.lighting).toBeDefined()
    expect(tilemapData.lighting.ambient).toBeDefined()
    expect(tilemapData.lighting.timeOfDay).toBeDefined()
  })

  it('lighting Ambient가 올바른 구조를 가져야 함', () => {
    const { lighting } = tilemapData
    const ambientProps = ['brightness', 'color']

    ambientProps.forEach(prop => {
      expect(lighting.ambient[prop]).toBeDefined()
      expect(typeof lighting.ambient.brightness).toBe('number')
      expect(typeof lighting.ambient.color).toBe('string')
    })
  })

  it('lighting brightness는 0~1 범위여야 함', () => {
    const { lighting } = tilemapData
    expect(lighting.ambient.brightness).toBeGreaterThan(0)
    expect(lighting.ambient.brightness).toBeLessThanOrEqual(1)
  })
})