import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  createQuest,
  getQuestTemplate,
  getAllQuestTemplates,
  assignQuestToPlayer,
  getPlayerQuests,
  getPlayerActiveQuests,
  getPlayerCompletedQuests,
  getPlayerAvailableQuests,
  updateQuestProgress,
  getQuestProgress,
  completeQuest,
  getQuestReward,
  initializePlayerQuests,
  resetPlayerQuests,
  getAllPlayerQuests
} from '../quest.js'

describe('Quest System', () => {
  const testCharacterId = 'test-character-1'
  const aiCharacterId = 'ai-agent-1'

  afterEach(() => {
    resetPlayerQuests(testCharacterId)
  })

  describe('Quest Templates', () => {
    it('should get a quest template by ID', () => {
      const quest = getQuestTemplate('welcome')
      expect(quest).toBeDefined()
      expect(quest.id).toBe('welcome')
      expect(quest.title).toBe('AI 세계에 오신 것을 환영합니다!')
      expect(quest.questType).toBe('main')
    })

    it('should return null for non-existent quest', () => {
      const quest = getQuestTemplate('non-existent-quest')
      expect(quest).toBeNull()
    })

    it('should get all quest templates', () => {
      const templates = getAllQuestTemplates()
      expect(Object.keys(templates).length).toBeGreaterThan(0)
      expect(templates).toHaveProperty('welcome')
      expect(templates).toHaveProperty('explore_park')
    })
  })

  describe('Quest Creation', () => {
    it('should create a quest from template', () => {
      const template = getQuestTemplate('welcome')
      const quest = createQuest(template)

      expect(quest.id).toBe('welcome')
      expect(quest.title).toBe(template.title)
      expect(quest.status).toBe('available')
      expect(quest.objectives).toEqual(template.objectives)
      expect(quest.assignedAt).toBeNull()
      expect(quest.completedAt).toBeNull()
    })
  })

  describe('Quest Assignment', () => {
    it('should assign quest to player', () => {
      const result = assignQuestToPlayer(testCharacterId, 'welcome')

      expect(result.success).toBe(true)
      expect(result.quest).toBeDefined()
      expect(result.quest.status).toBe('progress')
      expect(result.quest.assignedAt).toBeDefined()
    })

    it('should not assign already assigned quest', () => {
      assignQuestToPlayer(testCharacterId, 'welcome')
      const result = assignQuestToPlayer(testCharacterId, 'welcome')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Quest already assigned')
    })

    it('should not assign non-existent quest', () => {
      const result = assignQuestToPlayer(testCharacterId, 'non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Quest template not found')
    })

    it('should initialize player quests on first join', () => {
      const quests = initializePlayerQuests(testCharacterId)

      expect(quests).toBeDefined()
      expect(Object.keys(quests).length).toBeGreaterThan(0)
      expect(quests).toHaveProperty('welcome')
      expect(quests.welcome.status).toBe('progress')
    })
  })

  describe('Quest Retrieval', () => {
    beforeEach(() => {
      initializePlayerQuests(testCharacterId)
      assignQuestToPlayer(testCharacterId, 'explore_park')
    })

    it('should get all player quests', () => {
      const quests = getPlayerQuests(testCharacterId)

      expect(quests).toBeDefined()
      expect(Object.keys(quests).length).toBeGreaterThan(0)
      expect(quests).toHaveProperty('welcome')
    })

    it('should get active quests', () => {
      const activeQuests = getPlayerActiveQuests(testCharacterId)

      expect(Object.keys(activeQuests).length).toBeGreaterThan(0)
      Object.values(activeQuests).forEach(quest => {
        expect(quest.status).toBe('progress')
      })
    })

    it('should get available quests', () => {
      const availableQuests = getPlayerAvailableQuests(testCharacterId)

      expect(Object.keys(availableQuests).length).toBeGreaterThan(0)
      Object.values(availableQuests).forEach(quest => {
        expect(quest.status).toBe('available')
      })
    })

    it('should respect quest prerequisites', () => {
      const availableQuests = getPlayerAvailableQuests(testCharacterId)

      expect(availableQuests.welcome).toBeUndefined()
      expect(availableQuests.explore_park).toBeUndefined()
      expect(availableQuests.visit_cafe).toBeUndefined()
    })
  })

  describe('Quest Progress', () => {
    beforeEach(() => {
      initializePlayerQuests(testCharacterId)
    })

    it('should update quest progress on interaction', () => {
      assignQuestToPlayer(testCharacterId, 'welcome')
      const updatedQuests = updateQuestProgress(testCharacterId, 'interact', {
        targetCharacterId: aiCharacterId,
        interactionType: 'greet'
      })

      expect(updatedQuests.length).toBeGreaterThan(0)
      expect(updatedQuests[0].objectives[0].currentCount).toBe(1)
    })

    it('should update quest progress on building visit', () => {
      assignQuestToPlayer(testCharacterId, 'explore_park')
      const updatedQuests = updateQuestProgress(testCharacterId, 'enterBuilding', {
        buildingId: 3,
        characterId: testCharacterId
      })

      expect(updatedQuests.length).toBeGreaterThan(0)
      expect(updatedQuests[0].objectives[0].currentCount).toBe(1)
    })

    it('should update quest progress on building stay duration', () => {
      assignQuestToPlayer(testCharacterId, 'explore_park')
      const updatedQuests = updateQuestProgress(testCharacterId, 'buildingStay', {
        buildingId: 3,
        duration: 15000
      })

      const quest = updatedQuests.find(q => q.id === 'explore_park')
      expect(quest).toBeDefined()
      const durationObjective = quest.objectives.find(obj => obj.id === 'stay_park')
      expect(durationObjective.currentCount).toBe(15000)
    })

    it('should not update progress for unrelated events', () => {
      assignQuestToPlayer(testCharacterId, 'welcome')
      const updatedQuests = updateQuestProgress(testCharacterId, 'enterBuilding', {
        buildingId: 1,
        characterId: testCharacterId
      })

      expect(updatedQuests.length).toBe(0)
    })

    it('should calculate quest progress correctly', () => {
      assignQuestToPlayer(testCharacterId, 'welcome')
      const quests = getPlayerQuests(testCharacterId)
      const progress = getQuestProgress(quests.welcome)

      expect(progress.completed).toBe(0)
      expect(progress.total).toBe(1)
      expect(progress.percentage).toBe(0)
    })

    it('should calculate completed quest progress', () => {
      assignQuestToPlayer(testCharacterId, 'welcome')
      updateQuestProgress(testCharacterId, 'interact', {
        targetCharacterId: aiCharacterId,
        interactionType: 'greet'
      })

      const quests = getPlayerQuests(testCharacterId)
      const progress = getQuestProgress(quests.welcome)

      expect(progress.completed).toBe(1)
      expect(progress.total).toBe(1)
      expect(progress.percentage).toBe(100)
    })
  })

  describe('Quest Completion', () => {
    beforeEach(() => {
      initializePlayerQuests(testCharacterId)
    })

    it('should complete quest when all objectives are done', () => {
      assignQuestToPlayer(testCharacterId, 'welcome')
      updateQuestProgress(testCharacterId, 'interact', {
        targetCharacterId: aiCharacterId,
        interactionType: 'greet'
      })

      const result = completeQuest(testCharacterId, 'welcome')

      expect(result.success).toBe(true)
      expect(result.quest.status).toBe('completed')
      expect(result.quest.completedAt).toBeDefined()
    })

    it('should not complete incomplete quest', () => {
      assignQuestToPlayer(testCharacterId, 'welcome')
      const result = completeQuest(testCharacterId, 'welcome')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Quest objectives not completed')
    })

    it('should not complete non-existent quest', () => {
      const result = completeQuest(testCharacterId, 'non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Quest not found')
    })

    it('should get quest reward', () => {
      const reward = getQuestReward('welcome')

      expect(reward).toBeDefined()
      expect(reward.points).toBe(100)
      expect(reward.experience).toBe(50)
      expect(reward.items).toHaveLength(2)
    })

    it('should return null for non-existent quest reward', () => {
      const reward = getQuestReward('non-existent')
      expect(reward).toBeNull()
    })
  })

  describe('Multiple Quest Management', () => {
    beforeEach(() => {
      initializePlayerQuests(testCharacterId)
    })

    it('should handle multiple concurrent quests', () => {
      assignQuestToPlayer(testCharacterId, 'explore_park')
      assignQuestToPlayer(testCharacterId, 'visit_cafe')

      const quests = getPlayerQuests(testCharacterId)
      expect(Object.keys(quests).length).toBeGreaterThan(1)
    })

    it('should return completed quests separately', () => {
      assignQuestToPlayer(testCharacterId, 'welcome')
      updateQuestProgress(testCharacterId, 'interact', {
        targetCharacterId: aiCharacterId,
        interactionType: 'greet'
      })
      completeQuest(testCharacterId, 'welcome')

      const completed = getPlayerCompletedQuests(testCharacterId)
      expect(completed.welcome).toBeDefined()
      expect(completed.welcome.status).toBe('completed')
    })

    it('should make new quests available after prerequisites', () => {
      const availableBefore = getPlayerAvailableQuests(testCharacterId)

      assignQuestToPlayer(testCharacterId, 'welcome')
      updateQuestProgress(testCharacterId, 'interact', {
        targetCharacterId: aiCharacterId,
        interactionType: 'greet'
      })
      completeQuest(testCharacterId, 'welcome')

      const availableAfter = getPlayerAvailableQuests(testCharacterId)

      expect(Object.keys(availableAfter).length).toBeGreaterThan(Object.keys(availableBefore).length)
    })
  })

  describe('Quest Reset', () => {
    it('should reset player quests', () => {
      initializePlayerQuests(testCharacterId)

      const result = resetPlayerQuests(testCharacterId)

      expect(result.success).toBe(true)
      const quests = getPlayerQuests(testCharacterId)
      expect(Object.keys(quests).length).toBe(0)
    })

    it('should get all player quests', () => {
      initializePlayerQuests(testCharacterId)
      const allQuests = getAllPlayerQuests()

      expect(allQuests).toBeDefined()
      expect(allQuests[testCharacterId]).toBeDefined()
    })
  })

  describe('Quest Types', () => {
    it('should identify main quests', () => {
      const quest = getQuestTemplate('welcome')
      expect(quest.questType).toBe('main')
    })

    it('should identify side quests', () => {
      const quest = getQuestTemplate('gym_training')
      expect(quest.questType).toBe('side')
    })

    it('should have proper quest order', () => {
      const welcome = getQuestTemplate('welcome')
      const explore = getQuestTemplate('explore_park')
      const shop = getQuestTemplate('shop_mastery')

      expect(welcome.order).toBeLessThan(explore.order)
      expect(explore.order).toBeLessThan(shop.order)
    })
  })

  describe('Complex Quest Scenarios', () => {
    beforeEach(() => {
      initializePlayerQuests(testCharacterId)
    })

    it('should handle objectives with duration tracking', () => {
      assignQuestToPlayer(testCharacterId, 'explore_park')

      updateQuestProgress(testCharacterId, 'enterBuilding', {
        buildingId: 3,
        characterId: testCharacterId
      })

      const quests = getPlayerQuests(testCharacterId)
      const progress = getQuestProgress(quests.explore_park)

      expect(progress.completed).toBe(1)
      expect(progress.total).toBe(2)
    })

    it('should complete duration objective over multiple stays', () => {
      assignQuestToPlayer(testCharacterId, 'explore_park')

      updateQuestProgress(testCharacterId, 'buildingStay', {
        buildingId: 3,
        duration: 20000
      })

      updateQuestProgress(testCharacterId, 'buildingStay', {
        buildingId: 3,
        duration: 10000
      })

      const quests = getPlayerQuests(testCharacterId)
      const durationObj = quests.explore_park.objectives.find(obj => obj.id === 'stay_park')

      expect(durationObj.currentCount).toBe(30000)
    })
  })
})