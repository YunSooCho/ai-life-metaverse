// EventManager 테스트 코드
// Phase 7: 이벤트 시스템 테스트

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { EventManager, getEventManager } from '../ai-agent/event-manager.js'

const createMockDate = (month, day) => {
  return new Date(2026, month - 1, day) // month는 0-based
}

describe('EventManager', () => {
  let eventManager

  beforeEach(() => {
    eventManager = new EventManager()
  })

  afterEach(() => {
    eventManager.resetAll()
  })

  // ===== 시즌 시스템 테스트 =====
  describe('Season System', () => {
    it('봄 시즌 확인 (3월)', () => {
      vi.spyOn(eventManager, 'getCurrentSeason').mockReturnValue({
        key: 'SPRING',
        name: '봄 시즌',
        icon: '🌸',
        months: [3, 4, 5]
      })
      const season = eventManager.getCurrentSeason()
      expect(season.key).toBe('SPRING')
      expect(season.icon).toBe('🌸')
    })

    it('여름 시즌 확인 (7월)', () => {
      vi.spyOn(eventManager, 'getCurrentSeason').mockReturnValue({
        key: 'SUMMER',
        name: '여름 시즌',
        icon: '☀️',
        months: [6, 7, 8]
      })
      const season = eventManager.getCurrentSeason()
      expect(season.key).toBe('SUMMER')
      expect(season.icon).toBe('☀️')
    })

    it('가을 시즌 확인 (10월)', () => {
      vi.spyOn(eventManager, 'getCurrentSeason').mockReturnValue({
        key: 'AUTUMN',
        name: '가을 시즌',
        icon: '🍂',
        months: [9, 10, 11]
      })
      const season = eventManager.getCurrentSeason()
      expect(season.key).toBe('AUTUMN')
      expect(season.icon).toBe('🍂')
    })

    it('겨울 시즌 확인 (1월)', () => {
      vi.spyOn(eventManager, 'getCurrentSeason').mockReturnValue({
        key: 'WINTER',
        name: '겨울 시즌',
        icon: '❄️',
        months: [12, 1, 2]
      })
      const season = eventManager.getCurrentSeason()
      expect(season.key).toBe('WINTER')
      expect(season.icon).toBe('❄️')
    })
  })

  // ===== 특별 이벤트 시스템 테스트 =====
  describe('Special Event System', () => {
    it('할로윈 이벤트 활성 여부 (10월 31일)', () => {
      vi.spyOn(eventManager, 'getActiveSpecialEvents').mockReturnValue([
        {
          id: 'halloween',
          name: '할로윈',
          icon: '🎃',
          startDate: '10-25',
          endDate: '10-31'
        }
      ])
      const events = eventManager.getActiveSpecialEvents()
      expect(events.length).toBeGreaterThan(0)
      expect(events[0].id).toBe('halloween')
    })

    it('크리스마스 이벤트 활성 여부 (12월 25일)', () => {
      vi.spyOn(eventManager, 'getActiveSpecialEvents').mockReturnValue([
        {
          id: 'christmas',
          name: '크리스마스',
          icon: '🎄',
          startDate: '12-24',
          endDate: '12-25'
        }
      ])
      const events = eventManager.getActiveSpecialEvents()
      expect(events.length).toBeGreaterThan(0)
      expect(events[0].id).toBe('christmas')
    })

    it('새해 이벤트 활성 여부 (1월 1일)', () => {
      vi.spyOn(eventManager, 'getActiveSpecialEvents').mockReturnValue([
        {
          id: 'new-year',
          name: '새해',
          icon: '🎊',
          startDate: '01-01',
          endDate: '01-03'
        }
      ])
      const events = eventManager.getActiveSpecialEvents()
      expect(events.length).toBeGreaterThan(0)
      expect(events[0].id).toBe('new-year')
    })

    it('발렌타인 이벤트 활성 여부 (2월 14일)', () => {
      vi.spyOn(eventManager, 'getActiveSpecialEvents').mockReturnValue([
        {
          id: 'valentine',
          name: '발렌타인',
          icon: '💕',
          startDate: '02-14',
          endDate: '02-14'
        }
      ])
      const events = eventManager.getActiveSpecialEvents()
      expect(events.length).toBeGreaterThan(0)
      expect(events[0].id).toBe('valentine')
    })
  })

  // ===== 이벤트 보너스 시스템 테스트 =====
  describe('Event Bonus System', () => {
    it('XP 보너스 적용 (봄 시즌: xpMultiplier=1.2)', () => {
      vi.spyOn(eventManager, 'getCurrentSeason').mockReturnValue({
        key: 'SPRING',
        bonuses: {
          xpMultiplier: 1.2
        }
      })
      const baseXP = 100
      const boostedXP = eventManager.applyEventBonuses(baseXP, 'xp')
      expect(boostedXP).toBe(120)
    })

    it('골드 보너스 적용 (가을 시즌: goldMultiplier=1.2)', () => {
      vi.spyOn(eventManager, 'getCurrentSeason').mockReturnValue({
        key: 'AUTUMN',
        bonuses: {
          goldMultiplier: 1.2
        }
      })
      const baseGold = 50
      const boostedGold = eventManager.applyEventBonuses(baseGold, 'gold')
      expect(boostedGold).toBe(60)
    })

    it('호감도 보너스 적용 (겨울 시즌: affinityMultiplier=1.2)', () => {
      vi.spyOn(eventManager, 'getCurrentSeason').mockReturnValue({
        key: 'WINTER',
        bonuses: {
          affinityMultiplier: 1.2
        }
      })
      const baseAffinity = 5
      const boostedAffinity = eventManager.applyEventBonuses(baseAffinity, 'affinity')
      expect(boostedAffinity).toBe(6)
    })

    it('보너스 없는 경우 기본값 반환', () => {
      vi.spyOn(eventManager, 'getCurrentSeason').mockReturnValue({
        key: 'SPRING',
        bonuses: {}
      })
      const baseGold = 50
      const boostedGold = eventManager.applyEventBonuses(baseGold, 'gold')
      expect(boostedGold).toBe(50)
    })
  })

  // ===== 리워드 시스템 테스트 =====
  describe('Reward System', () => {
    it('NORMAL 난이도 리워드 생성', () => {
      const reward = eventManager.generateReward('NORMAL')
      expect(reward).toHaveProperty('xp')
      expect(reward).toHaveProperty('gold')
      expect(reward).toHaveProperty('affinity')
      expect(reward).toHaveProperty('item')
      expect(reward.item).toHaveProperty('rarity')
    })

    it('EASY 난이도 리워드 생성', () => {
      const reward = eventManager.generateReward('EASY')
      expect(reward.xp).toBeLessThan(100)
      expect(reward.gold).toBeLessThan(50)
    })

    it('HARD 난이도 리워드 생성', () => {
      const reward = eventManager.generateReward('HARD')
      expect(reward.xp).toBeGreaterThanOrEqual(200)
      expect(reward.gold).toBeGreaterThanOrEqual(100)
    })

    it('LEGENDARY 난이도 리워드 생성', () => {
      const reward = eventManager.generateReward('LEGENDARY')
      expect(reward.xp).toBeGreaterThanOrEqual(500)
      expect(reward.gold).toBeGreaterThanOrEqual(250)
    })

    it('아이템 rarity 확률 확인', () => {
      const rarities = { COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 }
      const iterations = 1000

      for (let i = 0; i < iterations; i++) {
        const reward = eventManager.generateReward('NORMAL')
        rarities[reward.item.rarity]++
      }

      // 확률 대략적 확인 (COMMON > RARE > EPIC > LEGENDARY)
      expect(rarities.COMMON).toBeGreaterThan(rarities.RARE)
      expect(rarities.RARE).toBeGreaterThan(rarities.EPIC)
      expect(rarities.EPIC).toBeGreaterThan(rarities.LEGENDARY)
    })
  })

  // ===== 일일 퀘스트 시스템 테스트 =====
  describe('Daily Quest System', () => {
    it('일일 퀘스트 갱신', () => {
      const quests = eventManager.updateDailyQuests()
      expect(quests.length).toBe(3)
      expect(quests[0]).toHaveProperty('id')
      expect(quests[0]).toHaveProperty('title')
      expect(quests[0]).toHaveProperty('xp')
      expect(quests[0]).toHaveProperty('gold')
    })

    it('같은 날짜에 두 번 갱신 시 동일한 퀘스트 반환', () => {
      const quests1 = eventManager.updateDailyQuests()
      const quests2 = eventManager.updateDailyQuests()
      expect(quests1).toEqual(quests2)
    })

    it('일일 퀘스트 완료 처리', () => {
      const result = eventManager.completeQuest('char-1', 'daily-1')
      expect(result.success).toBe(true)
      expect(result).toHaveProperty('reward')
      expect(result.reward).toHaveProperty('xp')
      expect(result.reward).toHaveProperty('gold')
    })
  })

  // ===== 주간 퀘스트 시스템 테스트 =====
  describe('Weekly Quest System', () => {
    it('주간 퀘스트 갱신', () => {
      const quests = eventManager.updateWeeklyQuests()
      expect(quests.length).toBe(5)
      expect(quests[0]).toHaveProperty('id')
      expect(quests[0]).toHaveProperty('title')
      expect(quests[0]).toHaveProperty('xp')
      expect(quests[0]).toHaveProperty('gold')
    })

    it('같은 주에 두 번 갱신 시 동일한 퀘스트 반환', () => {
      const quests1 = eventManager.updateWeeklyQuests()
      const quests2 = eventManager.updateWeeklyQuests()
      expect(quests1).toEqual(quests2)
    })

    it('주간 퀘스트 완료 처리', () => {
      const result = eventManager.completeQuest('char-1', 'weekly-1')
      expect(result.success).toBe(true)
      expect(result).toHaveProperty('reward')
      expect(result.reward).toHaveProperty('xp')
      expect(result.reward).toHaveProperty('gold')
    })
  })

  // ===== 퀘스트 난이도 결정 테스트 =====
  describe('Quest Difficulty', () => {
    it('일일 퀘스트 난이도는 NORMAL', () => {
      const difficulty = eventManager.getQuestDifficulty('daily-1')
      expect(difficulty).toBe('NORMAL')
    })

    it('주간 퀘스트 난이도는 HARD', () => {
      const difficulty = eventManager.getQuestDifficulty('weekly-1')
      expect(difficulty).toBe('HARD')
    })

    it('특별 퀘스트 난이도는 LEGENDARY', () => {
      const difficulty = eventManager.getQuestDifficulty('special-1')
      expect(difficulty).toBe('LEGENDARY')
    })

    it('기본 퀘스트 난이도는 EASY', () => {
      const difficulty = eventManager.getQuestDifficulty('quest-1')
      expect(difficulty).toBe('EASY')
    })
  })

  // ===== 이벤트 히스토리 테스트 =====
  describe('Event History', () => {
    it('이벤트 히스토리 기록', () => {
      eventManager.completeQuest('char-1', 'daily-1')
      const history = eventManager.getEventHistory('char-1')
      expect(history.length).toBe(1)
      expect(history[0].questId).toBe('daily-1')
      expect(history[0].completed).toBe(true)
    })

    it('이벤트 히스토리 초기화', () => {
      eventManager.completeQuest('char-1', 'daily-1')
      eventManager.clearEventHistory('char-1')
      const history = eventManager.getEventHistory('char-1')
      expect(history.length).toBe(0)
    })

    it('캐릭터별 이벤트 히스토리 분리', () => {
      eventManager.completeQuest('char-1', 'daily-1')
      eventManager.completeQuest('char-2', 'daily-2')
      const history1 = eventManager.getEventHistory('char-1')
      const history2 = eventManager.getEventHistory('char-2')
      expect(history1.length).toBe(1)
      expect(history2.length).toBe(1)
      expect(history1[0].questId).toBe('daily-1')
      expect(history2[0].questId).toBe('daily-2')
    })
  })

  // ===== 이벤트 상태 요약 테스트 =====
  describe('Event Summary', () => {
    it('이벤트 상태 요약', () => {
      vi.spyOn(eventManager, 'getCurrentSeason').mockReturnValue({
        key: 'SPRING',
        name: '봄 시즌',
        icon: '🌸',
        bonuses: { xpMultiplier: 1.2, affinityMultiplier: 1.1 }
      })
      vi.spyOn(eventManager, 'getActiveSpecialEvents').mockReturnValue([])
      vi.spyOn(eventManager, 'updateDailyQuests').mockReturnValue([
        { id: 'daily-1', title: '로그인하기', xp: 50, gold: 25 }
      ])
      vi.spyOn(eventManager, 'updateWeeklyQuests').mockReturnValue([
        { id: 'weekly-1', title: '채팅 20회 하기', xp: 200, gold: 100 }
      ])

      const summary = eventManager.getEventSummary()
      expect(summary).toHaveProperty('currentSeason')
      expect(summary).toHaveProperty('activeSpecialEvents')
      expect(summary).toHaveProperty('dailyQuests')
      expect(summary).toHaveProperty('weeklyQuests')
      expect(summary).toHaveProperty('bonuses')
    })
  })

  // ===== EventManager 초기화 및 리셋 테스트 =====
  describe('EventManager Initialization & Reset', () => {
    it('EventManager 초기화', () => {
      expect(eventManager).toBeDefined()
      expect(eventManager.seasons).toBeDefined()
      expect(eventManager.specialEvents).toBeDefined()
      expect(eventManager.rewards).toBeDefined()
    })

    it('모든 이벤트 히스토리 초기화', () => {
      eventManager.completeQuest('char-1', 'daily-1')
      eventManager.completeQuest('char-2', 'daily-2')
      eventManager.resetAll()
      const history1 = eventManager.getEventHistory('char-1')
      const history2 = eventManager.getEventHistory('char-2')
      expect(history1.length).toBe(0)
      expect(history2.length).toBe(0)
    })
  })

  // ===== 싱글톤 패턴 테스트 =====
  describe('Singleton Pattern', () => {
    it('getEventManager는 동일한 인스턴스 반환', () => {
      const instance1 = getEventManager()
      const instance2 = getEventManager()
      expect(instance1).toBe(instance2)
    })

    it('새로운 EventManager인스턴스는 별개', () => {
      const manager1 = new EventManager()
      const manager2 = new EventManager()
      expect(manager1).not.toBe(manager2)
    })
  })
})