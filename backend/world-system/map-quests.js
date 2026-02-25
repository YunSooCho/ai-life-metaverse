/**
 * 맵 기반 퀘스트 생성 시스템
 * 맵별 자동 퀘스트 생성 및 관리
 */

import { mapExists, getMap, getAllMaps } from './maps.js'
import { getMapExploration } from './exploration-progress.js'
import { getMapWeather } from './weather-bridge.js'

// 퀘스트 카테고리
export const QUEST_CATEGORIES = {
  EXPLORATION: 'exploration',     // 탐험
  INTERACTION: 'interaction',     // 상호작션
  DISCOVERY: 'discovery',         // 발견
  COLLECTION: 'collection',       // 수집
  CHALLENGE: 'challenge',         // 챌린지
  WEATHER: 'weather',             // 날씨 기반
  SOCIAL: 'social'                // 소셜 (NPC 대화)
}

// 퀘스트 난이도
export const QUEST_DIFFICULTIES = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
  EPIC: 'epic'
}

// 퀘스트 상태
export const QUEST_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  EXPIRED: 'expired'
}

// 맵별 퀘스트 템플릿
export const MAP_QUEST_TEMPLATES = {
  default: [
    {
      id: 'default_explore',
      category: QUEST_CATEGORIES.EXPLORATION,
      difficulty: QUEST_DIFFICULTIES.EASY,
      name: '광장 탐험',
      description: '메인 광장을 자유롭게 탐험해보세요.',
      objectives: [
        { type: 'explore', target: 5, description: '5회 맵 탐험' }
      ],
      rewards: [
        { type: 'experience', amount: 50 },
        { type: 'coin', amount: 100 }
      ],
      timeLimit: null, // 제한 없음
      cooldown: 0 // 1회성
    },
    {
      id: 'default_interact',
      category: QUEST_CATEGORIES.INTERACTION,
      difficulty: QUEST_DIFFICULTIES.EASY,
      name: '상호작션 배우기',
      description: '다양한 곳을 클릭해보세요.',
      objectives: [
        { type: 'interact', target: 10, description: '10회 상호작션' }
      ],
      rewards: [
        { type: 'experience', amount: 30 },
        { type: 'coin', amount: 50 }
      ],
      timeLimit: 3600, // 1시간
      cooldown: 1800 // 30분
    }
  ],

  beach: [
    {
      id: 'beach_shell_collect',
      category: QUEST_CATEGORIES.COLLECTION,
      difficulty: QUEST_DIFFICULTIES.NORMAL,
      name: '조개 수집가',
      description: '해변에서 조개를 모아보세요.',
      objectives: [
        { type: 'collect', itemType: 'shell', target: 5, description: '조개 5개 수집' }
      ],
      rewards: [
        { type: 'experience', amount: 80 },
        { type: 'coin', amount: 150 },
        { type: 'item', itemId: 'beach_hat', cantidad: 1 }
      ],
      timeLimit: 7200, // 2시간
      cooldown: 86400 // 1일
    },
    {
      id: 'beach_sunset_watch',
      category: QUEST_CATEGORIES.EXPLORATION,
      difficulty: QUEST_DIFFICULTIES.HARD,
      name: '해변 일출 감상',
      description: '해변에서 새벽 5-6시에 머무르세요.',
      objectives: [
        { type: 'stay_duration', timeRange: [5, 6], target: 3600, description: '새벽 5-6시에 1시간 머무르기' }
      ],
      rewards: [
        { type: 'experience', amount: 200 },
        { type: 'coin', amount: 300 },
        { type: 'title', titleId: 'sunrise_watcher' }
      ],
      timeLimit: null,
      cooldown: 86400 // 1일
    },
    {
      id: 'beach_weather_rainy',
      category: QUEST_CATEGORIES.WEATHER,
      difficulty: QUEST_DIFFICULTIES.NORMAL,
      name: '비 오는 해변',
      description: '비가 올 때 해변에 방문하세요.',
      objectives: [
        { type: 'visit_during_weather', weather: 'rainy', target: 1, description: '비 날씨 시 해변 방문' }
      ],
      rewards: [
        { type: 'experience', amount: 100 },
        { type: 'item', itemId: 'raincoat', cantidad: 1 }
      ],
      timeLimit: null,
      cooldown: 7200 // 2시간
    }
  ],

  forest: [
    {
      id: 'forest_explore_deep',
      category: QUEST_CATEGORIES.CHALLENGE,
      difficulty: QUEST_DIFFICULTIES.HARD,
      name: '숲 깊은 곳 탐험',
      description: '숲의 깊은 곳까지 탐험해보세요.',
      objectives: [
        { type: 'explore_area', areas: ['forest'], target: 20, description: '숲에서 20회 탐험' }
      ],
      rewards: [
        { type: 'experience', amount: 300 },
        { type: 'coin', amount: 500 },
        { type: 'item', itemId: 'forest_compass', cantidad: 1 }
      ],
      timeLimit: 7200, // 2시간
      cooldown: 86400 // 1일
    },
    {
      id: 'forest_butterfly_chase',
      category: QUEST_CATEGORIES.DISCOVERY,
      difficulty: QUEST_DIFFICULTIES.NORMAL,
      name: '나비 쫓기',
      description: '나비를 발견해보세요.',
      objectives: [
        { type: 'discover', targetId: 'butterfly', target: 3, description: '나비 발견 3회' }
      ],
      rewards: [
        { type: 'experience', amount: 150 },
        { type: 'coin', amount: 200 }
      ],
      timeLimit: 3600, // 1시간
      cooldown: 1800 // 30분
    },
    {
      id: 'forest_night_exploration',
      category: QUEST_CATEGORIES.EXPLORATION,
      difficulty: QUEST_DIFFICULTIES.EPIC,
      name: '밤의 숲 탐험',
      description: '밤에 숲을 탐험해 보세요.',
      objectives: [
        { type: 'visit_during_time', timeOfDay: 'night', target: 5, description: '밤에 5회 방문' }
      ],
      rewards: [
        { type: 'experience', amount: 500 },
        { type: 'coin', amount: 800 },
        { type: 'title', titleId: 'night_explorer' }
      ],
      timeLimit: null,
      cooldown: 172800 // 2일
    }
  ],

  mountain: [
    {
      id: 'mountain_summit',
      category: QUEST_CATEGORIES.CHALLENGE,
      difficulty: QUEST_DIFFICULTIES.EPIC,
      name: '산 정상 정복',
      description: '산 정상에 올라가세요.',
      objectives: [
        { type: 'climb', target: 100, description: '100m 높이 도달' }
      ],
      rewards: [
        { type: 'experience', amount: 500 },
        { type: 'coin', amount: 1000 },
        { type: 'title', titleId: 'summit_climber' }
      ],
      timeLimit: 14400, // 4시간
      cooldown: 172800 // 2일
    },
    {
      id: 'mountain_snow_collect',
      category: QUEST_CATEGORIES.COLLECTION,
      difficulty: QUEST_DIFFICULTIES.NORMAL,
      name: '눈송이 수집',
      description: '눈송이를 모아보세요.',
      objectives: [
        { type: 'collect', itemType: 'snowflake', target: 10, description: '눈송이 10개 수집' }
      ],
      rewards: [
        { type: 'experience', amount: 100 },
        { type: 'coin', amount: 200 }
      ],
      timeLimit: 3600, // 1시간
      cooldown: 1800 // 30분
    }
  ]
}

// 캐릭터별 퀘스트 데이터
// { characterId: { activeQuests: [], completedQuests: [], questHistory: {} } }
const questData = new Map()

/**
 * 맵 퀘스트 템플릿 조회
 * @param {string} mapId - 맵 ID
 * @returns {Array} 퀘스트 템플릿 배열
 */
export function getMapQuestTemplates(mapId) {
  if (!mapExists(mapId)) {
    return []
  }
  return MAP_QUEST_TEMPLATES[mapId] || []
}

/**
 * 캐릭터에게 퀘스트 자동 생성
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mapId - 맵 ID
 * @param {Object} context - 추가 컨텍스트
 * @returns {Array} 생성된 퀘스트 배열
 */
export function autoGenerateQuests(characterId, mapId, context = {}) {
  const templates = getMapQuestTemplates(mapId)
  const characterQuests = questData.get(characterId) || { activeQuests: [], completedQuests: [], questHistory: {} }

  const newQuests = []

  templates.forEach(template => {
    // 쿨다운 확인
    const lastCompleted = characterQuests.questHistory[template.id]
    if (lastCompleted && Date.now() - lastCompleted < template.cooldown) {
      return
    }

    // 이미 활성화된 퀘스트 확인
    if (characterQuests.activeQuests.some(q => q.templateId === template.id)) {
      return
    }

    // 날씨 조건 확인
    if (template.category === QUEST_CATEGORIES.WEATHER) {
      const weather = getMapWeather(mapId)
      const weatherObjective = template.objectives.find(o => o.weather === weather.type)
      if (weatherObjective && weather.type !== weatherObjective.weather) {
        return // 날씨 불일치 시 생성하지 않음
      }
    }

    // 퀘스트 생성
    const quest = createQuestFromTemplate(template, characterId, mapId, context)
    newQuests.push(quest)
  })

  // 퀘스트 추가
  characterQuests.activeQuests.push(...newQuests)
  questData.set(characterId, characterQuests)

  return newQuests
}

/**
 * 퀘스트 템플릿에서 퀘스트 생성
 * @param {Object} template - 템플릿
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mapId - 맵 ID
 * @param {Object} context - 컨텍스트
 * @returns {Object} 퀘스트 객체
 */
function createQuestFromTemplate(template, characterId, mapId, context) {
  const quest = {
    id: `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId: template.id,
    characterId,
    mapId,
    category: template.category,
    difficulty: template.difficulty,
    name: template.name,
    description: template.description,
    objectives: template.objectives.map(obj => ({ ...obj, progress: 0, completed: false })),
    rewards: template.rewards,
    status: QUEST_STATUS.ACTIVE,
    createdAt: Date.now(),
    expiresAt: template.timeLimit ? Date.now() + template.timeLimit * 1000 : null,
    cooldown: template.cooldown
  }

  return quest
}

/**
 * 캐릭터의 활성 퀘스트 조회
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mapId - 맵 ID (옵션)
 * @returns {Array} 활성 퀘스트 배열
 */
export function getActiveQuests(characterId, mapId = null) {
  const characterQuests = questData.get(characterId)
  if (!characterQuests) {
    return []
  }

  let quests = characterQuests.activeQuests

  if (mapId) {
    quests = quests.filter(q => q.mapId === mapId)
  }

  return quests
}

/**
 * 퀘스트 진행 업데이트
 * @param {string} characterId - 캐릭터 ID
 * @param {string} questId - 퀘스트 ID
 * @param {string} objectiveType - 목표 유형
 * @param {number} amount - 진행량
 * @returns {Object|null} 업데이트 결과
 */
export function updateQuestProgress(characterId, questId, objectiveType, amount = 1) {
  const characterQuests = questData.get(characterId)
  if (!characterQuests) {
    return null
  }

  const quest = characterQuests.activeQuests.find(q => q.id === questId)
  if (!quest || quest.status !== QUEST_STATUS.ACTIVE) {
    return null
  }

  let allCompleted = true

  quest.objectives.forEach(obj => {
    if (obj.type === objectiveType && !obj.completed) {
      obj.progress = Math.min(obj.progress + amount, obj.target)
      if (obj.progress >= obj.target) {
        obj.completed = true
      }
    }

    if (!obj.completed) {
      allCompleted = false
    }
  })

  // 퀘스트 완료 확인
  if (allCompleted) {
    return completeQuest(characterId, questId)
  }

  questData.set(characterId, characterQuests)

  return {
    quest,
    completed: false,
    progress: quest.objectives
  }
}

/**
 * 퀘스트 완료 처리
 * @param {string} characterId - 캐릭터 ID
 * @param {string} questId - 퀘스트 ID
 * @returns {Object|null} 완료 결과
 */
export function completeQuest(characterId, questId) {
  const characterQuests = questData.get(characterId)
  if (!characterQuests) {
    return null
  }

  const questIndex = characterQuests.activeQuests.findIndex(q => q.id === questId)
  if (questIndex === -1) {
    return null
  }

  const quest = characterQuests.activeQuests[questIndex]
  quest.status = QUEST_STATUS.COMPLETED
  quest.completedAt = Date.now()

  // 완료 퀘스트로 이동
  characterQuests.completedQuests.push(quest)
  characterQuests.activeQuests.splice(questIndex, 1)

  // 히스토리 기록
  characterQuests.questHistory[quest.templateId] = Date.now()

  questData.set(characterId, characterQuests)

  return {
    quest,
    rewards: quest.rewards,
    completed: true
  }
}

/**
 * 만료된 퀘스트 정리
 * @param {string} characterId - 캐릭터 ID
 * @returns {Array} 만료된 퀘스트 배열
 */
export function cleanupExpiredQuests(characterId) {
  const characterQuests = questData.get(characterId)
  if (!characterQuests) {
    return []
  }

  const currentTime = Date.now()
  const expiredQuests = []

  characterQuests.activeQuests = characterQuests.activeQuests.filter(quest => {
    if (quest.expiresAt && currentTime > quest.expiresAt) {
      quest.status = QUEST_STATUS.EXPIRED
      expiredQuests.push(quest)
      return false
    }
    return true
  })

  if (expiredQuests.length > 0) {
    questData.set(characterId, characterQuests)
  }

  return expiredQuests
}

/**
 * 퀘스트 통계
 * @param {string} characterId - 캐릭터 ID
 * @returns {Object} 통계
 */
export function getQuestStats(characterId) {
  const characterQuests = questData.get(characterId)
  if (!characterQuests) {
    return {
      totalActive: 0,
      totalCompleted: 0,
      byCategory: {},
      byDifficulty: {},
      totalRewards: { experience: 0, coin: 0 }
    }
  }

  const stats = {
    totalActive: characterQuests.activeQuests.length,
    totalCompleted: characterQuests.completedQuests.length,
    byCategory: {},
    byDifficulty: {},
    totalRewards: { experience: 0, coin: 0 }
  }

  characterQuests.completedQuests.forEach(quest => {
    // 카테고리별 통계
    stats.byCategory[quest.category] = (stats.byCategory[quest.category] || 0) + 1

    // 난이도별 통계
    stats.byDifficulty[quest.difficulty] = (stats.byDifficulty[quest.difficulty] || 0) + 1

    // 리워드 통계
    quest.rewards.forEach(reward => {
      if (reward.type === 'experience') {
        stats.totalRewards.experience += reward.amount
      } else if (reward.type === 'coin') {
        stats.totalRewards.coin += reward.amount
      }
    })
  })

  return stats
}

/**
 * 퀘스트 데이터 내보내기 (Redis 영속화용)
 * @returns {Object} 모든 퀘스트 데이터
 */
export function exportQuestData() {
  const data = {}
  questData.forEach((value, key) => {
    data[key] = value
  })
  return data
}

/**
 * 퀘스트 데이터 불러오기 (Redis 영속화용)
 * @param {Object} data - 불러올 데이터
 */
export function importQuestData(data) {
  Object.entries(data).forEach(([characterId, value]) => {
    questData.set(characterId, value)
  })
}

// 시스템 통계
export function getSystemStats() {
  let totalActiveQuests = 0
  let totalCompletedQuests = 0

  questData.forEach((characterQuests) => {
    totalActiveQuests += characterQuests.activeQuests.length
    totalCompletedQuests += characterQuests.completedQuests.length
  })

  return {
    totalCharactersWithQuests: questData.size,
    totalActiveQuests,
    totalCompletedQuests,
    averageActiveQuestsPerCharacter: questData.size > 0
      ? (totalActiveQuests / questData.size).toFixed(2)
      : 0,
    averageCompletedQuestsPerCharacter: questData.size > 0
      ? (totalCompletedQuests / questData.size).toFixed(2)
      : 0
  }
}