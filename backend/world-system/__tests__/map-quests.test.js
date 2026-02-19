/**
 * 맵 기반 퀘스트 생성 시스템 테스트
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  QUEST_CATEGORIES,
  QUEST_DIFFICULTIES,
  QUEST_STATUS,
  getQuestTemplates,
  getTemplatesByMap,
  getTemplatesByCategory,
  findTemplateById,
  generateQuestFromTemplate,
  updateQuestProgress,
  checkQuestCompletion,
  completeQuest,
  getActiveQuests,
  importQuestData,
  exportQuestData
} from '../map-quests.js'

describe('맵 기반 퀘스트 생성 시스템', () => {
  const testCharacterId = 'character_001'
  const testMapId = 'main_plaza'

  beforeEach(() => {
    // 각 테스트 전에 데이터 초기화
    importQuestData({})
  })

  afterEach(() => {
    // 각 테스트 후에 데이터 정리
    importQuestData({})
  })

  describe('QUEST_CATEGORIES', () => {
    it('모든 퀘스트 카테고리가 정의되어야 함', () => {
      expect(QUEST_CATEGORIES.EXPLORATION).toBe('exploration')
      expect(QUEST_CATEGORIES.INTERACTION).toBe('interaction')
      expect(QUEST_CATEGORIES.DISCOVERY).toBe('discovery')
      expect(QUEST_CATEGORIES.COLLECTION).toBe('collection')
      expect(QUEST_CATEGORIES.CHALLENGE).toBe('challenge')
      expect(QUEST_CATEGORIES.WEATHER).toBe('weather')
      expect(QUEST_CATEGORIES.SOCIAL).toBe('social')
    })
  })

  describe('QUEST_DIFFICULTIES', () => {
    it('모든 퀘스트 난이도가 정의되어야 함', () => {
      expect(QUEST_DIFFICULTIES.EASY).toBe('easy')
      expect(QUEST_DIFFICULTIES.NORMAL).toBe('normal')
      expect(QUEST_DIFFICULTIES.HARD).toBe('hard')
      expect(QUEST_DIFFICULTIES.EPIC).toBe('epic')
    })
  })

  describe('QUEST_STATUS', () => {
    it('모든 퀘스트 상태가 정의되어야 함', () => {
      expect(QUEST_STATUS.ACTIVE).toBe('active')
      expect(QUEST_STATUS.COMPLETED).toBe('completed')
      expect(QUEST_STATUS.FAILED).toBe('failed')
      expect(QUEST_STATUS.EXPIRED).toBe('expired')
    })
  })

  describe('getQuestTemplates', () => {
    it('모든 퀘스트 템플릿을 반환해야 함', () => {
      const templates = getQuestTemplates()

      expect(templates).toBeDefined()
      expect(templates.default).toBeDefined()
      expect(templates.beach).toBeDefined()
      expect(templates.forest).toBeDefined()
      expect(templates.mountain).toBeDefined()
    })
  })

  describe('getTemplatesByMap', () => {
    it('맵별 퀘스트 템플릿을 반환해야 함', () => {
      const templates = getTemplatesByMap(testMapId)

      expect(templates).toBeDefined()
      expect(Array.isArray(templates)).toBe(true)
    })

    it('없는 맵은 빈 배열을 반환해야 함', () => {
      const templates = getTemplatesByMap('nonexistent_map')

      expect(templates).toEqual([])
    })

    it('각 템플릿에 필요한 필드가 있어야 함', () => {
      const templates = getTemplatesByMap(testMapId)

      templates.forEach(template => {
        expect(template.id).toBeDefined()
        expect(template.category).toBeDefined()
        expect(template.difficulty).toBeDefined()
        expect(template.name).toBeDefined()
        expect(template.description).toBeDefined()
        expect(template.objectives).toBeDefined()
        expect(template.rewards).toBeDefined()
      })
    })
  })

  describe('getTemplatesByCategory', () => {
    it('카테고리별 퀘스트 템플릿을 필터링해야 함', () => {
      const templates = getTemplatesByCategory(QUEST_CATEGORIES.EXPLORATION)

      expect(templates).toBeDefined()
      expect(Array.isArray(templates)).toBe(true)

      templates.forEach(template => {
        expect(template.category).toBe(QUEST_CATEGORIES.EXPLORATION)
      })
    })

    it('없는 카테고리는 빈 배열을 반환해야 함', () => {
      const templates = getTemplatesByCategory('nonexistent_category')

      expect(templates).toEqual([])
    })
  })

  describe('findTemplateById', () => {
    it('ID로 퀘스트 템플릿을 찾을 수 있어야 함', () => {
      const template = findTemplateById('default_explore')

      expect(template).toBeDefined()
      expect(template.id).toBe('default_explore')
    })

    it('없는 ID는 null을 반환해야 함', () => {
      const template = findTemplateById('nonexistent_id')

      expect(template).toBeNull()
    })
  })

  describe('generateQuestFromTemplate', () => {
    it('퀘스트 템플릿에서 퀘스트를 생성할 수 있어야 함', () => {
      const template = findTemplateById('default_explore')
      const quest = generateQuestFromTemplate(testCharacterId, testMapId, template)

      expect(quest).toBeDefined()
      expect(quest.id).toBeDefined()
      expect(quest.characterId).toBe(testCharacterId)
      expect(quest.mapId).toBe(testMapId)
      expect(quest.templateId).toBe(template.id)
      expect(quest.status).toBe(QUEST_STATUS.ACTIVE)
      expect(quest.createdAt).toBeDefined()
    })

    it('퀘스트 ID가 고유해야 함', () => {
      const template = findTemplateById('default_explore')
      const quest1 = generateQuestFromTemplate(testCharacterId, testMapId, template)
      const quest2 = generateQuestFromTemplate(testCharacterId, testMapId, template)

      expect(quest1.id).not.toBe(quest2.id)
    })

    it('목표를 복사해야 함', () => {
      const template = findTemplateById('default_explore')
      const quest = generateQuestFromTemplate(testCharacterId, testMapId, template)

      expect(quest.objectives).toBeDefined()
      expect(quest.objectives.length).toBe(template.objectives.length)
      expect(quest.objectives[0].progress).toBe(0)
    })

    it('시간 제한이 있어야 함', () => {
      const template = findTemplateById('default_interact')
      const quest = generateQuestFromTemplate(testCharacterId, testMapId, template)

      expect(quest.expiresAt).toBeDefined()
      expect(quest.expiresAt).toBeGreaterThan(quest.createdAt)
    })
  })

  describe('updateQuestProgress', () => {
    let questId

    beforeEach(() => {
      const template = findTemplateById('default_explore')
      const quest = generateQuestFromTemplate(testCharacterId, testMapId, template)
      questId = quest.id
    })

    it('퀘스트 진도를 업데이트할 수 있어야 함', () => {
      const result = updateQuestProgress(testCharacterId, questId, 0, 2)

      expect(result.success).toBe(true)
      expect(result.newProgress).toBe(2)
    })

    it('없는 퀘스트는 업데이트할 수 없음', () => {
      const result = updateQuestProgress(testCharacterId, 'nonexistent_quest_id', 0, 1)

      expect(result.success).toBe(false)
    })

    it('완료된 퀘스트는 업데이트할 수 없음', () => {
      completeQuest(testCharacterId, questId)
      const result = updateQuestProgress(testCharacterId, questId, 0, 1)

      expect(result.success).toBe(false)
    })

    it('타겟을 초과하지 않아야 함', () => {
      updateQuestProgress(testCharacterId, questId, 0, 10)

      const result = getActiveQuests(testCharacterId).find(q => q.id === questId)

      expect(result.objectives[0].progress).toBeLessThanOrEqual(result.objectives[0].target)
    })
  })

  describe('checkQuestCompletion', () => {
    let questId

    beforeEach(() => {
      const template = findTemplateById('default_explore')
      const quest = generateQuestFromTemplate(testCharacterId, testMapId, template)
      questId = quest.id
    })

    it('모든 목표 완료 시 퀘스트가 완료되어야 함', () => {
      const template = findTemplateById('default_explore')
      updateQuestProgress(testCharacterId, questId, 0, 5) // target: 5

      const result = checkQuestCompletion(testCharacterId, questId)

      expect(result.completed).toBe(true)
    })

    it('미완료 목표가 있으면 퀘스트가 완료되지 않아야 함', () => {
      updateQuestProgress(testCharacterId, questId, 0, 3)

      const result = checkQuestCompletion(testCharacterId, questId)

      expect(result.completed).toBe(false)
    })

    it('리워드를 계산해야 함', () => {
      const template = findTemplateById('default_explore')
      updateQuestProgress(testCharacterId, questId, 0, 5)

      const result = checkQuestCompletion(testCharacterId, questId)

      expect(result.rewards).toBeDefined()
      expect(Array.isArray(result.rewards)).toBe(true)
      expect(result.rewards.length).toBeGreaterThan(0)
    })
  })

  describe('completeQuest', () => {
    let questId

    beforeEach(() => {
      const template = findTemplateById('default_explore')
      const quest = generateQuestFromTemplate(testCharacterId, testMapId, template)
      questId = quest.id
      updateQuestProgress(testCharacterId, questId, 0, 5)
    })

    it('퀘스트를 완료할 수 있어야 함', () => {
      const result = completeQuest(testCharacterId, questId)

      expect(result.success).toBe(true)
      expect(result.rewards).toBeDefined()
    })

    it('완료된 퀘스트는 다시 완료할 수 없음', () => {
      completeQuest(testCharacterId, questId)
      const result = completeQuest(testCharacterId, questId)

      expect(result.success).toBe(false)
    })

    it('미완료 퀘스트는 완료할 수 없음', () => {
      const template = findTemplateById('default_interact')
      const quest = generateQuestFromTemplate(testCharacterId, testMapId, template)
      const newQuestId = quest.id

      const result = completeQuest(testCharacterId, newQuestId)

      expect(result.success).toBe(false)
    })

    it('활성 퀘스트 목록에서 제거되어야 함', () => {
      completeQuest(testCharacterId, questId)

      const activeQuests = getActiveQuests(testCharacterId)

      expect(activeQuests.find(q => q.id === questId)).toBeUndefined()
    })
  })

  describe('getActiveQuests', () => {
    it('활성 상태인 퀘스트 목록을 반환해야 함', () => {
      const template = findTemplateById('default_explore')
      generateQuestFromTemplate(testCharacterId, testMapId, template)

      const activeQuests = getActiveQuests(testCharacterId)

      expect(activeQuests).toHaveLength(1)
      expect(activeQuests[0].status).toBe(QUEST_STATUS.ACTIVE)
    })

    it('데이터가 없으면 빈 배열을 반환해야 함', () => {
      const activeQuests = getActiveQuests('nonexistent')

      expect(activeQuests).toEqual([])
    })

    it('완료된 퀘스트는 제외해야 함', () => {
      const template = findTemplateById('default_explore')
      const quest = generateQuestFromTemplate(testCharacterId, testMapId, template)
      const questId = quest.id

      updateQuestProgress(testCharacterId, questId, 0, 5)
      completeQuest(testCharacterId, questId)

      const activeQuests = getActiveQuests(testCharacterId)

      expect(activeQuests).toHaveLength(0)
    })
  })

  describe('exportQuestData / importQuestData', () => {
    beforeEach(() => {
      const template = findTemplateById('default_explore')
      const quest = generateQuestFromTemplate(testCharacterId, testMapId, template)
      updateQuestProgress(testCharacterId, quest.id, 0, 3)
    })

    it('데이터를 내보내야 함', () => {
      const exported = exportQuestData()

      expect(exported).toBeDefined()
      expect(exported.quests).toBeDefined()
    })

    it('데이터를 불러올 수 있어야 함', () => {
      const exported = exportQuestData()

      importQuestData({})

      expect(getActiveQuests(testCharacterId)).toHaveLength(0)

      importQuestData(exported)

      expect(getActiveQuests(testCharacterId)).toHaveLength(1)
    })

    it('퀘스트 진도를 보존해야 함', () => {
      const exported = exportQuestData()

      importQuestData({})

      importQuestData(exported)

      const quest = getActiveQuests(testCharacterId)[0]
      expect(quest.objectives[0].progress).toBe(3)
    })
  })
})