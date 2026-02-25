/**
 * 맵 상호작용 시스템
 * 클릭, 호버, 드래그 등 맵 내 상호작용 관리
 */

import { MAPS } from './maps.js'

// 상호작용 유형
export const INTERACTION_TYPES = {
  CLICK: 'click',
  HOVER: 'hover',
  DRAG: 'drag',
  DOUBLE_CLICK: 'double_click',
  RIGHT_CLICK: 'right_click'
}

// 상호작션 데이터 저장
// { characterId: { interactions: [] } }
const interactionStore = new Map()

/**
 * 상호작션 기록 저장
 * @param {string} characterId - 캐릭터 ID
 * @param {Object} interaction - 상호작션 데이터
 * @returns {boolean} 저장 성공 여부
 */
export function recordInteraction(characterId, interaction) {
  const data = interactionStore.get(characterId) || { interactions: [] }

  const interactionRecord = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: interaction.type || INTERACTION_TYPES.CLICK,
    mapId: interaction.mapId || 'default',
    x: interaction.x || 0,
    y: interaction.y || 0,
    target: interaction.target || null, // 건물, NPC, 오브젝트 등
    timestamp: Date.now(),
    metadata: interaction.metadata || {}
  }

  data.interactions.push(interactionRecord)
  interactionStore.set(characterId, data)

  return true
}

/**
 * 캐릭터의 모든 상호작션 기록 조회
 * @param {string} characterId - 캐릭터 ID
 * @returns {Array} 상호작션 기록 배열
 */
export function getInteractions(characterId) {
  const data = interactionStore.get(characterId)
  return data ? data.interactions : []
}

/**
 * 특정 맵에서의 상호작션 기록 조회
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mapId - 맵 ID
 * @returns {Array} 상호작션 기록 배열
 */
export function getInteractionsByMap(characterId, mapId) {
  const interactions = getInteractions(characterId)
  return interactions.filter(i => i.mapId === mapId)
}

/**
 * 특정 타입의 상호작션 기록 조회
 * @param {string} characterId - 캐릭터 ID
 * @param {string} type - 상호작션 유형
 * @returns {Array} 상호작션 기록 배열
 */
export function getInteractionsByType(characterId, type) {
  const interactions = getInteractions(characterId)
  return interactions.filter(i => i.type === type)
}

/**
 * 특정 건물/NPC에 대한 상호작션 기록 조회
 * @param {string} characterId - 캐릭터 ID
 * @param {string} targetId - 타겟 ID
 * @returns {Array} 상호작션 기록 배열
 */
export function getInteractionsByTarget(characterId, targetId) {
  const interactions = getInteractions(characterId)
  return interactions.filter(i => i.target && i.target.id === targetId)
}

/**
 * 캐릭터의 상호작션 통계
 * @param {string} characterId - 캐릭터 ID
 * @returns {Object} 상호작션 통계
 */
export function getInteractionStats(characterId) {
  const interactions = getInteractions(characterId)

  const stats = {
    total: interactions.length,
    byType: {},
    byMap: {},
    byTarget: {},
    lastInteraction: null
  }

  interactions.forEach(i => {
    // 타입별 통계
    stats.byType[i.type] = (stats.byType[i.type] || 0) + 1

    // 맵별 통계
    stats.byMap[i.mapId] = (stats.byMap[i.mapId] || 0) + 1

    // 타겟별 통계
    if (i.target && i.target.id) {
      stats.byTarget[i.target.id] = (stats.byTarget[i.target.id] || 0) + 1
    }
  })

  // 마지막 상호작션
  if (interactions.length > 0) {
    stats.lastInteraction = interactions[interactions.length - 1]
  }

  return stats
}

/**
 * 가장 자주 상호작션한 타겟 조회
 * @param {string} characterId - 캐릭터 ID
 * @param {number} limit - 결과 제한
 * @returns {Array} [{ targetId, count, target }]
 */
export function getMostInteractedTargets(characterId, limit = 5) {
  const stats = getInteractionStats(characterId)
  const sortedTargets = Object.entries(stats.byTarget)
    .map(([targetId, count]) => ({ targetId, count }))
    .sort((a, b) => b.count - a.count)

  return sortedTargets.slice(0, limit)
}

/**
 * 특정 영역 내 상호작션 기록 조회
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mapId - 맵 ID
 * @param {number} x - 영역 시작 X
 * @param {number} y - 영역 시작 Y
 * @param {number} width - 영역 너비
 * @param {number} height - 영역 높이
 * @returns {Array} 상호작션 기록 배열
 */
export function getInteractionsInArea(characterId, mapId, x, y, width, height) {
  const interactions = getInteractionsByMap(characterId, mapId)
  return interactions.filter(i => {
    return i.x >= x && i.x <= x + width && i.y >= y && i.y <= y + height
  })
}

/**
 * 상호작션 기록 삭제
 * @param {string} characterId - 캐릭터 ID
 * @param {string} interactionId - 상호작션 ID
 * @returns {boolean} 삭제 성공 여부
 */
export function deleteInteraction(characterId, interactionId) {
  const data = interactionStore.get(characterId)
  if (!data) return false

  const beforeLength = data.interactions.length
  data.interactions = data.interactions.filter(i => i.id !== interactionId)

  if (data.interactions.length < beforeLength) {
    interactionStore.set(characterId, data)
    return true
  }

  return false
}

/**
 * 캐릭터의 모든 상호작션 기록 삭제
 * @param {string} characterId - 캐릭터 ID
 * @returns {boolean} 삭제 성공 여부
 */
export function clearInteractions(characterId) {
  interactionStore.delete(characterId)
  return true
}

/**
 * 특정 맵의 핫스팟 상위 조회 (자주 클릭된 영역)
 * @param {string} mapId - 맵 ID
 * @returns {Array} 핫스팟 배열
 */
export function getMapHotspots(mapId, gridSize = 50) {
  const hotspots = {}

  interactionStore.forEach((data, characterId) => {
    data.interactions.forEach(i => {
      if (i.mapId !== mapId) return

      const gridX = Math.floor(i.x / gridSize) * gridSize
      const gridY = Math.floor(i.y / gridSize) * gridSize
      const key = `${gridX},${gridY}`

      if (!hotspots[key]) {
        hotspots[key] = { x: gridX, y: gridY, count: 0, interactions: [] }
      }

      hotspots[key].count++
      hotspots[key].interactions.push(i)
    })
  })

  return Object.values(hotspots)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

/**
 * 캐릭터 상호작션 데이터 내보내기 (Redis 영속화용)
 * @returns {Object} 모든 캐릭터 상호작션 데이터
 */
export function exportInteractionData() {
  const data = {}
  interactionStore.forEach((value, key) => {
    data[key] = value
  })
  return data
}

/**
 * 캐릭터 상호작션 데이터 불러오기 (Redis 영속화용)
 * @param {Object} data - 불러올 데이터
 */
export function importInteractionData(data) {
  Object.entries(data).forEach(([characterId, value]) => {
    interactionStore.set(characterId, value)
  })
}

// 시스템 통계
export function getSystemStats() {
  let totalInteractions = 0
  interactionStore.forEach((data) => {
    totalInteractions += data.interactions.length
  })

  return {
    totalInteractions,
    totalCharacters: interactionStore.size,
    averageInteractionsPerCharacter: interactionStore.size > 0
      ? (totalInteractions / interactionStore.size).toFixed(2)
      : 0
  }
}