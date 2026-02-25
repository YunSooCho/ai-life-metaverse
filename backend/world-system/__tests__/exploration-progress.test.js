/**
 * 탐험 진행률 시스템 테스트
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  EXPLORATION_ACTIVITIES,
  EXPLORATION_LEVELS,
  getMapExploration,
  getExplorationData,
  recordMapVisit,
  addProgress,
  getMapCompletion,
  getOverallCompletion,
  getExplorationStats,
  getExplorationRankings,
  exportExplorationData,
  importExplorationData,
  getSystemStats
} from '../exploration-progress.js'

describe('탐험 진행률 시스템', () => {
  const testCharacterId = 'character_001'
  const testMapId = 'default' // MAP_TYPES.DEFAULT

  beforeEach(() => {
    // 각 테스트 전에 데이터 초기화
    const data = exportExplorationData()
    Object.keys(data).forEach(key => {
      delete data[key]
    })
    importExplorationData(data)
  })

  afterEach(() => {
    // 각 테스트 후에 데이터 정리
    const data = exportExplorationData()
    Object.keys(data).forEach(key => {
      delete data[key]
    })
    importExplorationData(data)
  })

  describe('EXPLORATION_ACTIVITIES', () => {
    it('모든 활동 유형이 정의되어야 함', () => {
      expect(EXPLORATION_ACTIVITIES.VISIT).toBe('visit')
      expect(EXPLORATION_ACTIVITIES.INTERACT).toBe('interact')
      expect(EXPLORATION_ACTIVITIES.DISCOVER).toBe('discover')
      expect(EXPLORATION_ACTIVITIES.COMPLETE_QUEST).toBe('complete_quest')
      expect(EXPLORATION_ACTIVITIES.SOCIALIZE).toBe('socialize')
      expect(EXPLORATION_ACTIVITIES.COLLECT).toBe('collect')
      expect(EXPLORATION_ACTIVITIES.STAY_DURATION).toBe('stay_duration')
    })
  })

  describe('EXPLORATION_LEVELS', () => {
    it('모든 레벨이 정의되어야 함', () => {
      expect(EXPLORATION_LEVELS[1]).toEqual({ maxProgress: 100, title: '초보 탐험가' })
      expect(EXPLORATION_LEVELS[2]).toEqual({ maxProgress: 250, title: '일반 탐험가' })
      expect(EXPLORATION_LEVELS[3]).toEqual({ maxProgress: 500, title: '숙련된 탐험가' })
      expect(EXPLORATION_LEVELS[4]).toEqual({ maxProgress: 1000, title: '전문 탐험가' })
      expect(EXPLORATION_LEVELS[5]).toEqual({ maxProgress: 2000, title: '전설적 탐험가' })
    })

    it('레벨별 진행량이 증가해야 함', () => {
      expect(EXPLORATION_LEVELS[2].maxProgress).toBeGreaterThan(EXPLORATION_LEVELS[1].maxProgress)
      expect(EXPLORATION_LEVELS[3].maxProgress).toBeGreaterThan(EXPLORATION_LEVELS[2].maxProgress)
    })
  })

  describe('getMapExploration', () => {
    it('데이터가 없으면 null을 반환해야 함', () => {
      const result = getMapExploration('nonexistent', testMapId)
      expect(result).toBeNull()
    })

    it('존재하는 맵의 탐험 데이터를 반환해야 함', () => {
      recordMapVisit(testCharacterId, testMapId)
      const result = getMapExploration(testCharacterId, testMapId)

      expect(result).not.toBeNull()
      expect(result.mapId).toBe(testMapId)
      expect(result.progress).toBe(10) // 최초 방문 보너스
      expect(result.visitCount).toBe(1)
    })
  })

  describe('getExplorationData', () => {
    it('데이터가 없으면 기본 구조를 반환해야 함', () => {
      const result = getExplorationData(testCharacterId)

      expect(result.level).toBe(1)
      expect(result.totalProgress).toBe(0)
      expect(result.mapProgress).toEqual({})
      expect(result.achievements).toEqual([])
    })

    it('캐릭터의 모든 탐험 데이터를 반환해야 함', () => {
      recordMapVisit(testCharacterId, testMapId)
      addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.INTERACT, 5)

      const result = getExplorationData(testCharacterId)

      expect(result.level).toBe(1)
      expect(result.totalProgress).toBe(15) // 10 (방문) + 5 (상호작션)
      expect(result.mapProgress[testMapId]).toBeDefined()
      expect(result.mapProgress[testMapId].progress).toBe(15)
    })
  })

  describe('recordMapVisit', () => {
    it('존재하지 않는 맵은 기록하지 않아야 함', () => {
      const result = recordMapVisit(testCharacterId, 'invalid_map')
      expect(result).toBe(false)
    })

    it('최초 방문 시 보너스를 지급해야 함', () => {
      const result = recordMapVisit(testCharacterId, testMapId)

      expect(result).toBe(true)
      const data = getMapExploration(testCharacterId, testMapId)
      expect(data.progress).toBe(10)
      expect(data.visitCount).toBe(1)
      expect(data.firstVisitAt).toBeDefined()
      expect(data.lastVisitAt).toBeDefined()
    })

    it('재방문 시 보너스 없이 5만 추가해야 함 (VISIT weight = 5)', () => {
      recordMapVisit(testCharacterId, testMapId)
      const progress1 = getMapExploration(testCharacterId, testMapId).progress

      recordMapVisit(testCharacterId, testMapId)
      const progress2 = getMapExploration(testCharacterId, testMapId).progress

      expect(progress2).toBe(progress1 + 5) // VISIT weight = 5
      expect(getMapExploration(testCharacterId, testMapId).visitCount).toBe(2)
    })

    it('방문 시간을 기록해야 함', () => {
      recordMapVisit(testCharacterId, testMapId)
      const data = getMapExploration(testCharacterId, testMapId)

      expect(data.firstVisitAt).toBeGreaterThan(0)
      expect(data.lastVisitAt).toBeGreaterThan(0)
    })

    it('여러 캐릭터의 방문을 별도로 추적해야 함', () => {
      recordMapVisit(testCharacterId, testMapId)
      recordMapVisit('character_002', testMapId)

      const data1 = getMapExploration(testCharacterId, testMapId)
      const data2 = getMapExploration('character_002', testMapId)

      expect(data1.visitCount).toBe(1)
      expect(data2.visitCount).toBe(1)
      expect(data1.progress).toBe(10)
      expect(data2.progress).toBe(10)
    })
  })

  describe('addProgress', () => {
    beforeEach(() => {
      recordMapVisit(testCharacterId, testMapId)
    })

    it('활동 진행을 추가해야 함', () => {
      const result = addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.INTERACT, 10)

      expect(result.progressGain).toBe(10) // 1 * 10
      expect(result.totalProgress).toBe(20) // 10 (방문) + 10
      expect(result.level).toBe(1)
    })

    it('활동별 가중치를 적용해야 함', () => {
      const visitResult = addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.VISIT, 1)
      const discoverResult = addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.DISCOVER, 1)
      const questResult = addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.COMPLETE_QUEST, 1)

      expect(visitResult.progressGain).toBe(5)
      expect(discoverResult.progressGain).toBe(50)
      expect(questResult.progressGain).toBe(30)
    })

    it('마일스톤을 확인해야 함', () => {
      addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.INTERACT, 10)

      const result = addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.INTERACT, 1)

      expect(result.milestones).toContain('interactions_10')
    })

    it('이미 완료된 마일스톤은 중복해서 주지 않아야 함', () => {
      addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.INTERACT, 10)
      const result1 = addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.INTERACT, 1)

      const result2 = addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.INTERACT, 1)

      expect(result1.milestones).toContain('interactions_10')
      expect(result2.milestones).not.toContain('interactions_10')
    })

    it('리워드를 계산해야 함', () => {
      addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.INTERACT, 10)
      const result = addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.INTERACT, 1)

      expect(result.rewards).toBeDefined()
      expect(result.rewards).toBeInstanceOf(Array)
    })

    it('레벨업이 발생해야 함', () => {
      // Level 1: 100 progress needed
      addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.VISIT, 18) // 10 + 18 * 5 = 100

      const result = getExplorationData(testCharacterId)

      expect(result.level).toBe(2)
    })

    it('총 진행량을 누적해야 함', () => {
      addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.INTERACT, 10)
      addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.DISCOVER, 1)

      const data = getExplorationData(testCharacterId)

      expect(data.totalProgress).toBe(70) // 10 (방문) + 10 (상호작션) + 50 (발견)
    })
  })

  describe('getMapCompletion', () => {
    it('데이터가 없으면 0을 반환해야 함', () => {
      const result = getMapCompletion('nonexistent', testMapId)
      expect(result).toBe(0)
    })

    it('맵 완료율을 계산해야 함', () => {
      recordMapVisit(testCharacterId, testMapId)
      addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.VISIT, 18)

      const result = getMapCompletion(testCharacterId, testMapId)

      expect(parseFloat(result)).toBe(100)
    })

    it('진도에 따라 비율을 계산해야 함', () => {
      recordMapVisit(testCharacterId, testMapId)

      const result = getMapCompletion(testCharacterId, testMapId)

      expect(parseFloat(result)).toBe(10)
    })

    it('최대 100% 초과하지 않아야 함', () => {
      recordMapVisit(testCharacterId, testMapId)
      addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.VISIT, 50) // 10 + 250 = 260

      const result = getMapCompletion(testCharacterId, testMapId)

      expect(parseFloat(result)).toBe(100)
    })
  })

  describe('getOverallCompletion', () => {
    it('전체 완료율을 계산해야 함', () => {
      recordMapVisit(testCharacterId, testMapId)

      const result = getOverallCompletion(testCharacterId)

      expect(result.averageCompletion).toBeDefined()
      expect(result.mapCompletions).toBeDefined()
      expect(result.totalProgress).toBe(10)
      expect(result.level).toBe(1)
    })

    it('맵별 완료율을 포함해야 함', () => {
      recordMapVisit(testCharacterId, testMapId)
      recordMapVisit(testCharacterId, 'beach')

      const result = getOverallCompletion(testCharacterId)

      expect(parseFloat(result.mapCompletions[testMapId])).toBe(10)
      expect(parseFloat(result.mapCompletions['beach'])).toBe(10)
    })

    it('평균 완료율을 계산해야 함', () => {
      recordMapVisit(testCharacterId, testMapId)

      const result = getOverallCompletion(testCharacterId)

      expect(parseFloat(result.averageCompletion)).toBeGreaterThan(0)
    })
  })

  describe('getExplorationStats', () => {
    beforeEach(() => {
      recordMapVisit(testCharacterId, testMapId)
      addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.INTERACT, 10)
      recordMapVisit(testCharacterId, 'beach')
    })

    it('기본 통계를 반환해야 함', () => {
      const stats = getExplorationStats(testCharacterId)

      expect(stats.totalProgress).toBe(20)
      expect(stats.level).toBe(1)
      expect(stats.levelTitle).toBe('초보 탐험가')
      expect(stats.mapsVisited).toBe(2)
      expect(stats.totalMaps).toBeGreaterThan(0)
    })

    it('활동 통계를 포함해야 함', () => {
      const stats = getExplorationStats(testCharacterId)

      expect(stats.activities[EXPLORATION_ACTIVITIES.VISIT]).toBe(2)
      expect(stats.activities[EXPLORATION_ACTIVITIES.INTERACT]).toBe(10)
    })

    it('마일스톤 개수를 포함해야 함', () => {
      const stats = getExplorationStats(testCharacterId)

      expect(stats.milestones).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getExplorationRankings', () => {
    beforeEach(() => {
      recordMapVisit(testCharacterId, testMapId)
      addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.DISCOVER, 2)

      recordMapVisit('character_002', testMapId)
      recordMapVisit('character_003', testMapId)
      addProgress('character_003', testMapId, EXPLORATION_ACTIVITIES.DISCOVER, 1)
    })

    it('진행량 기준으로 정렬해야 함', () => {
      const rankings = getExplorationRankings(10)

      expect(rankings).toHaveLength(3)
      expect(rankings[0].characterId).toBe(testCharacterId) // 110 progress
      expect(rankings[1].characterId).toBe('character_003') // 60 progress
      expect(rankings[2].characterId).toBe('character_002') // 10 progress
    })

    it('limit 만큼만 반환해야 함', () => {
      const rankings = getExplorationRankings(2)

      expect(rankings).toHaveLength(2)
    })

    it('필요한 데이터를 포함해야 함', () => {
      const rankings = getExplorationRankings(10)

      rankings.forEach(ranking => {
        expect(ranking.characterId).toBeDefined()
        expect(ranking.totalProgress).toBeDefined()
        expect(ranking.level).toBeDefined()
        expect(ranking.mapsVisited).toBeDefined()
      })
    })
  })

  describe('exportExplorationData / importExplorationData', () => {
    beforeEach(() => {
      recordMapVisit(testCharacterId, testMapId)
      addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.DISCOVER, 1)
    })

    it('데이터를 내보내야 함', () => {
      const exported = exportExplorationData()

      expect(exported).toBeDefined()
      expect(exported[testCharacterId]).toBeDefined()
      expect(exported[testCharacterId].totalProgress).toBe(60)
    })

    it('데이터를 불러올 수 있어야 함', () => {
      const exported = exportExplorationData()

      const emptyData = exportExplorationData()
      Object.keys(emptyData).forEach(key => {
        delete emptyData[key]
      })
      importExplorationData(emptyData)

      expect(getExplorationData(testCharacterId).totalProgress).toBe(0)

      importExplorationData(exported)

      expect(getExplorationData(testCharacterId).totalProgress).toBe(60)
    })

    it('여러 캐릭터의 데이터를 내보내고 불러올 수 있어야 함', () => {
      recordMapVisit('character_002', 'beach')

      const exported = exportExplorationData()

      const emptyData = exportExplorationData()
      Object.keys(emptyData).forEach(key => {
        delete emptyData[key]
      })
      importExplorationData(emptyData)

      expect(getExplorationData(testCharacterId).totalProgress).toBe(0)
      expect(getExplorationData('character_002').totalProgress).toBe(0)

      importExplorationData(exported)

      expect(getExplorationData(testCharacterId).totalProgress).toBe(60)
      expect(getExplorationData('character_002').totalProgress).toBe(10)
    })
  })

  describe('getSystemStats', () => {
    beforeEach(() => {
      recordMapVisit(testCharacterId, testMapId)
      addProgress(testCharacterId, testMapId, EXPLORATION_ACTIVITIES.DISCOVER, 1)
      recordMapVisit('character_002', 'beach')
    })

    it('시스템 통계를 반환해야 함', () => {
      const stats = getSystemStats()

      expect(stats.totalCharacters).toBe(2)
      expect(stats.totalProgress).toBe(70)
      expect(parseFloat(stats.averageProgressPerCharacter)).toBe(35)
    })

    it('데이터가 없으면 0을 반환해야 함', () => {
      const emptyData = exportExplorationData()
      Object.keys(emptyData).forEach(key => {
        delete emptyData[key]
      })
      importExplorationData(emptyData)

      const stats = getSystemStats()

      expect(stats.totalCharacters).toBe(0)
      expect(stats.totalProgress).toBe(0)
      expect(stats.averageProgressPerCharacter).toBe('0')
    })
  })
})