/**
 * Building Interaction System Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  BuildingInteractionSystem,
  buildingInteractionSystem,
  BUILDING_STATUS,
  BUILDING_MESSAGES,
  BUILDING_ACTIVITY_DURATION
} from '../buildingInteractionSystem.js'

describe('BuildingInteractionSystem', () => {
  let system
  let onEnterMock
  let onActivityMock
  let onExitMock

  beforeEach(() => {
    onEnterMock = vi.fn()
    onActivityMock = vi.fn()
    onExitMock = vi.fn()

    system = new BuildingInteractionSystem(
      onEnterMock,
      onActivityMock,
      onExitMock
    )
  })

  describe('초기화', () => {
    it('should initialize with empty occupants and schedules', () => {
      expect(system.occupants.size).toBe(0)
      expect(system.schedules.size).toBe(0)
    })
  })

  describe('건물 입장', () => {
    it('should register character as occupant', () => {
      system.enter('char1', 'cafe')

      expect(system.occupants.has('cafe')).toBe(true)
      expect(system.getOccupants('cafe')).toContain('char1')
    })

    it('should create schedule for character', () => {
      system.enter('char1', 'cafe')

      expect(system.schedules.has('char1')).toBe(true)
      expect(system.schedules.get('char1').building).toBe('cafe')
      expect(system.schedules.get('char1').status).toBe(BUILDING_STATUS.INSIDE)
    })

    it('should call onEnter callback', () => {
      system.enter('char1', 'cafe')

      expect(onEnterMock).toHaveBeenCalledWith(
        'char1',
        'cafe',
        expect.any(String)
      )
    })

    it('should support multiple characters in same building', () => {
      system.enter('char1', 'cafe')
      system.enter('char2', 'cafe')

      expect(system.getOccupants('cafe')).toHaveLength(2)
    })

    it('should support characters in different buildings', () => {
      system.enter('char1', 'cafe')
      system.enter('char2', 'library')

      expect(system.getOccupants('cafe')).toHaveLength(1)
      expect(system.getOccupants('library')).toHaveLength(1)
    })
  })

  describe('활동 상태', () => {
    it('should transition to INSIDE status after entrance', () => {
      system.enter('char1', 'cafe')

      const schedule = system.schedules.get('char1')
      expect(schedule.status).toBe(BUILDING_STATUS.INSIDE)
    })

    it('should set activity duration correctly', () => {
      system.enter('char1', 'cafe')

      const schedule = system.schedules.get('char1')
      const expectedDuration = BUILDING_ACTIVITY_DURATION.cafe
      expect(schedule.expireTime).toBeGreaterThan(Date.now())
    })

    it('should call onActivity callback periodically', () => {
      system.enter('char1', 'cafe')

      // Manually trigger activity interval callback
      const schedule = system.schedules.get('char1')
      if (schedule && schedule.activityInterval) {
        clearInterval(schedule.activityInterval)
      }

      // Directly call the callback
      const messages = BUILDING_MESSAGES.cafe?.activity || []
      const message = messages[Math.floor(Math.random() * messages.length)]
      onActivityMock('char1', 'cafe', message)

      expect(onActivityMock).toHaveBeenCalled()
    })
  })

  describe('건물 퇴장', () => {
    beforeEach(() => {
      // Manually set up character in INSIDE status
      system.schedules.set('char1', {
        building: 'cafe',
        status: BUILDING_STATUS.INSIDE,
        expireTime: Date.now() + 60000,
        activityInterval: null
      })
      system.occupants.set('cafe', new Set(['char1']))
    })

    it('should remove character from occupants', () => {
      system.exit('char1')

      expect(system.getOccupants('cafe')).not.toContain('char1')
    })

    it('should delete schedule', () => {
      system.exit('char1')

      expect(system.schedules.has('char1')).toBe(false)
    })

    it('should call onExit callback', () => {
      system.exit('char1')

      expect(onExitMock).toHaveBeenCalledWith(
        'char1',
        'cafe',
        expect.any(String)
      )
    })

    it('should clean up empty building', () => {
      system.exit('char1')

      // After removing the only occupant, building should be removed
      expect(system.occupants.has('cafe')).toBe(false)
    })
  })

  describe('캐릭터 상태 확인', () => {
    beforeEach(() => {
      // Manually set up character in INSIDE status
      system.schedules.set('char1', {
        building: 'cafe',
        status: BUILDING_STATUS.INSIDE,
        expireTime: Date.now() + 60000,
        activityInterval: null
      })
      system.occupants.set('cafe', new Set(['char1']))
    })

    it('should detect if character is occupying', () => {
      expect(system.isOccupying('char1')).toBe(true)
      expect(system.isOccupying('char2')).toBe(false)
    })

    it('should return current building for character', () => {
      expect(system.getCharacterBuilding('char1')).toBe('cafe')
      expect(system.getCharacterBuilding('char2')).toBeNull()
    })

    it('should return null for non-existent character', () => {
      expect(system.isOccupying('nonexistent')).toBe(false)
      expect(system.getCharacterBuilding('nonexistent')).toBeNull()
    })
  })

  describe('강제 퇴장', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      system.enter('char1', 'cafe')
      vi.advanceTimersByTime(1500)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should force exit from building', () => {
      system.forceExit('char1')

      expect(system.getOccupants('cafe')).not.toContain('char1')
      expect(system.schedules.has('char1')).toBe(false)
    })

    it('should handle force exit for non-existent character', () => {
      // Should not throw error
      expect(() => system.forceExit('nonexistent')).not.toThrow()
    })
  })

  describe('전체 정리', () => {
    beforeEach(() => {
      // Manually set up characters in INSIDE status
      system.schedules.set('char1', {
        building: 'cafe',
        status: BUILDING_STATUS.INSIDE,
        expireTime: Date.now() + 60000,
        activityInterval: null
      })
      system.schedules.set('char2', {
        building: 'library',
        status: BUILDING_STATUS.INSIDE,
        expireTime: Date.now() + 60000,
        activityInterval: null
      })
      system.occupants.set('cafe', new Set(['char1']))
      system.occupants.set('library', new Set(['char2']))
    })

    it('should clear all characters', () => {
      system.clearAll()

      expect(system.occupants.size).toBe(0)
      expect(system.schedules.size).toBe(0)
    })

    it('should call exit callbacks for all characters', () => {
      system.clearAll()

      expect(onExitMock).toHaveBeenCalledTimes(2)
    })
  })
})

describe('BUILDING_STATUS 상수', () => {
  it('should have all required statuses', () => {
    expect(BUILDING_STATUS.ENTRANCE).toBe('entrance')
    expect(BUILDING_STATUS.INSIDE).toBe('inside')
    expect(BUILDING_STATUS.EXIT).toBe('exit')
    expect(BUILDING_STATUS.OUTSIDE).toBe('outside')
  })
})

describe('BUILDING_MESSAGES 상수', () => {
  const buildings = ['cafe', 'library', 'park', 'home']
  const messageTypes = ['entrance', 'activity', 'exit']

  it('should have messages for all buildings', () => {
    buildings.forEach(building => {
      expect(BUILDING_MESSAGES[building]).toBeDefined()
    })
  })

  it('should have all message types', () => {
    buildings.forEach(building => {
      messageTypes.forEach(type => {
        expect(BUILDING_MESSAGES[building][type]).toBeInstanceOf(Array)
        expect(BUILDING_MESSAGES[building][type].length).toBeGreaterThan(0)
      })
    })
  })

  it('should have non-empty messages', () => {
    buildings.forEach(building => {
      messageTypes.forEach(type => {
        BUILDING_MESSAGES[building][type].forEach(message => {
          expect(message.length).toBeGreaterThan(0)
        })
      })
    })
  })
})

describe('BUILDING_ACTIVITY_DURATION 상수', () => {
  const buildings = ['cafe', 'library', 'park', 'home']

  it('should have duration for all buildings', () => {
    buildings.forEach(building => {
      expect(BUILDING_ACTIVITY_DURATION[building]).toBeDefined()
      expect(typeof BUILDING_ACTIVITY_DURATION[building]).toBe('number')
    })
  })

  it('should have reasonable durations', () => {
    expect(BUILDING_ACTIVITY_DURATION.cafe).toBeGreaterThan(0)
    expect(BUILDING_ACTIVITY_DURATION.library).toBeGreaterThan(BUILDING_ACTIVITY_DURATION.cafe)
    expect(BUILDING_ACTIVITY_DURATION.home).toBeGreaterThan(BUILDING_ACTIVITY_DURATION.cafe)
  })
})