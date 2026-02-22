/**
 * 맵 전환 시스템 테스트
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  TRANSITION_TYPES,
  TRANSITION_DIRECTIONS,
  MAP_CONNECTIONS,
  canTransition,
  getTransitionConfig,
  performTransition,
  transitionToMap,
  getTransitionHistory,
  exportTransitionData,
  importTransitionData
} from '../map-transitions.js'

describe('맵 전환 시스템', () => {
  const testCharacterId = 'character_001'
  const testMapId = 'main_plaza'

  beforeEach(() => {
    // 각 테스트 전에 데이터 초기화
    importTransitionData({})
  })

  afterEach(() => {
    // 각 테스트 후에 데이터 정리
    importTransitionData({})
  })

  describe('TRANSITION_TYPES', () => {
    it('모든 전환 유형이 정의되어야 함', () => {
      expect(TRANSITION_TYPES.FADE).toBe('fade')
      expect(TRANSITION_TYPES.SLIDE).toBe('slide')
      expect(TRANSITION_TYPES.ZOOM).toBe('zoom')
      expect(TRANSITION_TYPES.WIPE).toBe('wipe')
      expect(TRANSITION_TYPES.DISSOLVE).toBe('dissolve')
      expect(TRANSITION_TYPES.CIRCLE).toBe('circle')
      expect(TRANSITION_TYPES.BLUR).toBe('blur')
    })
  })

  describe('TRANSITION_DIRECTIONS', () => {
    it('모든 전환 방향이 정의되어야 함', () => {
      expect(TRANSITION_DIRECTIONS.LEFT).toBe('left')
      expect(TRANSITION_DIRECTIONS.RIGHT).toBe('right')
      expect(TRANSITION_DIRECTIONS.UP).toBe('up')
      expect(TRANSITION_DIRECTIONS.DOWN).toBe('down')
      expect(TRANSITION_DIRECTIONS.CENTER).toBe('center')
    })
  })

  describe('MAP_CONNECTIONS', () => {
    it('모든 맵 연결이 정의되어야 함', () => {
      expect(MAP_CONNECTIONS.default).toBeDefined()
      expect(MAP_CONNECTIONS.beach).toBeDefined()
      expect(MAP_CONNECTIONS.forest).toBeDefined()
      expect(MAP_CONNECTIONS.mountain).toBeDefined()
    })

    it('각 연결에 필요한 필드가 있어야 함', () => {
      const connection = MAP_CONNECTIONS.default

      expect(connection.name).toBeDefined()
      expect(connection.nextMaps).toBeDefined()
      expect(connection.defaultTransition).toBeDefined()
    })

    it('연결 관계가 쌍방향이어야 함', () => {
      expect(MAP_CONNECTIONS.default.nextMaps).toContain('beach')
      expect(MAP_CONNECTIONS.beach.nextMaps).toContain('default')
    })
  })

  describe('canTransition', () => {
    it('연결된 맵 간 전환이 가능해야 함', () => {
      const result = canTransition('default', 'beach')

      expect(result).toBe(true)
    })

    it('연결되지 않은 맵 간 전환은 불가능해야 함', () => {
      const result = canTransition('beach', 'forest')

      expect(result).toBe(false)
    })

    it('같은 맵으로의 전환은 불가능해야 함', () => {
      const result = canTransition('default', 'default')

      expect(result).toBe(false)
    })

    it('존재하지 않는 맵으로의 전환은 불가능해야 함', () => {
      const result = canTransition('default', 'nonexistent_map')

      expect(result).toBe(false)
    })

    it('존재하지 않는 맵에서의 전환은 불가능해야 함', () => {
      const result = canTransition('nonexistent_map', 'beach')

      expect(result).toBe(false)
    })
  })

  describe('getTransitionConfig', () => {
    it('전환 설정을 조회할 수 있어야 함', () => {
      const config = getTransitionConfig('default', 'beach')

      expect(config).toBeDefined()
      expect(config.type).toBeDefined()
      expect(config.duration).toBeDefined()
    })

    it('기본 전환 설정을 사용해야 함', () => {
      const config = getTransitionConfig('beach', 'default')

      expect(config.type).toBe(TRANSITION_TYPES.SLIDE)
      expect(config.direction).toBe(TRANSITION_DIRECTIONS.RIGHT)
      expect(config.duration).toBe(1200)
    })

    it('커스텀 전환 설정을 적용할 수 있어야 함', () => {
      const customConfig = {
        type: TRANSITION_TYPES.ZOOM,
        duration: 2000
      }

      const config = getTransitionConfig('default', 'beach', customConfig)

      expect(config.type).toBe(TRANSITION_TYPES.ZOOM)
      expect(config.duration).toBe(2000)
    })

    it('불가능한 전환은 null을 반환해야 함', () => {
      const config = getTransitionConfig('beach', 'forest')

      expect(config).toBeNull()
    })
  })

  describe('performTransition', () => {
    it('전환을 수행할 수 있어야 함', () => {
      const result = performTransition(testCharacterId, 'default', 'beach')

      expect(result.success).toBe(true)
      expect(result.fromMap).toBe('default')
      expect(result.toMap).toBe('beach')
      expect(result.config).toBeDefined()
    })

    it('불가능한 전환은 실패해야 함', () => {
      const result = performTransition(testCharacterId, 'beach', 'forest')

      expect(result.success).toBe(false)
    })

    it('전환 설정을 포함해야 함', () => {
      const result = performTransition(testCharacterId, 'default', 'beach')

      expect(result.config).toBeDefined()
      expect(result.config.type).toBeDefined()
      expect(result.config.duration).toBeDefined()
    })

    it('전환 시간을 기록해야 함', () => {
      const beforeTime = Date.now()
      const result = performTransition(testCharacterId, 'default', 'beach')
      const afterTime = Date.now()

      expect(result.timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(result.timestamp).toBeLessThanOrEqual(afterTime)
    })
  })

  describe('transitionToMap', () => {
    it('맵 전환을 수행할 수 있어야 함', () => {
      const result = transitionToMap(testCharacterId, 'beach')

      expect(result.success).toBe(true)
      expect(result.toMap).toBe('beach')
      expect(result.currentMap).toBe('beach')
    })

    it('현재 맵을 추적해야 함', () => {
      transitionToMap(testCharacterId, 'beach')

      const result1 = transitionToMap(testCharacterId, 'default')
      expect(result1.fromMap).toBe('beach')

      const result2 = transitionToMap(testCharacterId, 'forest')
      expect(result2.fromMap).toBe('default')
    })

    it('첫 전환은 fromMap이 null이어야 함', () => {
      const result = transitionToMap(testCharacterId, 'beach')

      expect(result.fromMap).toBeNull()
    })

    it('불가능한 전환은 실패해야 함', () => {
      transitionToMap(testCharacterId, 'beach')

      const result = transitionToMap(testCharacterId, 'forest')

      expect(result.success).toBe(false)
    })

    it('전환 히스토리를 기록해야 함', () => {
      transitionToMap(testCharacterId, 'beach')
      transitionToMap(testCharacterId, 'default')

      const history = getTransitionHistory(testCharacterId)

      expect(history).toHaveLength(2)
      expect(history[0].toMap).toBe('beach')
      expect(history[1].toMap).toBe('default')
    })
  })

  describe('getTransitionHistory', () => {
    it('전환 히스토리를 반환해야 함', () => {
      transitionToMap(testCharacterId, 'beach')
      transitionToMap(testCharacterId, 'default')

      const history = getTransitionHistory(testCharacterId)

      expect(history).toBeDefined()
      expect(Array.isArray(history)).toBe(true)
      expect(history.length).toBe(2)
    })

    it('데이터가 없으면 빈 배열을 반환해야 함', () => {
      const history = getTransitionHistory('nonexistent')

      expect(history).toEqual([])
    })

    it('각 기록에 필요한 필드가 있어야 함', () => {
      transitionToMap(testCharacterId, 'beach')

      const history = getTransitionHistory(testCharacterId)

      expect(history[0].timestamp).toBeDefined()
      expect(history[0].fromMap).toBeDefined()
      expect(history[0].toMap).toBeDefined()
      expect(history[0].config).toBeDefined()
    })

    it('기록된 순서대로 반환해야 함', () => {
      transitionToMap(testCharacterId, 'beach')
      setTimeout(() => {
        transitionToMap(testCharacterId, 'default')

        const history = getTransitionHistory(testCharacterId)

        expect(history[0].toMap).toBe('beach')
        expect(history[1].toMap).toBe('default')
      }, 100)
    })
  })

  describe('exportTransitionData / importTransitionData', () => {
    beforeEach(() => {
      transitionToMap(testCharacterId, 'beach')
      transitionToMap(testCharacterId, 'default')
    })

    it('데이터를 내보내야 함', () => {
      const exported = exportTransitionData()

      expect(exported).toBeDefined()
      expect(exported.currentMaps).toBeDefined()
      expect(exported.histories).toBeDefined()
    })

    it('데이터를 불러올 수 있어야 함', () => {
      const exported = exportTransitionData()

      importTransitionData({})

      const result = transitionToMap(testCharacterId, 'forest')

      expect(result.fromMap).toBeNull() // 현재 맵 정보가 초기화됨

      importTransitionData(exported)

      const result2 = transitionToMap(testCharacterId, 'forest')

      expect(result2.fromMap).toBe('default') // 현재 맵 정보가 복원됨
    })

    it('여러 캐릭터의 데이터를 보존해야 함', () => {
      transitionToMap('character_002', 'beach')

      const exported = exportTransitionData()

      importTransitionData({})
      importTransitionData(exported)

      const history1 = getTransitionHistory(testCharacterId)
      const history2 = getTransitionHistory('character_002')

      expect(history1).toHaveLength(2)
      expect(history2).toHaveLength(1)
    })
  })
})