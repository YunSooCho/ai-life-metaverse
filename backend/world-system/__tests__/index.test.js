/**
 * 월드 시스템 통합 테스트
 */

import { describe, it, test, expect } from 'vitest'
import {
  initializeWorldSystem,
  getMapCompleteData
} from '../index.js'
import {
  MAP_TYPES,
  getBuildingsByMap,
  getAllBuildings
} from '../buildings.js'
import {
  getMap,
  getAllMaps
} from '../maps.js'
import {
  getNPCsByMap,
  getAllNPCs
} from '../npcs.js'

describe('월드 시스템 통합 테스트', () => {
  describe('initializeWorldSystem', () => {
    test('월드 시스템을 초기화해야 함', () => {
      const worldData = initializeWorldSystem()

      expect(worldData).toBeDefined()
      expect(worldData.maps).toBeDefined()
      expect(worldData.buildings).toBeDefined()
      expect(worldData.npcs).toBeDefined()
    })

    test('반환된 맵 수가 4개여야 함', () => {
      const worldData = initializeWorldSystem()
      expect(worldData.maps).toHaveLength(4)
    })

    test('반환된 건물 수가 14개여야 함', () => {
      const worldData = initializeWorldSystem()
      expect(worldData.buildings).toHaveLength(14)
    })

    test('반환된 NPC 수가 11개여야 함', () => {
      const worldData = initializeWorldSystem()
      expect(worldData.npcs).toHaveLength(11)
    })

    test('반환된 데이터의 유형이 올바른 배열이어야 함', () => {
      const worldData = initializeWorldSystem()

      expect(Array.isArray(worldData.maps)).toBe(true)
      expect(Array.isArray(worldData.buildings)).toBe(true)
      expect(Array.isArray(worldData.npcs)).toBe(true)
    })
  })

  describe('시스템 통합 검증', () => {
    test('모든 맵에는 최소 1개의 건물이 있어야 함', () => {
      const allMaps = getAllMaps()

      allMaps.forEach(map => {
        const buildings = getBuildingsByMap(map.id)
        expect(buildings.length).toBeGreaterThan(0)
      })
    })

    test('모든 맵에는 최소 2개의 NPC가 있어야 함', () => {
      const allMaps = getAllMaps()

      allMaps.forEach(map => {
        const npcs = getNPCsByMap(map.id)
        expect(npcs.length).toBeGreaterThan(0)
      })
    })

    test('모든 건물의 mapType이 올바른지 확인', () => {
      const allBuildings = getAllBuildings()
      const validMapTypes = Object.values(MAP_TYPES)

      allBuildings.forEach(building => {
        expect(validMapTypes).toContain(building.mapType)
      })
    })

    test('모든 NPC의 mapType이 올바른지 확인', () => {
      const allNPCs = getAllNPCs()
      const validMapTypes = Object.values(MAP_TYPES)

      allNPCs.forEach(npc => {
        expect(validMapTypes).toContain(npc.mapType)
      })
    })

    test('맵 ID와 건물의 mapType이 일치해야 함', () => {
      const allMaps = getAllMaps()

      allMaps.forEach(map => {
        const buildings = getBuildingsByMap(map.id)
        buildings.forEach(building => {
          expect(building.mapType).toBe(map.id)
        })
      })
    })

    test('맵 ID와 NPC의 mapType이 일치해야 함', () => {
      const allMaps = getAllMaps()

      allMaps.forEach(map => {
        const npcs = getNPCsByMap(map.id)
        npcs.forEach(npc => {
          expect(npc.mapType).toBe(map.id)
        })
      })
    })
  })

  describe('getMapCompleteData', () => {
    test('맵의 완전한 데이터를 반환해야 함', () => {
      const mapData = getMapCompleteData(MAP_TYPES.DEFAULT)

      expect(mapData).toBeDefined()
      expect(mapData.map).toBeDefined()
      expect(mapData.buildings).toBeDefined()
      expect(mapData.npcs).toBeDefined()
    })

    test('기본 맵의 데이터가 올바른 구조를 가져야 함', () => {
      const mapData = getMapCompleteData(MAP_TYPES.DEFAULT)

      expect(mapData.map.id).toBe(MAP_TYPES.DEFAULT)
      expect(mapData.buildings).toHaveLength(5)
      expect(mapData.npcs).toHaveLength(2)
    })

    test('해변 맵의 데이터가 올바른 구조를 가져야 함', () => {
      const mapData = getMapCompleteData(MAP_TYPES.BEACH)

      expect(mapData.map.id).toBe(MAP_TYPES.BEACH)
      expect(mapData.buildings).toHaveLength(3)
      expect(mapData.npcs).toHaveLength(3)
    })

    test('숲 맵의 데이터가 올바른 구조를 가져야 함', () => {
      const mapData = getMapCompleteData(MAP_TYPES.FOREST)

      expect(mapData.map.id).toBe(MAP_TYPES.FOREST)
      expect(mapData.buildings).toHaveLength(3)
      expect(mapData.npcs).toHaveLength(3)
    })

    test('산맥 맵의 데이터가 올바른 구조를 가져야 함', () => {
      const mapData = getMapCompleteData(MAP_TYPES.MOUNTAIN)

      expect(mapData.map.id).toBe(MAP_TYPES.MOUNTAIN)
      expect(mapData.buildings).toHaveLength(3)
      expect(mapData.npcs).toHaveLength(3)
    })
  })

  describe('데이터 무결성', () => {
    test('모든 건물 ID는 고유해야 함', () => {
      const allBuildings = getAllBuildings()
      const ids = allBuildings.map(b => b.id)
      const uniqueIds = new Set(ids)

      expect(ids.length).toBe(uniqueIds.size)
    })

    test('모든 NPC ID는 고유해야 함', () => {
      const allNPCs = getAllNPCs()
      const ids = allNPCs.map(n => n.id)
      const uniqueIds = new Set(ids)

      expect(ids.length).toBe(uniqueIds.size)
    })

    test('건물 ID와 NPC ID가 중복되지 않아야 함', () => {
      const allBuildings = getAllBuildings()
      const allNPCs = getAllNPCs()

      const buildingIds = new Set(allBuildings.map(b => b.id))
      const npcIds = new Set(allNPCs.map(n => n.id))

      // 숫자 ID 건물 (1-303)
      const buildingNumberIds = [...buildingIds].filter(id => typeof id === 'number')

      // NPC ID는 모두 문자열이어야 하므로 건물 ID(숫자)와 중복되어서는 안 됨
      buildingNumberIds.forEach(buildingId => {
        expect(npcIds).not.toContain(buildingId)
      })
    })

    test('모든 맵에는 이름이 있어야 함', () => {
      const allMaps = getAllMaps()

      allMaps.forEach(map => {
        expect(map.name).toBeDefined()
        expect(map.name.length).toBeGreaterThan(0)
      })
    })

    test('모든 건물에는 이름이 있어야 함', () => {
      const allBuildings = getAllBuildings()

      allBuildings.forEach(building => {
        expect(building.name).toBeDefined()
        expect(building.name.length).toBeGreaterThan(0)
      })
    })

    test('모든 NPC에는 이름이 있어야 함', () => {
      const allNPCs = getAllNPCs()

      allNPCs.forEach(npc => {
        expect(npc.name).toBeDefined()
        expect(npc.name.length).toBeGreaterThan(0)
      })
    })
  })
})