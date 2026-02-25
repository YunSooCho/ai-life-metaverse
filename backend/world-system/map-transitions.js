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

// 전환 시스템 메모리 저장소
let currentMaps = new Map()  // 캐릭터별 현재 맵
let transitionHistory = []   // 전환 기록

/**
 * 전환 기록 초기화
 */
export function clearTransitionHistory() {
  transitionHistory = []
  currentMaps = new Map()
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
 * @param {Object} customConfig - 커스텀 전환 설정 (선택)
 * @returns {Object|null} 전환 설정
 */
export function getTransitionConfig(fromMapId, toMapId, customConfig = {}) {
  if (!canTransition(fromMapId, toMapId)) {
    return null
  }

  const connection = MAP_CONNECTIONS[fromMapId]
  const fromMap = getMap(fromMapId)
  const toMap = getMap(toMapId)

  return {
    fromMapId,
    toMapId,
    fromMapName: fromMap?.name || connection.name,
    toMapName: toMap?.name || toMapId,
    type: customConfig.type || connection.defaultTransition.type,
    direction: customConfig.direction || connection.defaultTransition.direction || TRANSITION_DIRECTIONS.CENTER,
    duration: customConfig.duration || connection.defaultTransition.duration
  }
}

// 호환성을 위한 별칭
export const getTransition = getTransitionConfig

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
  if (toMap?.weather) {
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
 * 말 전환 수행 (데이터베이스/상태 업데이트)
 * @param {string} characterId - 캐릭터 ID
 * @param {string} fromMapId - 출발 맵 ID
 * @param {string} toMapId - 도착 맵 ID
 * @returns {Object} 전환 결과
 */
export function performTransition(characterId, fromMapId, toMapId) {
  if (!canTransition(fromMapId, toMapId)) {
    return {
      success: false,
      error: 'Cannot transition between these maps'
    }
  }

  const config = getTransitionConfig(fromMapId, toMapId)
  const timestamp = Date.now()

  const transitionRecord = {
    characterId,
    timestamp,
    fromMap: fromMapId,  // fromMapId 대신 fromMap 사용
    toMap: toMapId,      // toMapId 대신 toMap 사용
    fromMapId,
    toMapId,
    config,
    duration: config.duration,
    status: 'completed',
    distance: calculateMapDistance(fromMapId, toMapId),
    specialEffects: getSpecialTransitionEffects(fromMapId, toMapId)
  }

  transitionHistory.push(transitionRecord)
  currentMaps.set(characterId, toMapId)

  return {
    success: true,
    ...transitionRecord
  }
}

/**
 * 캐릭터 맵 이동 (간편 API)
 * @param {string} characterId - 캐릭터 ID
 * @param {string} toMapId - 목표 맵 ID
 * @returns {Object} 전환 결과
 */
export function transitionToMap(characterId, toMapId) {
  const currentMap = currentMaps.get(characterId) || null

  // 첫 번째 전환은 'default'로 간주
  const fromMapId = currentMap || 'default'

  if (currentMap && !canTransition(currentMap, toMapId)) {
    return {
      success: false,
      error: 'Cannot transition to this map'
    }
  }

  // 첫 번째 전환이면 default → toMap, 그렇지 않으면 currentMap → toMap
  const actualFromMapId = currentMap ? currentMap : 'default'

  if (!canTransition(actualFromMapId, toMapId)) {
    return {
      success: false,
      error: 'Cannot transition to this map'
    }
  }

  const timestamp = Date.now()
  const config = getTransitionConfig(actualFromMapId, toMapId)

  const transitionRecord = {
    characterId,
    timestamp,
    fromMap: actualFromMapId,
    toMap: toMapId,
    config  // config 추가
  }

  transitionHistory.push(transitionRecord)
  currentMaps.set(characterId, toMapId)

  return {
    success: true,
    timestamp,
    fromMap: currentMap || null,
    toMap: toMapId,
    currentMap: toMapId
  }
}

/**
 * 전환 기록 조회
 * @param {string} characterId - 캐릭터 ID (선택)
 * @returns {Array} 전환 기록 배열
 */
export function getTransitionHistory(characterId) {
  if (characterId) {
    return transitionHistory.filter(
      record => record.characterId === characterId
    )
  }
  return [...transitionHistory]
}

/**
 * 전환 데이터 내보내기
 * @returns {Object} 전환 데이터
 */
export function exportTransitionData() {
  const currentMapsObj = {}
  currentMaps.forEach((value, key) => {
    currentMapsObj[key] = value
  })

  return {
    currentMaps: currentMapsObj,
    histories: [...transitionHistory],
    exportTime: Date.now()
  }
}

/**
 * 전환 데이터 불러오기
 * @param {Object} data - 불러올 데이터
 * @returns {boolean} 성공 여부
 */
export function importTransitionData(data) {
  if (data && (data.currentMaps || data.histories)) {
    if (data.currentMaps) {
      currentMaps = new Map(Object.entries(data.currentMaps))
    }
    if (data.histories) {
      transitionHistory = [...data.histories]
    }
    return true
  }
  clearTransitionHistory()
  return false
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
      const transition = getTransitionConfig(startMapId, nextMapId)
      if (transition) {
        paths.push({
          toMapId: nextMapId,
          transition
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
    const transition = getTransitionConfig(path[i], path[i + 1])
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
  const config = getTransitionConfig(fromMapId, toMapId)

  if (!config) {
    return null
  }

  return {
    characterId,
    fromMapId,
    toMapId,
    transition: {
      type: config.type,
      direction: config.direction,
      duration: config.duration
    },
    startTime,
    estimatedEndTime: startTime + config.duration,
    status: 'started',
    metadata: {
      distance: calculateMapDistance(fromMapId, toMapId),
      travelTime: config.duration,
      specialEffects: getSpecialTransitionEffects(fromMapId, toMapId)
    }
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

export { getMap, mapExists, getAllMaps }