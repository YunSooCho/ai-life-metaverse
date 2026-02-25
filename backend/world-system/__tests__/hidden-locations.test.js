/**
 * 숨겨진 장소 시스템 테스트
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  HIDDEN_LOCATION_TYPES,
  DISCOVERY_CONDITIONS,
  discoverHiddenLocation,
  getHiddenLocations,
  getHiddenLocationsByMap,
  findHiddenLocationById,
  isDiscovered,
  getDiscovererCount,
  getTopDiscoverers,
  exportHiddenLocationData,
  importHiddenLocationData
} from '../hidden-locations.js'

describe('숨겨진 장소 시스템', () => {
  const testCharacterId = 'character_001'
  const testMapId = 'default' // MAP_TYPES.DEFAULT

  beforeEach(() => {
    // 각 테스트 전에 데이터 초기화
    const data = exportHiddenLocationData()
    Object.keys(data).forEach(key => {
      delete data[key]
    })
    importHiddenLocationData(data)
  })

  afterEach(() => {
    // 각 테스트 후에 데이터 정리
    const data = exportHiddenLocationData()
    Object.keys(data).forEach(key => {
      delete data[key]
    })
    importHiddenLocationData(data)
  })

  describe('HIDDEN_LOCATION_TYPES', () => {
    it('모든 숨겨진 장소 유형이 정의되어야 함', () => {
      expect(HIDDEN_LOCATION_TYPES.SECRET_ROOM).toBe('secret_room')
      expect(HIDDEN_LOCATION_TYPES.TREASURE_CHEST).toBe('treasure_chest')
      expect(HIDDEN_LOCATION_TYPES.HIDDEN_PATH).toBe('hidden_path')
      expect(HIDDEN_LOCATION_TYPES.MYSTERIOUS_NPC).toBe('mysterious_npc')
      expect(HIDDEN_LOCATION_TYPES.ANCIENT_RUINS).toBe('ancient_ruins')
      expect(HIDDEN_LOCATION_TYPES.SECRET_SHOP).toBe('secret_shop')
    })
  })

  describe('DISCOVERY_CONDITIONS', () => {
    it('모든 발견 조건이 정의되어야 함', () => {
      expect(DISCOVERY_CONDITIONS.CLICK).toBe('click')
      expect(DISCOVERY_CONDITIONS.PROXIMITY).toBe('proximity')
      expect(DISCOVERY_CONDITIONS.ITEM).toBe('item')
      expect(DISCOVERY_CONDITIONS.QUEST).toBe('quest')
      expect(DISCOVERY_CONDITIONS.TIME).toBe('time')
      expect(DISCOVERY_CONDITIONS.WEATHER).toBe('weather')
      expect(DISCOVERY_CONDITIONS.SOCIAL).toBe('social')
    })
  })

  describe('getHiddenLocations', () => {
    it('모든 숨겨진 장소를 반환해야 함', () => {
      const locations = getHiddenLocations()

      expect(locations).toBeDefined()
      expect(Array.isArray(locations)).toBe(true)
      expect(locations.length).toBeGreaterThan(0)
    })

    it('각 장소에 필요한 필드가 있어야 함', () => {
      const locations = getHiddenLocations()

      locations.forEach(location => {
        expect(location.id).toBeDefined()
        expect(location.name).toBeDefined()
        expect(location.mapId).toBeDefined()
        expect(location.type).toBeDefined()
        expect(location.condition).toBeDefined()
        expect(location.x).toBeDefined()
        expect(location.y).toBeDefined()
        expect(location.rewards).toBeDefined()
      })
    })
  })

  describe('getHiddenLocationsByMap', () => {
    it('맵별 숨겨진 장소를 반환해야 함', () => {
      const locations = getHiddenLocationsByMap(testMapId)

      expect(locations).toBeDefined()
      expect(Array.isArray(locations)).toBe(true)
    })

    it('맵 ID를 정확하게 필터링해야 함', () => {
      const defaultLocations = getHiddenLocationsByMap(testMapId)
      const beachLocations = getHiddenLocationsByMap('beach')

      defaultLocations.forEach(location => {
        expect(location.mapId).toBe(testMapId)
      })

      beachLocations.forEach(location => {
        expect(location.mapId).toBe('beach')
      })
    })

    it('없는 맵은 빈 배열을 반환해야 함', () => {
      const locations = getHiddenLocationsByMap('nonexistent_map')

      expect(locations).toEqual([])
    })
  })

  describe('findHiddenLocationById', () => {
    it('ID로 장소를 찾을 수 있어야 함', () => {
      const locations = getHiddenLocations()
      if (locations.length > 0) {
        const firstId = locations[0].id
        const found = findHiddenLocationById(firstId)

        expect(found).toBeDefined()
        expect(found.id).toBe(firstId)
      }
    })

    it('없는 ID는 null을 반환해야 함', () => {
      const found = findHiddenLocationById('nonexistent_id')

      expect(found).toBeNull()
    })
  })

  describe('discoverHiddenLocation', () => {
    let testLocationId

    beforeEach(() => {
      const locations = getHiddenLocationsByMap(testMapId)
      if (locations.length > 0) {
        testLocationId = locations[0].id
      }
    })

    it('존재하지 않는 장소는 발견할 수 없음', () => {
      const result = discoverHiddenLocation(testCharacterId, 'nonexistent_id')

      expect(result.success).toBe(false)
    })

    it('기본 조건으로 장소를 발견할 수 있어야 함', () => {
      const result = discoverHiddenLocation(testCharacterId, testLocationId)

      expect(result.success).toBe(true)
      expect(result.location).toBeDefined()
      expect(result.rewards).toBeDefined()
    })

    it('이미 발견한 장소는 다시 발견할 수 없음', () => {
      discoverHiddenLocation(testCharacterId, testLocationId)
      const result = discoverHiddenLocation(testCharacterId, testLocationId)

      expect(result.success).toBe(false)
      expect(result.message).toContain('이미 발견')
    })

    it('발견 시간을 기록해야 함', () => {
      const beforeTime = Date.now()
      discoverHiddenLocation(testCharacterId, testLocationId)
      const afterTime = Date.now()

      const locationData = isDiscovered(testCharacterId, testLocationId)

      expect(locationData.discoveredAt).toBeGreaterThanOrEqual(beforeTime)
      expect(locationData.discoveredAt).toBeLessThanOrEqual(afterTime)
    })

    it('다른 캐릭터의 발견을 독립적으로 추적해야 함', () => {
      discoverHiddenLocation(testCharacterId, testLocationId)
      const character2Result = discoverHiddenLocation('character_002', testLocationId)

      expect(character2Result.success).toBe(true)
    })

    it('리워드를 반환해야 함', () => {
      const result = discoverHiddenLocation(testCharacterId, testLocationId)

      expect(result.rewards).toBeDefined()
      expect(Array.isArray(result.rewards)).toBe(true)

      if (result.rewards.length > 0) {
        expect(result.rewards[0].type).toBeDefined()
      }
    })
  })

  describe('isDiscovered', () => {
    let testLocationId

    beforeEach(() => {
      const locations = getHiddenLocationsByMap(testMapId)
      if (locations.length > 0) {
        testLocationId = locations[0].id
      }
    })

    it('발견하지 않으면 false를 반환해야 함', () => {
      const result = isDiscovered(testCharacterId, testLocationId)

      expect(result).toBe(false)
    })

    it('발견한 장소는 true를 반환해야 함', () => {
      discoverHiddenLocation(testCharacterId, testLocationId)
      const result = isDiscovered(testCharacterId, testLocationId)

      expect(result).toBe(true)
    })

    it('발견 데이터를 포함해야 함', () => {
      discoverHiddenLocation(testCharacterId, testLocationId)
      const result = isDiscovered(testCharacterId, testLocationId)

      if (result !== false) {
        expect(result.discoveredAt).toBeDefined()
        expect(result.locationId).toBe(testLocationId)
      }
    })

    it('없는 장소는 false를 반환해야 함', () => {
      const result = isDiscovered(testCharacterId, 'nonexistent_id')

      expect(result).toBe(false)
    })
  })

  describe('getDiscovererCount', () => {
    let testLocationId

    beforeEach(() => {
      const locations = getHiddenLocationsByMap(testMapId)
      if (locations.length > 0) {
        testLocationId = locations[0].id
      }
    })

    it('발견자 수를 반환해야 함', () => {
      discoverHiddenLocation(testCharacterId, testLocationId)
      const count = getDiscovererCount(testLocationId)

      expect(count).toBe(1)
    })

    it('발견자가 없으면 0을 반환해야 함', () => {
      const count = getDiscovererCount(testLocationId)

      expect(count).toBe(0)
    })

    it('여러 발견자를 카운트해야 함', () => {
      discoverHiddenLocation(testCharacterId, testLocationId)
      discoverHiddenLocation('character_002', testLocationId)
      discoverHiddenLocation('character_003', testLocationId)

      const count = getDiscovererCount(testLocationId)

      expect(count).toBe(3)
    })

    it('중복 발견은 카운트하지 않아야 함', () => {
      discoverHiddenLocation(testCharacterId, testLocationId)
      discoverHiddenLocation(testCharacterId, testLocationId)

      const count = getDiscovererCount(testLocationId)

      expect(count).toBe(1)
    })
  })

  describe('getTopDiscoverers', () => {
    let testLocationId

    beforeEach(() => {
      const locations = getHiddenLocationsByMap(testMapId)
      if (locations.length > 0) {
        testLocationId = locations[0].id
      }
    })

    it('발견자 랭킹을 반환해야 함', () => {
      discoverHiddenLocation(testCharacterId, testLocationId)
      discoverHiddenLocation('character_002', testLocationId)

      const rankings = getTopDiscoverers(testLocationId, 10)

      expect(rankings).toHaveLength(2)
      expect(rankings[0].characterId).toBeDefined()
      expect(rankings[0].discoveredAt).toBeDefined()
    })

    it('발견 시간순으로 정렬해야 함', () => {
      discoverHiddenLocation(testCharacterId, testLocationId)
      setTimeout(() => {
        discoverHiddenLocation('character_002', testLocationId)
        discoverHiddenLocation('character_003', testLocationId)

        const rankings = getTopDiscoverers(testLocationId, 10)

        expect(rankings[0].characterId).toBe(testCharacterId)
        expect(rankings[1].characterId).toBe('character_002')
      }, 100)
    })

    it('limit 만큼만 반환해야 함', () => {
      discoverHiddenLocation(testCharacterId, testLocationId)
      discoverHiddenLocation('character_002', testLocationId)
      discoverHiddenLocation('character_003', testLocationId)

      const rankings = getTopDiscoverers(testLocationId, 2)

      expect(rankings.length).toBeLessThanOrEqual(2)
    })
  })

  describe('exportHiddenLocationData / importHiddenLocationData', () => {
    let testLocationId

    beforeEach(() => {
      const locations = getHiddenLocationsByMap(testMapId)
      if (locations.length > 0) {
        testLocationId = locations[0].id
      }
      discoverHiddenLocation(testCharacterId, testLocationId)
      discoverHiddenLocation('character_002', testLocationId)
    })

    it('데이터를 내보내야 함', () => {
      const exported = exportHiddenLocationData()

      expect(exported).toBeDefined()
      expect(exported.discoveries).toBeDefined()
      expect(Array.isArray(exported.discoveries)).toBe(true)
    })

    it('데이터를 불러올 수 있어야 함', () => {
      const exported = exportHiddenLocationData()

      const emptyData = exportHiddenLocationData()
      Object.keys(emptyData).forEach(key => {
        delete emptyData[key]
      })
      importHiddenLocationData(emptyData)

      expect(isDiscovered(testCharacterId, testLocationId)).toBe(false)

      importHiddenLocationData(exported)

      expect(isDiscovered(testCharacterId, testLocationId)).toBe(true)
    })

    it('모든 발견 데이터를 보존해야 함', () => {
      const exported = exportHiddenLocationData()

      const emptyData = exportHiddenLocationData()
      Object.keys(emptyData).forEach(key => {
        delete emptyData[key]
      })
      importHiddenLocationData(emptyData)
      importHiddenLocationData(exported)

      expect(isDiscovered(testCharacterId, testLocationId)).toBe(true)
      expect(isDiscovered('character_002', testLocationId)).toBe(true)
    })
  })
})