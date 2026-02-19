/**
 * 건물 시스템 테스트
 */

import { describe, it, test, expect } from 'vitest'
import {
  MAP_TYPES,
  BUILDINGS_BY_MAP,
  getBuildingsByMap,
  findBuildingById,
  getAllBuildings
} from '../buildings.js'

describe('건물 시스템', () => {
  describe('MAP_TYPES', () => {
    test('모든 맵 유형 상수가 정의되어 있어야 함', () => {
      expect(MAP_TYPES.DEFAULT).toBe('default')
      expect(MAP_TYPES.BEACH).toBe('beach')
      expect(MAP_TYPES.FOREST).toBe('forest')
      expect(MAP_TYPES.MOUNTAIN).toBe('mountain')
    })
  })

  describe('BUILDINGS_BY_MAP', () => {
    test('기본 맵의 건물이 5개여야 함', () => {
      expect(BUILDINGS_BY_MAP[MAP_TYPES.DEFAULT]).toHaveLength(5)
    })

    test('해변 맵의 건물이 3개여야 함', () => {
      expect(BUILDINGS_BY_MAP[MAP_TYPES.BEACH]).toHaveLength(3)
    })

    test('숲 맵의 건물이 3개여야 함', () => {
      expect(BUILDINGS_BY_MAP[MAP_TYPES.FOREST]).toHaveLength(3)
    })

    test('산맥 맵의 건물이 3개여야 함', () => {
      expect(BUILDINGS_BY_MAP[MAP_TYPES.MOUNTAIN]).toHaveLength(3)
    })

    test('모든 맵 유형이 존재해야 함', () => {
      const mapTypes = Object.values(MAP_TYPES)
      mapTypes.forEach(mapType => {
        expect(BUILDINGS_BY_MAP[mapType]).toBeDefined()
      })
    })
  })

  describe('getBuildingsByMap', () => {
    test('기본 맵의 건물 목록을 반환해야 함', () => {
      const buildings = getBuildingsByMap(MAP_TYPES.DEFAULT)
      expect(buildings).toBe(BUILDINGS_BY_MAP[MAP_TYPES.DEFAULT])
      expect(buildings).toHaveLength(5)
    })

    test('존재하지 않은 맵 유형은 기본 맵의 건물을 반환해야 함', () => {
      const buildings = getBuildingsByMap('invalid_map_type')
      expect(buildings).toBe(BUILDINGS_BY_MAP[MAP_TYPES.DEFAULT])
    })

    test('해변 맵의 건물 목록을 반환해야 함', () => {
      const buildings = getBuildingsByMap(MAP_TYPES.BEACH)
      expect(buildings).toHaveLength(3)
      expect(buildings[0].mapType).toBe(MAP_TYPES.BEACH)
    })

    test('건물 객체가 올바른 구조를 가져야 함', () => {
      const buildings = getBuildingsByMap(MAP_TYPES.DEFAULT)
      buildings.forEach(building => {
        expect(building).toHaveProperty('id')
        expect(building).toHaveProperty('name')
        expect(building).toHaveProperty('x')
        expect(building).toHaveProperty('y')
        expect(building).toHaveProperty('width')
        expect(building).toHaveProperty('height')
        expect(building).toHaveProperty('type')
        expect(building).toHaveProperty('color')
        expect(building).toHaveProperty('mapType')
      })
    })
  })

  describe('findBuildingById', () => {
    test('존재하는 건물 ID로 찾을 수 있어야 함', () => {
      const building = findBuildingById(1)
      expect(building).toBeDefined()
      expect(building.id).toBe(1)
      expect(building.name).toBe('상점')
    })

    test('존재하지 않는 건물 ID는 null을 반환해야 함', () => {
      const building = findBuildingById(9999)
      expect(building).toBeNull()
    })

    test('해변 맵의 건물을 찾을 수 있어야 함', () => {
      const building = findBuildingById(101)
      expect(building).toBeDefined()
      expect(building.id).toBe(101)
      expect(building.name).toBe('해변 카페')
      expect(building.mapType).toBe(MAP_TYPES.BEACH)
    })

    test('숲 맵의 건물을 찾을 수 있어야 함', () => {
      const building = findBuildingById(201)
      expect(building).toBeDefined()
      expect(building.id).toBe(201)
      expect(building.name).toBe('숲길 카페')
      expect(building.mapType).toBe(MAP_TYPES.FOREST)
    })

    test('산맥 맵의 건물을 찾을 수 있어야 함', () => {
      const building = findBuildingById(301)
      expect(building).toBeDefined()
      expect(building.id).toBe(301)
      expect(building.name).toBe('산장 스키장')
      expect(building.mapType).toBe(MAP_TYPES.MOUNTAIN)
    })
  })

  describe('getAllBuildings', () => {
    test('모든 맵의 모든 건물을 반환해야 함', () => {
      const allBuildings = getAllBuildings()
      const expectedCount = 5 + 3 + 3 + 3  // 14개
      expect(allBuildings).toHaveLength(expectedCount)
    })

    test('반환된 건물들이 중복되지 않아야 함', () => {
      const allBuildings = getAllBuildings()
      const ids = allBuildings.map(b => b.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    test('같은 ID의 건물이 없어야 함', () => {
      const allBuildings = getAllBuildings()
      const idCounts = {}
      allBuildings.forEach(building => {
        idCounts[building.id] = (idCounts[building.id] || 0) + 1
      })

      Object.values(idCounts).forEach(count => {
        expect(count).toBe(1)
      })
    })
  })
})