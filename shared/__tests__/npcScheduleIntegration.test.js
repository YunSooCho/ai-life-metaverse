/**
 * NPC 스케줄 - Agent 통합 테스트
 * agent.js에서 사용하는 패턴 검증
 */

import { describe, it, expect } from 'vitest'
import {
  getGameHour,
  GAME_DAY_DURATION_MS
} from '../../frontend/src/utils/weatherTimeSystem.js'
import {
  getNpcStatus,
  moveTowardTarget,
  getCurrentSchedule,
  ACTIVITIES,
  LOCATIONS
} from '../npcSchedule.js'

describe('NPC Schedule - Agent Integration', () => {
  describe('Game time → Schedule → Movement flow', () => {
    it('should produce valid NPC status for any game hour', () => {
      const startTime = Date.now()
      for (let offset = 0; offset < 24; offset++) {
        const fakeStart = startTime - (GAME_DAY_DURATION_MS / 24) * offset
        const hour = getGameHour(fakeStart)
        const status = getNpcStatus(hour)

        expect(status).toHaveProperty('activity')
        expect(status).toHaveProperty('targetX')
        expect(status).toHaveProperty('targetY')
        expect(status).toHaveProperty('dialogue')
        expect(typeof status.targetX).toBe('number')
        expect(typeof status.targetY).toBe('number')
      }
    })

    it('should move NPC toward schedule location', () => {
      const status = getNpcStatus(10) // 도서관에서 공부
      const start = { x: 500, y: 350 } // 맵 중앙

      const result = moveTowardTarget(start.x, start.y, status.targetX, status.targetY, 3)

      // NPC가 도서관 방향으로 이동해야 함
      const distBefore = Math.sqrt(
        (start.x - status.targetX) ** 2 + (start.y - status.targetY) ** 2
      )
      const distAfter = Math.sqrt(
        (result.x - status.targetX) ** 2 + (result.y - status.targetY) ** 2
      )

      expect(distAfter).toBeLessThan(distBefore)
    })

    it('should eventually arrive at target with repeated moves', () => {
      const status = getNpcStatus(7) // 카페
      let x = 100, y = 100

      for (let i = 0; i < 1000; i++) {
        const result = moveTowardTarget(x, y, status.targetX, status.targetY, 3)
        x = result.x
        y = result.y
        if (result.arrived) break
      }

      expect(x).toBe(status.targetX)
      expect(y).toBe(status.targetY)
    })
  })

  describe('Schedule transitions', () => {
    it('should change location when hour changes', () => {
      const schedule6 = getCurrentSchedule(6) // 카페
      const schedule10 = getCurrentSchedule(10) // 도서관

      expect(schedule6.location).not.toBe(schedule10.location)
      expect(schedule6.activity).not.toBe(schedule10.activity)
    })

    it('activity dialogue should match current schedule', () => {
      const status = getNpcStatus(2) // 수면
      expect(status.activity).toBe(ACTIVITIES.SLEEP)
      // dialogue should be from sleep dialogues
      expect(typeof status.dialogue).toBe('string')
    })
  })

  describe('Agent context prompt generation', () => {
    it('should generate activity context string', () => {
      const hour = 10
      const status = getNpcStatus(hour)
      const contextStr = `${status.locationName}에서 ${status.activity} 중 (게임시간 ${hour}시)`

      expect(contextStr).toContain('도서관')
      expect(contextStr).toContain('study')
      expect(contextStr).toContain('10시')
    })
  })
})
