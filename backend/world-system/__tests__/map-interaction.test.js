/**
 * 맵 상호작용 시스템 테스트
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  INTERACTION_TYPES,
  recordInteraction,
  getInteractions,
  getInteractionsByMap,
  getInteractionsByType,
  getInteractionsByTarget,
  getInteractionCount,
  clearInteractions,
  exportInteractionData,
  importInteractionData
} from '../map-interaction.js'

describe('맵 상호작용 시스템', () => {
  const testCharacterId = 'character_001'
  const testMapId = 'main_plaza'

  beforeEach(() => {
    // 각 테스트 전에 데이터 초기화
    importInteractionData({})
  })

  afterEach(() => {
    // 각 테스트 후에 데이터 정리
    importInteractionData({})
  })

  describe('INTERACTION_TYPES', () => {
    it('모든 상호작션 유형이 정의되어야 함', () => {
      expect(INTERACTION_TYPES.CLICK).toBe('click')
      expect(INTERACTION_TYPES.HOVER).toBe('hover')
      expect(INTERACTION_TYPES.DRAG).toBe('drag')
      expect(INTERACTION_TYPES.DOUBLE_CLICK).toBe('double_click')
      expect(INTERACTION_TYPES.RIGHT_CLICK).toBe('right_click')
    })
  })

  describe('recordInteraction', () => {
    it('상호작션을 기록할 수 있어야 함', () => {
      const result = recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId,
        x: 100,
        y: 200
      })

      expect(result).toBe(true)
    })

    it('기본 상호작션 유형을 사용해야 함', () => {
      recordInteraction(testCharacterId, {
        mapId: testMapId,
        x: 100,
        y: 200
      })

      const interactions = getInteractions(testCharacterId)

      expect(interactions[0].type).toBe(INTERACTION_TYPES.CLICK)
    })

    it('기본 맵 ID를 사용해야 함', () => {
      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        x: 100,
        y: 200
      })

      const interactions = getInteractions(testCharacterId)

      expect(interactions[0].mapId).toBe('default')
    })

    it('고유 ID를 생성해야 함', () => {
      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId
      })

      const interactions = getInteractions(testCharacterId)

      expect(interactions[0].id).toBeDefined()
      expect(typeof interactions[0].id).toBe('string')
    })

    it('타임스탬프를 기록해야 함', () => {
      const beforeTime = Date.now()
      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId
      })
      const afterTime = Date.now()

      const interactions = getInteractions(testCharacterId)

      expect(interactions[0].timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(interactions[0].timestamp).toBeLessThanOrEqual(afterTime)
    })

    it('메타데이터를 저장해야 함', () => {
      const metadata = { custom: 'data', test: 123 }
      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId,
        metadata
      })

      const interactions = getInteractions(testCharacterId)

      expect(interactions[0].metadata).toEqual(metadata)
    })

    it('여러 상호작션을 기록할 수 있어야 함', () => {
      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId,
        x: 100
      })

      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.HOVER,
        mapId: testMapId,
        x: 200
      })

      const interactions = getInteractions(testCharacterId)

      expect(interactions).toHaveLength(2)
    })
  })

  describe('getInteractions', () => {
    it('데이터가 없으면 빈 배열을 반환해야 함', () => {
      const interactions = getInteractions('nonexistent')

      expect(interactions).toEqual([])
    })

    it('모든 상호작션 기록을 반환해야 함', () => {
      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId
      })

      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.HOVER,
        mapId: testMapId
      })

      const interactions = getInteractions(testCharacterId)

      expect(interactions).toHaveLength(2)
    })

    it('기록된 순서대로 반환해야 함', () => {
      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId
      })

      setTimeout(() => {
        recordInteraction(testCharacterId, {
          type: INTERACTION_TYPES.HOVER,
          mapId: testMapId
        })

        const interactions = getInteractions(testCharacterId)

        expect(interactions[0].type).toBe(INTERACTION_TYPES.CLICK)
        expect(interactions[1].type).toBe(INTERACTION_TYPES.HOVER)
      }, 100)
    })
  })

  describe('getInteractionsByMap', () => {
    beforeEach(() => {
      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId
      })

      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: 'beach'
      })

      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId
      })
    })

    it('맵별로 상호작션을 필터링해야 함', () => {
      const plazaInteractions = getInteractionsByMap(testCharacterId, testMapId)
      const beachInteractions = getInteractionsByMap(testCharacterId, 'beach')

      expect(plazaInteractions).toHaveLength(2)
      expect(beachInteractions).toHaveLength(1)
    })

    it('없는 맵은 빈 배열을 반환해야 함', () => {
      const interactions = getInteractionsByMap(testCharacterId, 'nonexistent_map')

      expect(interactions).toEqual([])
    })
  })

  describe('getInteractionsByType', () => {
    beforeEach(() => {
      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId
      })

      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.HOVER,
        mapId: testMapId
      })

      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId
      })
    })

    it('유형별로 상호작션을 필터링해야 함', () => {
      const clickInteractions = getInteractionsByType(testCharacterId, INTERACTION_TYPES.CLICK)
      const hoverInteractions = getInteractionsByType(testCharacterId, INTERACTION_TYPES.HOVER)

      expect(clickInteractions).toHaveLength(2)
      expect(hoverInteractions).toHaveLength(1)
    })

    it('없는 유형은 빈 배열을 반환해야 함', () => {
      const interactions = getInteractionsByType(testCharacterId, 'nonexistent_type')

      expect(interactions).toEqual([])
    })
  })

  describe('getInteractionsByTarget', () => {
    beforeEach(() => {
      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId,
        target: 'building_001'
      })

      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId,
        target: 'npc_001'
      })

      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId,
        target: 'building_001'
      })
    })

    it('타겟별로 상호작션을 필터링해야 함', () => {
      const buildingInteractions = getInteractionsByTarget(testCharacterId, 'building_001')
      const npcInteractions = getInteractionsByTarget(testCharacterId, 'npc_001')

      expect(buildingInteractions).toHaveLength(2)
      expect(npcInteractions).toHaveLength(1)
    })

    it('없는 타겟은 빈 배열을 반환해야 함', () => {
      const interactions = getInteractionsByTarget(testCharacterId, 'nonexistent_target')

      expect(interactions).toEqual([])
    })
  })

  describe('getInteractionCount', () => {
    beforeEach(() => {
      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId
      })

      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.HOVER,
        mapId: testMapId
      })

      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId
      })
    })

    it('총 상호작션 수를 반환해야 함', () => {
      const count = getInteractionCount(testCharacterId)

      expect(count).toBe(3)
    })

    it('맵별 상호작션 수를 반환해야 함', () => {
      const count = getInteractionCount(testCharacterId, testMapId)

      expect(count).toBe(3)
    })

    it('데이터가 없으면 0을 반환해야 함', () => {
      const count = getInteractionCount('nonexistent')

      expect(count).toBe(0)
    })
  })

  describe('clearInteractions', () => {
    beforeEach(() => {
      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId
      })
    })

    it('모든 상호작션을 정리할 수 있어야 함', () => {
      clearInteractions(testCharacterId)

      const interactions = getInteractions(testCharacterId)

      expect(interactions).toEqual([])
    })

    it('맵별로 상호작션을 정리할 수 있어야 함', () => {
      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: 'beach'
      })

      clearInteractions(testCharacterId, testMapId)

      const plazaInteractions = getInteractionsByMap(testCharacterId, testMapId)
      const beachInteractions = getInteractionsByMap(testCharacterId, 'beach')

      expect(plazaInteractions).toEqual([])
      expect(beachInteractions).toHaveLength(1)
    })
  })

  describe('exportInteractionData / importInteractionData', () => {
    beforeEach(() => {
      recordInteraction(testCharacterId, {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId,
        x: 100,
        y: 200
      })

      recordInteraction('character_002', {
        type: INTERACTION_TYPES.CLICK,
        mapId: testMapId
      })
    })

    it('데이터를 내보내야 함', () => {
      const exported = exportInteractionData()

      expect(exported).toBeDefined()
      expect(exported[testCharacterId]).toBeDefined()
      expect(exported[testCharacterId].interactions).toHaveLength(1)
    })

    it('데이터를 불러올 수 있어야 함', () => {
      const exported = exportInteractionData()

      importInteractionData({})

      expect(getInteractions(testCharacterId)).toHaveLength(0)

      importInteractionData(exported)

      expect(getInteractions(testCharacterId)).toHaveLength(1)
    })

    it('여러 캐릭터의 데이터를 보존해야 함', () => {
      const exported = exportInteractionData()

      importInteractionData({})
      importInteractionData(exported)

      expect(getInteractions(testCharacterId)).toHaveLength(1)
      expect(getInteractions('character_002')).toHaveLength(1)
    })
  })
})