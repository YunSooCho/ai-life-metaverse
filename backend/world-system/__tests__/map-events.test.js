/**
 * 맵 이벤트 시스템 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  MAP_EVENT_TYPES,
  EVENT_PRIORITIES,
  getMapEvents,
  getEventsByMap,
  getEventsByType,
  findEventById,
  triggerEvent,
  checkEventConditions,
  getActiveEvents,
  getEventCooldown,
  setEventCooldown,
  clearEventCooldown,
  exportEventData,
  importEventData
} from '../map-events.js'

describe('맵 이벤트 시스템', () => {
  const testCharacterId = 'character_001'
  const testMapId = 'main_plaza'

  beforeEach(() => {
    // 각 테스트 전에 데이터 초기화
    importEventData({})
  })

  afterEach(() => {
    // 각 테스트 후에 데이터 정리
    importEventData({})
  })

  describe('MAP_EVENT_TYPES', () => {
    it('모든 이벤트 유형이 정의되어야 함', () => {
      expect(MAP_EVENT_TYPES.ENTER).toBe('enter')
      expect(MAP_EVENT_TYPES.EXIT).toBe('exit')
      expect(MAP_EVENT_TYPES.STAY_DURATION).toBe('stay_duration')
      expect(MAP_EVENT_TYPES.INTERACTION).toBe('interaction')
      expect(MAP_EVENT_TYPES.TIME_OF_DAY).toBe('time_of_day')
      expect(MAP_EVENT_TYPES.WEATHER_CHANGE).toBe('weather_change')
      expect(MAP_EVENT_TYPES.SEASONAL).toBe('seasonal')
    })
  })

  describe('EVENT_PRIORITIES', () => {
    it('모든 우선순위가 정의되어야 함', () => {
      expect(EVENT_PRIORITIES.LOW).toBe(1)
      expect(EVENT_PRIORITIES.MEDIUM).toBe(2)
      expect(EVENT_PRIORITIES.HIGH).toBe(3)
      expect(EVENT_PRIORITIES.CRITICAL).toBe(4)
    })
  })

  describe('getMapEvents', () => {
    it('모든 맵 이벤트를 반환해야 함', () => {
      const events = getMapEvents()

      expect(events).toBeDefined()
      expect(events.default).toBeDefined()
      expect(events.beach).toBeDefined()
      expect(events.forest).toBeDefined()
      expect(events.mountain).toBeDefined()
    })
  })

  describe('getEventsByMap', () => {
    it('맵별 이벤트를 반환해야 함', () => {
      const events = getEventsByMap(testMapId)

      expect(events).toBeDefined()
      expect(Array.isArray(events)).toBe(true)
    })

    it('없는 맵은 빈 배열을 반환해야 함', () => {
      const events = getEventsByMap('nonexistent_map')

      expect(events).toEqual([])
    })

    it('각 이벤트에 필요한 필드가 있어야 함', () => {
      const events = getEventsByMap(testMapId)

      events.forEach(event => {
        expect(event.id).toBeDefined()
        expect(event.type).toBeDefined()
        expect(event.priority).toBeDefined()
        expect(event.conditions).toBeDefined()
        expect(event.actions).toBeDefined()
        expect(event.cooldown).toBeDefined()
      })
    })
  })

  describe('getEventsByType', () => {
    it('이벤트 유형별로 필터링해야 함', () => {
      const events = getEventsByType(MAP_EVENT_TYPES.ENTER)

      expect(events).toBeDefined()
      expect(Array.isArray(events)).toBe(true)

      events.forEach(event => {
        expect(event.type).toBe(MAP_EVENT_TYPES.ENTER)
      })
    })

    it('없는 유형은 빈 배열을 반환해야 함', () => {
      const events = getEventsByType('nonexistent_type')

      expect(events).toEqual([])
    })
  })

  describe('findEventById', () => {
    it('ID로 이벤트를 찾을 수 있어야 함', () => {
      const found = findEventById('default_welcome')

      expect(found).toBeDefined()
      expect(found.id).toBe('default_welcome')
    })

    it('없는 ID는 null을 반환해야 함', () => {
      const found = findEventById('nonexistent_id')

      expect(found).toBeNull()
    })
  })

  describe('checkEventConditions', () => {
    it('첫 방문 조건을 확인해야 함', () => {
      const event = findEventById('default_welcome')
      const result = checkEventConditions(testCharacterId, testMapId, event.conditions)

      expect(result).toBeDefined()
      expect(typeof result).toBe('boolean')
    })

    it('시간대 조건을 확인해야 함', () => {
      const event = findEventById('default_festival')
      const result = checkEventConditions(testCharacterId, testMapId, event.conditions)

      expect(result).toBeDefined()
      expect(typeof result).toBe('boolean')
    })

    it('빈 조건은 true를 반환해야 함', () => {
      const result = checkEventConditions(testCharacterId, testMapId, {})

      expect(result).toBe(true)
    })
  })

  describe('triggerEvent', () => {
    it('이벤트를 트리거할 수 있어야 함', () => {
      const result = triggerEvent(testCharacterId, testMapId, 'default_welcome')

      expect(result.success).toBeDefined()
      expect(typeof result.success).toBe('boolean')
      expect(result.event).toBeDefined()
      expect(result.actionsExecuted).toBeDefined()
    })

    it('없는 이벤트는 트리거할 수 없음', () => {
      const result = triggerEvent(testCharacterId, testMapId, 'nonexistent_id')

      expect(result.success).toBe(false)
    })

    it('쿨다운 중인 이벤트는 트리거할 수 없음', () => {
      triggerEvent(testCharacterId, testMapId, 'default_festival')
      const result = triggerEvent(testCharacterId, testMapId, 'default_festival')

      expect(result.success).toBe(false)
      expect(result.message).toContain('쿨다운')
    })

    it('액션을 실행해야 함', () => {
      const result = triggerEvent(testCharacterId, testMapId, 'default_welcome')

      expect(result.actionsExecuted).toBeInstanceOf(Array)
      expect(result.actionsExecuted.length).toBeGreaterThan(0)
    })
  })

  describe('getEventCooldown', () => {
    it('쿨다운 시간을 조회해야 함', () => {
      const event = findEventById('default_festival')
      const result = triggerEvent(testCharacterId, testMapId, 'default_festival')

      const cooldown = getEventCooldown(testCharacterId, testMapId, event.id)

      expect(cooldown).toBeDefined()
      expect(cooldown.remaining).toBeGreaterThan(0)
    })

    it('쿨다운이 없으면 0을 반환해야 함', () => {
      const cooldown = getEventCooldown(testCharacterId, testMapId, 'default_welcome')

      expect(cooldown.remaining).toBe(0)
    })
  })

  describe('setEventCooldown', () => {
    it('쿨다운을 설정할 수 있어야 함', () => {
      const eventId = 'test_event'
      setEventCooldown(testCharacterId, testMapId, eventId, 5000)

      const cooldown = getEventCooldown(testCharacterId, testMapId, eventId)

      expect(cooldown.remaining).toBeGreaterThan(0)
      expect(cooldown.remaining).toBeLessThanOrEqual(5000)
    })
  })

  describe('clearEventCooldown', () => {
    it('쿨다운을 초기화할 수 있어야 함', () => {
      const event = findEventById('default_festival')
      triggerEvent(testCharacterId, testMapId, event.id)

      clearEventCooldown(testCharacterId, testMapId, event.id)

      const cooldown = getEventCooldown(testCharacterId, testMapId, event.id)

      expect(cooldown.remaining).toBe(0)
    })
  })

  describe('getActiveEvents', () => {
    it('활성화된 이벤트 목록을 반환해야 함', () => {
      const active = getActiveEvents(testCharacterId, testMapId)

      expect(active).toBeDefined()
      expect(Array.isArray(active)).toBe(true)
    })
  })

  describe('exportEventData / importEventData', () => {
    beforeEach(() => {
      triggerEvent(testCharacterId, testMapId, 'default_welcome')
    })

    it('데이터를 내보내야 함', () => {
      const exported = exportEventData()

      expect(exported).toBeDefined()
      expect(exported.cooldowns).toBeDefined()
    })

    it('데이터를 불러올 수 있어야 함', () => {
      const exported = exportEventData()

      importEventData({})

      const cooldown = getEventCooldown(testCharacterId, testMapId, 'default_welcome')
      expect(cooldown.remaining).toBe(0)

      importEventData(exported)

      const cooldown2 = getEventCooldown(testCharacterId, testMapId, 'default_welcome')
      expect(cooldown2.remaining).toBeGreaterThan(0)
    })
  })
})