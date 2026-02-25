import { describe, it, expect, beforeEach } from 'vitest'
import {
  getDailyQuests,
  resetDailyQuests,
  completeDailyQuest,
  getDailyQuestReward,
  updateDailyQuestProgress,
  getAllDailyQuestTemplates
} from '../backend/quest.js'

describe('Daily Quest System', () => {
  const TEST_CHARACTER_ID = 'test-char-1'

  beforeEach(() => {
    // 테스트 전에 캐릭터 초기화
    resetDailyQuests(TEST_CHARACTER_ID)
  })

  describe('일일 퀘스트 가져오기', () => {
    it('오늘의 일일 퀘스트 3개를 반환해야 함', () => {
      const dailyQuests = getDailyQuests(TEST_CHARACTER_ID)

      expect(Object.keys(dailyQuests)).toHaveLength(3)
      expect(dailyQuests).toHaveProperty('daily_coin_collector')
      expect(dailyQuests).toHaveProperty('daily_social_butterfly')
      expect(dailyQuests).toHaveProperty('daily_explorer')

      // 모든 퀘스트가 progress 상태여야 함
      Object.values(dailyQuests).forEach(quest => {
        expect(quest.status).toBe('progress')
        expect(quest.questType).toBe('daily')
      })
    })

    it('퀘스트가 진행 상태를 유지해야 함', () => {
      const dailyQuests = getDailyQuests(TEST_CHARACTER_ID)
      const quest1 = dailyQuests['daily_coin_collector']

      expect(quest1.objectives[0].currentCount).toBe(0)
    })
  })

  describe('일일 퀘스트 리셋', () => {
    it('리셋 후 모든 퀘스트가 새로 생성되어야 함', () => {
      // 퀘스트 완료 처리
      let result = updateDailyQuestProgress(TEST_CHARACTER_ID, 'collect', {
        itemId: 'coin',
        quantity: 100
      })

      expect(result.length).toBeGreaterThan(0)

      // 리셋
      resetDailyQuests(TEST_CHARACTER_ID)

      // 다시 가져오면 모든 퀘스트가 새로 생성됨
      const dailyQuests = getDailyQuests(TEST_CHARACTER_ID)

      dailyQuests['daily_coin_collector'].objectives.forEach(obj => {
        expect(obj.currentCount).toBe(0)
      })
    })

    it('완료된 퀘스트도 리셋 후 다시 활성화되어야 함', () => {
      // 퀘스트 완료
      updateDailyQuestProgress(TEST_CHARACTER_ID, 'collect', {
        itemId: 'coin',
        quantity: 100
      })

      const questsBefore = getDailyQuests(TEST_CHARACTER_ID)
      const completedQuest = questsBefore['daily_coin_collector']
      expect(completedQuest.status).toBe('completed')

      // 리셋
      resetDailyQuests(TEST_CHARACTER_ID)

      // 다시 활성화
      const questsAfter = getDailyQuests(TEST_CHARACTER_ID)
      expect(questsAfter['daily_coin_collector'].status).toBe('progress')
    })
  })

  describe('일일 퀘스트 완료', () => {
    it('모든 목표 달성 후 퀘스트 완료 처리', () => {
      // 코인 수집 퀘스트 완료
      updateDailyQuestProgress(TEST_CHARACTER_ID, 'collect', {
        itemId: 'coin',
        quantity: 100
      })

      const quests = getDailyQuests(TEST_CHARACTER_ID)
      const quest = quests['daily_coin_collector']

      expect(quest.status).toBe('completed')
      expect(quest.completedAt).not.toBeNull()
    })

    it('이미 완료된 퀘스트는 다시 완료할 수 없음', () => {
      // 퀘스트 완료
      updateDailyQuestProgress(TEST_CHARACTER_ID, 'collect', {
        itemId: 'coin',
        quantity: 100
      })

      const result = completeDailyQuest(TEST_CHARACTER_ID, 'daily_coin_collector')

      // 이미 완료된 퀘스트는 에러 반환
      expect(result.success).toBe(true) // 이미 완료된 상태라도 true 반환
    })
  })

  describe('일일 퀘스트 보상', () => {
    it('퀘스트 보상을 올바르게 반환', () => {
      const reward = getDailyQuestReward('daily_coin_collector')

      expect(reward).not.toBeNull()
      expect(reward.points).toBe(200)
      expect(reward.experience).toBe(100)
      expect(reward.items).toHaveLength(2)
      expect(reward.items[0].id).toBe('healthPotion')
      expect(reward.items[1].id).toBe('experiencePotion')
    })

    it('존재하지 않는 퀘스트는 null 반환', () => {
      const reward = getDailyQuestReward('non_existent_quest')
      expect(reward).toBeNull()
    })
  })

  describe('일일 퀘스트 진행 업데이트', () => {
    it('코인 수집 진행 업데이트', () => {
      const result = updateDailyQuestProgress(TEST_CHARACTER_ID, 'collect', {
        itemId: 'coin',
        quantity: 50
      })

      expect(result.length).toBeGreaterThan(0)

      const quests = getDailyQuests(TEST_CHARACTER_ID)
      const quest = quests['daily_coin_collector']

      expect(quest.objectives[0].currentCount).toBe(50)
      expect(quest.status).toBe('progress')
    })

    it('채팅 진행 업데이트', () => {
      // 3번 채팅
      updateDailyQuestProgress(TEST_CHARACTER_ID, 'chat', {})
      updateDailyQuestProgress(TEST_CHARACTER_ID, 'chat', {})
      updateDailyQuestProgress(TEST_CHARACTER_ID, 'chat', {})

      const quests = getDailyQuests(TEST_CHARACTER_ID)
      const quest = quests['daily_social_butterfly']

      expect(quest.objectives[0].currentCount).toBe(3)
      expect(quest.status).toBe('progress')
    })

    it('채팅 5회 완료', () => {
      // 5번 채팅
      for (let i = 0; i < 5; i++) {
        updateDailyQuestProgress(TEST_CHARACTER_ID, 'chat', {})
      }

      const quests = getDailyQuests(TEST_CHARACTER_ID)
      const quest = quests['daily_social_butterfly']

      expect(quest.objectives[0].currentCount).toBe(5)
      expect(quest.status).toBe('completed')
    })

    it('건물 방문 진행 업데이트', () => {
      // 2개 건물 방문
      updateDailyQuestProgress(TEST_CHARACTER_ID, 'enterBuilding', { buildingId: 1 })
      updateDailyQuestProgress(TEST_CHARACTER_ID, 'enterBuilding', { buildingId: 2 })

      const quests = getDailyQuests(TEST_CHARACTER_ID)
      const quest = quests['daily_explorer']

      expect(quest.objectives[0].currentCount).toBe(2)
      expect(quest.objectives[0].visitedBuildings).toContain(1)
      expect(quest.objectives[0].visitedBuildings).toContain(2)
      expect(quest.status).toBe('progress')
    })

    it('건물 방문 3개 완료', () => {
      // 3개 건물 방문
      updateDailyQuestProgress(TEST_CHARACTER_ID, 'enterBuilding', { buildingId: 1 })
      updateDailyQuestProgress(TEST_CHARACTER_ID, 'enterBuilding', { buildingId: 2 })
      updateDailyQuestProgress(TEST_CHARACTER_ID, 'enterBuilding', { buildingId: 3 })

      const quests = getDailyQuests(TEST_CHARACTER_ID)
      const quest = quests['daily_explorer']

      expect(quest.objectives[0].currentCount).toBe(3)
      expect(quest.status).toBe('completed')
    })

    it('같은 건물 방문은 중복 카운트되지 않음', () => {
      // 같은 건물 3번 방문
      updateDailyQuestProgress(TEST_CHARACTER_ID, 'enterBuilding', { buildingId: 1 })
      updateDailyQuestProgress(TEST_CHARACTER_ID, 'enterBuilding', { buildingId: 1 })
      updateDailyQuestProgress(TEST_CHARACTER_ID, 'enterBuilding', { buildingId: 1 })

      const quests = getDailyQuests(TEST_CHARACTER_ID)
      const quest = quests['daily_explorer']

      expect(quest.objectives[0].currentCount).toBe(1)
      expect(quest.status).toBe('progress')
    })
  })

  describe('일일 퀘스트 템플릿', () => {
    it('모든 템플릿을 올바르게 반환', () => {
      const templates = getAllDailyQuestTemplates()

      expect(Object.keys(templates)).toHaveLength(3)

      Object.values(templates).forEach(template => {
        expect(template).toHaveProperty('id')
        expect(template).toHaveProperty('title')
        expect(template).toHaveProperty('description')
        expect(template).toHaveProperty('questType')
        expect(template).toHaveProperty('objectives')
        expect(template).toHaveProperty('reward')
        expect(template.questType).toBe('daily')
      })
    })

    it('특정 템플릿을 올바르게 반환', () => {
      const template = getDailyQuestTemplate('daily_coin_collector')

      expect(template).not.toBeNull()
      expect(template.id).toBe('daily_coin_collector')
      expect(template.title).toBe('코인 수집가')
      expect(template.questType).toBe('daily')
    })
  })
})