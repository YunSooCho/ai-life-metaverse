/**
 * 탐험 진행률 시스템
 * 맵별 탐험 진행률, 업적, 리워드 관리
 */

import { mapExists, getAllMaps, getMap } from './maps.js'
import { getHiddenLocations } from './hidden-locations.js'
import { getInteractionsByMap } from './map-interaction.js'

// 탐험 활동 유형
export const EXPLORATION_ACTIVITIES = {
  VISIT: 'visit',                     // 맵 방문
  INTERACT: 'interact',               // 상호작션
  DISCOVER: 'discover',               // 비밀 장소 발견
  COMPLETE_QUEST: 'complete_quest',   // 퀘스트 완료
  SOCIALIZE: 'socialize',             // NPC와 대화
  COLLECT: 'collect',                 // 아이템 수집
  STAY_DURATION: 'stay_duration'      // 특정 시간 머무름
}

// 탐험 레벨 계수
export const EXPLORATION_LEVELS = {
  1: { maxProgress: 100, title: '초보 탐험가' },
  2: { maxProgress: 250, title: '일반 탐험가' },
  3: { maxProgress: 500, title: '숙련된 탐험가' },
  4: { maxProgress: 1000, title: '전문 탐험가' },
  5: { maxProgress: 2000, title: '전설적 탐험가' }
}

// 캐릭터별 탐험 데이터
// { characterId: { mapProgress: { mapId: { progress, activities, completedMilestones } } }, level, totalProgress }
const explorationData = new Map()

/**
 * 캐릭터의 맵 탐험 데이터 조회
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mapId - 맵 ID
 * @returns {Object} 탐험 데이터
 */
export function getMapExploration(characterId, mapId) {
  const data = explorationData.get(characterId)
  if (!data || !data.mapProgress) {
    return null
  }
  return data.mapProgress[mapId] || null
}

/**
 * 캐릭터의 모든 맵 탐험 데이터 조회
 * @param {string} characterId - 캐릭터 ID
 * @returns {Object} 전체 탐험 데이터
 */
export function getExplorationData(characterId) {
  return explorationData.get(characterId) || {
    level: 1,
    totalProgress: 0,
    mapProgress: {},
    achievements: []
  }
}

/**
 * 맵 방문 기록
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mapId - 맵 ID
 * @returns {boolean} 기록 성공 여부
 */
export function recordMapVisit(characterId, mapId) {
  if (!mapExists(mapId)) {
    return false
  }

  const data = getExplorationData(characterId)

  if (!data.mapProgress[mapId]) {
    data.mapProgress[mapId] = {
      mapId,
      progress: 0,
      activities: {},
      completedMilestones: [],
      firstVisitAt: Date.now(),
      lastVisitAt: Date.now(),
      visitCount: 0
    }
  }

  const mapData = data.mapProgress[mapId]
  mapData.visitCount++
  mapData.lastVisitAt = Date.now()

  // 최초 방문 보너스
  if (mapData.visitCount === 1) {
    addProgress(characterId, mapId, EXPLORATION_ACTIVITIES.VISIT, 10)
  } else {
    addProgress(characterId, mapId, EXPLORATION_ACTIVITIES.VISIT, 1)
  }

  explorationData.set(characterId, data)
  return true
}

/**
 * 활동 진행 추가
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mapId - 맵 ID
 * @param {string} activity - 활동 유형
 * @param {number} amount - 진행량
 * @returns {Object} 진행 결과
 */
export function addProgress(characterId, mapId, activity, amount = 1) {
  const data = getExplorationData(characterId)

  if (!data.mapProgress[mapId]) {
    data.mapProgress[mapId] = {
      mapId,
      progress: 0,
      activities: {},
      completedMilestones: [],
      firstVisitAt: Date.now(),
      lastVisitAt: Date.now(),
      visitCount: 0
    }
  }

  const mapData = data.mapProgress[mapId]

  // 활동 카운트 증가
  mapData.activities[activity] = (mapData.activities[activity] || 0) + amount

  // 진행률 계산
  const progressGain = calculateProgressGain(activity, amount)
  mapData.progress += progressGain
  data.totalProgress += progressGain

  // 레벨 업데이트
  const result = updateExplorationLevel(characterId, data)

  // 마일스톤 확인
  const milestones = checkMilestones(mapData)
  mapData.completedMilestones.push(...milestones)

  explorationData.set(characterId, data)

  return {
    progressGain,
    totalProgress: mapData.progress,
    level: data.level,
    milestones: milestones,
    rewards: calculateRewards(milestones)
  }
}

/**
 * 활동에 따른 진행량 계산
 * @param {string} activity - 활동 유형
 * @param {number} amount - 활동량
 * @returns {number} 진행량
 */
function calculateProgressGain(activity, amount) {
  const weights = {
    [EXPLORATION_ACTIVITIES.VISIT]: 5,
    [EXPLORATION_ACTIVITIES.INTERACT]: 1,
    [EXPLORATION_ACTIVITIES.DISCOVER]: 50,
    [EXPLORATION_ACTIVITIES.COMPLETE_QUEST]: 30,
    [EXPLORATION_ACTIVITIES.SOCIALIZE]: 15,
    [EXPLORATION_ACTIVITIES.COLLECT]: 20,
    [EXPLORATION_ACTIVITIES.STAY_DURATION]: 2
  }

  return (weights[activity] || 1) * amount
}

/**
 * 탐험 레벨 업데이트
 * @param {string} characterId - 캐릭터 ID
 * @param {Object} data - 탐험 데이터
 * @returns {Object} 레벨 업데이트 결과
 */
function updateExplorationLevel(characterId, data) {
  const oldLevel = data.level
  let newLevel = oldLevel

  for (const [level, config] of Object.entries(EXPLORATION_LEVELS)) {
    if (data.totalProgress >= config.maxProgress) {
      newLevel = parseInt(level)
    }
  }

  data.level = newLevel

  return {
    oldLevel,
    newLevel,
    leveledUp: newLevel > oldLevel,
    title: EXPLORATION_LEVELS[newLevel].title
  }
}

/**
 * 마일스톤 확인
 * @param {Object} mapData - 맵 탐험 데이터
 * @returns {Array} 완료된 마일스톤 배열
 */
function checkMilestones(mapData) {
  const milestones = []

  // 방문 횟수 마일스톤
  if (mapData.visitCount >= 1 && !mapData.completedMilestones.includes('first_visit')) {
    milestones.push('first_visit')
  }
  if (mapData.visitCount >= 10 && !mapData.completedMilestones.includes('visits_10')) {
    milestones.push('visits_10')
  }
  if (mapData.visitCount >= 50 && !mapData.completedMilestones.includes('visits_50')) {
    milestones.push('visits_50')
  }

  // 상호작션 마일스톤
  const interactions = mapData.activities[EXPLORATION_ACTIVITIES.INTERACT] || 0
  if (interactions >= 10 && !mapData.completedMilestones.includes('interactions_10')) {
    milestones.push('interactions_10')
  }
  if (interactions >= 50 && !mapData.completedMilestones.includes('interactions_50')) {
    milestones.push('interactions_50')
  }

  // 진행률 마일스톤
  if (mapData.progress >= 50 && !mapData.completedMilestones.includes('progress_50')) {
    milestones.push('progress_50')
  }
  if (mapData.progress >= 100 && !mapData.completedMilestones.includes('progress_100')) {
    milestones.push('progress_100')
  }

  return milestones
}

/**
 * 마일스톤 리워드 계산
 * @param {Array} milestones - 마일스톤 배열
 * @returns {Array} 리워드 배열
 */
function calculateRewards(milestones) {
  const rewards = []

  milestones.forEach(milestone => {
    switch (milestone) {
      case 'first_visit':
        rewards.push({ type: 'experience', amount: 10 })
        rewards.push({ type: 'coin', amount: 50 })
        break
      case 'visits_10':
        rewards.push({ type: 'experience', amount: 50 })
        break
      case 'visits_50':
        rewards.push({ type: 'experience', amount: 100 })
        rewards.push({ type: 'title', titleId: 'frequent_visitor' })
        break
      case 'interactions_10':
        rewards.push({ type: 'experience', amount: 30 })
        break
      case 'interactions_50':
        rewards.push({ type: 'experience', amount: 100 })
        break
      case 'progress_50':
        rewards.push({ type: 'experience', amount: 25 })
        break
      case 'progress_100':
        rewards.push({ type: 'experience', amount: 50 })
        rewards.push({ type: 'coin', amount: 200 })
        break
    }
  })

  return rewards
}

/**
 * 맵 완료율 계산
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mapId - 맵 ID
 * @returns {number} 완료율 (0~100)
 */
export function getMapCompletion(characterId, mapId) {
  const mapData = getMapExploration(characterId, mapId)
  if (!mapData) {
    return 0
  }

  const allMaps = getAllMaps()
  const mapTargetProgress = 100 // 기본 타겟

  return Math.min(100, (mapData.progress / mapTargetProgress) * 100).toFixed(2)
}

/**
 * 전체 탐험 완료율 계산
 * @param {string} characterId - 캐릭터 ID
 * @returns {Object} 완료율 데이터
 */
export function getOverallCompletion(characterId) {
  const data = getExplorationData(characterId)
  const allMaps = getAllMaps()

  let totalCompletion = 0
  const mapCompletions = {}

  allMaps.forEach(map => {
    const completion = getMapCompletion(characterId, map.id)
    mapCompletions[map.id] = parseFloat(completion)
    totalCompletion += parseFloat(completion)
  })

  return {
    averageCompletion: (totalCompletion / allMaps.length).toFixed(2),
    mapCompletions,
    totalProgress: data.totalProgress,
    level: data.level
  }
}

/**
 * 탐험 통계 조회
 * @param {string} characterId - 캐릭터 ID
 * @returns {Object} 통계
 */
export function getExplorationStats(characterId) {
  const data = getExplorationData(characterId)
  const allMaps = getAllMaps()

  const stats = {
    totalProgress: data.totalProgress,
    level: data.level,
    levelTitle: EXPLORATION_LEVELS[data.level]?.title || '알 수 없음',
    mapsVisited: 0,
    totalMaps: allMaps.length,
    activities: {},
    milestones: 0
  }

  Object.entries(data.mapProgress || {}).forEach(([mapId, mapData]) => {
    stats.mapsVisited++
    Object.entries(mapData.activities || {}).forEach(([activity, count]) => {
      stats.activities[activity] = (stats.activities[activity] || 0) + count
    })
    stats.milestones += mapData.completedMilestones?.length || 0
  })

  return stats
}

/**
 * 순위 조회
 * @param {number} limit - 결과 제한
 * @returns {Array} 랭킹 배열
 */
export function getExplorationRankings(limit = 10) {
  const rankings = []

  explorationData.forEach((data, characterId) => {
    rankings.push({
      characterId,
      totalProgress: data.totalProgress,
      level: data.level,
      mapsVisited: Object.keys(data.mapProgress || {}).length
    })
  })

  return rankings
    .sort((a, b) => b.totalProgress - a.totalProgress || b.level - a.level)
    .slice(0, limit)
}

/**
 * 탐험 데이터 내보내기 (Redis 영속화용)
 * @returns {Object} 모든 탐험 데이터
 */
export function exportExplorationData() {
  const data = {}
  explorationData.forEach((value, key) => {
    data[key] = value
  })
  return data
}

/**
 * 탐험 데이터 불러오기 (Redis 영속화용)
 * @param {Object} data - 불러올 데이터
 */
export function importExplorationData(data) {
  Object.entries(data).forEach(([characterId, value]) => {
    explorationData.set(characterId, value)
  })
}

// 시스템 통계
export function getSystemStats() {
  let totalProgress = 0
  let totalCharacters = 0

  explorationData.forEach((data) => {
    totalProgress += data.totalProgress
    totalCharacters++
  })

  return {
    totalCharacters,
    totalProgress,
    averageProgressPerCharacter: totalCharacters > 0 ? (totalProgress / totalCharacters).toFixed(2) : 0
  }
}