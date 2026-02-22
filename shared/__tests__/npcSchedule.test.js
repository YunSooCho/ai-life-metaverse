/**
 * NPC 스케줄/일과 시스템 테스트
 * PM 룰 v3.2: 테스트 코드 필수!
 */

import { describe, it, expect } from 'vitest'
import {
  getCurrentSchedule,
  getScheduleLocation,
  getActivityDialogue,
  moveTowardTarget,
  getNpcStatus,
  LOCATIONS,
  ACTIVITIES,
  DEFAULT_SCHEDULE
} from '../npcSchedule.js'

describe('NPC Schedule System', () => {
  describe('LOCATIONS', () => {
    it('should have 5 locations', () => {
      expect(Object.keys(LOCATIONS)).toHaveLength(5)
    })

    it('each location should have x, y, name', () => {
      Object.values(LOCATIONS).forEach(loc => {
        expect(loc).toHaveProperty('x')
        expect(loc).toHaveProperty('y')
        expect(loc).toHaveProperty('name')
        expect(typeof loc.x).toBe('number')
        expect(typeof loc.y).toBe('number')
      })
    })
  })

  describe('DEFAULT_SCHEDULE', () => {
    it('should cover all 24 hours', () => {
      // Check that schedule covers 0-24
      const covered = new Set()
      DEFAULT_SCHEDULE.forEach(entry => {
        for (let h = entry.startHour; h < entry.endHour; h++) {
          covered.add(h)
        }
      })
      for (let h = 0; h < 24; h++) {
        expect(covered.has(h)).toBe(true)
      }
    })

    it('each entry should have required fields', () => {
      DEFAULT_SCHEDULE.forEach(entry => {
        expect(entry).toHaveProperty('startHour')
        expect(entry).toHaveProperty('endHour')
        expect(entry).toHaveProperty('location')
        expect(entry).toHaveProperty('activity')
      })
    })
  })

  describe('getCurrentSchedule', () => {
    it('should return sleep at midnight', () => {
      const schedule = getCurrentSchedule(2)
      expect(schedule.activity).toBe(ACTIVITIES.SLEEP)
      expect(schedule.location).toBe('home')
    })

    it('should return coffee at 7am', () => {
      const schedule = getCurrentSchedule(7)
      expect(schedule.activity).toBe(ACTIVITIES.COFFEE)
      expect(schedule.location).toBe('cafe')
    })

    it('should return study at 10am', () => {
      const schedule = getCurrentSchedule(10)
      expect(schedule.activity).toBe(ACTIVITIES.STUDY)
      expect(schedule.location).toBe('library')
    })

    it('should return walk at 14pm', () => {
      const schedule = getCurrentSchedule(14)
      expect(schedule.activity).toBe(ACTIVITIES.WALK)
      expect(schedule.location).toBe('park')
    })

    it('should return shop at 18pm', () => {
      const schedule = getCurrentSchedule(18)
      expect(schedule.activity).toBe(ACTIVITIES.SHOP)
      expect(schedule.location).toBe('shop')
    })

    it('should return sleep at 22pm', () => {
      const schedule = getCurrentSchedule(22)
      expect(schedule.activity).toBe(ACTIVITIES.SLEEP)
    })
  })

  describe('getScheduleLocation', () => {
    it('should return home location at night', () => {
      const loc = getScheduleLocation(3)
      expect(loc).toEqual(LOCATIONS.home)
    })

    it('should return cafe location in morning', () => {
      const loc = getScheduleLocation(7)
      expect(loc).toEqual(LOCATIONS.cafe)
    })

    it('should return library location for study', () => {
      const loc = getScheduleLocation(9)
      expect(loc).toEqual(LOCATIONS.library)
    })

    it('should return valid x,y coordinates', () => {
      for (let h = 0; h < 24; h++) {
        const loc = getScheduleLocation(h)
        expect(loc.x).toBeGreaterThanOrEqual(0)
        expect(loc.y).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('getActivityDialogue', () => {
    it('should return a string', () => {
      const dialogue = getActivityDialogue(10)
      expect(typeof dialogue).toBe('string')
      expect(dialogue.length).toBeGreaterThan(0)
    })

    it('should return sleep dialogue at night', () => {
      // Run multiple times - should always be from sleep dialogues
      for (let i = 0; i < 10; i++) {
        const dialogue = getActivityDialogue(2)
        expect(typeof dialogue).toBe('string')
      }
    })
  })

  describe('moveTowardTarget', () => {
    it('should move toward target', () => {
      const result = moveTowardTarget(0, 0, 100, 0, 5)
      expect(result.x).toBeCloseTo(5)
      expect(result.y).toBeCloseTo(0)
      expect(result.arrived).toBe(false)
    })

    it('should arrive when close enough', () => {
      const result = moveTowardTarget(99, 0, 100, 0, 5)
      expect(result.x).toBe(100)
      expect(result.y).toBe(0)
      expect(result.arrived).toBe(true)
    })

    it('should handle diagonal movement', () => {
      const result = moveTowardTarget(0, 0, 100, 100, 5)
      expect(result.x).toBeGreaterThan(0)
      expect(result.y).toBeGreaterThan(0)
      expect(result.arrived).toBe(false)
    })

    it('should handle already at target', () => {
      const result = moveTowardTarget(50, 50, 50, 50, 5)
      expect(result.x).toBe(50)
      expect(result.y).toBe(50)
      expect(result.arrived).toBe(true)
    })
  })

  describe('getNpcStatus', () => {
    it('should return complete status object', () => {
      const status = getNpcStatus(10)
      expect(status).toHaveProperty('activity')
      expect(status).toHaveProperty('locationName')
      expect(status).toHaveProperty('targetX')
      expect(status).toHaveProperty('targetY')
      expect(status).toHaveProperty('dialogue')
    })

    it('should return library for study time', () => {
      const status = getNpcStatus(10)
      expect(status.activity).toBe(ACTIVITIES.STUDY)
      expect(status.locationName).toBe('도서관')
    })

    it('should return cafe for coffee time', () => {
      const status = getNpcStatus(7)
      expect(status.activity).toBe(ACTIVITIES.COFFEE)
      expect(status.locationName).toBe('카페')
    })

    it('should have valid coordinates for all hours', () => {
      for (let h = 0; h < 24; h++) {
        const status = getNpcStatus(h)
        expect(typeof status.targetX).toBe('number')
        expect(typeof status.targetY).toBe('number')
        expect(typeof status.dialogue).toBe('string')
      }
    })
  })
})
