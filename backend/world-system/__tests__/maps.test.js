/**
 * 맵 시스템 테스트
 */

import { describe, it, test, expect } from 'vitest'
import {
  MAPS,
  getMap,
  getAllMaps,
  mapExists,
  getMapFeaturesForRendering
} from '../maps.js'
import { MAP_TYPES } from '../buildings.js'

describe('맵 시스템', () => {
  describe('MAPS', () => {
    test('모든 맵 유형의 데이터가 정의되어 있어야 함', () => {
      expect(MAPS[MAP_TYPES.DEFAULT]).toBeDefined()
      expect(MAPS[MAP_TYPES.BEACH]).toBeDefined()
      expect(MAPS[MAP_TYPES.FOREST]).toBeDefined()
      expect(MAPS[MAP_TYPES.MOUNTAIN]).toBeDefined()
    })

    test('기본 맵의 크기가 1000x700이어야 함', () => {
      const map = MAPS[MAP_TYPES.DEFAULT]
      expect(map.width).toBe(1000)
      expect(map.height).toBe(700)
    })

    test('해변 맵의 크기가 1200x800이어야 함', () => {
      const map = MAPS[MAP_TYPES.BEACH]
      expect(map.width).toBe(1200)
      expect(map.height).toBe(800)
    })

    test('숲 맵의 크기가 1100x750이어야 함', () => {
      const map = MAPS[MAP_TYPES.FOREST]
      expect(map.width).toBe(1100)
      expect(map.height).toBe(750)
    })

    test('산맥 맵의 크기가 1300x900이어야 함', () => {
      const map = MAPS[MAP_TYPES.MOUNTAIN]
      expect(map.width).toBe(1300)
      expect(map.height).toBe(900)
    })

    test('모든 맵은 features 속성을 가져야 함', () => {
      Object.values(MAPS).forEach(map => {
        expect(map.features).toBeDefined()
        expect(Array.isArray(map.features)).toBe(true)
      })
    })
  })

  describe('getMap', () => {
    test('기본 맵을 반환해야 함', () => {
      const map = getMap(MAP_TYPES.DEFAULT)
      expect(map).toBeDefined()
      expect(map.id).toBe(MAP_TYPES.DEFAULT)
      expect(map.name).toBe('메인 광장')
    })

    test('존재하지 않는 맵 ID는 기본 맵을 반환해야 함', () => {
      const map = getMap('invalid_map_id')
      expect(map).toBe(MAPS[MAP_TYPES.DEFAULT])
    })

    test('해변 맵을 반환해야 함', () => {
      const map = getMap(MAP_TYPES.BEACH)
      expect(map).toBeDefined()
      expect(map.id).toBe(MAP_TYPES.BEACH)
      expect(map.name).toBe('해변')
    })

    test('숲 맵을 반환해야 함', () => {
      const map = getMap(MAP_TYPES.FOREST)
      expect(map).toBeDefined()
      expect(map.id).toBe(MAP_TYPES.FOREST)
      expect(map.name).toBe('숲')
    })

    test('산맥 맵을 반환해야 함', () => {
      const map = getMap(MAP_TYPES.MOUNTAIN)
      expect(map).toBeDefined()
      expect(map.id).toBe(MAP_TYPES.MOUNTAIN)
      expect(map.name).toBe('산맥')
    })

    test('맵 객체가 올바른 구조를 가져야 함', () => {
      const map = getMap(MAP_TYPES.DEFAULT)
      expect(map).toHaveProperty('id')
      expect(map).toHaveProperty('name')
      expect(map).toHaveProperty('width')
      expect(map).toHaveProperty('height')
      expect(map).toHaveProperty('backgroundColor')
      expect(map).toHaveProperty('groundColor')
      expect(map).toHaveProperty('description')
      expect(map).toHaveProperty('features')
      expect(map).toHaveProperty('weather')
    })
  })

  describe('getAllMaps', () => {
    test('모든 맵의 배열을 반환해야 함', () => {
      const allMaps = getAllMaps()
      expect(allMaps).toHaveLength(4)
    })

    test('반환된 맵들이 중복되지 않아야 함', () => {
      const allMaps = getAllMaps()
      const ids = allMaps.map(m => m.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    test('모든 맵 유형이 포함되어야 함', () => {
      const allMaps = getAllMaps()
      const mapIds = allMaps.map(m => m.id)

      expect(mapIds).toContain(MAP_TYPES.DEFAULT)
      expect(mapIds).toContain(MAP_TYPES.BEACH)
      expect(mapIds).toContain(MAP_TYPES.FOREST)
      expect(mapIds).toContain(MAP_TYPES.MOUNTAIN)
    })
  })

  describe('mapExists', () => {
    test('존재하는 맵 ID는 true를 반환해야 함', () => {
      expect(mapExists(MAP_TYPES.DEFAULT)).toBe(true)
      expect(mapExists(MAP_TYPES.BEACH)).toBe(true)
      expect(mapExists(MAP_TYPES.FOREST)).toBe(true)
      expect(mapExists(MAP_TYPES.MOUNTAIN)).toBe(true)
    })

    test('존재하지 않는 맵 ID는 false를 반환해야 함', () => {
      expect(mapExists('invalid_map_id')).toBe(false)
      expect(mapExists('')).toBe(false)
      expect(mapExists(null)).toBe(false)
    })
  })

  describe('getMapFeaturesForRendering', () => {
    test('맵 피처 배열을 반환해야 함', () => {
      const features = getMapFeaturesForRendering(MAP_TYPES.DEFAULT)
      expect(features).toBeDefined()
      expect(Array.isArray(features)).toBe(true)
    })

    test('기본 맵의 피처가 4개여야 함', () => {
      const features = getMapFeaturesForRendering(MAP_TYPES.DEFAULT)
      expect(features).toHaveLength(4)
    })

    test('해변 맵의 피처가 6개여야 함', () => {
      const features = getMapFeaturesForRendering(MAP_TYPES.BEACH)
      expect(features).toHaveLength(6)
    })

    test('숲 맵의 피처가 7개여야 함', () => {
      const features = getMapFeaturesForRendering(MAP_TYPES.FOREST)
      expect(features).toHaveLength(7)
    })

    test('산맥 맵의 피처가 9개여야 함', () => {
      const features = getMapFeaturesForRendering(MAP_TYPES.MOUNTAIN)
      expect(features).toHaveLength(9)
    })

    test('존재하지 않는 맵 ID는 빈 배열을 반환해야 함', () => {
      const features = getMapFeaturesForRendering('invalid_map_id')
      expect(features).toEqual([])
    })

    test('피처 객체가 type과 color 속성을 가져야 함', () => {
      const features = getMapFeaturesForRendering(MAP_TYPES.BEACH)
      features.forEach(feature => {
        expect(feature).toHaveProperty('type')
        expect(feature).toHaveProperty('color')
      })
    })
  })
})