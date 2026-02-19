/**
 * 맵 전환 시스템
 * 맵 간 전환 애니메이션 및 전이 로직 관리
 */

import { getMap, mapExists, getAllMaps } from './maps.js'

// 전환 유형
export const TRANSITION_TYPES = {
  FADE: 'fade',              // 페이드 인/아웃
  SLIDE: 'slide',            // 슬라이드 (좌/우/상/하)
  ZOOM: 'zoom',              // 줌 인/아웃
  WIPE: 'wipe',              // 와이프 효과
  DISSOLVE: 'dissolve',      // 디졸브
  CIRCLE: 'circle',          // 원형 확장/축소
  BLUR: 'blur'               // 블러 전환
}

// 전환 방향
export const TRANSITION_DIRECTIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down',
  CENTER: 'center'
}

// 맵 간 연결 관계 (어디서 어디로 이동 가능한지)
export const MAP_CONNECTIONS = {
  default: {
    name: '메인 광장',
    nextMaps: ['beach', 'forest', 'mountain'],
    defaultTransition: { type: TRANSITION_TYPES.FADE, duration: 1000 }
  },
  beach: {
    name: '해변',
    nextMaps: ['default'],
    defaultTransition: { type: TRANSITION_TYPES.SLIDE, direction: TRANSITION_DIRECTIONS.RIGHT, duration: 1200 }
  },
  forest: {
    name: '숲',
    nextMaps: ['default', 'mountain'],
    defaultTransition: { type: TRANSITION_TYPES.ZOOM, direction: TRANSITION_DIRECTIONS.CENTER, duration: 1500 }
  },
  mountain: {
    name: '산맥',
    nextMaps: ['default', 'forest'],
    defaultTransition: { type: TRANSITION_TYPES.FADE, direction: TRANSITION_DIRECTIONS.UP, duration: 1300 }
  }
}

/**
 * 맵 전환 가능 여부 확인
 * @param {string} fromMapId - 출발 맵 ID
 * @param {string} toMapId - 도착 맵 ID
 * @returns {boolean} 전환 가능 여부
 */
export function canTransition(fromMapId, toMapId) {
  if (!mapExists(fromMapId) || !mapExists(toMapId)) {
    return false
  }

  if (fromMapId === toMapId) {
    return false
  }

  const connection = MAP_CONNECTIONS[fromMapId]
  if (!connection || !connection.nextMaps.includes(toMapId)) {
    return false
  }

  return true
}

/**
 * 맵 전환 설정 조회
 * @param {string} fromMapId - 출발 맵 ID
 * @param {string} toMapId - 도착 맵 ID
 * @returns {Object|null} 전환 설정
 */
export function getTransition(fromMapId, toMapId) {
  if (!canTransition(fromMapId, toMapId)) {
    return null
  }

  const connection = MAP_CONNECTIONS[fromMapId]
  const fromMap = getMap(fromMapId)
  const toMap = getMap(toMapId)

  return {
    fromMap: {
      id: fromMapId,
      name: fromMap.name,
      width: fromMap.width,
      height: fromMap.height
    },
    toMap: {
      id: toMapId,
      name: toMap.name,
      width: toMap.width,
      height: toMap.height
    },
    transition: {
      type: connection.defaultTransition.type,
      direction: connection.defaultTransition.direction || TRANSITION_DIRECTIONS.CENTER,
      duration: connection.defaultTransition.duration
    },
    metadata: {
      distance: calculateMapDistance(fromMapId, toMapId),
      travelTime: connection.defaultTransition.duration,
      specialEffects: getSpecialTransitionEffects(fromMapId, toMapId)
    }
  }
}

/**
 * 맵 간 거리 계산 (단순화된 거리)
 * @param {string} mapId1 - 맵 ID 1
 * @param {string} mapId2 - 맵 ID 2
 * @returns {number} 거리
 */
function calculateMapDistance(mapId1, mapId2) {
  const connection = MAP_CONNECTIONS[mapId1]
  if (connection && connection.nextMaps.includes(mapId2)) {
    return 1 // 직접 연결된 맵
  }
  return 2 // 환승 필요
}

/**
 * 특별 전환 효과 조회
 * @param {string} fromMapId - 출발 맵 ID
 * @param {string} toMapId - 도착 맵 ID
 * @returns {Array} 특별 효과 배열
 */
function getSpecialTransitionEffects(fromMapId, toMapId) {
  const effects = []

  // 계절/날씨 기반 효과
  const toMap = getMap(toMapId)
  if (toMap.weather) {
    if (toMap.weather.type === 'snowy') {
      effects.push('snow_fade')
    } else if (toMap.weather.type === 'sunny') {
      effects.push('sunshine_glow')
    } else if (toMap.weather.type === 'rainy') {
      effects.push('rain_wipe')
    }
  }

  return effects
}

/**
 * 모든 가능한 전환 경로 조회
 * @param {string} startMapId - 시작 맵 ID
 * @returns {Array} 전환 경로 배열
 */
export function getAllTransitionPaths(startMapId) {
  if (!mapExists(startMapId)) {
    return []
  }

  const paths = []

  const connection = MAP_CONNECTIONS[startMapId]
  if (connection && connection.nextMaps) {
    connection.nextMaps.forEach(nextMapId => {
      const transition = getTransition(startMapId, nextMapId)
      if (transition) {
        paths.push({
          toMapId: nextMapId,
          transition: transition
        })
      }
    })
  }

  return paths
}

/**
 * 최단 경로 찾기 (BFS)
 * @param {string} fromMapId - 출발 맵 ID
 * @param {string} toMapId - 도착 맵 ID
 * @returns {Array|null} 최단 경로 맵 ID 배열
 */
export function findShortestPath(fromMapId, toMapId) {
  if (!mapExists(fromMapId) || !mapExists(toMapId)) {
    return null
  }

  if (fromMapId === toMapId) {
    return [fromMapId]
  }

  const visited = new Set()
  const queue = [[fromMapId]]

  while (queue.length > 0) {
    const path = queue.shift()
    const currentMapId = path[path.length - 1]

    if (visited.has(currentMapId)) {
      continue
    }

    visited.add(currentMapId)

    const connection = MAP_CONNECTIONS[currentMapId]
    if (connection && connection.nextMaps) {
      for (const nextMapId of connection.nextMaps) {
        if (nextMapId === toMapId) {
          return [...path, nextMapId]
        }

        if (!visited.has(nextMapId)) {
          queue.push([...path, nextMapId])
        }
      }
    }
  }

  return null
}

/**
 * 경로 전체 전환 효과 계산
 * @param {Array} path - 맵 ID 경로
 * @returns {Array} 전환 효과 배열
 */
export function calculatePathTransitions(path) {
  if (!path || path.length < 2) {
    return []
  }

  const transitions = []

  for (let i = 0; i < path.length - 1; i++) {
    const transition = getTransition(path[i], path[i + 1])
    if (transition) {
      transitions.push(transition)
    }
  }

  return transitions
}

/**
 * 말 전환 이벤트 생성
 * @param {string} characterId - 캐릭터 ID
 * @param {string} fromMapId - 출발 맵 ID
 * @param {string} toMapId - 도착 맵 ID
 * @returns {Object} 전환 이벤트 데이터
 */
export function createTransitionEvent(characterId, fromMapId, toMapId) {
  const startTime = Date.now()
  const transition = getTransition(fromMapId, toMapId)

  if (!transition) {
    return null
  }

  return {
    characterId,
    fromMapId,
    toMapId,
    transition: transition.transition,
    startTime,
    estimatedEndTime: startTime + transition.transition.duration,
    status: 'started',
    metadata: transition.metadata
  }
}

/**
 * 전환 완료 여부 확인
 * @param {Object} transitionEvent - 전환 이벤트
 * @returns {boolean} 완료 여부
 */
export function isTransitionComplete(transitionEvent) {
  if (!transitionEvent) {
    return false
  }
  return Date.now() >= transitionEvent.estimatedEndTime
}

export { getMap, mapExists, getAllMaps, MAP_CONNECTIONS }