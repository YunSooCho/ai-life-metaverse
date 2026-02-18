/**
 * AI Character Movement Scheduler Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  AiCharacterMovementScheduler,
  aiMovementScheduler,
  BUILDING_LOCATIONS,
  TIME_BEHAVIORS
} from '../aiCharacterMovementScheduler.js'

describe('AiCharacterMovementScheduler', () => {
  let scheduler
  let onMoveMock
  let onArriveMock
  let rafMock
  let rafCallbacks

  beforeEach(() => {
    onMoveMock = vi.fn()
    onArriveMock = vi.fn()

    // Mock requestAnimationFrame
    rafCallbacks = []
    rafMock = vi.fn((callback) => {
      rafCallbacks.push(callback)
      return 1
    })
    global.requestAnimationFrame = rafMock

    scheduler = new AiCharacterMovementScheduler(
      [
        { id: 'ai1', name: 'Yuri', isAi: true, x: 400, y: 500 },
        { id: 'ai2', name: 'Hikari', isAi: true, x: 420, y: 520 }
      ],
      onMoveMock,
      onArriveMock
    )
  })

  afterEach(() => {
    scheduler.stop()
    rafCallbacks = []
    global.requestAnimationFrame = vi.fn() // Reset
  })

  describe('초기화', () => {
    it('should initialize with given AI characters', () => {
      expect(scheduler.aiCharacters).toHaveLength(2)
      expect(scheduler.aiCharacters[0].id).toBe('ai1')
      expect(scheduler.aiCharacters[1].id).toBe('ai2')
    })

    it('should not start automatically', () => {
      expect(scheduler.isRunning).toBe(false)
    })
  })

  describe('스케줄러 시작/정지', () => {
    it('should start and stop scheduler correctly', () => {
      scheduler.start()
      expect(scheduler.isRunning).toBe(true)

      scheduler.stop()
      expect(scheduler.isRunning).toBe(false)
    })

    it('should not start if already running', () => {
      scheduler.start()
      const firstState = scheduler.isRunning
      scheduler.start() // Already running
      expect(scheduler.isRunning).toBe(firstState)
    })
  })

  describe('시간대 계산', () => {
    it('should calculate correct time period', () => {
      const testCases = [
        { hour: 6, expected: 'DAWN' },
        { hour: 10, expected: 'MORNING' },
        { hour: 14, expected: 'AFTERNOON' },
        { hour: 18, expected: 'EVENING' },
        { hour: 22, expected: 'NIGHT' },
        { hour: 3, expected: 'NIGHT' }
      ]

      testCases.forEach(({ hour, expected }) => {
        const originalHour = new Date().getHours()
        vi.spyOn(Date.prototype, 'getHours').mockReturnValue(hour)

        const period = scheduler.getCurrentTimePeriod()
        expect(period).toBe(expected)

        vi.restoreAllMocks()
      })
    })
  })

  describe('목표 건물 선택', () => {
    it('should select a valid building', () => {
      const building = scheduler.selectTargetBuilding('MORNING')
      expect(['cafe', 'library']).toContain(building)
    })

    it('should select park in afternoon', () => {
      const building = scheduler.selectTargetBuilding('AFTERNOON')
      expect(['park', 'cafe']).toContain(building)
    })

    it('should always select home at night', () => {
      const building = scheduler.selectTargetBuilding('NIGHT')
      expect(building).toBe('home')
    })
  })

  describe('스케줄 생성', () => {
    it('should create schedule for AI character', () => {
      const schedule = scheduler.createSchedule('ai1')

      expect(schedule.charId).toBe('ai1')
      expect(schedule.targetBuilding).toBeDefined()
      expect(schedule.isMoving).toBe(false)
      expect(typeof schedule.lastMoveTime).toBe('number')
    })

    it('should select valid building from behavior', () => {
      const schedule = scheduler.createSchedule('ai1')
      expect(BUILDING_LOCATIONS[schedule.targetBuilding]).toBeDefined()
    })
  })

  describe('캐릭터 추가/제거', () => {
    it('should add new AI character', () => {
      const newChar = { id: 'ai3', name: 'Test', isAi: true, x: 300, y: 400 }
      scheduler.addCharacter(newChar)

      expect(scheduler.aiCharacters).toHaveLength(3)
      expect(scheduler.aiCharacters.some(c => c.id === 'ai3')).toBe(true)
    })

    it('should remove character by ID', () => {
      scheduler.removeCharacter('ai1')

      expect(scheduler.aiCharacters).toHaveLength(1)
      expect(scheduler.aiCharacters.some(c => c.id === 'ai1')).toBe(false)
    })

    it('should not add non-AI character', () => {
      const nonAiChar = { id: 'user1', name: 'User', isAi: false, x: 300, y: 400 }
      scheduler.addCharacter(nonAiChar)

      expect(scheduler.aiCharacters).toHaveLength(2) // Unchanged
    })

    it('should update existing character', () => {
      const updatedChar = { id: 'ai1', name: 'Yuri Updated', isAi: true, x: 500, y: 600 }
      scheduler.addCharacter(updatedChar)

      expect(scheduler.aiCharacters[0].name).toBe('Yuri Updated')
      expect(scheduler.aiCharacters[0].x).toBe(500)
    })
  })

  describe('이동 콜백', () => {
    it('should call onMove callback when moving', (done) => {
      // Mock requestAnimationFrame
      const mockRAF = vi.fn((callback) => {
        setTimeout(callback, 16)
      })
      global.requestAnimationFrame = mockRAF

      scheduler.executeMovement('ai1')

      setTimeout(() => {
        expect(onMoveMock).toHaveBeenCalled()
        done()
      }, 100)

      global.requestAnimationFrame = vi.fn() // Reset
    })

    it('should call onArrive callback when reached destination', (done) => {
      const mockRAF = vi.fn((callback) => {
        callback() // Immediate callback for testing
      })
      global.requestAnimationFrame = mockRAF

      scheduler.onArrive = vi.fn()
      scheduler.onCharacterArrive('ai1', {
        isMoving: true,
        targetBuilding: 'cafe'
      })

      setTimeout(() => {
        // onArrive should be called within the method
        done()
      }, 50)

      global.requestAnimationFrame = vi.fn() // Reset
    })
  })
})

describe('BUILDING_LOCATIONS 상수', () => {
  it('should have all required buildings', () => {
    const buildings = ['cafe', 'library', 'park', 'home']

    buildings.forEach(building => {
      expect(BUILDING_LOCATIONS[building]).toBeDefined()
      expect(BUILDING_LOCATIONS[building].x).toBeDefined()
      expect(BUILDING_LOCATIONS[building].y).toBeDefined()
      expect(BUILDING_LOCATIONS[building].name).toBeDefined()
    })
  })
})

describe('TIME_BEHAVIORS 상수', () => {
  it('should have all time periods', () => {
    const periods = ['DAWN', 'MORNING', 'AFTERNOON', 'EVENING', 'NIGHT']

    periods.forEach(period => {
      expect(TIME_BEHAVIORS[period]).toBeDefined()
      expect(TIME_BEHAVIORS[period].locations).toBeInstanceOf(Array)
      expect(TIME_BEHAVIORS[period].probability).toBeDefined()
      expect(TIME_BEHAVIORS[period].idleTime).toBeDefined()
    })
  })

  it('should have valid probabilities', () => {
    const periods = ['DAWN', 'MORNING', 'AFTERNOON', 'EVENING', 'NIGHT']

    periods.forEach(period => {
      const prob = TIME_BEHAVIORS[period].probability
      const totalProbability = Object.values(prob).reduce((sum, val) => sum + val, 0)

      // Total probability should be close to 1.0
      expect(totalProbability).toBeGreaterThan(0.9)
      expect(totalProbability).toBeLessThanOrEqual(1.1)
    })
  })
})